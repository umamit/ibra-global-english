"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/utils/supabase/client";
import AICopilotWidget from "@/components/AICopilotWidget";
import "@/app/dashboard.css";
import "@/app/dashboard-print.css";
import TutorAttendance from "./components/TutorAttendance";
import TutorReports from "./components/TutorReports";
import TutorLMS from "./components/TutorLMS";

import { Student, LmsMaterial, LmsSubmission } from "@/types";
import { formatRupiah } from "../admin/utils";

interface AttendanceEntry {
  status: string;
  notes: string;
  isExisting?: boolean;
}

interface Toast {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export default function TutorPortal() {
  const router = useRouter();
  const supabase = createClient();
  const adminSupabase = createServiceRoleClient();

  const [loading, setLoading] = useState<boolean>(true);
  const [tutorName, setTutorName] = useState<string>("Tutor Pendamping");
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("attendance"); // "attendance", "reports", "lms"

  // Students list
  const [students, setStudents] = useState<Student[]>([]);

  // Attendance State
  const [attendanceDate, setAttendanceDate] = useState<string>("");
  const [attendanceLoading, setAttendanceLoading] = useState<boolean>(false);
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceEntry>>({}); // { student_id: { status, notes } }
  const [toast, setToast] = useState<Toast>({ show: false, message: "", type: "success" });

  // Report State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [moduleName, setModuleName] = useState<string>("");
  const [speakingScore, setSpeakingScore] = useState<number>(85);
  const [grammarScore, setGrammarScore] = useState<number>(85);
  const [vocabularyScore, setVocabularyScore] = useState<number>(85);
  const [activeScore, setActiveScore] = useState<number>(85);
  const [tutorNotes, setTutorNotes] = useState<string>("");

  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const handleGenerateAiNotes = async () => {
    if (!selectedStudent) {
      alert("Harap pilih siswa terlebih dahulu!");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "auto-draft",
          payload: {
            name: selectedStudent.name,
            program: selectedStudent.program,
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
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [reportsList, setReportsList] = useState<Record<string, unknown>[]>([]);
  const [certificates, setCertificates] = useState<Record<string, unknown>[]>([]);

  // LMS State
  const [lmsMaterials, setLmsMaterials] = useState<LmsMaterial[]>([]);
  const [lmsTitle, setLmsTitle] = useState<string>("");
  const [lmsDesc, setLmsDesc] = useState<string>("");
  const [lmsProgram, setLmsProgram] = useState<string>("Kids Program");
  const [lmsType, setLmsType] = useState<string>("materi"); // 'materi', 'tugas'
  const [lmsDueDate, setLmsDueDate] = useState<string>("");
  const [lmsFile, setLmsFile] = useState<File | null>(null);
  const [lmsUploading, setLmsUploading] = useState<boolean>(false);

  // Grading State
  const [activeLmsGrading, setActiveLmsGrading] = useState<LmsMaterial | null>(null);
  const [lmsSubmissions, setLmsSubmissions] = useState<LmsSubmission[]>([]);
  const [studentGrade, setStudentGrade] = useState<string>("");
  const [studentFeedback, setStudentFeedback] = useState<string>("");
  const [selectedSubmission, setSelectedSubmission] = useState<LmsSubmission | null>(null);
  const [gradingLoading, setGradingLoading] = useState<boolean>(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  useEffect(() => {
    // Set today's date
    setTimeout(() => {
      setAttendanceDate(new Date().toISOString().split("T")[0]);
    }, 0);

    async function checkAuthAndLoad() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        // Check profiles role
        const { data: profile, error: errP } = await adminSupabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .single();

        if (errP || (profile?.role !== "tutor" && profile?.role !== "admin")) {
          alert("Akses ditolak: Portal khusus untuk pengajar / Tutor.");
          await supabase.auth.signOut();
          router.push("/login");
          return;
        }

        setTutorName(profile?.full_name || "Tutor Pendamping");

        // Load students
        const { data: stdList, error: errS } = await adminSupabase
          .from("students")
          .select("id, name, program")
          .order("name", { ascending: true });

        if (errS) throw errS;
        setStudents((stdList as Student[]) || []);

        setSelectedStudent(null);

        // Load recent reports list
        const { data: repList } = await adminSupabase
          .from("reports")
          .select("*, students(name)")
          .order("created_at", { ascending: false })
          .limit(10);
        setReportsList(repList || []);

        // Load certificates
        const { data: certList } = await adminSupabase
          .from("certificates")
          .select("*");
        setCertificates(certList || []);

        // Load LMS Materials
        const { data: lmsMatList } = await adminSupabase
          .from("lms_materials")
          .select("*")
          .order("created_at", { ascending: false });
        setLmsMaterials((lmsMatList as LmsMaterial[]) || []);

      } catch (err) {
        console.error("Error loading tutor portal:", err);
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndLoad();
  }, [router, supabase, adminSupabase]);

  // Load attendance when date changes
  useEffect(() => {
    if (!attendanceDate || students.length === 0) return;

    async function loadAttendanceForDate() {
      setAttendanceLoading(true);
      try {
        const { data: attList, error } = await adminSupabase
          .from("attendance")
          .select("student_id, status, notes")
          .eq("date", attendanceDate);

        if (error) throw error;

        const initialData: Record<string, AttendanceEntry> = {};
        students.forEach((s) => {
          const match = attList?.find((a: { student_id: string; status: string; notes: string }) => a.student_id === s.id);
          initialData[s.id] = {
            status: match ? match.status : "hadir",
            notes: match && match.notes ? match.notes : "",
            isExisting: !!match
          };
        });
        setAttendanceData(initialData);
      } catch (err) {
        console.error("Gagal memuat absensi harian:", err);
      } finally {
        setAttendanceLoading(false);
      }
    }

    loadAttendanceForDate();
  }, [attendanceDate, students, adminSupabase]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  };

  const handleSaveAttendance = async () => {
    setAttendanceLoading(true);
    try {
      const payload = Object.keys(attendanceData).map((studentId) => ({
        student_id: studentId,
        date: attendanceDate,
        status: attendanceData[studentId].status,
        notes: attendanceData[studentId].notes.trim() || null
      }));

      const { error } = await adminSupabase
        .from("attendance")
        .upsert(payload, { onConflict: "student_id, date" });

      if (error) throw error;

      // Send simulated WhatsApp notification for absent students (status: 'alfa')
      try {
        const absentStudents = payload.filter(p => p.status === 'alfa');
        for (const ast of absentStudents) {
          const studentObj = students.find(s => s.id === ast.student_id);
          const studentName = studentObj ? studentObj.name : "Siswa";
          await fetch("/api/whatsapp-simulator", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phone: "6281357001357",
              message: `Pemberitahuan Ketidakhadiran: Siswa atas nama *${studentName}* tercatat tidak hadir (ALFA) pada kelas bimbingan hari ini tanggal *${attendanceDate}* tanpa keterangan. Harap hubungi Admin Ibra Global English jika berhalangan.`,
              type: "Absensi Alfa"
            })
          });
        }
      } catch (waErr) {
        console.error("Gagal mengirim notifikasi WhatsApp simulasi:", waErr);
      }

      showToast("Absensi siswa berhasil disimpan!");
    } catch (err) {
      console.error("Gagal menyimpan absensi:", err);
      showToast("Gagal menyimpan absensi: " + (err instanceof Error ? err.message : String(err)), "error");
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleSaveReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStudent || !moduleName.trim()) {
      alert("Harap lengkapi nama modul dan pilih siswa!");
      return;
    }

    setReportLoading(true);
    try {
      const payload = {
        student_id: selectedStudent.id,
        module_name: moduleName.trim(),
        speaking_score: parseInt(String(speakingScore)) || 0,
        grammar_score: parseInt(String(grammarScore)) || 0,
        vocabulary_score: parseInt(String(vocabularyScore)) || 0,
        active_score: parseInt(String(activeScore)) || 0,
        tutor_notes: tutorNotes.trim() || null
      };

      const { error } = await adminSupabase
        .from("reports")
        .insert(payload);

      if (error) throw error;

      showToast(`Rapor belajar untuk ${selectedStudent.name} berhasil diterbitkan!`);
      setModuleName("");
      setTutorNotes("");

      // Reload reports & certificates
      const { data: repList } = await adminSupabase
        .from("reports")
        .select("*, students(name)")
        .order("created_at", { ascending: false })
        .limit(10);
      setReportsList(repList || []);

      const { data: certList } = await adminSupabase
        .from("certificates")
        .select("*");
      setCertificates(certList || []);

    } catch (err) {
      console.error("Gagal menerbitkan rapor:", err);
      showToast("Gagal menerbitkan rapor: " + (err instanceof Error ? err.message : String(err)), "error");
    } finally {
      setReportLoading(false);
    }
  };

  const handleSaveLmsMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!lmsTitle.trim() || !lmsProgram) {
      alert("Judul dan Program harus diisi!");
      return;
    }

    setLmsUploading(true);
    try {
      let fileUrl: string | null = null;

      // Upload file to Supabase storage if file is selected
      if (lmsFile) {
        const fileExt = lmsFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `materials/${fileName}`;

        const { data: uploadData, error: uploadError } = await adminSupabase
          .storage
          .from("lms-files")
          .upload(filePath, lmsFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = adminSupabase
          .storage
          .from("lms-files")
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
      }

      const payload = {
        title: lmsTitle.trim(),
        description: lmsDesc.trim() || null,
        program: lmsProgram,
        type: lmsType,
        file_url: fileUrl,
        due_date: lmsType === "tugas" && lmsDueDate ? new Date(lmsDueDate).toISOString() : null,
        tutor_name: tutorName
      };

      const { error } = await adminSupabase
        .from("lms_materials")
        .insert(payload);

      if (error) throw error;

      showToast(`${lmsType === "materi" ? "Materi" : "Tugas"} berhasil diterbitkan!`);

      // Reset form
      setLmsTitle("");
      setLmsDesc("");
      setLmsDueDate("");
      setLmsFile(null);
      // Reset file input in HTML if needed
      const fileInput = document.getElementById("lms-file-input") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";

      // Reload list
      const { data: lmsMatList } = await adminSupabase
        .from("lms_materials")
        .select("*")
        .order("created_at", { ascending: false });
      setLmsMaterials((lmsMatList as LmsMaterial[]) || []);

    } catch (err) {
      console.error("Gagal menerbitkan LMS:", err);
      showToast("Gagal menerbitkan: " + (err instanceof Error ? err.message : String(err)), "error");
    } finally {
      setLmsUploading(false);
    }
  };

  const handleDeleteLmsMaterial = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus materi/tugas ini? Semua pengumpulan tugas siswa terkait juga akan terhapus!")) return;
    try {
      const { error } = await adminSupabase
        .from("lms_materials")
        .delete()
        .eq("id", id);
      if (error) throw error;
      showToast("Materi/tugas berhasil dihapus!");

      // Reload list
      const { data: lmsMatList } = await adminSupabase
        .from("lms_materials")
        .select("*")
        .order("created_at", { ascending: false });
      setLmsMaterials((lmsMatList as LmsMaterial[]) || []);
      if (activeLmsGrading?.id === id) {
        setActiveLmsGrading(null);
      }
    } catch (err) {
      console.error("Gagal menghapus:", err);
      showToast("Gagal menghapus: " + (err instanceof Error ? err.message : String(err)), "error");
    }
  };

  const handleViewSubmissions = async (material: LmsMaterial) => {
    setActiveLmsGrading(material);
    setSelectedSubmission(null);
    setStudentGrade("");
    setStudentFeedback("");
    try {
      const { data: subList, error } = await adminSupabase
        .from("lms_submissions")
        .select("*, students(name)")
        .eq("material_id", material.id);
      if (error) throw error;
      setLmsSubmissions(subList || []);
    } catch (err) {
      console.error("Gagal memuat jawaban siswa:", err);
      showToast("Gagal memuat jawaban siswa: " + (err instanceof Error ? err.message : String(err)), "error");
    }
  };

  const handleSaveGrade = async (submissionId: string) => {
    setGradingLoading(true);
    try {
      const { error } = await adminSupabase
        .from("lms_submissions")
        .update({
          grade: studentGrade.trim() || null,
          feedback: studentFeedback.trim() || null
        })
        .eq("id", submissionId);
      if (error) throw error;
      showToast("Penilaian berhasil disimpan!");

      // Reload submissions
      if (activeLmsGrading) {
        handleViewSubmissions(activeLmsGrading);
      }
    } catch (err) {
      console.error("Gagal menyimpan penilaian:", err);
      showToast("Gagal menilai: " + (err instanceof Error ? err.message : String(err)), "error");
    } finally {
      setGradingLoading(false);
    }
  };

  const handleLogout = async () => {

    if (confirm("Apakah Anda yakin ingin keluar dari portal Tutor?")) {
      await supabase.auth.signOut();
      sessionStorage.clear();
      document.cookie = "login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/login");
    }
  };



  const handlePrintReport = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (students.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    const headers = ["No", "Nama Siswa", "Program", "Status Kehadiran", "Catatan"];
    const rows = students.map((s, idx) => {
      const data = attendanceData[s.id] || { status: "hadir", notes: "" };
      return [
        idx + 1,
        s.name,
        s.program,
        data.status,
        data.notes || "-"
      ];
    });

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    rows.forEach(row => {
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan-presensi-${attendanceDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div style={{ textAlign: "center", color: "var(--color-gray-500)" }}>
          <svg style={{ animation: "spin 1s linear infinite", width: "40px", height: "40px", marginBottom: "1rem", color: "var(--color-primary)" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <p style={{ fontWeight: "600" }}>Memuat Portal Tutor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 100,
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          backgroundColor: "var(--color-primary)",
          color: "white",
          border: "none",
          boxShadow: "var(--shadow-lg)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        className="mobile-toggle-btn"
        aria-label="Toggle Sidebar"
      >
        {mobileOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        )}
      </button>

      {/* Toast notifications */}
      {toast.show && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          padding: "1rem 1.5rem",
          borderRadius: "8px",
          backgroundColor: toast.type === "success" ? "#10b981" : "#ef4444",
          color: "white",
          fontWeight: "600",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          {toast.type === "success" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <img src="/assets/logo.png" alt="Ibra Logo" className="sidebar-brand-img" />
          <div className="sidebar-brand-text">
            <h2>Ibra Global English</h2>
            <p>Portal Pengajar / Tutor</p>
          </div>
        </div>

        <div className="sidebar-nav">
          <button
            onClick={() => { setActiveTab("attendance"); setMobileOpen(false); }}
            className={`sidebar-nav-link ${activeTab === "attendance" ? "active" : ""}`}
            style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <span>Input Presensi</span>
          </button>

          <button
            onClick={() => { setActiveTab("reports"); setMobileOpen(false); }}
            className={`sidebar-nav-link ${activeTab === "reports" ? "active" : ""}`}
            style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
            <span>Input Nilai Rapor</span>
          </button>

          <button
            onClick={() => { setActiveTab("lms"); setMobileOpen(false); }}
            className={`sidebar-nav-link ${activeTab === "lms" ? "active" : ""}`}
            style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <span>LMS - Kelas Digital</span>
          </button>
        </div>


        <div className="sidebar-footer" style={{ padding: "1rem", textAlign: "center" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--color-gray-400)" }}>Tutor Dashboard v1.0</span>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div className="topbar-title">
            <h1>Halo Coach, {tutorName}</h1>
            <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
              Silakan kelola absensi harian dan input rekap rapor akademik modul siswa Anda.
            </p>
          </div>
          <div className="topbar-user">
            <button onClick={handleLogout} className="btn-logout" style={{ width: "auto", padding: "0.4rem 0.85rem", fontSize: "0.8rem", display: "inline-flex" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* TAB 1: ATTENDANCE INPUT */}
        {activeTab === "attendance" && (
          <TutorAttendance
            students={students}
            attendanceDate={attendanceDate}
            setAttendanceDate={setAttendanceDate}
            attendanceLoading={attendanceLoading}
            attendanceData={attendanceData}
            handleStatusChange={handleStatusChange}
            handleNotesChange={handleNotesChange}
            handleSaveAttendance={handleSaveAttendance}
          />
        )}

        {/* TAB 2: REPORTS INPUT */}
        {activeTab === "reports" && (
          <TutorReports
            students={students}
            attendanceData={attendanceData}
            attendanceDate={attendanceDate}
            formatRupiah={formatRupiah}
            onPrintReport={handlePrintReport}
            onExportCSV={handleExportCSV}
          />
        )}

        {/* TAB 3: LMS MANAGEMENT */}
        {activeTab === "lms" && (
          <TutorLMS
            students={students}
            lmsMaterials={lmsMaterials}
            lmsSubmissions={lmsSubmissions}
            activeLmsGrading={activeLmsGrading}
            selectedSubmission={selectedSubmission}
            studentGrade={studentGrade}
            studentFeedback={studentFeedback}
            gradingLoading={gradingLoading}
            lmsUploading={lmsUploading}
            lmsTitle={lmsTitle}
            setLmsTitle={setLmsTitle}
            lmsDesc={lmsDesc}
            setLmsDesc={setLmsDesc}
            lmsProgram={lmsProgram}
            setLmsProgram={setLmsProgram}
            lmsType={lmsType}
            setLmsType={setLmsType}
            lmsDueDate={lmsDueDate}
            setLmsDueDate={setLmsDueDate}
            lmsFile={lmsFile}
            setLmsFile={setLmsFile}
            handleSaveLmsMaterial={handleSaveLmsMaterial}
            handleViewSubmissions={handleViewSubmissions}
            handleDeleteLmsMaterial={handleDeleteLmsMaterial}
            handleSaveGrade={handleSaveGrade}
            setSelectedSubmission={setSelectedSubmission}
            setStudentGrade={setStudentGrade}
            setStudentFeedback={setStudentFeedback}
          />
        )}

      </main>
      <AICopilotWidget />
    </div>
  );
}
