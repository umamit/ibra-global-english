"use client";

import React from "react";
import { AcademicSchedule } from "../hooks/useCalendarData";
import { getSchedulesForDay } from "../calendarHelpers";

interface DailyTimelinePanelProps {
  selectedDate: string;
  schedules: AcademicSchedule[];
  filterProgram: string;
  onAddAgenda: (dateStr: string) => void;
  onEditSchedule: (s: AcademicSchedule, e: React.MouseEvent) => void;
}

function getProgramColor(programName: string): { bg: string; text: string; border: string } {
  const p = (programName || "").toLowerCase();
  if (p.includes("calistung")) {
    return { bg: "rgba(166, 136, 73, 0.12)", text: "#8c6f32", border: "rgba(166, 136, 73, 0.3)" };
  } else if (p.includes("teen")) {
    return { bg: "rgba(22, 77, 87, 0.12)", text: "#164d57", border: "rgba(22, 77, 87, 0.3)" };
  }
  return { bg: "rgba(33, 108, 126, 0.12)", text: "#216c7e", border: "rgba(33, 108, 126, 0.3)" };
}

function formatIndonesianDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return `${days[dateObj.getDay()]}, ${d} ${months[m - 1]} ${y}`;
  } catch {
    return dateStr;
  }
}

export default function DailyTimelinePanel({
  selectedDate,
  schedules,
  filterProgram,
  onAddAgenda,
  onEditSchedule,
}: DailyTimelinePanelProps) {
  const daySchedules = getSchedulesForDay(schedules, selectedDate, filterProgram).sort(
    (a, b) => (a.start_time || "").localeCompare(b.start_time || "")
  );

  return (
    <div style={{
      backgroundColor: "#ffffff", borderRadius: "18px",
      border: "1px solid rgba(0, 0, 0, 0.06)",
      boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.04)",
      padding: "1.25rem", height: "100%", display: "flex", flexDirection: "column",
    }}>
      {/* Panel Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingBottom: "1rem", marginBottom: "1.25rem",
        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
      }}>
        <div>
          <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#A68849", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Agenda Harian
          </span>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", marginTop: "0.15rem" }}>
            {formatIndonesianDate(selectedDate)}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => onAddAgenda(selectedDate)}
          className="btn-portal-primary"
          style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem", borderRadius: "10px" }}
        >
          + Tambah
        </button>
      </div>

      {/* Schedule Items List */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {daySchedules.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "2.5rem 1rem", backgroundColor: "var(--color-bg-teal-50, #eef6f8)",
            borderRadius: "14px", border: "1px dashed rgba(33, 108, 126, 0.2)",
          }}>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "#475569", fontWeight: "600" }}>
              Tidak ada agenda kelas pada tanggal ini.
            </p>
            <button
              type="button"
              onClick={() => onAddAgenda(selectedDate)}
              className="btn-portal-outline"
              style={{ marginTop: "0.75rem", fontSize: "0.78rem", padding: "0.35rem 0.75rem" }}
            >
              + Tambah Kelas Baru
            </button>
          </div>
        ) : (
          daySchedules.map((item) => {
            const colors = getProgramColor(item.program);
            return (
              <div
                key={item.id}
                onClick={(e) => onEditSchedule(item, e)}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "14px",
                  border: `1px solid ${colors.border}`,
                  padding: "0.85rem 1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  borderLeft: `4px solid ${colors.text}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{
                    fontSize: "0.72rem", fontWeight: "800", padding: "0.2rem 0.55rem",
                    borderRadius: "9999px", backgroundColor: colors.bg, color: colors.text,
                    border: `1px solid ${colors.border}`,
                  }}>
                    {item.program}
                  </span>
                  <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "#216c7e" }}>
                    ⏰ {item.start_time?.includes("T") ? item.start_time.split("T")[1]?.substring(0, 5) : item.start_time} - {item.end_time?.includes("T") ? item.end_time.split("T")[1]?.substring(0, 5) : item.end_time}
                  </span>
                </div>

                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "#0f172a" }}>
                  {item.title || item.program}
                </h4>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem", color: "#64748b", marginTop: "0.2rem" }}>
                  <span>📍 Ruang Kelas</span>
                  <span>👨‍🏫 {item.instructor || "Tutor Ibra"}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
