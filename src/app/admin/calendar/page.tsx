"use client";

export const dynamic = 'force-dynamic';

import React from 'react';
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import ScheduleList from "./ScheduleList";
import SyncModal from "./components/SyncModal";
import AiSchedulerModal from "./components/AiSchedulerModal";
import AddEditScheduleModal from "./components/AddEditScheduleModal";

interface AcademicSchedule {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  program: string;
  start_time: string;
  end_time: string;
  instructor?: string | null;
  recurrence_id?: string | null;
  created_at?: string;
}

interface CalendarCell {
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  dateString: string;
}

interface StatusMsg {
  type: "success" | "error" | "";
  text: string;
}

function getLocalDateString(dateObj: Date): string {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AdminCalendar() {
  const supabase = createClient();

  const [schedules, setSchedules] = useState<AcademicSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMsg, setStatusMsg] = useState<StatusMsg>({ type: "", text: "" });

  // Current calendar view year & month
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const viewYear = currentDate.getFullYear();
  const viewMonth = currentDate.getMonth(); // 0-indexed

  // Form / Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedSchedule, setSelectedChildSchedule] = useState<AcademicSchedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateString(new Date()));
  const [viewAllDate, setViewAllDate] = useState<string | null>(null);
  const [syncModalOpen, setSyncModalOpen] = useState<boolean>(false);
  
  // AI Scheduler States
  const [aiPromptModalOpen, setAiPromptModalOpen] = useState<boolean>(false);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    try {
      // Fetch schedules from Supabase
      const { data, error } = await supabase
        .from("academic_schedules")
        .select("*")
        .order("start_time", { ascending: true });

      if (error) throw error;
      setSchedules((data as AcademicSchedule[]) || []);
    } catch (err: any) {
      console.error("Gagal memuat jadwal akademik:", err);
      setStatusMsg({ type: "error", text: "Gagal memuat jadwal: " + (err.message || String(err)) });
    } finally {
      setLoading(false);
    }
  };

  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
    let cancelled = false;
    const load = async () => {
      if (cancelled) return;
      await fetchData();
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Lock body scroll when modal is open to prevent page scrolling behind it
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

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

  // 3. Fill leading days from next month to make full weeks (42 grid cells usually)
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

  const handleOpenAddModal = (dateStr?: string): void => {
    setSelectedChildSchedule(null);
    setSelectedDate(dateStr || getLocalDateString(new Date()));
    setModalOpen(true);
  };

  const handleOpenEditModal = (sched: AcademicSchedule, e: any): void => {
    e.stopPropagation(); // Prevent opening Add modal for that day
    setSelectedChildSchedule(sched);
    setSelectedDate(getLocalDateString(new Date(sched.start_time)));
    setModalOpen(true);
  };

  const handleSuccess = (msg: string) => {
    setStatusMsg({ type: "success", text: msg });
    setModalOpen(false);
    setAiPromptModalOpen(false);
    setTimeout(() => setStatusMsg({ type: "", text: "" }), 3000);
    fetchData();
  };

  const handleDeleteAllSchedules = async (): Promise<void> => {
    const confirm1 = confirm("Apakah Anda yakin ingin menghapus SELURUH agenda akademik yang ada di database?");
    if (!confirm1) return;

    const confirm2 = confirm("PERINGATAN: Tindakan ini akan menghapus semua jadwal kelas, kegiatan, dan hari libur secara permanen. Apakah Anda benar-benar yakin?");
    if (!confirm2) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("academic_schedules")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;

      setStatusMsg({ type: "success", text: "Berhasil menghapus seluruh agenda akademik." });
      setTimeout(() => setStatusMsg({ type: "", text: "" }), 3000);
      fetchData();
    } catch (err: any) {
      console.error("Gagal menghapus seluruh agenda:", err);
      setStatusMsg({ type: "error", text: "Gagal menghapus agenda: " + (err.message || String(err)) });
      setTimeout(() => setStatusMsg({ type: "", text: "" }), 4000);
    } finally {
      setLoading(false);
    }
  };

  // Helper to filter events occurring on a specific date string (YYYY-MM-DD)
  const getSchedulesForDay = (dateStr: string): AcademicSchedule[] => {
    return schedules.filter((s) => {
      const sDateStr = getLocalDateString(new Date(s.start_time));
      return sDateStr === dateStr;
    });
  };

  return (
    <div>
      <style>{`
        .calendar-layout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        @media (min-width: 1024px) {
          .calendar-layout-grid {
            grid-template-columns: 7.2fr 2.8fr;
          }
        }
        .calendar-cell-hover {
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }
        .calendar-cell-hover:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border-color: var(--color-primary) !important;
          z-index: 2;
        }
        .timeline-item-hover {
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }
        .timeline-item-hover:hover {
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
        }
        .btn-text-hover:hover {
          background-color: rgba(33, 108, 126, 0.08) !important;
        }
        .month-list-item {
          transition: all 0.15s ease !important;
        }
        .month-list-item:hover {
          background-color: rgba(0, 0, 0, 0.03) !important;
          transform: translateX(2px);
        }
      `}</style>

      <div className="dashboard-topbar">
        <div className="topbar-title">
          <h1>Kelola Jadwal & Kalender Akademik</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Buat jadwal kelas rutin, liburan sekolah, serta kegiatan bimbingan belajar Ibra Global English Bobong
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" className="btn-portal-outline" onClick={() => setAiPromptModalOpen(true)} style={{ border: "1px dashed var(--color-accent)", color: "var(--color-accent-dark)" }}>
            <span>✨ Susun via AI</span>
          </button>
          <button type="button" className="btn-portal-outline" onClick={() => setSyncModalOpen(true)}>
            <span>🔗 Sinkronkan ke HP</span>
          </button>
          <button type="button" className="btn-portal-outline" onClick={handleDeleteAllSchedules} style={{ borderColor: "#ef4444", color: "#ef4444" }}>
            <span>🗑️ Hapus Semua</span>
          </button>
          <button className="btn-portal-primary" onClick={() => handleOpenAddModal(selectedDate)}>
            <span>+ Tambah Agenda</span>
          </button>
        </div>
      </div>

      {statusMsg.text && (
        <div
          className={statusMsg.type === "success" ? "auth-success-banner" : "auth-error-banner"}
          style={{ marginBottom: "2rem" }}
        >
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Monthly Navigation Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", backgroundColor: "white", padding: "1rem 1.5rem", borderRadius: "16px", border: "1px solid rgba(0, 0, 0, 0.05)", boxShadow: "0 2px 8px rgba(0,0,0,0.01)" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-gray-900)" }}>
          {getMonthNameIndonesian(viewMonth)} {viewYear}
        </h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button 
            className="btn-portal-outline" 
            style={{ padding: "0.45rem 1rem", borderRadius: "8px" }} 
            onClick={() => navigateMonth("prev")}
            aria-label="Tampilkan bulan sebelumnya"
          >
            ◀ Bulan Lalu
          </button>
          <button 
            className="btn-portal-outline" 
            style={{ padding: "0.45rem 1rem", borderRadius: "8px" }} 
            onClick={() => setCurrentDate(new Date())}
            aria-label="Kembali ke hari ini"
          >
            Hari Ini
          </button>
          <button 
            className="btn-portal-outline" 
            style={{ padding: "0.45rem 1rem", borderRadius: "8px" }} 
            onClick={() => navigateMonth("next")}
            aria-label="Tampilkan bulan berikutnya"
          >
            Bulan Depan ▶
          </button>
        </div>
      </div>

      {/* Main Calendar Content Grid */}
      {loading || !mounted ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gray-500)" }}>
          <p>Memuat kalender akademik...</p>
        </div>
      ) : (
        <div className="calendar-layout-grid">
          {/* LEFT COLUMN: Month Grid */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid rgba(0, 0, 0, 0.05)", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)", padding: "1.25rem", overflowX: "auto" }}>
            <div style={{ minWidth: "650px" }}>
              
              {/* Calendar Grid Container */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(7, 1fr)", 
                gap: "4px", 
                backgroundColor: "var(--color-gray-50)", 
                borderRadius: "10px",
                padding: "4px"
              }}>
                {/* Weekdays Row */}
                {["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((day, idx) => (
                  <div 
                    key={day} 
                    style={{ 
                      textAlign: "center", 
                      fontWeight: "800", 
                      color: idx === 0 || idx === 6 ? "var(--color-accent)" : "var(--color-gray-600)", 
                      fontSize: "0.82rem", 
                      padding: "0.5rem 0.25rem",
                      marginBottom: "4px"
                    }}
                  >
                    {day}
                  </div>
                ))}

                {/* Grid Cells */}
                {calendarDays.map((cell, idx) => {
                  const daySchedules = getSchedulesForDay(cell.dateString);
                  const isToday = cell.dateString === getLocalDateString(new Date());
                  const isSelected = cell.dateString === selectedDate;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(cell.dateString)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Pilih tanggal ${cell.day} ${getMonthNameIndonesian(cell.month)} ${cell.year}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedDate(cell.dateString);
                        }
                      }}
                      style={{
                        minHeight: "110px",
                        backgroundColor: cell.isCurrentMonth 
                          ? (isSelected ? "rgba(33, 108, 126, 0.02)" : "white") 
                          : "var(--color-gray-50)",
                        padding: "0.5rem",
                        border: isSelected 
                          ? "2px solid var(--color-primary)" 
                          : isToday 
                            ? "2px dashed var(--color-primary-light)" 
                            : "1px solid rgba(0, 0, 0, 0.04)",
                        boxShadow: isSelected ? "0 0 0 3px rgba(33, 108, 126, 0.12)" : "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        position: "relative"
                      }}
                      className="calendar-cell-hover"
                    >
                      {/* Day Number */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                        <span style={{
                          fontSize: "0.85rem",
                          fontWeight: "800",
                          color: isToday 
                            ? "white" 
                            : cell.isCurrentMonth 
                              ? (isSelected ? "var(--color-primary)" : "var(--color-gray-800)") 
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
                        {isToday && (
                          <span style={{ fontSize: "0.6rem", color: "var(--color-primary)", fontWeight: "800" }}>Kini</span>
                        )}
                      </div>

                      {/* Schedules inside day cell */}
                      <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
                        {daySchedules.slice(0, 3).map((s) => {
                          let color = "var(--color-primary)";
                          let bg = "rgba(33, 108, 126, 0.04)";

                          if (s.type === "holiday") {
                            color = "#ef4444";
                            bg = "rgba(239, 68, 68, 0.04)";
                          } else if (s.type === "event") {
                            color = "var(--color-accent)";
                            bg = "rgba(166, 136, 73, 0.04)";
                          }

                          const cleanTimeStr = new Date(s.start_time).toTimeString().slice(0, 5);

                          return (
                            <div
                              key={s.id}
                              onClick={(e) => handleOpenEditModal(s, e)}
                              role="button"
                              tabIndex={0}
                              aria-label={`Agenda: ${s.title}, Jam: ${cleanTimeStr}. Tekan Enter untuk mengubah.`}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleOpenEditModal(s, e);
                                }
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                backgroundColor: bg,
                                color: "var(--color-gray-800)",
                                borderLeft: `3px solid ${color}`,
                                padding: "0.2rem 0.4rem",
                                borderRadius: "0 4px 4px 0",
                                fontSize: "0.7rem",
                                fontWeight: "700",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                cursor: "pointer",
                                margin: "1px 0"
                              }}
                              title={`${s.title} (${cleanTimeStr})`}
                            >
                              <span style={{ color: color, fontSize: "0.65rem", fontWeight: "800" }}>{cleanTimeStr}</span>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</span>
                            </div>
                          );
                        })}
                        {daySchedules.length > 3 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewAllDate(cell.dateString);
                            }}
                            style={{ 
                              fontSize: "0.65rem", 
                              fontWeight: "800", 
                              color: "var(--color-primary-dark)", 
                              backgroundColor: "rgba(33, 108, 126, 0.05)",
                              borderRadius: "4px",
                              padding: "0.15rem 0.25rem",
                              textAlign: "center",
                              border: "1px dashed var(--color-primary)",
                              cursor: "pointer",
                              width: "100%",
                              display: "block",
                              marginTop: "2px"
                            }}
                          >
                            + {daySchedules.length - 3} lagi
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
          
          {/* RIGHT COLUMN: Sidebar Day/Month Timeline Agenda */}
          <div>
            <ScheduleList 
              schedules={schedules}
              viewYear={viewYear}
              viewMonth={viewMonth}
              selectedDate={selectedDate}
              onEdit={handleOpenEditModal}
              onAddEvent={handleOpenAddModal}
            />
          </div>
        </div>
      )}

      {/* VIEW ALL AGENDA FOR SPECIFIC DAY MODAL */}
      {viewAllDate && (
        <div className="portal-modal-overlay" onClick={() => setViewAllDate(null)}>
          <div className="portal-modal" style={{
            maxWidth: "450px",
            padding: "1.5rem",
            animation: "slideIn 0.2s ease"
          }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--color-gray-900)", margin: 0 }}>
                📅 Agenda: {new Date(viewAllDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
              <button 
                type="button" 
                onClick={() => setViewAllDate(null)}
                style={{ background: "transparent", border: "none", fontSize: "1.5rem", fontWeight: "800", color: "var(--color-gray-400)", cursor: "pointer" }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto", padding: "0.25rem 0" }}>
              {getSchedulesForDay(viewAllDate).map((s) => {
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
                    onClick={(e) => {
                      setViewAllDate(null);
                      handleOpenEditModal(s, e);
                    }}
                    role="button"
                    tabIndex={0}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.6rem 0.8rem",
                      borderRadius: "6px",
                      backgroundColor: badgeBg,
                      color: badgeColor,
                      cursor: "pointer",
                      fontWeight: "700",
                      fontSize: "0.82rem",
                      border: "1px solid rgba(0,0,0,0.05)"
                    }}
                  >
                    <span>{cleanTimeStr} - {s.title} ({s.program})</span>
                    <span style={{ fontSize: "0.75rem", opacity: 0.85 }}>⚙️ Ubah</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button type="button" className="btn-portal-outline" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }} onClick={() => setViewAllDate(null)}>
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL FORM: ADD / EDIT SCHEDULE */}
      <AddEditScheduleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        selectedSchedule={selectedSchedule}
        initialDateStr={selectedDate}
      />

      {/* SYNC TO MOBILE PHONE MODAL */}
      <SyncModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
      />

      {/* AI SCHEDULER PROTO-MODAL */}
      <AiSchedulerModal
        isOpen={aiPromptModalOpen}
        onClose={() => setAiPromptModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
