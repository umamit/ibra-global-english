"use client";

import React, { useState } from "react";
import FinanceAiInsights from "./FinanceAiInsights";
import FinanceDonutChart from "./FinanceDonutChart";
import FinanceTrendChart from "./FinanceTrendChart";
import { useFinanceAnalyticsData, Student, Payment, TooltipState, ChartDataPoint } from "../hooks/useFinanceAnalyticsData";

interface FinanceAnalyticsProps { students: Student[]; allPayments: Payment[]; sppPrices: Record<string, number>; formatRupiah: (val: number) => string; selectedMonth: string; loading: boolean; }

export default function FinanceAnalytics({ students, allPayments, sppPrices, formatRupiah, selectedMonth, loading }: FinanceAnalyticsProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({ show: false, x: 0, y: 0, monthName: "", expected: 0, collected: 0 });
  const { getMonthShortName, chartData, activeExpected, activeCollected, activePendingCount, activePaidCount, activeUnpaidCount, collectionRate, outstanding, averageSPP, programBreakdown, topProgram, maxVal } = useFinanceAnalyticsData(students, allPayments, sppPrices, selectedMonth);

  if (loading) return (
    <div className="portal-card" style={{ padding: "4rem", textAlign: "center" }}>
      <svg style={{ animation: "spin 1s linear infinite", width: "40px", height: "40px", marginBottom: "1rem", color: "var(--color-primary)", display: "block", marginInline: "auto" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
      <p style={{ fontWeight: "600", color: "var(--color-gray-500)" }}>Memproses data analitik...</p>
    </div>
  );

  const scaleY = (val: number) => 220 - (val / maxVal) * 180;
  const fmtShort = (val: number) => val >= 1000000 ? `Rp ${(val / 1000000).toFixed(1)}jt` : val >= 1000 ? `Rp ${Math.round(val / 1000)}rb` : `Rp ${val}`;
  const onHover = (e: React.MouseEvent<SVGRectElement>, d: ChartDataPoint) => { const rect = (e.target as SVGRectElement).getBoundingClientRect(); const svg = (e.target as SVGRectElement).ownerSVGElement!.getBoundingClientRect(); setTooltip({ show: true, x: rect.left - svg.left + rect.width / 2, y: rect.top - svg.top - 8, monthName: d.monthName, expected: d.expected, collected: d.collected }); };

  const totalStudents = students.length || 1;
  const pPaid = Math.round((activePaidCount / totalStudents) * 100);
  const pPending = Math.round((activePendingCount / totalStudents) * 100);
  const pUnpaid = Math.max(0, 100 - pPaid - pPending);

  const execCards = [
    { label: "Rasio Kolektabilitas", val: `${collectionRate}%`, sub: "Target pencapaian dana masuk bulan ini.", border: "var(--color-primary)", bg: "rgba(33, 108, 126, 0.04)", color: "var(--color-primary-dark)" },
    { label: "Total Piutang SPP", val: formatRupiah(outstanding), sub: "Akumulasi tunggakan siswa belum lunas.", border: "#ef4444", bg: "rgba(239, 68, 68, 0.04)", color: "#991b1b" },
    { label: "Rata-rata SPP Murid", val: formatRupiah(averageSPP), sub: "Rata-rata kontribusi per siswa terbayar.", border: "var(--color-accent)", bg: "rgba(166, 136, 73, 0.04)", color: "#92400e" },
    { label: "Top Program Revenue", val: topProgram, sub: "Program dengan perolehan kas lunas tertinggi.", border: "#0f172a", bg: "rgba(15, 23, 42, 0.04)", color: "#0f172a" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        {execCards.map(c => (
          <div key={c.label} className="portal-card" style={{ padding: "1.25rem", borderLeft: `4px solid ${c.border}`, background: c.bg }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>{c.label}</span>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "900", color: c.color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: "0.35rem" }}>{c.val}</h2>
            <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>{c.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.5rem" }} className="report-detail-layout">
        <div className="portal-card" style={{ padding: "1.5rem", position: "relative" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.5rem" }}>Tren Pendapatan Bulanan (6 Bulan Terakhir)</h3>
          <div style={{ position: "relative", width: "100%" }}>
            <svg width="100%" height="260px" viewBox="0 0 540 260" style={{ overflow: "visible" }}>
              {[0, 0.25, 0.5, 0.75, 1].map(ratio => { const val = maxVal * ratio; const y = scaleY(val); return (<g key={ratio}><line x1="60" y1={y} x2="520" y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4,4" /><text x="50" y={y + 3} textAnchor="end" fontSize="9" fontWeight="600" fill="#94a3b8">{fmtShort(val)}</text></g>); })}
              <line x1="60" y1="220" x2="520" y2="220" stroke="#cbd5e1" strokeWidth="1.5" />
              {chartData.map((d, i) => { const xBase = 60 + i * 75; const yE = scaleY(d.expected); const yC = scaleY(d.collected); const isCurr = d.month === selectedMonth; return (<g key={d.month}><rect x={xBase + 10} y={yE} width="20" height={Math.max(0, 220 - yE)} fill="rgba(33, 108, 126, 0.12)" rx="4" style={{ transition: "all 0.3s ease" }} /><rect x={xBase + 32} y={yC} width="20" height={Math.max(0, 220 - yC)} fill={isCurr ? "var(--color-accent)" : "var(--color-primary)"} rx="4" style={{ cursor: "pointer", transition: "all 0.3s ease" }} onMouseEnter={(e) => onHover(e, d)} onMouseLeave={() => setTooltip(prev => ({ ...prev, show: false }))} /><text x={xBase + 31} y="240" textAnchor="middle" fontSize="10" fontWeight="800" fill="#64748b">{d.monthShortName}</text></g>); })}
            </svg>
            {tooltip.show && (
              <div style={{ position: "absolute", left: `${tooltip.x}px`, top: `${tooltip.y}px`, transform: "translate(-50%, -100%)", backgroundColor: "rgba(15, 23, 42, 0.95)", color: "white", padding: "8px 12px", borderRadius: "8px", fontSize: "0.75rem", pointerEvents: "none", zIndex: 100, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)", display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={{ fontWeight: "800", color: "#f8fafc", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: "2px", marginBottom: "2px" }}>{tooltip.monthName}</span>
                <span style={{ color: "#cbd5e1" }}>Proyeksi: <strong style={{ color: "white" }}>{formatRupiah(tooltip.expected)}</strong></span>
                <span style={{ color: "#cbd5e1" }}>Terkumpul: <strong style={{ color: "#34d399" }}>{formatRupiah(tooltip.collected)}</strong></span>
                <span style={{ color: "#94a3b8", fontSize: "0.7rem", marginTop: "2px" }}>Efektivitas: {tooltip.expected > 0 ? Math.round((tooltip.collected / tooltip.expected) * 100) : 0}%</span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginTop: "1rem", fontSize: "0.8rem", fontWeight: "700" }}>
            {[{ bg: "rgba(33, 108, 126, 0.15)", label: "Proyeksi Target SPP" }, { bg: "var(--color-primary)", label: "Realisasi Lunas" }, { bg: "var(--color-accent)", label: `Bulan Aktif (${getMonthShortName(selectedMonth)})` }].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: l.bg }} /><span style={{ color: "var(--color-gray-500)" }}>{l.label}</span></div>
            ))}
          </div>
        </div>
        <FinanceDonutChart pPaid={pPaid} pPending={pPending} pUnpaid={pUnpaid} collectionRate={collectionRate} activePaidCount={activePaidCount} activePendingCount={activePendingCount} activeUnpaidCount={activeUnpaidCount} />
      </div>

      <div className="portal-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.5rem" }}>Kontribusi Pendapatan per Program Studi</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {programBreakdown.map(prog => { const ratio = Math.round((prog.collected / (prog.expected || 1)) * 100); return (<div key={prog.name} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", fontSize: "0.9rem", fontWeight: "800" }}><span style={{ color: "var(--color-gray-800)" }}>{prog.name}</span><div style={{ display: "flex", gap: "1rem", color: "var(--color-gray-500)" }}><span>Realisasi: <strong style={{ color: "var(--color-primary-dark)" }}>{formatRupiah(prog.collected)}</strong></span><span>Target: <strong>{formatRupiah(prog.expected)}</strong></span></div></div><div style={{ width: "100%", height: "14px", backgroundColor: "#f1f5f9", borderRadius: "10px", overflow: "hidden", position: "relative" }}><div style={{ width: `${Math.min(100, ratio)}%`, height: "100%", backgroundColor: prog.color, borderRadius: "10px", transition: "width 0.5s ease" }} /><span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.65rem", fontWeight: "900", color: ratio > 80 ? "white" : "var(--color-gray-600)" }}>{ratio}% Kolektabilitas</span></div></div>); })}
        </div>
      </div>

      <FinanceTrendChart
        data={chartData.map((d) => ({
          month: d.monthShortName,
          total: d.collected,
          verifiedCount: d.collected > 0 ? 1 : 0,
        }))}
      />

      <FinanceAiInsights selectedMonth={selectedMonth} activeExpected={activeExpected} activeCollected={activeCollected} outstanding={outstanding} collectionRate={collectionRate} activePaidCount={activePaidCount} activeUnpaidCount={activeUnpaidCount} chartData={chartData} programBreakdown={programBreakdown} formatRupiah={formatRupiah} />
    </div>
  );
}
