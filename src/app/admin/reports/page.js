"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { createAdminClient as createClient } from "@/utils/supabase/client";

// SUB-COMPONENT: Custom visual pure-SVG Radar Chart for high-fidelity evaluation representation
function RadarChart({ speaking, grammar, vocabulary, active, isCalistung }) {
  const cx = 120;
  const cy = 120;
  const r = 80;

  const pSpeaking = { x: cx, y: cy - r * (speaking / 100) };
  const pGrammar = { x: cx + r * (grammar / 100), y: cy };
  const pVocabulary = { x: cx, y: cy + r * (vocabulary / 100) };
  const pActive = { x: cx - r * (active / 100), y: cy };

  const polygonPoints = `${pSpeaking.x},${pSpeaking.y} ${pGrammar.x},${pGrammar.y} ${pVocabulary.x},${pVocabulary.y} ${pActive.x},${pActive.y}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "1.5rem", backgroundColor: "white", borderRadius: "12px", border: "1px solid var(--color-gray-150)", boxShadow: "var(--shadow-sm)", maxWidth: "300px", margin: "0 auto" }}>
      <p style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--color-primary-dark)", textTransform: "uppercase", marginBottom: "1rem" }}>Visualisasi Performa</p>
      
      <svg width="240" height="240" viewBox="0 0 240 240" style={{ overflow: "visible" }}>
        {[25, 50, 75, 100].map((percent) => {
          const gridR = r * (percent / 100);
          return (
            <polygon
              key={percent}
              points={`${cx},${cy - gridR} ${cx + gridR},${cy} ${cx},${cy + gridR} ${cx - gridR},${cy}`}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={percent < 100 ? "3,3" : "none"}
            />
          );
        })}

        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#cbd5e1" strokeWidth="1.5" />

        <text x={cx} y={cy - r - 8} textAnchor="middle" fontSize="9" fontWeight="800" fill="#475569">{isCalistung ? "MEMBACA" : "SPEAKING"}</text>
        <text x={cx + r + 8} y={cy + 3} textAnchor="start" fontSize="9" fontWeight="800" fill="#475569">{isCalistung ? "MENULIS" : "GRAMMAR"}</text>
        <text x={cx} y={cy + r + 15} textAnchor="middle" fontSize="9" fontWeight="800" fill="#475569">{isCalistung ? "BERHITUNG" : "VOCABULARY"}</text>
        <text x={cx - r - 8} y={cy + 3} textAnchor="end" fontSize="9" fontWeight="800" fill="#475569">{isCalistung ? "KEAKTIFAN" : "ACTIVE"}</text>

        <text x={cx + 5} y={cy - r + 10} fontSize="7" fontWeight="700" fill="#94a3b8">100</text>
        <text x={cx + 5} y={cy - r * 0.5 + 4} fontSize="7" fontWeight="700" fill="#94a3b8">50</text>

        <polygon
          points={polygonPoints}
          fill="rgba(33, 108, 126, 0.25)"
          stroke="#216c7e"
          strokeWidth="2.5"
        />

        <circle cx={pSpeaking.x} cy={pSpeaking.y} r="3.5" fill="#216c7e" stroke="white" strokeWidth="1" />
        <circle cx={pGrammar.x} cy={pGrammar.y} r="3.5" fill="#216c7e" stroke="white" strokeWidth="1" />
        <circle cx={pVocabulary.x} cy={pVocabulary.y} r="3.5" fill="#216c7e" stroke="white" strokeWidth="1" />
        <circle cx={pActive.x} cy={pActive.y} r="3.5" fill="#216c7e" stroke="white" strokeWidth="1" />
      </svg>
    </div>
  );
}

export default function ReportCardManagement() {
  const supabase = createClient();

  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [printReport, setPrintReport] = useState(null);
  const [contactAddress, setContactAddress] = useState("Jl. TPU Bobong Komp. Fangahu, Lantai 1 Kost Fitrah");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  // Form State
  const [studentId, setStudentId] = useState("");
  const [selectedStudentProgram, setSelectedStudentProgram] = useState("");
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
            program,
            age
          )
        `)
        .order("created_at", { ascending: false });

      if (errR) throw errR;
      setReports(reportData || []);

      // 3. Ambil alamat kontak dari landing_settings
      const { data: settingsData } = await supabase
        .from("landing_settings")
        .select("value")
        .eq("key", "contact_address")
        .maybeSingle();
      if (settingsData && settingsData.value) {
        setContactAddress(settingsData.value);
      }
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

  const triggerPrint = (report) => {
    setPrintReport(report);
    setTimeout(() => {
      window.print();
    }, 150);
  };

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

  if (printReport) {
    const isCalistung = printReport.students?.program === "Fun Calistung";
    return (
      <div style={{ padding: "1.5rem", backgroundColor: "white", minHeight: "100vh" }}>
        <div className="no-print" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)" }}>
            * Anda sedang melihat pratinjau cetak. Tekan Ctrl+P atau Cmd+P jika dialog print tidak terbuka otomatis.
          </p>
          <button className="btn-portal-outline" onClick={() => setPrintReport(null)} style={{ cursor: "pointer" }}>
            ← Kembali ke Portal
          </button>
        </div>

        {/* PRINT-OPTIMIZED REPORT LAYOUT */}
        <div className="printable-report" style={{ border: "2px solid #ddd", padding: "2.5rem", borderRadius: "12px", maxWidth: "800px", margin: "0 auto" }}>
          
          {/* Official Header Kop Surat */}
          <div className="report-header-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "3px double var(--color-primary)", paddingBottom: "1rem", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <img src="/assets/logo.png" alt="Ibra Logo" style={{ width: "64px", height: "64px" }} />
              <div style={{ textAlign: "left" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "900", margin: "0", color: "var(--color-primary)" }}>IBRA GLOBAL ENGLISH</h1>
                <p style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--color-accent)", margin: "0" }}>Belajar Seru, Lancar Bicara</p>
                <p style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", margin: "2px 0 0" }}>{contactAddress}</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0" }}>E-RAPOR DIGITAL</h2>
              <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", margin: "0" }}>REKAP HASIL EVALUASI MODUL</p>
            </div>
          </div>

          <div className="student-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem", backgroundColor: "var(--color-gray-50)", padding: "1.25rem", borderRadius: "8px" }}>
            <div>
              <p style={{ margin: "0 0 6px" }}><strong>Nama Siswa:</strong> {printReport.students?.name}</p>
              <p style={{ margin: "0" }}><strong>Program Belajar:</strong> {printReport.students?.program} {printReport.students?.age ? `(Usia ${printReport.students?.age} tahun)` : ""}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: "0 0 6px" }}><strong>ID Evaluasi:</strong> IBRA-REP-{printReport.id.slice(0, 8).toUpperCase()}</p>
              <p style={{ margin: "0" }}><strong>Tanggal Terbit:</strong> {new Date(printReport.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </div>

          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", borderBottom: "1.5px solid var(--color-gray-300)", paddingBottom: "0.5rem", marginBottom: "1.5rem", color: "var(--color-gray-800)" }}>
            A. DETAIL EVALUASI KOMPETENSI MODUL: {printReport.module_name.toUpperCase()}
          </h3>

          {/* Grid Layout containing Score Cards on Left and visual SVG Radar Chart on Right */}
          <div className="report-scores-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem", alignItems: "center", marginBottom: "2.5rem" }}>
            
            {/* Scores List */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ border: "1px solid var(--color-gray-200)", padding: "1.25rem", borderRadius: "8px", textAlign: "center", backgroundColor: "white" }}>
                <p style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0" }}>{printReport.speaking_score}</p>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>
                  {isCalistung ? "Membaca" : "Speaking"}
                </p>
              </div>
              <div style={{ border: "1px solid var(--color-gray-200)", padding: "1.25rem", borderRadius: "8px", textAlign: "center", backgroundColor: "white" }}>
                <p style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0" }}>{printReport.grammar_score}</p>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>
                  {isCalistung ? "Menulis" : "Grammar"}
                </p>
              </div>
              <div style={{ border: "1px solid var(--color-gray-200)", padding: "1.25rem", borderRadius: "8px", textAlign: "center", backgroundColor: "white" }}>
                <p style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0" }}>{printReport.vocabulary_score}</p>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>
                  {isCalistung ? "Berhitung" : "Vocabulary"}
                </p>
              </div>
              <div style={{ border: "1px solid var(--color-gray-200)", padding: "1.25rem", borderRadius: "8px", textAlign: "center", backgroundColor: "white" }}>
                <p style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0" }}>{printReport.active_score}</p>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>
                  {isCalistung ? "Keaktifan" : "Active"}
                </p>
              </div>
            </div>

            {/* Visual SVG Radar Chart */}
            <div>
              <RadarChart 
                speaking={printReport.speaking_score} 
                grammar={printReport.grammar_score} 
                vocabulary={printReport.vocabulary_score} 
                active={printReport.active_score} 
                isCalistung={isCalistung}
              />
            </div>

          </div>

          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", borderBottom: "1.5px solid var(--color-gray-300)", paddingBottom: "0.5rem", marginBottom: "1rem", color: "var(--color-gray-800)" }}>
            B. ULASAN & CATATAN MASUKAN TUTOR
          </h3>

          <div className="report-notes-container" style={{ borderLeft: "4px solid var(--color-accent)", paddingLeft: "1.25rem", margin: "1.5rem 0 3rem", backgroundColor: "var(--color-gray-50)", padding: "1.25rem", borderRadius: "0 8px 8px 0" }}>
            <p style={{ fontSize: "0.95rem", color: "var(--color-gray-700)", fontStyle: "italic", lineHeight: "1.6", margin: "0" }}>
              "{printReport.tutor_notes || "Siswa menunjukkan pemahaman yang luar biasa serta keaktifan tinggi selama pengerjaan modul bimbingan ini. Terus latih kemampuan bercakapnya."}"
            </p>
          </div>

          {/* Signature Block */}
          <div className="signature-block" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", marginTop: "4rem" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: "0 0 4.5rem" }}>Mengetahui,<br /><strong>Orang Tua / Wali Siswa</strong></p>
              <p style={{ margin: "0", fontWeight: "bold" }}>___________________________</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: "0 0 4.5rem" }}>Bobong, Pulau Taliabu<br /><strong>Tutor Pendamping</strong></p>
              <p style={{ margin: "0", fontWeight: "bold" }}>___________________________</p>
              <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", margin: "4px 0 0" }}>Ibra Global English</p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  const isFormCalistung = selectedStudentProgram === "Fun Calistung";

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
                onChange={(e) => {
                  const id = e.target.value;
                  setStudentId(id);
                  const student = students.find(s => s.id === id);
                  setSelectedStudentProgram(student ? student.program : "");
                }}
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
              <label className="form-label">{isFormCalistung ? "Membaca" : "Speaking"} (0-100)</label>
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
              <label className="form-label">{isFormCalistung ? "Menulis" : "Grammar"} (0-100)</label>
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
              <label className="form-label">{isFormCalistung ? "Berhitung" : "Vocabulary"} (0-100)</label>
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
                <th>Speaking / Membaca</th>
                <th>Grammar / Menulis</th>
                <th>Vocabulary / Berhitung</th>
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
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button
                          className="btn-portal-outline"
                          style={{ 
                            padding: "0.35rem 0.75rem", 
                            fontSize: "0.8rem", 
                            display: "inline-flex", 
                            gap: "0.25rem", 
                            alignItems: "center", 
                            borderColor: "var(--color-primary)", 
                            color: "var(--color-primary)",
                            cursor: "pointer"
                          }}
                          onClick={() => triggerPrint(report)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                          Cetak
                        </button>
                        <button
                          className="btn-portal-danger"
                          style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", cursor: "pointer" }}
                          onClick={() => handleDeleteReport(report.id, report.module_name, report.students?.name)}
                        >
                          Hapus
                        </button>
                      </div>
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
