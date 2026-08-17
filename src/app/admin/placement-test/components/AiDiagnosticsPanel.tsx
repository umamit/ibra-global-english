"use client";

import React from "react";

interface AiDiagnosticsPanelProps {
  aiConnectionStatus: "idle" | "testing" | "success" | "failed";
  aiDiagnosticMessage: string;
  onTest: () => void;
}

export default function AiDiagnosticsPanel({ aiConnectionStatus, aiDiagnosticMessage, onTest }: AiDiagnosticsPanelProps) {
  const statusColor = aiConnectionStatus === "success"
    ? { bg: "rgba(33, 108, 126, 0.1)", text: "var(--color-primary)" }
    : aiConnectionStatus === "failed"
      ? { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444" }
      : { bg: "var(--color-gray-100)", text: "var(--color-gray-500)" };

  const statusLabel = { success: "CONNECTED", failed: "DISCONNECTED", testing: "TESTING...", idle: "IDLE" }[aiConnectionStatus];

  return (
    <div className="portal-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
            <path d="M12 12L2.5 7.5"/>
          </svg>
          Status Koneksi &amp; Diagnostik Groq AI
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", marginBottom: "1.5rem" }}>
          Verifikasi integrasi generator AI untuk tes penempatan secara real-time.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            {
              label: "Status API",
              value: <span style={{ padding: "0.25rem 0.75rem", borderRadius: "50px", fontSize: "0.75rem", fontWeight: "800", backgroundColor: statusColor.bg, color: statusColor.text }}>{statusLabel}</span>
            },
            {
              label: "Model AI Aktif",
              value: <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-gray-600)", fontFamily: "monospace" }}>openai/gpt-oss-120b</span>
            },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", backgroundColor: "var(--color-gray-50)", borderRadius: "8px", border: "1px solid var(--color-gray-150)" }}>
              <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--color-gray-700)" }}>{label}</span>
              {value}
            </div>
          ))}
        </div>

        {aiDiagnosticMessage && (
          <div style={{ padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600", lineHeight: "1.5", marginBottom: "1.5rem", backgroundColor: aiConnectionStatus === "success" ? "rgba(33, 108, 126, 0.05)" : "rgba(239, 68, 68, 0.05)", color: aiConnectionStatus === "success" ? "var(--color-primary-dark)" : "#991b1b", border: aiConnectionStatus === "success" ? "1px solid rgba(33, 108, 126, 0.1)" : "1px solid rgba(239, 68, 68, 0.1)" }}>
            {aiDiagnosticMessage}
          </div>
        )}
      </div>

      <button className="btn-portal-outline" style={{ width: "100%", padding: "0.85rem", fontWeight: "800", borderRadius: "8px" }} onClick={onTest} disabled={aiConnectionStatus === "testing"}>
        {aiConnectionStatus === "testing" ? "Menguji Koneksi..." : "Cek Koneksi Groq AI"}
      </button>
    </div>
  );
}
