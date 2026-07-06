"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ParentSessionManager from "./components/ParentSessionManager";
import ParentSidebar from "./components/ParentSidebar";
import ParentHeader from "./components/ParentHeader";
import ProgressView from "./components/ProgressView";
import CalendarView from "./components/CalendarView";
import FinanceView from "./components/FinanceView";
import LMSView from "./components/LMSView";
import ReceiptPrint from "./components/ReceiptPrint";
import "@/app/dashboard.css";
import "@/app/dashboard-print.css";
import "./parent.css";

interface StudentRecord {
  id: string;
  name: string;
  program: string;
  age: number;
  parent_id?: string;
  [key: string]: unknown;
}

interface AttendanceStats {
  hadir: number;
  sakit: number;
  izin: number;
  alfa: number;
}

interface PaymentSettings {
  payment_bank_name: string;
  payment_account_number: string;
  payment_account_name: string;
  payment_account_sub: string;
  contact_address: string;
}

export default function ParentPortal() {
  const supabase = createClient();
  const router = useRouter();

  // Session & Auth
  const [parentName, setParentName] = useState<string>("");
  const [children, setChildren] = useState<StudentRecord[]>([]);
  const [selectedChild, setSelectedChild] = useState<StudentRecord | null>(null);

  // Navigation
  const [activeView, setActiveView] = useState<string>("progress");
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState<boolean>(false);

  // Data States
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [onlineSchedules, setOnlineSchedules] = useState<any[]>([]);
  const [academicSchedules, setAcademicSchedules] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({ hadir: 0, sakit: 0, izin: 0, alfa: 0 });
  const [reports, setReports] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [lmsMaterials, setLmsMaterials] = useState<any[]>([]);
  const [lmsSubmissions, setLmsSubmissions] = useState<any[]>([]);
  const [parentPayments, setParentPayments] = useState<any[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    payment_bank_name: "Bank Mandiri",
    payment_account_number: "137-00-1234567-8",
    payment_account_name: "Ibra Global English",
    payment_account_sub: "Bobong Learning Centre",
    contact_address: "Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001, Bobong, Taliabu Barat, Kabupaten Pulau Taliabu, Maluku Utara 97794",
  });
  const [detailsLoading, setDetailsLoading] = useState<boolean>(true);

  // Print States
  const [printReport, setPrintReport] = useState<any | null>(null);
  const [printReceipt, setPrintReceipt] = useState<any | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState<boolean>(false);

  // Refs
  const receiptFileRef = useRef<HTMLInputElement>(null);

  // ----------------------------------------------------
  // UTILITY FUNCTIONS
  // ----------------------------------------------------
  const getIndonesianDay = (dateStr: string): string => {
    if (!dateStr) return "";
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[new Date(dateStr).getDay()];
  };

  const getIndonesianDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const getTerbilang = (val: number | string): string => {
    const num = typeof val === "string" ? parseInt(val, 10) : val;
    if (isNaN(num) || num <= 0) return "";
    const bilangan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    if (num < 12) return bilangan[num];
    if (num < 20) return getTerbilang(num - 10) + " Belas";
    if (num < 100) return (num / 10 >> 0) === 1 ? getTerbilang(num % 10) : getTerbilang(num / 10 >> 0) + " Puluh " + getTerbilang(num % 10);
    if (num < 200) return "Seratus " + getTerbilang(num - 100);
    if (num < 1000) return (num / 100 >> 0) === 1 ? getTerbilang(num % 100) : getTerbilang(num / 100 >> 0) + " Ratus " + getTerbilang(num % 100);
    if (num < 2000) return "Seribu " + getTerbilang(num - 1000);
    if (num < 1000000) return (num / 1000 >> 0) === 1 ? getTerbilang(num % 1000) : getTerbilang(num / 1000 >> 0) + " Ribu " + getTerbilang(num % 1000);
    if (num < 1000000000) return (num / 1000000 >> 0) === 1 ? getTerbilang(num % 1000000) : getTerbilang(num / 1000000 >> 0) + " Juta " + getTerbilang(num % 1000000);
    return "";
  };

  const getMonthName = (ym: string): string => {
    if (!ym) return "";
    const [y, m] = ym.split("-");
    const date = new Date(parseInt(y), parseInt(m) - 1, 1);
    return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  };

  const getRecentMonths = (): string[] => {
    const list: string[] = [];
    const d = new Date();
    for (let i = 0; i < 6; i++) {
      const temp = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const mm = String(temp.getMonth() + 1).padStart(2, "0");
      const yyyy = temp.getFullYear();
      list.push(`${yyyy}-${mm}`);
    }
    return list;
  };

  const getChildProgramPrice = (program: string | null | undefined): number => {
    if (!program) return 300000;
    const lower = program.toLowerCase();
    if (lower.includes("calistung")) return 350000;
    if (lower.includes("teen") || lower.includes("remaja")) return 300000;
    return 300000;
  };

  // ----------------------------------------------------
  // DATA FETCHING
  // ----------------------------------------------------
  const fetchParentData = async () => {
    setDetailsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get parent profile
      const { data: parentData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (parentData) {
        setParentName(parentData.full_name || "Orang Tua");
      }

      // Get linked children directly from students table
      const { data: studentsData } = await supabase
        .from("students")
        .select("*")
        .eq("parent_id", user.id);

      if (studentsData) {
        setChildren(studentsData as StudentRecord[]);
        setSelectedChild(studentsData[0] as StudentRecord);
      }

      // Fetch payment settings
      const { data: settings } = await supabase
        .from("landing_settings")
        .select("*");

      if (settings) {
        const settingsObj: Record<string, string> = {};
        settings.forEach((s: { key: string; value: string }) => {
          settingsObj[s.key] = s.value;
        });
        setPaymentSettings({
          payment_bank_name: settingsObj.payment_bank_name || "Bank Mandiri",
          payment_account_number: settingsObj.payment_account_number || "137-00-1234567-8",
          payment_account_name: settingsObj.payment_account_name || "Ibra Global English",
          payment_account_sub: settingsObj.payment_account_sub || "Bobong Learning Centre",
          contact_address: settingsObj.contact_address || "Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001, Bobong, Taliabu Barat, Kabupaten Pulau Taliabu, Maluku Utara 97794"
        });
      }

      // Fetch announcements
      const { data: annData } = await supabase
        .from("announcements")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(3);
      setAnnouncements(annData || []);

      // Fetch certificates
      const { data: certData } = await supabase
        .from("certificates")
        .select("*");
      setCertificates(certData || []);

    } catch (err) {
      console.error("Error fetching parent data:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchChildDetails = async (child: StudentRecord | null) => {
    if (!child) return;
    setDetailsLoading(true);

    try {
      // Fetch attendance
      const { data: attData } = await supabase
        .from("attendance")
        .select("*")
        .eq("student_id", child.id)
        .order("date", { ascending: false })
        .limit(50);

      if (attData) {
        setAttendance(attData);
        const stats: AttendanceStats = { hadir: 0, sakit: 0, izin: 0, alfa: 0 };
        attData.forEach((a: { status: keyof AttendanceStats }) => {
          if (stats[a.status] !== undefined) stats[a.status]++;
        });
        setAttendanceStats(stats);
      }

      // Fetch reports
      const { data: reportData } = await supabase
        .from("reports")
        .select("*")
        .eq("student_id", child.id)
        .order("created_at", { ascending: false });

      setReports(reportData || []);

      // Fetch LMS materials
      const { data: matData } = await supabase
        .from("lms_materials")
        .select("*")
        .eq("program", child.program)
        .order("created_at", { ascending: false });

      setLmsMaterials(matData || []);

      // Fetch LMS submissions
      const { data: subData } = await supabase
        .from("lms_submissions")
        .select("*")
        .eq("student_id", child.id);

      setLmsSubmissions(subData || []);

      // Fetch payments
      const { data: payData } = await supabase
        .from("tuition_payments")
        .select("*")
        .eq("student_id", child.id)
        .order("month", { ascending: false });

      setParentPayments(payData || []);

      // Fetch online schedules for this child's program
      const { data: schedData } = await supabase
        .from("online_schedules")
        .select("*")
        .eq("program", child.program)
        .eq("is_active", true)
        .order("scheduled_at", { ascending: true })
        .limit(2);
      setOnlineSchedules(schedData || []);

      // Fetch academic schedules for this child's program or 'All'
      const { data: acadData } = await supabase
        .from("academic_schedules")
        .select("*")
        .in("program", [child.program, "All"])
        .order("start_time", { ascending: true });
      setAcademicSchedules(acadData || []);

    } catch (err) {
      console.error("Error fetching child details:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {


    let cancelled = false;


    const load = async () => {


      if (cancelled) return;


      fetchParentData();


    };


    load();


    return () => {


      cancelled = true;


    };


  }, []);

  useEffect(() => {
    if (selectedChild) {
      const timer = setTimeout(() => {
        fetchChildDetails(selectedChild);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [selectedChild]);

  // ----------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.clear();
    document.cookie = "login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  const handleUploadReceipt = async (e: React.ChangeEvent<HTMLInputElement>, month: string) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChild) return;

    setUploadingReceipt(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `receipt_${selectedChild.id}_${month}_${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("spp-receipts")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("spp-receipts")
        .getPublicUrl(filePath);

      // Update payment record in tuition_payments table
      const { error: updateError } = await supabase
        .from("tuition_payments")
        .upsert({
          student_id: selectedChild.id,
          month,
          amount: getChildProgramPrice(selectedChild.program),
          status: "menunggu_konfirmasi",
          receipt_url: publicUrl,
        }, { onConflict: "student_id,month" });

      if (updateError) throw updateError;

      alert("Bukti pembayaran berhasil diunggah! Menunggu konfirmasi admin.");
      fetchChildDetails(selectedChild);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Gagal mengunggah bukti pembayaran: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUploadingReceipt(false);
      if (receiptFileRef.current) receiptFileRef.current.value = "";
    }
  };

  const triggerPrint = (report: any) => {
    setPrintReport(report);
    setTimeout(() => {
      document.body.classList.add("print-raport");
      window.print();
      const cleanup = () => { document.body.classList.remove("print-raport"); window.removeEventListener("afterprint", cleanup); };
      window.addEventListener("afterprint", cleanup);
    }, 800);
  };

  const triggerPrintReceipt = (pay: any) => {
    setPrintReceipt(pay);
    setTimeout(() => {
      window.print();
    }, 800);
  };

  // ----------------------------------------------------
  // RENDER
  // ----------------------------------------------------
  if (printReport) {
    return (
      <ProgressView
        selectedChild={selectedChild}
        announcements={announcements}
        onlineSchedules={onlineSchedules}
        attendance={attendance}
        attendanceStats={attendanceStats}
        reports={reports}
        certificates={certificates}
        detailsLoading={detailsLoading}
        getIndonesianDay={getIndonesianDay}
        getIndonesianDate={getIndonesianDate}
        triggerPrint={triggerPrint}
      />
    );
  }

  if (printReceipt) {
    return (
      <ReceiptPrint
        printReceipt={printReceipt}
        selectedChild={selectedChild}
        parentName={parentName}
        paymentSettings={paymentSettings}
        getTerbilang={getTerbilang}
        getMonthName={getMonthName}
        getIndonesianDate={getIndonesianDate}
        onBack={() => setPrintReceipt(null)}
      />
    );
  }

  return (
    <div className="dashboard-container">
      <ParentSessionManager supabase={supabase} router={router} />

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

      <ParentSidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        handleLogout={handleLogout}
        parentName={parentName}
      />

      <main className="dashboard-main">
        <ParentHeader
          parentName={parentName}
          notifications={notifications}
          showNotificationDropdown={showNotificationDropdown}
          setShowNotificationDropdown={setShowNotificationDropdown}
          onLogout={handleLogout}
        />

        {children.length === 0 ? (
          <div className="portal-card text-center" style={{ padding: "3rem 2rem", borderTop: "4px solid var(--color-accent)" }}>
            <svg style={{ color: "var(--color-accent)", width: "48px", height: "48px", marginBottom: "1rem", display: "inline-block" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
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
              <div className="child-nav-tabs">
                {children.map((child) => (
                  <button
                    key={child.id}
                    className={`child-tab-btn ${selectedChild?.id === child.id ? "active" : ""}`}
                    onClick={() => setSelectedChild(child)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>{child.name} ({child.program})</span>
                  </button>
                ))}
              </div>
            )}

            {/* Currently Monitored Student Card */}
            <div className="monitored-student-banner">
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Siswa yang Dipantau</p>
                <h2>{selectedChild?.name}</h2>
                <p style={{ fontSize: "0.9rem", color: "var(--color-gray-600)", fontWeight: "600", marginTop: "2px" }}>
                  Program: <strong>{selectedChild?.program}</strong> · Usia {selectedChild?.age} tahun
                </p>
              </div>
              <div className="user-badge">
                Siswa Aktif
              </div>
            </div>

            {/* Tab Views */}
            {activeView === "progress" && (
              <div className="view-fade-in">
                <ProgressView
                  selectedChild={selectedChild}
                  announcements={announcements}
                  onlineSchedules={onlineSchedules}
                  attendance={attendance}
                  attendanceStats={attendanceStats}
                  reports={reports}
                  certificates={certificates}
                  detailsLoading={detailsLoading}
                  getIndonesianDay={getIndonesianDay}
                  getIndonesianDate={getIndonesianDate}
                  triggerPrint={triggerPrint}
                />
              </div>
            )}

            {activeView === "calendar" && (
              <div className="view-fade-in">
                <CalendarView
                  parentSchedules={academicSchedules}
                  detailsLoading={detailsLoading}
                  selectedChild={selectedChild}
                />
              </div>
            )}

            {activeView === "finance" && (
              <div className="view-fade-in">
                <FinanceView
                  selectedChild={selectedChild}
                  paymentSettings={paymentSettings}
                  parentPayments={parentPayments}
                  uploadingReceipt={uploadingReceipt}
                  getChildProgramPrice={getChildProgramPrice}
                  getMonthName={getMonthName}
                  handleUploadReceipt={handleUploadReceipt}
                  triggerPrintReceipt={triggerPrintReceipt}
                  detailsLoading={detailsLoading}
                />
              </div>
            )}

            {activeView === "lms" && (
              <div className="view-fade-in">
                <LMSView
                  selectedChild={selectedChild}
                  lmsMaterials={lmsMaterials}
                  lmsSubmissions={lmsSubmissions}
                  detailsLoading={detailsLoading}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
