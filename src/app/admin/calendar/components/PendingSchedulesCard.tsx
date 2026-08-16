"use client";

import React, { useState } from "react";
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
  status?: "active" | "pending" | "rescheduled" | string;
  pending_reason?: string | null;
  rescheduled_to?: string | null;
  created_at?: string;
}

interface PendingSchedulesCardProps {
  schedules: AcademicSchedule[];
  onRefresh: () => void;
  onOpenQuickModal: () => void;
}

export default function PendingSchedulesCard({
  schedules,
  onRefresh,
  onOpenQuickModal
}: PendingSchedulesCardProps) {
  const supabase = createClient();

  const [rescheduleModalId, setRescheduleModalId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [rescheduleTime, setRescheduleTime] = useState<string>("10:00");
  const [updating, setUpdating] = useState<boolean>(false);

  const pendingList = schedules.filter(s => s.status === "pending" || s.status === "rescheduled");

  const handleSetReschedule = async (id: string) => {
    if (!rescheduleDate || !rescheduleTime) {
      alert("Harap tentukan tanggal dan jam pengganti.");
      return;
    }

    setUpdating(true);
    const resISO = new Date(`${rescheduleDate}T${rescheduleTime}:00`).toISOString();

    try {
      const { error } = await supabase
        .from("academic_schedules")
        .update({
          status: "rescheduled",
          rescheduled_to: resISO
        })
        .eq("id", id);

      if (error) throw error;

      alert("Tanggal pengganti berhasil ditetapkan!");
      setRescheduleModalId(null);
      onRefresh();
    } catch (err: any) {
      alert("Gagal menetapkan tanggal pengganti: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCompletePending = async (id: string) => {
    if (!confirm("Tandai sesi ini telah selesai dilaksanakan / pulihkan ke aktif?")) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("academic_schedules")
        .update({
          status: "active"
        })
        .eq("id", id);

      if (error) throw error;

      onRefresh();
    } catch (err: any) {
      alert("Gagal mengaktifkan kembali: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Hapus catatan penundaan ini?")) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("academic_schedules")
        .delete()
        .eq("id", id);

      if (error) throw error;

      onRefresh();
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="portal-card" style={{ padding: "1.5rem", marginTop: "2rem", border: "1px solid rgba(245, 158, 11, 0.2)", backgroundColor: "#fffdfa" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "800", color: "#b45309", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
              <path d="M8 14h.01"/>
              <path d="M12 14h.01"/>
              <path d="M16 14h.01"/>
            </svg>
            Kotak Terpisah: Pemantauan Kelas Pending & Reschedule ({pendingList.length})
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--color-gray-500)" }}>
            Daftar sesi belajar yang sedang ditunda atau telah ditetapkan tanggal penggantinya.
          </p>
        </div>

      </div>

      {pendingList.length === 0 ? (
        <div style={{ padding: "2.5rem 1rem", textAlign: "center", backgroundColor: "white", borderRadius: "10px", border: "1px dashed var(--color-gray-200)" }}>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-gray-400)", fontWeight: "600" }}>
            Tidak ada kelas yang pending atau ditunda saat ini. Semua jadwal belajar aktif berjalan lancar!
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
          {pendingList.map((item) => {
            const isRescheduled = item.status === "rescheduled";
            const originalDateStr = new Date(item.start_time).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "1.1rem",
                  border: isRescheduled ? "1px solid #bfdbfe" : "1px solid #fef3c7",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "0.75rem"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>
                      {item.program}
                    </span>
                    <span style={{
                      fontSize: "0.7rem",
                      fontWeight: "800",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      backgroundColor: isRescheduled ? "#dbeafe" : "#fef3c7",
                      color: isRescheduled ? "#1d4ed8" : "#b45309"
                    }}>
                      {isRescheduled ? "Rescheduled" : "Pending"}
                    </span>
                  </div>

                  <h4 style={{ margin: "0 0 0.35rem", fontSize: "0.95rem", fontWeight: "800", color: "var(--color-gray-900)" }}>
                    {item.title}
                  </h4>

                  <div style={{ fontSize: "0.78rem", color: "var(--color-gray-500)", marginBottom: "0.4rem" }}>
                    Sesi Asli: <strong>{originalDateStr}</strong>
                  </div>

                  {item.pending_reason && (
                    <div style={{ fontSize: "0.78rem", fontWeight: "600", color: "#b45309", backgroundColor: "#fffbeb", padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid #fde68a" }}>
                      Alasan: {item.pending_reason}
                    </div>
                  )}

                  {item.rescheduled_to && (
                    <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#1d4ed8", backgroundColor: "#eff6ff", padding: "0.4rem 0.6rem", borderRadius: "6px", marginTop: "0.4rem", border: "1px solid #bfdbfe" }}>
                      Pengganti: {new Date(item.rescheduled_to).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB
                    </div>
                  )}
                </div>

                <div style={{ borderTop: "1px solid var(--color-gray-100)", paddingTop: "0.6rem", display: "flex", gap: "0.4rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                  {rescheduleModalId === item.id ? (
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.5rem", backgroundColor: "#f8fafc", padding: "0.75rem", borderRadius: "8px" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: "800", color: "#1d4ed8" }}>Tentukan Tanggal & Jam Pengganti:</label>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <input type="date" className="form-input" style={{ fontSize: "0.78rem", padding: "0.3rem" }} value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />
                        <input type="time" className="form-input" style={{ fontSize: "0.78rem", padding: "0.3rem" }} value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} />
                      </div>
                      <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                        <button type="button" onClick={() => setRescheduleModalId(null)} className="btn-portal-outline" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>Batal</button>
                        <button type="button" onClick={() => handleSetReschedule(item.id)} disabled={updating} className="btn-portal-primary" style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}>Simpan Pengganti</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setRescheduleModalId(item.id)}
                        className="btn-portal-outline"
                        style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem", color: "#1d4ed8", borderColor: "#bfdbfe" }}
                      >
                        Setel Pengganti
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCompletePending(item.id)}
                        className="btn-portal-outline"
                        style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem", color: "#166534", borderColor: "#bbf7d0" }}
                      >
                        Selesai / Pulihkan
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        style={{ background: "none", border: "none", color: "#ef4444", fontSize: "0.75rem", cursor: "pointer", fontWeight: "700" }}
                      >
                        Hapus
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
