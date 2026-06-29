"use client";

interface FinanceStats {
  collected: number;
  paidCount: number;
  pendingCount: number;
  unpaidCount: number;
  expected: number;
}

interface FinanceStatsCardsProps {
  stats: FinanceStats;
  formatRupiah: (val: number) => string;
}

export default function FinanceStatsCards({ stats, formatRupiah }: FinanceStatsCardsProps) {
  return (
    <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>

      {/* Total Terkumpul */}
      <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid #10b981", background: "rgba(16, 185, 129, 0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Total Dana Masuk</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#065f46" }}>{formatRupiah(stats.collected)}</h2>
        <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>Dari total {stats.paidCount} pembayaran lunas.</p>
      </div>

      {/* Menunggu Konfirmasi */}
      <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid #f59e0b", background: "rgba(245, 158, 11, 0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Menunggu Konfirmasi</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#92400e" }}>{stats.pendingCount} <span style={{ fontSize: "1rem", fontWeight: "500" }}>Siswa</span></h2>
        <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>Wali murid sudah mengunggah bukti transfer.</p>
      </div>

      {/* Belum Membayar */}
      <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid #ef4444", background: "rgba(239, 68, 68, 0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Belum Bayar / Menunggak</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#991b1b" }}>{stats.unpaidCount} <span style={{ fontSize: "1rem", fontWeight: "500" }}>Siswa</span></h2>
        <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>Belum melunasi tagihan bulan ini.</p>
      </div>

      {/* Estimasi Potensial */}
      <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--color-primary)", background: "rgba(33, 108, 126, 0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Proyeksi Pendapatan</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        </div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>{formatRupiah(stats.expected)}</h2>
        <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>Estimasi jika semua siswa membayar lunas.</p>
      </div>

    </div>
  );
}
