import { AcademicSchedule, getLocalDateString } from "./hooks/useCalendarData";

export interface CalendarCell {
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  dateString: string;
}

export function buildCalendarDays(viewYear: number, viewMonth: number): CalendarCell[] {
  const getDaysInMonth = (y: number, m: number): number => new Date(y, m + 1, 0).getDate();
  const getFirstDayIndex = (y: number, m: number): number => new Date(y, m, 1).getDay();

  const totalDays = getDaysInMonth(viewYear, viewMonth);
  const firstDayIndex = getFirstDayIndex(viewYear, viewMonth);
  const prevMonthTotalDays = getDaysInMonth(viewYear, viewMonth - 1);

  const calendarDays: CalendarCell[] = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevDay = prevMonthTotalDays - i;
    const tempMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const tempYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    calendarDays.push({
      day: prevDay, month: tempMonth, year: tempYear, isCurrentMonth: false,
      dateString: `${tempYear}-${String(tempMonth + 1).padStart(2, "0")}-${String(prevDay).padStart(2, "0")}`,
    });
  }

  for (let d = 1; d <= totalDays; d++) {
    calendarDays.push({
      day: d, month: viewMonth, year: viewYear, isCurrentMonth: true,
      dateString: `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }

  const remainingCells = 42 - calendarDays.length;
  for (let n = 1; n <= remainingCells; n++) {
    const tempMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const tempYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    calendarDays.push({
      day: n, month: tempMonth, year: tempYear, isCurrentMonth: false,
      dateString: `${tempYear}-${String(tempMonth + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}`,
    });
  }

  return calendarDays;
}

export function getSchedulesForDay(
  schedules: AcademicSchedule[],
  dateStr: string,
  filterProgram: string
): AcademicSchedule[] {
  return schedules.filter((s) => {
    const sDateStr = getLocalDateString(new Date(s.start_time));
    if (sDateStr !== dateStr) return false;
    if (filterProgram !== "All") {
      const f = filterProgram.toLowerCase();
      const p = (s.program || "").toLowerCase();
      const t = (s.title || "").toLowerCase();
      const d = (s.description || "").toLowerCase();
      return p.includes(f) || t.includes(f) || d.includes(f);
    }
    return true;
  });
}

export function getScheduleColor(type: string): { color: string; bg: string } {
  if (type === "holiday") return { color: "#ef4444", bg: "rgba(239, 68, 68, 0.04)" };
  if (type === "event") return { color: "var(--color-accent)", bg: "rgba(166, 136, 73, 0.04)" };
  return { color: "var(--color-primary)", bg: "rgba(33, 108, 126, 0.04)" };
}

export function getScheduleBadgeStyle(type: string): { badgeBg: string; badgeColor: string } {
  if (type === "holiday") return { badgeBg: "#fee2e2", badgeColor: "#ef4444" };
  if (type === "event") return { badgeBg: "var(--color-accent-light)", badgeColor: "var(--color-accent)" };
  return { badgeBg: "var(--color-primary-light)", badgeColor: "var(--color-primary-dark)" };
}
