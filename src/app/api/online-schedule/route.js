export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";
import { onlineScheduleSchema, onlineScheduleUpdateSchema } from "@/lib/schemas";

const adminSupabase = getAdminSupabase();

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

export const POST = withAdminAuth(async (request) => {
  const body = await request.json();
  const validation = onlineScheduleSchema.safeParse(body);

  if (!validation.success) {
    const errorMessages = validation.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return NextResponse.json({ error: `Data tidak valid: ${errorMessages}` }, { status: 400 });
  }

  const { title, program, meeting_link, meeting_platform, scheduled_at, duration_minutes, tutor_name, notes } = validation.data;

  const { data, error } = await adminSupabase
    .from("online_schedules")
    .insert({
      title,
      program,
      meeting_link,
      meeting_platform,
      scheduled_at,
      duration_minutes,
      tutor_name,
      notes,
      is_active: true,
    })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});

export const PATCH = withAdminAuth(async (request) => {
  const body = await request.json();
  const validation = onlineScheduleUpdateSchema.safeParse(body);

  if (!validation.success) {
    const errorMessages = validation.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return NextResponse.json({ error: `Data tidak valid: ${errorMessages}` }, { status: 400 });
  }

  const { id, ...updates } = validation.data;
  if (!id) return NextResponse.json({ error: "ID diperlukan." }, { status: 400 });

  const { error } = await adminSupabase.from("online_schedules").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
});

export const DELETE = withAdminAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID diperlukan." }, { status: 400 });

  const { error } = await adminSupabase.from("online_schedules").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
});