"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Certificate, Student, Report } from "@/types";
import "./certificates.css";

// ── helpers ────────────────────────────────────────────────────────
const romanMonths = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];

function getProgramCode(program: string): string {
  const p = program.toLowerCase();
  if (p.includes("kids"))     return "KIDS";
  if (p.includes("teens"))    return "TEENS";
  if (p.includes("calistung")) return "CALISTUNG";
  return "IGE";
}

function buildCertNumber(program: string, existing: Certificate[]): string {
  const code = getProgramCode(program);
  const suffix = code === "IGE" ? "IGE-CERT" : `IGE-CERT/${code}`;
  const now    = new Date();
  const month  = romanMonths[now.getMonth()];
  const year   = now.getFullYear();
  const count  = existing.filter(c => getProgramCode(c.module_name) === code).length + 1;
  return `${String(count).padStart(3,"0")}/${suffix}/${month}/${year}`;
}

interface CertWithStudent extends Certificate {
  students?: { name: string; program: string } | null;
}

// ── component ──────────────────────────────────────────────────────
export default function AdminCertificatesPage() {
  const supabase = createClient();

  const [certificates, setCertificates] = useState<CertWithStudent[]>([]);
  const [students,     setStudents]     = useState<Student[]>([]);
  const [reports,      setReports]      = useState<Report[]>([]);
  const [templates,    setTemplates]    = useState<string[]>([]);
  const [loading,      setLoading]      = useState(true);

  // form state
  const [studentId,   setStudentId]   = useState("");
  const [reportId,    setReportId]    = useState("");
  const [certNumber,  setCertNumber]  = useState("");
  const [tutorName,   setTutorName]   = useState("Husnita Usman, M.Pd.");
  const [templateUrl, setTemplateUrl] = useState("");
  const [issueDate,   setIssueDate]   = useState("");
  const [submitting,  setSubmitting]  = useState(false);

  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success"|"error" }>({ show: false, message: "", type: "success" });
  const triggerToast = (message: string, type: "success"|"error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(p => ({ ...p, show: false })), 3500);
  };

  // ── fetch all data ────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const [certRes, stuRes, repRes] = await Promise.all([
        supabase.from("certificates").select("*, students(name, program)").order("created_at", { ascending: false }),
        supabase.from("students").select("id, name, program").order("name"),
        supabase.from("reports").select("id, student_id, module_name, speaking_score, grammar_score, vocabulary_score, active_score").order("created_at", { ascending: false }),
      ]);
      if (certRes.data) setCertificates(certRes.data as CertWithStudent[]);
      if (stuRes.data)  setStudents(stuRes.data as Student[]);
      if (repRes.data)  setReports(repRes.data as Report[]);
    } catch {
      triggerToast("Gagal memuat data.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── fetch bucket templates ────────────────────────────────────
  const fetchTemplates = async () => {
    const { data } = await supabase.storage.from("certificate-templates").list("", { limit: 50 });
    if (data) {
      const urls = data
        .filter(f => f.name.endsWith(".pdf"))
        .map(f => supabase.storage.from("certificate-templates").getPublicUrl(f.name).data.publicUrl);
      setTemplates(urls);
      if (urls.length > 0 && !templateUrl) setTemplateUrl(urls[0]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTemplates();
    // default issue date (WIT UTC+9)
    const now = new Date(Date.now() + 9 * 3600 * 1000);
    setIssueDate(now.toISOString().split("T")[0]);
  }, []);

  // ── rapor yang belum punya sertifikat untuk siswa terpilih ────
  const availableReports = reports.filter(r => {
    if (studentId && r.student_id !== studentId) return false;
    return !certificates.some(c => c.report_id === r.id);
  });

  // ── saat rapor dipilih, update nomor sertifikat otomatis ─────
  const handleReportChange = (rid: string) => {
    setReportId(rid);
    const rep = reports.find(r => r.id === rid);
    if (!rep) { setCertNumber(""); return; }
    const stu = students.find(s => s.id === rep.student_id);
    const program = stu?.program || rep.module_name;
    setCertNumber(buildCertNumber(program, certificates));
  };

  // ── terbitkan sertifikat ─────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportId || !certNumber || !templateUrl) {
      triggerToast("Rapor, Nomor Sertifikat, dan Template wajib diisi.", "error");
      return;
    }
    const rep = reports.find(r => r.id === reportId);
    if (!rep) return;

    const avg = Math.round((rep.speaking_score + rep.grammar_score + rep.vocabulary_score + rep.active_score) / 4);
    const grade = avg >= 85 ? "Excellent (A)" : avg >= 75 ? "Good (B)" : "Satisfactory (C)";

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("certificates")
        .insert({
          student_id:       rep.student_id,
          module_name:      rep.module_name,
          grade,
          tutor_name:       tutorName,
          cert_number:      certNumber,
          custom_image_url: templateUrl,
          report_id:        reportId,
          issue_date:       issueDate,
        })
        .select("id")
        .single();

      if (error) throw error;

      // notif WhatsApp simulasi
      try {
        const stu = students.find(s => s.id === rep.student_id);
        await fetch("/api/whatsapp-simulator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: "6281357001357",
            message: `Yth. Orang Tua dari *${stu?.name || "Siswa"}*, sertifikat kelulusan *${rep.module_name}* dengan predikat *${grade}* telah diterbitkan. Verifikasi: ${window.location.origin}/verify/${data.id}`,
            type: "Sertifikat Kelulusan",
          }),
        });
      } catch { /* notif gagal tidak menghentikan alur */ }

      triggerToast("Sertifikat berhasil diterbitkan!");
      setReportId("");
      setCertNumber("");
      await fetchData();
    } catch (err: any) {
      triggerToast(err.message || "Gagal menerbitkan sertifikat.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── hapus sertifikat ─────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Hapus sertifikat ini dari arsip?")) return;
    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (error) { triggerToast("Gagal menghapus.", "error"); return; }
    triggerToast("Sertifikat dihapus.");
    await fetchData();
  };

  // ── format tanggal lokal ──────────────────────────────────────
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* Toast */}
      {toast.show && (
        <div className={`cert-toast ${toast.type}`}>{toast.message}</div>
      )}

      {/* Page Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--color-gray-900)", margin: 0 }}>
          🏅 Kelola Sertifikat
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", margin: "0.25rem 0 0" }}>
          Terbitkan sertifikat kelulusan dan kelola arsip sertifikat siswa.
        </p>
      </div>

      <div className="cert-page-grid">
        {/* ── Form Terbitkan ────────────────────────────────────── */}
        <div className="cert-card">
          <h2 className="cert-card-title">✍️ Terbitkan Sertifikat Baru</h2>
          <form onSubmit={handleSubmit}>

            {/* Pilih Siswa */}
            <div className="cert-form-group">
              <label>Filter Siswa (Opsional)</label>
              <select className="cert-form-select" value={studentId} onChange={e => { setStudentId(e.target.value); setReportId(""); setCertNumber(""); }}>
                <option value="">— Tampilkan semua rapor —</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.program})</option>
                ))}
              </select>
            </div>

            {/* Pilih Rapor */}
            <div className="cert-form-group">
              <label>Pilih Rapor / Modul *</label>
              <select className="cert-form-select" value={reportId} onChange={e => handleReportChange(e.target.value)} required>
                <option value="">— Pilih rapor yang belum bersertifikat —</option>
                {availableReports.map(r => {
                  const stu = students.find(s => s.id === r.student_id);
                  return (
                    <option key={r.id} value={r.id}>
                      {stu?.name || r.student_id} — {r.module_name}
                    </option>
                  );
                })}
              </select>
              {availableReports.length === 0 && !loading && (
                <p style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", margin: "0.3rem 0 0" }}>
                  ✅ Semua rapor sudah memiliki sertifikat.
                </p>
              )}
            </div>

            {/* Nomor Sertifikat */}
            <div className="cert-form-group">
              <label>Nomor Sertifikat *</label>
              <div className="cert-number-row">
                <input
                  type="text"
                  className="cert-form-input"
                  value={certNumber}
                  onChange={e => setCertNumber(e.target.value)}
                  placeholder="Otomatis saat rapor dipilih"
                  required
                />
                <span className="cert-auto-badge">Otomatis</span>
              </div>
            </div>

            {/* Template Halaman Depan */}
            <div className="cert-form-group">
              <label>Template Halaman Depan *</label>
              <select className="cert-form-select" value={templateUrl} onChange={e => setTemplateUrl(e.target.value)} required>
                <option value="">— Pilih template dari bucket —</option>
                {templates.map((url, i) => {
                  const name = url.split("/").pop()?.replace(/%20/g, " ") || `Template ${i + 1}`;
                  return <option key={url} value={url}>{name}</option>;
                })}
              </select>
            </div>

            {/* Nama Tutor */}
            <div className="cert-form-group">
              <label>Nama Tutor / Penandatangan</label>
              <input
                type="text"
                className="cert-form-input"
                value={tutorName}
                onChange={e => setTutorName(e.target.value)}
              />
            </div>

            {/* Tanggal Terbit */}
            <div className="cert-form-group">
              <label>Tanggal Terbit</label>
              <input
                type="date"
                className="cert-form-input"
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
              />
            </div>

            <button type="submit" className="cert-submit-btn" disabled={submitting}>
              {submitting ? "⏳ Menerbitkan..." : "🏅 Terbitkan Sertifikat"}
            </button>
          </form>
        </div>

        {/* ── Arsip Sertifikat ───────────────────────────────────── */}
        <div className="cert-card">
          <h2 className="cert-card-title">
            📋 Arsip Sertifikat
            <span style={{ marginLeft: "auto", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-gray-500)" }}>
              {certificates.length} sertifikat
            </span>
          </h2>

          {loading ? (
            <p style={{ textAlign: "center", color: "var(--color-gray-500)", padding: "2rem" }}>Memuat data...</p>
          ) : certificates.length === 0 ? (
            <div className="cert-empty-state">
              <p style={{ fontSize: "2rem" }}>🏅</p>
              <p style={{ fontWeight: 700 }}>Belum ada sertifikat diterbitkan</p>
              <p>Terbitkan sertifikat pertama menggunakan formulir di sebelah kiri.</p>
            </div>
          ) : (
            <div className="cert-table-wrapper">
              <table className="cert-table">
                <thead>
                  <tr>
                    <th>Nama Siswa</th>
                    <th>Program</th>
                    <th>Nomor Sertifikat</th>
                    <th>Tanggal Terbit</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map(cert => (
                    <tr key={cert.id}>
                      <td style={{ fontWeight: 600 }}>{cert.students?.name || "—"}</td>
                      <td>
                        <span className="cert-program-badge">
                          {cert.students?.program || cert.module_name}
                        </span>
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>{cert.cert_number}</td>
                      <td>{fmtDate(cert.issue_date)}</td>
                      <td>
                        <div className="cert-action-row">
                          <a
                            href={`/api/generate-certificate?id=${cert.id}&origin=${typeof window !== "undefined" ? window.location.origin : ""}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cert-btn-download"
                          >
                            ⬇ PDF
                          </a>
                          <button className="cert-btn-delete" onClick={() => handleDelete(cert.id)}>
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
