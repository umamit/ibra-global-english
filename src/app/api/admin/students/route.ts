import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";
import { studentInsertSchema, studentUpdateSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
const supabaseAdmin = getAdminSupabase();

async function syncStudentParentRegistration(studentName: string, program: string, age: number, parent_name?: string | null, parent_email?: string | null, whatsapp?: string | null) {
  if (!parent_name && !parent_email && !whatsapp) return;
  const cleanName = studentName.trim().replace(/[%_\\]/g, "\\$&");
  const { data: existingReg } = await supabaseAdmin.from("registrations").select("id").ilike("student_name", cleanName).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (existingReg?.id) {
    await supabaseAdmin.from("registrations").update({
      parent_name: parent_name ?? undefined,
      parent_email: parent_email ?? undefined,
      whatsapp: whatsapp || "-",
    }).eq("id", existingReg.id);
  } else {
    await supabaseAdmin.from("registrations").insert({
      student_name: studentName.trim(),
      student_age: age,
      program,
      parent_name: parent_name || null,
      parent_email: parent_email || null,
      whatsapp: whatsapp || "-",
      status: "approved",
      notes: "Data Wali dari Admin",
    });
  }
}

export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsed = studentInsertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data tidak valid" }, { status: 400 });
    }
    const { parent_name, parent_email, whatsapp, ...studentFields } = parsed.data;
    const { data, error } = await supabaseAdmin.from("students").insert(studentFields).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await syncStudentParentRegistration(studentFields.name, studentFields.program, studentFields.age, parent_name, parent_email, whatsapp);
    revalidatePath("/admin/students");
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
    const { id, parent_name, parent_email, whatsapp, ...updateData } = parsed.data;
    const { data, error } = await supabaseAdmin.from("students").update(updateData).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (data?.name) {
      await syncStudentParentRegistration(data.name, data.program || "Kids Program", data.age || 7, parent_name, parent_email, whatsapp);
    }
    revalidatePath("/admin/students");
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
