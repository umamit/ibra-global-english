"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

export interface AcademicSchedule {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  program: string;
  start_time: string;
  end_time: string;
  instructor?: string | null;
  recurrence_id?: string | null;
  created_at?: string;
  room?: string | null;
}

export interface StudentSimple {
  id: string;
  name: string;
  program: string;
}

export interface StatusMsg {
  type: "success" | "error" | "";
  text: string;
}

export function getLocalDateString(dateObj: Date): string {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getMonthNameIndonesian(monthIdx: number): string {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return months[monthIdx];
}

export function useCalendarData() {
  const supabase = createClient();
  const [schedules, setSchedules] = useState<AcademicSchedule[]>([]);
  const [students, setStudents] = useState<StudentSimple[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMsg, setStatusMsg] = useState<StatusMsg>({ type: "", text: "" });
  const [mounted, setMounted] = useState<boolean>(false);

  const fetchData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const { data: scheduleData, error: errS } = await supabase
        .from("academic_schedules")
        .select("*")
        .order("start_time", { ascending: true });

      if (errS) throw errS;

      const { data: studentData } = await supabase
        .from("students")
        .select("id, name, program")
        .eq("status", "aktif")
        .order("name");

      setSchedules((scheduleData as AcademicSchedule[]) || []);
      setStudents((studentData as StudentSimple[]) || []);
    } catch (err: any) {
      console.error("Gagal memuat jadwal akademik:", err);
      setStatusMsg({ type: "error", text: "Gagal memuat jadwal: " + (err.message || String(err)) });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [fetchData]);

  const clearStatus = (): void => setStatusMsg({ type: "", text: "" });

  const handleDeleteAllSchedules = async (): Promise<void> => {
    if (!confirm("Apakah Anda yakin ingin menghapus SEMUA agenda jadwal di kalender? Tindakan ini tidak dapat dibatalkan.")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("academic_schedules").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) throw error;
      setStatusMsg({ type: "success", text: "Semua agenda jadwal berhasil dihapus." });
      fetchData();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Gagal menghapus jadwal: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  return {
    schedules,
    students,
    loading,
    mounted,
    statusMsg,
    setStatusMsg,
    fetchData,
    clearStatus,
    handleDeleteAllSchedules,
  };
}
