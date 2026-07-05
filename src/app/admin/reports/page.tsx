"use client";

export const dynamic = 'force-dynamic';

import React from 'react';
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import ReportStatusBanner from "./components/ReportStatusBanner";
import CertificateButton from "./components/CertificateButton";
import PrintReportView from "./components/PrintReportView";
import posthog from "posthog-js";

import { Student, Report, Certificate } from "@/types";

export default function ReportCardManagement() {
  const supabase = createClient();

  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [printReport, setPrintReport] = useState<Report | null>(null);
  const [contactAddress, setContactAddress] = useState<string>("Jl. TPU Bobong Komp. Fangahu, Lantai 1 Kost Fitrah");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  // Form State
  const [studentId, setStudentId] = useState<string>("");
  const [exportFilterId, setExportFilterId] = useState<string>(""); // A4: filter export per-siswa

  const [selectedStudentProgram, setSelectedStudentProgram] = useState<string>("");
  const [moduleName, setModuleName] = useState<string>("");
  const [speakingScore, setSpeakingScore] = useState<string>("");
  const [grammarScore, setGrammarScore] = useState<string>("");
  const [vocabularyScore, setVocabularyScore] = useState<string>("");
  const [activeScore, setActiveScore] = useState<string>("");
  const [tutorNotes, setTutorNotes] = useState<string>("");

  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiProgressLoading, setAiProgressLoading] = useState<boolean>(false);

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
        posthog.capture("admin_ai_notes_generated", { program: studentProgram });
      } else {
        alert(`Gagal menulis catatan: ${data.error || "Error tidak diketahui"}`);
      }
    } catch {
      alert("Gagal menghubungi server AI.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateAiProgressReport = async () => {
    if (!studentId) {
      alert("Harap pilih siswa terlebih dahulu!");
      return;
    }
    const studentObj = students.find(s => s.id === studentId);
    const studentName = studentObj ? studentObj.name : "Siswa";
    const studentProgram = studentObj ? studentObj.program : "General English";

    // Kumpulkan input dari tutor via prompt ringan
    const focus = prompt("Masukkan materi fokus bulan ini (contoh: Greetings, Daily Activities):", moduleName || "");
    if (focus === null) return; // User cancel

    const achievements = prompt("Masukkan pencapaian positif siswa (contoh: sangat aktif berdiskusi):");
    if (achievements === null) return;

    const challenges = prompt("Masukkan tantangan / aspek yang perlu ditingkatkan (contoh: rasa percaya diri berbicara):");
    if (challenges === null) return;

    const thisMonth = new Date().toLocaleString("id-ID", { month: "long" });

    setAiProgressLoading(true);
    try {
      const res = await fetch("/api/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "progress-report-draft",
          payload: {
            name: studentName,
            program: studentProgram,
            month: thisMonth,
            focus_areas: focus || "Materi harian sesuai silabus",
            achievements: achievements || "Mengikuti kelas dengan baik",
            challenges: challenges || "Perlu latihan lebih mandiri di rumah"
          }
        })
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setTutorNotes(data.reply);
        posthog.capture("admin_ai_progress_report_generated", { program: studentProgram });
      } else {
        alert(`Gagal membuat draf laporan: ${data.error || "Error tidak diketahui"}`);
      }
    } catch {
      alert("Gagal menghubungi server AI.");
    } finally {
      setAiProgressLoading(false);
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
      setReports((reportData as any[]) || []);

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
        setCertificates((certData as Certificate[]) || []);
      }
    } catch (err: any) {
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
    const isCalistung = (program: string) => program?.toLowerCase().includes("calistung");
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

  const handleCreateCertificate = async (report: Report) => {
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

      posthog.capture("admin_certificate_issued", { module_name: report.module_name, grade });
      alert("Sertifikat berhasil diterbitkan!");

      // Reload certificates
      const { data: certData } = await supabase
        .from("certificates")
        .select("*");
      setCertificates((certData as Certificate[]) || []);
      
      // Open verification page in a new tab
      if (data && data.id) {
        window.open(`/verify/${data.id}`, "_blank");
      }
    } catch (err: any) {
      console.error("Gagal menerbitkan sertifikat:", err);
      alert("Gagal menerbitkan sertifikat: " + err.message);
    }
  };

  const handleDeleteCertificate = async (id: string) => {
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
      setCertificates((certData as Certificate[]) || []);
    } catch (err: any) {
      console.error("Gagal menghapus sertifikat:", err);
      alert("Gagal menghapus sertifikat: " + err.message);
    }
  };

  const triggerPrint = (report: Report) => {
    setPrintReport(report);
    // Tunggu 800ms agar React selesai render konten raport sebelum print dialog dibuka
    setTimeout(() => {
      // Tambahkan class khusus agar @page portrait aktif untuk raport
      document.body.classList.add("print-raport");
      window.print();
      // Bersihkan class setelah print dialog ditutup
      const cleanup = () => {
        document.body.classList.remove("print-raport");
        window.removeEventListener("afterprint", cleanup);
      };
      window.addEventListener("afterprint", cleanup);
    }, 800);
  };

  const handleCreateReport = async (e: React.FormEvent) => {
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

      posthog.capture("admin_report_created", {
        program: selectedStudentProgram,
        module_name: moduleName.trim(),
        avg_score: Math.round((speak + gram + vocab + active) / 4),
      });
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
    } catch (err: any) {
      console.error("Gagal mengirim rapor:", err);
      setStatusMsg({ type: "error", text: "Gagal menerbitkan rapor: " + err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReport = async (id: string, mName: string, sName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus rapor "${mName}" milik siswa "${sName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        const { error } = await supabase
          .from("reports")
          .delete()
          .eq("id", id);

        if (error) throw error;
        fetchData();
      } catch (err: any) {
        alert("Gagal menghapus rapor: " + err.message);
      }
    }
  };

  if (printReport) {
    return (
      <PrintReportView 
        printReport={printReport}
        contactAddress={contactAddress}
        onClose={() => setPrintReport(null)}
      />
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
              <label className="form-label">
                {!selectedStudentProgram 
                  ? "Active / Keaktifan" 
                  : isFormCalistung 
                    ? "Keaktifan" 
                    : "Active"
                } (0-100)
              </label>
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

          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Catatan Deskriptif & Masukan Orang Tua</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={handleGenerateAiNotes}
                  disabled={aiLoading || aiProgressLoading || !studentId}
                  className="btn-portal-outline"
                  style={{
                    height: "auto",
                    padding: "0.25rem 0.6rem",
                    fontSize: "0.75rem",
                    borderColor: "var(--color-primary)",
                    color: "var(--color-primary)",
                    fontWeight: "700",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}
                >
                  {aiLoading ? (
                    <span>⏳ Sedang menyusun...</span>
                  ) : (
                    <>
                      <span>✨ Tulis Catatan Otomatis (AI)</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleGenerateAiProgressReport}
                  disabled={aiLoading || aiProgressLoading || !studentId}
                  className="btn-portal-outline"
                  style={{
                    height: "auto",
                    padding: "0.25rem 0.6rem",
                    fontSize: "0.75rem",
                    borderColor: "var(--color-accent, #e28743)",
                    color: "var(--color-accent, #e28743)",
                    fontWeight: "700",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}
                >
                  {aiProgressLoading ? (
                    <span>⏳ Sedang menyusun Laporan...</span>
                  ) : (
                    <>
                      <span>✨ Draf Laporan Bulanan (AI)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <textarea
              className="form-input"
              style={{ minHeight: "80px" }}
              placeholder="Berikan catatan kemajuan belajar siswa yang deskriptif..."
              value={tutorNotes}
              onChange={(e) => setTutorNotes(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="btn-portal-primary"
              disabled={submitting}
            >
              {submitting ? "Menerbitkan..." : "Terbitkan Rapor"}
            </button>
          </div>
        </form>
      </div>

      {/* Daftar Rapor yang Diterbitkan */}
      <div className="portal-card" style={{ padding: "2rem" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.5rem" }}>
          Riwayat Penerbitan Rapor & Sertifikat
        </h3>

        {loading ? (
          <p style={{ color: "var(--color-gray-500)", textAlign: "center", padding: "2rem 0" }}>
            Memuat riwayat rapor...
          </p>
        ) : reports.length === 0 ? (
          <p style={{ color: "var(--color-gray-400)", textAlign: "center", padding: "2rem 0" }}>
            Belum ada rapor digital diterbitkan.
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Siswa</th>
                  <th>Program</th>
                  <th>Modul</th>
                  <th>Nilai Rata-Rata</th>
                  <th>Ulasan Tutor</th>
                  <th>Sertifikat</th>
                  <th style={{ textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, idx) => {
                  const isCalistung = report.students?.program === "Fun Calistung";
                  const labels = isCalistung 
                    ? ["Membaca", "Menulis", "Berhitung", "Keaktifan"] 
                    : ["Speaking", "Grammar", "Vocab", "Active"];
                  
                  const avg = Math.round((report.speaking_score + report.grammar_score + report.vocabulary_score + report.active_score) / 4);
                  const linkedCert = certificates.find(c => c.report_id === report.id);

                  return (
                    <tr key={report.id}>
                      <td style={{ fontWeight: "700" }}>{idx + 1}</td>
                      <td style={{ fontWeight: "600", color: "var(--color-gray-900)" }}>
                        {report.students?.name || <span style={{ color: "var(--color-gray-400)", fontStyle: "italic" }}>Siswa terhapus</span>}
                      </td>
                      <td>
                        <span className="user-badge" style={{ backgroundColor: "var(--color-primary-light)", color: "var(--color-primary-dark)", padding: "0.2rem 0.5rem", fontWeight: "700" }}>
                          {report.students?.program?.split(" ")[0] || "-"}
                        </span>
                      </td>
                      <td style={{ fontWeight: "600" }}>{report.module_name}</td>
                      <td>
                        <div style={{ display: "inline-flex", flexDirection: "column", gap: "0.15rem" }}>
                          <span style={{ fontWeight: "800", fontSize: "1.1rem", color: "var(--color-primary-dark)" }}>{avg}</span>
                          <span style={{ fontSize: "0.68rem", color: "var(--color-gray-400)" }}>
                            ({labels[0]}:{report.speaking_score} {labels[1]}:{report.grammar_score} {labels[2]}:{report.vocabulary_score} {labels[3]}:{report.active_score})
                          </span>
                        </div>
                      </td>
                      <td style={{ maxWidth: "250px" }}>
                        <p style={{ fontSize: "0.8rem", color: "var(--color-gray-600)", lineHeight: "1.4", margin: 0, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {report.tutor_notes || "-"}
                        </p>
                      </td>
                      <td>
                        <CertificateButton 
                          report={report}
                          certificates={certificates}
                          onCreate={handleCreateCertificate}
                          onDelete={handleDeleteCertificate}
                        />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                          <button
                            onClick={() => triggerPrint(report)}
                            className="btn-portal-outline"
                            style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", height: "auto" }}
                          >
                            🖨️ Cetak PDF
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id, report.module_name, report.students?.name || "Siswa")}
                            className="btn-portal-danger"
                            style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", height: "auto" }}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
