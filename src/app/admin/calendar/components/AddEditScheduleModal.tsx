import React from "react";
import { useScheduleModalForm } from "../hooks/useScheduleModalForm";

const PRESET_REASONS = [
  "Pemadaman Listrik / Listrik Padam", "Gangguan Jaringan / Internet",
  "Cuaca Buruk / Hujan Deras", "Tutor Sakit / Halangan Darurat",
  "Ujian Sekolah / Kegiatan Sekolah Siswa", "Hari Libur Nasional / Tanggal Merah",
];

interface AcademicSchedule {
  id: string; title: string; description?: string | null; type: string; program: string;
  start_time: string; end_time: string; instructor?: string | null; recurrence_id?: string | null;
}

interface AddEditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  selectedSchedule: AcademicSchedule | null;
  initialDateStr: string;
}

export default function AddEditScheduleModal({ isOpen, onClose, onSuccess, selectedSchedule, initialDateStr }: AddEditScheduleModalProps) {
  const form = useScheduleModalForm(isOpen, selectedSchedule, initialDateStr, onSuccess, onClose);

  if (!isOpen) return null;

  const isPresetReason = PRESET_REASONS.includes(form.pendingReason);

  return (
    <div className="portal-modal-overlay" onClick={onClose}>
      <div className="portal-modal" style={{ animation: "slideIn 0.2s ease" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", padding: "1.5rem 2rem 0" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--color-gray-900)", margin: 0 }}>
            {selectedSchedule ? "Edit Jadwal Belajar" : "Tambah Jadwal Belajar"}
          </h2>
          <button type="button" onClick={onClose} style={{ background: "transparent", border: "none", fontSize: "1.5rem", fontWeight: "800", color: "var(--color-gray-400)", cursor: "pointer" }}>&times;</button>
        </div>

        <form onSubmit={form.handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "800" }}>Judul Kegiatan / Nama Kelas *</label>
              <input type="text" className="form-input" placeholder="Misal: Teens Pre-Intermediate Class" value={form.title} onChange={(e) => form.setTitle(e.target.value)} required />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "800" }}>Deskripsi</label>
              <textarea className="form-input" style={{ minHeight: "80px", fontFamily: "inherit", padding: "0.5rem" }} placeholder="Misal: Modul 4 - Speaking and Presentation practice" value={form.description} onChange={(e) => form.setDescription(e.target.value)} />
            </div>

            {/* Type & Program */}
            <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "800" }}>Jenis Agenda</label>
                <select className="form-input" value={form.type} onChange={(e) => form.setType(e.target.value)}>
                  <option value="class">Kelas Regular</option>
                  <option value="event">Kegiatan Khusus / Event</option>
                  <option value="holiday">Hari Libur</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "800" }}>Rekomendasi Program</label>
                <select className="form-input" value={form.program} onChange={(e) => form.setProgram(e.target.value)}>
                  <option value="All">Semua Program</option>
                  <option value="Kids Program">Kids Program</option>
                  <option value="Teens Program">Teens Program</option>
                  <option value="Fun Calistung">Fun Calistung</option>
                </select>
              </div>
            </div>

            {/* Status & Pending Reason */}
            <div style={{ backgroundColor: "rgba(0,0,0,0.02)", padding: "1rem", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: "800" }}>Status Sesi Belajar</label>
                <select className="form-input" value={form.status} onChange={(e) => form.setStatus(e.target.value)}>
                  <option value="active">Berjalan Normal (Aktif)</option>
                  <option value="pending">Pending (Ditunda Minggu Ini)</option>
                  <option value="rescheduled">Rescheduled (Dijadwalkan Ulang)</option>
                </select>
              </div>

              {form.status !== "active" && (
                <div className="form-group" style={{ margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label className="form-label" style={{ fontWeight: "800", color: "#b45309" }}>Alasan Penundaan Kelas</label>
                  <select className="form-input" value={isPresetReason ? form.pendingReason : form.pendingReason ? "custom" : PRESET_REASONS[0]} onChange={(e) => { form.setPendingReason(e.target.value === "custom" ? "" : e.target.value); }}>
                    {PRESET_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    <option value="custom">Alasan Lainnya (Ketik Manual...)</option>
                  </select>
                  {!isPresetReason && <input type="text" className="form-input" placeholder="Ketikkan alasan spesifik penundaan..." value={form.pendingReason} onChange={(e) => form.setPendingReason(e.target.value)} />}
                </div>
              )}

              {form.status === "rescheduled" && (
                <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "0.75rem", margin: 0 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: "800", color: "#1d4ed8" }}>Tanggal Pengganti</label>
                    <input type="date" className="form-input" value={form.rescheduledDate} onChange={(e) => form.setRescheduledDate(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: "800", color: "#1d4ed8" }}>Jam Pengganti</label>
                    <input type="time" className="form-input" value={form.rescheduledTime} onChange={(e) => form.setRescheduledTime(e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            {/* Start & End Date/Time */}
            <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "800" }}>Tanggal Mulai *</label>
                <input type="date" className="form-input" value={form.startDate} onChange={(e) => { form.setStartDate(e.target.value); if (!form.endDate || form.endDate < e.target.value) form.setEndDate(e.target.value); }} required />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "800" }}>Jam Mulai *</label>
                <input type="time" className="form-input" value={form.startTime} onChange={(e) => form.setStartTime(e.target.value)} required />
              </div>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "800" }}>Tanggal Selesai *</label>
                <input type="date" className="form-input" value={form.endDate} onChange={(e) => form.setEndDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "800" }}>Jam Selesai *</label>
                <input type="time" className="form-input" value={form.endTime} onChange={(e) => form.setEndTime(e.target.value)} required />
              </div>
            </div>

            {/* Instructor */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "800" }}>Tutor / Pengajar (Opsional)</label>
              <input type="text" className="form-input" placeholder="Misal: Coach Husni Usman" value={form.instructor} onChange={(e) => form.setInstructor(e.target.value)} />
            </div>

            {/* Recurrence (Add Mode) */}
            {!selectedSchedule && (
              <div style={{ border: "1px solid var(--color-gray-200)", padding: "1rem", borderRadius: "8px", backgroundColor: "var(--color-gray-50)" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: "800", fontSize: "0.9rem" }}>
                  <input type="checkbox" checked={form.isRecurring} onChange={(e) => form.setIsRecurring(e.target.checked)} style={{ width: "16px", height: "16px" }} />
                  <span>Buat Jadwal Berulang (Recurrent Event)</span>
                </label>
                {form.isRecurring && (
                  <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: "800" }}>Pola Perulangan</label>
                      <select className="form-input" style={{ padding: "0.35rem" }} value={form.recurrenceType} onChange={(e) => form.setRecurrenceType(e.target.value)}>
                        <option value="weekly">Setiap Minggu (Weekly)</option>
                        <option value="daily">Setiap Hari (Daily)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: "800" }}>Jumlah Perulangan (Kali)</label>
                      <input type="number" className="form-input" style={{ padding: "0.35rem" }} min="2" max="24" value={form.recurrenceCount} onChange={(e) => form.setRecurrenceCount(parseInt(e.target.value) || 2)} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Series Edit Mode (Edit Mode only) */}
            {selectedSchedule && selectedSchedule.recurrence_id && (
              <div style={{ border: "1px solid var(--color-accent)", padding: "1rem", borderRadius: "8px", backgroundColor: "var(--color-bg-teal-50)" }}>
                <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>Agenda ini berulang. Pilih cakupan perubahan:</p>
                <div style={{ display: "flex", gap: "1.5rem" }}>
                  {(["single", "series"] as const).map((mode) => (
                    <label key={mode} style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.85rem" }}>
                      <input type="radio" name="editSeriesMode" value={mode} checked={form.editSeriesMode === mode} onChange={() => form.setEditSeriesMode(mode)} />
                      <span>{mode === "single" ? "Hanya Hari Ini Saja" : "Semua Seri Jadwal Ini"}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              {selectedSchedule && (
                <button type="button" className="btn-portal-outline" style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)", padding: "0.45rem 1rem" }} onClick={form.handleDeleteSchedule}>
                  Hapus Agenda
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="button" className="btn-portal-outline" onClick={onClose}>Batal</button>
              <button type="submit" className="btn-portal-primary">
                {selectedSchedule ? "Simpan Perubahan" : "Terbitkan Jadwal"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
