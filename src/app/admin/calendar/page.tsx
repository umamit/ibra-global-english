"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import ScheduleList from "./ScheduleList";
import SyncModal from "./components/SyncModal";
import AiSchedulerModal from "./components/AiSchedulerModal";
import AddEditScheduleModal from "./components/AddEditScheduleModal";
import QuickPendingModal from "./components/QuickPendingModal";
import PendingSchedulesCard from "./components/PendingSchedulesCard";
import CalendarTopbar from "./components/CalendarTopbar";
import CalendarGrid from "./components/CalendarGrid";
import ViewAllModal from "./components/ViewAllModal";
import ScheduleTooltip from "./components/ScheduleTooltip";
import { useCalendarData, AcademicSchedule, getLocalDateString, getMonthNameIndonesian } from "./hooks/useCalendarData";
import { buildCalendarDays, getSchedulesForDay } from "./calendarHelpers";
import "./calendar.css";

export default function AdminCalendar() {
  const {
    schedules,
    loading,
    mounted,
    statusMsg,
    setStatusMsg,
    fetchData,
    clearStatus,
    handleDeleteAllSchedules,
  } = useCalendarData();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const viewYear = currentDate.getFullYear();
  const viewMonth = currentDate.getMonth();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedSchedule, setSelectedSchedule] = useState<AcademicSchedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateString(new Date()));
  const [viewAllDate, setViewAllDate] = useState<string | null>(null);
  const [syncModalOpen, setSyncModalOpen] = useState<boolean>(false);
  const [aiPromptModalOpen, setAiPromptModalOpen] = useState<boolean>(false);
  const [quickPendingModalOpen, setQuickPendingModalOpen] = useState<boolean>(false);
  const [filterProgram, setFilterProgram] = useState<string>("All");
  const [hoveredSchedule, setHoveredSchedule] = useState<AcademicSchedule | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (modalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  const calendarDays = buildCalendarDays(viewYear, viewMonth);

  const handleOpenAddModal = (dateStr?: string) => {
    setSelectedSchedule(null);
    setSelectedDate(dateStr || getLocalDateString(new Date()));
    setModalOpen(true);
  };

  const handleOpenEditModal = (sched: AcademicSchedule, e: React.MouseEvent | any) => {
    e.stopPropagation();
    setSelectedSchedule(sched);
    setSelectedDate(getLocalDateString(new Date(sched.start_time)));
    setModalOpen(true);
  };

  const handleSuccess = (msg: string) => {
    setStatusMsg({ type: "success", text: msg });
    setModalOpen(false);
    setAiPromptModalOpen(false);
    clearStatus();
    fetchData();
  };

  const handleDownloadCSV = () => {
    const filtered = schedules.filter((s) => {
      const sDate = new Date(s.start_time);
      const isSameMonth = sDate.getFullYear() === viewYear && sDate.getMonth() === viewMonth;
      if (!isSameMonth) return false;
      if (filterProgram !== "All") return s.title === filterProgram || s.program === filterProgram;
      return true;
    });

    if (filtered.length === 0) {
      alert("Tidak ada jadwal untuk program/bulan ini yang bisa diunduh.");
      return;
    }

    const headers = ["Hari", "Tanggal", "Jam Mulai", "Jam Selesai", "Nama Agenda/Kelas", "Program", "Keterangan", "Pengajar"];
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const rows = filtered.map((s) => {
      const date = new Date(s.start_time);
      const dateEnd = new Date(s.end_time);
      return [
        dayNames[date.getDay()],
        `"${date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}"`,
        date.toTimeString().slice(0, 5),
        dateEnd.toTimeString().slice(0, 5),
        `"${s.title.replace(/"/g, '""')}"`,
        `"${s.program.replace(/"/g, '""')}"`,
        `"${(s.description || "").replace(/"/g, '""')}"`,
        `"${(s.instructor || "").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const monthName = getMonthNameIndonesian(viewMonth);
    const formattedProgram = filterProgram.replace(/[^a-zA-Z0-9]/g, "_");
    link.setAttribute("href", url);
    link.setAttribute("download", `jadwal_ibra_${formattedProgram}_${monthName}_${viewYear}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateDB = async () => {
    try {
      setStatusMsg({ type: "success", text: "Memperbarui struktur database..." });
      const res = await fetch("/api/admin/run-migration", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setStatusMsg({ type: "success", text: "Struktur database berhasil diperbarui! Silakan simpan jadwal kembali." });
      } else {
        setStatusMsg({ type: "error", text: "Perhatian: " + (json.error || "Gagal otomatis, harap jalankan SQL script.") });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Gagal memperbarui DB: " + err.message });
    }
  };

  const filteredSchedules =
    filterProgram === "All"
      ? schedules
      : schedules.filter((s) => s.title === filterProgram || s.program === filterProgram);

  return (
    <div>
      {/* Printable header (only visible in print) */}
      <div className="printable-calendar-header" style={{ display: "none" }}>
        <h2 style={{ fontSize: "1.45rem", fontWeight: "900", textAlign: "center", color: "#1f2937", margin: "0 0 0.5rem 0", textTransform: "uppercase" }}>
          JADWAL KEGIATAN BELAJAR - IBRA GLOBAL ENGLISH
        </h2>
        <h3 style={{ fontSize: "1.2rem", fontWeight: "700", textAlign: "center", color: "#4b5563", margin: "0 0 1.5rem 0" }}>
          Program/Level: {filterProgram === "All" ? "Semua Program" : filterProgram} ({getMonthNameIndonesian(viewMonth)} {viewYear})
        </h3>
      </div>

      <CalendarTopbar
        viewMonth={viewMonth}
        viewYear={viewYear}
        filterProgram={filterProgram}
        onFilterChange={setFilterProgram}
        onNavigate={(dir) => setCurrentDate(new Date(viewYear, dir === "prev" ? viewMonth - 1 : viewMonth + 1, 1))}
        onGoToday={() => setCurrentDate(new Date())}
        onDownloadCSV={handleDownloadCSV}
        onAddAgenda={() => handleOpenAddModal(selectedDate)}
        onAiScheduler={() => setAiPromptModalOpen(true)}
        onSync={() => setSyncModalOpen(true)}
        onDeleteAll={handleDeleteAllSchedules}
        onPendingModal={() => setQuickPendingModalOpen(true)}
        onUpdateDB={handleUpdateDB}
      />

      {statusMsg.text && (
        <div className={statusMsg.type === "success" ? "auth-success-banner" : "auth-error-banner"} style={{ marginBottom: "2rem" }}>
          <span>{statusMsg.text}</span>
        </div>
      )}

      {loading || !mounted ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gray-500)" }}>
          <p>Memuat kalender akademik...</p>
        </div>
      ) : (
        <div className="calendar-layout-grid calendar-animate-change" key={`${viewMonth}-${viewYear}`}>
          <CalendarGrid
            calendarDays={calendarDays}
            schedules={schedules}
            filterProgram={filterProgram}
            selectedDate={selectedDate}
            viewMonth={viewMonth}
            viewYear={viewYear}
            onSelectDate={setSelectedDate}
            onEditSchedule={handleOpenEditModal}
            onViewAll={setViewAllDate}
            onHoverSchedule={(s, pos) => {
              setHoveredSchedule(s);
              if (s) setTooltipPos(pos);
            }}
          />
          <div>
            <ScheduleList
              schedules={filteredSchedules}
              viewYear={viewYear}
              viewMonth={viewMonth}
              selectedDate={selectedDate}
              onEdit={handleOpenEditModal}
              onAddEvent={handleOpenAddModal}
            />
          </div>
        </div>
      )}

      <PendingSchedulesCard
        schedules={schedules}
        onRefresh={fetchData}
        onOpenQuickModal={() => setQuickPendingModalOpen(true)}
      />

      <QuickPendingModal
        isOpen={quickPendingModalOpen}
        onClose={() => setQuickPendingModalOpen(false)}
        onSuccess={(msg) => {
          setStatusMsg({ type: "success", text: msg });
          fetchData();
        }}
      />

      <ViewAllModal
        viewAllDate={viewAllDate}
        onClose={() => setViewAllDate(null)}
        schedulesForDay={viewAllDate ? getSchedulesForDay(schedules, viewAllDate, filterProgram) : []}
        onEditSchedule={handleOpenEditModal}
      />

      <AddEditScheduleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        selectedSchedule={selectedSchedule}
        initialDateStr={selectedDate}
      />

      <SyncModal isOpen={syncModalOpen} onClose={() => setSyncModalOpen(false)} />

      <AiSchedulerModal
        isOpen={aiPromptModalOpen}
        onClose={() => setAiPromptModalOpen(false)}
        onSuccess={handleSuccess}
      />

      {hoveredSchedule && (
        <ScheduleTooltip hoveredSchedule={hoveredSchedule} tooltipPos={tooltipPos} />
      )}
    </div>
  );
}
