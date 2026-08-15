"use client";

import React from "react";
import { AcademicSchedule, getMonthNameIndonesian } from "../hooks/useCalendarData";
import { CalendarCell, getSchedulesForDay } from "../calendarHelpers";
import DailyTimelinePanel from "./DailyTimelinePanel";

interface CalendarSplitViewProps {
  calendarDays: CalendarCell[];
  schedules: AcademicSchedule[];
  filterProgram: string;
  selectedDate: string;
  viewMonth: number;
  viewYear: number;
  onSelectDate: (dateStr: string) => void;
  onAddAgenda: (dateStr: string) => void;
  onEditSchedule: (s: AcademicSchedule, e: React.MouseEvent) => void;
  onNavigate: (dir: "prev" | "next") => void;
}

function getLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const SHORT_WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function CalendarSplitView({
  calendarDays,
  schedules,
  filterProgram,
  selectedDate,
  viewMonth,
  viewYear,
  onSelectDate,
  onAddAgenda,
  onEditSchedule,
  onNavigate,
}: CalendarSplitViewProps) {
  const todayStr = getLocalDateString(new Date());

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(12, 1fr)",
      gap: "1.25rem",
      alignItems: "start",
    }}>
      {/* Left 35% Mini Calendar Card */}
      <div style={{
        gridColumn: "span 5",
        backgroundColor: "#ffffff",
        borderRadius: "18px",
        border: "1px solid rgba(0, 0, 0, 0.06)",
        boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.04)",
        padding: "1.25rem",
      }}>
        {/* Month Navigator Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "#0f172a" }}>
            {getMonthNameIndonesian(viewMonth)} {viewYear}
          </h3>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <button
              type="button"
              onClick={() => onNavigate("prev")}
              className="btn-portal-outline"
              style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", borderRadius: "8px" }}
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={() => onNavigate("next")}
              className="btn-portal-outline"
              style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", borderRadius: "8px" }}
            >
              &rarr;
            </button>
          </div>
        </div>

        {/* Mini Calendar Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", textAlign: "center" }}>
          {SHORT_WEEKDAYS.map((wd, i) => (
            <div key={wd} style={{ fontSize: "0.72rem", fontWeight: "800", color: i === 0 ? "#A68849" : "#64748b", paddingBottom: "0.4rem" }}>
              {wd}
            </div>
          ))}

          {calendarDays.map((cell, idx) => {
            const daySchedules = getSchedulesForDay(schedules, cell.dateString, filterProgram);
            const isToday = cell.dateString === todayStr;
            const isSelected = cell.dateString === selectedDate;
            const isCurrentMonth = cell.month === viewMonth;

            return (
              <div
                key={idx}
                onClick={() => onSelectDate(cell.dateString)}
                style={{
                  padding: "0.45rem 0.2rem",
                  borderRadius: "10px",
                  cursor: "pointer",
                  backgroundColor: isSelected ? "var(--color-primary, #216c7e)" : isToday ? "rgba(166, 136, 73, 0.15)" : "transparent",
                  color: isSelected ? "#ffffff" : !isCurrentMonth ? "#cbd5e1" : "#1e293b",
                  fontWeight: isSelected || isToday ? "800" : "600",
                  fontSize: "0.82rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                  transition: "all 0.15s ease",
                  border: isToday && !isSelected ? "1px solid #A68849" : "1px solid transparent",
                }}
              >
                <span>{cell.day}</span>
                {/* Event Dots */}
                <div style={{ display: "flex", gap: "2px", height: "4px" }}>
                  {daySchedules.slice(0, 3).map((_, dotIdx) => (
                    <span
                      key={dotIdx}
                      style={{
                        width: "4px", height: "4px", borderRadius: "50%",
                        backgroundColor: isSelected ? "#ffffff" : "#216c7e",
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right 65% Daily Timeline Panel */}
      <div style={{ gridColumn: "span 7" }}>
        <DailyTimelinePanel
          selectedDate={selectedDate}
          schedules={schedules}
          filterProgram={filterProgram}
          onAddAgenda={onAddAgenda}
          onEditSchedule={onEditSchedule}
        />
      </div>
    </div>
  );
}
