"use client";

import React, { useState, useEffect } from "react";

interface PromoIntervalCardProps {
  initialInterval?: number;
  onSaveInterval: (sec: number) => Promise<void>;
  saving: boolean;
}

const PRESETS = [3, 4, 5, 7, 10];

const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

export function PromoIntervalCard({
  initialInterval = 5,
  onSaveInterval,
  saving,
}: PromoIntervalCardProps) {
  const [intervalSec, setIntervalSec] = useState<number>(initialInterval);

  useEffect(() => {
    setIntervalSec(initialInterval);
  }, [initialInterval]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Math.max(1, Math.min(60, Number(intervalSec) || 5));
    onSaveInterval(val);
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        border: "1px solid var(--color-gray-200)",
        padding: "1.25rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "var(--color-primary)", display: "inline-flex" }}>
            <ClockIcon />
          </span>
          <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--color-gray-900)" }}>
            Kecepatan Putar Carousel Otomatis
          </h3>
        </div>
        <span style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", fontWeight: 600 }}>
          Saat ini: <strong style={{ color: "var(--color-primary-dark)" }}>{intervalSec} detik</strong> / slide
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        {/* Quick Presets */}
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setIntervalSec(p)}
              style={{
                padding: "0.35rem 0.75rem",
                borderRadius: "8px",
                border: `1px solid ${intervalSec === p ? "var(--color-primary)" : "var(--color-gray-300)"}`,
                backgroundColor: intervalSec === p ? "rgba(33, 108, 126, 0.1)" : "var(--color-gray-50)",
                color: intervalSec === p ? "var(--color-primary-dark)" : "var(--color-gray-700)",
                fontWeight: intervalSec === p ? 800 : 600,
                fontSize: "0.78rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {p} dtk
            </button>
          ))}
        </div>

        {/* Custom Input & Save Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginLeft: "auto" }}>
          <label style={{ fontSize: "0.78rem", color: "var(--color-gray-600)", fontWeight: 600 }}>Custom:</label>
          <input
            type="number"
            min={1}
            max={60}
            value={intervalSec}
            onChange={(e) => setIntervalSec(Math.max(1, Math.min(60, parseInt(e.target.value, 10) || 1)))}
            style={{
              width: "60px",
              padding: "0.35rem 0.5rem",
              borderRadius: "8px",
              border: "1px solid var(--color-gray-300)",
              fontSize: "0.85rem",
              fontWeight: 700,
              textAlign: "center",
              outline: "none",
            }}
          />
          <span style={{ fontSize: "0.78rem", color: "var(--color-gray-500)" }}>detik</span>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "0.45rem 0.95rem",
              backgroundColor: "var(--color-primary, #216c7e)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.8rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              opacity: saving ? 0.7 : 1,
            }}
          >
            <SaveIcon /> {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
