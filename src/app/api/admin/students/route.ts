import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";
import { studentInsertSchema, studentUpdateSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
const supabaseAdmin = getAdminSupabase();

async function syncStudentParentRegistration(studentId: string, studentName: string, program: string, age: number, parent_name?: string | null, parent_email?: string | null, whatsapp?: string | null) {
  const sidTag = `[SID:${studentId}]`;
  const cleanName = studentName.trim().replace(/[%_\\]/g, "\\$&");
  const { data: bySid } = await supabaseAdmin.from("registrations").select("id, notes").ilike("notes", `%${sidTag}%`).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const { data: byName } = !bySid ? await supabaseAdmin.from("registrations").select("id, notes").ilike("student_name", cleanName).order("created_at", { ascending: false }).limit(1).maybeSingle() : { data: null };
  const existingReg = bySid || byName;

  if (existingReg?.id) {
    const prevNotes = String(existingReg.notes || "");
    const nextNotes = prevNotes.includes(sidTag) ? prevNotes : `${prevNotes} ${sidTag}`.trim();
    await supabaseAdmin.from("registrations").update({
      student_name: studentName.trim(),
      program,
      parent_name: parent_name ?? undefined,
      parent_email: parent_email ?? undefined,
      whatsapp: whatsapp || undefined,
      notes: nextNotes,
    }).eq("id", existingReg.id);
  } else if (parent_name || parent_email || whatsapp) {
    await supabaseAdmin.from("registrations").insert({
      student_name: studentName.trim(),
      student_age: age,
      program,
      parent_name: parent_name || null,
      parent_email: parent_email || null,
      whatsapp: whatsapp || "-",
      status: "approved",
      notes: `Data Wali dari Admin ${sidTag}`,
    });
  }
}

async function syncStudentBillingCycle(studentId: string, billingCycle?: "prepaid" | "postpaid") {
  if (!billingCycle) return;
  const { data } = await supabaseAdmin.from("landing_settings").select("value").eq("key", "student_billing_cycles").maybeSingle();
  const map = data?.value ? JSON.parse(String(data.value)) : {};
  map[studentId] = billingCycle;
  await supabaseAdmin.from("landing_settings").upsert({ key: "student_billing_cycles", value: JSON.stringify(map) }, { onConflict: "key" });
}

export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsed = studentInsertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data tidak valid" }, { status: 400 });
    }
    const { parent_name, parent_email, whatsapp, billing_cycle, ...studentFields } = parsed.data;
    const { data, error } = await supabaseAdmin.from("students").insert(studentFields).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await syncStudentParentRegistration(data.id, studentFields.name, studentFields.program, studentFields.age, parent_name, parent_email, whatsapp);
    await syncStudentBillingCycle(data.id, billing_cycle || "prepaid");
    revalidatePath("/admin/students");
    revalidatePath("/admin/finance");
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server" }, { status: 500 });
  }
});

export const PATCH = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsed = studentUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data tidak valid" }, { status: 400 });
    }
    const { id, parent_name, parent_email, whatsapp, billing_cycle, ...updateData } = parsed.data;
    const { data, error } = await supabaseAdmin.from("students").update(updateData).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (data?.name) {
      await syncStudentParentRegistration(id, data.name, data.program || "Kids Program", data.age || 7, parent_name, parent_email, whatsapp);
    }
    await syncStudentBillingCycle(id, billing_cycle);
    revalidatePath("/admin/students");
    revalidatePath("/admin/finance");
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server" }, { status: 500 });
  }
});

export const DELETE = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID siswa diperlukan" }, { status: 400 });
    const { error } = await supabaseAdmin.from("students").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidatePath("/admin/students");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server" }, { status: 500 });
  }
});
