"use client";

import React from "react";
import { AcademicSchedule, getMonthNameIndonesian } from "../hooks/useCalendarData";
import { CalendarCell, getSchedulesForDay, getScheduleColor } from "../calendarHelpers";

interface CalendarGridProps {
  calendarDays: CalendarCell[];
  schedules: AcademicSchedule[];
  filterProgram: string;
  selectedDate: string;
  viewMonth: number;
  viewYear: number;
  onSelectDate: (dateStr: string) => void;
  onEditSchedule: (s: AcademicSchedule, e: React.MouseEvent) => void;
  onViewAll: (dateStr: string) => void;
  onHoverSchedule: (s: AcademicSchedule | null, pos: { x: number; y: number }) => void;
}

function getLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const WEEKDAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function CalendarGrid({
  calendarDays,
  schedules,
  filterProgram,
  selectedDate,
  viewMonth,
  viewYear,
  onSelectDate,
  onEditSchedule,
  onViewAll,
  onHoverSchedule,
}: CalendarGridProps) {
  const todayStr = getLocalDateString(new Date());

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "16px",
        border: "1px solid rgba(0, 0, 0, 0.05)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
        padding: "1.25rem",
        overflowX: "auto",
      }}
    >
      <div style={{ minWidth: "650px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "4px",
            backgroundColor: "var(--color-gray-50)",
            borderRadius: "10px",
            padding: "4px",
          }}
        >
          {/* Weekday headers */}
          {WEEKDAYS.map((day, idx) => (
            <div
              key={day}
              style={{
                textAlign: "center",
                fontWeight: "800",
                color: idx === 0 || idx === 6 ? "var(--color-accent)" : "var(--color-gray-600)",
                fontSize: "0.82rem",
                padding: "0.5rem 0.25rem",
                marginBottom: "4px",
              }}
            >
              {day}
            </div>
          ))}

          {/* Day cells */}
          {calendarDays.map((cell, idx) => {
            const daySchedules = getSchedulesForDay(schedules, cell.dateString, filterProgram);
            const isToday = cell.dateString === todayStr;
            const isSelected = cell.dateString === selectedDate;

            return (
              <div
                key={idx}
                onClick={() => onSelectDate(cell.dateString)}
                role="button"
                tabIndex={0}
                aria-label={`Pilih tanggal ${cell.day} ${getMonthNameIndonesian(cell.month)} ${cell.year}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectDate(cell.dateString);
                  }
                }}
                style={{
                  minHeight: "110px",
                  backgroundColor: cell.isCurrentMonth
                    ? isSelected
                      ? "rgba(33, 108, 126, 0.02)"
                      : "white"
                    : "var(--color-gray-50)",
                  padding: "0.5rem",
                  border: isSelected
                    ? "2px solid var(--color-primary)"
                    : isToday
                    ? "2px dashed var(--color-primary-light)"
                    : "1px solid rgba(0, 0, 0, 0.09)",
                  boxShadow: isSelected ? "0 0 0 3px rgba(33, 108, 126, 0.12)" : "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                }}
                className="calendar-cell-hover"
              >
                {/* Day number */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "800",
                      color: isToday
                        ? "white"
                        : cell.isCurrentMonth
                        ? isSelected
                          ? "var(--color-primary)"
                          : "var(--color-gray-800)"
                        : "var(--color-gray-400)",
                      backgroundColor: isToday ? "var(--color-primary)" : "transparent",
                      width: isToday ? "24px" : "auto",
                      height: isToday ? "24px" : "auto",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {cell.day}
                  </span>
                  {isToday && (
                    <span style={{ fontSize: "0.6rem", color: "var(--color-primary)", fontWeight: "800" }}>Kini</span>
                  )}
                </div>

                {/* Schedule pills */}
                <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
                  {daySchedules.slice(0, 3).map((s) => {
                    const { color, bg } = getScheduleColor(s.type);
                    const cleanTimeStr = new Date(s.start_time).toTimeString().slice(0, 5);

                    return (
                      <div
                        key={s.id}
                        onClick={(e) => onEditSchedule(s, e)}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          onHoverSchedule(s, {
                            x: rect.left + rect.width / 2 + window.scrollX,
                            y: rect.top + window.scrollY - 8,
                          });
                        }}
                        onMouseLeave={() => onHoverSchedule(null, { x: 0, y: 0 })}
                        role="button"
                        tabIndex={0}
                        aria-label={`Agenda: ${s.title}, Jam: ${cleanTimeStr}. Tekan Enter untuk mengubah.`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onEditSchedule(s, e as any);
                          }
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          backgroundColor: bg,
                          color: "var(--color-gray-800)",
                          borderLeft: `4px solid ${color}`,
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          cursor: "pointer",
                          margin: "2px 0",
                        }}
                        className="schedule-pill"
                      >
                        <span style={{ color, fontSize: "0.65rem", fontWeight: "800" }}>{cleanTimeStr}</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</span>
                      </div>
                    );
                  })}

                  {daySchedules.length > 3 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewAll(cell.dateString);
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
                        marginTop: "2px",
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
  );
}
