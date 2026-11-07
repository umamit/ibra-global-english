"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  formatScheduleLabelWIT,
  getWitDayAndMinutes,
  parseHHMMToMinutes,
  normalizeDbProgram,
} from "./scheduleStudentHelpers";

export { formatScheduleLabelWIT };

export interface ScheduleFormInput {
  studentId: string;
  studentName: string;
  program: string;
  selectedDays: number[]; // 1: Senin, 2: Selasa, ..., 6: Sabtu
  startTime: string; // "15:30"
  endTime: string;   // "16:45"
  instructor: string;
  room: string;
  monthsAhead: number; // 1, 3, 6
  ignoreConflict?: boolean;
}

export interface UpcomingScheduleItem {
  id: string;
  title: string;
  program: string;
  start_time: string;
  end_time: string;
  instructor?: string | null;
  description?: string | null;
  type?: string | null;
  recurrence_id?: string | null;
}

export function useScheduleFromStudent() {
  const supabase = createClient();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [conflictWarning, setConflictWarning] = useState<string>("");

  const checkScheduleConflict = async (
    days: number[],
    startTime: string,
    endTime: string,
    room: string,
    instructor: string,
    studentName?: string
  ): Promise<string | null> => {
    try {
      const todayIso = new Date().toISOString().substring(0, 10);
      const { data: existingSchedules, error } = await supabase
        .from("academic_schedules")
        .select("id, title, program, start_time, end_time, instructor, description")
        .gte("start_time", `${todayIso}T00:00:00`)
        .limit(300);

      if (error || !existingSchedules) return null;

      const reqStart = parseHHMMToMinutes(startTime);
      const reqEnd = parseHHMMToMinutes(endTime) || reqStart + 60;

      for (const s of existingSchedules) {
        const startInfo = getWitDayAndMinutes(s.start_time);
        const endInfo = getWitDayAndMinutes(s.end_time);
        if (!startInfo) continue;

        if (days.includes(startInfo.dayOfWeek)) {
          const exStart = startInfo.minutes;
          const exEnd = endInfo ? endInfo.minutes : exStart + 60;
          const isOverlapping = reqStart < exEnd && reqEnd > exStart;

          if (isOverlapping) {
            const desc = (s.description || "").toLowerCase();
            if (studentName && desc.includes(studentName.toLowerCase())) {
              return `Siswa ${studentName} sudah memiliki jadwal pada hari tersebut jam ${startInfo.timeStr} WIT.`;
            }
            if (room && desc.includes(room.toLowerCase())) {
              return `Peringatan Bentrok: ${room} sudah digunakan oleh "${s.title || s.program}" pada jam ${startInfo.timeStr} WIT.`;
            }
            if (instructor && s.instructor && s.instructor.toLowerCase() === instructor.toLowerCase()) {
              return `Peringatan Bentrok: ${instructor} sudah mengajar "${s.title || s.program}" pada jam ${startInfo.timeStr} WIT.`;
            }
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const fetchUpcomingStudentSchedules = async (studentName: string): Promise<UpcomingScheduleItem[]> => {
    try {
      const todayIso = new Date(Date.now() - 86400000).toISOString().substring(0, 10);
      const { data, error } = await supabase
        .from("academic_schedules")
        .select("id, title, program, start_time, end_time, instructor, description, type, recurrence_id")
        .gte("start_time", `${todayIso}T00:00:00`)
        .order("start_time", { ascending: true })
        .limit(300);

      if (error) throw error;
      const cleanName = (studentName || "").trim().toLowerCase();
      return (data || []).filter((item: any) => {
        if (!cleanName) return false;
        const desc = (item.description || "").toLowerCase();
        const title = (item.title || "").toLowerCase();
        return desc.includes(cleanName) || title.includes(cleanName);
      });
    } catch {
      return [];
    }
  };

  const generateAndSaveSchedules = async (input: ScheduleFormInput): Promise<{ success: boolean; message: string; hasConflict?: boolean }> => {
    setSubmitting(true);
    setConflictWarning("");

    try {
      if (!input.ignoreConflict) {
        const conflictMsg = await checkScheduleConflict(
          input.selectedDays, input.startTime, input.endTime, input.room, input.instructor, input.studentName
        );
        if (conflictMsg) {
          setConflictWarning(conflictMsg);
          return { success: false, hasConflict: true, message: conflictMsg };
        }
      }

      const today = new Date();
      const endDate = new Date(today.getFullYear(), today.getMonth() + input.monthsAhead, today.getDate());
      const recurrenceId = `rec_stu_${input.studentId.slice(0, 8)}_${Date.now()}`;
      const curr = new Date(today);
      const rawEntries: any[] = [];

      while (curr <= endDate) {
        if (input.selectedDays.includes(curr.getDay())) {
          const dateStr = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, "0")}-${String(curr.getDate()).padStart(2, "0")}`;
          rawEntries.push({
            title: `${input.program} - ${input.studentName}`,
            program: input.program,
            type: "class",
            start_time: `${dateStr}T${input.startTime}:00+09:00`,
            end_time: `${dateStr}T${input.endTime}:00+09:00`,
            instructor: input.instructor || "Tutor Ibra",
            description: `Rutin ${input.program} untuk ${input.studentName} (${input.room || "Ruang Kelas A"}) (WIT)`,
            recurrence_id: recurrenceId,
          });
        }
        curr.setDate(curr.getDate() + 1);
      }

      if (rawEntries.length === 0) {
        return { success: false, message: "Tidak ada tanggal yang cocok untuk dibuat." };
      }

      const { error: insertErr } = await supabase.from("academic_schedules").insert(rawEntries);
      if (insertErr) {
        if (insertErr.message.includes("academic_schedules_program_check")) {
          const fallbackEntries = rawEntries.map((e) => ({ ...e, program: normalizeDbProgram(e.program) }));
          const { error: retryErr } = await supabase.from("academic_schedules").insert(fallbackEntries);
          if (retryErr) throw retryErr;
        } else {
          throw insertErr;
        }
      }

      return {
        success: true,
        message: `Berhasil membuat ${rawEntries.length} sesi jadwal rutin ${input.program} untuk ${input.studentName} (${input.monthsAhead} bulan ke depan)!`,
      };
    } catch (err: any) {
      return { success: false, message: "Gagal menyimpan jadwal: " + err.message };
    } finally {
      setSubmitting(false);
    }
  };

  const rescheduleStudentSession = async (
    scheduleId: string, newDate: string, newStartTime: string, newEndTime: string, newRoom: string, studentName: string
  ): Promise<{ success: boolean; message: string }> => {
    setSubmitting(true);
    try {
      const startTimeIso = `${newDate}T${newStartTime}:00+09:00`;
      const endTimeIso = `${newDate}T${newEndTime}:00+09:00`;
      const { error } = await supabase
        .from("academic_schedules")
        .update({
          start_time: startTimeIso,
          end_time: endTimeIso,
          status: "rescheduled",
          rescheduled_to: startTimeIso,
          description: `Terjadwal Ulang untuk ${studentName} (${newRoom || "Ruang Kelas A"}) (WIT)`,
        })
        .eq("id", scheduleId);
      if (error) throw error;
      return { success: true, message: `Sesi ${studentName} berhasil dipindahkan ke tanggal ${newDate} jam ${newStartTime} WIT!` };
    } catch (err: any) {
      return { success: false, message: "Gagal memindahkan jadwal: " + err.message };
    } finally {
      setSubmitting(false);
    }
  };

  const setSessionPending = async (scheduleId: string, reason: string, studentName: string): Promise<{ success: boolean; message: string }> => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("academic_schedules")
        .update({
          status: "pending",
          pending_reason: reason || "Diliburkan",
          description: `Ditunda (Pending) untuk ${studentName}: ${reason || "Diliburkan"}`,
        })
        .eq("id", scheduleId);
      if (error) throw error;
      return { success: true, message: `Sesi ${studentName} berhasil ditunda (Pending)!` };
    } catch (err: any) {
      return { success: false, message: "Gagal menunda jadwal: " + err.message };
    } finally {
      setSubmitting(false);
    }
  };

  const deleteAllStudentSchedules = async (studentName: string): Promise<{ success: boolean; message: string }> => {
    setSubmitting(true);
    try {
      const cleanName = (studentName || "").trim();
      if (!cleanName) return { success: false, message: "Nama siswa tidak valid." };

      const { data: allRows, error: fetchErr } = await supabase
        .from("academic_schedules")
        .select("id, title, description");
      if (fetchErr) throw fetchErr;

      const lower = cleanName.toLowerCase();
      const targetIds = (allRows || [])
        .filter((r: any) => (r.description || "").toLowerCase().includes(lower) || (r.title || "").toLowerCase().includes(lower))
        .map((r: any) => r.id);

      if (targetIds.length === 0) {
        return { success: false, message: `Tidak ditemukan jadwal atas nama "${cleanName}".` };
      }

      const { error: delErr } = await supabase.from("academic_schedules").delete().in("id", targetIds);
      if (delErr) throw delErr;

      return { success: true, message: `Berhasil membersihkan ${targetIds.length} sesi jadwal milik ${cleanName}!` };
    } catch (err: any) {
      return { success: false, message: "Gagal menghapus jadwal siswa: " + err.message };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting, conflictWarning, setConflictWarning, checkScheduleConflict,
    generateAndSaveSchedules, fetchUpcomingStudentSchedules,
    rescheduleStudentSession, setSessionPending, deleteAllStudentSchedules,
  };
}
