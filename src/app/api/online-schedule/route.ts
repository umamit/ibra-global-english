export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { withAdminAuth } from "@/app/api/_middleware";
import { onlineScheduleSchema, onlineScheduleUpdateSchema } from "@/lib/schemas";
import { getPostHogClient } from "@/lib/posthog-server";
import {
  fetchOnlineSchedules,
  createOnlineSchedule,
  updateOnlineSchedule,
  deleteOnlineSchedule,
} from "./onlineScheduleHelpers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { data, error } = await fetchOnlineSchedules(
      searchParams.get("program"),
      searchParams.get("upcoming") !== "false"
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
}

export const POST = withAdminAuth(async (request) => {
  const validation = onlineScheduleSchema.safeParse(await request.json());
  if (!validation.success) {
    return NextResponse.json({ error: `Data tidak valid: ${validation.error.issues.map(i => i.message).join(", ")}` }, { status: 400 });
  }

  const { data, error } = await createOnlineSchedule(validation.data);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  getPostHogClient().capture({
    distinctId: "admin",
    event: "online_schedule_created",
    properties: { program: validation.data.program, meeting_platform: validation.data.meeting_platform, tutor_name: validation.data.tutor_name },
  });
  return NextResponse.json({ data });
});

export const PATCH = withAdminAuth(async (request) => {
  const validation = onlineScheduleUpdateSchema.safeParse(await request.json());
  if (!validation.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });

  const { id, ...updates } = validation.data;
  if (!id) return NextResponse.json({ error: "ID diperlukan." }, { status: 400 });

  const { error } = await updateOnlineSchedule(id, updates);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
});

export const DELETE = withAdminAuth(async (request) => {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID diperlukan." }, { status: 400 });

  const { error } = await deleteOnlineSchedule(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
});