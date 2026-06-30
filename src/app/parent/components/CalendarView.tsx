"use client";

import React, { useState } from "react";

interface Schedule {
  id: string;
  type: string;
  program: string;
  start_time: string;
  end_time: string;
  title: string;
  description?: string;
  instructor?: string;
}

interface SelectedChild {
  program?: string;
  name?: string;
}

interface CalendarViewProps {
  parentSchedules: Schedule[];
  detailsLoading: boolean;
  selectedChild: SelectedChild | null;
}

interface CalendarCell {
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  dateString: string;
}

function getLocalDateString(dateObj: Date): string {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CalendarView({ parentSchedules, detailsLoading, selectedChild }: CalendarViewProps) {
  // Current calendar view year & month
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const viewYear = currentDate.getFullYear();
  const viewMonth = currentDate.getMonth(); // 0-indexed

  // Modal / Detail state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  if (detailsLoading) {
    return (
      <div className="portal-card">
        <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
          Jadwal & Agenda Belajar Siswa
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="portal-card" style={{ borderLeft: "5px solid var(--color-gray-200)", padding: "1.5rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <div style={{ flex: "1 1 300px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div className="skeleton-pulse skeleton-text" style={{ width: "60px" }} />
                  <div className="skeleton-pulse skeleton-text" style={{ width: "100px" }} />
                </div>
                <div className="skeleton-pulse skeleton-title" style={{ width: "220px", marginBottom: "0.5rem" }} />
                <div className="skeleton-pulse skeleton-text" style={{ width: "320px" }} />
              </div>
              <div style={{ textAlign: "right", minWidth: "200px" }}>
                <div className="skeleton-pulse skeleton-text" style={{ width: "140px", marginBottom: "0.5rem" }} />
                <div className="skeleton-pulse skeleton-text" style={{ width: "100px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calendar calculations (Sunday-first grid)
  const getDaysInMonth = (y: number, m: number): number => new Date(y, m + 1, 0).getDate();
  const getFirstDayIndex = (y: number, m: number): number => new Date(y, m, 1).getDay();

  const totalDays = getDaysInMonth(viewYear, viewMonth);
  const firstDayIndex = getFirstDayIndex(viewYear, viewMonth);
  const prevMonthTotalDays = getDaysInMonth(viewYear, viewMonth - 1);

  const calendarDays: CalendarCell[] = [];

  // 1. Fill trailing days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevDay = prevMonthTotalDays - i;
    const tempMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const tempYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    calendarDays.push({
      day: prevDay,
      month: tempMonth,
      year: tempYear,
      isCurrentMonth: false,
      dateString: `${tempYear}-${String(tempMonth + 1).padStart(2, "0")}-${String(prevDay).padStart(2, "0")}`
    });
  }

  // 2. Fill current month days
  for (let d = 1; d <= totalDays; d++) {
    calendarDays.push({
      day: d,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true,
      dateString: `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    });
  }

  // 3. Fill leading days from next month
  const remainingCells = 42 - calendarDays.length;
  for (let n = 1; n <= remainingCells; n++) {
    const tempMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const tempYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    calendarDays.push({
      day: n,
      month: tempMonth,
      year: tempYear,
      isCurrentMonth: false,
      dateString: `${tempYear}-${String(tempMonth + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}`
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
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
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

  return (
    <div className="portal-card" style={{ padding: "1.5rem" }}>
      <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
        Jadwal & Agenda Belajar Siswa
      </h3>
      <p style={{ color: "var(--color-gray-500)", fontSize: "0.875rem", marginBottom: "2rem" }}>
        Berikut adalah agenda belajar, kelas rutin, kegiatan bimbingan belajar, serta hari libur sekolah yang dikhususkan untuk program pendaftaran anak Anda (**{selectedChild?.program}**).
      </p>

      {/* Monthly Navigation Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "1.5rem", 
        backgroundColor: "var(--color-gray-50)", 
        padding: "1rem 1.25rem", 
        borderRadius: "var(--radius-md)", 
        border: "1px solid var(--color-gray-200)" 
      }}>
        <h4 style={{ fontSize: "1.2rem", fontWeight: "900", color: "var(--color-gray-900)", margin: 0 }}>
          {getMonthNameIndonesian(viewMonth)} {viewYear}
        </h4>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button 
            className="btn-portal-outline" 
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }} 
            onClick={() => navigateMonth("prev")}
            aria-label="Tampilkan bulan sebelumnya"
          >
            ◀ Bulan Lalu
          </button>
          <button 
            className="btn-portal-outline" 
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }} 
            onClick={() => setCurrentDate(new Date())}
            aria-label="Kembali ke hari ini"
          >
            Hari Ini
          </button>
          <button 
            className="btn-portal-outline" 
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }} 
            onClick={() => navigateMonth("next")}
            aria-label="Tampilkan bulan berikutnya"
          >
            Bulan Depan ▶
          </button>
        </div>
      </div>

      {/* Grid Bulanan */}
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: "700px" }}>
          
          {/* Weekdays Header */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(7, 1fr)", 
            gap: "1px", 
            backgroundColor: "var(--color-gray-200)", 
            borderBottom: "2px solid var(--color-gray-200)", 
            paddingBottom: "0.5rem", 
            marginBottom: "1px" 
          }}>
            {["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((day, idx) => (
              <div 
                key={day} 
                style={{ 
                  textAlign: "center", 
                  fontWeight: "800", 
                  color: idx === 0 || idx === 6 ? "var(--color-accent)" : "var(--color-gray-600)", 
                  fontSize: "0.85rem", 
                  padding: "0.25rem" 
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(7, 1fr)", 
            gap: "4px", 
            backgroundColor: "var(--color-gray-100)", 
            borderRadius: "0 0 12px 12px" 
          }}>
            {calendarDays.map((cell, idx) => {
              const daySchedules = getSchedulesForDay(cell.dateString);
              const isToday = cell.dateString === getLocalDateString(new Date());

              return (
                <div
                  key={idx}
                  style={{
                    minHeight: "100px",
                    backgroundColor: cell.isCurrentMonth ? "white" : "var(--color-gray-50)",
                    padding: "0.4rem",
                    border: isToday ? "2px solid var(--color-primary)" : "1px solid var(--color-gray-200)",
                    borderRadius: "6px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative"
                  }}
                >
                  {/* Day Number */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <span style={{
                      fontSize: "0.85rem",
                      fontWeight: "800",
                      color: isToday 
                        ? "white" 
                        : cell.isCurrentMonth 
                          ? "var(--color-gray-800)" 
                          : "var(--color-gray-400)",
                      backgroundColor: isToday ? "var(--color-primary)" : "transparent",
                      width: isToday ? "24px" : "auto",
                      height: isToday ? "24px" : "auto",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {cell.day}
                    </span>
                  </div>

                  {/* Day Agenda Lists */}
                  <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "3px", overflow: "hidden" }}>
                    {daySchedules.map((s) => {
                      let badgeBg = "var(--color-primary-light)";
                      let badgeColor = "var(--color-primary-dark)";

                      if (s.type === "holiday") {
                        badgeBg = "#fee2e2";
                        badgeColor = "#ef4444";
                      } else if (s.type === "event") {
                        badgeBg = "var(--color-accent-light)";
                        badgeColor = "var(--color-accent)";
                      }

                      const cleanTimeStr = new Date(s.start_time).toTimeString().slice(0, 5);

                      return (
                        <div
                          key={s.id}
                          onClick={(e) => handleOpenDetailModal(s, e)}
                          role="button"
                          tabIndex={0}
                          aria-label={`Agenda: ${s.title}, Jam: ${cleanTimeStr}. Tekan Enter untuk melihat detail.`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleOpenDetailModal(s, e as any);
                            }
                          }}
                          style={{
                            backgroundColor: badgeBg,
                            color: badgeColor,
                            padding: "0.2rem 0.4rem",
                            borderRadius: "4px",
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            cursor: "pointer",
                            transition: "opacity 0.15s ease",
                            border: "1px solid rgba(0,0,0,0.05)"
                          }}
                          title={`${s.title} (${cleanTimeStr})`}
                        >
                          <span style={{ marginRight: "3px", opacity: 0.8 }}>{cleanTimeStr}</span>
                          <span>{s.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* READ-ONLY DETAIL MODAL */}
      {modalOpen && selectedSchedule && (
        <div className="portal-modal-overlay" onClick={() => setModalOpen(false)}>
          <div 
            className="portal-modal" 
            style={{ maxWidth: "500px", padding: "2rem", animation: "slideIn 0.2s ease" }}
            onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside it
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <span style={{ 
                  fontSize: "0.7rem", 
                  fontWeight: "800", 
                  color: "white", 
                  backgroundColor: selectedSchedule.type === "holiday" ? "#ef4444" : selectedSchedule.type === "event" ? "var(--color-accent)" : "var(--color-primary)", 
                  padding: "0.25rem 0.65rem", 
                  borderRadius: "6px", 
                  textTransform: "uppercase", 
                  letterSpacing: "0.5px",
                  display: "inline-block",
                  marginBottom: "0.5rem"
                }}>
                  {selectedSchedule.type === "holiday" ? "Hari Libur" : selectedSchedule.type === "event" ? "Kegiatan Khusus" : "Kelas Rutin"}
                </span>
                <h4 style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--color-gray-900)", margin: 0 }}>
                  {selectedSchedule.title}
                </h4>
              </div>
              <button 
                type="button" 
                style={{ 
                  background: "transparent", 
                  border: "none", 
                  fontSize: "1.5rem", 
                  fontWeight: "800", 
                  color: "var(--color-gray-400)", 
                  cursor: "pointer",
                  padding: "0.25rem" 
                }} 
                onClick={() => setModalOpen(false)}
                aria-label="Tutup detail modal"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", borderTop: "1px solid var(--color-gray-150)", paddingTop: "1.25rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.75rem", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--color-gray-500)", fontWeight: "700" }}>📅 Hari & Tanggal:</span>
                <span style={{ color: "var(--color-gray-800)", fontWeight: "800" }}>
                  {new Date(selectedSchedule.start_time).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </span>

                <span style={{ color: "var(--color-gray-500)", fontWeight: "700" }}>⏱ Jam Pelajaran:</span>
                <span style={{ color: "var(--color-primary-dark)", fontWeight: "900" }}>
                  {new Date(selectedSchedule.start_time).toTimeString().slice(0, 5)} - {new Date(selectedSchedule.end_time).toTimeString().slice(0, 5)} WIB
                </span>

                <span style={{ color: "var(--color-gray-500)", fontWeight: "700" }}>🎓 Program Sasaran:</span>
                <span style={{ color: "var(--color-gray-800)", fontWeight: "700" }}>
                  {selectedSchedule.program}
                </span>

                {selectedSchedule.instructor && (
                  <>
                    <span style={{ color: "var(--color-gray-500)", fontWeight: "700" }}>👤 Tutor Pendamping:</span>
                    <span style={{ color: "var(--color-gray-800)", fontWeight: "800" }}>
                      {selectedSchedule.instructor}
                    </span>
                  </>
                )}
              </div>

              {selectedSchedule.description && (
                <div style={{ 
                  backgroundColor: "var(--color-gray-50)", 
                  padding: "1rem", 
                  borderRadius: "var(--radius-md)", 
                  border: "1px solid var(--color-gray-200)" 
                }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--color-gray-500)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px 0" }}>Deskripsi Agenda</p>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-gray-700)", margin: 0, lineHeight: "1.6" }}>
                    {selectedSchedule.description}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button 
                type="button" 
                className="btn-portal-primary" 
                style={{ padding: "0.5rem 1.5rem" }} 
                onClick={() => setModalOpen(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
