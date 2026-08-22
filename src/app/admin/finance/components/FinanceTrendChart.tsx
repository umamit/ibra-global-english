"use client";

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

interface MonthlyData {
  month: string;
  total: number;
  verifiedCount: number;
}

export default function FinanceTrendChart({ data }: { data: MonthlyData[] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--color-gray-200)", textAlign: "center", color: "var(--color-gray-500)" }}>
        Belum ada data grafik keuangan bulanan.
      </div>
    );
  }

  const formatRupiahShort = (val: number) => {
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}Jt`;
    if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)}Rb`;
    return `Rp ${val}`;
  };

  return (
    <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--color-gray-200)", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--color-gray-900)", display: "flex", alignItems: "center", gap: "6px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary, #216c7e)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Grafik Tren Pemasukan SPP (Recharts Visual)</span>
          </h3>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.825rem", color: "var(--color-gray-500)" }}>
            Arus kas penerimaan SPP terverifikasi per bulan di LKP Ibra Global English Bobong
          </p>
        </div>
      </div>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatRupiahShort} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value: any) => [`Rp ${Number(value || 0).toLocaleString("id-ID")}`, "Total Pemasukan"]}
              contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "0.85rem", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
              itemStyle={{ color: "#38bdf8" }}
            />
            <Legend wrapperStyle={{ fontSize: "0.8rem", paddingTop: "8px" }} />
            <Bar dataKey="total" name="Pemasukan SPP (Rp)" fill="#216c7e" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
