import React, { useState, useEffect } from "react";
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

interface AddEditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  selectedSchedule: AcademicSchedule | null;
  initialDateStr: string;
}

function getLocalDateString(dateObj: Date): string {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AddEditScheduleModal({
  isOpen,
  onClose,
  onSuccess,
  selectedSchedule,
  initialDateStr
}: AddEditScheduleModalProps) {
  const supabase = createClient();

  // Form fields states
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [type, setType] = useState<string>("class"); // 'class', 'event', 'holiday'
  const [program, setProgram] = useState<string>("All"); // 'Kids Program', 'Teens Program', 'Fun Calistung', 'All'
  const [startDate, setStartDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endDate, setEndDate] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("10:30");
  const [instructor, setInstructor] = useState<string>("");

  // Recurrence states
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurrenceType, setRecurrenceType] = useState<string>("weekly"); // 'weekly', 'daily'
  const [recurrenceCount, setRecurrenceCount] = useState<number>(4);
  const [recurrenceId, setRecurrenceId] = useState<string | null>(null);
  const [editSeriesMode, setEditSeriesMode] = useState<"single" | "series">("single");

  useEffect(() => {
    if (isOpen) {
      if (selectedSchedule) {
        // Edit Mode
        setTitle(selectedSchedule.title);
        setDescription(selectedSchedule.description || "");
        setType(selectedSchedule.type);
        setProgram(selectedSchedule.program || "All");
        
        const startObj = new Date(selectedSchedule.start_time);
        const endObj = new Date(selectedSchedule.end_time);

        setStartDate(getLocalDateString(startObj));
        setStartTime(startObj.toTimeString().slice(0, 5));
        setEndDate(getLocalDateString(endObj));
        setEndTime(endObj.toTimeString().slice(0, 5));
        setInstructor(selectedSchedule.instructor || "");
        setIsRecurring(false);
        setRecurrenceType("weekly");
        setRecurrenceCount(4);
        setRecurrenceId(selectedSchedule.recurrence_id || null);
        setEditSeriesMode("single");
      } else {
        // Add Mode
        setTitle("");
        setDescription("");
        setType("class");
        setProgram("All");
        const defaultDate = initialDateStr || getLocalDateString(new Date());
        setStartDate(defaultDate);
        setStartTime("09:00");
        setEndDate(defaultDate);
        setEndTime("10:30");
        setInstructor("");
        setIsRecurring(false);
        setRecurrenceType("weekly");
        setRecurrenceCount(4);
        setRecurrenceId(null);
        setEditSeriesMode("single");
      }
    }
  }, [isOpen, selectedSchedule, initialDateStr]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!title.trim() || !startDate || !startTime || !endDate || !endTime) {
      alert("Harap lengkapi semua isian wajib.");
      return;
    }

    const startISO = new Date(`${startDate}T${startTime}:00`).toISOString();
    const endISO = new Date(`${endDate}T${endTime}:00`).toISOString();

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      type,
      program,
      start_time: startISO,
      end_time: endISO,
      instructor: instructor.trim() || null
    };

    try {
      if (selectedSchedule) {
        // Edit Mode
        if (selectedSchedule.recurrence_id && editSeriesMode === "series") {
          // 1. Update the selected schedule (all fields)
          const { error: currentError } = await supabase
            .from("academic_schedules")
            .update({
              ...payload,
              recurrence_id: selectedSchedule.recurrence_id
            })
            .eq("id", selectedSchedule.id);

          if (currentError) throw currentError;

          // 2. Update other items in the same series (info fields only)
          const infoPayload = {
            title: title.trim(),
            description: description.trim() || null,
            type,
            program,
            instructor: instructor.trim() || null
          };
          const { error: seriesError } = await supabase
            .from("academic_schedules")
            .update(infoPayload)
            .eq("recurrence_id", selectedSchedule.recurrence_id)
            .neq("id", selectedSchedule.id);

          if (seriesError) throw seriesError;
          onSuccess("Seluruh seri jadwal berhasil diperbarui!");
        } else {
          // Edit single
          let finalRecurrenceId = selectedSchedule.recurrence_id || null;
          let recurrInsertPayloads: any[] = [];

          // Guard: Saat mode edit, JANGAN buat jadwal baru dari recurrence
          if (!selectedSchedule.recurrence_id && isRecurring) {
            finalRecurrenceId = "rec_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11);
            
            const baseStart = new Date(`${startDate}T${startTime}:00`);
            const baseEnd = new Date(`${endDate}T${endTime}:00`);

            for (let i = 1; i < recurrenceCount; i++) {
              const currentStart = new Date(baseStart);
              const currentEnd = new Date(baseEnd);

              if (recurrenceType === "weekly") {
                currentStart.setDate(baseStart.getDate() + (i * 7));
                currentEnd.setDate(baseEnd.getDate() + (i * 7));
              } else if (recurrenceType === "daily") {
                currentStart.setDate(baseStart.getDate() + i);
                currentEnd.setDate(baseEnd.getDate() + i);
              }

              recurrInsertPayloads.push({
                title: title.trim(),
                description: description.trim() || null,
                type,
                program,
                start_time: currentStart.toISOString(),
                end_time: currentEnd.toISOString(),
                instructor: instructor.trim() || null,
                recurrence_id: finalRecurrenceId
              });
            }
          }

          const { error } = await supabase
            .from("academic_schedules")
            .update({
              ...payload,
              recurrence_id: finalRecurrenceId
            })
            .eq("id", selectedSchedule.id);

          if (error) throw error;

          if (recurrInsertPayloads.length > 0) {
            const { error: insertError } = await supabase
              .from("academic_schedules")
              .insert(recurrInsertPayloads);
            if (insertError) throw insertError;
            onSuccess(`Jadwal diperbarui dan ${recurrInsertPayloads.length} perulangan baru dibuat!`);
          } else {
            onSuccess("Jadwal belajar berhasil diperbarui!");
          }
        }
      } else {
        // Insert Mode
        if (isRecurring) {
          const payloads = [];
          const newRecurrenceId = "rec_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11);
          const baseStart = new Date(`${startDate}T${startTime}:00`);
          const baseEnd = new Date(`${endDate}T${endTime}:00`);

          for (let i = 0; i < recurrenceCount; i++) {
            const currentStart = new Date(baseStart);
            const currentEnd = new Date(baseEnd);

            if (recurrenceType === "weekly") {
              currentStart.setDate(baseStart.getDate() + (i * 7));
              currentEnd.setDate(baseEnd.getDate() + (i * 7));
            } else if (recurrenceType === "daily") {
              currentStart.setDate(baseStart.getDate() + i);
              currentEnd.setDate(baseEnd.getDate() + i);
            }

            payloads.push({
              title: title.trim(),
              description: description.trim() || null,
              type,
              program,
              start_time: currentStart.toISOString(),
              end_time: currentEnd.toISOString(),
              instructor: instructor.trim() || null,
              recurrence_id: newRecurrenceId
            });
          }

          const { error } = await supabase
            .from("academic_schedules")
            .insert(payloads);

          if (error) throw error;
          onSuccess(`${recurrenceCount} jadwal baru berhasil dibuat secara berkala!`);
        } else {
          const { error } = await supabase
            .from("academic_schedules")
            .insert(payload);

          if (error) throw error;
          onSuccess("Jadwal baru berhasil dibuat!");
        }
      }
    } catch (err: any) {
      console.error("Gagal menyimpan jadwal:", err);
      alert("Gagal menyimpan jadwal: " + (err.message || String(err)));
    }
  };

  const handleDeleteSchedule = async (): Promise<void> => {
    if (!selectedSchedule) return;

    let deleteMode: "single" | "series" | "cancel" = "single";

    if (selectedSchedule.recurrence_id) {
      const confirmResult = confirm(
        `Agenda "${selectedSchedule.title}" adalah bagian dari seri berulang.\n\n` +
        `Apakah Anda ingin MENGHAPUS SELURUH SERI agenda berulang ini?\n\n` +
        `• Klik OK / Yes untuk menghapus seluruh seri.\n` +
        `• Klik Batal / Cancel untuk menghapus agenda hari ini saja.`
      );
      
      if (confirmResult) {
        deleteMode = "series";
      } else {
        const confirmSingle = confirm(`Apakah Anda yakin ingin menghapus agenda "${selectedSchedule.title}" HANYA untuk hari ini saja?`);
        if (confirmSingle) {
          deleteMode = "single";
        } else {
          deleteMode = "cancel";
        }
      }
    } else {
      const confirmNormal = confirm(`Apakah Anda yakin ingin menghapus agenda "${selectedSchedule.title}"?`);
      if (!confirmNormal) deleteMode = "cancel";
    }

    if (deleteMode === "cancel") return;

    try {
      let query = supabase.from("academic_schedules").delete();
      
      if (deleteMode === "series" && selectedSchedule.recurrence_id) {
        query = query.eq("recurrence_id", selectedSchedule.recurrence_id);
      } else {
        query = query.eq("id", selectedSchedule.id);
      }

      const { error } = await query;
      if (error) throw error;

      onSuccess(deleteMode === "series" ? "Seluruh seri jadwal berhasil dihapus." : "Jadwal berhasil dihapus.");
    } catch (err: any) {
      console.error("Gagal menghapus jadwal:", err);
      alert("Gagal menghapus jadwal: " + (err.message || String(err)));
    }
  };

  return (
    <div className="portal-modal-overlay" onClick={onClose}>
      <div className="portal-modal" style={{ animation: "slideIn 0.2s ease" }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--color-gray-900)", margin: 0 }}>
            {selectedSchedule ? "✏️ Edit Jadwal Belajar" : "📅 Tambah Jadwal Belajar"}
          </h2>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ background: "transparent", border: "none", fontSize: "1.5rem", fontWeight: "800", color: "var(--color-gray-400)", cursor: "pointer" }}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
            
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "800" }}>Judul Kegiatan / Nama Kelas *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Misal: Teens Pre-Intermediate Class" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "800" }}>Deskripsi *</label>
              <textarea 
                className="form-input" 
                style={{ minHeight: "80px", fontFamily: "inherit", padding: "0.5rem" }}
                placeholder="Misal: Modul 4 - Speaking and Presentation practice" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "800" }}>Jenis Agenda</label>
                <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="class">📖 Kelas Regular</option>
                  <option value="event">🎉 Kegiatan Khusus / Event</option>
                  <option value="holiday">🔴 Hari Libur</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "800" }}>Rekomendasi Program</label>
                <select className="form-input" value={program} onChange={(e) => setProgram(e.target.value)}>
                  <option value="All">Semua Program</option>
                  <option value="Kids Program">Kids Program</option>
                  <option value="Teens Program">Teens Program</option>
                  <option value="Fun Calistung">Fun Calistung</option>
                </select>
              </div>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "800" }}>Tanggal Mulai *</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={startDate} 
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (!endDate || endDate < e.target.value) {
                      setEndDate(e.target.value);
                    }
                  }} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "800" }}>Jam Mulai *</label>
                <input 
                  type="time" 
                  className="form-input" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "800" }}>Tanggal Selesai *</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "800" }}>Jam Selesai *</label>
                <input 
                  type="time" 
                  className="form-input" 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "800" }}>Tutor / Pengajar (Opsional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Misal: Coach Husni Usman" 
                value={instructor} 
                onChange={(e) => setInstructor(e.target.value)} 
              />
            </div>

            {/* Recurrence fields (only editable on Add or Single edits) */}
            {!selectedSchedule && (
              <div style={{ border: "1px solid var(--color-gray-200)", padding: "1rem", borderRadius: "8px", backgroundColor: "var(--color-gray-50)" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: "800", fontSize: "0.9rem" }}>
                  <input 
                    type="checkbox" 
                    checked={isRecurring} 
                    onChange={(e) => setIsRecurring(e.target.checked)} 
                    style={{ width: "16px", height: "16px" }} 
                  />
                  <span>🔁 Buat Jadwal Berulang (Recurrent Event)</span>
                </label>

                {isRecurring && (
                  <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: "800" }}>Pola Perulangan</label>
                      <select className="form-input" style={{ padding: "0.35rem" }} value={recurrenceType} onChange={(e) => setRecurrenceType(e.target.value)}>
                        <option value="weekly">Setiap Minggu (Weekly)</option>
                        <option value="daily">Setiap Hari (Daily)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: "800" }}>Jumlah Perulangan (Kali)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        style={{ padding: "0.35rem" }}
                        min="2" 
                        max="24" 
                        value={recurrenceCount} 
                        onChange={(e) => setRecurrenceCount(parseInt(e.target.value) || 2)} 
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Series Edit Mode Selector */}
            {selectedSchedule && selectedSchedule.recurrence_id && (
              <div style={{ border: "1px solid var(--color-accent)", padding: "1rem", borderRadius: "8px", backgroundColor: "var(--color-bg-teal-50)" }}>
                <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>
                  ⚠️ Agenda ini berulang. Pilih cakupan perubahan:
                </p>
                <div style={{ display: "flex", gap: "1.5rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.85rem" }}>
                    <input 
                      type="radio" 
                      name="editSeriesMode" 
                      value="single" 
                      checked={editSeriesMode === "single"} 
                      onChange={() => setEditSeriesMode("single")} 
                    />
                    <span>Hanya Hari Ini Saja</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.85rem" }}>
                    <input 
                      type="radio" 
                      name="editSeriesMode" 
                      value="series" 
                      checked={editSeriesMode === "series"} 
                      onChange={() => setEditSeriesMode("series")} 
                    />
                    <span>Semua Seri Jadwal Ini</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              {selectedSchedule && (
                <button 
                  type="button" 
                  className="btn-portal-outline" 
                  style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)", padding: "0.45rem 1rem" }}
                  onClick={handleDeleteSchedule}
                >
                  Hapus Agenda
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="button" className="btn-portal-outline" onClick={onClose}>
                Batal
              </button>
              <button type="submit" className="btn-portal-primary">
                <span>{selectedSchedule ? "Simpan Perubahan" : "Terbitkan Jadwal"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
