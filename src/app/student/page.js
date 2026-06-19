"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// SUB-COMPONENT: Simple visual Radar Chart for Student Performance
function MiniRadarChart({ speaking, grammar, vocabulary, active, isCalistung }) {
  const cx = 80;
  const cy = 80;
  const r = 50;

  const pSpeaking = { x: cx, y: cy - r * (speaking / 100) };
  const pGrammar = { x: cx + r * (grammar / 100), y: cy };
  const pVocabulary = { x: cx, y: cy + r * (vocabulary / 100) };
  const pActive = { x: cx - r * (active / 100), y: cy };

  const polygonPoints = `${pSpeaking.x},${pSpeaking.y} ${pGrammar.x},${pGrammar.y} ${pVocabulary.x},${pVocabulary.y} ${pActive.x},${pActive.y}`;

  return (
    <svg width="160" height="160" viewBox="0 0 160 160" style={{ overflow: "visible" }}>
      {[25, 50, 75, 100].map((percent) => {
        const gridR = r * (percent / 100);
        return (
          <polygon
            key={percent}
            points={`${cx},${cy - gridR} ${cx + gridR},${cy} ${cx},${cy + gridR} ${cx - gridR},${cy}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="0.8"
            strokeDasharray="2,2"
          />
        );
      })}
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#cbd5e1" strokeWidth="1" />
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#cbd5e1" strokeWidth="1" />
      
      <polygon
        points={polygonPoints}
        fill="rgba(166, 136, 73, 0.2)"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
      />
      
      <circle cx={pSpeaking.x} cy={pSpeaking.y} r="2.5" fill="var(--color-accent)" />
      <circle cx={pGrammar.x} cy={pGrammar.y} r="2.5" fill="var(--color-accent)" />
      <circle cx={pVocabulary.x} cy={pVocabulary.y} r="2.5" fill="var(--color-accent)" />
      <circle cx={pActive.x} cy={pActive.y} r="2.5" fill="var(--color-accent)" />
    </svg>
  );
}

export default function StudentPortal() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard", "modules", "achievements"

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
          </div>
        </div>

        {/* TAB 1: DASHBOARD RINGKASAN */}
        {activeTab === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

            {/* B1: Pengumuman Aktif */}
            {announcements.length > 0 && (
              <div>
                <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--color-gray-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
                  📢 Pengumuman
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {announcements.slice(0, 3).map(ann => {
                    const priColor = ann.priority === "urgent" ? "#ef4444" : ann.priority === "penting" ? "#f59e0b" : "var(--color-primary)";
                    return (
                      <div key={ann.id} style={{ borderRadius: "12px", border: `1.5px solid ${priColor}22`, background: `${priColor}08`, padding: "0.9rem 1.1rem", borderLeft: `4px solid ${priColor}` }}>
                        <p style={{ fontWeight: "800", fontSize: "0.9rem", color: "var(--color-gray-900)", marginBottom: "0.25rem" }}>{ann.title}</p>
                        <p style={{ fontSize: "0.82rem", color: "var(--color-gray-600)", lineHeight: 1.5 }}>{ann.content}</p>
                        <p style={{ fontSize: "0.72rem", color: "var(--color-gray-400)", marginTop: "0.4rem" }}>
                          {new Date(ann.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} · {ann.program}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* B2: Jadwal Kelas Online Berikutnya */}
            {onlineSchedules.length > 0 && (
              <div>
                <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--color-gray-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
                  🎥 Jadwal Kelas Online Berikutnya
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {onlineSchedules.slice(0, 2).map(s => {
                    const dt = new Date(s.scheduled_at);
                    return (
                      <div key={s.id} style={{ borderRadius: "12px", border: "1.5px solid var(--color-primary-light)", background: "linear-gradient(135deg, var(--color-primary-light) 0%, white 100%)", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                        <div>
                          <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.3rem" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", background: "var(--color-primary)", color: "white" }}>{s.meeting_platform}</span>
                            <span style={{ fontSize: "0.7rem", fontWeight: "600", padding: "2px 8px", borderRadius: "20px", background: "var(--color-gray-100)", color: "var(--color-gray-600)" }}>{s.duration_minutes} menit</span>
                          </div>
                          <p style={{ fontWeight: "800", fontSize: "0.9rem", color: "var(--color-gray-900)" }}>{s.title}</p>
                          <p style={{ fontSize: "0.8rem", color: "var(--color-gray-600)" }}>
                            📅 {dt.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })} · ⏰ {dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          {s.tutor_name && <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)" }}>👤 {s.tutor_name}</p>}
                        </div>
                        <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" className="btn-portal-primary" style={{ textDecoration: "none", padding: "0.6rem 1.25rem", fontSize: "0.875rem", whiteSpace: "nowrap" }}>
                          🚀 Masuk Kelas
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Gamification Welcome Block */}
            <div className="portal-card glowing-card" style={{
              padding: "2rem 2.5rem",
              background: "linear-gradient(135deg, rgba(33, 108, 126, 0.08) 0%, rgba(166, 136, 73, 0.08) 100%)",
              borderLeft: "6px solid var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "2rem"
            }}>
              <div>
                <h3 style={{ fontSize: "1.4rem", fontWeight: "900", color: "var(--color-gray-900)" }}>
                  Kumpulkan Koin Ibra Prestasi!
                </h3>
                <p style={{ color: "var(--color-gray-600)", fontSize: "0.95rem", marginTop: "4px", maxWidth: "500px" }}>
                  Terus aktif di kelas, kerjakan modul latihan tepat waktu, dan peroleh bintang emas dari Coach bimbinganmu untuk mengumpulkan koin virtual!
                </p>
              </div>
              <div style={{ textAlign: "center", minWidth: "150px" }}>
                <p style={{ fontSize: "3rem", fontWeight: "900", color: "var(--color-accent)", margin: "0", lineHeight: "1" }}>
                  {totalCoins}
                </p>
                <p style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--color-gray-500)", textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px" }}>
                  Akumulasi Koin
                </p>
              </div>
            </div>

            {/* Rapor Belajar Modul Terbaru */}
            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.25rem" }}>
                Hasil Evaluasi Modul Belajar
              </h3>

              {reports.length === 0 ? (
                <div className="portal-card" style={{ padding: "3rem", textAlign: "center" }}>
                  <p style={{ color: "var(--color-gray-400)" }}>Belum ada laporan nilai modul terbit untuk saat ini.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                  {reports.slice(0, 3).map((report) => {
                    const isCalistung = student?.program?.toLowerCase()?.includes("calistung");
                    return (
                      <div key={report.id} className="portal-card" style={{ padding: "2rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--color-gray-100)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                          <div>
                            <h4 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--color-gray-900)" }}>{report.module_name}</h4>
                            <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>
                              Diterbitkan pada {new Date(report.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                          </div>
                          {(() => {
                            const existingCert = certificates.find(
                              (c) => c.report_id === report.id || (c.student_id === student.id && c.module_name?.toLowerCase() === report.module_name?.toLowerCase())
                            );
                            if (existingCert) {
                              return (
                                <a
                                  href={`/verify/${existingCert.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-portal-outline"
                                  style={{ 
                                    padding: "0.4rem 1rem", 
                                    fontSize: "0.8rem", 
                                    display: "flex", 
                                    gap: "0.5rem", 
                                    alignItems: "center", 
                                    borderColor: "var(--color-accent)", 
                                    color: "var(--color-accent)",
                                    fontWeight: "bold",
                                    textDecoration: "none",
                                    borderRadius: "var(--radius-md)"
                                  }}
                                >
                                  <span>Lihat Sertifikat</span>
                                </a>
                              );
                            }
                            return null;
                          })()}
                        </div>


                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem", alignItems: "center" }} className="report-detail-layout">
                          
                          {/* Scores grid */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--color-gray-150)" }}>
                              <p style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.speaking_score}</p>
                              <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "2px" }}>
                                {isCalistung ? "Membaca" : "Speaking"}
                              </p>
                            </div>
                            <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--color-gray-150)" }}>
                              <p style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.grammar_score}</p>
                              <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "2px" }}>
                                {isCalistung ? "Menulis" : "Grammar"}
                              </p>
                            </div>
                            <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--color-gray-150)" }}>
                              <p style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.vocabulary_score}</p>
                              <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "2px" }}>
                                {isCalistung ? "Berhitung" : "Vocabulary"}
                              </p>
                            </div>
                            <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--color-gray-150)" }}>
                              <p style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.active_score}</p>
                              <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "2px" }}>
                                {isCalistung ? "Keaktifan" : "Active"}
                              </p>
                            </div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "center" }}>
                            <MiniRadarChart
                              speaking={report.speaking_score}
                              grammar={report.grammar_score}
                              vocabulary={report.vocabulary_score}
                              active={report.active_score}
                              isCalistung={isCalistung}
                            />
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: DOWNLOAD STUDY WORKSHEETS */}
        {activeTab === "modules" && (
          <div className="portal-card" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
              Modul Belajar & Lembar Kerja (Worksheet)
            </h3>
            <p style={{ color: "var(--color-gray-500)", fontSize: "0.9rem", marginBottom: "2rem" }}>
              Unduh lembar latihan, worksheet, modul teori belajar bahasa Inggris dan materi pembelajaran kelas Anda secara aman.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
              {getModulesList(student?.program).map((mod, idx) => (
                <div key={idx} style={{
                  border: "1px solid var(--color-gray-150)",
                  borderRadius: "8px",
                  padding: "1.25rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem"
                }} className="table-row-hover">
                  <div>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--color-gray-900)" }}>
                      {mod.name}
                    </h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginTop: "2px" }}>
                      Ukuran Berkas: <strong>{mod.size}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => alert("Mengunduh berkas modul pembelajaran...")}
                    className="btn-portal-primary"
                    style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", display: "flex", gap: "0.45rem", alignItems: "center" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span>Unduh PDF</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ACHIEVEMENT COINS */}
        {activeTab === "achievements" && (
          <div className="portal-card" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
              Papan Pencapaian Koin Prestasi
            </h3>
            <p style={{ color: "var(--color-gray-500)", fontSize: "0.9rem", marginBottom: "2rem" }}>
              Daftar histori transaksi penerimaan bintang emas dan koin penghargaan belajar.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {rewards.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gray-400)" }}>
                  <p style={{ fontWeight: "600" }}>Belum ada histori koin yang masuk. Semangat belajar terus ya!</p>
                </div>
              ) : (
                rewards.map((rew) => (
                  <div key={rew.id} style={{
                    border: "1px solid var(--color-gray-100)",
                    borderRadius: "8px",
                    padding: "1.25rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <h4 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--color-gray-800)" }}>
                        {rew.reason}
                      </h4>
                      <p style={{ fontSize: "0.8rem", color: "var(--color-gray-400)", marginTop: "2px" }}>
                        Diberikan pada {new Date(rew.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <div style={{
                      backgroundColor: rew.coins > 0 ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)",
                      color: rew.coins > 0 ? "var(--color-green)" : "var(--color-red)",
                      padding: "0.45rem 1rem",
                      borderRadius: "16px",
                      fontWeight: "900",
                      fontSize: "1.1rem"
                    }}>
                      {rew.coins > 0 ? `+${rew.coins}` : rew.coins} Koin
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: LMS PEMBELAJARAN */}
        {activeTab === "lms" && (
          <div className="portal-card" style={{ padding: "2rem" }}>
            {/* A2: SVG Circular Progress Ring */}
            {(() => {
              const tasks = lmsMaterials.filter(m => m.type === "tugas");
              const done = tasks.filter(t => mySubmissions.some(s => s.material_id === t.id)).length;
              const total = tasks.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const ringColor = pct >= 75 ? "#22c55e" : pct >= 50 ? "#f59e0b" : pct > 0 ? "#ef4444" : "#e5e7eb";
              const r = 40;
              const circ = 2 * Math.PI * r;
              const offset = circ - (pct / 100) * circ;
              return total > 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem", padding: "1rem 1.25rem", background: "var(--color-gray-50)", borderRadius: "14px", border: "1px solid var(--color-gray-150)" }}>
                  {/* Ring SVG */}
                  <div className="lms-progress-ring-wrap">
                    <svg className="lms-progress-ring" width="100" height="100" viewBox="0 0 100 100">
                      <circle className="track" cx="50" cy="50" r={r} strokeWidth="10" />
                      <circle
                        className="fill"
                        cx="50" cy="50" r={r}
                        strokeWidth="10"
                        stroke={ringColor}
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                      />
                    </svg>
                    <div className="lms-progress-ring-text" style={{ color: ringColor, fontSize: "1.25rem" }}>
                      {pct}%
                      <span>selesai</span>
                    </div>
                  </div>
                  {/* Stats */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: "800", fontSize: "0.95rem", color: "var(--color-gray-800)", marginBottom: "0.5rem" }}>
                      📋 Progress Tugas LMS
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e", display: "inline-block", flexShrink: 0 }} />
                        <span style={{ color: "var(--color-gray-600)" }}>Selesai:</span>
                        <strong style={{ color: "#22c55e" }}>{done} tugas</strong>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--color-gray-300)", display: "inline-block", flexShrink: 0 }} />
                        <span style={{ color: "var(--color-gray-600)" }}>Belum dikumpul:</span>
                        <strong style={{ color: "var(--color-gray-700)" }}>{total - done} tugas</strong>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--color-primary)", display: "inline-block", flexShrink: 0 }} />
                        <span style={{ color: "var(--color-gray-600)" }}>Total tugas:</span>
                        <strong style={{ color: "var(--color-primary-dark)" }}>{total} tugas</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--color-gray-150)", paddingBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)" }}>
                  LMS - Kelas Digital
                </h3>
                <p style={{ color: "var(--color-gray-500)", fontSize: "0.9rem", marginTop: "2px" }}>
                  Materi bimbingan & tugas rumah program <strong>{student?.program}</strong>.
                </p>
              </div>

              {/* Sub-Tab switcher */}
              <div className="portal-tabs" style={{ display: "flex", gap: "0.5rem", border: "none", padding: "0" }}>
                <button
                  onClick={() => setLmsSubTab("materi")}
                  className={`portal-tab-btn ${lmsSubTab === "materi" ? "active" : ""}`}
                  style={{
                    padding: "0.45rem 1.25rem",
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    border: "1px solid var(--color-gray-200)",
                    backgroundColor: lmsSubTab === "materi" ? "var(--color-primary)" : "transparent",
                    color: lmsSubTab === "materi" ? "white" : "var(--color-gray-600)",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  📖 Materi Belajar
                </button>
                <button
                  onClick={() => setLmsSubTab("tugas")}
                  className={`portal-tab-btn ${lmsSubTab === "tugas" ? "active" : ""}`}
                  style={{
                    padding: "0.45rem 1.25rem",
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    border: "1px solid var(--color-gray-200)",
                    backgroundColor: lmsSubTab === "tugas" ? "var(--color-primary)" : "transparent",
                    color: lmsSubTab === "tugas" ? "white" : "var(--color-gray-600)",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  📝 Tugas Rumah
                </button>
              </div>
            </div>

            {lmsSubTab === "materi" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {lmsMaterials.filter(m => m.type === "materi").length === 0 ? (
                  <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gray-400)" }}>
                    <p style={{ fontWeight: "600" }}>Belum ada materi belajar yang dibagikan untuk program ini.</p>
                  </div>
                ) : (
                  lmsMaterials.filter(m => m.type === "materi").map((mat) => (
                    <div key={mat.id} style={{
                      border: "1px solid var(--color-gray-150)",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      backgroundColor: "var(--color-gray-50)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                      boxShadow: "var(--shadow-sm)"
                    }} className="table-row-hover">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                        <div>
                          <span style={{
                            backgroundColor: "rgba(33, 108, 126, 0.1)",
                            color: "var(--color-primary-dark)",
                            fontSize: "0.75rem",
                            fontWeight: "800",
                            padding: "0.25rem 0.65rem",
                            borderRadius: "12px",
                            textTransform: "uppercase"
                          }}>
                            Materi
                          </span>
                          <h4 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--color-gray-900)", marginTop: "0.5rem" }}>
                            {mat.title}
                          </h4>
                        </div>
                        {mat.file_url && (
                          <a
                            href={mat.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-portal-primary"
                            style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", textDecoration: "none", display: "inline-flex", gap: "0.5rem", alignItems: "center" }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            <span>Unduh Berkas</span>
                          </a>
                        )}
                      </div>
                      {mat.description && (
                        <p style={{ color: "var(--color-gray-600)", fontSize: "0.95rem", lineHeight: "1.5", whiteSpace: "pre-line" }}>
                          {mat.description}
                        </p>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-gray-400)", borderTop: "1px solid var(--color-gray-200)", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
                        <span>Oleh Tutor: <strong>{mat.tutor_name}</strong></span>
                        <span>Diterbitkan: {new Date(mat.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {lmsMaterials.filter(m => m.type === "tugas").length === 0 ? (
                  <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gray-400)" }}>
                    <p style={{ fontWeight: "600" }}>Belum ada tugas rumah yang dibagikan untuk program ini.</p>
                  </div>
                ) : (
                  lmsMaterials.filter(m => m.type === "tugas").map((mat) => {
                    const submission = mySubmissions.find(sub => sub.material_id === mat.id);
                    const isSubmitted = !!submission;
                    const isGraded = isSubmitted && submission.grade !== null && submission.grade !== undefined && submission.grade !== "";
                    
                    return (
                      <div key={mat.id} style={{
                        border: "1px solid var(--color-gray-150)",
                        borderRadius: "12px",
                        padding: "1.5rem",
                        backgroundColor: "var(--color-gray-50)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                        boxShadow: "var(--shadow-sm)"
                      }} className="table-row-hover">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                          <div>
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                              <span style={{
                                backgroundColor: "rgba(166, 136, 73, 0.1)",
                                color: "var(--color-accent)",
                                fontSize: "0.75rem",
                                fontWeight: "800",
                                padding: "0.25rem 0.65rem",
                                borderRadius: "12px",
                                textTransform: "uppercase"
                              }}>
                                Tugas
                              </span>
                              
                              {/* Status Badge */}
                              {isGraded ? (
                                <span style={{
                                  backgroundColor: "rgba(34, 197, 94, 0.12)",
                                  color: "var(--color-green)",
                                  fontSize: "0.75rem",
                                  fontWeight: "800",
                                  padding: "0.25rem 0.65rem",
                                  borderRadius: "12px"
                                }}>
                                  Sudah Dinilai
                                </span>
                              ) : isSubmitted ? (
                                <span style={{
                                  backgroundColor: "rgba(59, 130, 246, 0.12)",
                                  color: "#2563eb",
                                  fontSize: "0.75rem",
                                  fontWeight: "800",
                                  padding: "0.25rem 0.65rem",
                                  borderRadius: "12px"
                                }}>
                                  Menunggu Penilaian
                                </span>
                              ) : (
                                <span style={{
                                  backgroundColor: "rgba(239, 68, 68, 0.12)",
                                  color: "var(--color-red)",
                                  fontSize: "0.75rem",
                                  fontWeight: "800",
                                  padding: "0.25rem 0.65rem",
                                  borderRadius: "12px"
                                }}>
                                  Belum Mengumpulkan
                                </span>
                              )}
                            </div>
                            <h4 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--color-gray-900)", marginTop: "0.5rem" }}>
                              {mat.title}
                            </h4>
                          </div>

                          {mat.file_url && (
                            <a
                              href={mat.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-portal-outline"
                              style={{ padding: "0.45rem 1rem", fontSize: "0.8rem", textDecoration: "none", display: "inline-flex", gap: "0.45rem", alignItems: "center" }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                              <span>Unduh Soal</span>
                            </a>
                          )}
                        </div>

                        {mat.description && (
                          <p style={{ color: "var(--color-gray-600)", fontSize: "0.95rem", lineHeight: "1.5", whiteSpace: "pre-line" }}>
                            {mat.description}
                          </p>
                        )}

                        {/* Submission / Grade Panel */}
                        <div style={{
                          borderTop: "1px solid var(--color-gray-200)",
                          paddingTop: "1rem",
                          marginTop: "0.5rem"
                        }}>
                          {isGraded ? (
                            <div style={{
                              background: "linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(166, 136, 73, 0.05) 100%)",
                              border: "1px solid rgba(166, 136, 73, 0.2)",
                              borderRadius: "10px",
                              padding: "1.25rem",
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.75rem"
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <span style={{ fontSize: "1.25rem" }}>🏆</span>
                                  <span style={{ fontWeight: "800", color: "var(--color-gray-800)", fontSize: "0.95rem" }}>Hasil Evaluasi Tutor</span>
                                </div>
                                <div style={{
                                  backgroundColor: "var(--color-accent)",
                                  color: "white",
                                  padding: "0.35rem 0.85rem",
                                  borderRadius: "20px",
                                  fontWeight: "900",
                                  fontSize: "1rem",
                                  boxShadow: "var(--shadow-sm)"
                                }}>
                                  Nilai: {submission.grade}
                                </div>
                              </div>
                              {submission.feedback ? (
                                <p style={{ color: "#a68849", fontStyle: "italic", fontSize: "0.9rem", margin: 0, paddingLeft: "1.75rem", borderLeft: "2px solid var(--color-accent)" }}>
                                  "{submission.feedback}"
                                </p>
                              ) : (
                                <p style={{ color: "var(--color-gray-500)", fontStyle: "italic", fontSize: "0.9rem", margin: 0, paddingLeft: "1.75rem" }}>
                                  Tidak ada catatan umpan balik.
                                </p>
                              )}
                              <div style={{ fontSize: "0.8rem", color: "var(--color-gray-400)", paddingLeft: "1.75rem" }}>
                                Terkirim: {new Date(submission.submitted_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                &nbsp;&bull;&nbsp; <a href={submission.file_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: "bold" }}>Buka file jawaban</a>
                              </div>
                            </div>
                          ) : isSubmitted ? (
                            <div style={{
                              backgroundColor: "var(--color-gray-100)",
                              borderRadius: "8px",
                              padding: "1rem",
                              fontSize: "0.9rem",
                              color: "var(--color-gray-600)",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: "0.5rem"
                            }}>
                              <div>
                                <span>✅ Jawaban terkirim pada {new Date(submission.submitted_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                                &nbsp;&bull;&nbsp; <a href={submission.file_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: "bold" }}>Lihat Berkas Jawaban</a>
                              </div>
                              <span style={{ fontSize: "0.8rem", color: "var(--color-gray-400)" }}>Menunggu dinilai oleh Coach</span>
                            </div>
                          ) : (
                            <div style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.75rem"
                            }}>
                              <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-gray-700)", margin: 0 }}>
                                Kirim Jawaban Tugas:
                              </p>
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                flexWrap: "wrap"
                              }}>
                                <input
                                  type="file"
                                  id={`file-upload-${mat.id}`}
                                  onChange={(e) => setSubmissionFile(e.target.files[0])}
                                  style={{
                                    fontSize: "0.85rem",
                                    color: "var(--color-gray-600)",
                                    border: "1px dashed var(--color-gray-300)",
                                    padding: "0.5rem",
                                    borderRadius: "8px",
                                    backgroundColor: "white",
                                    flex: "1",
                                    minWidth: "200px"
                                  }}
                                  disabled={submissionUploading && submittingMaterialId === mat.id}
                                />
                                <button
                                  onClick={() => handleSaveSubmission(mat.id)}
                                  className="btn-portal-primary"
                                  style={{
                                    padding: "0.6rem 1.5rem",
                                    fontSize: "0.85rem",
                                    fontWeight: "800"
                                  }}
                                  disabled={submissionUploading}
                                >
                                  {submissionUploading && submittingMaterialId === mat.id ? "Mengirim..." : "Kirim Tugas"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-gray-400)", borderTop: "1px solid var(--color-gray-150)", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
                          <span>Tenggat Waktu: <strong style={{ color: mat.due_date && new Date(mat.due_date) < new Date() && !isSubmitted ? "var(--color-red)" : "inherit" }}>
                            {mat.due_date ? new Date(mat.due_date).toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Tidak ada tenggat"}
                          </strong></span>
                          <span>Diterbitkan: {new Date(mat.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
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
