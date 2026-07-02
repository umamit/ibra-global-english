import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

function formatICalDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeICalText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const program = searchParams.get("program") || "All";

    const supabase = createAdminClient();

    let query = supabase
      .from("academic_schedules")
      .select("*")
      .order("start_time", { ascending: true });

    if (program !== "All") {
      query = query.in("program", [program, "All"]);
    }

    const { data: schedules, error } = await query;

    if (error) {
      console.error("Error fetching schedules for iCal export:", error);
      return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
    }

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Ibra Global English//LMS Academic Calendar//ID",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:Ibra Global English - ${program}`,
      "X-WR-TIMEZONE:Asia/Jayapura",
      "BEGIN:VTIMEZONE",
      "TZID:Asia/Jayapura",
      "BEGIN:STANDARD",
      "DTSTART:19700101T000000",
      "TZOFFSETFROM:+0900",
      "TZOFFSETTO:+0900",
      "TZNAME:WIT",
      "END:STANDARD",
      "END:VTIMEZONE"
    ];

    schedules?.forEach((s) => {
      const start = formatICalDate(s.start_time);
      const end = formatICalDate(s.end_time);
      const stamp = formatICalDate(s.created_at || new Date().toISOString());
      const escapedTitle = escapeICalText(s.title);
      const escapedDesc = escapeICalText(s.description || `Kelas reguler - ${s.title}`);
      const escapedInstructor = s.instructor ? `\\nTutor: ${escapeICalText(s.instructor)}` : "";
      const escapedProgram = `\\nProgram: ${escapeICalText(s.program)}`;

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:${s.id}@ibra-global-english.com`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${escapedTitle}`,
        `DESCRIPTION:${escapedDesc}${escapedInstructor}${escapedProgram}`,
        "LOCATION:Ibra Global English Bobong",
        "STATUS:CONFIRMED",
        "END:VEVENT"
      );
    });

    icsContent.push("END:VCALENDAR");

    const responseText = icsContent.join("\r\n");

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
    console.error("Unhandled error in iCal export API:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
