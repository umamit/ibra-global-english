"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface QuickPendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const REASON_OPTIONS = [
  "Pemadaman Listrik / Listrik Padam",
  "Gangguan Jaringan / Internet",
  "Cuaca Buruk / Hujan Deras",
  "Tutor Sakit / Halangan Darurat",
  "Ujian Sekolah / Kegiatan Sekolah Siswa",
  "Hari Libur Nasional / Tanggal Merah",
  "custom"
];

export default function QuickPendingModal({
  isOpen,
  onClose,
  onSuccess
}: QuickPendingModalProps) {
  const supabase = createClient();

  const [title, setTitle] = useState<string>("");
  const [program, setProgram] = useState<string>("Kids Program");
  const [originalDate, setOriginalDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState<string>("16:00");
  const [selectedReason, setSelectedReason] = useState<string>("Pemadaman Listrik / Listrik Padam");
  const [customReason, setCustomReason] = useState<string>("");
  const [instructor, setInstructor] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !originalDate) {
      alert("Harap isi nama kelas / sesi dan tanggal asli.");
      return;
    }

    setSaving(true);
    const finalReason = selectedReason === "custom" ? customReason.trim() : selectedReason;
    const startISO = new Date(`${originalDate}T${startTime}:00`).toISOString();
    const endISO = new Date(`${originalDate}T17:15:00`).toISOString();

    try {
      const { error } = await supabase.from("academic_schedules").insert({
        title: title.trim(),
        program,
        type: "class",
        start_time: startISO,
        end_time: endISO,
        instructor: instructor.trim() || null,
        status: "pending",
        pending_reason: finalReason || "Penundaan Sesi Belajar"
      });

      if (error) throw error;

      onSuccess("Pencatatan kelas pending berhasil ditambahkan ke Kotak Mandiri!");
      setTitle("");
      setCustomReason("");
      onClose();
    } catch (err: any) {
      alert("Gagal menyimpan pencatatan pending: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      backdropFilter: "blur(4px)",
      padding: "1rem"
    }}>
      <div className="portal-card" style={{ width: "100%", maxWidth: "520px", padding: "1.75rem", backgroundColor: "white", borderRadius: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "#d97706", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Catat Penundaan Kelas (Pending Baru)
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "var(--color-gray-500)" }}>
              Pencatatan cepat tanpa mengganggu jadwal kalender aktif rutin.
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--color-gray-400)" }}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: "800" }}>Nama Sesi / Nama Kelas *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Misal: Sesi Pertemuan 4 - Kids Elementary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "800" }}>Program</label>
              <select className="form-input" value={program} onChange={(e) => setProgram(e.target.value)}>
                <option value="Kids Program">Kids Program</option>
                <option value="Teens Program">Teens Program</option>
                <option value="Fun Calistung">Fun Calistung</option>
                <option value="All">Semua Program</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "800" }}>Tanggal Asli *</label>
              <input
                type="date"
                className="form-input"
                value={originalDate}
                onChange={(e) => setOriginalDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: "800", color: "#b45309" }}>Alasan Penundaan</label>
            <select className="form-input" value={selectedReason} onChange={(e) => setSelectedReason(e.target.value)}>
              <option value="Pemadaman Listrik / Listrik Padam">Pemadaman Listrik / Listrik Padam</option>
              <option value="Gangguan Jaringan / Internet">Gangguan Jaringan / Internet</option>
              <option value="Cuaca Buruk / Hujan Deras">Cuaca Buruk / Hujan Deras</option>
              <option value="Tutor Sakit / Halangan Darurat">Tutor Sakit / Halangan Darurat</option>
              <option value="Ujian Sekolah / Kegiatan Sekolah Siswa">Ujian Sekolah / Kegiatan Sekolah Siswa</option>
              <option value="Hari Libur Nasional / Tanggal Merah">Hari Libur Nasional / Tanggal Merah</option>
              <option value="custom">Alasan Lainnya (Ketik Manual...)</option>
            </select>

            {selectedReason === "custom" && (
              <input
                type="text"
                className="form-input"
                style={{ marginTop: "0.5rem" }}
                placeholder="Ketikkan alasan penundaan spesifik..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                required
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: "800" }}>Tutor Pendamping (Opsional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nama tutor"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
            <button type="button" onClick={onClose} className="btn-portal-outline" style={{ padding: "0.5rem 1rem" }}>
              Batal
            </button>
            <button type="submit" disabled={saving} className="btn-portal-primary" style={{ padding: "0.5rem 1.25rem", backgroundColor: "#d97706", borderColor: "#d97706" }}>
              {saving ? "Simpan..." : "Simpan Ke Kotak Pending"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
