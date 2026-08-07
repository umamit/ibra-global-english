"use client";

import React from "react";

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChildProgram?: string;
}

export default function CalendarSyncModal({ isOpen, onClose, selectedChildProgram }: CalendarSyncModalProps) {
  if (!isOpen) return null;

  return (
    <div className="portal-modal-overlay" onClick={onClose}>
      <div className="portal-modal" style={{ maxWidth: "520px", padding: "2rem", animation: "slideIn 0.2s ease" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div>
            <h4 style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--color-gray-900)", margin: 0 }}>
              Sinkronkan ke Aplikasi Kalender HP
            </h4>
            <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginTop: "4px" }}>
              Otomatis masukkan jadwal belajar ({selectedChildProgram || "Siswa"}) ke Google Calendar / Apple iCal.
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--color-gray-500)", cursor: "pointer", display: "flex", alignItems: "center" }} aria-label="Tutup modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ padding: "1rem", backgroundColor: "var(--color-gray-50)", borderRadius: "8px", border: "1px solid var(--color-gray-200)" }}>
            <h5 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "4px" }}>
              Unduh Berkas Kalender (.ics)
            </h5>
            <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginBottom: "0.75rem" }}>
              Format standar iCalendar yang dapat dibuka di iPhone, Android, Outlook, dan Google Calendar.
            </p>
            <a
              href={`/api/calendar/export?program=${encodeURIComponent(selectedChildProgram || "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-portal-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.85rem" }}
            >
              <span>Unduh Berkas .ics</span>
            </a>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <button type="button" className="btn-portal-outline" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
