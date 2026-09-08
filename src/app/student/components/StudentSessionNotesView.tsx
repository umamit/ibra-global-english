"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SessionNoteItem } from "@/app/admin/session-notes/hooks/useSessionNotesData";

interface StudentSessionNotesViewProps {
  studentId?: string;
}

export default function StudentSessionNotesView({ studentId }: StudentSessionNotesViewProps) {
  const [notes, setNotes] = useState<SessionNoteItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/session-notes?student_id=${studentId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setNotes(json.data);
      }
    } catch (err) {
      console.error("Gagal mengambil catatan sesi siswa:", err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <div className="card" style={{ padding: "1.25rem 1.5rem", borderRadius: "18px", border: "1px solid rgba(0,0,0,0.06)" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", margin: 0 }}>
          Catatan &amp; Tugas Pertemuan Kamu
        </h2>
        <p style={{ fontSize: "0.88rem", color: "var(--color-gray-500)", marginTop: "0.3rem" }}>
          Lihat kembali materi yang sudah dipelajari, kosakata baru, dan pesan semangat dari Coach!
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-gray-500)" }}>Memuat catatan...</div>
      ) : notes.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem", borderRadius: "18px", border: "1px solid rgba(0,0,0,0.06)" }}>
          <p style={{ color: "var(--color-gray-500)", fontWeight: "600" }}>Belum ada catatan pertemuan yang tercatat.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {notes.map((item) => (
            <div key={item.id} className="card" style={{ padding: "1.25rem 1.5rem", borderRadius: "18px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-primary)" }}>
                      {new Date(item.session_date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    {item.meeting_number && (
                      <span className="user-badge" style={{ fontSize: "0.72rem", background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}>
                        Pertemuan #{item.meeting_number}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--color-gray-900)", marginTop: "0.3rem", margin: 0 }}>
                    Materi: {item.topic_covered}
                  </h3>
                </div>

                <span style={{ padding: "0.25rem 0.65rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: "700", background: "#dcfce7", color: "#15803d" }}>
                  {item.comprehension_level}
                </span>
              </div>

              {item.vocabulary_learned && (
                <div style={{ background: "rgba(33, 108, 126, 0.05)", padding: "0.6rem 0.85rem", borderRadius: "10px", marginBottom: "0.6rem", fontSize: "0.85rem" }}>
                  <strong style={{ color: "var(--color-primary-dark)" }}>Kosakata Hari Ini:</strong> {item.vocabulary_learned}
                </div>
              )}

              <div style={{ fontSize: "0.9rem", color: "var(--color-gray-800)", lineHeight: "1.55", marginBottom: "0.6rem" }}>
                <strong>Pesan Coach:</strong> {item.individual_feedback}
              </div>

              {item.homework_assigned && (
                <div style={{ fontSize: "0.85rem", color: "#854d0e", background: "#fef9c3", padding: "0.5rem 0.85rem", borderRadius: "8px", display: "inline-block" }}>
                  <strong>Latihan Mandiri (PR):</strong> {item.homework_assigned}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
