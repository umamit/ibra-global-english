"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import RadarChart from "@/components/RadarChart";
import LineChart from "@/components/LineChart";

export default function ParentPortal() {
  const router = useRouter();
  const supabase = createClient();

  const [parentName, setParentName] = useState("Orang Tua");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      if (typeof window === "undefined") return;

      let loginTimeStr = sessionStorage.getItem("login_time");
      if (!loginTimeStr && document.cookie.includes("login_time=active")) {
        loginTimeStr = Date.now().toString();
        sessionStorage.setItem("login_time", loginTimeStr);
      }

      if (!loginTimeStr) {
        // Tab baru dibuka, sessionStorage kosong! Log out otomatis.
        await supabase.auth.signOut();
        document.cookie = "login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/login";
        return;
      }

      // Check max-age 1 jam (3600000 ms)
      const loginTime = parseInt(loginTimeStr);
      const oneHour = 3600 * 1000;
      if (Date.now() - loginTime > oneHour) {
        await supabase.auth.signOut();
        sessionStorage.removeItem("login_time");
        document.cookie = "login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        alert("Sesi login Anda telah berakhir (maksimal 1 jam). Silakan masuk kembali.");
        window.location.href = "/login";
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 15000); // Cek setiap 15 detik

    // Cleanup: jika berpindah rute keluar dari rute /parent
    return () => {
      clearInterval(interval);
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/parent")) {
        supabase.auth.signOut();
        sessionStorage.clear();
        document.cookie = "login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    };
  }, [supabase]);
  const [attendance, setAttendance] = useState([]);
  const [reports, setReports] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [lmsMaterials, setLmsMaterials] = useState([]);
  const [lmsSubmissions, setLmsSubmissions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [onlineSchedules, setOnlineSchedules] = useState([]);

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
    if (programName?.toLowerCase()?.includes("calistung")) {
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

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // Print Mode State
  const [printReport, setPrintReport] = useState(null);
  const [printReceipt, setPrintReceipt] = useState(null);

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
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        document.cookie = "login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
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

        // Cek tipe peran akun di tabel profiles
        const { data: profile, error: errP } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .single();

        if (errP || (profile?.role !== "parent" && profile?.role !== "admin")) {
          if (profile?.role === "student") {
            router.push("/student");
            return;
          }
          if (profile?.role === "tutor") {
            router.push("/tutor");
            return;
          }
          alert("Akses ditolak: Akun Anda bukan bertipe peran Orang Tua.");
          await supabase.auth.signOut();
          router.push("/login");
          return;
        }

        setParentName(profile?.full_name || user.user_metadata?.full_name || "Orang Tua Siswa");

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
      setDetailsLoading(true);
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

        // Fetch Certificates
        const { data: certList, error: errC } = await supabase
          .from("certificates")
          .select("*")
          .eq("student_id", selectedChild.id);
        
        if (!errC) {
          setCertificates(certList || []);
        }


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

        // Fetch LMS Materials
        const { data: lmsList } = await supabase
          .from("lms_materials")
          .select("*")
          .eq("program", selectedChild.program)
          .order("created_at", { ascending: false });
        setLmsMaterials(lmsList || []);

        // Fetch LMS Submissions
        const { data: subList } = await supabase
          .from("lms_submissions")
          .select("*")
          .eq("student_id", selectedChild.id);
        setLmsSubmissions(subList || []);

        // B1 & B2: Fetch pengumuman & jadwal kelas online
        try {
          const annRes = await fetch(`/api/announcements?program=${encodeURIComponent(selectedChild.program)}`);
          const { data: annData } = await annRes.json();
          setAnnouncements(annData || []);
        } catch (_) {}

        try {
          const schRes = await fetch(`/api/online-schedule?program=${encodeURIComponent(selectedChild.program)}&upcoming=true`);
          const { data: schData } = await schRes.json();
          setOnlineSchedules(schData || []);
        } catch (_) {}

      } catch (err) {
        console.error("Gagal memuat detail siswa:", err);
      } finally {
        setTimeout(() => {
          setDetailsLoading(false);
        }, 600);
      }
    }

    loadChildDetails();
  }, [selectedChild]);

  // Dynamic notifications calculation
  useEffect(() => {
    if (!selectedChild) return;

    const list = [];
    const currentMonthStr = new Date().toISOString().slice(0, 7); // e.g. "2026-06"
    const currentPayment = parentPayments.find(p => p.month === currentMonthStr);
    const dayOfMonth = new Date().getDate();

    // 1. SPP Payment Alert
    if (!currentPayment || (currentPayment.status !== "lunas" && currentPayment.status !== "menunggu_konfirmasi")) {
      if (dayOfMonth >= 8) {
        list.push({
          id: "spp_warning",
          type: "warning",
          title: "Tagihan SPP Belum Lunas",
          message: `Tagihan SPP bulan ${getMonthName(currentMonthStr)} untuk ${selectedChild.name} belum diselesaikan. Harap selesaikan sebelum tanggal 10.`,
          action: () => setActiveView("finance")
        });
      }
    }

    // 2. Recent Reports (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
    reports.forEach(r => {
      if (new Date(r.created_at).getTime() > sevenDaysAgo) {
        list.push({
          id: `report_${r.id}`,
          type: "info",
          title: "Rapor Baru Diterbitkan",
          message: `Rapor digital ${selectedChild.name} untuk ${r.module_name} telah diterbitkan oleh tutor.`,
          action: () => setActiveView("progress")
        });
      }
    });

    // 3. Announcements
    announcements.forEach(a => {
      list.push({
        id: `ann_${a.id}`,
        type: a.priority === "urgent" ? "warning" : "info",
        title: `📢 Pengumuman: ${a.title}`,
        message: a.content,
        action: () => setActiveView("progress")
      });
    });

    setNotifications(list);
  }, [selectedChild, parentPayments, reports, announcements]);

  // Dynamic printing
  const triggerPrint = (report) => {
    setPrintReport(report);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const triggerPrintReceipt = (payment) => {
    setPrintReceipt(payment);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const getTerbilang = (amount) => {
    const val = parseInt(amount);
    if (val === 300000) return "Tiga Ratus Ribu Rupiah";
    if (val === 350000) return "Tiga Ratus Lima Puluh Ribu Rupiah";
    if (val === 400000) return "Empat Ratus Ribu Rupiah";
    if (val === 250000) return "Dua Ratus Lima Puluh Ribu Rupiah";
    if (val === 500000) return "Lima Ratus Ribu Rupiah";
    return "Tiga Ratus Ribu Rupiah";
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

  // PRINT RECEIPT OVERLAY
  if (printReceipt) {
    const terbilangStr = getTerbilang(printReceipt.amount);
    const receiptNo = `IBRA-REC-${printReceipt.id ? printReceipt.id.slice(0, 8).toUpperCase() : Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    return (
      <div style={{ padding: "2rem", backgroundColor: "white", minHeight: "100vh", color: "#333", fontFamily: "sans-serif" }}>
        <div className="no-print" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)" }}>
            * Anda sedang melihat pratinjau cetak kuitansi. Tekan Ctrl+P atau Cmd+P jika dialog print tidak terbuka otomatis.
          </p>
          <button className="btn-portal-outline" onClick={() => setPrintReceipt(null)}>
            ← Kembali ke Portal
          </button>
        </div>

        {/* PRINT-OPTIMIZED RECEIPT LAYOUT */}
        <div className="printable-receipt" style={{ border: "2px solid #333", padding: "2.5rem", borderRadius: "8px", maxWidth: "700px", margin: "0 auto", position: "relative" }}>
          
          {/* Header Kop Surat */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "3px double #333", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <img src="/assets/logo.png" alt="Ibra Logo" style={{ width: "56px", height: "56px" }} />
              <div style={{ textAlign: "left" }}>
                <h1 style={{ fontSize: "1.35rem", fontWeight: "900", margin: "0", color: "var(--color-primary-dark)" }}>IBRA GLOBAL ENGLISH</h1>
                <p style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--color-accent)", margin: "0" }}>Belajar Seru, Lancar Bicara</p>
                <p style={{ fontSize: "0.7rem", color: "#666", margin: "2px 0 0" }}>{paymentSettings.contact_address || "Jl. TPU Bobong Komp. Fangahu, Lantai 1 Kost Fitrah"}</p>
                <p style={{ fontSize: "0.65rem", color: "#888", margin: "0", fontWeight: "600" }}>Di bawah naungan PT Ibra Global English</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "900", color: "#333", margin: "0", letterSpacing: "1px" }}>KUITANSI PEMBAYARAN</h2>
              <p style={{ fontSize: "0.75rem", color: "#555", margin: "4px 0 0", fontFamily: "monospace" }}>No: {receiptNo}</p>
            </div>
          </div>

          {/* Receipt Body */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.9rem", lineHeight: "1.6" }}>
            
            <div className="receipt-row">
              <span style={{ fontWeight: "700", color: "#555" }}>Telah Terima Dari <span style={{ float: "right" }}>(Received From)</span></span>
              <span>:</span>
              <span style={{ fontWeight: "700" }}>{parentName}</span>
            </div>

            <div className="receipt-row">
              <span style={{ fontWeight: "700", color: "#555" }}>Nama Siswa <span style={{ float: "right" }}>(Student Name)</span></span>
              <span>:</span>
              <span style={{ fontWeight: "700", color: "var(--color-primary-dark)" }}>{selectedChild?.name}</span>
            </div>

            <div className="receipt-row">
              <span style={{ fontWeight: "700", color: "#555" }}>Program / Level <span style={{ float: "right" }}>(Program / Level)</span></span>
              <span>:</span>
              <span>{selectedChild?.program}</span>
            </div>

            <div className="receipt-row">
              <span style={{ fontWeight: "700", color: "#555" }}>Untuk Pembayaran <span style={{ float: "right" }}>(For Payment of)</span></span>
              <span>:</span>
              <span>Pembayaran SPP Kursus Masa {getMonthName(printReceipt.month)}</span>
            </div>

            <div className="receipt-row">
              <span style={{ fontWeight: "700", color: "#555" }}>Sejumlah Uang <span style={{ float: "right" }}>(Amount in Words)</span></span>
              <span>:</span>
              <span style={{ fontStyle: "italic", fontWeight: "700", color: "#444" }}>## {terbilangStr} ##</span>
            </div>

          </div>

          {/* Amount Box and Signatures */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "2.5rem" }}>
            
            {/* Amount Box */}
            <div style={{ border: "2px solid #333", padding: "0.75rem 1.5rem", borderRadius: "4px", backgroundColor: "#f8fafc", display: "inline-block" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: "700", display: "block", color: "#555", borderBottom: "1px solid #333", paddingBottom: "2px", marginBottom: "4px" }}>JUMLAH (AMOUNT)</span>
              <span style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-primary-dark)", fontFamily: "monospace" }}>
                Rp {parseInt(printReceipt.amount).toLocaleString("id-ID")},-
              </span>
            </div>

            {/* Signature Area */}
            <div style={{ textAlign: "center", width: "220px", fontSize: "0.85rem" }}>
              <p style={{ margin: "0 0 4rem" }}>Bobong, {printReceipt.payment_date && printReceipt.payment_date !== "-" ? getIndonesianDate(printReceipt.payment_date) : getIndonesianDate(new Date().toISOString().split("T")[0])}</p>
              <div style={{ borderBottom: "1px solid #333", width: "180px", margin: "0 auto 4px" }}></div>
              <p style={{ fontWeight: "800", margin: "0", color: "var(--color-primary-dark)" }}>Kasir / Finance Office</p>
              <p style={{ fontSize: "0.7rem", color: "#777", margin: "0" }}>Ibra Global English Bobong</p>
            </div>

          </div>

          {/* Watermark/Footer stamp */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-15deg)", opacity: "0.03", fontSize: "4.5rem", fontWeight: "900", color: "var(--color-primary)", pointerEvents: "none", whiteSpace: "nowrap", border: "8px solid var(--color-primary)", padding: "10px 20px", borderRadius: "16px" }}>
            PAID &bull; LUNAS
          </div>

        </div>
      </div>
    );
  }

  // PRINT PREVIEW OVERLAY
  if (printReport) {
    const isCalistung = selectedChild?.program?.toLowerCase()?.includes("calistung");
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
                <h1 style={{ fontSize: "1.5rem", fontWeight: "900", margin: "0", color: "var(--color-primary)" }}>IBRA GLOBAL ENGLISH</h1>
                <p style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--color-accent)", margin: "0" }}>Belajar Seru, Lancar Bicara</p>
                <p style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", margin: "2px 0 0" }}>{paymentSettings.contact_address || "Jl. TPU Bobong Komp. Fangahu, Lantai 1 Kost Fitrah"}</p>
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
            <h2>Ibra Global English</h2>
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

          <button
            onClick={() => { setActiveView("lms"); setMobileOpen(false); }}
            className={`sidebar-nav-link ${activeView === "lms" ? "active" : ""}`}
            style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v21H6.5a2.5 2.5 0 0 1-2.5-2.5z"/></svg>
            <span>LMS & Tugas Anak</span>
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
          <div className="topbar-user" style={{ gap: "1rem", position: "relative", display: "flex", alignItems: "center" }}>
            
            {/* Lonceng Notifikasi */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-gray-600)",
                  position: "relative",
                  padding: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  backgroundColor: showNotificationDropdown ? "var(--color-gray-100)" : "transparent",
                  transition: "background-color 0.2s"
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                {notifications.length > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "2px",
                    right: "2px",
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#ef4444",
                    borderRadius: "50%",
                    border: "1.5px solid white"
                  }} />
                )}
              </button>

              {/* Dropdown Notifikasi */}
              {showNotificationDropdown && (
                <div style={{
                  position: "absolute",
                  right: "0",
                  top: "35px",
                  width: "320px",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  boxShadow: "var(--shadow-xl)",
                  border: "1px solid var(--color-gray-200)",
                  zIndex: 100,
                  overflow: "hidden"
                }}>
                  <div style={{ padding: "0.85rem 1.15rem", borderBottom: "1px solid var(--color-gray-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "800", fontSize: "0.85rem", color: "var(--color-gray-900)" }}>Notifikasi ({notifications.length})</span>
                  </div>
                  <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--color-gray-400)", fontSize: "0.8rem" }}>
                        Tidak ada notifikasi baru saat ini.
                      </div>
                    ) : (
                      notifications.map((n, idx) => (
                        <div
                          key={n.id || idx}
                          onClick={() => {
                            n.action();
                            setShowNotificationDropdown(false);
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-gray-50)"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                          style={{
                            padding: "0.85rem 1.15rem",
                            borderBottom: idx < notifications.length - 1 ? "1px solid var(--color-gray-50)" : "none",
                            cursor: "pointer",
                            transition: "background-color 0.2s",
                            textAlign: "left"
                          }}
                        >
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                            <span style={{ fontSize: "1rem" }}>{n.type === "warning" ? "⚠️" : "🔔"}</span>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: "0.8rem", fontWeight: "800", color: n.type === "warning" ? "#dc2626" : "var(--color-gray-900)", marginBottom: "2px" }}>
                                {n.title}
                              </p>
                              <p style={{ fontSize: "0.75rem", color: "var(--color-gray-600)", lineHeight: "1.4" }}>
                                {n.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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
            </div>            {/* TAB VIEW 1: PROGRESS (Kemajuan Belajar) */}
            {activeView === "progress" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

                {/* B1: Pengumuman Aktif */}
                {announcements.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--color-gray-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
                      📢 Pengumuman untuk {selectedChild?.name || "Anak Anda"}
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                      {announcements.slice(0, 3).map(ann => {
                        const priColor = ann.priority === "urgent" ? "#ef4444" : ann.priority === "penting" ? "#f59e0b" : "var(--color-primary)";
                        return (
                          <div key={ann.id} style={{ borderRadius: "12px", border: `1.5px solid ${priColor}22`, background: `${priColor}07`, padding: "0.9rem 1.1rem", borderLeft: `4px solid ${priColor}` }}>
                            <p style={{ fontWeight: "800", fontSize: "0.9rem", color: "var(--color-gray-900)", marginBottom: "0.2rem" }}>{ann.title}</p>
                            <p style={{ fontSize: "0.82rem", color: "var(--color-gray-600)", lineHeight: 1.5 }}>{ann.content}</p>
                            <p style={{ fontSize: "0.72rem", color: "var(--color-gray-400)", marginTop: "0.35rem" }}>
                              {new Date(ann.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} · {ann.program}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* B2: Jadwal Kelas Online */}
                {onlineSchedules.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--color-gray-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
                      🎥 Jadwal Kelas Online Mendatang
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                      {onlineSchedules.slice(0, 2).map(s => {
                        const dt = new Date(s.scheduled_at);
                        return (
                          <div key={s.id} style={{ borderRadius: "12px", border: "1.5px solid var(--color-primary-light)", background: "linear-gradient(135deg, var(--color-primary-light) 0%, white 100%)", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                            <div>
                              <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.3rem" }}>
                                <span style={{ fontSize: "0.7rem", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", background: "var(--color-primary)", color: "white" }}>{s.meeting_platform}</span>
                                <span style={{ fontSize: "0.7rem", fontWeight: "600", padding: "2px 8px", borderRadius: "20px", background: "var(--color-gray-100)", color: "var(--color-gray-600)" }}>{s.duration_minutes} menit</span>
                              </div>
                              <p style={{ fontWeight: "800", fontSize: "0.875rem", color: "var(--color-gray-900)" }}>{s.title}</p>
                              <p style={{ fontSize: "0.8rem", color: "var(--color-gray-600)" }}>
                                📅 {dt.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })} · ⏰ {dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                            <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" className="btn-portal-primary" style={{ textDecoration: "none", padding: "0.5rem 1rem", fontSize: "0.825rem", whiteSpace: "nowrap" }}>
                              🚀 Masuk Kelas
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Riwayat Kehadiran */}
                <div className="portal-card" style={{ padding: "2rem" }}>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.5rem" }}>
                    Riwayat Kehadiran Siswa
                  </h3>
                  
                  {detailsLoading ? (
                    <>
                      {/* Attendance Stats Cards Skeleton */}
                      <div className="four-column-grid" style={{ gap: "1rem", marginBottom: "2rem" }}>
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} style={{ textAlign: "center", padding: "1.25rem 1rem", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-white)", boxShadow: "var(--shadow-sm)" }}>
                            <div className="skeleton-pulse skeleton-title" style={{ width: "30px", marginBottom: "0.5rem", display: "block", marginInline: "auto" }} />
                            <div className="skeleton-pulse skeleton-text" style={{ width: "50px", display: "block", marginInline: "auto" }} />
                          </div>
                        ))}
                      </div>
                      
                      {/* Attendance Table Skeleton */}
                      <div className="table-wrapper">
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
                            {Array.from({ length: 4 }).map((_, i) => (
                              <tr key={i}>
                                <td><div className="skeleton-pulse skeleton-text" style={{ width: "20px" }} /></td>
                                <td><div className="skeleton-pulse skeleton-text" style={{ width: "60px" }} /></td>
                                <td><div className="skeleton-pulse skeleton-text" style={{ width: "100px" }} /></td>
                                <td><div className="skeleton-pulse skeleton-text" style={{ width: "80px" }} /></td>
                                <td><div className="skeleton-pulse skeleton-text" style={{ width: "150px" }} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Attendance Stats Cards */}
                      <div className="four-column-grid" style={{ gap: "1rem", marginBottom: "2rem" }}>
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
                    </>
                  )}
                </div>

                {/* Rapor Belajar Digital (Report Cards list) */}
                <div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.25rem" }}>
                    Rapor Belajar Digital & Grafik Pencapaian
                  </h3>
                  
                  {reports.length > 0 && !detailsLoading && (
                    <div style={{ marginBottom: "2rem" }}>
                      <LineChart reports={reports} isCalistung={selectedChild?.program?.toLowerCase()?.includes("calistung")} />
                    </div>
                  )}

                  {detailsLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="portal-card" style={{ padding: "2rem" }}>
                          <div style={{ borderBottom: "1px solid var(--color-gray-100)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                            <div className="skeleton-pulse skeleton-title" style={{ width: "200px", marginBottom: "0.5rem" }} />
                            <div className="skeleton-pulse skeleton-text" style={{ width: "150px" }} />
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem", alignItems: "center" }} className="report-detail-layout">
                            <div className="form-grid" style={{ gap: "1rem", marginBottom: 0 }}>
                              {Array.from({ length: 4 }).map((_, j) => (
                                <div key={j} style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-gray-100)" }}>
                                  <div className="skeleton-pulse skeleton-title" style={{ width: "45px", margin: "0 auto 0.5rem" }} />
                                  <div className="skeleton-pulse skeleton-text" style={{ width: "65px", margin: "0 auto" }} />
                                </div>
                              ))}
                            </div>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              <div className="skeleton-pulse skeleton-circle" style={{ width: "180px", height: "180px" }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : reports.length === 0 ? (
                    <div className="portal-card" style={{ padding: "3rem", textAlign: "center" }}>
                      <p style={{ color: "var(--color-gray-500)" }}>Belum ada rapor digital yang diterbitkan untuk saat ini.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                      {reports.map((report) => {
                        const isCalistung = selectedChild?.program?.toLowerCase()?.includes("calistung");
                        return (
                          <div key={report.id} className="portal-card" style={{ padding: "2rem" }}>
                            
                            {/* Card Header */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", borderBottom: "1px solid var(--color-gray-100)", paddingBottom: "1rem" }}>
                              <div>
                                <h4 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--color-gray-900)" }}>{report.module_name}</h4>
                                <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>
                                  Diterbitkan pada {new Date(report.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                </p>
                              </div>
                              <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button className="btn-portal-outline" style={{ padding: "0.5rem 1.15rem", fontSize: "0.8rem", display: "flex", gap: "0.5rem", alignItems: "center" }} onClick={() => triggerPrint(report)}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                                  <span>Cetak Rapor PDF</span>
                                </button>
                                {(() => {
                                  const existingCert = certificates.find(
                                    (c) => c.report_id === report.id || (c.student_id === selectedChild.id && c.module_name?.toLowerCase() === report.module_name?.toLowerCase())
                                  );
                                  if (existingCert) {
                                    return (
                                      <a
                                        href={`/verify/${existingCert.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-portal-outline"
                                        style={{ 
                                          padding: "0.5rem 1.15rem", 
                                          fontSize: "0.8rem", 
                                          display: "inline-flex", 
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

                            </div>

                            {/* Grid with Scores Cards and visual SVG Radar Chart */}
                            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem", alignItems: "center" }} className="report-detail-layout">
                              
                              {/* Score Metrics Grid */}
                              <div className="form-grid" style={{ gap: "1rem", marginBottom: 0 }}>
                                <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-gray-100)" }}>
                                  <p style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.speaking_score}</p>
                                  <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>
                                    {isCalistung ? "Membaca" : "Speaking"}
                                  </p>
                                </div>
                                <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-gray-100)" }}>
                                  <p style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.grammar_score}</p>
                                  <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>
                                    {isCalistung ? "Menulis" : "Grammar"}
                                  </p>
                                </div>
                                <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-gray-100)" }}>
                                  <p style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.vocabulary_score}</p>
                                  <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>
                                    {isCalistung ? "Berhitung" : "Vocabulary"}
                                  </p>
                                </div>
                                <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-gray-100)" }}>
                                  <p style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.active_score}</p>
                                  <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>
                                    {isCalistung ? "Keaktifan" : "Active"}
                                  </p>
                                </div>
                              </div>

                              {/* SVG Chart visualization */}
                              <div>
                                <RadarChart
                                  speaking={report.speaking_score}
                                  grammar={report.grammar_score}
                                  vocabulary={report.vocabulary_score}
                                  active={report.active_score}
                                  isCalistung={isCalistung}
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
                        );
                      })}
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

                {detailsLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="portal-card" style={{ borderLeft: "5px solid var(--color-gray-200)", padding: "1.5rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                        <div style={{ flex: "1 1 300px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <div className="skeleton-pulse skeleton-text" style={{ width: "60px" }} />
                            <div className="skeleton-pulse skeleton-text" style={{ width: "100px" }} />
                          </div>
                          <div className="skeleton-pulse skeleton-title" style={{ width: "220px", marginBottom: "0.5rem" }} />
                          <div className="skeleton-pulse skeleton-text" style={{ width: "320px" }} />
                        </div>
                        <div style={{ textAlign: "right", minWidth: "200px" }}>
                          <div className="skeleton-pulse skeleton-text" style={{ width: "140px", marginBottom: "0.5rem" }} />
                          <div className="skeleton-pulse skeleton-text" style={{ width: "100px" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : parentSchedules.length === 0 ? (
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

                  {detailsLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} style={{ border: "1px solid var(--color-gray-100)", borderRadius: "8px", padding: "1.25rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                          <div>
                            <div className="skeleton-pulse skeleton-title" style={{ width: "120px", marginBottom: "0.5rem" }} />
                            <div className="skeleton-pulse skeleton-text" style={{ width: "150px" }} />
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.5rem" }}>
                            <div className="skeleton-pulse skeleton-text" style={{ width: "100px" }} />
                            <div className="skeleton-pulse skeleton-text" style={{ width: "80px" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
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
                                        style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", fontWeight: "600" }}
                                      >
                                        Lihat Bukti ↗
                                      </a>
                                    )}
                                    {pay.status === "lunas" && (
                                      <button
                                        onClick={() => triggerPrintReceipt(pay)}
                                        className="btn-portal-primary"
                                        style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", fontWeight: "700" }}
                                      >
                                        🖨️ Cetak Kuitansi
                                      </button>
                                    )}
                                  </div>
                                )}
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

            {/* TAB VIEW 4: LMS & TUGAS ANAK */}
            {activeView === "lms" && (
              <div className="portal-card" style={{ padding: "2rem" }}>
                <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
                  LMS & Tugas Rumah Anak
                </h3>
                <p style={{ color: "var(--color-gray-500)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
                  Pantau daftar materi belajar dan status penyelesaian tugas rumah yang diberikan oleh Tutor untuk <strong>{selectedChild?.name}</strong>.
                </p>

                {/* Progress Summary Card */}
                {(() => {
                  const tasks = lmsMaterials.filter(m => m.type === "tugas");
                  const done = tasks.filter(t => lmsSubmissions.some(s => s.material_id === t.id)).length;
                  const total = tasks.length;
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                  const barColor = pct >= 75 ? "var(--color-green)" : pct >= 50 ? "#f59e0b" : pct > 0 ? "var(--color-red)" : "var(--color-gray-300)";
                  return total > 0 ? (
                    <div style={{ marginBottom: "1.75rem", padding: "1.25rem 1.5rem", background: "linear-gradient(135deg, var(--color-primary-light) 0%, rgba(255,255,255,0.8) 100%)", borderRadius: "14px", border: "1px solid var(--color-primary-light)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <div>
                          <p style={{ fontWeight: "800", fontSize: "0.95rem", color: "var(--color-primary-dark)", marginBottom: "2px" }}>📊 Ringkasan Progress Tugas</p>
                          <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>Data real-time dari LMS Ibra Global English</p>
                        </div>
                        <div style={{ textAlign: "center", background: "white", borderRadius: "12px", padding: "0.5rem 1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                          <p style={{ fontSize: "1.5rem", fontWeight: "900", color: barColor, lineHeight: 1 }}>{pct}%</p>
                          <p style={{ fontSize: "0.7rem", color: "var(--color-gray-500)", fontWeight: "600" }}>Selesai</p>
                        </div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: "99px", height: "12px", overflow: "hidden", marginBottom: "0.75rem" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: "99px", transition: "width 1s ease", boxShadow: `0 0 8px ${barColor}55` }} />
                      </div>
                      <div style={{ display: "flex", gap: "2rem", fontSize: "0.82rem" }}>
                        <span style={{ color: "var(--color-green)", fontWeight: "700" }}>✅ {done} Selesai</span>
                        <span style={{ color: "var(--color-gray-500)", fontWeight: "600" }}>⏳ {total - done} Belum</span>
                        <span style={{ color: "var(--color-primary-dark)", fontWeight: "600" }}>📚 {total} Total Tugas</span>
                      </div>
                    </div>
                  ) : null;
                })()}

                {detailsLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="portal-card" style={{ borderLeft: "5px solid var(--color-gray-200)", padding: "1.5rem" }}>
                        <div className="skeleton-pulse skeleton-title" style={{ width: "200px", marginBottom: "0.5rem" }} />
                        <div className="skeleton-pulse skeleton-text" style={{ width: "320px" }} />
                      </div>
                    ))}
                  </div>
                ) : lmsMaterials.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gray-400)" }}>
                    <p style={{ fontWeight: "600" }}>Belum ada materi atau tugas yang dibagikan untuk program ini.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {lmsMaterials.map((mat) => {
                      const submission = lmsSubmissions.find(sub => sub.material_id === mat.id);
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
                          gap: "1rem"
                        }} className="table-row-hover">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                            <div>
                              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <span style={{
                                  backgroundColor: mat.type === "tugas" ? "rgba(166, 136, 73, 0.1)" : "rgba(33, 108, 126, 0.1)",
                                  color: mat.type === "tugas" ? "var(--color-accent)" : "var(--color-primary-dark)",
                                  fontSize: "0.75rem",
                                  fontWeight: "800",
                                  padding: "0.25rem 0.65rem",
                                  borderRadius: "12px",
                                  textTransform: "uppercase"
                                }}>
                                  {mat.type === "tugas" ? "Tugas" : "Materi"}
                                </span>
                                
                                {mat.type === "tugas" && (
                                  isGraded ? (
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
                                  )
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
                                <span>Unduh Berkas</span>
                              </a>
                            )}
                          </div>

                          {mat.description && (
                            <p style={{ color: "var(--color-gray-600)", fontSize: "0.95rem", lineHeight: "1.5", whiteSpace: "pre-line" }}>
                              {mat.description}
                            </p>
                          )}

                          {/* Status & Ulasan panel */}
                          {mat.type === "tugas" && (
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
                                      <span style={{ fontWeight: "800", color: "var(--color-gray-800)", fontSize: "0.95rem" }}>Penilaian Tutor</span>
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
                                    Dikumpulkan: {new Date(submission.submitted_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    &nbsp;&bull;&nbsp; <a href={submission.file_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: "bold" }}>Lihat Berkas Jawaban Anak</a>
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
                                  alignItems: "center"
                                }}>
                                  <span>✅ Jawaban dikirim pada {new Date(submission.submitted_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                                  <a href={submission.file_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: "bold" }}>Buka Jawaban Anak ↗</a>
                                </div>
                              ) : (
                                <div style={{
                                  backgroundColor: "rgba(239, 68, 68, 0.05)",
                                  border: "1px dashed rgba(239, 68, 68, 0.2)",
                                  borderRadius: "8px",
                                  padding: "1rem",
                                  fontSize: "0.9rem",
                                  color: "var(--color-red)",
                                  fontWeight: "600"
                                }}>
                                  ⚠️ Anak Anda belum mengumpulkan tugas ini. Harap ingatkan anak Anda untuk mengerjakan tugas sebelum tenggat waktu.
                                </div>
                              )}
                            </div>
                          )}

                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-gray-400)", borderTop: "1px solid var(--color-gray-150)", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
                            <span>Tenggat Waktu: <strong>
                              {mat.due_date ? new Date(mat.due_date).toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Tidak ada tenggat"}
                            </strong></span>
                            <span>Diterbitkan: {new Date(mat.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
