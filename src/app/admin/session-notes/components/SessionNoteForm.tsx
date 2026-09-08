"use client";

import React, { useState } from "react";
import { StudentItem } from "../hooks/useSessionNotesData";

interface SessionNoteFormProps {
  students: StudentItem[];
  selectedStudentId: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function SessionNoteForm({ students, selectedStudentId, onSuccess, onCancel }: SessionNoteFormProps) {
  const [studentId, setStudentId] = useState(selectedStudentId || (students[0]?.id || ""));
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [meetingNumber, setMeetingNumber] = useState<string>("");
  const [topicCovered, setTopicCovered] = useState("");
  const [vocabulary, setVocabulary] = useState("");
  const [comprehension, setComprehension] = useState("Baik");
  const [behavior, setBehavior] = useState("Fokus & Antusias");
  const [feedback, setFeedback] = useState("");
  const [homework, setHomework] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !topicCovered.trim() || !feedback.trim()) {
      setErrorMsg("Mohon lengkapi nama siswa, materi pelajaran, dan catatan evaluasi.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/session-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          session_date: sessionDate,
          meeting_number: meetingNumber ? parseInt(meetingNumber, 10) : null,
          topic_covered: topicCovered.trim(),
          vocabulary_learned: vocabulary.trim() || null,
          comprehension_level: comprehension,
          student_behavior: behavior.trim() || null,
          individual_feedback: feedback.trim(),
          homework_assigned: homework.trim() || null,
          created_by_role: "admin",
          tutor_name: "Admin Lembaga",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menyimpan catatan.");
      }

      setTopicCovered("");
      setVocabulary("");
      setFeedback("");
      setHomework("");
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan catatan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: "1.5rem", borderRadius: "18px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
      <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--color-gray-900)", marginBottom: "1rem" }}>
        Input Catatan Pertemuan Siswa
      </h3>

      {errorMsg && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "10px", background: "#fee2e2", color: "#991b1b", fontSize: "0.85rem", marginBottom: "1rem" }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div>
            <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: "600", marginBottom: "0.3rem" }}>Pilih Siswa</label>
            <select className="form-input" value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
              <option value="">-- Pilih Siswa --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.program})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: "600", marginBottom: "0.3rem" }}>Tanggal Sesi</label>
            <input type="date" className="form-input" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} required />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: "600", marginBottom: "0.3rem" }}>Pertemuan Ke- (Opsional)</label>
            <input type="number" placeholder="Contoh: 1, 2, 3..." className="form-input" value={meetingNumber} onChange={(e) => setMeetingNumber(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div>
            <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: "600", marginBottom: "0.3rem" }}>Materi / Topik Pelajaran</label>
            <input type="text" placeholder="Misal: Greetings & Self-Introduction" className="form-input" value={topicCovered} onChange={(e) => setTopicCovered(e.target.value)} required />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: "600", marginBottom: "0.3rem" }}>Kosakata Baru Dipelajari</label>
            <input type="text" placeholder="Misal: Hello, Morning, Nice, Friend" className="form-input" value={vocabulary} onChange={(e) => setVocabulary(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div>
            <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: "600", marginBottom: "0.3rem" }}>Tingkat Pemahaman</label>
            <select className="form-input" value={comprehension} onChange={(e) => setComprehension(e.target.value)}>
              <option value="Sangat Baik">Sangat Baik (Menguasai penuh)</option>
              <option value="Baik">Baik (Paham materi)</option>
              <option value="Cukup">Cukup (Mulai memahami)</option>
              <option value="Perlu Latihan">Perlu Latihan (Butuh bimbingan ulang)</option>
            </select>
          </div>
          <div>
            <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: "600", marginBottom: "0.3rem" }}>Keaktifan &amp; Sikap di Kelas</label>
            <input type="text" placeholder="Misal: Sangat aktif menjawab pertanyaan" className="form-input" value={behavior} onChange={(e) => setBehavior(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: "600", marginBottom: "0.3rem" }}>Catatan Evaluasi Individual Siswa</label>
          <textarea rows={3} placeholder="Tuliskan catatan perkembangan spesifik siswa hari ini..." className="form-input" value={feedback} onChange={(e) => setFeedback(e.target.value)} required />
        </div>

        <div>
          <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: "600", marginBottom: "0.3rem" }}>Tugas Rumah / PR (Opsional)</label>
          <input type="text" placeholder="Misal: Menulis 5 kalimat perkenalan di buku latihan" className="form-input" value={homework} onChange={(e) => setHomework(e.target.value)} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-portal-secondary" disabled={loading}>
              Batal
            </button>
          )}
          <button type="submit" className="btn-portal-primary" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Catatan Siswa"}
          </button>
        </div>
      </form>
    </div>
  );
}
