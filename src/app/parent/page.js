"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// SUB-COMPONENT: Custom visual pure-SVG Radar Chart for high-fidelity evaluation representation
function RadarChart({ speaking, grammar, vocabulary, active }) {
  // Center (120, 120), Radius 80
  const cx = 120;
  const cy = 120;
  const r = 80;

  // Coordinate calculations:
  // 1. Speaking: Up (0, -1) -> (cx, cy - r * score/100)
  // 2. Grammar: Right (1, 0) -> (cx + r * score/100, cy)
  // 3. Vocabulary: Down (0, 1) -> (cx, cy + r * score/100)
  // 4. Keaktifan: Left (-1, 0) -> (cx - r * score/100, cy)
  const pSpeaking = { x: cx, y: cy - r * (speaking / 100) };
  const pGrammar = { x: cx + r * (grammar / 100), y: cy };
  const pVocabulary = { x: cx, y: cy + r * (vocabulary / 100) };
  const pActive = { x: cx - r * (active / 100), y: cy };

  const polygonPoints = `${pSpeaking.x},${pSpeaking.y} ${pGrammar.x},${pGrammar.y} ${pVocabulary.x},${pVocabulary.y} ${pActive.x},${pActive.y}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "1.5rem", backgroundColor: "white", borderRadius: "12px", border: "1px solid var(--color-gray-150)", boxShadow: "var(--shadow-sm)", maxWidth: "300px", margin: "0 auto" }}>
      <p style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--color-primary-dark)", textTransform: "uppercase", marginBottom: "1rem" }}>Visualisasi Performa</p>
      
      <svg width="240" height="240" viewBox="0 0 240 240" style={{ overflow: "visible" }}>
        {/* Concentric reference grid levels at 25%, 50%, 75%, 100% */}
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

        {/* Axis lines */}
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#cbd5e1" strokeWidth="1.5" />

        {/* Axis Labels */}
        <text x={cx} y={cy - r - 8} textAnchor="middle" fontSize="9" fontWeight="800" fill="#475569">SPEAKING</text>
        <text x={cx + r + 8} y={cy + 3} textAnchor="start" fontSize="9" fontWeight="800" fill="#475569">GRAMMAR</text>
        <text x={cx} y={cy + r + 15} textAnchor="middle" fontSize="9" fontWeight="800" fill="#475569">VOCABULARY</text>
        <text x={cx - r - 8} y={cy + 3} textAnchor="end" fontSize="9" fontWeight="800" fill="#475569">KEAKTIFAN</text>

        {/* Score Values */}
        <text x={cx + 5} y={cy - r + 10} fontSize="7" fontWeight="700" fill="#94a3b8">100</text>
        <text x={cx + 5} y={cy - r * 0.5 + 4} fontSize="7" fontWeight="700" fill="#94a3b8">50</text>

        {/* Filled polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(33, 108, 126, 0.25)"
          stroke="#216c7e"
          strokeWidth="2.5"
        />

        {/* Data points markers */}
        <circle cx={pSpeaking.x} cy={pSpeaking.y} r="3.5" fill="#216c7e" stroke="white" strokeWidth="1" />
        <circle cx={pGrammar.x} cy={pGrammar.y} r="3.5" fill="#216c7e" stroke="white" strokeWidth="1" />
        <circle cx={pVocabulary.x} cy={pVocabulary.y} r="3.5" fill="#216c7e" stroke="white" strokeWidth="1" />
        <circle cx={pActive.x} cy={pActive.y} r="3.5" fill="#216c7e" stroke="white" strokeWidth="1" />
      </svg>
    </div>
  );
}

export default function ParentPortal() {
  const router = useRouter();
  const supabase = createClient();

  const [parentName, setParentName] = useState("Orang Tua");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment settings state loaded from database
  const [paymentSettings, setPaymentSettings] = useState({
    payment_bank_name: "Bank Mandiri",
    payment_account_number: "137-00-1234567-8",
    payment_account_name: "Ibra Global English",
    payment_account_sub: "Bobong Learning Centre",
    payment_spp_kids: "300000",
    payment_spp_teens: "300000",
    payment_spp_calistung: "350000"
  });

  const getChildProgramPrice = (programName) => {
    if (programName === "Fun Calistung") {
      return parseInt(paymentSettings.payment_spp_calistung || 350000);
    }
    if (programName === "Teens Program") {
      return parseInt(paymentSettings.payment_spp_teens || 300000);
    }
    return parseInt(paymentSettings.payment_spp_kids || 300000);
  };

  // Next Level States
  const [activeView, setActiveView] = useState("progress"); // "progress", "finance", or "calendar"
  const [parentPayments, setParentPayments] = useState([]);
  const [parentSchedules, setParentSchedules] = useState([]);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Print Mode State
  const [printReport, setPrintReport] = useState(null);

  // Aggregated Attendance Counts
  const [attendanceStats, setAttendanceStats] = useState({
    hadir: 0,
    sakit: 0,
    izin: 0,
    alfa: 0,
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const handleUploadReceipt = async (e, month) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChild) return;

    setUploadingReceipt(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${selectedChild.id}_${month}_${Date.now()}.${fileExt}`;
      const filePath = `${month}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("spp-receipts")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) {
        if (uploadError.message.includes("bucket not found") || uploadError.message.includes("does not exist")) {
          const { error: bucketError } = await supabase.storage.createBucket("spp-receipts", {
            public: true,
            fileSizeLimit: 5242880, // 5MB
          });
          if (bucketError) throw bucketError;

          const { error: retryError } = await supabase.storage
            .from("spp-receipts")
            .upload(filePath, file, { cacheControl: "3600", upsert: true });
          if (retryError) throw retryError;
        } else {
          throw uploadError;
        }
      }

      const { data } = supabase.storage
        .from("spp-receipts")
        .getPublicUrl(filePath);

      // Save/upsert payment status
      const payload = {
        student_id: selectedChild.id,
        month,
        amount: getChildProgramPrice(selectedChild.program),
        status: "menunggu_konfirmasi",
        payment_method: "Transfer Bank",
        receipt_url: data.publicUrl,
        updated_at: new Date().toISOString()
      };

      const { error: saveError } = await supabase
        .from("tuition_payments")
        .upsert(payload, { onConflict: "student_id,month" });

      if (saveError) throw saveError;

      showToast("Bukti transfer SPP berhasil diunggah! Menunggu konfirmasi admin.");
      
      // Reload payments list
      const { data: payList } = await supabase
        .from("tuition_payments")
        .select("*")
        .eq("student_id", selectedChild.id)
        .order("month", { ascending: false });
      setParentPayments(payList || []);

    } catch (err) {
      console.error("Gagal mengunggah bukti transfer:", err);
      showToast("Gagal mengirim bukti transfer pembayaran.", "error");
    } finally {
      setUploadingReceipt(false);
    }
  };

  const getIndonesianDay = (dateStr) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[date.getDay()];
  };

  const getIndonesianDate = (dateStr) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const getRecentMonths = () => {
    const list = [];
    const d = new Date();
    for (let i = 0; i < 6; i++) {
      const temp = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const mm = String(temp.getMonth() + 1).padStart(2, "0");
      const yyyy = temp.getFullYear();
      list.push(`${yyyy}-${mm}`);
    }
    return list;
  };

  const getMonthName = (ym) => {
    if (!ym) return "";
    const [y, m] = ym.split("-");
    const date = new Date(parseInt(y), parseInt(m) - 1, 1);
    return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  };


  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar dari portal Orang Tua?")) {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    }
  };

  useEffect(() => {
    async function loadPortalData() {
      try {
        // 1. Get user profile
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        setParentName(user.user_metadata?.full_name || "Orang Tua Siswa");

        // 2. Fetch linked children (students)
        const { data: kids, error: errK } = await supabase
          .from("students")
          .select("id, name, age, program")
          .eq("parent_id", user.id);

        if (errK) throw errK;
        setChildren(kids || []);

        if (kids && kids.length > 0) {
          setSelectedChild(kids[0]);
        }

        // 3. Fetch payment settings from database
        const { data: settingsData } = await supabase
          .from("landing_settings")
          .select("*");
        if (settingsData) {
          const settingsObj = {};
          settingsData.forEach(item => {
            settingsObj[item.key] = item.value;
          });
          setPaymentSettings(prev => ({
            ...prev,
            ...settingsObj
          }));
        }
      } catch (err) {
        console.error("Gagal memuat portal orang tua:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPortalData();
  }, []);

  // Fetch details when child changes
  useEffect(() => {
    if (!selectedChild) return;

    async function loadChildDetails() {
      try {
        // Fetch Attendance
        const { data: attList, error: errA } = await supabase
          .from("attendance")
          .select("id, date, status, notes")
          .eq("student_id", selectedChild.id)
          .order("date", { ascending: false });

        if (errA) throw errA;
        setAttendance(attList || []);

        // Aggregate stats
        const counts = { hadir: 0, sakit: 0, izin: 0, alfa: 0 };
        attList?.forEach((a) => {
          if (counts[a.status] !== undefined) {
            counts[a.status]++;
          }
        });
        setAttendanceStats(counts);

        // Fetch Reports
        const { data: repList, error: errR } = await supabase
          .from("reports")
          .select("id, module_name, speaking_score, grammar_score, vocabulary_score, active_score, tutor_notes, created_at")
          .eq("student_id", selectedChild.id)
          .order("created_at", { ascending: false });

        if (errR) throw errR;
        setReports(repList || []);

        // Fetch Tuition Payments
        const { data: payList, error: errP } = await supabase
          .from("tuition_payments")
          .select("*")
          .eq("student_id", selectedChild.id)
          .order("month", { ascending: false });

        if (errP) throw errP;
        setParentPayments(payList || []);

        // Fetch All Academic Schedules & Filter locally for perfect compatibility
        const { data: schedList, error: errS } = await supabase
          .from("academic_schedules")
          .select("*")
          .order("start_time", { ascending: true });

        if (errS) throw errS;
        const filteredSchedules = (schedList || []).filter(
          (s) => s.program === "All" || s.program === selectedChild.program
        );
        setParentSchedules(filteredSchedules);

      } catch (err) {
        console.error("Gagal memuat detail siswa:", err);
      }
    }

    loadChildDetails();
  }, [selectedChild]);

  // Dynamic printing
  const triggerPrint = (report) => {
    setPrintReport(report);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div style={{ textAlign: "center", color: "var(--color-gray-50)" }}>
          <svg style={{ animation: "spin 1s linear infinite", width: "40px", height: "40px", marginBottom: "1rem", color: "var(--color-primary)" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <p style={{ fontWeight: "600" }}>Menghubungkan ke Portal...</p>
        </div>
      </div>
    );
  }

  // PRINT PREVIEW OVERLAY
  if (printReport) {
    return (
      <div style={{ padding: "1.5rem", backgroundColor: "white", minHeight: "100vh" }}>
        <div className="no-print" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)" }}>
            * Anda sedang melihat pratinjau cetak. Tekan Ctrl+P atau Cmd+P jika dialog print tidak terbuka otomatis.
          </p>
          <button className="btn-portal-outline" onClick={() => setPrintReport(null)}>
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
                <h1 style={{ fontSize: "1.5rem", fontWeight: "900", margin: "0", color: "var(--color-gray-900)" }}>IBRA GLOBAL ENGLISH</h1>
                <p style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--color-accent)", margin: "0" }}>LEARNING CENTRE BOBONG</p>
                <p style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", margin: "2px 0 0" }}>Jl. Raya Bobong, Kabupaten Pulau Taliabu, Maluku Utara</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0" }}>E-RAPOR DIGITAL</h2>
              <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", margin: "0" }}>REKAP HASIL EVALUASI MODUL</p>
            </div>
          </div>

          <div className="student-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem", backgroundColor: "var(--color-gray-50)", padding: "1.25rem", borderRadius: "8px" }}>
            <div>
              <p style={{ margin: "0 0 6px" }}><strong>Nama Siswa:</strong> {selectedChild?.name}</p>
              <p style={{ margin: "0" }}><strong>Program Belajar:</strong> {selectedChild?.program} (Usia {selectedChild?.age} tahun)</p>
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
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem", alignItems: "center", marginBottom: "2.5rem" }}>
            
            {/* Scores List */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ border: "1px solid var(--color-gray-200)", padding: "1.25rem", borderRadius: "8px", textAlign: "center", backgroundColor: "white" }}>
                <p style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0" }}>{printReport.speaking_score}</p>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>Speaking</p>
              </div>
              <div style={{ border: "1px solid var(--color-gray-200)", padding: "1.25rem", borderRadius: "8px", textAlign: "center", backgroundColor: "white" }}>
                <p style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0" }}>{printReport.grammar_score}</p>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>Grammar</p>
              </div>
              <div style={{ border: "1px solid var(--color-gray-200)", padding: "1.25rem", borderRadius: "8px", textAlign: "center", backgroundColor: "white" }}>
                <p style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0" }}>{printReport.vocabulary_score}</p>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>Vocabulary</p>
              </div>
              <div style={{ border: "1px solid var(--color-gray-200)", padding: "1.25rem", borderRadius: "8px", textAlign: "center", backgroundColor: "white" }}>
                <p style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0" }}>{printReport.active_score}</p>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>Keaktifan</p>
              </div>
            </div>

            {/* Visual SVG Radar Chart */}
            <div>
              <RadarChart 
                speaking={printReport.speaking_score} 
                grammar={printReport.grammar_score} 
                vocabulary={printReport.vocabulary_score} 
                active={printReport.active_score} 
              />
            </div>

          </div>

          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", borderBottom: "1.5px solid var(--color-gray-300)", paddingBottom: "0.5rem", marginBottom: "1rem", color: "var(--color-gray-800)" }}>
            B. ULASAN & CATATAN MASUKAN TUTOR
          </h3>

          <div style={{ borderLeft: "4px solid var(--color-accent)", paddingLeft: "1.25rem", margin: "1.5rem 0 3rem", backgroundColor: "var(--color-gray-50)", padding: "1.25rem", borderRadius: "0 8px 8px 0" }}>
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

  return (
    <div className="dashboard-container">
      {/* Tombol Toggle Menu Mobile */}
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
          justifyContent: "center",
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

      {/* Toast Notification Alert */}
      {toast.show && (
        <div
          style={{
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
            gap: "0.5rem",
            animation: "slideIn 0.3s ease",
          }}
        >
          {toast.type === "success" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`dashboard-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <img src="/assets/logo.png" alt="Ibra Logo" className="sidebar-brand-img" />
          <div className="sidebar-brand-text">
            <h2>Ibra English</h2>
            <p>Portal Orang Tua</p>
          </div>
        </div>

        <div className="sidebar-nav">
          <button
            onClick={() => { setActiveView("progress"); setMobileOpen(false); }}
            className={`sidebar-nav-link ${activeView === "progress" ? "active" : ""}`}
            style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Kemajuan Belajar</span>
          </button>

          <button
            onClick={() => { setActiveView("calendar"); setMobileOpen(false); }}
            className={`sidebar-nav-link ${activeView === "calendar" ? "active" : ""}`}
            style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>Jadwal & Kalender</span>
          </button>

          <button
            onClick={() => { setActiveView("finance"); setMobileOpen(false); }}
            className={`sidebar-nav-link ${activeView === "finance" ? "active" : ""}`}
            style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span>Administrasi SPP</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Log Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Dashboard Panel */}
      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div className="topbar-title">
            <h1>Selamat Datang, Bapak/Ibu</h1>
            <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
              Silakan pantau absensi harian, agenda jadwal, dan hasil evaluasi belajar anak secara real-time.
            </p>
          </div>
          <div className="topbar-user" style={{ gap: "1rem" }}>
            <span className="user-badge">{parentName}</span>
          </div>
        </div>

        {children.length === 0 ? (
          <div className="portal-card" style={{ padding: "3rem", textAlign: "center", borderLeft: "5px solid var(--color-accent)" }}>
            <svg style={{ color: "var(--color-accent)", width: "48px", height: "48px", marginBottom: "1rem" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>Siswa Belum Dipasangkan</h3>
            <p style={{ color: "var(--color-gray-600)", fontSize: "0.95rem", maxWidth: "550px", margin: "0 auto", lineHeight: "1.6" }}>
              Akun orang tua Anda belum dihubungkan dengan data profil siswa. Silakan hubungi <strong>Tutor Pendamping</strong> di kelas atau hubungi Admin Ibra Global English Bobong agar nama anak Anda segera dikaitkan ke akun portal ini.
            </p>
          </div>
        ) : (
          <>
            {/* Multiple children tab navigation if applicable */}
            {children.length > 1 && (
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
                {children.map((child) => (
                  <button
                    key={child.id}
                    className={`btn-portal-outline ${selectedChild?.id === child.id ? "active" : ""}`}
                    onClick={() => setSelectedChild(child)}
                    style={{
                      backgroundColor: selectedChild?.id === child.id ? "var(--color-primary-light)" : "transparent",
                      color: selectedChild?.id === child.id ? "var(--color-primary-dark)" : "var(--color-gray-600)",
                    }}
                  >
                    {child.name} ({child.program})
                  </button>
                ))}
              </div>
            )}

            {/* Currently Monitored Student Card */}
            <div className="portal-card" style={{ marginBottom: "2.5rem", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg, var(--color-primary-light) 0%, rgba(255,255,255,0) 100%)", borderLeft: "5px solid var(--color-primary)" }}>
              <div>
                <p style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase" }}>Siswa yang Dipantau</p>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-gray-900)" }}>{selectedChild?.name}</h2>
                <p style={{ fontSize: "0.9rem", color: "var(--color-gray-600)", fontWeight: "600" }}>{selectedChild?.program} (Usia {selectedChild?.age} tahun)</p>
              </div>
              <div className="user-badge" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
                Siswa Aktif
              </div>
            </div>

            {/* TAB VIEW 1: PROGRESS (Kemajuan Belajar) */}
            {activeView === "progress" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                
                {/* Riwayat Kehadiran */}
                <div className="portal-card" style={{ padding: "2rem" }}>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.5rem" }}>
                    Riwayat Kehadiran Siswa
                  </h3>
                  
                  {/* Attendance Stats Cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
                    <div style={{ textAlign: "center", padding: "1rem", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-white)", boxShadow: "var(--shadow-sm)" }}>
                      <p style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-green)" }}>{attendanceStats.hadir}</p>
                      <p style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)", marginTop: "0.25rem" }}>Hadir</p>
                    </div>
                    <div style={{ textAlign: "center", padding: "1rem", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-white)", boxShadow: "var(--shadow-sm)" }}>
                      <p style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-yellow)" }}>{attendanceStats.sakit}</p>
                      <p style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)", marginTop: "0.25rem" }}>Sakit</p>
                    </div>
                    <div style={{ textAlign: "center", padding: "1rem", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-white)", boxShadow: "var(--shadow-sm)" }}>
                      <p style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-primary)" }}>{attendanceStats.izin}</p>
                      <p style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)", marginTop: "0.25rem" }}>Izin</p>
                    </div>
                    <div style={{ textAlign: "center", padding: "1rem", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-white)", boxShadow: "var(--shadow-sm)" }}>
                      <p style={{ fontSize: "1.5rem", fontWeight: "900", color: "#ef4444" }}>{attendanceStats.alfa}</p>
                      <p style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)", marginTop: "0.25rem" }}>Alfa</p>
                    </div>
                  </div>

                  {/* Attendance log table */}
                  <div className="table-wrapper" style={{ maxHeight: "350px", overflowY: "auto" }}>
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Hari</th>
                          <th>Tanggal</th>
                          <th>Status Kehadiran</th>
                          <th>Keterangan / Catatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-500)" }}>
                              Belum ada riwayat absensi untuk siswa ini.
                            </td>
                          </tr>
                        ) : (
                          attendance.map((log, idx) => (
                            <tr key={log.id}>
                              <td style={{ fontWeight: "700" }}>{idx + 1}</td>
                              <td style={{ fontWeight: "600", color: "var(--color-primary-dark)" }}>{getIndonesianDay(log.date)}</td>
                              <td>{getIndonesianDate(log.date)}</td>
                              <td>
                                <span className={`badge-${log.status}`}>{log.status}</span>
                              </td>
                              <td style={{ fontSize: "0.85rem", fontStyle: log.notes ? "normal" : "italic", color: log.notes ? "var(--color-gray-800)" : "var(--color-gray-400)" }}>
                                {log.notes || "-"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Rapor Belajar Digital (Report Cards list) */}
                <div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.25rem" }}>
                    Rapor Belajar Digital & Grafik Pencapaian
                  </h3>
                  
                  {reports.length === 0 ? (
                    <div className="portal-card" style={{ padding: "3rem", textAlign: "center" }}>
                      <p style={{ color: "var(--color-gray-500)" }}>Belum ada rapor digital yang diterbitkan untuk saat ini.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                      {reports.map((report) => (
                        <div key={report.id} className="portal-card" style={{ padding: "2rem" }}>
                          
                          {/* Card Header */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", borderBottom: "1px solid var(--color-gray-100)", paddingBottom: "1rem" }}>
                            <div>
                              <h4 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--color-gray-900)" }}>{report.module_name}</h4>
                              <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>
                                Diterbitkan pada {new Date(report.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                              </p>
                            </div>
                            <button className="btn-portal-outline" style={{ padding: "0.5rem 1.15rem", fontSize: "0.8rem", display: "flex", gap: "0.5rem", alignItems: "center" }} onClick={() => triggerPrint(report)}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                              <span>Cetak Rapor PDF</span>
                            </button>
                          </div>

                          {/* Grid with Scores Cards and visual SVG Radar Chart */}
                          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem", alignItems: "center" }} className="report-detail-layout">
                            
                            {/* Score Metrics Grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                              <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-gray-100)" }}>
                                <p style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.speaking_score}</p>
                                <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>Speaking</p>
                              </div>
                              <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-gray-100)" }}>
                                <p style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.grammar_score}</p>
                                <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>Grammar</p>
                              </div>
                              <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-gray-100)" }}>
                                <p style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.vocabulary_score}</p>
                                <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>Vocabulary</p>
                              </div>
                              <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-gray-100)" }}>
                                <p style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.active_score}</p>
                                <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>Keaktifan</p>
                              </div>
                            </div>

                            {/* SVG Chart visualization */}
                            <div>
                              <RadarChart
                                speaking={report.speaking_score}
                                grammar={report.grammar_score}
                                vocabulary={report.vocabulary_score}
                                active={report.active_score}
                              />
                            </div>

                          </div>

                          {/* Tutor Notes review block */}
                          {report.tutor_notes && (
                            <div style={{ borderLeft: "4px solid var(--color-accent)", paddingLeft: "1.25rem", marginTop: "2rem", backgroundColor: "rgba(166, 136, 73, 0.03)", padding: "1rem 1.25rem", borderRadius: "0 8px 8px 0" }}>
                              <p style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--color-accent)", textTransform: "uppercase", marginBottom: "4px" }}>Catatan Tutor Pendamping</p>
                              <p style={{ fontSize: "0.9rem", color: "var(--color-gray-700)", fontStyle: "italic", lineHeight: "1.6", margin: "0" }}>
                                "{report.tutor_notes}"
                              </p>
                            </div>
                          )}

                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB VIEW 2: CALENDAR TIMELINE VIEW */}
            {activeView === "calendar" && (
              <div className="portal-card" style={{ padding: "2rem" }}>
                <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
                  Jadwal & Agenda Belajar Siswa
                </h3>
                <p style={{ color: "var(--color-gray-500)", fontSize: "0.9rem", marginBottom: "2rem" }}>
                  Berikut adalah agenda belajar, kelas rutin, kegiatan bimbingan belajar, serta hari libur sekolah yang dikhususkan untuk program pendaftaran anak Anda (**{selectedChild?.program}**).
                </p>

                {parentSchedules.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gray-400)" }}>
                    <p style={{ fontWeight: "600" }}>Belum ada agenda kelas aktif yang dijadwalkan.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {parentSchedules.map((sched) => {
                      let typeColor = "var(--color-primary)";
                      let typeLabel = "Kelas Rutin";
                      let typeStyle = { borderLeft: "5px solid var(--color-primary)" };

                      if (sched.type === "holiday") {
                        typeColor = "#ef4444";
                        typeLabel = "Hari Libur";
                        typeStyle = { borderLeft: "5px solid #ef4444", backgroundColor: "#fef2f2" };
                      } else if (sched.type === "event") {
                        typeColor = "var(--color-accent)";
                        typeLabel = "Kegiatan Khusus";
                        typeStyle = { borderLeft: "5px solid var(--color-accent)", backgroundColor: "rgba(166, 136, 73, 0.04)" };
                      }

                      const startObj = new Date(sched.start_time);
                      const endObj = new Date(sched.end_time);

                      const formattedDate = startObj.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
                      const timeRange = `${startObj.toTimeString().slice(0, 5)} - ${endObj.toTimeString().slice(0, 5)}`;

                      return (
                        <div key={sched.id} className="portal-card" style={{ ...typeStyle, padding: "1.5rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                          <div style={{ flex: "1 1 300px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                              <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "white", backgroundColor: typeColor, padding: "0.2rem 0.6rem", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                {typeLabel}
                              </span>
                              <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)" }}>
                                Sasaran: {sched.program}
                              </span>
                            </div>
                            <h4 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--color-gray-900)" }}>{sched.title}</h4>
                            {sched.description && (
                              <p style={{ fontSize: "0.85rem", color: "var(--color-gray-600)", marginTop: "4px", lineHeight: "1.5" }}>{sched.description}</p>
                            )}
                          </div>

                          <div style={{ textAlign: "right", minWidth: "200px" }}>
                            <p style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--color-gray-800)" }}>📅 {formattedDate}</p>
                            <p style={{ fontSize: "0.95rem", fontWeight: "900", color: "var(--color-primary-dark)", marginTop: "4px" }}>⏱ {timeRange}</p>
                            {sched.instructor && (
                              <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginTop: "6px" }}>Tutor: <strong>{sched.instructor}</strong></p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB VIEW 3: FINANCE (Administrasi SPP) */}
            {activeView === "finance" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                
                {/* Bank Transfer Guide */}
                <div className="portal-card" style={{ padding: "2rem", borderLeft: "5px solid var(--color-accent)", background: "linear-gradient(135deg, rgba(166, 136, 73, 0.05) 0%, rgba(255,255,255,0) 100%)" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--color-gray-900)" }}>Panduan Transfer Pembayaran SPP</h3>
                      <p style={{ color: "var(--color-gray-600)", fontSize: "0.9rem", marginTop: "4px" }}>
                        Pembayaran SPP sebesar <strong>Rp {getChildProgramPrice(selectedChild?.program).toLocaleString("id-ID")} / bulan</strong> paling lambat tanggal 10 setiap bulannya.
                      </p>
                    </div>
                    <div style={{ padding: "0.5rem 1rem", backgroundColor: "var(--color-accent-light)", color: "var(--color-accent)", borderRadius: "6px", fontWeight: "700", fontSize: "0.9rem" }}>
                      Nominal: Rp {getChildProgramPrice(selectedChild?.program).toLocaleString("id-ID")}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginTop: "1.5rem", borderTop: "1px solid var(--color-gray-100)", paddingTop: "1.5rem" }}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--color-primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-dark)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                      </div>
                      <div>
                        <p style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)" }}>Rekening Pembayaran</p>
                        <p style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--color-gray-900)" }}>{paymentSettings.payment_bank_name || "Bank Mandiri"}</p>
                        <p style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--color-gray-700)" }}>{paymentSettings.payment_account_number || "137-00-1234567-8"}</p>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--color-primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-dark)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                      <div>
                        <p style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)" }}>Atas Nama Rekening</p>
                        <p style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--color-gray-900)" }}>{paymentSettings.payment_account_name || "Ibra Global English"}</p>
                        <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)" }}>{paymentSettings.payment_account_sub || "Bobong Learning Centre"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly list with real-time status & uploader */}
                <div className="portal-card" style={{ padding: "2rem" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.5rem" }}>
                    Pelacakan & Administrasi SPP Bulanan
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {getRecentMonths().map((month) => {
                      const dbPay = parentPayments.find(p => p.month === month);
                      const pay = dbPay ? {
                        ...dbPay,
                        amount: dbPay.status === "belum_bayar" ? getChildProgramPrice(selectedChild?.program) : dbPay.amount
                      } : {
                        month,
                        amount: getChildProgramPrice(selectedChild?.program),
                        status: "belum_bayar",
                        receipt_url: ""
                      };

                      return (
                        <div key={month} style={{ border: "1px solid var(--color-gray-100)", borderRadius: "8px", padding: "1.25rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }} className="table-row-hover">
                          <div>
                            <p style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--color-gray-900)" }}>
                              {getMonthName(month)}
                            </p>
                            <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>
                              Tagihan: Rp {parseInt(pay.amount).toLocaleString("id-ID")}
                            </p>
                          </div>

                          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.5rem" }}>
                            {/* Status badge */}
                            <div>
                              {pay.status === "lunas" ? (
                                <span className="badge-status-present" style={{ display: "inline-block", width: "120px", textAlign: "center" }}>LUNAS</span>
                              ) : pay.status === "menunggu_konfirmasi" ? (
                                <span className="badge-status-sick" style={{ display: "inline-block", width: "120px", textAlign: "center", color: "#b45309", borderColor: "#fef3c7", background: "#fef3c7" }}>KONFIRMASI</span>
                              ) : (
                                <span className="badge-status-absent" style={{ display: "inline-block", width: "120px", textAlign: "center" }}>BELUM BAYAR</span>
                              )}
                            </div>

                            {/* Uploader / Receipt button */}
                            <div>
                              {pay.status === "belum_bayar" ? (
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  <label className="btn-portal-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", fontWeight: "700", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                    <span>{uploadingReceipt ? "Mengunggah..." : "Unggah Bukti"}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      style={{ display: "none" }}
                                      onChange={(e) => handleUploadReceipt(e, month)}
                                      disabled={uploadingReceipt}
                                    />
                                  </label>
                                </div>
                              ) : (
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                  {pay.receipt_url && (
                                    <a
                                      href={pay.receipt_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn-portal-outline"
                                      style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", fontWeight: "600" }}
                                    >
                                      Lihat Bukti ↗
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
