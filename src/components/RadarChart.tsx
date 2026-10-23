"use client";

import { useState } from "react";

export default function RadarChart({ speaking, grammar, listening, vocabulary, active, isCalistung, isMath }: any) {
  const cx = 120;
  const cy = 120;
  const r = 80;
  const isEnglish = !isMath && !isCalistung;

  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, label: "", score: 0 });

  const items = isMath
    ? [
        { short: "HITUNG", tip: "Operasi Hitung", score: speaking || 0 },
        { short: "LOGIKA", tip: "Penalaran & Logika", score: grammar || 0 },
        { short: "TELITI", tip: "Ketelitian", score: vocabulary || 0 },
        { short: "AKTIF", tip: "Keaktifan", score: active || 0 },
      ]
    : isCalistung
    ? [
        { short: "MEMBACA", tip: "Membaca", score: speaking || 0 },
        { short: "MENULIS", tip: "Menulis", score: grammar || 0 },
        { short: "BERHITUNG", tip: "Berhitung", score: vocabulary || 0 },
        { short: "KEAKTIFAN", tip: "Keaktifan", score: active || 0 },
      ]
    : [
        { short: "SPEAKING", tip: "Speaking", score: speaking || 0 },
        { short: "GRAMMAR", tip: "Grammar", score: grammar || 0 },
        { short: "LISTENING", tip: "Listening", score: listening ?? speaking ?? 0 },
        { short: "VOCABULARY", tip: "Vocabulary", score: vocabulary || 0 },
        { short: "KEAKTIFAN", tip: "Keaktifan", score: active || 0 },
      ];

  const count = items.length;
  const getPoint = (idx: number, radius: number) => {
    const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / count;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };

  const dataPoints = items.map((item, idx) => ({
    ...item,
    ...getPoint(idx, r * (Math.max(0, Math.min(100, item.score)) / 100)),
    axisEnd: getPoint(idx, r),
    labelPos: getPoint(idx, r + (isEnglish ? 16 : 12)),
  }));

  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const handleMouseEnter = (x: number, y: number, label: string, score: number) => {
    setTooltip({ show: true, x, y: y - 12, label, score });
  };

  const hideTooltip = () => {
    setTooltip({ show: false, x: 0, y: 0, label: "", score: 0 });
  };

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", padding: "1.5rem", backgroundColor: "white", borderRadius: "12px", border: "1px solid var(--color-gray-150)", boxShadow: "var(--shadow-sm)", maxWidth: "300px", margin: "0 auto" }}>
      <p style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--color-primary-dark)", textTransform: "uppercase", marginBottom: "1rem" }}>Visualisasi Performa</p>
      
      <svg width="240" height="240" viewBox="0 0 240 240" style={{ overflow: "visible" }}>
        {[25, 50, 75, 100].map((percent) => {
          const gridR = r * (percent / 100);
          const pts = items.map((_, idx) => {
            const pt = getPoint(idx, gridR);
            return `${pt.x},${pt.y}`;
          }).join(" ");
          return (
            <polygon
              key={percent}
              points={pts}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={percent < 100 ? "3,3" : "none"}
            />
          );
        })}

        {dataPoints.map((p, idx) => (
          <line key={idx} x1={cx} y1={cy} x2={p.axisEnd.x} y2={p.axisEnd.y} stroke="#cbd5e1" strokeWidth="1.5" />
        ))}

        {dataPoints.map((p, idx) => {
          const dx = p.labelPos.x - cx;
          const anchor = Math.abs(dx) < 10 ? "middle" : dx > 0 ? "start" : "end";
          return (
            <text key={idx} x={p.labelPos.x} y={p.labelPos.y + 3} textAnchor={anchor} fontSize="8.5" fontWeight="800" fill="#475569">
              {p.short}
            </text>
          );
        })}

        <text x={cx + 5} y={cy - r + 10} fontSize="7" fontWeight="700" fill="#94a3b8">100</text>
        <text x={cx + 5} y={cy - r * 0.5 + 4} fontSize="7" fontWeight="700" fill="#94a3b8">50</text>

        <polygon
          points={polygonPoints}
          fill="rgba(33, 108, 126, 0.25)"
          stroke="#216c7e"
          strokeWidth="2.5"
        />

        {dataPoints.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r="5.5"
            fill="#216c7e"
            stroke="white"
            strokeWidth="1.5"
            style={{ cursor: "pointer", transition: "all 0.2s ease" }}
            onMouseEnter={() => handleMouseEnter(p.x, p.y, p.tip, p.score)}
            onMouseLeave={hideTooltip}
          />
        ))}
      </svg>

      {/* Floating Tooltip */}
      {tooltip.show && (
        <div style={{
          position: "absolute",
          left: `${tooltip.x}px`,
          top: `${tooltip.y + 40}px`,
          transform: "translate(-50%, -100%)",
          backgroundColor: "rgba(17, 24, 39, 0.95)",
          color: "white",
          padding: "6px 10px",
          borderRadius: "6px",
          fontSize: "0.75rem",
          fontWeight: "bold",
          pointerEvents: "none",
          zIndex: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          whiteSpace: "nowrap",
          border: "1px solid rgba(255,255,255,0.15)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px"
        }}>
          <span>{tooltip.label}</span>
          <span style={{ color: "var(--color-yellow)", fontSize: "0.85rem", fontWeight: "900" }}>{tooltip.score} / 100</span>
        </div>
      )}
    </div>
  );
}
