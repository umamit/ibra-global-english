"use client";

import React from "react";
import { Submission } from "../hooks/usePlacementAdmin";

interface FollowUpModalProps {
  student: Submission;
  message: string;
  aiLoading: boolean;
  onClose: () => void;
  onMessageChange: (v: string) => void;
  onGenerateAi: () => void;
}

export default function FollowUpModal({ student, message, aiLoading, onClose, onMessageChange, onGenerateAi }: FollowUpModalProps) {
  const handleSendWA = () => {
    const targetPhone = student.whatsapp_number.startsWith("0")
      ? "62" + student.whatsapp_number.slice(1)
      : student.whatsapp_number.replace("+", "");
    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`, "_blank");
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(4px)", padding: "1rem" }}>
      <div className="portal-card" style={{ width: "100%", maxWidth: "600px", padding: "2rem", backgroundColor: "white", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Follow-Up Calon Siswa (AI Assistant)
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--color-gray-400)" }}>&times;</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ fontSize: "0.85rem", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "6px", border: "1px solid var(--color-gray-200)" }}>
            <div><strong>Nama:</strong> {student.full_name}</div>
            <div><strong>WhatsApp:</strong> {student.whatsapp_number}</div>
            <div><strong>Hasil Tes:</strong> Level {student.level} (Skor {student.score} / 20)</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-gray-700)" }}>Draf Pesan WhatsApp:</label>
            <textarea
              className="form-input"
              style={{ width: "100%", height: "200px", resize: "vertical", fontFamily: "inherit", fontSize: "0.9rem", padding: "0.75rem", lineHeight: "1.4" }}
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button type="button" onClick={onGenerateAi} disabled={aiLoading} className="btn-portal-outline" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1.25rem" }}>
              {aiLoading ? (
                <>
                  <svg style={{ animation: "spin 1s linear infinite", width: "12px", height: "12px" }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Mendraf...</span>
                </>
              ) : (
                <span>Draf dengan AI</span>
              )}
            </button>

            <button onClick={handleSendWA} className="btn-portal-primary" style={{ padding: "0.6rem 1.25rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              <span>Kirim WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
