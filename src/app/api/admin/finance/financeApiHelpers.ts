import { getAdminSupabase } from "@/app/api/_middleware";

const supabaseAdmin = getAdminSupabase();

export async function logFinanceAudit(actorEmail: string, studentId: string, month: string, action: string, details: string) {
  try {
    await supabaseAdmin.from("system_audit_logs").insert({
      actor_name: actorEmail || "Admin",
      action: action || "SPP_UPDATE",
      details: `[Siswa: ${studentId}] [Bulan: ${month}] ${details}`,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Non-blocking
  }
}

export async function upsertTuitionRecord(payload: {
  student_id: string;
  month: string;
  amount: number;
  status: string;
  payment_method: string;
  receipt_url?: string | null;
  payment_date?: string | null;
  payment_type?: string | null;
}) {
  const { error } = await supabaseAdmin
    .from("tuition_payments")
    .upsert(
      {
        ...payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,month" }
    );
  if (error) throw error;
}
