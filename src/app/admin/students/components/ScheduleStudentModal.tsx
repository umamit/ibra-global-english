"use client";

import React, { useState, useEffect } from "react";
import { StudentItem } from "../hooks/useStudentData";
import { useScheduleFromStudent, UpcomingScheduleItem } from "../hooks/useScheduleFromStudent";

interface ScheduleStudentModalProps {
  isOpen: boolean;
  student: StudentItem | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

const AlertCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-2px", marginRight: "4px" }}>
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const DAYS_OPTIONS = [
  { day: 1, label: "Senin" }, { day: 2, label: "Selasa" }, { day: 3, label: "Rabu" },
  { day: 4, label: "Kamis" }, { day: 5, label: "Jumat" }, { day: 6, label: "Sabtu" },
];

export default function ScheduleStudentModal({ isOpen, student, onClose, onSuccess }: ScheduleStudentModalProps) {
  const { submitting, conflictWarning, generateAndSaveSchedules, fetchUpcomingStudentSchedules, rescheduleStudentSession, setSessionPending } = useScheduleFromStudent();

  const [activeTab, setActiveTab] = useState<"recurring" | "reschedule" | "pending">("recurring");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 6]);
  const [startTime, setStartTime] = useState<string>("15:30");
  const [endTime, setEndTime] = useState<string>("16:45");
  const [instructor, setInstructor] = useState<string>("Tutor Ibra");
  const [room, setRoom] = useState<string>("Ruang Kelas A");
  const [monthsAhead, setMonthsAhead] = useState<number>(3);
  const [statusMsg, setStatusMsg] = useState<string>("");

  const [upcomingSchedules, setUpcomingSchedules] = useState<UpcomingScheduleItem[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [rescheduleDate, setRescheduleDate] = useState<string>("");
  const [rescheduleStartTime, setRescheduleStartTime] = useState<string>("15:30");
  const [rescheduleEndTime, setRescheduleEndTime] = useState<string>("16:45");
  const [rescheduleRoom, setRescheduleRoom] = useState<string>("Ruang Kelas A");
  const [pendingReason, setPendingReason] = useState<string>("Diliburkan / Izin");

  useEffect(() => {
    if (student) {
      const p = (student.program || "").toLowerCase();
      if (p.includes("teen")) { setSelectedDays([2, 4]); setStartTime("15:30"); setEndTime("17:00"); }
      else if (p.includes("calistung")) { setSelectedDays([1, 3, 5]); setStartTime("15:00"); setEndTime("15:45"); }
      else { setSelectedDays([1, 3, 6]); setStartTime("15:30"); setEndTime("16:45"); }

      fetchUpcomingStudentSchedules(student.name, student.program || "").then((list) => {
        setUpcomingSchedules(list);
        if (list.length > 0) setSelectedScheduleId(list[0].id);
      });
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const toggleDay = (dayNum: number) => {
    setSelectedDays((prev) => prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum]);
  };

  const handleSaveRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDays.length === 0) { setStatusMsg("Pilih setidaknya 1 hari belajar."); return; }
    setStatusMsg("");
    const res = await generateAndSaveSchedules({
      studentId: student.id, studentName: student.name, program: student.program || "Kids Program",
      selectedDays, startTime, endTime, instructor, room, monthsAhead,
    });
    if (res.success) { onSuccess(res.message); onClose(); } else { setStatusMsg(res.message); }
  };

  const handleSaveReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheduleId) { setStatusMsg("Pilih sesi yang ingin dipindahkan."); return; }
    if (!rescheduleDate) { setStatusMsg("Pilih tanggal pengganti baru."); return; }
    setStatusMsg("");
    const res = await rescheduleStudentSession(selectedScheduleId, rescheduleDate, rescheduleStartTime, rescheduleEndTime, rescheduleRoom, student.name);
    if (res.success) { onSuccess(res.message); onClose(); } else { setStatusMsg(res.message); }
  };

  const handleSavePending = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheduleId) { setStatusMsg("Pilih sesi yang ingin ditunda."); return; }
    setStatusMsg("");
    const res = await setSessionPending(selectedScheduleId, pendingReason, student.name);
    if (res.success) { onSuccess(res.message); onClose(); } else { setStatusMsg(res.message); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ backgroundColor: "#ffffff", borderRadius: "18px", padding: "1.5rem", maxWidth: "540px", width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>Kelola Jadwal Siswa</h3>
            <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.82rem", color: "#64748b" }}>
              Siswa: <strong>{student.name}</strong> • Level: <span style={{ color: "#216c7e", fontWeight: "700" }}>{student.program}</span>
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#94a3b8" }}>&times;</button>
        </div>

        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>
          <button type="button" onClick={() => setActiveTab("recurring")} style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", fontWeight: 700, borderRadius: "8px", border: "none", cursor: "pointer", backgroundColor: activeTab === "recurring" ? "#eef6f8" : "transparent", color: activeTab === "recurring" ? "#216c7e" : "#64748b", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <span>Jadwal Rutin</span>
          </button>
          <button type="button" onClick={() => setActiveTab("reschedule")} style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", fontWeight: 700, borderRadius: "8px", border: "none", cursor: "pointer", backgroundColor: activeTab === "reschedule" ? "#fef3c7" : "transparent", color: activeTab === "reschedule" ? "#b45309" : "#64748b", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            <span>Reschedule</span>
          </button>
          <button type="button" onClick={() => setActiveTab("pending")} style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", fontWeight: 700, borderRadius: "8px", border: "none", cursor: "pointer", backgroundColor: activeTab === "pending" ? "#fee2e2" : "transparent", color: activeTab === "pending" ? "#b91c1c" : "#64748b", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="10" x2="10" y1="15" y2="9" />
              <line x1="14" x2="14" y1="15" y2="9" />
            </svg>
            <span>Tunda (Pending)</span>
          </button>
        </div>

        {conflictWarning && <div style={{ padding: "0.5rem 0.75rem", backgroundColor: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "10px", color: "#b45309", fontSize: "0.78rem", marginBottom: "0.75rem", fontWeight: "600" }}><AlertCircleIcon /> {conflictWarning}</div>}
        {statusMsg && <div style={{ padding: "0.5rem 0.75rem", backgroundColor: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "10px", color: "#b91c1c", fontSize: "0.78rem", marginBottom: "0.75rem", fontWeight: "600" }}>{statusMsg}</div>}

        {activeTab === "recurring" && (
          <form onSubmit={handleSaveRecurring} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "800", color: "#334155", display: "block", marginBottom: "0.35rem" }}>Pilih Hari Belajar Rutin (WIT):</label>
              <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                {DAYS_OPTIONS.map((d) => (
                  <button key={d.day} type="button" onClick={() => toggleDay(d.day)} style={{ padding: "0.35rem 0.65rem", fontSize: "0.8rem", fontWeight: "700", borderRadius: "8px", border: selectedDays.includes(d.day) ? "1px solid #216c7e" : "1px solid #cbd5e1", backgroundColor: selectedDays.includes(d.day) ? "#eef6f8" : "#ffffff", color: selectedDays.includes(d.day) ? "#216c7e" : "#475569", cursor: "pointer" }}>{d.label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              <div><label style={{ fontSize: "0.78rem", fontWeight: "700", color: "#334155" }}>Jam Mulai</label><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }} required /></div>
              <div><label style={{ fontSize: "0.78rem", fontWeight: "700", color: "#334155" }}>Jam Selesai</label><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }} required /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              <div><label style={{ fontSize: "0.78rem", fontWeight: "700", color: "#334155" }}>Tutor</label><select value={instructor} onChange={(e) => setInstructor(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}><option value="Tutor Ibra">Tutor Ibra</option><option value="Husnita Usman">Husnita Usman</option><option value="Anhar">Anhar</option></select></div>
              <div><label style={{ fontSize: "0.78rem", fontWeight: "700", color: "#334155" }}>Ruangan</label><select value={room} onChange={(e) => setRoom(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}><option value="Ruang Kelas A">Ruang Kelas A</option><option value="Ruang Kelas B">Ruang Kelas B</option><option value="Ruang Calistung">Ruang Calistung</option></select></div>
            </div>
            <div><label style={{ fontSize: "0.78rem", fontWeight: "700", color: "#334155" }}>Durasi Otomatis</label><select value={monthsAhead} onChange={(e) => setMonthsAhead(Number(e.target.value))} style={{ width: "100%", padding: "0.35rem 0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}><option value={1}>1 Bulan</option><option value={3}>3 Bulan</option><option value={6}>6 Bulan</option></select></div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.4rem" }}>
              <button type="button" onClick={onClose} className="btn-portal-outline" style={{ padding: "0.4rem 0.85rem", fontSize: "0.82rem" }}>Batal</button>
              <button type="submit" disabled={submitting} className="btn-portal-primary" style={{ padding: "0.4rem 0.85rem", fontSize: "0.82rem" }}>{submitting ? "Memproses..." : "Simpan Jadwal Rutin"}</button>
            </div>
          </form>
        )}

        {activeTab === "reschedule" && (
          <form onSubmit={handleSaveReschedule} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "#334155" }}>Pilih Sesi Asal yang Ingin Dipindahkan:</label>
              <select value={selectedScheduleId} onChange={(e) => setSelectedScheduleId(e.target.value)} style={{ width: "100%", padding: "0.4rem 0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }} required>
                {upcomingSchedules.length === 0 ? <option value="">Tidak ada sesi akan datang terdaftar</option> : upcomingSchedules.map((s) => (<option key={s.id} value={s.id}>{s.start_time.substring(0, 10)} (Jam {s.start_time.substring(11, 16)} WIT)</option>))}
              </select>
            </div>
            <div><label style={{ fontSize: "0.78rem", fontWeight: "700", color: "#334155" }}>Tanggal Pengganti Baru</label><input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} style={{ width: "100%", padding: "0.4rem 0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }} required /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              <div><label style={{ fontSize: "0.78rem", fontWeight: "700", color: "#334155" }}>Jam Mulai Baru</label><input type="time" value={rescheduleStartTime} onChange={(e) => setRescheduleStartTime(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }} required /></div>
              <div><label style={{ fontSize: "0.78rem", fontWeight: "700", color: "#334155" }}>Jam Selesai Baru</label><input type="time" value={rescheduleEndTime} onChange={(e) => setRescheduleEndTime(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }} required /></div>
            </div>
            <div><label style={{ fontSize: "0.78rem", fontWeight: "700", color: "#334155" }}>Ruangan Pengganti</label><select value={rescheduleRoom} onChange={(e) => setRescheduleRoom(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}><option value="Ruang Kelas A">Ruang Kelas A</option><option value="Ruang Kelas B">Ruang Kelas B</option><option value="Ruang Calistung">Ruang Calistung</option></select></div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.4rem" }}>
              <button type="button" onClick={onClose} className="btn-portal-outline" style={{ padding: "0.4rem 0.85rem", fontSize: "0.82rem" }}>Batal</button>
              <button type="submit" disabled={submitting} className="btn-portal-primary" style={{ padding: "0.4rem 0.85rem", fontSize: "0.82rem", backgroundColor: "#b45309" }}>{submitting ? "Memproses..." : "Simpan Reschedule Sesi Ini"}</button>
            </div>
          </form>
        )}

        {activeTab === "pending" && (
          <form onSubmit={handleSavePending} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "#334155" }}>Pilih Sesi yang Ingin Ditunda (Pending):</label>
              <select value={selectedScheduleId} onChange={(e) => setSelectedScheduleId(e.target.value)} style={{ width: "100%", padding: "0.4rem 0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }} required>
                {upcomingSchedules.length === 0 ? <option value="">Tidak ada sesi akan datang terdaftar</option> : upcomingSchedules.map((s) => (<option key={s.id} value={s.id}>{s.start_time.substring(0, 10)} (Jam {s.start_time.substring(11, 16)} WIT)</option>))}
              </select>
            </div>
            <div><label style={{ fontSize: "0.78rem", fontWeight: "700", color: "#334155" }}>Alasan Penundaan Sesi</label><input type="text" value={pendingReason} onChange={(e) => setPendingReason(e.target.value)} placeholder="Contoh: Libur Lembaga / Izin Tutor" style={{ width: "100%", padding: "0.4rem 0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }} required /></div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.4rem" }}>
              <button type="button" onClick={onClose} className="btn-portal-outline" style={{ padding: "0.4rem 0.85rem", fontSize: "0.82rem" }}>Batal</button>
              <button type="submit" disabled={submitting} className="btn-portal-primary" style={{ padding: "0.4rem 0.85rem", fontSize: "0.82rem", backgroundColor: "#b91c1c" }}>{submitting ? "Memproses..." : "Tunda Sesi Ini (Pending)"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
