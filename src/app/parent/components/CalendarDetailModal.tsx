"use client";

import React from "react";
import { Schedule } from "../hooks/useCalendarView";

interface CalendarDetailModalProps {
  isOpen: boolean;
  schedule: Schedule | null;
  onClose: () => void;
}

export default function CalendarDetailModal({ isOpen, schedule, onClose }: CalendarDetailModalProps) {
  if (!isOpen || !schedule) return null;

  return (
    <div className="portal-modal-overlay" onClick={onClose}>
      <div className="portal-modal" style={{ maxWidth: "500px", padding: "2rem", animation: "slideIn 0.2s ease" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "white", backgroundColor: schedule.type === "holiday" ? "#ef4444" : schedule.type === "event" ? "var(--color-accent)" : "var(--color-primary)", padding: "0.25rem 0.65rem", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.5px", display: "inline-block", marginBottom: "0.5rem" }}>
              {schedule.type === "holiday" ? "Hari Libur" : schedule.type === "event" ? "Kegiatan Khusus" : "Kelas Rutin"}
            </span>
            <h4 style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--color-gray-900)", margin: 0 }}>
              {schedule.title}
            </h4>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--color-gray-500)", cursor: "pointer", display: "flex", alignItems: "center" }} aria-label="Tutup detail modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", backgroundColor: "var(--color-gray-50)", padding: "1.25rem", borderRadius: "10px", border: "1px solid var(--color-gray-200)", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontWeight: "700", fontSize: "0.85rem", color: "var(--color-gray-600)", width: "100px" }}>Waktu:</span>
            <span style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>
              {new Date(schedule.start_time).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontWeight: "700", fontSize: "0.85rem", color: "var(--color-gray-600)", width: "100px" }}>Jam:</span>
            <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--color-gray-900)" }}>
              {new Date(schedule.start_time).toTimeString().slice(0, 5)} - {new Date(schedule.end_time).toTimeString().slice(0, 5)} WIT
            </span>
          </div>

          {schedule.tutor_name && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontWeight: "700", fontSize: "0.85rem", color: "var(--color-gray-600)", width: "100px" }}>Tutor Pengajar:</span>
              <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--color-gray-900)" }}>
                {schedule.tutor_name}
              </span>
            </div>
          )}

          {schedule.room_name && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontWeight: "700", fontSize: "0.85rem", color: "var(--color-gray-600)", width: "100px" }}>Ruang Kelas:</span>
              <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--color-gray-900)" }}>
                {schedule.room_name}
              </span>
            </div>
          )}

          {schedule.description && (
            <div style={{ borderTop: "1px solid var(--color-gray-200)", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
              <span style={{ fontWeight: "700", fontSize: "0.85rem", color: "var(--color-gray-600)", display: "block", marginBottom: "0.25rem" }}>Keterangan Tambahan:</span>
              <p style={{ fontSize: "0.85rem", color: "var(--color-gray-700)", margin: 0, lineHeight: "1.5" }}>
                {schedule.description}
              </p>
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="button" className="btn-portal-primary" onClick={onClose} style={{ padding: "0.5rem 1.25rem" }}>
            Tutup Detail
          </button>
        </div>
      </div>
    </div>
  );
}
