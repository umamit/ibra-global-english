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
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMsg, setStatusMsg] = useState<StatusMsg>({ type: "", text: "" });
  const [mounted, setMounted] = useState<boolean>(false);

  const fetchData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("academic_schedules")
        .select("*")
        .order("start_time", { ascending: true });

      if (error) throw error;
      setSchedules((data as AcademicSchedule[]) || []);
    } catch (err: any) {
      console.error("Gagal memuat jadwal akademik:", err);
      setStatusMsg({ type: "error", text: "Gagal memuat jadwal: " + (err.message || String(err)) });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const clearStatus = (delayMs = 3000) => {
    setTimeout(() => setStatusMsg({ type: "", text: "" }), delayMs);
  };

  const handleDeleteAllSchedules = async (): Promise<void> => {
    const confirm1 = confirm("Apakah Anda yakin ingin menghapus SELURUH agenda akademik yang ada di database?");
    if (!confirm1) return;
    const confirm2 = confirm("PERINGATAN: Tindakan ini akan menghapus semua jadwal kelas, kegiatan, dan hari libur secara permanen. Apakah Anda benar-benar yakin?");
    if (!confirm2) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("academic_schedules")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;
      setStatusMsg({ type: "success", text: "Berhasil menghapus seluruh agenda akademik." });
      clearStatus();
      fetchData();
    } catch (err: any) {
      console.error("Gagal menghapus seluruh agenda:", err);
      setStatusMsg({ type: "error", text: "Gagal menghapus agenda: " + (err.message || String(err)) });
      clearStatus(4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    let cancelled = false;
    const load = async () => {
      if (cancelled) return;
      await fetchData();
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return {
    schedules,
    loading,
    mounted,
    statusMsg,
    setStatusMsg,
    fetchData,
    clearStatus,
    handleDeleteAllSchedules,
  };
}
