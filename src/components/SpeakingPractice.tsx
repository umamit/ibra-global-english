"use client";

import React from "react";
import { PRACTICE_SENTENCES, useSpeakingPractice } from "@/hooks/useSpeakingPractice";

export default function SpeakingPractice({ student }: any) {
  const {
    activeIdx,
    setActiveIdx,
    isRecording,
    transcript,
    score,
    feedback,
    isListeningTTS,
    recognitionSupported,
    targetSentence,
    handleListenTTS,
    handleToggleRecord,
  } = useSpeakingPractice(student);

  return (
    <div className="portal-card" style={{ padding: "2.5rem 2rem", maxWidth: "680px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.4rem", fontWeight: "900", color: "var(--color-primary-dark)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
          <i className="fi fi-rr-microphone"></i>
          <span>AI English Speaking Practice</span>
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", marginTop: "0.4rem" }}>
          Dengarkan contoh pengucapan tutor, lalu rekam suara Anda untuk mendapatkan nilai kefasihan langsung!
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {PRACTICE_SENTENCES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiveIdx(i)}
            type="button"
            className="portal-btn"
            style={{
              padding: "0.35rem 0.75rem",
              fontSize: "0.75rem",
              borderRadius: "20px",
              backgroundColor: activeIdx === i ? "var(--color-primary)" : "var(--color-bg-teal-50)",
              color: activeIdx === i ? "white" : "var(--color-primary-dark)",
              border: "1px solid var(--color-primary)",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            {s.topic.split(" ")[0]}
          </button>
        ))}
      </div>

      <div style={{ backgroundColor: "#f8fafc", borderRadius: "16px", padding: "1.5rem", border: "1px solid #e2e8f0", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-accent)" }}>
            {PRACTICE_SENTENCES[activeIdx].topic}
          </span>
          <button
            onClick={handleListenTTS}
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              backgroundColor: isListeningTTS ? "var(--color-accent)" : "rgba(33, 108, 126, 0.1)",
              color: isListeningTTS ? "white" : "var(--color-primary-dark)",
              border: "none",
              padding: "0.35rem 0.75rem",
              borderRadius: "12px",
              fontSize: "0.75rem",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            <i className="fi fi-rr-volume"></i>
            <span>{isListeningTTS ? "Mendengarkan..." : "Dengar Audio"}</span>
          </button>
        </div>

        <p style={{ fontSize: "1.2rem", fontWeight: "800", color: "#0f172a", lineHeight: "1.4", marginBottom: "0.5rem" }}>
          &quot;{targetSentence}&quot;
        </p>
        <p style={{ fontSize: "0.85rem", color: "#64748b", fontStyle: "italic" }}>
          {PRACTICE_SENTENCES[activeIdx].translate}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={handleToggleRecord}
          type="button"
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: isRecording ? "#ef4444" : "var(--color-primary)",
            color: "white",
            border: "none",
            boxShadow: isRecording ? "0 0 0 10px rgba(239, 68, 68, 0.2)" : "0 8px 24px rgba(33, 108, 126, 0.3)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.2rem",
            transition: "all 0.3s ease",
          }}
        >
          <i className="fi fi-rr-microphone" style={{ fontSize: "1.5rem" }}></i>
          <span style={{ fontSize: "0.65rem", fontWeight: "800" }}>
            {isRecording ? "Stop" : "Rekam"}
          </span>
        </button>

        {!recognitionSupported && (
          <p style={{ fontSize: "0.75rem", color: "#ef4444", fontWeight: "600" }}>
            Browser tidak mendukung perekaman suara online.
          </p>
        )}

        {transcript && (
          <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Teks Terdeteksi:</p>
            <p style={{ fontSize: "0.95rem", fontWeight: "700", color: "#334155" }}>&quot;{transcript}&quot;</p>
          </div>
        )}

        {score !== null && (
          <div style={{ textAlign: "center", width: "100%", padding: "1.25rem", borderRadius: "16px", backgroundColor: score >= 75 ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.08)", border: `1px solid ${score >= 75 ? "#10b981" : "#f59e0b"}` }}>
            <div style={{ fontSize: "2rem", fontWeight: "900", color: score >= 75 ? "#047857" : "#b45309" }}>
              {score}%
            </div>
            <p style={{ fontSize: "0.85rem", fontWeight: "700", color: score >= 75 ? "#065f46" : "#92400e", marginTop: "0.25rem" }}>
              {feedback}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
