import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface AcademicSchedule {
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

function getLocalDateString(dateObj: Date): string {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function useScheduleModalForm(
  isOpen: boolean,
  selectedSchedule: AcademicSchedule | null,
  initialDateStr: string,
  onSuccess: (message: string) => void,
  onClose: () => void
) {
  const supabase = createClient();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [type, setType] = useState<string>("class");
  const [program, setProgram] = useState<string>("All");
  const [startDate, setStartDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endDate, setEndDate] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("10:30");
  const [instructor, setInstructor] = useState<string>("");
  const [status, setStatus] = useState<string>("active");
  const [pendingReason, setPendingReason] = useState<string>("");
  const [rescheduledDate, setRescheduledDate] = useState<string>("");
  const [rescheduledTime, setRescheduledTime] = useState<string>("09:00");
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurrenceType, setRecurrenceType] = useState<string>("weekly");
  const [recurrenceCount, setRecurrenceCount] = useState<number>(4);
  const [recurrenceId, setRecurrenceId] = useState<string | null>(null);
  const [editSeriesMode, setEditSeriesMode] = useState<"single" | "series">("single");

  useEffect(() => {
    if (!isOpen) return;
    if (selectedSchedule) {
      setTitle(selectedSchedule.title);
      setDescription(selectedSchedule.description || "");
      setType(selectedSchedule.type);
      setProgram(selectedSchedule.program || "All");
      setStatus((selectedSchedule as any).status || "active");
      setPendingReason((selectedSchedule as any).pending_reason || "");
      const resTo = (selectedSchedule as any).rescheduled_to;
      if (resTo) {
        const resObj = new Date(resTo);
        setRescheduledDate(getLocalDateString(resObj));
        setRescheduledTime(resObj.toTimeString().slice(0, 5));
      } else {
        setRescheduledDate(""); setRescheduledTime("09:00");
      }
      const startObj = new Date(selectedSchedule.start_time);
      const endObj = new Date(selectedSchedule.end_time);
      setStartDate(getLocalDateString(startObj)); setStartTime(startObj.toTimeString().slice(0, 5));
      setEndDate(getLocalDateString(endObj)); setEndTime(endObj.toTimeString().slice(0, 5));
      setInstructor(selectedSchedule.instructor || "");
      setIsRecurring(false); setRecurrenceType("weekly"); setRecurrenceCount(4);
      setRecurrenceId(selectedSchedule.recurrence_id || null); setEditSeriesMode("single");
    } else {
      setTitle(""); setDescription(""); setType("class"); setProgram("All"); setStatus("active");
      setPendingReason(""); setRescheduledDate(""); setRescheduledTime("09:00");
      const defaultDate = initialDateStr || getLocalDateString(new Date());
      setStartDate(defaultDate); setStartTime("09:00"); setEndDate(defaultDate); setEndTime("10:30");
      setInstructor(""); setIsRecurring(false); setRecurrenceType("weekly"); setRecurrenceCount(4);
      setRecurrenceId(null); setEditSeriesMode("single");
    }
  }, [isOpen, selectedSchedule, initialDateStr]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!title.trim() || !startDate || !startTime || !endDate || !endTime) {
      alert("Harap lengkapi semua isian wajib."); return;
    }
    const startISO = new Date(`${startDate}T${startTime}:00`).toISOString();
    const endISO = new Date(`${endDate}T${endTime}:00`).toISOString();
    const rescheduledISO = (status === "rescheduled" && rescheduledDate)
      ? new Date(`${rescheduledDate}T${rescheduledTime}:00`).toISOString() : null;
    const payload = {
      title: title.trim(), description: description.trim() || null, type, program,
      start_time: startISO, end_time: endISO, instructor: instructor.trim() || null,
      status, pending_reason: status !== "active" ? (pendingReason.trim() || null) : null,
      rescheduled_to: rescheduledISO,
    };

    try {
      if (selectedSchedule) {
        if (selectedSchedule.recurrence_id && editSeriesMode === "series") {
          const { error: currentError } = await supabase.from("academic_schedules").update({ ...payload, recurrence_id: selectedSchedule.recurrence_id }).eq("id", selectedSchedule.id);
          if (currentError) throw currentError;
          const { error: seriesError } = await supabase.from("academic_schedules").update({ title: title.trim(), description: description.trim() || null, type, program, instructor: instructor.trim() || null }).eq("recurrence_id", selectedSchedule.recurrence_id).neq("id", selectedSchedule.id);
          if (seriesError) throw seriesError;
          onSuccess("Seluruh seri jadwal berhasil diperbarui!");
        } else {
          let finalRecurrenceId = selectedSchedule.recurrence_id || null;
          let recurrInsertPayloads: any[] = [];
          if (!selectedSchedule.recurrence_id && isRecurring) {
            finalRecurrenceId = "rec_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11);
            const baseStart = new Date(`${startDate}T${startTime}:00`);
            const baseEnd = new Date(`${endDate}T${endTime}:00`);
            for (let i = 1; i < recurrenceCount; i++) {
              const cs = new Date(baseStart); const ce = new Date(baseEnd);
              if (recurrenceType === "weekly") { cs.setDate(baseStart.getDate() + (i * 7)); ce.setDate(baseEnd.getDate() + (i * 7)); }
              else { cs.setDate(baseStart.getDate() + i); ce.setDate(baseEnd.getDate() + i); }
              recurrInsertPayloads.push({ title: title.trim(), description: description.trim() || null, type, program, start_time: cs.toISOString(), end_time: ce.toISOString(), instructor: instructor.trim() || null, recurrence_id: finalRecurrenceId });
            }
          }
          const { error } = await supabase.from("academic_schedules").update({ ...payload, recurrence_id: finalRecurrenceId }).eq("id", selectedSchedule.id);
          if (error) throw error;
          if (recurrInsertPayloads.length > 0) {
            const { error: insertError } = await supabase.from("academic_schedules").insert(recurrInsertPayloads);
            if (insertError) throw insertError;
            onSuccess(`Jadwal diperbarui dan ${recurrInsertPayloads.length} perulangan baru dibuat!`);
          } else { onSuccess("Jadwal belajar berhasil diperbarui!"); }
        }
      } else {
        if (isRecurring) {
          const payloads = [];
          const newRecurrenceId = "rec_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11);
          const baseStart = new Date(`${startDate}T${startTime}:00`); const baseEnd = new Date(`${endDate}T${endTime}:00`);
          for (let i = 0; i < recurrenceCount; i++) {
            const cs = new Date(baseStart); const ce = new Date(baseEnd);
            if (recurrenceType === "weekly") { cs.setDate(baseStart.getDate() + (i * 7)); ce.setDate(baseEnd.getDate() + (i * 7)); }
            else { cs.setDate(baseStart.getDate() + i); ce.setDate(baseEnd.getDate() + i); }
            payloads.push({ title: title.trim(), description: description.trim() || null, type, program, start_time: cs.toISOString(), end_time: ce.toISOString(), instructor: instructor.trim() || null, recurrence_id: newRecurrenceId });
          }
          const { error } = await supabase.from("academic_schedules").insert(payloads);
          if (error) throw error;
          onSuccess(`${recurrenceCount} jadwal baru berhasil dibuat secara berkala!`);
        } else {
          const { error } = await supabase.from("academic_schedules").insert(payload);
          if (error) throw error;
          onSuccess("Jadwal baru berhasil dibuat!");
        }
      }
    } catch (err: any) {
      alert("Gagal menyimpan jadwal: " + (err.message || String(err)));
    }
  };

  const handleDeleteSchedule = async (): Promise<void> => {
    if (!selectedSchedule) return;
    let deleteMode: "single" | "series" | "cancel" = "single";
    if (selectedSchedule.recurrence_id) {
      const confirmResult = confirm(`Agenda "${selectedSchedule.title}" adalah bagian dari seri berulang.\n\nApakah Anda ingin MENGHAPUS SELURUH SERI agenda berulang ini?\n\n• Klik OK / Yes untuk menghapus seluruh seri.\n• Klik Batal / Cancel untuk menghapus agenda hari ini saja.`);
      if (confirmResult) { deleteMode = "series"; }
      else { const confirmSingle = confirm(`Apakah Anda yakin ingin menghapus agenda "${selectedSchedule.title}" HANYA untuk hari ini saja?`); deleteMode = confirmSingle ? "single" : "cancel"; }
    } else {
      const confirmNormal = confirm(`Apakah Anda yakin ingin menghapus agenda "${selectedSchedule.title}"?`);
      if (!confirmNormal) deleteMode = "cancel";
    }
    if (deleteMode === "cancel") return;
    try {
      let query = supabase.from("academic_schedules").delete();
      if (deleteMode === "series" && selectedSchedule.recurrence_id) { query = query.eq("recurrence_id", selectedSchedule.recurrence_id); }
      else { query = query.eq("id", selectedSchedule.id); }
      const { error } = await query;
      if (error) throw error;
      onSuccess(deleteMode === "series" ? "Seluruh seri jadwal berhasil dihapus." : "Jadwal berhasil dihapus.");
    } catch (err: any) {
      alert("Gagal menghapus jadwal: " + (err.message || String(err)));
    }
  };

  return {
    title, setTitle, description, setDescription, type, setType, program, setProgram,
    startDate, setStartDate, startTime, setStartTime, endDate, setEndDate, endTime, setEndTime,
    instructor, setInstructor, status, setStatus, pendingReason, setPendingReason,
    rescheduledDate, setRescheduledDate, rescheduledTime, setRescheduledTime,
    isRecurring, setIsRecurring, recurrenceType, setRecurrenceType, recurrenceCount, setRecurrenceCount,
    recurrenceId, editSeriesMode, setEditSeriesMode,
    handleSubmit, handleDeleteSchedule,
  };
}
