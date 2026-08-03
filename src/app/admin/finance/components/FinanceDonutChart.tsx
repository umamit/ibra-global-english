// FinanceDonutChart.tsx - Donut chart status pembayaran SPP
interface Props { pPaid: number; pPending: number; pUnpaid: number; collectionRate: number; activePaidCount: number; activePendingCount: number; activeUnpaidCount: number; }

export default function FinanceDonutChart({ pPaid, pPending, pUnpaid, collectionRate, activePaidCount, activePendingCount, activeUnpaidCount }: Props) {
  const r = 50; const circ = 2 * Math.PI * r;
  const sDashLunas = `${(pPaid / 100) * circ} ${circ}`;
  const sDashPending = `${(pPending / 100) * circ} ${circ}`;
  const sDashUnpaid = `${(pUnpaid / 100) * circ} ${circ}`;
  const offPending = -((pPaid / 100) * circ);
  const offUnpaid = -(((pPaid + pPending) / 100) * circ);
  const legends = [{ color: "#10b981", label: "Lunas", count: activePaidCount, pct: pPaid, textColor: "#065f46" }, { color: "#f59e0b", label: "Konfirmasi", count: activePendingCount, pct: pPending, textColor: "#92400e" }, { color: "#ef4444", label: "Belum Bayar", count: activeUnpaidCount, pct: pUnpaid, textColor: "#991b1b" }];
  return (
    <div className="portal-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
      <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--color-gray-900)", alignSelf: "flex-start", width: "100%" }}>Status Pembayaran SPP</h3>
      <div style={{ position: "relative", width: "160px", height: "160px", margin: "1.5rem 0" }}>
        <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="80" cy="80" r={r} fill="none" stroke="#f1f5f9" strokeWidth="16" />
          {pPaid > 0 && <circle cx="80" cy="80" r={r} fill="none" stroke="#10b981" strokeWidth="16" strokeDasharray={sDashLunas} strokeDashoffset="0" style={{ transition: "stroke-dasharray 0.5s ease" }} />}
          {pPending > 0 && <circle cx="80" cy="80" r={r} fill="none" stroke="#f59e0b" strokeWidth="16" strokeDasharray={sDashPending} strokeDashoffset={offPending} style={{ transition: "stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease" }} />}
          {pUnpaid > 0 && <circle cx="80" cy="80" r={r} fill="none" stroke="#ef4444" strokeWidth="16" strokeDasharray={sDashUnpaid} strokeDashoffset={offUnpaid} style={{ transition: "stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease" }} />}
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-primary-dark)", lineHeight: 1 }}>{collectionRate}%</span>
          <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--color-gray-400)", textTransform: "uppercase", marginTop: "2px" }}>Lunas</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", width: "100%", fontSize: "0.8rem", fontWeight: "700", borderTop: "1px solid var(--color-gray-100)", paddingTop: "0.75rem" }}>
        {legends.map(l => (
          <div key={l.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: l.color }} /><span style={{ color: "var(--color-gray-600)" }}>{l.label}</span></div>
            <span style={{ color: l.textColor }}>{l.count} Anak ({l.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
