export function formatScheduleLabelWIT(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr.substring(0, 16);
    const witDate = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    const y = witDate.getUTCFullYear();
    const m = String(witDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(witDate.getUTCDate()).padStart(2, "0");
    const hh = String(witDate.getUTCHours()).padStart(2, "0");
    const mm = String(witDate.getUTCMinutes()).padStart(2, "0");
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return `${dayNames[witDate.getUTCDay()]}, ${y}-${m}-${day} (${hh}:${mm} WIT)`;
  } catch {
    return isoStr.substring(0, 16);
  }
}

export function getWitDayAndMinutes(isoStr: string): { dayOfWeek: number; minutes: number; timeStr: string } | null {
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return null;
    const witDate = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    const hh = witDate.getUTCHours();
    const mm = witDate.getUTCMinutes();
    return {
      dayOfWeek: witDate.getUTCDay(),
      minutes: hh * 60 + mm,
      timeStr: `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`,
    };
  } catch {
    return null;
  }
}

export function parseHHMMToMinutes(hhmm: string): number {
  const [h, m] = (hhmm || "00:00").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function normalizeDbProgram(rawProgram: string, studentAge?: number): string {
  const p = (rawProgram || "").trim();
  if (["Kids Program", "Teens Program", "Fun Calistung", "All"].includes(p)) return p;
  const lower = p.toLowerCase();
  if (lower.includes("calistung")) return "Fun Calistung";
  if (lower.includes("teen") || lower.startsWith("b1") || lower.startsWith("b2") || lower.startsWith("c1")) {
    return "Teens Program";
  }
  if (studentAge && studentAge >= 13) return "Teens Program";
  return "Kids Program";
}

export function doesScheduleBelongToStudent(
  sch: { description?: string | null; title?: string | null; recurrence_id?: string | null },
  studentId?: string | null,
  studentName?: string | null
): boolean {
  const desc = String(sch.description || "");
  const rec = String(sch.recurrence_id || "");
  if (studentId) {
    if (desc.includes(`[SID:${studentId}]`)) return true;
    if (rec.startsWith(`rec_stu_${studentId.slice(0, 8)}_`)) return true;
    if (desc.includes("[SID:") || rec.startsWith("rec_stu_")) return false;
  }
  const cleanName = String(studentName || "").trim().toLowerCase();
  if (!cleanName) return false;
  return desc.toLowerCase().includes(cleanName) || String(sch.title || "").toLowerCase().includes(cleanName);
}
