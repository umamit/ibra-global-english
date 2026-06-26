"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import SpeakingPractice from "@/components/SpeakingPractice";
import "@/app/dashboard.css";
import "@/app/dashboard-print.css";
import StudentDashboard from "./components/StudentDashboard";
import StudentModules from "./components/StudentModules";
import StudentAchievements from "./components/StudentAchievements";
import StudentLMS from "./components/StudentLMS";

export default function StudentPortal() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard", "modules", "achievements", "lms", "speaking"

  const [reports, setReports] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [totalCoins, setTotalCoins] = useState(0);

  // LMS State
  const [lmsMaterials, setLmsMaterials] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submittingMaterialId, setSubmittingMaterialId] = useState(null);
  const [submissionUploading, setSubmissionUploading] = useState(false);
  const [lmsSubTab, setLmsSubTab] = useState("materi"); // 'materi' or 'tugas'

  // B1 & B2: Pengumuman & Jadwal Online
  const [announcements, setAnnouncements] = useState([]);
  const [onlineSchedules, setOnlineSchedules] = useState([]);

  // Static files to download based on program
  const getModulesList = (program) => {
    if (program?.toLowerCase()?.includes("calistung")) {
      return [
        { name: "Modul 1: Lancar Membaca Suku Kata Basika", size: "2.4 MB", url: "#" },
        { name: "Lembar Kerja Menulis Huruf Hijaiyah & Angka", size: "1.8 MB", url: "#" },
        { name: "Modul Berhitung Cepat Kreatif (Calistung)", size: "3.1 MB", url: "#" }
      ];
    }
    if (program === "Teens Program") {
      return [
        { name: "Teens Speaking Practice: Daily Conversations", size: "4.2 MB", url: "#" },
        { name: "Grammar Handbook Level 2: Tenses & Sentence Structure", size: "3.5 MB", url: "#" },
        { name: "Vocab Booster: TOEFL & IELTS Foundations", size: "5.0 MB", url: "#" }
      ];
    }
    return [
      { name: "Kids Fun English Workbook Volume 1", size: "3.8 MB", url: "#" },
      { name: "Coloring & Vocabulary Activity Sheets", size: "2.1 MB", url: "#" },
      { name: "Interactive Songs & Chants Study Guide", size: "1.5 MB", url: "#" }
    ];
  };

  useEffect(() => {
    async function checkAuthAndLoad() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        // Check profiles role
        const { data: profile, error: errP } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .single();

        if (errP || (profile?.role !== "student" && profile?.role !== "admin")) {
          alert("Akses ditolak: Akun Anda bukan bertipe peran Siswa.");
          await supabase.auth.signOut();
          router.push("/login");
          return;
        }

        // Fetch student record linked to parent_id = user.id
        const { data: studentsList, error: errS } = await supabase
          .from("students")
          .select("*")
          .eq("parent_id", user.id);

        if (errS || !studentsList || studentsList.length === 0) {
          // Fallback if no student is linked, create a mock profile for testing
          setStudent({
            id: user.id,
            name: profile.full_name,
            program: "Kids Program",
            age: 10
          });
          return;
        }

        const activeStudent = studentsList[0];
        setStudent(activeStudent);

        // Fetch reports
        const { data: repList } = await supabase
          .from("reports")
          .select("*")
          .eq("student_id", activeStudent.id)
          .order("created_at", { ascending: false });
        setReports(repList || []);

        // Fetch certificates
        const { data: certList } = await supabase
          .from("certificates")
          .select("*")
          .eq("student_id", activeStudent.id);
        setCertificates(certList || []);

        // Fetch LMS Materials
        const { data: lmsList } = await supabase
          .from("lms_materials")
          .select("*")
          .eq("program", activeStudent.program)
          .order("created_at", { ascending: false });
        setLmsMaterials(lmsList || []);

        // Fetch Student Submissions
        const { data: subList } = await supabase
          .from("lms_submissions")
          .select("*")
          .eq("student_id", activeStudent.id);
        setMySubmissions(subList || []);

        // Fetch rewards
        const { data: rewList } = await supabase
          .from("student_rewards")
          .select("*")
          .eq("student_id", activeStudent.id)
          .order("created_at", { ascending: false });
        setRewards(rewList || []);

        const sumCoins = (rewList || []).reduce((sum, r) => sum + r.coins, 0);
        setTotalCoins(sumCoins);

        // B1: Fetch pengumuman aktif untuk program siswa
        try {
          const annRes = await fetch(`/api/announcements?program=${encodeURIComponent(activeStudent.program)}`);
          const { data: annData } = await annRes.json();
          setAnnouncements(annData || []);
        } catch (_) {}

        // B2: Fetch jadwal kelas online untuk program siswa
        try {
          const schRes = await fetch(`/api/online-schedule?program=${encodeURIComponent(activeStudent.program)}&upcoming=true`);
          const { data: schData } = await schRes.json();
          setOnlineSchedules(schData || []);
        } catch (_) {}

      } catch (err) {
        console.error("Error loading student portal:", err);
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndLoad();
  }, [router, supabase]);


  const handleSaveSubmission = async (materialId) => {
    if (!submissionFile) {
      alert("Harap pilih berkas jawaban terlebih dahulu!");
      return;
    }

    setSubmissionUploading(true);
    setSubmittingMaterialId(materialId);
    try {
      const fileExt = submissionFile.name.split(".").pop();
      const fileName = `${student.id}-${materialId}-${Date.now()}.${fileExt}`;
      const filePath = `submissions/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from("lms-files")
        .upload(filePath, submissionFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from("lms-files")
        .getPublicUrl(filePath);

      const payload = {
        material_id: materialId,
        student_id: student.id,
        file_url: publicUrl
      };

      const { error } = await supabase
        .from("lms_submissions")
        .insert(payload);

      if (error) throw error;

      alert("Jawaban tugas berhasil dikirim!");
      
      // Clear file
      setSubmissionFile(null);
      setSubmittingMaterialId(null);
      
      // Reload submissions
      const { data: subList } = await supabase
        .from("lms_submissions")
        .select("*")
        .eq("student_id", student.id);
      setMySubmissions(subList || []);

    } catch (err) {
      console.error("Gagal mengirim jawaban tugas:", err);
      alert("Gagal mengirim jawaban: " + err.message);
    } finally {
      setSubmissionUploading(false);
    }
  };

  const handleLogout = async () => {

    if (confirm("Apakah Anda yakin ingin keluar dari portal Siswa?")) {
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
          <p style={{ fontWeight: "600" }}>Memuat Dasbor Siswa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Mobile Menu Toggle */}
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

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <img src="/assets/logo.png" alt="Ibra Logo" className="sidebar-brand-img" />
          <div className="sidebar-brand-text">
            <h2>Ibra Global English</h2>
            <p>Portal Siswa / LMS</p>
          </div>
        </div>

        <div className="sidebar-nav">
          <button
            onClick={() => { setActiveTab("dashboard"); setMobileOpen(false); }}
            className={`sidebar-nav-link ${activeTab === "dashboard" ? "active" : ""}`}
            style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Dasbor Siswa</span>
          </button>

          <button
            onClick={() => { setActiveTab("modules"); setMobileOpen(false); }}
            className={`sidebar-nav-link ${activeTab === "modules" ? "active" : ""}`}
            style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>Tugas & Modul</span>
          </button>

          <button
            onClick={() => { setActiveTab("lms"); setMobileOpen(false); }}
            className={`sidebar-nav-link ${activeTab === "lms" ? "active" : ""}`}
            style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v21H6.5a2.5 2.5 0 0 1-2.5-2.5z"/></svg>
            <span>LMS - Pembelajaran</span>
          </button>

          <button
            onClick={() => { setActiveTab("achievements"); setMobileOpen(false); }}
            className={`sidebar-nav-link ${activeTab === "achievements" ? "active" : ""}`}
            style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
            <span>Pencapaian Koin</span>
          </button>

          <button
            onClick={() => { setActiveTab("speaking"); setMobileOpen(false); }}
            className={`sidebar-nav-link ${activeTab === "speaking" ? "active" : ""}`}
            style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
            <span>Latihan AI Speaking</span>
          </button>
        </div>

        <div className="sidebar-footer" style={{ padding: "1rem", textAlign: "center" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--color-gray-400)" }}>Siswa Dashboard v1.0</span>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div className="topbar-title">
            <h1>Selamat Belajar, {student?.name}!</h1>
            <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
              Program: <strong>{student?.program}</strong> (Usia {student?.age} tahun)
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {/* Spinning coin badge */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              backgroundColor: "rgba(250, 204, 21, 0.15)",
              color: "#a16207",
              padding: "0.45rem 1rem",
              borderRadius: "20px",
              fontWeight: "900",
              fontSize: "0.9rem",
              border: "1px solid rgba(250, 204, 21, 0.3)"
            }}>
              <span className="spinning-coin" style={{ display: "inline-block", animation: "spin 3s linear infinite" }}>🪙</span>
              <span>{totalCoins} Koin Ibra</span>
            </div>
            <button onClick={handleLogout} className="btn-logout" style={{ width: "auto", padding: "0.4rem 0.85rem", fontSize: "0.8rem", display: "inline-flex" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DASHBOARD RINGKASAN */}
        {activeTab === "dashboard" && (
          <StudentDashboard
            student={student}
            announcements={announcements}
            onlineSchedules={onlineSchedules}
            reports={reports}
            certificates={certificates}
            totalCoins={totalCoins}
          />
        )}

        {/* TAB 2: DOWNLOAD STUDY WORKSHEETS */}
        {activeTab === "modules" && (
          <StudentModules
            student={student}
            getModulesList={getModulesList}
          />
        )}

        {/* TAB 3: ACHIEVEMENT COINS */}
        {activeTab === "achievements" && (
          <StudentAchievements
            rewards={rewards}
          />
        )}

        {/* TAB 4: LMS PEMBELAJARAN */}
        {activeTab === "lms" && (
          <StudentLMS
            student={student}
            lmsMaterials={lmsMaterials}
            mySubmissions={mySubmissions}
            submissionFile={submissionFile}
            setSubmissionFile={setSubmissionFile}
            submittingMaterialId={submittingMaterialId}
            submissionUploading={submissionUploading}
            lmsSubTab={lmsSubTab}
            setLmsSubTab={setLmsSubTab}
            handleSaveSubmission={handleSaveSubmission}
          />
        )}

        {/* TAB 5: AI SPEAKING PRACTICE */}
        {activeTab === "speaking" && (
          <SpeakingPractice student={student} />
        )}
      </main>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}