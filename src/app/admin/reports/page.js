export const dynamic = 'force-dynamic';

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ReportCardManagement() {
  const supabase = createClient();

  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  // Form State
  const [studentId, setStudentId] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [speakingScore, setSpeakingScore] = useState("");
  const [grammarScore, setGrammarScore] = useState("");
  const [vocabularyScore, setVocabularyScore] = useState("");
  const [activeScore, setActiveScore] = useState("");
  const [tutorNotes, setTutorNotes] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Ambil semua siswa
      const { data: studentData, error: errS } = await supabase
        .from("students")
        .select("id, name, program")
        .order("name", { ascending: true });

      if (errS) throw errS;
      setStudents(studentData || []);

      // 2. Ambil semua rapor yang telah diterbitkan
      const { data: reportData, error: errR } = await supabase
        .from("reports")
        .select(`
          id,
          module_name,
          speaking_score,
          grammar_score,
          vocabulary_score,
          active_score,
          tutor_notes,
          created_at,
          students (
            name,
            program
          )
        `)
        .order("created_at", { ascending: false });

      if (errR) throw errR;
      setReports(reportData || []);
    } catch (err) {
      console.error("Gagal mengambil data rapor:", err);
      setStatusMsg({ type: "error", text: "Gagal memuat data: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateReport = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: "", text: "" });
    setSubmitting(true);

    // Validasi data
    if (!studentId || !moduleName.trim() || !speakingScore || !grammarScore || !vocabularyScore || !activeScore) {
      setStatusMsg({ type: "error", text: "Mohon lengkapi semua isian formulir rapor." });
      setSubmitting(false);
      return;
    }

    const speak = parseInt(speakingScore);
    const gram = parseInt(grammarScore);
    const vocab = parseInt(vocabularyScore);
    const active = parseInt(activeScore);

    if (
      speak < 0 || speak > 100 ||
      gram < 0 || gram > 100 ||
      vocab < 0 || vocab > 100 ||
      active < 0 || active > 100
    ) {
      setStatusMsg({ type: "error", text: "Semua nilai harus berada di skala 0-100." });
      setSubmitting(false);
      return;
    }

    try {
      const reportPayload = {
        student_id: studentId,
        module_name: moduleName.trim(),
        speaking_score: speak,
        grammar_score: gram,
        vocabulary_score: vocab,
        active_score: active,
        tutor_notes: tutorNotes.trim() || null,
      };

      const { error } = await supabase
        .from("reports")
        .insert(reportPayload);

      if (error) throw error;

      setStatusMsg({ type: "success", text: "Rapor digital berhasil diterbitkan!" });

      // Reset form
      setStudentId("");
      setModuleName("");
      setSpeakingScore("");
      setGrammarScore("");
      setVocabularyScore("");
      setActiveScore("");
      setTutorNotes("");

      // Reload data
      fetchData();
    } catch (err) {
      console.error("Gagal mengirim rapor:", err);
      setStatusMsg({ type: "error", text: "Gagal menerbitkan rapor: " + err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReport = async (id, mName, sName) => {
    if (confirm(`Apakah Anda yakin ingin menghapus rapor "${mName}" milik siswa "${sName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        const { error } = await supabase
          .from("reports")
          .delete()
          .eq("id", id);

        if (error) throw error;
        fetchData();
      } catch (err) {
        alert("Gagal menghapus rapor: " + err.message);
      }
    }
  };

  return (
    <div>
      <div className="dashboard-topbar">
        <div className="topbar-title">
          <h1>Input Nilai Rapor</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            E-Rapor Digital: Evaluasi pencapaian modul belajar siswa
          </p>
        </div>
      </div>

      {statusMsg.text && (
        <div
          className={statusMsg.type === "success" ? "auth-success-banner" : "auth-error-banner"}
          style={{ marginBottom: "2rem" }}
        >
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Formulir Input Rapor Baru */}
      <div className="portal-card" style={{ marginBottom: "3rem", padding: "2rem" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.5rem" }}>
          Penerbitan Rapor Modul Baru
        </h3>

        <form onSubmit={handleCreateReport}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Pilih Siswa</label>
              <select
                className="form-input"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={submitting}
                required
              >
                <option value="">-- Pilih Siswa --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.program})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Nama Modul Evaluasi</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Module 1 - Introduce Yourself"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            <div className="form-group">
              <label className="form-label">Speaking (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                placeholder="Skor"
                value={speakingScore}
                onChange={(e) => setSpeakingScore(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Grammar (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                placeholder="Skor"
                value={grammarScore}
                onChange={(e) => setGrammarScore(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vocabulary (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                placeholder="Skor"
                value={vocabularyScore}
                onChange={(e) => setVocabularyScore(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Keaktifan (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                placeholder="Skor"
                value={activeScore}
                onChange={(e) => setActiveScore(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "1.75rem" }}>
            <label className="form-label">Catatan & Ulasan Tutor (Tutor Review Notes)</label>
            <textarea
              className="form-input"
              style={{ minHeight: "100px", fontFamily: "inherit" }}
              placeholder="Berikan umpan balik yang membangun untuk siswa dan orang tuanya..."
              value={tutorNotes}
              onChange={(e) => setTutorNotes(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="btn-portal-primary" disabled={submitting}>
              <span>{submitting ? "Menerbitkan..." : "Terbitkan Rapor Digital"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Riwayat Rapor Diterbitkan */}
      <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.25rem" }}>
        Riwayat Penerbitan Rapor Modul
      </h3>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-500)" }}>
          <p>Memuat riwayat rapor...</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="portal-table report-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Siswa</th>
                <th>Modul</th>
                <th>Speaking</th>
                <th>Grammar</th>
                <th>Vocabulary</th>
                <th>Keaktifan</th>
                <th>Tutor Review Notes</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-500)" }}>
                    Belum ada rapor digital yang diterbitkan di sistem ini.
                  </td>
                </tr>
              ) : (
                reports.map((report, idx) => (
                  <tr key={report.id}>
                    <td style={{ fontWeight: "700" }}>{idx + 1}</td>
                    <td>
                      <strong style={{ color: "var(--color-gray-900)" }}>{report.students?.name}</strong>
                      <p style={{ fontSize: "0.75rem", color: "var(--color-gray-500)" }}>{report.students?.program}</p>
                    </td>
                    <td style={{ fontWeight: "600" }}>{report.module_name}</td>
                    <td style={{ fontWeight: "700", color: report.speaking_score >= 75 ? "var(--color-green)" : "var(--color-accent)" }}>{report.speaking_score}</td>
                    <td style={{ fontWeight: "700", color: report.grammar_score >= 75 ? "var(--color-green)" : "var(--color-accent)" }}>{report.grammar_score}</td>
                    <td style={{ fontWeight: "700", color: report.vocabulary_score >= 75 ? "var(--color-green)" : "var(--color-accent)" }}>{report.vocabulary_score}</td>
                    <td style={{ fontWeight: "700", color: report.active_score >= 75 ? "var(--color-green)" : "var(--color-accent)" }}>{report.active_score}</td>
                    <td style={{ fontSize: "0.85rem", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={report.tutor_notes}>
                      {report.tutor_notes || "-"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn-portal-danger"
                        onClick={() => handleDeleteReport(report.id, report.module_name, report.students?.name)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
