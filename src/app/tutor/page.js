"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/utils/supabase/client";

export default function TutorPortal() {
  const router = useRouter();
  const supabase = createClient();
  const adminSupabase = createServiceRoleClient();

  const [loading, setLoading] = useState(true);
  const [tutorName, setTutorName] = useState("Tutor Pendamping");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("attendance"); // "attendance", "reports"

  // Students list
  const [students, setStudents] = useState([]);
  
  // Attendance State
  const [attendanceDate, setAttendanceDate] = useState("");
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState({}); // { student_id: { status, notes } }
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Report State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [moduleName, setModuleName] = useState("");
  const [speakingScore, setSpeakingScore] = useState(85);
  const [grammarScore, setGrammarScore] = useState(85);
  const [vocabularyScore, setVocabularyScore] = useState(85);
  const [activeScore, setActiveScore] = useState(85);
  const [tutorNotes, setTutorNotes] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportsList, setReportsList] = useState([]);
  const [certificates, setCertificates] = useState([]);

  // LMS State
  const [lmsMaterials, setLmsMaterials] = useState([]);
  const [lmsTitle, setLmsTitle] = useState("");
  const [lmsDesc, setLmsDesc] = useState("");
  const [lmsProgram, setLmsProgram] = useState("Kids Program");
  const [lmsType, setLmsType] = useState("materi"); // 'materi', 'tugas'
  const [lmsDueDate, setLmsDueDate] = useState("");
  const [lmsFile, setLmsFile] = useState(null);
  const [lmsUploading, setLmsUploading] = useState(false);

  // Grading State
  const [activeLmsGrading, setActiveLmsGrading] = useState(null);
  const [lmsSubmissions, setLmsSubmissions] = useState([]);
  const [studentGrade, setStudentGrade] = useState("");
  const [studentFeedback, setStudentFeedback] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradingLoading, setGradingLoading] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  useEffect(() => {
    // Set today's date
    setAttendanceDate(new Date().toISOString().split("T")[0]);

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
        setStudents(stdList || []);

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
        setLmsMaterials(lmsMatList || []);

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

        const initialData = {};
        students.forEach((s) => {
          const match = attList?.find((a) => a.student_id === s.id);
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

  const handleStatusChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleNotesChange = (studentId, notes) => {
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
      showToast("Gagal menyimpan absensi: " + err.message, "error");
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleSaveReport = async (e) => {
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
        speaking_score: parseInt(speakingScore) || 0,
        grammar_score: parseInt(grammarScore) || 0,
        vocabulary_score: parseInt(vocabularyScore) || 0,
        active_score: parseInt(activeScore) || 0,
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
      showToast("Gagal menerbitkan rapor: " + err.message, "error");
    } finally {
      setReportLoading(false);
    }
  };

  const handleSaveLmsMaterial = async (e) => {
    e.preventDefault();
    if (!lmsTitle.trim() || !lmsProgram) {
      alert("Judul dan Program harus diisi!");
      return;
    }

    setLmsUploading(true);
    try {
      let fileUrl = null;

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
      const fileInput = document.getElementById("lms-file-input");
      if (fileInput) fileInput.value = "";

      // Reload list
      const { data: lmsMatList } = await adminSupabase
        .from("lms_materials")
        .select("*")
        .order("created_at", { ascending: false });
      setLmsMaterials(lmsMatList || []);

    } catch (err) {
      console.error("Gagal menerbitkan LMS:", err);
      showToast("Gagal menerbitkan: " + err.message, "error");
    } finally {
      setLmsUploading(false);
    }
  };

  const handleDeleteLmsMaterial = async (id) => {
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
      setLmsMaterials(lmsMatList || []);
      if (activeLmsGrading?.id === id) {
        setActiveLmsGrading(null);
      }
    } catch (err) {
      console.error("Gagal menghapus:", err);
      showToast("Gagal menghapus: " + err.message, "error");
    }
  };

  const handleViewSubmissions = async (material) => {
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
      showToast("Gagal memuat jawaban siswa: " + err.message, "error");
    }
  };

  const handleSaveGrade = async (submissionId) => {
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
      showToast("Gagal menilai: " + err.message, "error");
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

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div style={{ textAlign: "center", color: "var(--color-gray-50)" }}>
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
            <h2>Ibra English</h2>
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


        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Keluar Sesi</span>
          </button>
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
        </div>

        {/* TAB 1: ATTENDANCE INPUT */}
        {activeTab === "attendance" && (
          <div className="portal-card" style={{ padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)" }}>
                Lembar Presensi Harian Siswa
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <label style={{ fontWeight: "700", fontSize: "0.85rem" }}>Pilih Tanggal:</label>
                <input
                  type="date"
                  className="form-input"
                  style={{ width: "170px", padding: "0.45rem", fontSize: "0.85rem" }}
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                />
              </div>
            </div>

            {attendanceLoading ? (
              <div style={{ textAlign: "center", padding: "4rem 0" }}>
                <p style={{ color: "var(--color-gray-500)", fontWeight: "600" }}>Memuat lembar absensi...</p>
              </div>
            ) : students.length === 0 ? (
              <p style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-400)" }}>Belum ada siswa terdaftar.</p>
            ) : (
              <div>
                <div className="table-wrapper">
                  <table className="portal-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Nama Siswa</th>
                        <th>Program</th>
                        <th>Kehadiran</th>
                        <th>Catatan / Masukan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, idx) => {
                        const data = attendanceData[s.id] || { status: "hadir", notes: "" };
                        return (
                          <tr key={s.id}>
                            <td style={{ fontWeight: "700" }}>{idx + 1}</td>
                            <td style={{ fontWeight: "700" }}>{s.name}</td>
                            <td>
                              <span className="user-badge" style={{ fontSize: "0.75rem" }}>{s.program}</span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "0.75rem" }}>
                                {["hadir", "sakit", "izin", "alfa"].map((statusOption) => (
                                  <label key={statusOption} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600" }}>
                                    <input
                                      type="radio"
                                      name={`attendance-${s.id}`}
                                      checked={data.status === statusOption}
                                      onChange={() => handleStatusChange(s.id, statusOption)}
                                      style={{ accentColor: "var(--color-primary)" }}
                                    />
                                    <span style={{ textTransform: "capitalize" }}>{statusOption}</span>
                                  </label>
                                ))}
                              </div>
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-input"
                                style={{ padding: "0.35rem", fontSize: "0.85rem" }}
                                placeholder="Opsional..."
                                value={data.notes}
                                onChange={(e) => handleNotesChange(s.id, e.target.value)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                  <button className="btn-portal-primary" onClick={handleSaveAttendance} style={{ padding: "0.75rem 2rem" }}>
                    Simpan Presensi Hari Ini
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REPORTS INPUT */}
        {activeTab === "reports" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "2rem", alignItems: "start" }} className="report-detail-layout">
            
            {/* Form Input Rapor */}
            <div className="portal-card" style={{ padding: "2rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.5rem" }}>
                Input Kompetensi & Rapor Modul
              </h3>

              <form onSubmit={handleSaveReport}>
                <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                  <label className="form-label">Pilih Siswa</label>
                  <select
                    className="form-input"
                    value={selectedStudent?.id || ""}
                    onChange={(e) => {
                      const match = students.find(s => s.id === e.target.value);
                      setSelectedStudent(match || null);
                    }}
                    required
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.program})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                  <label className="form-label">Nama Modul Belajar (Wajib)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Modul 1 - Alphabet & Pronunciation"
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    required
                  />
                </div>

                {/* Score inputs */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                  <div className="form-group">
                    <label className="form-label">
                      {!selectedStudent 
                        ? "Skor Speaking / Membaca" 
                        : selectedStudent.program?.toLowerCase()?.includes("calistung") 
                          ? "Skor Membaca" 
                          : "Skor Speaking"
                      }
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      max="100"
                      value={speakingScore}
                      onChange={(e) => setSpeakingScore(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {!selectedStudent 
                        ? "Skor Grammar / Menulis" 
                        : selectedStudent.program?.toLowerCase()?.includes("calistung") 
                          ? "Skor Menulis" 
                          : "Skor Grammar"
                      }
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      max="100"
                      value={grammarScore}
                      onChange={(e) => setGrammarScore(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {!selectedStudent 
                        ? "Skor Vocabulary / Berhitung" 
                        : selectedStudent.program?.toLowerCase()?.includes("calistung") 
                          ? "Skor Berhitung" 
                          : "Skor Vocabulary"
                      }
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      max="100"
                      value={vocabularyScore}
                      onChange={(e) => setVocabularyScore(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Keaktifan Kelas</label>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      max="100"
                      value={activeScore}
                      onChange={(e) => setActiveScore(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                  <label className="form-label">Catatan Masukan Tutor</label>
                  <textarea
                    className="form-input"
                    style={{ minHeight: "80px", fontFamily: "inherit" }}
                    placeholder="Siswa sangat antusias dan percaya diri. Rekomendasi naik ke tingkat berikutnya..."
                    value={tutorNotes}
                    onChange={(e) => setTutorNotes(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-portal-primary"
                  style={{ width: "100%", padding: "0.85rem" }}
                  disabled={reportLoading}
                >
                  {reportLoading ? "Menerbitkan Rapor..." : "Terbitkan Rapor Hasil Belajar"}
                </button>
              </form>
            </div>

            {/* List Rapor yang Baru Terbit */}
            <div className="portal-card" style={{ padding: "2rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.5rem" }}>
                Aktivitas Rapor Terbaru
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "500px", overflowY: "auto" }}>
                {reportsList.length === 0 ? (
                  <p style={{ color: "var(--color-gray-400)", textAlign: "center", padding: "3rem 0" }}>Belum ada aktivitas nilai diunggah.</p>
                ) : (
                  reportsList.map((rep) => (
                    <div key={rep.id} style={{ borderBottom: "1px solid var(--color-gray-100)", paddingBottom: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ color: "var(--color-primary-dark)" }}>{rep.students?.name}</strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-gray-400)" }}>
                          {new Date(rep.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-gray-800)" }}>{rep.module_name}</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginTop: "2px" }}>
                        Rata-rata: <strong>{Math.round((rep.speaking_score + rep.grammar_score + rep.vocabulary_score + rep.active_score) / 4)} / 100</strong>
                      </p>
                      {(() => {
                        const existingCert = certificates.find(
                          (c) => c.report_id === rep.id || (c.student_id === rep.student_id && c.module_name?.toLowerCase() === rep.module_name?.toLowerCase())
                        );
                        if (existingCert) {
                          return (
                            <div style={{ marginTop: "6px" }}>
                              <a
                                href={`/verify/${existingCert.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  fontSize: "0.72rem",
                                  fontWeight: "800",
                                  color: "var(--color-accent)",
                                  textDecoration: "none",
                                  backgroundColor: "rgba(166, 136, 73, 0.08)",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  border: "1px solid rgba(166, 136, 73, 0.2)"
                                }}
                              >
                                <span>★ Sertifikat Terbit</span>
                              </a>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {activeTab === "lms" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "2rem", alignItems: "start" }} className="report-detail-layout">
            
            {/* Form Section */}
            <div className="portal-card" style={{ padding: "2rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.5rem" }}>
                Unggah Materi & Tugas Baru
              </h3>
              <form onSubmit={handleSaveLmsMaterial}>
                
                <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                  <label className="form-label">Judul Materi / Tugas</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Modul 1 - Tenses dasar atau PR Grammar"
                    value={lmsTitle}
                    onChange={(e) => setLmsTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                  <label className="form-label">Deskripsi & Instruksi</label>
                  <textarea
                    className="form-input"
                    style={{ minHeight: "80px", fontFamily: "inherit" }}
                    placeholder="Tuliskan petunjuk atau detail materi/tugas di sini..."
                    value={lmsDesc}
                    onChange={(e) => setLmsDesc(e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                  <div className="form-group">
                    <label className="form-label">Program Belajar</label>
                    <select
                      className="form-input"
                      value={lmsProgram}
                      onChange={(e) => setLmsProgram(e.target.value)}
                    >
                      <option value="Kids Program">Kids Program</option>
                      <option value="Teens Program">Teens Program</option>
                      <option value="Fun Calistung">Fun Calistung</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kategori</label>
                    <select
                      className="form-input"
                      value={lmsType}
                      onChange={(e) => setLmsType(e.target.value)}
                    >
                      <option value="materi">Materi Belajar</option>
                      <option value="tugas">Tugas Rumah (PR)</option>
                    </select>
                  </div>
                </div>

                {lmsType === "tugas" && (
                  <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                    <label className="form-label">Tenggat Waktu Pengumpulan (Due Date)</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={lmsDueDate}
                      onChange={(e) => setLmsDueDate(e.target.value)}
                      required={lmsType === "tugas"}
                    />
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: "1.75rem" }}>
                  <label className="form-label">Lampiran Berkas (PDF, Dokumen, atau Gambar)</label>
                  <input
                    id="lms-file-input"
                    type="file"
                    className="form-input"
                    onChange={(e) => setLmsFile(e.target.files[0])}
                    style={{ padding: "0.5rem" }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-portal-primary"
                  style={{ width: "100%", padding: "0.85rem" }}
                  disabled={lmsUploading}
                >
                  {lmsUploading ? "Mengunggah..." : "Terbitkan ke LMS"}
                </button>

              </form>
            </div>

            {/* List & Submissions Section */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              
              {/* List of LMS Materials */}
              <div className="portal-card" style={{ padding: "2rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.5rem" }}>
                  Daftar Konten LMS Aktif
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "400px", overflowY: "auto" }}>
                  {lmsMaterials.length === 0 ? (
                    <p style={{ color: "var(--color-gray-400)", textAlign: "center", padding: "2rem 0" }}>Belum ada materi atau tugas yang diunggah.</p>
                  ) : (
                    lmsMaterials.map((mat) => (
                      <div key={mat.id} style={{ borderBottom: "1px solid var(--color-gray-100)", paddingBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "4px" }}>
                            <span style={{ 
                              fontSize: "0.7rem", 
                              fontWeight: "bold", 
                              padding: "2px 6px", 
                              borderRadius: "4px", 
                              backgroundColor: mat.type === "materi" ? "rgba(74, 155, 168, 0.1)" : "rgba(166, 136, 73, 0.1)",
                              color: mat.type === "materi" ? "var(--color-primary)" : "var(--color-accent)",
                              textTransform: "uppercase"
                            }}>
                              {mat.type}
                            </span>
                            <span style={{ fontSize: "0.75rem", color: "var(--color-gray-400)" }}>{mat.program}</span>
                          </div>
                          <strong style={{ color: "var(--color-gray-900)", fontSize: "0.95rem" }}>{mat.title}</strong>
                          {mat.due_date && (
                            <p style={{ fontSize: "0.75rem", color: "var(--color-red)", marginTop: "2px", fontWeight: "bold" }}>
                              Tenggat: {new Date(mat.due_date).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                          {mat.file_url && (
                            <a href={mat.file_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", fontSize: "0.75rem", color: "var(--color-primary)", marginTop: "4px" }}>
                              📁 Buka File Lampiran
                            </a>
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", alignItems: "flex-end" }}>
                          {mat.type === "tugas" && (
                            <button 
                              className="btn-portal-outline" 
                              style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", borderColor: "var(--color-primary)", color: "var(--color-primary)", cursor: "pointer" }}
                              onClick={() => handleViewSubmissions(mat)}
                            >
                              Jawaban Siswa
                            </button>
                          )}
                          <button 
                            className="btn-portal-danger" 
                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", cursor: "pointer" }}
                            onClick={() => handleDeleteLmsMaterial(mat.id)}
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Submissions/Grading Panel */}
              {activeLmsGrading && (
                <div className="portal-card animate-scale-in" style={{ padding: "2rem", borderLeft: "4px solid var(--color-primary)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--color-gray-900)", margin: "0" }}>
                      Jawaban Siswa: {activeLmsGrading.title}
                    </h3>
                    <button 
                      style={{ background: "none", border: "none", color: "var(--color-gray-400)", cursor: "pointer", fontSize: "1.25rem", fontWeight: "bold" }}
                      onClick={() => setActiveLmsGrading(null)}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "350px", overflowY: "auto" }}>
                    {lmsSubmissions.length === 0 ? (
                      <p style={{ color: "var(--color-gray-400)", textAlign: "center", padding: "1.5rem 0" }}>Belum ada siswa yang mengumpulkan jawaban.</p>
                    ) : (
                      lmsSubmissions.map((sub) => (
                        <div key={sub.id} style={{ borderBottom: "1px solid var(--color-gray-100)", paddingBottom: "1rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <strong style={{ color: "var(--color-gray-800)" }}>{sub.students?.name}</strong>
                            <span style={{ fontSize: "0.7rem", color: "var(--color-gray-400)" }}>
                              {new Date(sub.submitted_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                            <a href={sub.file_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: "bold" }}>
                              📁 Buka File Jawaban Siswa
                            </a>
                            
                            {sub.grade ? (
                              <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "4px", backgroundColor: "rgba(166,136,73,0.1)", color: "var(--color-accent)", fontWeight: "bold" }}>
                                Nilai: {sub.grade} {sub.feedback ? "✓" : ""}
                              </span>
                            ) : (
                              <span style={{ fontSize: "0.7rem", color: "var(--color-red)", fontWeight: "bold" }}>
                                Belum Dinilai
                              </span>
                            )}
                          </div>

                          {/* Grade Action form inline */}
                          {selectedSubmission?.id === sub.id ? (
                            <div style={{ marginTop: "1rem", backgroundColor: "var(--color-gray-50)", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-150)" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                                <input
                                  type="text"
                                  className="form-input"
                                  placeholder="Nilai (0-100)"
                                  value={studentGrade}
                                  onChange={(e) => setStudentGrade(e.target.value)}
                                  style={{ padding: "0.35rem 0.5rem", fontSize: "0.8rem" }}
                                />
                                <input
                                  type="text"
                                  className="form-input"
                                  placeholder="Catatan umpan balik..."
                                  value={studentFeedback}
                                  onChange={(e) => setStudentFeedback(e.target.value)}
                                  style={{ padding: "0.35rem 0.5rem", fontSize: "0.8rem" }}
                                />
                              </div>
                              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                <button 
                                  className="btn-portal-outline" 
                                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", cursor: "pointer" }}
                                  onClick={() => setSelectedSubmission(null)}
                                >
                                  Batal
                                </button>
                                <button 
                                  className="btn-portal-primary" 
                                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", cursor: "pointer" }}
                                  onClick={() => handleSaveGrade(sub.id)}
                                  disabled={gradingLoading}
                                >
                                  {gradingLoading ? "Menyimpan..." : "Simpan Nilai"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              className="btn-portal-outline"
                              style={{ 
                                padding: "0.25rem 0.5rem", 
                                fontSize: "0.75rem", 
                                borderColor: "var(--color-accent)", 
                                color: "var(--color-accent)", 
                                cursor: "pointer", 
                                marginTop: "8px", 
                                display: "block" 
                              }}
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setStudentGrade(sub.grade || "");
                                setStudentFeedback(sub.feedback || "");
                              }}
                            >
                              {sub.grade ? "Edit Penilaian" : "Beri Nilai & Masukan"}
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
