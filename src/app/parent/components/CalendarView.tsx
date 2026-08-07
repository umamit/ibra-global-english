"use client";

import React from "react";
import SkeletonCard from "@/components/ui/SkeletonCard";
import { useCalendarView, Schedule, getLocalDateString } from "../hooks/useCalendarView";
import CalendarSyncModal from "./CalendarSyncModal";
import CalendarDetailModal from "./CalendarDetailModal";

interface SelectedChild {
  program?: string;
  name?: string;
}

interface CalendarViewProps {
  parentSchedules: Schedule[];
  detailsLoading: boolean;
  selectedChild: SelectedChild | null;
}

export default function CalendarView({ parentSchedules, detailsLoading, selectedChild }: CalendarViewProps) {
  const {
    mounted, setCurrentDate, viewYear, viewMonth, modalOpen, setModalOpen,
    selectedSchedule, syncModalOpen, setSyncModalOpen, calendarDays,
    navigateMonth, getMonthNameIndonesian, getSchedulesForDay, handleOpenDetailModal,
  } = useCalendarView(parentSchedules);

  if (detailsLoading || !mounted) {
    return (
      <div className="portal-card">
        <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
          Jadwal & Agenda Belajar Siswa
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <SkeletonCard variant="table" count={3} height="100px" />
        </div>
      </div>
    );
  }

  return (
    <div className="portal-card" style={{ padding: "1.5rem" }}>
      <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
        Jadwal & Agenda Belajar Siswa
      </h3>
      <p style={{ color: "var(--color-gray-500)", fontSize: "0.875rem", marginBottom: "2rem" }}>
        Berikut adalah agenda belajar, kelas rutin, kegiatan bimbingan belajar, serta hari libur sekolah yang dikhususkan untuk program pendaftaran anak Anda (<strong>{selectedChild?.program}</strong>).
      </p>

      {/* Monthly Navigation Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", backgroundColor: "var(--color-gray-50)", padding: "1rem 1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-gray-200)" }}>
        <h4 style={{ fontSize: "1.2rem", fontWeight: "900", color: "var(--color-gray-900)", margin: 0 }}>
          {getMonthNameIndonesian(viewMonth)} {viewYear}
        </h4>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" className="btn-portal-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", border: "1px dashed var(--color-primary)", color: "var(--color-primary-dark)", display: "inline-flex", alignItems: "center", gap: "0.3rem" }} onClick={() => setSyncModalOpen(true)}>
            <i className="fi fi-rr-link"></i>
            <span>Sinkronkan ke HP</span>
          </button>
          <button className="btn-portal-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }} onClick={() => navigateMonth("prev")} aria-label="Tampilkan bulan sebelumnya">
            ◀ Bulan Lalu
          </button>
          <button className="btn-portal-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }} onClick={() => setCurrentDate(new Date())} aria-label="Kembali ke hari ini">
            Hari Ini
          </button>
          <button className="btn-portal-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }} onClick={() => navigateMonth("next")} aria-label="Tampilkan bulan berikutnya">
            Bulan Depan ▶
          </button>
        </div>
      </div>

      {/* Grid Bulanan */}
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: "700px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", backgroundColor: "var(--color-gray-100)", borderRadius: "12px", padding: "6px" }}>
            {["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((day, idx) => (
              <div key={day} style={{ textAlign: "center", fontWeight: "800", color: idx === 0 || idx === 6 ? "var(--color-accent)" : "var(--color-gray-600)", fontSize: "0.85rem", padding: "0.6rem 0.25rem", backgroundColor: "var(--color-gray-200)", borderRadius: "6px", marginBottom: "4px" }}>
                {day}
              </div>
            ))}

            {calendarDays.map((cell, idx) => {
              const daySchedules = getSchedulesForDay(cell.dateString);
              const isToday = cell.dateString === getLocalDateString(new Date());

              return (
                <div key={idx} style={{ minHeight: "100px", backgroundColor: cell.isCurrentMonth ? "white" : "var(--color-gray-50)", padding: "0.4rem", border: isToday ? "2px solid var(--color-primary)" : "1px solid var(--color-gray-200)", borderRadius: "6px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: "800", color: isToday ? "white" : cell.isCurrentMonth ? "var(--color-gray-800)" : "var(--color-gray-400)", backgroundColor: isToday ? "var(--color-primary)" : "transparent", width: isToday ? "24px" : "auto", height: isToday ? "24px" : "auto", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {cell.day}
                    </span>
                  </div>

                  <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "3px", overflow: "hidden" }}>
                    {daySchedules.map((s) => {
                      let badgeBg = "var(--color-primary-light)";
                      let badgeColor = "var(--color-primary-dark)";

                      if (s.status === "pending") {
                        badgeBg = "#fef3c7";
                        badgeColor = "#d97706";
                      } else if (s.status === "rescheduled") {
                        badgeBg = "#dbeafe";
                        badgeColor = "#2563eb";
                      } else if (s.type === "holiday") {
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
                          aria-label={`Agenda: ${s.title}, Status: ${s.status || "Aktif"}, Jam: ${cleanTimeStr}. Tekan Enter untuk melihat detail.`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleOpenDetailModal(s, e as any);
                            }
                          }}
                          style={{ backgroundColor: badgeBg, color: badgeColor, padding: "0.2rem 0.4rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer", transition: "opacity 0.15s ease", border: "1px solid rgba(0,0,0,0.05)" }}
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
      <CalendarDetailModal
        isOpen={modalOpen}
        schedule={selectedSchedule}
        onClose={() => setModalOpen(false)}
      />

      {/* SINKRONISASI KALENDER HP MODAL */}
      <CalendarSyncModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        selectedChildProgram={selectedChild?.program}
      />
    </div>
  );
}
