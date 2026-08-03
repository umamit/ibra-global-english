"use client";

import React from "react";
import { Submission } from "../hooks/usePlacementAdmin";

interface CefrDonutChartProps {
  submissions: Submission[];
}

export default function CefrDonutChart({ submissions }: CefrDonutChartProps) {
  if (submissions.length === 0) {
    return (
      <div style={{ margin: "auto", padding: "2rem", color: "var(--color-gray-400)", fontWeight: "600", fontSize: "0.9rem" }}>
        Belum ada data hasil tes penempatan.
      </div>
    );
  }

  const total = submissions.length || 1;
  const countA1 = submissions.filter((s) => s.level === "A1").length;
  const countA2 = submissions.filter((s) => s.level === "A2").length;
  const countB1 = submissions.filter((s) => s.level === "B1").length;
  const countB2 = submissions.filter((s) => s.level === "B2").length;
  const countC1 = submissions.filter((s) => s.level === "C1").length;

  const pA1 = Math.round((countA1 / total) * 100);
  const pA2 = Math.round((countA2 / total) * 100);
  const pB1 = Math.round((countB1 / total) * 100);
  const pB2 = Math.round((countB2 / total) * 100);
  const pC1 = Math.max(0, 100 - pA1 - pA2 - pB1 - pB2);

  const dash = (p: number) => `${(p / 100) * 314} 314`;
  const offset = (sum: number) => -(sum / 100 * 314);

  const levels = [
    { color: "#216c7e", pct: pA1, offset: 0, count: countA1, label: "A1 (Beginner)" },
    { color: "#164d57", pct: pA2, offset: offset(pA1), count: countA2, label: "A2 (Elementary)" },
    { color: "#A68849", pct: pB1, offset: offset(pA1 + pA2), count: countB1, label: "B1 (Intermediate)" },
    { color: "#8bb2bd", pct: pB2, offset: offset(pA1 + pA2 + pB1), count: countB2, label: "B2 (Upper-Int)" },
    { color: "#C5A86B", pct: pC1, offset: offset(pA1 + pA2 + pB1 + pB2), count: countC1, label: "C1 (Advanced)", spanFull: true },
  ];

  return (
    <>
      <div style={{ position: "relative", width: "160px", height: "160px", margin: "1.5rem 0" }}>
        <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="80" cy="80" r="50" fill="none" stroke="#f1f5f9" strokeWidth="16" />
          {levels.map((l) =>
            l.pct > 0 ? (
              <circle key={l.label} cx="80" cy="80" r="50" fill="none" stroke={l.color} strokeWidth="16" strokeDasharray={dash(l.pct)} strokeDashoffset={l.offset} />
            ) : null
          )}
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-primary-dark)", lineHeight: 1 }}>{total}</span>
          <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--color-gray-400)", textTransform: "uppercase", marginTop: "2px" }}>Siswa</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1rem", width: "100%", fontSize: "0.8rem", fontWeight: "700", borderTop: "1px solid var(--color-gray-100)", paddingTop: "0.75rem" }}>
        {levels.map((l) => (
          <div key={l.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gridColumn: l.spanFull ? "span 2" : undefined }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: l.color, display: "inline-block" }} />
              <span style={{ color: "var(--color-gray-600)" }}>{l.label}</span>
            </div>
            <span style={{ color: "var(--color-gray-800)" }}>{l.count} ({l.pct}%)</span>
          </div>
        ))}
      </div>
    </>
  );
}
