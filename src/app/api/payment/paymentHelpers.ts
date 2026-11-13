import crypto from "crypto";
import { getAdminSupabase } from "@/app/api/_middleware";
import { createClient } from "@/utils/supabase/server";
import { createMidtransTransaction, createXenditInvoice, clearCachedSessionByOrderId } from "./gatewaySessionHelpers";
import { sendPaymentReceiptNotification } from "./paymentNotificationHelpers";

export { createMidtransTransaction, createXenditInvoice };

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
  const { data: existingPayment } = await supabaseAdmin.from("tuition_payments").select("status").eq("student_id", studentId).eq("month", month).maybeSingle();
  if (existingPayment?.status === "lunas") throw new Error(`Tagihan SPP siswa untuk periode ${month} sudah tercatat LUNAS.`);
}

function buildCompactOrderId(prefix: "S" | "R", entityId: string, month: string): string {
  return `${prefix}_${entityId.replace(/-/g, "")}_${month.replace(/-/g, "")}_${Date.now().toString(36)}`;
}

export async function resolveOrCreatePublicStudent(data: { student_name: string; parent_name?: string; whatsapp?: string; program: string }): Promise<{ id: string; name: string; program: string; prefix: "S" | "R" }> {
  const rawInput = data.student_name.trim();
  const cleanName = escapeLikePattern(rawInput);
  if (!cleanName || cleanName.length < 2) throw new Error("Nama lengkap atau Kode ID siswa tidak valid.");

  const upperInput = rawInput.toUpperCase().replace(/\s+/g, "");
  const codeMatch = upperInput.match(/^(?:IGE[-_]?)?([0-9A-F]{6,32})$/);
  if (codeMatch) {
    const hexPrefix = codeMatch[1].toLowerCase();
    const minUuid = `${hexPrefix}00-0000-0000-0000-000000000000`.slice(0, 36);
    const maxUuid = `${hexPrefix}ff-ffff-ffff-ffff-ffffffffffff`.slice(0, 36);
    const { data: stuByRange } = await supabaseAdmin.from("students").select("id, name, program").gte("id", minUuid).lte("id", maxUuid).limit(1).maybeSingle();
    if (stuByRange) return { ...stuByRange, prefix: "S" };

    const { data: regByRange } = await supabaseAdmin.from("registrations").select("id, student_name, program").gte("id", minUuid).lte("id", maxUuid).limit(1).maybeSingle();
    if (regByRange) {
      return { id: regByRange.id, name: regByRange.student_name || rawInput, program: regByRange.program || data.program, prefix: "R" };
    }
  }

  const { data: matchedStudents } = await supabaseAdmin.from("students").select("id, name, program").ilike("name", cleanName).limit(10);
  const norm = rawInput.toLowerCase();
  const baseProgram = data.program.split("(")[0].trim().toLowerCase();
  const list = matchedStudents || [];
  const existing =
    list.find((s) => s.name.trim().toLowerCase() === norm && (s.program || "").toLowerCase().includes(baseProgram)) ||
    list.find((s) => s.name.trim().toLowerCase() === norm);

  if (existing) return { ...existing, prefix: "S" };

  const { data: pendingReg } = await supabaseAdmin.from("registrations").select("id, student_name, program").ilike("student_name", cleanName).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (pendingReg) return { id: pendingReg.id, name: pendingReg.student_name || rawInput, program: pendingReg.program || data.program, prefix: "R" };

  throw new Error(
    `Kode ID atau Nama Siswa "${rawInput}" belum terdaftar di sistem. Bagi siswa baru, silakan mendaftar terlebih dahulu melalui formulir Pendaftaran Online di Halaman Utama.`
  );
}

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

  const { data: profile } = await supabaseAdmin.from("profiles").select("role, phone").eq("id", user.id).single();
  if (student.parent_id !== user.id && profile?.role !== "admin") {
    throw new Error("Anda tidak memiliki akses untuk membayar tagihan siswa ini.");
  }

  await ensureNotAlreadyPaid(student.id, month);

  const { baseAmount, feeAmount } = await getProgramSppWithFee(student.program);
  const orderId = buildCompactOrderId("S", student.id, month);
  const email = user.email || "parent@ibraglobalenglish.uk";
  const phone = profile?.phone || "";

  if (gateway === "midtrans") {
    return createMidtransTransaction(orderId, baseAmount, feeAmount, student.name, student.program, month, email, "https://www.ibraglobalenglish.uk/parent", phone);
  }
  return createXenditInvoice(orderId, baseAmount, feeAmount, student.name, student.program, month, email, "https://www.ibraglobalenglish.uk/parent", phone);
}

export async function processPublicCheckout(data: { student_name: string; parent_name?: string; email?: string; whatsapp?: string; program: string; month: string; gateway: "midtrans" | "xendit" }) {
  const target = await resolveOrCreatePublicStudent({ student_name: data.student_name, parent_name: data.parent_name, whatsapp: data.whatsapp, program: data.program });
  if (target.prefix === "S") {
    await ensureNotAlreadyPaid(target.id, data.month);
  }
  const effectiveProgram = target.program || data.program;
  const { baseAmount, feeAmount } = await getProgramSppWithFee(effectiveProgram);
  const registrationFee = target.prefix === "R" ? 25000 : 0;
  const totalFee = feeAmount + registrationFee;
  const orderId = buildCompactOrderId(target.prefix, target.id, data.month);
  const midtransFinishUrl = "https://www.ibraglobalenglish.uk/checkout";
  const xenditSuccessUrl = "https://www.ibraglobalenglish.uk/checkout?gateway=xendit&status=paid";
  const safeEmail = data.email || "parent@ibraglobalenglish.uk";
  const safePhone = data.whatsapp || "";

  if (data.gateway === "midtrans") {
    return createMidtransTransaction(orderId, baseAmount, totalFee, target.name, effectiveProgram, data.month, safeEmail, midtransFinishUrl, safePhone);
  }
  return createXenditInvoice(orderId, baseAmount, totalFee, target.name, effectiveProgram, data.month, safeEmail, xenditSuccessUrl, safePhone);
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

export function parseOrderMetadata(orderId: string): { prefix: "S" | "R"; entityId: string; month: string } | null {
  const raw = String(orderId || "");
  if (raw.startsWith("S_") || raw.startsWith("R_")) {
    const parts = raw.split("_");
    if (parts.length >= 3 && parts[1].length === 32 && parts[2].length === 6) {
      const h = parts[1];
      const entityId = `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
      const month = `${parts[2].slice(0, 4)}-${parts[2].slice(4, 6)}`;
      return { prefix: raw.startsWith("R_") ? "R" : "S", entityId, month };
    }
  }
  const legacyParts = raw.split("|");
  if (legacyParts.length >= 3 && legacyParts[0] === "SPP") {
    return { prefix: "S", entityId: legacyParts[1], month: legacyParts[2] };
  }
  return null;
}

export async function markSppAsPaid(orderId: string, grossAmount: number, gatewayLabel: string) {
  const meta = parseOrderMetadata(orderId);
  if (!meta) return;

  let studentId = meta.entityId;
  let student: { id: string; name: string; program: string } | null = null;

  if (meta.prefix === "R") {
    const { data: reg } = await supabaseAdmin.from("registrations").select("student_name, program, notes").eq("id", meta.entityId).maybeSingle();
    if (!reg) return;
    const netSpp = reg.program ? (await getProgramSppWithFee(reg.program)).baseAmount : grossAmount;
    if (!isNaN(grossAmount) && grossAmount > 0 && grossAmount < netSpp) {
      throw new Error(`Nominal pembayaran (${grossAmount}) kurang dari tagihan SPP (${netSpp}).`);
    }
    const cleanName = escapeLikePattern(reg.student_name.trim());
    const { data: existingStu } = await supabaseAdmin.from("students").select("id, name, program").ilike("name", cleanName).limit(1).maybeSingle();
    if (existingStu) {
      student = existingStu;
      studentId = existingStu.id;
    } else {
      const paidMarker = `[PAID_SPP:${meta.month}:${netSpp}:${gatewayLabel}]`;
      const prevNotes = (reg.notes || "").replace(/\[PAID_SPP:[^\]]+\]\s*/g, "").trim();
      const updatedNotes = prevNotes ? `${paidMarker} ${prevNotes}` : paidMarker;
      await supabaseAdmin.from("registrations").update({ notes: updatedNotes }).eq("id", meta.entityId);
      await clearCachedSessionByOrderId(orderId);
      return;
    }
  } else {
    const { data: s } = await supabaseAdmin.from("students").select("id, name, program").eq("id", studentId).maybeSingle();
    student = s;
  }

  const netSpp = student?.program ? (await getProgramSppWithFee(student.program)).baseAmount : grossAmount;
  if (!isNaN(grossAmount) && grossAmount > 0 && grossAmount < netSpp) {
    throw new Error(`Nominal pembayaran (${grossAmount}) kurang dari tagihan SPP (${netSpp}).`);
  }
  const { error } = await supabaseAdmin.from("tuition_payments").upsert(
    {
      student_id: studentId,
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
  await clearCachedSessionByOrderId(orderId);
  await sendPaymentReceiptNotification(
    studentId,
    student?.name || "Siswa IGE",
    student?.program || "Kursus",
    meta.month,
    netSpp,
    gatewayLabel
  );
}
