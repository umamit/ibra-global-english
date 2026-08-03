// FinanceDueAlertBanner.tsx - Banner peringatan jatuh tempo SPP
interface DueAlertStats { dueSoonCount: number; dueTodayCount: number; overdueCount: number; totalAlerts: number; }

export default function FinanceDueAlertBanner({ dueAlertStats, selectedMonth }: { dueAlertStats: DueAlertStats; selectedMonth: string }) {
  if (dueAlertStats.totalAlerts === 0) return null;
  return (
    <div style={{ backgroundColor: "#fffbe6", border: "1px solid #ffe58f", borderRadius: "10px", padding: "0.85rem 1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.85rem", boxShadow: "0 2px 6px rgba(250, 173, 20, 0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", color: "#873800" }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      </div>
      <div style={{ flex: 1, fontSize: "0.88rem", color: "#873800" }}>
        <strong>Pengingat SPP Bulanan ({selectedMonth}):</strong> Terdapat{" "}
        {dueAlertStats.dueTodayCount > 0 && <span style={{ color: "#d48806", fontWeight: "800" }}>{dueAlertStats.dueTodayCount} siswa Hari H Jatuh Tempo</span>}
        {dueAlertStats.dueTodayCount > 0 && dueAlertStats.dueSoonCount > 0 && ", "}
        {dueAlertStats.dueSoonCount > 0 && <span style={{ color: "#b7eb8f", backgroundColor: "#389e0d", padding: "0.15rem 0.4rem", borderRadius: "4px", fontWeight: "700" }}>{dueAlertStats.dueSoonCount} siswa H-3 s/d H-1</span>}
        {(dueAlertStats.dueTodayCount > 0 || dueAlertStats.dueSoonCount > 0) && dueAlertStats.overdueCount > 0 && ", dan "}
        {dueAlertStats.overdueCount > 0 && <span style={{ color: "#cf1322", fontWeight: "800" }}>{dueAlertStats.overdueCount} siswa lewat tanggal jatuh tempo</span>}
        . Silakan periksa kolom <em>Jatuh Tempo SPP</em> pada tabel di bawah.
      </div>
    </div>
  );
}
