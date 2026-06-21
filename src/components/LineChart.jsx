"use client";

import { useState } from "react";

export default function LineChart({ reports, isCalistung }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // 1. Sort reports chronologically (oldest to newest)
  const chronological = [...reports]
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(-6); // Only show last 6 modules

  const N = chronological.length;
  if (N === 0) return null;

  // Chart dimensions
  const svgWidth = 540;
  const svgHeight = 260;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Helper to calculate X coordinate
  const getX = (index) => {
    if (N <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + index * (chartWidth / (N - 1));
  };

  // Helper to calculate Y coordinate (scores range 0 to 100)
  const getY = (score) => {
    const clamped = Math.max(0, Math.min(100, score || 0));
    return paddingTop + chartHeight * (1 - clamped / 100);
  };

  // Metric styles
  const metrics = [
    { key: "speaking_score", label: isCalistung ? "Membaca" : "Speaking", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
    { key: "grammar_score", label: isCalistung ? "Menulis" : "Grammar", color: "#f43f5e", bg: "rgba(244, 63, 94, 0.1)" },
    { key: "vocabulary_score", label: isCalistung ? "Berhitung" : "Vocabulary", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.1)" },
    { key: "active_score", label: isCalistung ? "Keaktifan" : "Active", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" }
  ];

  // Helper to construct polyline points
  const getPointsString = (key) => {
    return chronological.map((rep, idx) => `${getX(idx)},${getY(rep[key])}`).join(" ");
  };

  return (
    <div style={{
      position: "relative",
      backgroundColor: "white",
      padding: "2rem 1.5rem",
      borderRadius: "16px",
      border: "1px solid var(--color-gray-150)",
      boxShadow: "var(--shadow-md)",
      width: "100%",
      margin: "0 auto"
    }}>
      <div style={{ marginBottom: "1.25rem" }}>
        <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--color-gray-900)" }}>
          📈 Tren Perkembangan Nilai Siswa
        </h4>
        <p style={{ fontSize: "0.825rem", color: "var(--color-gray-500)", marginTop: "2px" }}>
          Grafik kemajuan kompetensi belajar dari 6 modul terakhir yang diselesaikan.
        </p>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        {metrics.map((m) => (
          <div key={m.key} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", fontWeight: "700" }}>
            <span style={{ width: "12px", height: "4px", borderRadius: "2px", backgroundColor: m.color, display: "inline-block" }} />
            <span style={{ color: "var(--color-gray-600)" }}>{m.label}</span>
          </div>
        ))}
      </div>

      {/* SVG Canvas */}
      <div style={{ position: "relative", width: "100%" }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width="100%"
          height="100%"
          style={{ overflow: "visible", display: "block" }}
        >
          {/* Concentric grid lines (Y-axis levels at 0, 25, 50, 75, 100) */}
          {[0, 25, 50, 75, 100].map((level) => {
            const y = getY(level);
            return (
              <g key={level}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fontWeight="700"
                  fill="#94a3b8"
                >
                  {level}
                </text>
              </g>
            );
          })}

          {/* X-Axis labels (Module Names) */}
          {chronological.map((rep, idx) => {
            const x = getX(idx);
            // Truncate module name if it's too long
            const label = rep.module_name?.length > 10 ? `${rep.module_name.slice(0, 8)}..` : rep.module_name;
            return (
              <text
                key={rep.id || idx}
                x={x}
                y={svgHeight - 12}
                textAnchor="middle"
                fontSize="9"
                fontWeight="800"
                fill="#64748b"
              >
                {label}
              </text>
            );
          })}

          {/* Dotted vertical line on hover */}
          {hoveredIndex !== null && (
            <line
              x1={getX(hoveredIndex)}
              y1={paddingTop}
              x2={getX(hoveredIndex)}
              y2={svgHeight - paddingBottom}
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="3,3"
            />
          )}

          {/* Render lines and area shading */}
          {metrics.map((m) => (
            <polyline
              key={m.key}
              points={getPointsString(m.key)}
              fill="none"
              stroke={m.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          ))}

          {/* Render point markers */}
          {metrics.map((m) =>
            chronological.map((rep, idx) => {
              const x = getX(idx);
              const y = getY(rep[m.key]);
              const isHovered = hoveredIndex === idx;
              return (
                <circle
                  key={`${m.key}-${idx}`}
                  cx={x}
                  cy={y}
                  r={isHovered ? "5.5" : "3.5"}
                  fill={m.color}
                  stroke="white"
                  strokeWidth={isHovered ? "2" : "1.2"}
                  style={{ transition: "all 0.15s ease" }}
                />
              );
            })
          )}

          {/* Transparent interactive hover columns */}
          {chronological.map((rep, idx) => {
            const x = getX(idx);
            const segmentWidth = N <= 1 ? chartWidth : chartWidth / (N - 1);
            return (
              <rect
                key={`hover-${idx}`}
                x={x - segmentWidth / 2}
                y={paddingTop}
                width={segmentWidth}
                height={chartHeight}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Dynamic HTML Tooltip */}
        {hoveredIndex !== null && (
          <div style={{
            position: "absolute",
            left: `${((getX(hoveredIndex) - paddingLeft) / chartWidth) * 90 + 5}%`,
            top: "10px",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(17, 24, 39, 0.95)",
            color: "white",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "0.75rem",
            fontWeight: "bold",
            pointerEvents: "none",
            zIndex: 10,
            boxShadow: "var(--shadow-lg)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            minWidth: "140px"
          }}>
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "4px", marginBottom: "4px", fontSize: "0.8rem", color: "var(--color-yellow)" }}>
              {chronological[hoveredIndex].module_name}
            </div>
            {metrics.map((m) => (
              <div key={m.key} style={{ display: "flex", justifyContent: "space-between", gap: "1.5rem" }}>
                <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: "500" }}>{m.label}:</span>
                <span style={{ color: m.color, fontWeight: "900" }}>
                  {chronological[hoveredIndex][m.key]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
