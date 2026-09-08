"use client";

import React from "react";
import { SessionNoteItem } from "../hooks/useSessionNotesData";

interface SessionNotesTimelineProps {
  notes: SessionNoteItem[];
  loading: boolean;
  onDeleteNote: (id: string) => void;
}

const COMPREHENSION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Sangat Baik": { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" },
  "Baik": { bg: "#e0f2fe", text: "#0369a1", border: "#bae6fd" },
  "Cukup": { bg: "#fef3c7", text: "#b45309", border: "#fde68a" },
  "Perlu Latihan": { bg: "#fee2e2", text: "#b91c1c", border: "#fecaca" },
};

export default function SessionNotesTimeline({ notes, loading, onDeleteNote }: SessionNotesTimelineProps) {
  if (loading) {
    return <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-gray-500)" }}>Memuat riwayat catatan...</div>;
  }

  if (notes.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem", borderRadius: "18px", border: "1px solid rgba(0,0,0,0.06)" }}>
        <p style={{ fontWeight: "600", color: "var(--color-gray-500)" }}>Belum ada catatan pertemuan untuk siswa yang dipilih.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {notes.map((item) => {
        const compStyle = COMPREHENSION_COLORS[item.comprehension_level] || COMPREHENSION_COLORS["Baik"];
        return (
          <div key={item.id} className="card" style={{ padding: "1.25rem 1.5rem", borderRadius: "18px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <h4 style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--color-gray-900)", margin: 0 }}>
                    {item.students?.name || "Nama Siswa"}
                  </h4>
                  {item.meeting_number && (
                    <span className="user-badge" style={{ fontSize: "0.75rem", background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}>
                      Pertemuan #{item.meeting_number}
                    </span>
                  )}
                  <span style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>
                    {new Date(item.session_date).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--color-primary-dark)", fontWeight: "600", marginTop: "0.2rem" }}>
                  Topik: {item.topic_covered}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ padding: "0.25rem 0.65rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: "700", background: compStyle.bg, color: compStyle.text, border: `1px solid ${compStyle.border}` }}>
                  {item.comprehension_level}
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteNote(item.id)}
                  style={{ background: "transparent", border: "none", color: "#dc2626", cursor: "pointer", padding: "0.25rem 0.5rem", fontSize: "0.8rem", fontWeight: "600" }}
                  title="Hapus Catatan"
                >
                  Hapus
                </button>
              </div>
            </div>

            {item.vocabulary_learned && (
              <div style={{ background: "rgba(33, 108, 126, 0.05)", padding: "0.6rem 0.85rem", borderRadius: "10px", marginBottom: "0.6rem", fontSize: "0.82rem" }}>
                <strong>Kosakata Baru:</strong> {item.vocabulary_learned}
              </div>
            )}

            <div style={{ fontSize: "0.9rem", color: "var(--color-gray-800)", lineHeight: "1.5", marginBottom: "0.6rem" }}>
              <strong>Evaluasi Pengajar:</strong> {item.individual_feedback}
            </div>

            {item.homework_assigned && (
              <div style={{ fontSize: "0.83rem", color: "#854d0e", background: "#fef9c3", padding: "0.5rem 0.85rem", borderRadius: "8px", display: "inline-block" }}>
                <strong>Tugas Rumah (PR):</strong> {item.homework_assigned}
              </div>
            )}

            <div style={{ marginTop: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(0,0,0,0.04)", fontSize: "0.75rem", color: "var(--color-gray-400)", display: "flex", justifyContent: "space-between" }}>
              <span>Pencatat: {item.tutor_name || "Admin"} ({item.created_by_role})</span>
              <span>Diinput: {new Date(item.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
