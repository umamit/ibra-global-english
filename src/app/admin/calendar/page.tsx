"use client";

export const dynamic = 'force-dynamic';

import React from 'react';
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import ScheduleList from "./ScheduleList";

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

  // Form fields
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [type, setType] = useState<string>("class"); // 'class', 'event', 'holiday'
  const [program, setProgram] = useState<string>("All"); // 'Kids Program', 'Teens Program', 'Fun Calistung', 'All'
  const [startDate, setStartDate] = useState<string>(""); // YYYY-MM-DD
  const [startTime, setStartTime] = useState<string>("09:00"); // HH:MM
  const [endDate, setEndDate] = useState<string>(""); // YYYY-MM-DD
  const [endTime, setEndTime] = useState<string>("10:30"); // HH:MM
  const [instructor, setInstructor] = useState<string>("");

  // Recurrence states
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurrenceType, setRecurrenceType] = useState<string>("weekly"); // 'weekly', 'daily'
  const [recurrenceCount, setRecurrenceCount] = useState<number>(4);
  const [recurrenceId, setRecurrenceId] = useState<string | null>(null);
  const [editSeriesMode, setEditSeriesMode] = useState<"single" | "series">("single");
  const [viewAllDate, setViewAllDate] = useState<string | null>(null);

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
    setTitle("");
    setDescription("");
    setType("class");
    setProgram("All");
    const defaultDate = dateStr || getLocalDateString(new Date());
    setStartDate(defaultDate);
    setStartTime("09:00");
    setEndDate(defaultDate);
    setEndTime("10:30");
    setInstructor("");
    setIsRecurring(false);
    setRecurrenceType("weekly");
    setRecurrenceCount(4);
    setRecurrenceId(null);
    setEditSeriesMode("single");
    setModalOpen(true);
  };

  const handleOpenEditModal = (sched: AcademicSchedule, e: any): void => {
    e.stopPropagation(); // Prevent opening Add modal for that day
    setSelectedChildSchedule(sched);
    setTitle(sched.title);
    setDescription(sched.description || "");
    setType(sched.type);
    setProgram(sched.program || "All");
    
    const startObj = new Date(sched.start_time);
    const endObj = new Date(sched.end_time);

    setStartDate(getLocalDateString(startObj));
    setStartTime(startObj.toTimeString().slice(0, 5));
    setEndDate(getLocalDateString(endObj));
    setEndTime(endObj.toTimeString().slice(0, 5));
    setInstructor(sched.instructor || "");
    setIsRecurring(false);
    setRecurrenceType("weekly");
    setRecurrenceCount(4);
    setRecurrenceId(sched.recurrence_id || null);
    setEditSeriesMode("single");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!title.trim() || !startDate || !startTime || !endDate || !endTime) {
      alert("Harap lengkapi semua isian wajib.");
      return;
    }

    const startISO = new Date(`${startDate}T${startTime}:00`).toISOString();
    const endISO = new Date(`${endDate}T${endTime}:00`).toISOString();

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      type,
      program,
      start_time: startISO,
      end_time: endISO,
      instructor: instructor.trim() || null
    };

    try {
      if (selectedSchedule) {
        // Edit Mode
        if (selectedSchedule.recurrence_id && editSeriesMode === "series") {
          // 1. Update the selected schedule (all fields)
          const { error: currentError } = await supabase
            .from("academic_schedules")
            .update({
              ...payload,
              recurrence_id: selectedSchedule.recurrence_id
            })
            .eq("id", selectedSchedule.id);

          if (currentError) throw currentError;

          // 2. Update other items in the same series (info fields only)
          const infoPayload = {
            title: title.trim(),
            description: description.trim() || null,
            type,
            program,
            instructor: instructor.trim() || null
          };
          const { error: seriesError } = await supabase
            .from("academic_schedules")
            .update(infoPayload)
            .eq("recurrence_id", selectedSchedule.recurrence_id)
            .neq("id", selectedSchedule.id);

          if (seriesError) throw seriesError;
          setStatusMsg({ type: "success", text: "Seluruh seri jadwal berhasil diperbarui!" });
        } else {
          // Edit single
          let finalRecurrenceId = selectedSchedule.recurrence_id || null;
          let recurrInsertPayloads: any[] = [];

          // Guard: Saat mode edit, JANGAN buat jadwal baru dari recurrence
          // isRecurring hanya boleh membuat jadwal baru saat tambah (selectedSchedule === null)
          if (!selectedSchedule.recurrence_id && isRecurring) {
            // Making a single event recurring
            finalRecurrenceId = "rec_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11);
            
            const baseStart = new Date(`${startDate}T${startTime}:00`);
            const baseEnd = new Date(`${endDate}T${endTime}:00`);

            for (let i = 1; i < recurrenceCount; i++) {
              const currentStart = new Date(baseStart);
              const currentEnd = new Date(baseEnd);

              if (recurrenceType === "weekly") {
                currentStart.setDate(baseStart.getDate() + (i * 7));
                currentEnd.setDate(baseEnd.getDate() + (i * 7));
              } else if (recurrenceType === "daily") {
                currentStart.setDate(baseStart.getDate() + i);
                currentEnd.setDate(baseEnd.getDate() + i);
              }

              recurrInsertPayloads.push({
                title: title.trim(),
                description: description.trim() || null,
                type,
                program,
                start_time: currentStart.toISOString(),
                end_time: currentEnd.toISOString(),
                instructor: instructor.trim() || null,
                recurrence_id: finalRecurrenceId
              });
            }
          }

          const { error } = await supabase
            .from("academic_schedules")
            .update({
              ...payload,
              recurrence_id: finalRecurrenceId
            })
            .eq("id", selectedSchedule.id);

          if (error) throw error;

          if (recurrInsertPayloads.length > 0) {
            const { error: insertError } = await supabase
              .from("academic_schedules")
              .insert(recurrInsertPayloads);
            if (insertError) throw insertError;
            setStatusMsg({ type: "success", text: `Jadwal diperbarui dan ${recurrInsertPayloads.length} perulangan baru dibuat!` });
          } else {
            setStatusMsg({ type: "success", text: "Jadwal belajar berhasil diperbarui!" });
          }
        }
      } else {
        // Insert Mode
        if (isRecurring) {
          const payloads = [];
          const newRecurrenceId = "rec_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11);
          const baseStart = new Date(`${startDate}T${startTime}:00`);
          const baseEnd = new Date(`${endDate}T${endTime}:00`);

          for (let i = 0; i < recurrenceCount; i++) {
            const currentStart = new Date(baseStart);
            const currentEnd = new Date(baseEnd);

            if (recurrenceType === "weekly") {
              currentStart.setDate(baseStart.getDate() + (i * 7));
              currentEnd.setDate(baseEnd.getDate() + (i * 7));
            } else if (recurrenceType === "daily") {
              currentStart.setDate(baseStart.getDate() + i);
              currentEnd.setDate(baseEnd.getDate() + i);
            }

            payloads.push({
              title: title.trim(),
              description: description.trim() || null,
              type,
              program,
              start_time: currentStart.toISOString(),
              end_time: currentEnd.toISOString(),
              instructor: instructor.trim() || null,
              recurrence_id: newRecurrenceId
            });
          }

          const { error } = await supabase
            .from("academic_schedules")
            .insert(payloads);

          if (error) throw error;
          setStatusMsg({ type: "success", text: `${recurrenceCount} jadwal baru berhasil dibuat secara berkala!` });
        } else {
          const { error } = await supabase
            .from("academic_schedules")
            .insert(payload);

          if (error) throw error;
          setStatusMsg({ type: "success", text: "Jadwal baru berhasil dibuat!" });
        }
      }

      setModalOpen(false);
      setTimeout(() => setStatusMsg({ type: "", text: "" }), 3000);
      fetchData();
    } catch (err: any) {
      console.error("Gagal menyimpan jadwal:", err);
      alert("Gagal menyimpan jadwal: " + (err.message || String(err)));
    }
  };

  const handleDeleteSchedule = async (): Promise<void> => {
    if (!selectedSchedule) return;

    let deleteMode: "single" | "series" | "cancel" = "single";

    if (selectedSchedule.recurrence_id) {
      const confirmResult = confirm(
        `Agenda "${selectedSchedule.title}" adalah bagian dari seri berulang.\n\n` +
        `Apakah Anda ingin MENGHAPUS SELURUH SERI agenda berulang ini?\n\n` +
        `• Klik OK / Yes untuk menghapus seluruh seri.\n` +
        `• Klik Batal / Cancel untuk menghapus agenda hari ini saja.`
      );
      
      if (confirmResult) {
        deleteMode = "series";
      } else {
        const confirmSingle = confirm(`Apakah Anda yakin ingin menghapus agenda "${selectedSchedule.title}" HANYA untuk hari ini saja?`);
        if (confirmSingle) {
          deleteMode = "single";
        } else {
          deleteMode = "cancel";
        }
      }
    } else {
      const confirmNormal = confirm(`Apakah Anda yakin ingin menghapus agenda "${selectedSchedule.title}"?`);
      if (!confirmNormal) deleteMode = "cancel";
    }

    if (deleteMode === "cancel") return;

    try {
      let query = supabase.from("academic_schedules").delete();
      
      if (deleteMode === "series" && selectedSchedule.recurrence_id) {
        query = query.eq("recurrence_id", selectedSchedule.recurrence_id);
      } else {
        query = query.eq("id", selectedSchedule.id);
      }

      const { error } = await query;
      if (error) throw error;

      setStatusMsg({ 
        type: "success", 
        text: deleteMode === "series" ? "Seluruh seri jadwal berhasil dihapus." : "Jadwal berhasil dihapus." 
      });
      setModalOpen(false);
      setTimeout(() => setStatusMsg({ type: "", text: "" }), 3000);
      fetchData();
    } catch (err: any) {
      console.error("Gagal menghapus jadwal:", err);
      alert("Gagal menghapus jadwal: " + (err.message || String(err)));
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
      <div className="dashboard-topbar">
        <div className="topbar-title">
          <h1>Kelola Jadwal & Kalender Akademik</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Buat jadwal kelas rutin, liburan sekolah, serta kegiatan bimbingan belajar Ibra Global English Bobong
          </p>
        </div>
        <button className="btn-portal-primary" onClick={() => handleOpenAddModal()}>
          <span>+ Tambah Agenda</span>
        </button>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", backgroundColor: "white", padding: "1rem 1.5rem", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-sm)" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-gray-900)" }}>
          {getMonthNameIndonesian(viewMonth)} {viewYear}
        </h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button 
            className="btn-portal-outline" 
            style={{ padding: "0.45rem 1rem" }} 
            onClick={() => navigateMonth("prev")}
            aria-label="Tampilkan bulan sebelumnya"
          >
            ◀ Bulan Lalu
          </button>
          <button 
            className="btn-portal-outline" 
            style={{ padding: "0.45rem 1rem" }} 
            onClick={() => setCurrentDate(new Date())}
            aria-label="Kembali ke hari ini"
          >
            Hari Ini
          </button>
          <button 
            className="btn-portal-outline" 
            style={{ padding: "0.45rem 1rem" }} 
            onClick={() => navigateMonth("next")}
            aria-label="Tampilkan bulan berikutnya"
          >
            Bulan Depan ▶
          </button>
        </div>
      </div>

      {/* Main Calendar Month Grid */}
      {loading || !mounted ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gray-500)" }}>
          <p>Memuat kalender akademik...</p>
        </div>
      ) : (
        <>
          <div style={{ backgroundColor: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)", padding: "1.5rem", overflowX: "auto" }}>
          <div style={{ minWidth: "700px" }}>
            
            {/* Calendar Grid Container */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(7, 1fr)", 
              gap: "4px", 
              backgroundColor: "var(--color-gray-100)", 
              borderRadius: "12px",
              padding: "6px"
            }}>
              {/* Weekdays Row */}
              {["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((day, idx) => (
                <div 
                  key={day} 
                  style={{ 
                    textAlign: "center", 
                    fontWeight: "800", 
                    color: idx === 0 || idx === 6 ? "var(--color-accent)" : "var(--color-gray-600)", 
                    fontSize: "0.9rem", 
                    padding: "0.6rem 0.25rem",
                    backgroundColor: "var(--color-gray-200)",
                    borderRadius: "6px",
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

                return (
                  <div
                    key={idx}
                    onClick={() => handleOpenAddModal(cell.dateString)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Tambah agenda untuk tanggal ${cell.day} ${getMonthNameIndonesian(cell.month)} ${cell.year}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleOpenAddModal(cell.dateString);
                      }
                    }}
                    style={{
                      minHeight: "120px",
                      backgroundColor: cell.isCurrentMonth ? "white" : "var(--color-gray-50)",
                      padding: "0.5rem",
                      border: isToday ? "2px solid var(--color-primary)" : "1px solid var(--color-gray-200)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "transform 0.15s ease",
                      position: "relative"
                    }}
                    className="calendar-cell-hover"
                  >
                    {/* Day Number */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{
                        fontSize: "0.9rem",
                        fontWeight: "800",
                        color: isToday 
                          ? "white" 
                          : cell.isCurrentMonth 
                            ? "var(--color-gray-800)" 
                            : "var(--color-gray-400)",
                        backgroundColor: isToday ? "var(--color-primary)" : "transparent",
                        width: isToday ? "26px" : "auto",
                        height: isToday ? "26px" : "auto",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        {cell.day}
                      </span>
                      {isToday && (
                        <span style={{ fontSize: "0.65rem", color: "var(--color-primary)", fontWeight: "800" }}>Kini</span>
                      )}
                    </div>

                    {/* Schedules inside day cell */}
                    <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "4px", overflow: "hidden" }}>
                      {daySchedules.slice(0, 3).map((s) => {
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
                              backgroundColor: badgeBg,
                              color: badgeColor,
                              padding: "0.25rem 0.5rem",
                              borderRadius: "4px",
                              fontSize: "0.72rem",
                              fontWeight: "700",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              boxShadow: "var(--shadow-sm)",
                              cursor: "pointer"
                            }}
                            title={`${s.title} (${cleanTimeStr})`}
                          >
                            <span style={{ opacity: 0.85, marginRight: "4px" }}>{cleanTimeStr}</span>
                            <span>{s.title}</span>
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
                            fontSize: "0.68rem", 
                            fontWeight: "800", 
                            color: "var(--color-primary-dark)", 
                            backgroundColor: "var(--color-primary-light)",
                            borderRadius: "4px",
                            padding: "0.25rem 0.25rem",
                            textAlign: "center",
                            border: "1px dashed var(--color-primary)",
                            cursor: "pointer",
                            width: "100%",
                            display: "block",
                            boxShadow: "var(--shadow-sm)"
                          }}
                        >
                          + {daySchedules.length - 3} agenda lagi
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
        
        {/* LIST VIEW FOR EASY MANUAL EDIT/DELETE */}
        <ScheduleList 
          schedules={schedules}
          viewYear={viewYear}
          viewMonth={viewMonth}
          onEdit={handleOpenEditModal}
        />
        </>
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
      {modalOpen && (
        <div className="portal-modal-overlay">
          <div className="portal-modal" style={{
            maxWidth: "600px",
            padding: "2rem",
            animation: "slideIn 0.2s ease"
          }}>
            <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-gray-900)", marginBottom: "1.5rem" }}>
              {selectedSchedule ? "Perbarui Agenda Kelas / Kegiatan" : "Tambah Agenda Kalender Baru"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Judul Agenda (Wajib)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Kids Program - Kelas A Rutin"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Deskripsi Agenda</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: "60px", fontFamily: "inherit" }}
                  placeholder="Keterangan singkat tentang kegiatan belajar-mengajar..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-grid" style={{ marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Tipe Agenda</label>
                  <select
                    className="form-input"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="class">📚 Kelas Rutin (Class)</option>
                    <option value="event">🌟 Kegiatan Khusus (Special Event)</option>
                    <option value="holiday">🔴 Hari Libur (Holiday)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Program Belajar Sasaran</label>
                  <select
                    className="form-input"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                  >
                    <option value="All">Semua Program (All)</option>
                    <option value="Kids Program">Kids Program (5-12 tahun)</option>
                    <option value="Teens Program">Teens Program (13-17 tahun)</option>
                    <option value="Fun Calistung">Fun Calistung (5-7 tahun)</option>
                  </select>
                </div>
              </div>

              {/* Date & Time Grid */}
              <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Tanggal Mulai</label>
                  <input
                    type="date"
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Jam Mulai</label>
                  <input
                    type="time"
                    className="form-input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div className="form-group">
                  <label className="form-label">Tanggal Selesai</label>
                  <input
                    type="date"
                    className="form-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Jam Selesai</label>
                  <input
                    type="time"
                    className="form-input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "2rem" }}>
                <label className="form-label">Tutor Pendamping / Instructor</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Coach Husni"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                />
              </div>

              {/* Pilihan Ulangi / Edit Seri Agenda */}
              {selectedSchedule && selectedSchedule.recurrence_id ? (
                <div style={{ 
                  marginBottom: "2rem", 
                  padding: "1rem", 
                  backgroundColor: "rgba(166, 136, 73, 0.05)", 
                  borderRadius: "var(--radius-md)", 
                  border: "1px solid var(--color-accent-light)" 
                }}>
                  <p style={{ fontWeight: "800", fontSize: "0.9rem", color: "var(--color-gray-800)", marginBottom: "0.5rem" }}>
                    🔄 Agenda ini adalah bagian dari seri berulang.
                  </p>
                  <label className="form-label" style={{ marginBottom: "0.5rem" }}>Terapkan Perubahan Ke:</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-700)" }}>
                      <input
                        type="radio"
                        name="editSeriesMode"
                        value="single"
                        checked={editSeriesMode === "single"}
                        onChange={() => setEditSeriesMode("single")}
                        style={{ accentColor: "var(--color-primary)" }}
                      />
                      <span>Hanya agenda terpilih ini</span>
                    </label>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-700)" }}>
                      <input
                        type="radio"
                        name="editSeriesMode"
                        value="series"
                        checked={editSeriesMode === "series"}
                        onChange={() => setEditSeriesMode("series")}
                        style={{ accentColor: "var(--color-primary)" }}
                      />
                      <span>Seluruh seri agenda berulang ini (Update Judul, Deskripsi, Program, Tutor, & Tipe)</span>
                    </label>
                  </div>
                </div>
              ) : selectedSchedule ? (
                /* Mode Edit jadwal tunggal: sembunyikan opsi recurrence agar tidak membuat jadwal baru */
                null
              ) : (
                /* Mode Tambah Baru: tampilkan opsi recurrence */
                <div style={{ 
                  marginBottom: "2rem", 
                  padding: "1rem", 
                  backgroundColor: "var(--color-gray-50)", 
                  borderRadius: "var(--radius-md)", 
                  border: "1px solid var(--color-gray-200)" 
                }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: "700", fontSize: "0.9rem", color: "var(--color-gray-800)" }}>
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      style={{ accentColor: "var(--color-primary)", width: "16px", height: "16px" }}
                    />
                    <span>Ulangi agenda ini (Recurrence)</span>
                  </label>

                  {isRecurring && (
                    <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: "0.8rem" }}>Frekuensi Ulang</label>
                        <select
                          className="form-input"
                          style={{ padding: "0.5rem", fontSize: "0.85rem" }}
                          value={recurrenceType}
                          onChange={(e) => setRecurrenceType(e.target.value)}
                        >
                          <option value="weekly">📅 Setiap Minggu (Hari yang sama)</option>
                          <option value="daily">📆 Setiap Hari</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: "0.8rem" }}>Jumlah Perulangan</label>
                        <input
                          type="number"
                          className="form-input"
                          style={{ padding: "0.5rem", fontSize: "0.85rem" }}
                          min="2"
                          max="12"
                          value={recurrenceCount}
                          onChange={(e) => setRecurrenceCount(parseInt(e.target.value) || 2)}
                          required={isRecurring}
                        />
                        <span style={{ fontSize: "0.7rem", color: "var(--color-gray-400)" }}>Maksimal 12 kali perulangan</span>
                      </div>
                    </div>
                  )}
                </div>
              )}


              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  {selectedSchedule && (
                    <button type="button" className="btn-portal-danger" onClick={handleDeleteSchedule}>
                      Hapus Agenda
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button type="button" className="btn-portal-outline" onClick={() => setModalOpen(false)}>
                    Batal
                  </button>
                  <button type="submit" className="btn-portal-primary">
                    <span>{selectedSchedule ? "Simpan Perubahan" : "Terbitkan Jadwal"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
