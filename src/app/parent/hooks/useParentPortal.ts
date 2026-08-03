import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getIndonesianDay, getIndonesianDate, getTerbilang, getMonthName, getChildProgramPrice } from "./parentPortalHelpers";

export interface StudentRecord { id: string; name: string; program: string; age: number; parent_id?: string; [key: string]: unknown; }
export interface AttendanceStats { hadir: number; sakit: number; izin: number; alfa: number; }
export interface PaymentSettings { payment_bank_name: string; payment_account_number: string; payment_account_name: string; payment_account_sub: string; contact_address: string; }

const DEFAULT_PAYMENT: PaymentSettings = {
  payment_bank_name: "Bank Mandiri", payment_account_number: "137-00-1234567-8",
  payment_account_name: "Ibra Global English", payment_account_sub: "Bobong Learning Centre",
  contact_address: "Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001, Bobong, Taliabu Barat, Kabupaten Pulau Taliabu, Maluku Utara 97794",
};

export function useParentPortal() {
  const supabase = createClient();
  const router = useRouter();

  const [parentName, setParentName] = useState<string>("");
  const [children, setChildren] = useState<StudentRecord[]>([]);
  const [selectedChild, setSelectedChild] = useState<StudentRecord | null>(null);
  const [activeView, setActiveView] = useState<string>("progress");
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [notifications] = useState<any[]>([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState<boolean>(false);
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
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(true);
  const [printReport, setPrintReport] = useState<any | null>(null);
  const [printReceipt, setPrintReceipt] = useState<any | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState<boolean>(false);
  const receiptFileRef = useRef<HTMLInputElement>(null);

  const fetchParentData = async () => {
    setDetailsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: parentData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (parentData) setParentName(parentData.full_name || "Orang Tua");
      const { data: studentsData } = await supabase.from("students").select("*").eq("parent_id", user.id);
      if (studentsData) { setChildren(studentsData as StudentRecord[]); setSelectedChild(studentsData[0] as StudentRecord); }
      const { data: settings } = await supabase.from("landing_settings").select("*");
      if (settings) {
        const s: Record<string, string> = {};
        settings.forEach((r: { key: string; value: string }) => { s[r.key] = r.value; });
        setPaymentSettings({ payment_bank_name: s.payment_bank_name || DEFAULT_PAYMENT.payment_bank_name, payment_account_number: s.payment_account_number || DEFAULT_PAYMENT.payment_account_number, payment_account_name: s.payment_account_name || DEFAULT_PAYMENT.payment_account_name, payment_account_sub: s.payment_account_sub || DEFAULT_PAYMENT.payment_account_sub, contact_address: s.contact_address || DEFAULT_PAYMENT.contact_address });
      }
      const { data: annData } = await supabase.from("announcements").select("*").order("published_at", { ascending: false }).limit(3);
      setAnnouncements(annData || []);
      const { data: certData } = await supabase.from("certificates").select("*");
      setCertificates(certData || []);
    } catch (err) { console.error("Error fetching parent data:", err); } finally { setDetailsLoading(false); }
  };

  const fetchChildDetails = async (child: StudentRecord | null) => {
    if (!child) return;
    setDetailsLoading(true);
    try {
      const { data: attData } = await supabase.from("attendance").select("*").eq("student_id", child.id).order("date", { ascending: false }).limit(50);
      if (attData) {
        setAttendance(attData);
        const stats: AttendanceStats = { hadir: 0, sakit: 0, izin: 0, alfa: 0 };
        attData.forEach((a: { status: keyof AttendanceStats }) => { if (stats[a.status] !== undefined) stats[a.status]++; });
        setAttendanceStats(stats);
      }
      const { data: reportData } = await supabase.from("reports").select("*").eq("student_id", child.id).order("created_at", { ascending: false });
      setReports(reportData || []);
      const { data: matData } = await supabase.from("lms_materials").select("*").eq("program", child.program).order("created_at", { ascending: false });
      setLmsMaterials(matData || []);
      const { data: subData } = await supabase.from("lms_submissions").select("*").eq("student_id", child.id);
      setLmsSubmissions(subData || []);
      const { data: payData } = await supabase.from("tuition_payments").select("*").eq("student_id", child.id).order("month", { ascending: false });
      setParentPayments(payData || []);
      const { data: schedData } = await supabase.from("online_schedules").select("*").eq("program", child.program).eq("is_active", true).order("scheduled_at", { ascending: true }).limit(2);
      setOnlineSchedules(schedData || []);
      const { data: acadData } = await supabase.from("academic_schedules").select("*").in("program", [child.program, "All"]).order("start_time", { ascending: true });
      setAcademicSchedules(acadData || []);
    } catch (err) { console.error("Error fetching child details:", err); } finally { setDetailsLoading(false); }
  };

  useEffect(() => { fetchParentData(); }, []);
  useEffect(() => { if (selectedChild) { const t = setTimeout(() => fetchChildDetails(selectedChild), 0); return () => clearTimeout(t); } }, [selectedChild]);

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
      const filePath = `receipts/receipt_${selectedChild.id}_${month}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("spp-receipts").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("spp-receipts").getPublicUrl(filePath);
      const { error: updateError } = await supabase.from("tuition_payments").upsert({ student_id: selectedChild.id, month, amount: getChildProgramPrice(selectedChild.program), status: "menunggu_konfirmasi", receipt_url: publicUrl }, { onConflict: "student_id,month" });
      if (updateError) throw updateError;
      alert("Bukti pembayaran berhasil diunggah! Menunggu konfirmasi admin."); fetchChildDetails(selectedChild);
    } catch (err) { alert("Gagal mengunggah bukti pembayaran: " + (err instanceof Error ? err.message : String(err))); } finally { setUploadingReceipt(false); if (receiptFileRef.current) receiptFileRef.current.value = ""; }
  };

  const triggerPrint = (report: any) => { setPrintReport(report); setTimeout(() => { document.body.classList.add("print-raport"); window.print(); const cleanup = () => { document.body.classList.remove("print-raport"); window.removeEventListener("afterprint", cleanup); }; window.addEventListener("afterprint", cleanup); }, 800); };
  const triggerPrintReceipt = (pay: any) => { setPrintReceipt(pay); setTimeout(() => window.print(), 800); };

  return {
    supabase, router, parentName, children, selectedChild, setSelectedChild,
    activeView, setActiveView, mobileOpen, setMobileOpen, notifications,
    showNotificationDropdown, setShowNotificationDropdown, announcements,
    onlineSchedules, academicSchedules, attendance, attendanceStats, reports,
    certificates, lmsMaterials, lmsSubmissions, parentPayments, paymentSettings,
    detailsLoading, printReport, printReceipt, setPrintReceipt, uploadingReceipt,
    receiptFileRef, getIndonesianDay, getIndonesianDate, getTerbilang, getMonthName,
    getChildProgramPrice, handleLogout, handleUploadReceipt, triggerPrint, triggerPrintReceipt,
  };
}
