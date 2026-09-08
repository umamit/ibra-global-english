"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Student } from "@/types";
import { SessionNoteItem } from "@/app/admin/session-notes/hooks/useSessionNotesData";

interface TutorSessionNotesProps {
  students: Student[];
  tutorName: string;
}

export default function TutorSessionNotes({ students, tutorName }: TutorSessionNotesProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || "");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [meetingNumber, setMeetingNumber] = useState("");
  const [topicCovered, setTopicCovered] = useState("");
  const [vocabulary, setVocabulary] = useState("");
  const [comprehension, setComprehension] = useState("Baik");
  const [behavior, setBehavior] = useState("Fokus & Antusias");
  const [feedback, setFeedback] = useState("");
  const [homework, setHomework] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState<SessionNoteItem[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchStudentNotes = useCallback(async () => {
    if (!selectedStudentId) return;
    setLoadingNotes(true);
    try {
      const res = await fetch(`/api/session-notes?student_id=${selectedStudentId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setNotes(json.data);
      }
    } catch (err) {
      console.error("Gagal mengambil catatan siswa:", err);
    } finally {
      setLoadingNotes(false);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    fetchStudentNotes();
  }, [fetchStudentNotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !topicCovered.trim() || !feedback.trim()) {
      setMessage({ text: "Mohon lengkapi siswa, topik materi, dan catatan evaluasi.", type: "error" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/session-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: selectedStudentId,
          session_date: sessionDate,
          meeting_number: meetingNumber ? parseInt(meetingNumber, 10) : null,
          topic_covered: topicCovered.trim(),
          vocabulary_learned: vocabulary.trim() || null,
          comprehension_level: comprehension,
          student_behavior: behavior.trim() || null,
          individual_feedback: feedback.trim(),
          homework_assigned: homework.trim() || null,
          created_by_role: "tutor",
          tutor_name: tutorName || "Tutor Pembimbing",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menyimpan catatan.");
      }

      setMessage({ text: "Catatan pertemuan siswa berhasil disimpan!", type: "success" });
      setTopicCovered("");
      setVocabulary("");
      setFeedback("");
      setHomework("");
      fetchStudentNotes();
    } catch (err: any) {
      setMessage({ text: err.message || "Gagal menyimpan catatan.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div className="card" style={{ padding: "1.5rem", borderRadius: "18px", border: "1px solid rgba(0,0,0,0.06)" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
          Input Catatan Evaluasi Siswa Selesai Kelas
        </h2>
        <p style={{ fontSize: "0.88rem", color: "var(--color-gray-500)", marginBottom: "1.25rem" }}>
          Catatan ini akan langsung dapat dibaca oleh Orang Tua di portal mereka dan menjadi arsip riwayat belajar anak.
        </p>

        {message && (
          <div style={{ padding: "0.75rem 1rem", borderRadius: "10px", background: message.type === "success" ? "#dcfce7" : "#fee2e2", color: message.type === "success" ? "#15803d" : "#991b1b", fontSize: "0.85rem", marginBottom: "1rem" }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: "600" }}>Pilih Siswa</label>
              <select className="form-input" value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} required>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.program})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: "600" }}>Tanggal Kelas</label>
              <input type="date" className="form-input" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} required />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: "600" }}>Pertemuan Ke-</label>
              <input type="number" placeholder="Contoh: 1, 2..." className="form-input" value={meetingNumber} onChange={(e) => setMeetingNumber(e.target.value)} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: "600" }}>Topik / Materi Hari Ini</label>
              <input type="text" placeholder="Misal: Phonics A-D / Past Tense" className="form-input" value={topicCovered} onChange={(e) => setTopicCovered(e.target.value)} required />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: "600" }}>Kosakata Baru Dipelajari</label>
              <input type="text" placeholder="Misal: Apple, Ant, Axe" className="form-input" value={vocabulary} onChange={(e) => setVocabulary(e.target.value)} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: "600" }}>Tingkat Pemahaman</label>
              <select className="form-input" value={comprehension} onChange={(e) => setComprehension(e.target.value)}>
                <option value="Sangat Baik">Sangat Baik</option>
                <option value="Baik">Baik</option>
                <option value="Cukup">Cukup</option>
                <option value="Perlu Latihan">Perlu Latihan</option>
              </select>
            </div>
            <div>
              <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: "600" }}>Sikap / Keaktifan di Kelas</label>
              <input type="text" placeholder="Misal: Sangat antusias, fokus" className="form-input" value={behavior} onChange={(e) => setBehavior(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: "600" }}>Catatan Evaluasi Individual Siswa</label>
            <textarea rows={3} placeholder="Catatan kemajuan belajar anak hari ini..." className="form-input" value={feedback} onChange={(e) => setFeedback(e.target.value)} required />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: "600" }}>Tugas / PR di Rumah (Opsional)</label>
            <input type="text" placeholder="Tugas latihan mandiri anak..." className="form-input" value={homework} onChange={(e) => setHomework(e.target.value)} />
          </div>

          <button type="submit" className="btn-portal-primary" style={{ justifySelf: "end" }} disabled={submitting}>
            {submitting ? "Menyimpan..." : "Simpan Catatan Pertemuan"}
          </button>
        </form>
      </div>

      {/* Riwayat Catatan Siswa */}
      <div className="card" style={{ padding: "1.5rem", borderRadius: "18px", border: "1px solid rgba(0,0,0,0.06)" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" }}>
          Riwayat Catatan Sesi untuk Siswa Terpilih
        </h3>

        {loadingNotes ? (
          <p style={{ color: "var(--color-gray-500)", textAlign: "center" }}>Memuat riwayat...</p>
        ) : notes.length === 0 ? (
          <p style={{ color: "var(--color-gray-500)", textAlign: "center", padding: "1.5rem" }}>Belum ada catatan sesi untuk siswa ini.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.85rem" }}>
            {notes.map((n) => (
              <div key={n.id} style={{ padding: "1rem", borderRadius: "12px", background: "var(--color-gray-50, #f8fafc)", border: "1px solid rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <strong style={{ color: "var(--color-primary-dark)" }}>{n.topic_covered}</strong>
                  <span style={{ fontSize: "0.78rem", color: "var(--color-gray-500)" }}>{new Date(n.session_date).toLocaleDateString("id-ID")}</span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--color-gray-700)", margin: "0.3rem 0" }}>{n.individual_feedback}</p>
                {n.homework_assigned && (
                  <span style={{ fontSize: "0.78rem", color: "#854d0e", background: "#fef9c3", padding: "0.2rem 0.5rem", borderRadius: "6px", display: "inline-block" }}>
                    PR: {n.homework_assigned}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
