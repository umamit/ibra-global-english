import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key"
);

// GET: Ambil semua pengumuman aktif (bisa filter program)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const program = searchParams.get("program");
  const all = searchParams.get("all") === "true"; // untuk admin

  let query = adminSupabase
    .from("announcements")
    .select("*")
    .order("published_at", { ascending: false });

  if (!all) {
    query = query.eq("is_active", true);
  }

  if (program && program !== "Semua Program") {
    query = query.or(`program.eq.${program},program.eq.Semua Program`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST: Buat pengumuman baru (admin)
export async function POST(request) {
  const body = await request.json();
  const { title, content, program, priority, expires_at } = body;

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Judul dan isi pengumuman wajib diisi." }, { status: 400 });
  }

  const { data, error } = await adminSupabase
    .from("announcements")
    .insert({
      title: title.trim(),
      content: content.trim(),
      program: program || "Semua Program",
      priority: priority || "normal",
      expires_at: expires_at || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// PATCH: Update / nonaktifkan pengumuman
export async function PATCH(request) {
  const body = await request.json();
  const { id, is_active, title, content, program, priority } = body;

  if (!id) return NextResponse.json({ error: "ID diperlukan." }, { status: 400 });

  const updates = {};
  if (typeof is_active === "boolean") updates.is_active = is_active;
  if (title) updates.title = title.trim();
  if (content) updates.content = content.trim();
  if (program) updates.program = program;
  if (priority) updates.priority = priority;

  const { error } = await adminSupabase
    .from("announcements")
    .update(updates)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE: Hapus pengumuman
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID diperlukan." }, { status: 400 });

  const { error } = await adminSupabase.from("announcements").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
