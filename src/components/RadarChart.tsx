"use client";

import { useState } from "react";

export default function RadarChart({ speaking, grammar, vocabulary, active, isCalistung }: any) {
  // Center (120, 120), Radius 80
  const cx = 120;
  const cy = 120;
  const r = 80;

  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, label: "", score: 0 });

  // Coordinate calculations:
  // 1. Speaking: Up (0, -1) -> (cx, cy - r * score/100)
  // 2. Grammar: Right (1, 0) -> (cx + r * score/100, cy)
  // 3. Vocabulary: Down (0, 1) -> (cx, cy + r * score/100)
  // 4. Keaktifan: Left (-1, 0) -> (cx - r * score/100, cy)
  const pSpeaking = { x: cx, y: cy - r * (speaking / 100) };
  const pGrammar = { x: cx + r * (grammar / 100), y: cy };
  const pVocabulary = { x: cx, y: cy + r * (vocabulary / 100) };
  const pActive = { x: cx - r * (active / 100), y: cy };

  const polygonPoints = `${pSpeaking.x},${pSpeaking.y} ${pGrammar.x},${pGrammar.y} ${pVocabulary.x},${pVocabulary.y} ${pActive.x},${pActive.y}`;

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
        {/* Concentric reference grid levels at 25%, 50%, 75%, 100% */}
        {[25, 50, 75, 100].map((percent) => {
          const gridR = r * (percent / 100);
          return (
            <polygon
              key={percent}
              points={`${cx},${cy - gridR} ${cx + gridR},${cy} ${cx},${cy + gridR} ${cx - gridR},${cy}`}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={percent < 100 ? "3,3" : "none"}
            />
          );
        })}

        {/* Axis lines */}
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#cbd5e1" strokeWidth="1.5" />

        {/* Axis Labels */}
        <text x={cx} y={cy - r - 8} textAnchor="middle" fontSize="9" fontWeight="800" fill="#475569">{isCalistung ? "MEMBACA" : "SPEAKING"}</text>
        <text x={cx + r + 8} y={cy + 3} textAnchor="start" fontSize="9" fontWeight="800" fill="#475569">{isCalistung ? "MENULIS" : "GRAMMAR"}</text>
        <text x={cx} y={cy + r + 15} textAnchor="middle" fontSize="9" fontWeight="800" fill="#475569">{isCalistung ? "BERHITUNG" : "VOCABULARY"}</text>
        <text x={cx - r - 8} y={cy + 3} textAnchor="end" fontSize="9" fontWeight="800" fill="#475569">{isCalistung ? "KEAKTIFAN" : "ACTIVE"}</text>

        {/* Score Values */}
        <text x={cx + 5} y={cy - r + 10} fontSize="7" fontWeight="700" fill="#94a3b8">100</text>
        <text x={cx + 5} y={cy - r * 0.5 + 4} fontSize="7" fontWeight="700" fill="#94a3b8">50</text>

        {/* Filled polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(33, 108, 126, 0.25)"
          stroke="#216c7e"
          strokeWidth="2.5"
        />

        {/* Data points markers */}
        <circle 
          cx={pSpeaking.x} 
          cy={pSpeaking.y} 
          r="5.5" 
          fill="#216c7e" 
          stroke="white" 
          strokeWidth="1.5" 
          style={{ cursor: "pointer", transition: "all 0.2s ease" }}
          onMouseEnter={() => handleMouseEnter(pSpeaking.x, pSpeaking.y, isCalistung ? "Membaca" : "Speaking", speaking)}
          onMouseLeave={hideTooltip}
        />
        <circle 
          cx={pGrammar.x} 
          cy={pGrammar.y} 
          r="5.5" 
          fill="#216c7e" 
          stroke="white" 
          strokeWidth="1.5" 
          style={{ cursor: "pointer", transition: "all 0.2s ease" }}
          onMouseEnter={() => handleMouseEnter(pGrammar.x, pGrammar.y, isCalistung ? "Menulis" : "Grammar", grammar)}
          onMouseLeave={hideTooltip}
        />
        <circle 
          cx={pVocabulary.x} 
          cy={pVocabulary.y} 
          r="5.5" 
          fill="#216c7e" 
          stroke="white" 
          strokeWidth="1.5" 
          style={{ cursor: "pointer", transition: "all 0.2s ease" }}
          onMouseEnter={() => handleMouseEnter(pVocabulary.x, pVocabulary.y, isCalistung ? "Berhitung" : "Vocabulary", vocabulary)}
          onMouseLeave={hideTooltip}
        />
        <circle 
          cx={pActive.x} 
          cy={pActive.y} 
          r="5.5" 
          fill="#216c7e" 
          stroke="white" 
          strokeWidth="1.5" 
          style={{ cursor: "pointer", transition: "all 0.2s ease" }}
          onMouseEnter={() => handleMouseEnter(pActive.x, pActive.y, isCalistung ? "Keaktifan" : "Active", active)}
          onMouseLeave={hideTooltip}
        />
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
