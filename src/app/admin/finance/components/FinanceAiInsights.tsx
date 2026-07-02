"use client";

import React, { useState } from "react";

interface ChartDataPoint {
  month: string;
  monthName: string;
  monthShortName: string;
  expected: number;
  collected: number;
}

interface ProgramEntry {
  name: string;
  color: string;
  bg: string;
  collected: number;
  expected: number;
}

interface FinanceAiInsightsProps {
  selectedMonth: string;
  activeExpected: number;
  activeCollected: number;
  outstanding: number;
  collectionRate: number;
  activePaidCount: number;
  activeUnpaidCount: number;
  chartData: ChartDataPoint[];
  programBreakdown: ProgramEntry[];
  formatRupiah: (val: number) => string;
}

export default function FinanceAiInsights({
  selectedMonth,
  activeExpected,
  activeCollected,
  outstanding,
  collectionRate,
  activePaidCount,
  activeUnpaidCount,
  chartData,
  programBreakdown,
  formatRupiah
}: FinanceAiInsightsProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [insightText, setInsightText] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleGenerateInsights = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "finance-projection",
          payload: {
            selectedMonth,
            activeExpected,
            activeCollected,
            outstanding,
            collectionRate,
            activePaidCount,
            activeUnpaidCount,
            chartData: chartData.map(d => ({
              month: d.monthName,
              expected: d.expected,
              collected: d.collected
            })),
            programBreakdown: programBreakdown.map(p => ({
              name: p.name,
              expected: p.expected,
              collected: p.collected
            }))
          }
        })
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setInsightText(data.reply);
      } else {
        setErrorMsg(data.error || "Gagal menghasilkan analisis dari server AI.");
      }
    } catch {
      setErrorMsg("Gagal menghubungi server AI. Pastikan koneksi internet aktif.");
    } finally {
      setLoading(false);
    }
  };

  // Convert markdown-like response headers/bullet points to readable HTML blocks manually to avoid installing md libraries (zero dependency bloat rule #5)
  const renderFormattedInsights = (text: string) => {
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        return (
          <h4 key={idx} style={{ color: "var(--color-primary-dark)", fontSize: "1rem", fontWeight: "800", marginTop: "1rem", marginBottom: "0.5rem" }}>
            {trimmed.replace(/\*\*/g, "")}
          </h4>
        );
      }
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={idx} style={{ color: "var(--color-primary-dark)", fontSize: "1rem", fontWeight: "800", marginTop: "1rem", marginBottom: "0.5rem" }}>
            {trimmed.replace(/###/g, "").trim()}
          </h4>
        );
      }
      if (trimmed.startsWith("1.") || trimmed.startsWith("2.") || trimmed.startsWith("3.")) {
        return (
          <h4 key={idx} style={{ color: "var(--color-gray-900)", fontSize: "0.95rem", fontWeight: "800", marginTop: "0.75rem", marginBottom: "0.25rem" }}>
            {trimmed}
          </h4>
        );
      }
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return (
          <li key={idx} style={{ marginLeft: "1.25rem", listStyleType: "disc", fontSize: "0.85rem", color: "var(--color-gray-700)", lineHeight: "1.5", marginBottom: "0.25rem" }}>
            {trimmed.substring(1).trim()}
          </li>
        );
      }
      if (trimmed === "") {
        return <div key={idx} style={{ height: "0.5rem" }} />;
      }
      return (
        <p key={idx} style={{ fontSize: "0.85rem", color: "var(--color-gray-700)", lineHeight: "1.5", margin: "0 0 0.5rem" }}>
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="portal-card" style={{
      padding: "1.75rem",
      background: "linear-gradient(135deg, rgba(33, 108, 126, 0.05) 0%, rgba(166, 136, 73, 0.05) 100%)",
      border: "1px solid rgba(33, 108, 126, 0.15)",
      borderRadius: "12px",
      marginTop: "1rem"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--color-gray-900)", margin: "0 0 0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>✨</span> Proyeksi Keuangan & Insights AI
          </h3>
          <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", margin: 0 }}>
            Analisis kecerdasan buatan berbasis realisasi data tagihan SPP bulan {selectedMonth}
          </p>
        </div>
        <button
          onClick={handleGenerateInsights}
          disabled={loading}
          className="btn-portal-primary"
          style={{ padding: "0.5rem 1.25rem", fontSize: "0.8rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          {loading ? (
            <>
              <svg style={{ animation: "spin 1s linear infinite", width: "12px", height: "12px" }} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span>Menganalisis...</span>
            </>
          ) : (
            <>
              <span>🤖 Hasilkan Analisis</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div style={{ padding: "1rem", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", color: "#b91c1c", fontSize: "0.85rem", margin: "1rem 0" }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {insightText ? (
        <div className="no-print" style={{
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(4px)",
          padding: "1.25rem",
          borderRadius: "8px",
          border: "1px solid rgba(33, 108, 126, 0.1)",
          boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.02)",
          marginTop: "1.25rem"
        }}>
          {renderFormattedInsights(insightText)}
        </div>
      ) : (
        !loading && (
          <div style={{ textAlign: "center", padding: "1.5rem 0", color: "var(--color-gray-400)", fontSize: "0.85rem" }}>
            Klik tombol di atas untuk menyusun rekomendasi kolektabilitas SPP secara real-time.
          </div>
        )
      )}
    </div>
  );
}
