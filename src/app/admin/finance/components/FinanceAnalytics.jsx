"use client";

import { useState } from "react";
import { getMonthName } from "../../utils";

export default function FinanceAnalytics({
  students,
  allPayments,
  sppPrices,
  formatRupiah,
  selectedMonth,
  loading
}) {
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, monthName: "", expected: 0, collected: 0 });

  if (loading) {
    return (
      <div className="portal-card" style={{ padding: "4rem", textAlign: "center" }}>
        <svg style={{ animation: "spin 1s linear infinite", width: "40px", height: "40px", marginBottom: "1rem", color: "var(--color-primary)", display: "block", marginInline: "auto" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <p style={{ fontWeight: "600", color: "var(--color-gray-500)" }}>Memproses data analitik...</p>
      </div>
    );
  }

  const getMonthShortName = (ym) => {
    if (!ym) return "";
    const name = getMonthName(ym);
    const [month, year] = name.split(" ");
    return `${month.slice(0, 3)} ${year.slice(2)}`;
  };

  // Get past 6 months including selectedMonth
  const past6Months = (() => {
    if (!selectedMonth) return [];
    const [y, m] = selectedMonth.split("-").map(Number);
    const list = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(y, m - 1 - i, 1);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      list.push(`${yyyy}-${mm}`);
    }
    return list;
  })();

  const chartData = past6Months.map(month => {
    const expected = students.reduce((sum, s) => {
      const p = allPayments.find(pay => pay.student_id === s.id && pay.month === month);
      if (p) return sum + (parseInt(p.amount) || sppPrices[s.program] || 300000);
      return sum + (sppPrices[s.program] || 300000);
    }, 0);

    const collected = allPayments
      .filter(p => p.month === month && p.status === "lunas")
      .reduce((sum, p) => sum + (parseInt(p.amount) || 0), 0);

    return {
      month,
      monthName: getMonthName(month),
      monthShortName: getMonthShortName(month),
      expected,
      collected
    };
  });

  // Calculate stats for selectedMonth
  const activeExpected = students.reduce((sum, s) => {
    const p = allPayments.find(pay => pay.student_id === s.id && pay.month === selectedMonth);
    if (p) return sum + (parseInt(p.amount) || sppPrices[s.program] || 300000);
    return sum + (sppPrices[s.program] || 300000);
  }, 0);

  const activeCollected = allPayments
    .filter(p => p.month === selectedMonth && p.status === "lunas")
    .reduce((sum, p) => sum + (parseInt(p.amount) || 0), 0);

  const activePendingCount = allPayments.filter(p => p.month === selectedMonth && p.status === "menunggu_konfirmasi").length;
  const activePaidCount = allPayments.filter(p => p.month === selectedMonth && p.status === "lunas").length;
  const activeUnpaidCount = students.length - activePaidCount - activePendingCount;

  const collectionRate = activeExpected > 0 ? Math.round((activeCollected / activeExpected) * 100) : 0;
  const outstanding = activeExpected - activeCollected;
  const averageSPP = activePaidCount > 0 ? Math.round(activeCollected / activePaidCount) : 0;

  // Program contributions
  const programBreakdown = [
    { name: "Kids Program", color: "#216c7e", bg: "rgba(33, 108, 126, 0.1)" },
    { name: "Teens Program", color: "#A68849", bg: "rgba(166, 136, 73, 0.1)" },
    { name: "Fun Calistung", color: "#0f172a", bg: "rgba(15, 23, 42, 0.1)" }
  ].map(prog => {
    const progStudents = students.filter(s => s.program === prog.name);
    const collected = allPayments
      .filter(p => p.month === selectedMonth && p.status === "lunas" && progStudents.some(s => s.id === p.student_id))
      .reduce((sum, p) => sum + (parseInt(p.amount) || 0), 0);
    const expected = progStudents.reduce((sum, s) => {
      const p = allPayments.find(pay => pay.student_id === s.id && pay.month === selectedMonth);
      if (p) return sum + (parseInt(p.amount) || sppPrices[s.program] || 300000);
      return sum + (sppPrices[s.program] || 300000);
    }, 0);
    return { ...prog, collected, expected };
  });

  const topProgram = (() => {
    if (programBreakdown.every(p => p.collected === 0)) return "-";
    const sorted = [...programBreakdown].sort((a, b) => b.collected - a.collected);
    return sorted[0].name;
  })();

  const maxVal = Math.max(...chartData.map(d => Math.max(d.expected, d.collected, 1000000)));
  const scaleY = (val) => 220 - (val / maxVal) * 180;

  const formatShortRupiah = (val) => {
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}jt`;
    if (val >= 1000) return `Rp ${Math.round(val / 1000)}rb`;
    return `Rp ${val}`;
  };

  const handleHoverBar = (e, d) => {
    const rect = e.target.getBoundingClientRect();
    const container = e.target.ownerSVGElement.getBoundingClientRect();
    setTooltip({
      show: true,
      x: rect.left - container.left + rect.width / 2,
      y: rect.top - container.top - 8,
      monthName: d.monthName,
      expected: d.expected,
      collected: d.collected
    });
  };

  const handleUnhoverBar = () => {
    setTooltip(prev => ({ ...prev, show: false }));
  };

  // Donut chart status breakdown calculation
  const totalStudents = students.length || 1;
  const pPaid = Math.round((activePaidCount / totalStudents) * 100);
  const pPending = Math.round((activePendingCount / totalStudents) * 100);
  const pUnpaid = Math.max(0, 100 - pPaid - pPending);

  const strokeDashLunas = `${(pPaid / 100) * 314} 314`;
  const strokeDashPending = `${(pPending / 100) * 314} 314`;
  const strokeDashUnpaid = `${(pUnpaid / 100) * 314} 314`;

  const offsetPending = -((pPaid / 100) * 314);
  const offsetUnpaid = -(((pPaid + pPending) / 100) * 314);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      
      {/* Metrik Eksekutif */}
      <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        
        {/* Kolektabilitas */}
        <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--color-primary)", background: "rgba(33, 108, 126, 0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Rasio Kolektabilitas</span>
            <span style={{ fontSize: "1.25rem" }}>📈</span>
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{collectionRate}%</h2>
          <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>Target pencapaian dana masuk bulan ini.</p>
        </div>

        {/* Piutang Tertunggak */}
        <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid #ef4444", background: "rgba(239, 68, 68, 0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Total Piutang SPP</span>
            <span style={{ fontSize: "1.25rem" }}>💸</span>
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: "900", color: "#991b1b" }}>{formatRupiah(outstanding)}</h2>
          <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>Akumulasi tunggakan siswa belum lunas.</p>
        </div>

        {/* Rerata Pembayaran */}
        <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--color-accent)", background: "rgba(166, 136, 73, 0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Rata-rata SPP Murid</span>
            <span style={{ fontSize: "1.25rem" }}>🧑‍🎓</span>
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: "900", color: "#92400e" }}>{formatRupiah(averageSPP)}</h2>
          <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>Rata-rata kontribusi per siswa terbayar.</p>
        </div>

        {/* Program Unggulan Finansial */}
        <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid #0f172a", background: "rgba(15, 23, 42, 0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Top Program Revenue</span>
            <span style={{ fontSize: "1.25rem" }}>💎</span>
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: "0.35rem" }}>{topProgram}</h2>
          <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>Program dengan perolehan kas lunas tertinggi.</p>
        </div>

      </div>

      {/* Bar Trend & Donut Breakdown Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.5rem" }} className="report-detail-layout">
        
        {/* Tren Pendapatan 6 Bulan */}
        <div className="portal-card" style={{ padding: "1.5rem", position: "relative" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.5rem" }}>
            📈 Tren Pendapatan Bulanan (6 Bulan Terakhir)
          </h3>

          <div style={{ position: "relative", width: "100%" }}>
            <svg width="100%" height="260px" viewBox="0 0 540 260" style={{ overflow: "visible" }}>
              {/* Gridlines & Y labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const val = maxVal * ratio;
                const y = scaleY(val);
                return (
                  <g key={ratio}>
                    <line x1="60" y1={y} x2="520" y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4,4" />
                    <text x="50" y={y + 3} textAnchor="end" fontSize="9" fontWeight="600" fill="#94a3b8">
                      {formatShortRupiah(val)}
                    </text>
                  </g>
                );
              })}

              {/* X axis line */}
              <line x1="60" y1="220" x2="520" y2="220" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Bars */}
              {chartData.map((d, i) => {
                const xBase = 60 + i * 75;
                const yExpected = scaleY(d.expected);
                const yCollected = scaleY(d.collected);
                const isCurrent = d.month === selectedMonth;

                return (
                  <g key={d.month}>
                    {/* Expected bar */}
                    <rect
                      x={xBase + 10}
                      y={yExpected}
                      width="20"
                      height={Math.max(0, 220 - yExpected)}
                      fill="rgba(33, 108, 126, 0.12)"
                      rx="4"
                      style={{ transition: "all 0.3s ease" }}
                    />
                    {/* Collected bar */}
                    <rect
                      x={xBase + 32}
                      y={yCollected}
                      width="20"
                      height={Math.max(0, 220 - yCollected)}
                      fill={isCurrent ? "var(--color-accent)" : "var(--color-primary)"}
                      rx="4"
                      style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                      onMouseEnter={(e) => handleHoverBar(e, d)}
                      onMouseLeave={handleUnhoverBar}
                    />
                    {/* X labels */}
                    <text x={xBase + 31} y="240" textAnchor="middle" fontSize="10" fontWeight="800" fill="#64748b">
                      {d.monthShortName}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Tooltip Overlay */}
            {tooltip.show && (
              <div style={{
                position: "absolute",
                left: `${tooltip.x}px`,
                top: `${tooltip.y}px`,
                transform: "translate(-50%, -100%)",
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                color: "white",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "0.75rem",
                pointerEvents: "none",
                zIndex: 100,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                display: "flex",
                flexDirection: "column",
                gap: "3px"
              }}>
                <span style={{ fontWeight: "800", color: "#f8fafc", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: "2px", marginBottom: "2px" }}>
                  {tooltip.monthName}
                </span>
                <span style={{ color: "#cbd5e1" }}>Proyeksi: <strong style={{ color: "white" }}>{formatRupiah(tooltip.expected)}</strong></span>
                <span style={{ color: "#cbd5e1" }}>Terkumpul: <strong style={{ color: "#34d399" }}>{formatRupiah(tooltip.collected)}</strong></span>
                <span style={{ color: "#94a3b8", fontSize: "0.7rem", marginTop: "2px" }}>
                  Efektivitas: {tooltip.expected > 0 ? Math.round((tooltip.collected / tooltip.expected) * 100) : 0}%
                </span>
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginTop: "1rem", fontSize: "0.8rem", fontWeight: "700" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "rgba(33, 108, 126, 0.15)" }} />
              <span style={{ color: "var(--color-gray-500)" }}>Proyeksi Target SPP</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "var(--color-primary)" }} />
              <span style={{ color: "var(--color-gray-500)" }}>Realisasi Lunas</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "var(--color-accent)" }} />
              <span style={{ color: "var(--color-gray-500)" }}>Bulan Aktif ({getMonthShortName(selectedMonth)})</span>
            </div>
          </div>

        </div>

        {/* Donut Chart Status Pembayaran */}
        <div className="portal-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--color-gray-900)", alignSelf: "flex-start", width: "100%" }}>
            🍩 Status Pembayaran SPP
          </h3>

          <div style={{ position: "relative", width: "160px", height: "160px", margin: "1.5rem 0" }}>
            <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: "rotate(-90deg)" }}>
              {/* Background circle */}
              <circle cx="80" cy="80" r="50" fill="none" stroke="#f1f5f9" strokeWidth="16" />

              {/* Lunas Slice */}
              {pPaid > 0 && (
                <circle
                  cx="80"
                  cy="80"
                  r="50"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="16"
                  strokeDasharray={strokeDashLunas}
                  strokeDashoffset="0"
                  style={{ transition: "stroke-dasharray 0.5s ease" }}
                />
              )}

              {/* Pending Slice */}
              {pPending > 0 && (
                <circle
                  cx="80"
                  cy="80"
                  r="50"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="16"
                  strokeDasharray={strokeDashPending}
                  strokeDashoffset={offsetPending}
                  style={{ transition: "stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease" }}
                />
              )}

              {/* Unpaid Slice */}
              {pUnpaid > 0 && (
                <circle
                  cx="80"
                  cy="80"
                  r="50"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="16"
                  strokeDasharray={strokeDashUnpaid}
                  strokeDashoffset={offsetUnpaid}
                  style={{ transition: "stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease" }}
                />
              )}
            </svg>

            {/* Inner Text overlay */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column"
            }}>
              <span style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-primary-dark)", lineHeight: 1 }}>{collectionRate}%</span>
              <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--color-gray-400)", textTransform: "uppercase", marginTop: "2px" }}>Lunas</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", width: "100%", fontSize: "0.8rem", fontWeight: "700", borderTop: "1px solid var(--color-gray-100)", paddingTop: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#10b981" }} />
                <span style={{ color: "var(--color-gray-600)" }}>Lunas</span>
              </div>
              <span style={{ color: "#065f46" }}>{activePaidCount} Anak ({pPaid}%)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#f59e0b" }} />
                <span style={{ color: "var(--color-gray-600)" }}>Konfirmasi</span>
              </div>
              <span style={{ color: "#92400e" }}>{activePendingCount} Anak ({pPending}%)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                <span style={{ color: "var(--color-gray-600)" }}>Belum Bayar</span>
              </div>
              <span style={{ color: "#991b1b" }}>{activeUnpaidCount} Anak ({pUnpaid}%)</span>
            </div>
          </div>

        </div>

      </div>

      {/* Program Breakdown Contribution Chart */}
      <div className="portal-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.5rem" }}>
          💸 Kontribusi Pendapatan per Program Studi
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {programBreakdown.map((prog) => {
            const totalProgExpected = prog.expected || 1;
            const progressRatio = Math.round((prog.collected / totalProgExpected) * 100);
            
            return (
              <div key={prog.name} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", fontSize: "0.9rem", fontWeight: "800" }}>
                  <span style={{ color: "var(--color-gray-800)" }}>{prog.name}</span>
                  <div style={{ display: "flex", gap: "1rem", color: "var(--color-gray-500)" }}>
                    <span>Realisasi: <strong style={{ color: "var(--color-primary-dark)" }}>{formatRupiah(prog.collected)}</strong></span>
                    <span>Target: <strong>{formatRupiah(prog.expected)}</strong></span>
                  </div>
                </div>
                {/* Horizontal Progress Bar */}
                <div style={{ width: "100%", height: "14px", backgroundColor: "#f1f5f9", borderRadius: "10px", overflow: "hidden", position: "relative" }}>
                  <div style={{
                    width: `${Math.min(100, progressRatio)}%`,
                    height: "100%",
                    backgroundColor: prog.color,
                    borderRadius: "10px",
                    transition: "width 0.5s ease"
                  }} />
                  {/* Badge Label inside bar */}
                  <span style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "0.65rem",
                    fontWeight: "900",
                    color: progressRatio > 80 ? "white" : "var(--color-gray-600)"
                  }}>
                    {progressRatio}% Kolektabilitas
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}