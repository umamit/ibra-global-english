"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useDynamicIsland } from "../context/DynamicIslandContext";
import { Certificate, Student, Report } from "@/types";
import { buildCertNumber } from "./certHelpers";
import { CertificateArchiveTable } from "./CertificateArchiveTable";
import "./certificates.css";

interface CertWithStudent extends Certificate { students?: { name: string; program: string } | null; }

export default function AdminCertificatesPage() {
  const supabase = createClient();
  const island = useDynamicIsland();
  const [certificates, setCertificates] = useState<CertWithStudent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [templates, setTemplates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [studentId, setStudentId] = useState("");
  const [reportId, setReportId] = useState("");
  const [certNumber, setCertNumber] = useState("");
  const [tutorName, setTutorName] = useState("Husnita Usman, M.Pd.");
  const [templateUrl, setTemplateUrl] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const triggerToast = (message: string, type: "success"|"error" = "success") => {
    if (type === "success") {
      if (message.length > 25) {
        island.success("Berhasil", message);
      } else {
        island.success(message);
      }
    } else {
      if (message.length > 25) {
        island.error("Gagal", message);
      } else {
        island.error(message);
      }
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [certRes, stuRes, repRes] = await Promise.all([
        supabase.from("certificates").select("*, students(name, program)").order("created_at", { ascending: false }),
        supabase.from("students").select("id, name, program").eq("status", "aktif").order("name"),
        supabase.from("reports").select("id, student_id, module_name, speaking_score, grammar_score, vocabulary_score, active_score").order("created_at", { ascending: false }),
      ]);
      if (certRes.data) setCertificates(certRes.data as CertWithStudent[]);
      if (stuRes.data) setStudents(stuRes.data as Student[]);
      if (repRes.data) setReports(repRes.data as Report[]);
    } catch { triggerToast("Gagal memuat data.", "error"); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    setIssueDate(new Date().toISOString().split("T")[0]);
  }, []);

  const availableReports = reports.filter(r => !certificates.some(c => c.report_id === r.id) && (!studentId || r.student_id === studentId));

  const handleReportChange = (rId: string) => {
    setReportId(rId);
    const selectedRep = reports.find(r => r.id === rId);
    const selectedStu = students.find(s => s.id === selectedRep?.student_id);
    if (selectedStu) setCertNumber(buildCertNumber(selectedStu.program, certificates));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportId || !certNumber) return triggerToast("Rapor & nomor wajib diisi.", "error");
    setSubmitting(true);
    const rep = reports.find(r => r.id === reportId);
    if (!rep) return;
    try {
      const { error } = await supabase.from("certificates").insert([{
        student_id: rep.student_id, report_id: rep.id, cert_number: certNumber.trim(), module_name: rep.module_name,
        speaking_score: rep.speaking_score, grammar_score: rep.grammar_score, vocabulary_score: rep.vocabulary_score, active_score: rep.active_score,
        tutor_name: tutorName.trim(), template_url: templateUrl || null, issue_date: issueDate || new Date().toISOString().split("T")[0]
      }]);
      if (error) throw error;
      triggerToast("Sertifikat berhasil diterbitkan!"); setReportId(""); setCertNumber(""); fetchData();
    } catch (err: any) { triggerToast(err.message, "error"); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus sertifikat ini?")) return;
    try {
      const { error } = await supabase.from("certificates").delete().eq("id", id);
      if (error) throw error;
      triggerToast("Sertifikat dihapus."); fetchData();
    } catch (err: any) { triggerToast(err.message, "error"); }
  };

  return (
    <div className="cert-page">
      <div className="cert-page-grid">
        <div className="cert-card">
          <h2>Terbitkan Sertifikat Baru</h2>
          <form onSubmit={handleSubmit}>
            <select className="cert-form-select" value={reportId} onChange={e => handleReportChange(e.target.value)} required>
              <option value="">— Pilih rapor —</option>
              {availableReports.map(r => <option key={r.id} value={r.id}>{r.module_name}</option>)}
            </select>
            <input type="text" className="cert-form-input" value={certNumber} onChange={e => setCertNumber(e.target.value)} required />
            <button type="submit" className="cert-submit-btn" disabled={submitting}>{submitting ? "Menerbitkan..." : "Terbitkan"}</button>
          </form>
        </div>
        <CertificateArchiveTable certificates={certificates} loading={loading} fmtDate={(d: string) => new Date(d).toLocaleDateString("id-ID")} handleDelete={handleDelete} />
      </div>
    </div>
  );
}
