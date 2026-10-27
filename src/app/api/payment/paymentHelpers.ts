import crypto from "crypto";
import { getAdminSupabase } from "@/app/api/_middleware";
import { createClient } from "@/utils/supabase/server";

const supabaseAdmin = getAdminSupabase();

export async function processCreateInvoice(student_id: string, month: string, gateway: "midtrans" | "xendit") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesi tidak valid. Silakan login kembali.");

  const { data: student, error: errS } = await supabaseAdmin
    .from("students")
    .select("id, name, program, parent_id")
    .eq("id", student_id)
    .single();
  if (errS || !student) throw new Error("Data siswa tidak ditemukan.");

  const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).single();
  if (student.parent_id !== user.id && profile?.role !== "admin") {
    throw new Error("Anda tidak memiliki akses untuk membayar tagihan siswa ini.");
  }

  const amount = await getProgramSppAmount(student.program);
  const orderId = `SPP|${student.id}|${month}|${Date.now()}`;
  const email = user.email || "parent@ibraglobalenglish.uk";

  if (gateway === "midtrans") {
    return createMidtransTransaction(orderId, amount, student.name, student.program, month, email);
  }
  return createXenditInvoice(orderId, amount, student.name, student.program, month, email);
}

export async function processPublicCheckout(data: {
  student_name: string;
  parent_name: string;
  email: string;
  whatsapp: string;
  program: string;
  month: string;
  gateway: "midtrans" | "xendit";
}) {
  const amount = await getProgramSppAmount(data.program);
  const { data: existingStudent } = await supabaseAdmin
    .from("students")
    .select("id")
    .ilike("name", data.student_name.trim())
    .eq("program", data.program)
    .maybeSingle();

  const orderId = existingStudent?.id
    ? `SPP|${existingStudent.id}|${data.month}|${Date.now()}`
    : `PUB|${data.program}|${data.month}|${Date.now()}`;

  if (data.gateway === "midtrans") {
    return createMidtransTransaction(orderId, amount, data.student_name, data.program, data.month, data.email);
  }
  return createXenditInvoice(orderId, amount, data.student_name, data.program, data.month, data.email, "https://www.ibraglobalenglish.uk/checkout?status=success");
}

export async function getProgramSppAmount(program: string): Promise<number> {
  const { data } = await supabaseAdmin.from("landing_settings").select("key, value");
  const map: Record<string, string> = {};
  (data || []).forEach((r: { key: string; value: string }) => { map[r.key] = r.value; });
  const p = (program || "").toLowerCase();
  if (p.includes("calistung")) return parseInt(map.payment_spp_calistung || "350000", 10) || 350000;
  if (p.includes("matematika")) return parseInt(map.payment_spp_math || map.payment_spp_kids || "300000", 10) || 300000;
  if (p.includes("teens")) return parseInt(map.payment_spp_teens || "300000", 10) || 300000;
  return parseInt(map.payment_spp_kids || "300000", 10) || 300000;
}

export async function createMidtransTransaction(orderId: string, amount: number, studentName: string, program: string, month: string, email: string) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY belum dikonfigurasi di server.");
  const isProd = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const endpoint = isProd ? "https://app.midtrans.com/snap/v1/transactions" : "https://app.sandbox.midtrans.com/snap/v1/transactions";
  const authHeader = "Basic " + Buffer.from(`${serverKey}:`).toString("base64");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: authHeader },
    body: JSON.stringify({
      transaction_details: { order_id: orderId, gross_amount: amount },
      item_details: [{ id: `SPP-${month}`, price: amount, quantity: 1, name: `SPP ${program} (${month})`.slice(0, 50) }],
      customer_details: { first_name: studentName.slice(0, 50), email: email || "parent@ibraglobalenglish.uk" },
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error_messages?.join(", ") || "Gagal membuat transaksi Midtrans.");
  return { gateway: "midtrans", token: json.token, redirect_url: json.redirect_url, order_id: orderId };
}

export async function createXenditInvoice(externalId: string, amount: number, studentName: string, program: string, month: string, email: string, redirectUrl?: string) {
  const secretKey = process.env.XENDIT_SECRET_KEY;
  if (!secretKey) throw new Error("XENDIT_SECRET_KEY belum dikonfigurasi di server.");
  const authHeader = "Basic " + Buffer.from(`${secretKey}:`).toString("base64");

  const res = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify({
      external_id: externalId,
      amount,
      description: `Pembayaran SPP ${program} - ${studentName} (Bulan ${month})`,
      payer_email: email || "parent@ibraglobalenglish.uk",
      currency: "IDR",
      success_redirect_url: redirectUrl || "https://www.ibraglobalenglish.uk/parent",
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Gagal membuat invoice Xendit.");
  return { gateway: "xendit", invoice_url: json.invoice_url, redirect_url: json.invoice_url, order_id: externalId };
}

export function verifyMidtransSignature(orderId: string, statusCode: string, grossAmount: string, signatureKey: string): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  if (!serverKey || !signatureKey) return false;
  const expected = crypto.createHash("sha512").update(`${orderId}${statusCode}${grossAmount}${serverKey}`).digest("hex");
  return expected === signatureKey;
}

export function parseOrderMetadata(orderId: string): { studentId: string; month: string } | null {
  // Format: SPP|{student_uuid}|{YYYY-MM}|{timestamp}
  const parts = orderId.split("|");
  if (parts.length < 3 || parts[0] !== "SPP") return null;
  return { studentId: parts[1], month: parts[2] };
}

export async function markSppAsPaid(orderId: string, grossAmount: number, gatewayLabel: string) {
  const meta = parseOrderMetadata(orderId);
  if (!meta) return;
  const { error } = await supabaseAdmin.from("tuition_payments").upsert(
    {
      student_id: meta.studentId,
      month: meta.month,
      amount: grossAmount,
      status: "lunas",
      payment_method: gatewayLabel,
      payment_date: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id,month" }
  );
  if (error) throw new Error(error.message);
}
