"use client";

import React, { useState, useEffect } from "react";
import { StudentItem } from "../hooks/useStudentData";
import { useScheduleFromStudent } from "../hooks/useScheduleFromStudent";

interface ScheduleStudentModalProps {
  isOpen: boolean;
  student: StudentItem | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

const AlertCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-2px", marginRight: "4px" }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const DAYS_OPTIONS = [
  { day: 1, label: "Senin" },
  { day: 2, label: "Selasa" },
  { day: 3, label: "Rabu" },
  { day: 4, label: "Kamis" },
  { day: 5, label: "Jumat" },
  { day: 6, label: "Sabtu" },
];

export default function ScheduleStudentModal({
  isOpen,
  student,
  onClose,
  onSuccess,
}: ScheduleStudentModalProps) {
  const { submitting, conflictWarning, generateAndSaveSchedules } = useScheduleFromStudent();

  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 6]);
  const [startTime, setStartTime] = useState<string>("15:30");
  const [endTime, setEndTime] = useState<string>("16:45");
  const [instructor, setInstructor] = useState<string>("Tutor Ibra");
  const [room, setRoom] = useState<string>("Ruang Kelas A");
  const [monthsAhead, setMonthsAhead] = useState<number>(3);
  const [statusMsg, setStatusMsg] = useState<string>("");

  useEffect(() => {
    if (student) {
      const p = (student.program || "").toLowerCase();
      if (p.includes("teen")) {
        setSelectedDays([2, 4]);
        setStartTime("15:30");
        setEndTime("17:00");
      } else if (p.includes("calistung")) {
        setSelectedDays([1, 3, 5]);
        setStartTime("15:00");
        setEndTime("15:45");
      } else {
        setSelectedDays([1, 3, 6]);
        setStartTime("15:30");
        setEndTime("16:45");
      }
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const toggleDay = (dayNum: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      setStatusMsg("Pilih setidaknya 1 hari belajar.");
      return;
    }
    setStatusMsg("");

    const res = await generateAndSaveSchedules({
      studentId: student.id,
      studentName: student.name,
      program: student.program || "Kids Program",
      selectedDays,
      startTime,
      endTime,
      instructor,
      room,
      monthsAhead,
    });

    if (res.success) {
      onSuccess(res.message);
      onClose();
    } else {
      setStatusMsg(res.message);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
    }}>
      <div style={{
        backgroundColor: "#ffffff", borderRadius: "18px", padding: "1.5rem",
        maxWidth: "520px", width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>
              Buat Jadwal Kelas Rutin
            </h3>
            <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.82rem", color: "#64748b" }}>
              Siswa: <strong>{student.name}</strong> • Level: <span style={{ color: "#216c7e", fontWeight: "700" }}>{student.program}</span>
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#94a3b8" }}>&times;</button>
        </div>

        {conflictWarning && (
          <div style={{ padding: "0.6rem 0.85rem", backgroundColor: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "10px", color: "#b45309", fontSize: "0.8rem", marginBottom: "1rem", fontWeight: "600", display: "flex", alignItems: "center" }}>
            <AlertCircleIcon /> {conflictWarning}
          </div>
        )}

        {statusMsg && (
          <div style={{ padding: "0.6rem 0.85rem", backgroundColor: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "10px", color: "#b91c1c", fontSize: "0.8rem", marginBottom: "1rem", fontWeight: "600" }}>
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: "800", color: "#334155", display: "block", marginBottom: "0.4rem" }}>
              Pilih Hari Belajar Rutin (WIT):
            </label>
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              {DAYS_OPTIONS.map((d) => {
                const active = selectedDays.includes(d.day);
                return (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => toggleDay(d.day)}
                    style={{
                      padding: "0.35rem 0.65rem", fontSize: "0.8rem", fontWeight: "700",
                      borderRadius: "8px", border: active ? "1px solid #216c7e" : "1px solid #cbd5e1",
                      backgroundColor: active ? "#eef6f8" : "#ffffff", color: active ? "#216c7e" : "#475569",
                      cursor: "pointer", transition: "all 0.15s ease",
                    }}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#334155", display: "block", marginBottom: "0.25rem" }}>
                Jam Mulai (WIT)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{ width: "100%", padding: "0.4rem 0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#334155", display: "block", marginBottom: "0.25rem" }}>
                Jam Selesai (WIT)
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{ width: "100%", padding: "0.4rem 0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#334155", display: "block", marginBottom: "0.25rem" }}>
                Pengajar / Tutor
              </label>
              <select
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                style={{ width: "100%", padding: "0.4rem 0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              >
                <option value="Tutor Ibra">Tutor Ibra</option>
                <option value="Husnita Usman">Husnita Usman</option>
                <option value="Anhar">Anhar</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#334155", display: "block", marginBottom: "0.25rem" }}>
                Ruang Kelas
              </label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                style={{ width: "100%", padding: "0.4rem 0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              >
                <option value="Ruang Kelas A">Ruang Kelas A</option>
                <option value="Ruang Kelas B">Ruang Kelas B</option>
                <option value="Ruang Calistung">Ruang Calistung</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#334155", display: "block", marginBottom: "0.25rem" }}>
              Durasi Buat Jadwal Otomatis:
            </label>
            <select
              value={monthsAhead}
              onChange={(e) => setMonthsAhead(Number(e.target.value))}
              style={{ width: "100%", padding: "0.4rem 0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
            >
              <option value={1}>1 Bulan ke Depan</option>
              <option value={3}>3 Bulan ke Depan (Disarankan)</option>
              <option value={6}>6 Bulan ke Depan</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
            <button type="button" onClick={onClose} className="btn-portal-outline" style={{ padding: "0.4rem 0.85rem", fontSize: "0.82rem" }}>
              Batal
            </button>
            <button type="submit" disabled={submitting} className="btn-portal-primary" style={{ padding: "0.4rem 0.85rem", fontSize: "0.82rem" }}>
              {submitting ? "Memproses..." : "Simpan Jadwal Rutin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
