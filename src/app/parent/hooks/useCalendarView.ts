import { useState, useEffect } from "react";

export interface Schedule {
  id: string;
  type: string;
  program: string;
  start_time: string;
  end_time: string;
  title: string;
  description?: string;
  instructor?: string;
  status?: string;
  pending_reason?: string;
  rescheduled_to?: string;
}

export interface CalendarCell {
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  dateString: string;
}

export function getLocalDateString(dateObj: Date): string {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function useCalendarView(parentSchedules: Schedule[]) {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const viewYear = currentDate.getFullYear();
  const viewMonth = currentDate.getMonth();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [syncModalOpen, setSyncModalOpen] = useState<boolean>(false);

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
      day: prevDay,
      month: tempMonth,
      year: tempYear,
      isCurrentMonth: false,
      dateString: `${tempYear}-${String(tempMonth + 1).padStart(2, "0")}-${String(prevDay).padStart(2, "0")}`,
    });
  }

  for (let d = 1; d <= totalDays; d++) {
    calendarDays.push({
      day: d,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true,
      dateString: `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }

  const remainingCells = 42 - calendarDays.length;
  for (let n = 1; n <= remainingCells; n++) {
    const tempMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const tempYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    calendarDays.push({
      day: n,
      month: tempMonth,
      year: tempYear,
      isCurrentMonth: false,
      dateString: `${tempYear}-${String(tempMonth + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}`,
    });
  }

  const navigateMonth = (direction: "prev" | "next"): void => {
    if (direction === "prev") {
      setCurrentDate(new Date(viewYear, viewMonth - 1, 1));
    } else {
      setCurrentDate(new Date(viewYear, viewMonth + 1, 1));
    }
  };

  const getMonthNameIndonesian = (monthIdx: number): string => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    return months[monthIdx];
  };

  const getSchedulesForDay = (dateStr: string): Schedule[] => {
    return parentSchedules.filter((s) => {
      const sDateStr = getLocalDateString(new Date(s.start_time));
      return sDateStr === dateStr;
    });
  };

  const handleOpenDetailModal = (sched: Schedule, e: React.MouseEvent): void => {
    e.stopPropagation();
    setSelectedSchedule(sched);
    setModalOpen(true);
  };

  return {
    mounted, currentDate, setCurrentDate, viewYear, viewMonth, modalOpen, setModalOpen,
    selectedSchedule, setSelectedSchedule, syncModalOpen, setSyncModalOpen,
    calendarDays, navigateMonth, getMonthNameIndonesian, getSchedulesForDay, handleOpenDetailModal,
  };
}
