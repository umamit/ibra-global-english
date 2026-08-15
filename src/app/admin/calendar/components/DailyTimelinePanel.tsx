"use client";

import React from "react";
import { AcademicSchedule, StudentSimple } from "../hooks/useCalendarData";
import { getSchedulesForDay } from "../calendarHelpers";

interface DailyTimelinePanelProps {
  selectedDate: string;
  schedules: AcademicSchedule[];
  students?: StudentSimple[];
  filterProgram: string;
  onAddAgenda: (dateStr: string) => void;
  onEditSchedule: (s: AcademicSchedule, e: React.MouseEvent) => void;
}

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-2px", marginRight: "4px" }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-2px", marginRight: "4px" }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-2px", marginRight: "4px" }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-2px", marginRight: "4px" }}>
    <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M9 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
  </svg>
);

function getProgramColor(programName: string): { bg: string; text: string; border: string } {
  const p = (programName || "").toLowerCase();
  if (p.includes("calistung")) {
    return { bg: "rgba(166, 136, 73, 0.12)", text: "#8c6f32", border: "rgba(166, 136, 73, 0.3)" };
  } else if (p.includes("teen")) {
    return { bg: "rgba(22, 77, 87, 0.12)", text: "#164d57", border: "rgba(22, 77, 87, 0.3)" };
  }
  return { bg: "rgba(33, 108, 126, 0.12)", text: "#216c7e", border: "rgba(33, 108, 126, 0.3)" };
}

function formatTimeWIT(timeStr: string): string {
  if (!timeStr) return "";
  if (!timeStr.includes("T")) return timeStr;
  try {
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return timeStr;
    const hoursInWIT = (d.getUTCHours() + 9) % 24;
    const h = String(hoursInWIT).padStart(2, "0");
    const m = String(d.getUTCMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  } catch {
    return timeStr;
  }
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
  students = [],
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
            const startTimeWit = formatTimeWIT(item.start_time);
            const endTimeWit = formatTimeWIT(item.end_time);

            // Filter enrolled students for this specific class session
            const enrolled = students.filter((s) => {
              const desc = (item.description || "").toLowerCase();
              const studentName = (s.name || "").toLowerCase();

              // If description specifies a student name, match exact student name
              if (desc && studentName && desc.includes(studentName)) {
                return true;
              }

              // Check if description is specifically tailored to another student
              const isSpecificOtherStudent = students.some(
                (other) => other.name && desc.includes(other.name.toLowerCase())
              );
              if (isSpecificOtherStudent) {
                return false;
              }

              // General fallback: match by program
              const sp = (s.program || "").toLowerCase();
              const ip = (item.program || "").toLowerCase();
              const it = (item.title || "").toLowerCase();
              if (ip.includes("calistung")) return sp.includes("calistung");
              if (ip.includes("teen")) return sp.includes("teen");
              if (sp === ip || sp === it) return true;
              return ip.includes("kids") && sp.includes("kids");
            });

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
                  gap: "0.45rem",
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
                  <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "#216c7e", display: "inline-flex", alignItems: "center" }}>
                    <ClockIcon /> {startTimeWit} - {endTimeWit} WIT
                  </span>
                </div>

                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "#0f172a" }}>
                  {item.title || item.program}
                </h4>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem", color: "#64748b" }}>
                  <span style={{ display: "inline-flex", alignItems: "center" }}><MapPinIcon /> {item.room || "Ruang Kelas"}</span>
                  <span style={{ display: "inline-flex", alignItems: "center" }}><UserIcon /> {item.instructor || "Tutor Ibra"}</span>
                </div>

                {/* Enrolled Students List */}
                <div style={{
                  padding: "0.4rem 0.65rem", borderRadius: "8px", backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0", fontSize: "0.75rem", color: "#334155", marginTop: "0.2rem",
                  display: "flex", alignItems: "center", gap: "0.3rem", flexWrap: "wrap",
                }}>
                  <span style={{ display: "inline-flex", alignItems: "center", fontWeight: "800", color: "#216c7e" }}>
                    <UsersIcon /> Siswa ({enrolled.length}):
                  </span>
                  <span>
                    {enrolled.length === 0
                      ? "Belum ada siswa terdaftar"
                      : enrolled.map((s) => s.name).join(", ")}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
