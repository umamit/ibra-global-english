"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

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
    instructor: string
  ): Promise<string | null> => {
    try {
      const { data: existingSchedules, error } = await supabase
        .from("academic_schedules")
        .select("id, title, program, start_time, end_time, instructor, room")
        .limit(200);

      if (error || !existingSchedules) return null;

      for (const s of existingSchedules) {
        const sDate = new Date(s.start_time);
        const dayOfWeek = sDate.getDay();

        if (days.includes(dayOfWeek)) {
          const sTime = s.start_time.includes("T") ? s.start_time.split("T")[1].substring(0, 5) : s.start_time;
          if (sTime === startTime) {
            if (s.room === room) {
              return `Peringatan Bentrok: ${room} sudah digunakan oleh "${s.title || s.program}" pada jam ${startTime} WIT.`;
            }
            if (instructor && s.instructor === instructor) {
              return `Peringatan Bentrok: ${instructor} sudah mengajar kelas "${s.title || s.program}" pada jam ${startTime} WIT.`;
            }
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const generateAndSaveSchedules = async (input: ScheduleFormInput): Promise<{ success: boolean; message: string }> => {
    setSubmitting(true);
    setConflictWarning("");

    try {
      const conflictMsg = await checkScheduleConflict(
        input.selectedDays,
        input.startTime,
        input.endTime,
        input.room,
        input.instructor
      );

      if (conflictMsg) {
        setConflictWarning(conflictMsg);
      }

      const today = new Date();
      const newEntries: any[] = [];
      const endDate = new Date(today.getFullYear(), today.getMonth() + input.monthsAhead, today.getDate());

      const curr = new Date(today);
      while (curr <= endDate) {
        const dayNum = curr.getDay();
        if (input.selectedDays.includes(dayNum)) {
          const y = curr.getFullYear();
          const m = String(curr.getMonth() + 1).padStart(2, "0");
          const d = String(curr.getDate()).padStart(2, "0");
          const dateStr = `${y}-${m}-${d}`;

          const startTimeIso = `${dateStr}T${input.startTime}:00+09:00`;
          const endTimeIso = `${dateStr}T${input.endTime}:00+09:00`;

          newEntries.push({
            title: input.program,
            program: input.program,
            type: "class",
            start_time: startTimeIso,
            end_time: endTimeIso,
            instructor: input.instructor || "Tutor Ibra",
            description: `Rutin ${input.program} untuk ${input.studentName} (WIT)`,
            status: "active",
          });
        }
        curr.setDate(curr.getDate() + 1);
      }

      if (newEntries.length === 0) {
        return { success: false, message: "Tidak ada tanggal yang cocok untuk dibuat." };
      }

      const { error: insertErr } = await supabase.from("academic_schedules").insert(newEntries);
      if (insertErr) throw insertErr;

      return {
        success: true,
        message: `Berhasil membuat ${newEntries.length} sesi jadwal rutin ${input.program} (${input.monthsAhead} bulan ke depan)!`,
      };
    } catch (err: any) {
      return { success: false, message: "Gagal menyimpan jadwal: " + err.message };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    conflictWarning,
    checkScheduleConflict,
    generateAndSaveSchedules,
  };
}
