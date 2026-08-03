import React from "react";

export function SPPCardPrintTemplate({ student, selectedYear, basePrice, formatRupiah, matrixData, totalPaidCount, totalPaidAmount, totalUnpaidCount, cardRef }: any) {
  return (
    <div ref={cardRef} className="card-container">
      <div className="header-banner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #216c7e", paddingBottom: "12px", marginBottom: "16px" }}>
        <div className="logo-group" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="/assets/logo.png" alt="Logo" style={{ width: "50px", height: "50px", objectFit: "contain" }} />
          <div className="title-group">
            <h1 style={{ margin: 0, fontSize: "1.2rem", color: "#216c7e", fontWeight: "800" }}>IBRA GLOBAL ENGLISH</h1>
            <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#a68849", fontWeight: "700" }}>KARTU REKAPITULASI SPP TAHUNAN ({selectedYear})</p>
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: "0.75rem", color: "#64748b" }}>
          <div>Bobong, Pulau Taliabu</div>
          <div style={{ fontWeight: 700, color: "#216c7e" }}>Tahun Ajaran {selectedYear}</div>
        </div>
      </div>

      <div className="student-info" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px 16px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "0.85rem" }}>
        <div>Nama Siswa: <strong>{student.name}</strong></div>
        <div>Wali Murid: <strong>{student.profiles?.full_name || "-"}</strong></div>
        <div>Program: <strong>{student.program}</strong></div>
        <div>Nominal / Bln: <strong style={{ color: "#216c7e" }}>{formatRupiah(basePrice)}</strong></div>
      </div>

      <div className="matrix-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
        {matrixData.map((m: any) => (
          <div key={m.monthCode} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px", backgroundColor: m.status === "lunas" ? "#f0fdf4" : "#fff1f2" }}>
            <div style={{ fontWeight: 800, fontSize: "0.82rem", display: "flex", justifyContent: "space-between" }}>
              <span>{m.label}</span>
              <span style={{ fontSize: "0.65rem", fontWeight: 800 }}>{m.status.toUpperCase()}</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#475569" }}>
              <div>Nominal: <strong>{formatRupiah(m.amount)}</strong></div>
              <div>Tgl Bayar: {m.payDate}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "rgba(33, 108, 126, 0.06)", border: "1px solid rgba(33, 108, 126, 0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "0.82rem" }}>
        <div>Bulan Lunas: <strong style={{ color: "#065f46" }}>{totalPaidCount} / 12 Bulan</strong></div>
        <div>Total Terbayar: <strong style={{ color: "#216c7e" }}>{formatRupiah(totalPaidAmount)}</strong></div>
        <div>Sisa Tagihan: <strong style={{ color: totalUnpaidCount > 0 ? "#9f1239" : "#065f46" }}>{totalUnpaidCount} Bulan</strong></div>
      </div>
    </div>
  );
}
