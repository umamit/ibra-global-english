export const dynamic = 'force-dynamic';

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSupabaseConfig } from "@/utils/supabase/config";
import { checkAdminAuth } from "@/utils/supabase/adminAuth";

const { url: supabaseUrl } = getSupabaseConfig();

const adminSupabase = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key"
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const program = searchParams.get("program");
  const upcoming = searchParams.get("upcoming") !== "false";

  let query = adminSupabase
    .from("online_schedules")
    .select("*")
    .eq("is_active", true)
    .order("scheduled_at", { ascending: true });

  if (upcoming) {
    query = query.gte("scheduled_at", new Date().toISOString());
  }

  if (program && program !== "Semua Program") {
    query = query.eq("program", program);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: "Tidak diizinkan. Hanya admin yang diizinkan." }, { status: 403 });
  }
  const body = await request.json();
  const { title, program, meeting_link, meeting_platform, scheduled_at, duration_minutes, tutor_name, notes } = body;

  if (!title?.trim() || !program || !meeting_link?.trim() || !scheduled_at) {
    return NextResponse.json({ error: "Judul, program, link meeting, dan waktu wajib diisi." }, { status: 400 });
  }

  const { data, error } = await adminSupabase
    .from("online_schedules")
    .insert({
      title: title.trim(),
      program,
      meeting_link: meeting_link.trim(),
      meeting_platform: meeting_platform || "Google Meet",
      scheduled_at,
      duration_minutes: duration_minutes || 60,
      tutor_name: tutor_name?.trim() || "",
      notes: notes?.trim() || "",
      is_active: true,
    })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(request) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: "Tidak diizinkan. Hanya admin yang diizinkan." }, { status: 403 });
  }
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "ID diperlukan." }, { status: 400 });

  const { error } = await adminSupabase.from("online_schedules").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: "Tidak diizinkan. Hanya admin yang diizinkan." }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID diperlukan." }, { status: 400 });

  const { error } = await adminSupabase.from("online_schedules").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
