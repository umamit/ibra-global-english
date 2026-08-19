import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";
import { studentInsertSchema, studentUpdateSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
const supabaseAdmin = getAdminSupabase();

export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsed = studentInsertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data tidak valid" }, { status: 400 });
    }
    const { data, error } = await supabaseAdmin.from("students").insert(parsed.data).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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
    const { id, ...updateData } = parsed.data;
    const { data, error } = await supabaseAdmin.from("students").update(updateData).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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
