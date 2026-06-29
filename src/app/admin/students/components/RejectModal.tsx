"use client";

import React from "react";

interface Props {
  rejectModalId: string | null;
  rejectNotes: string;
  setRejectNotes: (notes: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function RejectModal({ rejectModalId, rejectNotes, setRejectNotes, onClose, onConfirm }: Props) {
  if (!rejectModalId) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <div className="portal-modal-overlay">
      <div className="portal-modal" style={{ maxWidth: "480px" }}>
        <div className="portal-modal-header">
          <h2 className="portal-modal-title">Tolak Pendaftaran</h2>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Tutup modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <p style={{
            color: "var(--color-gray-500)",
            marginBottom: "1.25rem",
            fontSize: "0.88rem",
            lineHeight: "1.6"
          }}>
            Tuliskan alasan penolakan di bawah (opsional). Informasi ini akan dicantumkan dalam notifikasi WhatsApp penolakan yang otomatis terkirim ke orang tua/wali siswa.
          </p>
          <div className="form-group" style={{ marginBottom: "1.75rem" }}>
            <label className="form-label" style={{ fontWeight: "700", marginBottom: "0.5rem", display: "block" }}>
              Alasan Penolakan (Opsional)
            </label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Contoh: Slot program penuh, usia anak belum mencukupi, dll."
              value={rejectNotes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectNotes(e.target.value)}
              style={{
                resize: "vertical",
                width: "100%",
                minHeight: "90px"
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
            <button type="button" className="btn-portal-outline" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn-portal-danger">
              Konfirmasi Penolakan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
