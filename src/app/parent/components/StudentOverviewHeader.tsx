import React from "react";

export function StudentOverviewHeader({ selectedChild, attendanceStats, attendance }: any) {
  const totalLogs = attendance.length;
  const attendanceRate = totalLogs > 0 ? Math.round((attendanceStats.hadir / totalLogs) * 100) : 100;

  return (
    <div className="portal-card" style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Laporan Akademik Murid</span>
          <h3 style={{ margin: "4px 0 0", fontSize: "1.5rem", fontWeight: "900", color: "var(--color-gray-900)" }}>{selectedChild?.name}</h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--color-gray-500)", fontWeight: "600" }}>Program: <span style={{ color: "var(--color-primary-dark)" }}>{selectedChild?.program}</span></p>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--color-gray-400)", fontWeight: "700", textTransform: "uppercase" }}>Tingkat Kehadiran</span>
            <h4 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "900", color: attendanceRate >= 80 ? "#10b981" : "#f59e0b" }}>{attendanceRate}%</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
