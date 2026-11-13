import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/app/api/_middleware";

export const dynamic = "force-dynamic";
const supabaseAdmin = getAdminSupabase();

function maskStudentName(fullName: string): string {
  const parts = (fullName || "").trim().split(/\s+/);
  return parts
    .map((p) => (p.length <= 2 ? p : `${p[0]}${"*".repeat(Math.min(p.length - 2, 4))}${p[p.length - 1]}`))
    .join(" ");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    if (!q || q.length < 2) {
      return NextResponse.json({ error: "Kata kunci tidak valid" }, { status: 400 });
    }

    const upper = q.toUpperCase().replace(/\s+/g, "");
    const codeMatch = upper.match(/^(?:IGE[-_]?)?([0-9A-F]{6,32})$/);
    let student: { id: string; name: string; program: string } | null = null;
    let isRegistration = false;

    if (codeMatch) {
      const hexPrefix = codeMatch[1].toLowerCase();
      const minUuid = `${hexPrefix}00-0000-0000-0000-000000000000`.slice(0, 36);
      const maxUuid = `${hexPrefix}ff-ffff-ffff-ffff-ffffffffffff`.slice(0, 36);
      const { data: stu } = await supabaseAdmin.from("students").select("id, name, program").gte("id", minUuid).lte("id", maxUuid).limit(1).maybeSingle();
      if (stu) student = stu;
      else {
        const { data: reg } = await supabaseAdmin.from("registrations").select("id, student_name, program").gte("id", minUuid).lte("id", maxUuid).limit(1).maybeSingle();
        if (reg) {
          student = { id: reg.id, name: reg.student_name, program: reg.program };
          isRegistration = true;
        }
      }
    }

    if (!student) {
      const cleanName = q.replace(/[%_\\]/g, "\\$&");
      const { data: stu } = await supabaseAdmin.from("students").select("id, name, program").ilike("name", cleanName).limit(1).maybeSingle();
      if (stu) student = stu;
      else {
        const { data: reg } = await supabaseAdmin.from("registrations").select("id, student_name, program").ilike("student_name", cleanName).limit(1).maybeSingle();
        if (reg) {
          student = { id: reg.id, name: reg.student_name, program: reg.program };
          isRegistration = true;
        }
      }
    }

    if (!student) {
      return NextResponse.json({ found: false });
    }

    let billingCycle = "prepaid";
    if (!isRegistration) {
      const { data: cycleRow } = await supabaseAdmin.from("landing_settings").select("value").eq("key", "student_billing_cycles").maybeSingle();
      const cycles = cycleRow?.value ? JSON.parse(String(cycleRow.value)) : {};
      billingCycle = cycles[student.id] || (/\b(athira|firman|syafa|yunda|akhtar|syauqi|nasya)\b/i.test(student.name) ? "postpaid" : "prepaid");
    }

    const now = new Date();
    const currMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

    let suggestedMonth = currMonth;
    if (billingCycle === "postpaid") {
      const { data: prevPayment } = await supabaseAdmin.from("tuition_payments").select("status").eq("student_id", student.id).eq("month", prevMonth).maybeSingle();
      if (!prevPayment || prevPayment.status !== "lunas") {
        suggestedMonth = prevMonth;
      }
    }

    return NextResponse.json({
      found: true,
      maskedName: maskStudentName(student.name),
      program: student.program || "Kids Program",
      billingCycle,
      suggestedMonth,
      isNewRegistration: isRegistration,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memverifikasi siswa" }, { status: 500 });
  }
}
