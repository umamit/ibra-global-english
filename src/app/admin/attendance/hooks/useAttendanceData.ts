"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import posthog from "posthog-js";
import { getIndonesianDayName, filterSchedulesByDate, getProgramsWithActiveSchedule, getScheduleDetailForProgram, AcademicScheduleItem } from "@/utils/scheduleSyncHelpers";

export interface Student { id: string; name: string; program: string; }
export interface AttendanceEntry { status: string; notes: string; isExisting: boolean; scheduleDetail?: string | null; }
export interface RecapRow { id: string; name: string; program: string; hadir: number; sakit: number; izin: number; alfa: number; tidak_ada_kelas: number; total: number; }
export interface StatusMsg { type: string; text: string; }

function getLocalToday(): string {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  return new Date(today.getTime() - offset * 60 * 1000).toISOString().split("T")[0];
}

function getCurrentMonthStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function useAttendanceData() {
  const supabase = createClient();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getLocalToday);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<StatusMsg>({ type: "", text: "" });
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceEntry>>({});
  const [dailySchedules, setDailySchedules] = useState<AcademicScheduleItem[]>([]);

  const [activeTab, setActiveTab] = useState<string>("input");
  const [recapData, setRecapData] = useState<RecapRow[]>([]);
  const [recapLoading, setRecapLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [programFilter, setProgramFilter] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthStr);

  const loadRecapData = useCallback(async (): Promise<void> => {
    setRecapLoading(true);
    try {
      const [yearStr, monthStr] = selectedMonth.split("-");
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
      const lastDayDate = new Date(year, month, 0);
      const lastDay = `${year}-${String(month).padStart(2, "0")}-${String(lastDayDate.getDate()).padStart(2, "0")}`;

      const { data: attendanceList, error: errA } = await supabase.from("attendance").select("student_id, status").gte("date", firstDay).lte("date", lastDay);
      if (errA) throw errA;

      const { data: studentList, error: errS } = await supabase.from("students").select("id, name, program").order("name", { ascending: true });
      if (errS) throw errS;

      const recapMap: Record<string, RecapRow> = {};
      studentList?.forEach((student: Student) => {
        recapMap[student.id] = { id: student.id, name: student.name, program: student.program, hadir: 0, sakit: 0, izin: 0, alfa: 0, tidak_ada_kelas: 0, total: 0 };
      });
      attendanceList?.forEach((rec: { student_id: string; status: string }) => {
        const row = recapMap[rec.student_id];
        if (row) {
          if (rec.status === "hadir") row.hadir++;
          else if (rec.status === "sakit") row.sakit++;
          else if (rec.status === "izin") row.izin++;
          else if (rec.status === "alfa") row.alfa++;
          else if (rec.status === "tidak_ada_kelas") row.tidak_ada_kelas++;
          row.total++;
        }
      });
      setRecapData(Object.values(recapMap));
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Gagal memuat rekapitulasi: " + err.message });
    } finally { setRecapLoading(false); }
  }, [supabase, selectedMonth]);

  const loadAttendanceAndStudents = useCallback(async (): Promise<void> => {
    if (!selectedDate) return;
    setLoading(true); setStatusMsg({ type: "", text: "" });
    try {
      const { data: studentList, error: errS } = await supabase.from("students").select("id, name, program").order("name", { ascending: true });
      if (errS) throw errS;

      const { data: attendanceList, error: errA } = await supabase.from("attendance").select("student_id, status, notes").eq("date", selectedDate);
      if (errA) throw errA;

      const { data: rawSchedules } = await supabase.from("academic_schedules").select("*").gte("start_time", `${selectedDate}T00:00:00`).lte("start_time", `${selectedDate}T23:59:59`);
      const matchedSchedules = (rawSchedules as AcademicScheduleItem[]) || [];
      setDailySchedules(matchedSchedules);

      const activePrograms = getProgramsWithActiveSchedule(matchedSchedules);
      const hasSchedulesDefined = matchedSchedules.length > 0;

      const initialMap: Record<string, AttendanceEntry> = {};
      studentList.forEach((student: Student) => {
        const recorded = attendanceList?.find((a: { student_id: string }) => a.student_id === student.id);
        const schInfo = getScheduleDetailForProgram(matchedSchedules, student.program);
        const detailStr = schInfo ? `${schInfo.room} (${schInfo.timeRange})` : null;

        let defaultStatus = "tidak_ada_kelas";
        if (hasSchedulesDefined) {
          const isProgramActive = Array.from(activePrograms).some(p => student.program === p || (student.program && student.program.includes(p)));
          if (isProgramActive) defaultStatus = "hadir";
        }

        initialMap[student.id] = {
          status: recorded ? (recorded as any).status : defaultStatus,
          notes: recorded ? ((recorded as any).notes || "") : "",
          isExisting: !!recorded,
          scheduleDetail: detailStr,
        };
      });
      setStudents(studentList || []);
      setAttendanceMap(initialMap);
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Gagal memuat absensi: " + err.message });
    } finally { setLoading(false); }
  }, [supabase, selectedDate]);

  const handleStatusChange = (studentId: string, status: string) => { setAttendanceMap((prev) => ({ ...prev, [studentId]: { ...prev[studentId], status } })); };
  const handleNotesChange = (studentId: string, notes: string) => { setAttendanceMap((prev) => ({ ...prev, [studentId]: { ...prev[studentId], notes } })); };

  const handleSingleStudentQrScan = async (studentId: string) => {
    try {
      const targetId = (studentId || "").toLowerCase();
      const student = students.find((s) => s.id.toLowerCase() === targetId || targetId.includes(s.id.toLowerCase()) || s.id.toLowerCase().includes(targetId));
      if (!student) return { success: false, message: "Siswa tidak ditemukan." };
      if (attendanceMap[student.id]?.status === "hadir") return { success: false, message: `${student.name} sudah tercatat HADIR hari ini.` };

      const isScheduledToday = dailySchedules.some(s => s.program === student.program || (s.program && student.program.includes(s.program)));
      const noteText = isScheduledToday ? "Presensi Otomatis via QR Code" : "Presensi Sesi Tambahan / Luar Jadwal (QR Code)";

      const payload = { student_id: student.id, date: selectedDate, status: "hadir", notes: noteText };
      const { error } = await supabase.from("attendance").upsert(payload, { onConflict: "student_id, date" });
      if (error) throw error;

      setAttendanceMap((prev) => ({ ...prev, [student.id]: { ...prev[student.id], status: "hadir", notes: noteText, isExisting: true } }));
      const msg = isScheduledToday
        ? `${student.name} (${student.program}) - HADIR!`
        : `${student.name} (${student.program}) - HADIR (Sesi Tambahan)!`;

      return { success: true, message: msg, studentName: student.name };
    } catch (err: any) { return { success: false, message: err?.message || "Gagal mencatat absensi." }; }
  };

  const handleSaveAttendance = async (): Promise<void> => {
    setSubmitting(true); setStatusMsg({ type: "", text: "" });
    try {
      const upsertPayload = students.map((student) => ({
        student_id: student.id, date: selectedDate,
        status: attendanceMap[student.id]?.status || "hadir",
        notes: attendanceMap[student.id]?.notes?.trim() || null,
      }));
      const { error } = await supabase.from("attendance").upsert(upsertPayload, { onConflict: "student_id, date" });
      if (error) throw error;
      posthog.capture("admin_attendance_submitted", { date: selectedDate, student_count: students.length });
      setStatusMsg({ type: "success", text: `Absensi untuk tanggal ${selectedDate} berhasil disimpan!` });
      loadAttendanceAndStudents();
    } catch (err: any) { setStatusMsg({ type: "error", text: "Gagal menyimpan absensi: " + err.message }); } finally { setSubmitting(false); }
  };

  const exportRecapCSV = (filteredRecap: RecapRow[]) => {
    const headers = ["No", "Nama Siswa", "Program", "Hadir", "Sakit", "Izin", "Alfa", "Tidak ada Kelas", "Total Sesi", "Kehadiran (%)"];
    const rows = filteredRecap.map((row, idx) => {
      const activeTotal = row.hadir + row.sakit + row.izin + row.alfa;
      const pct = activeTotal > 0 ? Math.round((row.hadir / activeTotal) * 100) : 100;
      return [idx + 1, row.name, row.program, row.hadir, row.sakit, row.izin, row.alfa, row.tidak_ada_kelas || 0, row.total, `${pct}%`];
    });
    const csvContent = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = `rekapitulasi_absensi_${selectedMonth}.csv`; link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => { const timer = setTimeout(() => { loadAttendanceAndStudents(); }, 0); return () => clearTimeout(timer); }, [selectedDate]);
  useEffect(() => { if (activeTab === "rekap") loadRecapData(); }, [activeTab, selectedMonth]);

  const filteredRecap = recapData.filter((row) => {
    const matchName = row.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProgram = programFilter ? (row.program === programFilter || (row.program && row.program.toLowerCase().includes(programFilter.toLowerCase()))) : true;
    return matchName && matchProgram;
  });

  return {
    students, selectedDate, setSelectedDate, loading, submitting, statusMsg,
    attendanceMap, handleStatusChange, handleNotesChange, handleSaveAttendance, handleSingleStudentQrScan,
    activeTab, setActiveTab, recapData, recapLoading, filteredRecap,
    searchTerm, setSearchTerm, programFilter, setProgramFilter, selectedMonth, setSelectedMonth,
    exportRecapCSV, dailySchedules,
  };
}

export function getIndonesianDay(dateStr: string): string { return getIndonesianDayName(dateStr); }
export function getIndonesianDate(dateStr: string): string {
  if (!dateStr) return "-";
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}
