import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/utils/supabase/client";
import { Student } from "@/types";
import { useTutorLms } from "./useTutorLms";

export interface AttendanceEntry { status: string; notes: string; isExisting?: boolean; }
export interface Toast { show: boolean; message: string; type: "success" | "error"; }

export function useTutorPortal() {
  const router = useRouter();
  const supabase = createClient();
  const adminSupabase = createServiceRoleClient();

  const [loading, setLoading] = useState<boolean>(true);
  const [tutorName, setTutorName] = useState<string>("Tutor Pendamping");
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("attendance");

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceDate, setAttendanceDate] = useState<string>("");
  const [attendanceLoading, setAttendanceLoading] = useState<boolean>(false);
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceEntry>>({});
  const [toast, setToast] = useState<Toast>({ show: false, message: "", type: "success" });

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [moduleName, setModuleName] = useState<string>("");
  const [speakingScore, setSpeakingScore] = useState<number>(85);
  const [grammarScore, setGrammarScore] = useState<number>(85);
  const [vocabularyScore, setVocabularyScore] = useState<number>(85);
  const [activeScore, setActiveScore] = useState<number>(85);
  const [tutorNotes, setTutorNotes] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [reportsList, setReportsList] = useState<Record<string, unknown>[]>([]);
  const [certificates, setCertificates] = useState<Record<string, unknown>[]>([]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const lmsState = useTutorLms(showToast);

  const handleGenerateAiNotes = async () => {
    if (!selectedStudent) { alert("Harap pilih siswa terlebih dahulu!"); return; }
    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/ai-assist", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "auto-draft", payload: { name: selectedStudent.name, program: selectedStudent.program, module_name: moduleName, speaking: speakingScore, grammar: grammarScore, vocabulary: vocabularyScore, active: activeScore } }),
      });
      const data = await res.json();
      if (res.ok && data.reply) setTutorNotes(data.reply);
      else alert(`Gagal menulis catatan: ${data.error || "Error"}`);
    } catch { alert("Gagal menghubungi server AI."); } finally { setAiLoading(false); }
  };

  const handleStatusChange = (studentId: string, status: string) => setAttendanceData((prev) => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
  const handleNotesChange = (studentId: string, notes: string) => setAttendanceData((prev) => ({ ...prev, [studentId]: { ...prev[studentId], notes } }));

  const handleSaveAttendance = async () => {
    if (!attendanceDate) { showToast("Tanggal absensi wajib dipilih!", "error"); return; }
    setAttendanceLoading(true);
    try {
      const updates = Object.entries(attendanceData).map(([studentId, item]) => ({ student_id: studentId, date: attendanceDate, status: item.status, notes: item.notes || null, created_at: new Date().toISOString() }));
      const { error } = await adminSupabase.from("attendance").upsert(updates, { onConflict: "student_id,date" });
      if (error) throw error;
      showToast("Data presensi berhasil disimpan!");
    } catch (err: any) { showToast("Gagal menyimpan presensi: " + err.message, "error"); } finally { setAttendanceLoading(false); }
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) { showToast("Siswa belum dipilih!", "error"); return; }
    if (!moduleName.trim()) { showToast("Nama Modul wajib diisi!", "error"); return; }
    setReportLoading(true);
    try {
      const { error } = await adminSupabase.from("reports").insert({ student_id: selectedStudent.id, module_name: moduleName.trim(), speaking_score: speakingScore, grammar_score: grammarScore, vocabulary_score: vocabularyScore, active_score: activeScore, tutor_notes: tutorNotes.trim() || null, created_at: new Date().toISOString() });
      if (error) throw error;
      showToast("Rapor siswa berhasil disimpan!");
      setModuleName(""); setTutorNotes("");
    } catch (err: any) { showToast("Gagal menyimpan rapor: " + err.message, "error"); } finally { setReportLoading(false); }
  };

  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar dari portal Tutor?")) {
      await supabase.auth.signOut(); sessionStorage.clear();
      document.cookie = "login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/login");
    }
  };

  return {
    loading, tutorName, mobileOpen, setMobileOpen, activeTab, setActiveTab,
    students, attendanceDate, setAttendanceDate, attendanceLoading, attendanceData, toast,
    selectedStudent, setSelectedStudent, moduleName, setModuleName, speakingScore, setSpeakingScore,
    grammarScore, setGrammarScore, vocabularyScore, setVocabularyScore, activeScore, setActiveScore,
    tutorNotes, setTutorNotes, aiLoading, handleGenerateAiNotes, reportLoading, reportsList, certificates,
    ...lmsState,
    handleStatusChange, handleNotesChange, handleSaveAttendance, handleSaveReport,
    handleLogout, handlePrintReport: () => window.print(), handleExportCSV: () => {},
  };
}
