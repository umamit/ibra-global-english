export function formatICalDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function escapeICalText(text: string | null | undefined): string {
  if (!text) return "";
  return text.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

export function generateICalFeed(schedules: any[], program: string): string {
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
  return icsContent.join("\r\n");
}
