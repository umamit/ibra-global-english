import crypto from "crypto";
import { getAdminSupabase } from "@/app/api/_middleware";
import { createClient } from "@/utils/supabase/server";

const supabaseAdmin = getAdminSupabase();

export const GATEWAY_ADMIN_FEE = 5000;

function escapeLikePattern(input: string): string {
  return input.replace(/[%_\\]/g, "\\$&");
}

function safeCompareStrings(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

async function ensureNotAlreadyPaid(studentId: string, month: string) {
  const { data: existingPayment } = await supabaseAdmin
    .from("tuition_payments")
    .select("status")
    .eq("student_id", studentId)
    .eq("month", month)
    .maybeSingle();

  if (existingPayment?.status === "lunas") {
    throw new Error(`Tagihan SPP siswa untuk periode ${month} sudah tercatat LUNAS.`);
  }
}

function buildCompactOrderId(studentId: string, month: string): string {
  const cleanUuid = studentId.replace(/-/g, "");
  const cleanMonth = month.replace(/-/g, "");
  const ts = Date.now().toString(36);
  return `S_${cleanUuid}_${cleanMonth}_${ts}`;
}

export async function resolveOrCreatePublicStudent(data: {
  student_name: string;
  parent_name: string;
  whatsapp: string;
  program: string;
}): Promise<{ id: string; name: string; program: string }> {
  const cleanName = escapeLikePattern(data.student_name.trim());
  if (!cleanName || cleanName.length < 2) {
    throw new Error("Nama lengkap siswa tidak valid.");
  }

  const { data: matchedStudents } = await supabaseAdmin
    .from("students")
    .select("id, name, program")
    .ilike("name", cleanName)
    .limit(10);

  const norm = data.student_name.trim().toLowerCase();
  const baseProgram = data.program.split("(")[0].trim().toLowerCase();
  const list = matchedStudents || [];
  const existing =
    list.find((s) => s.name.trim().toLowerCase() === norm && (s.program || "").toLowerCase().includes(baseProgram)) ||
    list.find((s) => s.name.trim().toLowerCase() === norm);

  if (existing) return existing;

  const { data: created, error: createErr } = await supabaseAdmin
    .from("students")
    .insert([{ name: data.student_name.trim(), program: data.program, parent_name: data.parent_name.trim(), parent_phone: data.whatsapp.trim(), status: "active" }])
    .select("id, name, program")
    .single();

  if (createErr || !created) throw new Error(createErr?.message || "Gagal mendaftarkan data siswa baru untuk pembayaran.");
  return created;
}

export async function processCreateInvoice(student_id: string, month: string, gateway: "midtrans" | "xendit") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesi tidak valid. Silakan login kembali.");

  const { data: student, error: errS } = await supabaseAdmin
    .from("students")
    .select("id, name, program, parent_id, parent_phone")
    .eq("id", student_id)
    .single();
  if (errS || !student) throw new Error("Data siswa tidak ditemukan.");

  const { data: profile } = await supabaseAdmin.from("profiles").select("role, phone").eq("id", user.id).single();
  if (student.parent_id !== user.id && profile?.role !== "admin") {
    throw new Error("Anda tidak memiliki akses untuk membayar tagihan siswa ini.");
  }

  await ensureNotAlreadyPaid(student.id, month);

  const { baseAmount, feeAmount } = await getProgramSppWithFee(student.program);
  const orderId = buildCompactOrderId(student.id, month);
  const email = user.email || "parent@ibraglobalenglish.uk";
  const phone = student.parent_phone || profile?.phone || "";

  if (gateway === "midtrans") {
    return createMidtransTransaction(orderId, baseAmount, feeAmount, student.name, student.program, month, email, "https://www.ibraglobalenglish.uk/parent", phone);
  }
  return createXenditInvoice(orderId, baseAmount, feeAmount, student.name, student.program, month, email, "https://www.ibraglobalenglish.uk/parent", phone);
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
  const student = await resolveOrCreatePublicStudent({
    student_name: data.student_name,
    parent_name: data.parent_name,
    whatsapp: data.whatsapp,
    program: data.program,
  });

  await ensureNotAlreadyPaid(student.id, data.month);

  const effectiveProgram = student.program || data.program;
  const { baseAmount, feeAmount } = await getProgramSppWithFee(effectiveProgram);
  const orderId = buildCompactOrderId(student.id, data.month);

  if (data.gateway === "midtrans") {
    return createMidtransTransaction(orderId, baseAmount, feeAmount, student.name, effectiveProgram, data.month, data.email, "https://www.ibraglobalenglish.uk/checkout?status=success", data.whatsapp);
  }
  return createXenditInvoice(orderId, baseAmount, feeAmount, student.name, effectiveProgram, data.month, data.email, "https://www.ibraglobalenglish.uk/checkout?status=success", data.whatsapp);
}

export async function getProgramSppWithFee(program: string): Promise<{ baseAmount: number; feeAmount: number; totalAmount: number }> {
  const { data } = await supabaseAdmin.from("landing_settings").select("key, value");
  const map: Record<string, string> = {};
  (data || []).forEach((r: { key: string; value: string }) => { map[r.key] = r.value; });
  const p = (program || "").toLowerCase();
  let baseAmount = parseInt(map.payment_spp_kids || "300000", 10) || 300000;
  if (p.includes("calistung")) baseAmount = parseInt(map.payment_spp_calistung || "350000", 10) || 350000;
  else if (p.includes("matematika")) baseAmount = parseInt(map.payment_spp_math || map.payment_spp_kids || "300000", 10) || 300000;
  else if (p.includes("teens")) baseAmount = parseInt(map.payment_spp_teens || "300000", 10) || 300000;

  const feeAmount = parseInt(map.payment_gateway_fee || String(GATEWAY_ADMIN_FEE), 10);
  const validFee = isNaN(feeAmount) || feeAmount < 0 ? GATEWAY_ADMIN_FEE : feeAmount;
  return { baseAmount, feeAmount: validFee, totalAmount: baseAmount + validFee };
}

export async function createMidtransTransaction(
  orderId: string,
  baseAmount: number,
  feeAmount: number,
  studentName: string,
  program: string,
  month: string,
  email: string,
  finishUrl = "https://www.ibraglobalenglish.uk/checkout?status=success",
  phone = ""
) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY belum dikonfigurasi di server.");
  const isProd = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const endpoint = isProd ? "https://app.midtrans.com/snap/v1/transactions" : "https://app.sandbox.midtrans.com/snap/v1/transactions";
  const authHeader = "Basic " + Buffer.from(`${serverKey}:`).toString("base64");
  const totalAmount = baseAmount + feeAmount;
  const items = [{ id: `SPP-${month}`, price: baseAmount, quantity: 1, name: `SPP ${program} (${month})`.slice(0, 50) }];
  if (feeAmount > 0) items.push({ id: "ADMIN-FEE", price: feeAmount, quantity: 1, name: "Biaya Layanan Payment Gateway" });

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: authHeader },
    body: JSON.stringify({
      transaction_details: { order_id: orderId.slice(0, 50), gross_amount: totalAmount },
      item_details: items,
      customer_details: {
        first_name: studentName.slice(0, 50),
        email: email || "parent@ibraglobalenglish.uk",
        ...(phone ? { phone: phone.slice(0, 20) } : {}),
      },
      callbacks: { finish: finishUrl },
      shopeepay: { callback_url: finishUrl },
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error_messages?.join(", ") || "Gagal membuat transaksi Midtrans.");
  return { gateway: "midtrans", token: json.token, redirect_url: json.redirect_url, order_id: orderId };
}

function formatIdPhone(raw: string): string {
  const digits = String(raw || "").replace(/[^0-9]/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `+62${digits.slice(1)}`;
  if (digits.startsWith("62")) return `+${digits}`;
  return `+62${digits}`;
}

export async function createXenditInvoice(externalId: string, baseAmount: number, feeAmount: number, studentName: string, program: string, month: string, email: string, redirectUrl?: string, phone = "") {
  const secretKey = process.env.XENDIT_SECRET_KEY;
  if (!secretKey) throw new Error("XENDIT_SECRET_KEY belum dikonfigurasi di server.");
  const authHeader = "Basic " + Buffer.from(`${secretKey}:`).toString("base64");
  const totalAmount = baseAmount + feeAmount;
  const fees = feeAmount > 0 ? [{ type: "Biaya Layanan Transaksi Otomatis", value: feeAmount }] : undefined;
  const items = [{ name: `SPP ${program} (${month})`, quantity: 1, price: baseAmount, category: "Education" }];
  if (feeAmount > 0) items.push({ name: "Biaya Layanan Transaksi Otomatis", quantity: 1, price: feeAmount, category: "Service Fee" });
  const mobile = formatIdPhone(phone);
  const targetUrl = redirectUrl || "https://www.ibraglobalenglish.uk/parent";
  const failUrl = targetUrl.includes("/checkout") ? "https://www.ibraglobalenglish.uk/checkout" : targetUrl;

  const res = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify({
      external_id: externalId,
      amount: totalAmount,
      fees,
      items,
      customer: {
        given_names: studentName.slice(0, 50) || "Siswa IGE",
        email: email || "parent@ibraglobalenglish.uk",
        ...(mobile ? { mobile_number: mobile } : {}),
      },
      description: `Pembayaran SPP ${program} - ${studentName} (Bulan ${month})`,
      payer_email: email || "parent@ibraglobalenglish.uk",
      currency: "IDR",
      success_redirect_url: targetUrl,
      failure_redirect_url: failUrl,
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
  return safeCompareStrings(expected, signatureKey);
}

export function verifyXenditCallbackToken(callbackToken: string): boolean {
  const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN || "";
  return safeCompareStrings(expectedToken, callbackToken);
}

export function parseOrderMetadata(orderId: string): { studentId: string; month: string } | null {
  const raw = String(orderId || "");
  if (raw.startsWith("S_")) {
    const parts = raw.split("_");
    if (parts.length >= 3 && parts[1].length === 32 && parts[2].length === 6) {
      const h = parts[1];
      const studentId = `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
      const month = `${parts[2].slice(0, 4)}-${parts[2].slice(4, 6)}`;
      return { studentId, month };
    }
  }
  const legacyParts = raw.split("|");
  if (legacyParts.length >= 3 && legacyParts[0] === "SPP") {
    return { studentId: legacyParts[1], month: legacyParts[2] };
  }
  return null;
}

export async function markSppAsPaid(orderId: string, grossAmount: number, gatewayLabel: string) {
  const meta = parseOrderMetadata(orderId);
  if (!meta) return;
  const { data: student } = await supabaseAdmin.from("students").select("program").eq("id", meta.studentId).maybeSingle();
  const netSpp = student?.program ? (await getProgramSppWithFee(student.program)).baseAmount : grossAmount;
  if (!isNaN(grossAmount) && grossAmount > 0 && grossAmount < netSpp) {
    throw new Error(`Nominal pembayaran (${grossAmount}) kurang dari tagihan SPP (${netSpp}).`);
  }
  const { error } = await supabaseAdmin.from("tuition_payments").upsert(
    {
      student_id: meta.studentId,
      month: meta.month,
      amount: netSpp,
      status: "lunas",
      payment_method: gatewayLabel,
      payment_date: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id,month" }
  );
  if (error) throw new Error(error.message);
}
