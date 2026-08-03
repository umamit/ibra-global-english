"use client";

import React from "react";
import { AcademicSchedule } from "../hooks/useCalendarData";
import { getScheduleBadgeStyle } from "../calendarHelpers";

interface ViewAllModalProps {
  viewAllDate: string | null;
  onClose: () => void;
  schedulesForDay: AcademicSchedule[];
  onEditSchedule: (s: AcademicSchedule, e: React.MouseEvent) => void;
}

export default function ViewAllModal({ viewAllDate, onClose, schedulesForDay, onEditSchedule }: ViewAllModalProps) {
  if (!viewAllDate) return null;

  return (
    <div className="portal-modal-overlay" onClick={onClose}>
      <div
        className="portal-modal"
        style={{ maxWidth: "450px", padding: "1.5rem", animation: "slideIn 0.2s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--color-gray-900)", margin: 0 }}>
            Agenda:{" "}
            {new Date(viewAllDate).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "transparent", border: "none", fontSize: "1.5rem", fontWeight: "800", color: "var(--color-gray-400)", cursor: "pointer" }}
          >
            &times;
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto", padding: "0.25rem 0" }}>
          {schedulesForDay.map((s) => {
            const { badgeBg, badgeColor } = getScheduleBadgeStyle(s.type);
            const cleanTimeStr = new Date(s.start_time).toTimeString().slice(0, 5);

            return (
              <div
                key={s.id}
                onClick={(e) => {
                  onClose();
                  onEditSchedule(s, e);
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
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <span>
                  {cleanTimeStr} - {s.title} ({s.program})
                </span>
                <span style={{ fontSize: "0.75rem", opacity: 0.85 }}>️ Ubah</span>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
          <button
            type="button"
            className="btn-portal-outline"
            style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
