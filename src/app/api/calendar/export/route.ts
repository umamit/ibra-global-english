import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import { generateICalFeed } from "./calendarExportHelpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const program = searchParams.get("program") || "All";
    const supabase = createAdminClient();

    let query = supabase.from("academic_schedules").select("*").order("start_time", { ascending: true });
    if (program !== "All") query = query.in("program", [program, "All"]);

    const { data: schedules, error } = await query;
    if (error) return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });

    const responseText = generateICalFeed(schedules || [], program);
    return new NextResponse(responseText, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="ibra-calendar-${program.toLowerCase().replace(/\s+/g, "-")}.ics"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0"
      }
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to export calendar" }, { status: 500 });
  }
}
