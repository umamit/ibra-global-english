"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import RadarChart from "@/components/RadarChart";
import ReportStatusBanner from "./components/ReportStatusBanner";
import CertificateButton from "./components/CertificateButton";

export default function ReportCardManagement() {
  const supabase = createClient();

  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [printReport, setPrintReport] = useState(null);
  const [contactAddress, setContactAddress] = useState("Jl. TPU Bobong Komp. Fangahu, Lantai 1 Kost Fitrah");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  // Form State
  const [studentId, setStudentId] = useState("");
  const [exportFilterId, setExportFilterId] = useState(""); // A4: filter export per-siswa

  const [selectedStudentProgram, setSelectedStudentProgram] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [speakingScore, setSpeakingScore] = useState("");
  const [grammarScore, setGrammarScore] = useState("");
  const [vocabularyScore, setVocabularyScore] = useState("");
  const [activeScore, setActiveScore] = useState("");
  const [tutorNotes, setTutorNotes] = useState("");

  const [aiLoading, setAiLoading] = useState(false);

  const handleGenerateAiNotes = async () => {
    if (!studentId) {
      alert("Harap pilih siswa terlebih dahulu!");
      return;
    }
    const studentObj = students.find(s => s.id === studentId);
    const studentName = studentObj ? studentObj.name : "Siswa";
    const studentProgram = studentObj ? studentObj.program : "General English";

    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "auto-draft",
          payload: {
            name: studentName,
            program: studentProgram,
            module_name: moduleName,
            speaking: speakingScore || 80,
            grammar: grammarScore || 80,
            vocabulary: vocabularyScore || 80,
            active: activeScore || 80
          }
        })
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setTutorNotes(data.reply);
      } else {
        alert(`Gagal menulis catatan: ${data.error || "Error tidak diketahui"}`);
      }
    } catch {
      alert("Gagal menghubungi server AI.");
    } finally {
      setAiLoading(false);
    }
  };

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
          student_id,
          module_name,
          speaking_score,
          grammar_score,
          vocabulary_score,
          active_score,
          tutor_notes,
          created_at,
          students (
            id,
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

      // 4. Ambil semua sertifikat
      const { data: certData, error: errC } = await supabase
        .from("certificates")
        .select("*");
      if (!errC) {
        setCertificates(certData || []);
      }
    } catch (err) {
      console.error("Gagal mengambil data rapor:", err);
      setStatusMsg({ type: "error", text: "Gagal memuat data: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {


    let cancelled = false;


    const load = async () => {


      if (cancelled) return;


      fetchData();


    };


    load();


    return () => {


      cancelled = true;


    };


  }, []);

  // A4: Export rapor ke CSV — bisa filter per-siswa
  const exportReportsCSV = (filterStudentId = "") => {
    const isCalistung = (program) => program?.toLowerCase().includes("calistung");
    const filtered = filterStudentId
      ? reports.filter(r => r.student_id === filterStudentId)
      : reports;

    if (filtered.length === 0) {
      alert("Tidak ada data rapor untuk siswa yang dipilih.");
      return;
    }

    const studentName = filterStudentId
      ? (filtered[0]?.students?.name || "siswa").replace(/\s+/g, "_")
      : "semua_siswa";

    const headers = ["No", "Nama Siswa", "Program", "Modul", "Skor 1", "Skor 2", "Skor 3", "Skor 4", "Rata-rata", "Catatan Tutor", "Tanggal Terbit"];
    const rows = filtered.map((r, idx) => {
      const avg = Math.round((r.speaking_score + r.grammar_score + r.vocabulary_score + r.active_score) / 4);
      const prog = r.students?.program || "";
      const label = isCalistung(prog)
        ? ["Membaca", "Menulis", "Berhitung", "Keaktifan"]
        : ["Speaking", "Grammar", "Vocabulary", "Active"];
      return [
        idx + 1,
        r.students?.name || "-",
        prog || "-",
        r.module_name || "-",
        `${label[0]}: ${r.speaking_score}`,
        `${label[1]}: ${r.grammar_score}`,
        `${label[2]}: ${r.vocabulary_score}`,
        `${label[3]}: ${r.active_score}`,
        avg,
        r.tutor_notes || "-",
        new Date(r.created_at).toLocaleDateString("id-ID")
      ];
    });

    const csvContent = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rapor_${studentName}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateCertificate = async (report) => {
    const certNumInput = prompt("Masukkan Nomor Sertifikat Resmi LKP Dinas Pendidikan:\n(Contoh: 001/IGE/VI/2026)");
    if (certNumInput === null) return; // Cancelled
    const certNumber = certNumInput.trim();
    if (!certNumber) {
      alert("Nomor sertifikat wajib diisi!");
      return;
    }

    const defaultTutor = "Husnita Usman, M.Pd";
    const tutorNameInput = prompt("Masukkan nama tutor pendamping untuk tanda tangan sertifikat:", defaultTutor);
    if (tutorNameInput === null) return; // Cancelled
    const tutorSignature = tutorNameInput.trim() || defaultTutor;

    const canvaUrlInput = prompt("Masukkan URL Gambar Sertifikat hasil ekspor Canva:\n(Contoh: https://example.com/sertifikat-canva.png)");
    if (canvaUrlInput === null) return; // Cancelled
    const customImageUrl = canvaUrlInput.trim();
    if (!customImageUrl) {
      alert("URL Gambar sertifikat wajib diisi!");
      return;
    }

    try {
      const avg = Math.round((report.speaking_score + report.grammar_score + report.vocabulary_score + report.active_score) / 4);
      const grade = avg >= 85 ? "Excellent (A)" : avg >= 75 ? "Good (B)" : "Satisfactory (C)";

      const payload = {
        student_id: report.student_id,
        module_name: report.module_name,
        grade,
        tutor_name: tutorSignature,
        cert_number: certNumber,
        custom_image_url: customImageUrl,
        report_id: report.id,
        issue_date: new Date().toISOString().split("T")[0]
      };

      const { data, error } = await supabase
        .from("certificates")
        .insert(payload)
        .select("id")
        .single();

      if (error) throw error;

      // Send simulated WhatsApp notification
      try {
        await fetch("/api/whatsapp-simulator", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: "6281357001357",
            message: `Yth. Orang Tua dari *${report.students?.name || "Siswa"}*, sertifikat resmi kelulusan untuk *${report.module_name}* dengan Predikat *${grade}* telah berhasil diterbitkan. Silakan verifikasi keaslian dokumen secara online di: ${window.location.origin}/verify/${data.id}`,
            type: "Sertifikat Kelulusan"
          })
        });
      } catch (waErr) {
        console.error("Gagal mengirim notifikasi WhatsApp simulasi:", waErr);
      }

      alert("Sertifikat berhasil diterbitkan!");
      
      // Reload certificates
      const { data: certData } = await supabase
        .from("certificates")
        .select("*");
      setCertificates(certData || []);
      
      // Open verification page in a new tab
      if (data && data.id) {
        window.open(`/verify/${data.id}`, "_blank");
      }
    } catch (err) {
      console.error("Gagal menerbitkan sertifikat:", err);
      alert("Gagal menerbitkan sertifikat: " + err.message);
    }
  };

  const handleDeleteCertificate = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus sertifikat ini?")) return;
    try {
      const { error } = await supabase
        .from("certificates")
        .delete()
        .eq("id", id);
      if (error) throw error;
      alert("Sertifikat berhasil dihapus!");
      
      // Reload certificates
      const { data: certData } = await supabase
        .from("certificates")
        .select("*");
      setCertificates(certData || []);
    } catch (err) {
      console.error("Gagal menghapus sertifikat:", err);
      alert("Gagal menghapus sertifikat: " + err.message);
    }
  };


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
            <div className="form-grid" style={{ gap: "1rem", marginBottom: 0 }}>
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
              &ldquo;{printReport.tutor_notes || "Siswa menunjukkan pemahaman yang luar biasa serta keaktifan tinggi selama pengerjaan modul bimbingan ini. Terus latih kemampuan bercakapnya."}&rdquo;
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

  const isFormCalistung = selectedStudentProgram?.toLowerCase()?.includes("calistung");

  return (
    <div>
      <div className="dashboard-topbar">
        <div className="topbar-title">
          <h1>Input Nilai Rapor</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            E-Rapor Digital: Evaluasi pencapaian modul belajar siswa
          </p>
        </div>
        {reports.length > 0 && (
          <div className="topbar-user" style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <select
              className="form-input"
              style={{ padding: "0.45rem 0.75rem", fontSize: "0.825rem", width: "auto", minWidth: "160px" }}
              value={exportFilterId}
              onChange={(e) => setExportFilterId(e.target.value)}
            >
              <option value="">Semua Siswa</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button
              className="btn-portal-outline"
              onClick={() => exportReportsCSV(exportFilterId)}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.9rem", fontSize: "0.825rem" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Export CSV</span>
            </button>
          </div>
        )}
      </div>

      <ReportStatusBanner statusMsg={statusMsg} />

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

          <div className="four-column-grid" style={{ gap: "1rem", marginBottom: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label">
                {!selectedStudentProgram 
                  ? "Speaking / Membaca" 
                  : isFormCalistung 
                    ? "Membaca" 
                    : "Speaking"
                } (0-100)
              </label>
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
              <label className="form-label">
                {!selectedStudentProgram 
                  ? "Grammar / Menulis" 
                  : isFormCalistung 
                    ? "Menulis" 
                    : "Grammar"
                } (0-100)
              </label>
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
              <label className="form-label">
                {!selectedStudentProgram 
                  ? "Vocabulary / Berhitung" 
                  : isFormCalistung 
                    ? "Berhitung" 
                    : "Vocabulary"
                } (0-100)
              </label>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Catatan & Ulasan Tutor (Tutor Review Notes)</label>
              <button 
                type="button" 
                onClick={handleGenerateAiNotes}
                style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "4px", backgroundColor: "var(--color-primary-light)", color: "var(--color-primary-dark)", border: "1px solid var(--color-primary-light)", cursor: "pointer", fontWeight: "bold" }}
                disabled={aiLoading}
              >
                {aiLoading ? "⚡ Menulis..." : "💡 Tulis otomatis dengan AI Groq"}
              </button>
            </div>
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
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", alignItems: "center" }}>
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
                        
                        <CertificateButton
                          report={report}
                          certificates={certificates}
                          onCreate={handleCreateCertificate}
                          onDelete={handleDeleteCertificate}
                        />

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
