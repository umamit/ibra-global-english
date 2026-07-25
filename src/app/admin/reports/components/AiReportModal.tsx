"use client";

import React from "react";

interface AiReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  aiFocus: string;
  setAiFocus: (val: string) => void;
  aiAchievements: string;
  setAiAchievements: (val: string) => void;
  aiChallenges: string;
  setAiChallenges: (val: string) => void;
  aiProgressLoading: boolean;
}

export default function AiReportModal({
  isOpen,
  onClose,
  onSubmit,
  aiFocus,
  setAiFocus,
  aiAchievements,
  setAiAchievements,
  aiChallenges,
  setAiChallenges,
  aiProgressLoading
}: AiReportModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(4px)",
      zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem"
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "500px",
        overflow: "hidden",
        boxShadow: "var(--shadow-xl, 0 20px 25px -5px rgba(0,0,0,0.1))"
      }}>
        <div style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "var(--color-bg-teal-50, #eef6f8)"
        }}>
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "var(--color-primary-dark)" }}>
            ✨ Panduan Draf Rapor AI
          </h3>
          <button 
            type="button"
            onClick={onClose}
            style={{
              background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: "var(--color-gray-500)"
            }}
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={onSubmit} style={{ padding: "1.5rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--color-gray-700)" }}>
              Materi Fokus Bulan Ini
            </label>
            <input
              type="text"
              className="form-input"
              value={aiFocus}
              onChange={e => setAiFocus(e.target.value)}
              placeholder="Contoh: Greetings, Daily Activities, Reading..."
              required
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--color-gray-700)" }}>
              Pencapaian Positif Siswa
            </label>
            <textarea
              className="form-input"
              rows={2}
              value={aiAchievements}
              onChange={e => setAiAchievements(e.target.value)}
              placeholder="Contoh: sangat aktif berdiskusi dan pelafalan membaik..."
              style={{ resize: "vertical", minHeight: "60px" }}
              required
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--color-gray-700)" }}>
              Tantangan / Aspek yang Perlu Ditingkatkan
            </label>
            <textarea
              className="form-input"
              rows={2}
              value={aiChallenges}
              onChange={e => setAiChallenges(e.target.value)}
              placeholder="Contoh: rasa percaya diri berbicara perlu ditingkatkan..."
              style={{ resize: "vertical", minHeight: "60px" }}
              required
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-portal-outline"
              style={{ padding: "0.5rem 1.25rem", height: "auto" }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-portal-primary"
              style={{ padding: "0.5rem 1.5rem", height: "auto" }}
              disabled={aiProgressLoading}
            >
              {aiProgressLoading ? "⏳ Membuat Draf..." : "✨ Buat Draf AI"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
