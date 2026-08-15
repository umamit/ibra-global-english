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
import CalendarSplitView from "./components/CalendarSplitView";
import ViewAllModal from "./components/ViewAllModal";
import ScheduleTooltip from "./components/ScheduleTooltip";
import { useCalendarData, AcademicSchedule, getLocalDateString, getMonthNameIndonesian } from "./hooks/useCalendarData";
import { buildCalendarDays, getSchedulesForDay } from "./calendarHelpers";
import "./calendar.css";

export default function AdminCalendar() {
  const {
    schedules,
    students,
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

  const [viewMode, setViewMode] = useState<"split" | "month">("split");
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

  const handleOpenEditModal = (s: AcademicSchedule, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSchedule(s);
    setSelectedDate(s.start_time.split("T")[0]);
    setModalOpen(true);
  };

  const handleNavigate = (dir: "prev" | "next") => {
    setCurrentDate(new Date(viewYear, dir === "prev" ? viewMonth - 1 : viewMonth + 1, 1));
  };

  const handleDownloadCSV = () => {
    if (schedules.length === 0) return alert("Tidak ada data jadwal untuk diunduh.");
    const headers = ["ID", "Title", "Program", "Type", "Start Time", "End Time", "Instructor", "Description"];
    const rows = schedules.map((s) => [
      s.id, s.title, s.program, s.type, s.start_time, s.end_time, s.instructor || "", s.description || "",
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.map(cell => `"${cell}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kalender_akademik_${getLocalDateString(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateDB = async () => {
    alert("Database disinkronkan.");
  };

  return (
    <div>
      <PendingSchedulesCard
        schedules={schedules}
        onRefresh={fetchData}
        onOpenQuickModal={() => setQuickPendingModalOpen(true)}
      />

      <CalendarTopbar
        viewMonth={viewMonth}
        viewYear={viewYear}
        viewMode={viewMode}
        filterProgram={filterProgram}
        onNavigate={handleNavigate}
        onGoToday={() => setCurrentDate(new Date())}
        onViewModeChange={setViewMode}
        onFilterChange={setFilterProgram}
        onDownloadCSV={handleDownloadCSV}
        onAddAgenda={() => handleOpenAddModal(selectedDate)}
        onAiScheduler={() => setAiPromptModalOpen(true)}
        onSync={() => setSyncModalOpen(true)}
        onDeleteAll={handleDeleteAllSchedules}
        onPendingModal={() => setQuickPendingModalOpen(true)}
        onUpdateDB={handleUpdateDB}
      />

      {statusMsg.text && (
        <div className={statusMsg.type === "success" ? "auth-success-banner" : "auth-error-banner"} style={{ marginBottom: "1.5rem" }}>
          <span>{statusMsg.text}</span>
        </div>
      )}

      {loading || !mounted ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gray-500)" }}>
          <p>Memuat kalender akademik...</p>
        </div>
      ) : viewMode === "split" ? (
        <div style={{ marginBottom: "2rem" }}>
          <CalendarSplitView
            calendarDays={calendarDays}
            schedules={schedules}
            students={students}
            filterProgram={filterProgram}
            selectedDate={selectedDate}
            viewMonth={viewMonth}
            viewYear={viewYear}
            onSelectDate={setSelectedDate}
            onAddAgenda={handleOpenAddModal}
            onEditSchedule={handleOpenEditModal}
            onNavigate={handleNavigate}
          />
        </div>
      ) : (
        <CalendarGrid
          calendarDays={calendarDays}
          schedules={schedules}
          filterProgram={filterProgram}
          selectedDate={selectedDate}
          viewMonth={viewMonth}
          viewYear={viewYear}
          onSelectDate={setSelectedDate}
          onEditSchedule={handleOpenEditModal}
          onViewAll={(dateStr) => setViewAllDate(dateStr)}
          onHoverSchedule={(s, pos) => {
            setHoveredSchedule(s);
            if (pos) setTooltipPos(pos);
          }}
        />
      )}

      <ScheduleList
        schedules={schedules}
        viewYear={viewYear}
        viewMonth={viewMonth}
        selectedDate={selectedDate}
        onEdit={handleOpenEditModal}
        onAddEvent={handleOpenAddModal}
      />

      <AddEditScheduleModal
        isOpen={modalOpen}
        selectedSchedule={selectedSchedule}
        initialDateStr={selectedDate}
        onClose={() => setModalOpen(false)}
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

      <SyncModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
      />

      <AiSchedulerModal
        isOpen={aiPromptModalOpen}
        onClose={() => setAiPromptModalOpen(false)}
        onSuccess={(msg) => {
          setStatusMsg({ type: "success", text: msg });
          fetchData();
        }}
      />

      <QuickPendingModal
        isOpen={quickPendingModalOpen}
        onClose={() => setQuickPendingModalOpen(false)}
        onSuccess={(msg) => {
          setStatusMsg({ type: "success", text: msg });
          fetchData();
        }}
      />

      {hoveredSchedule && (
        <ScheduleTooltip hoveredSchedule={hoveredSchedule} tooltipPos={tooltipPos} />
      )}
    </div>
  );
}
