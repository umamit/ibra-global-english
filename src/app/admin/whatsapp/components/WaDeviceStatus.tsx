"use client";

import React from "react";
import { DeviceStatus } from "../hooks/useWhatsAppDashboard";

interface WaDeviceStatusProps {
  deviceStatus: DeviceStatus | null;
  deviceLoading: boolean;
  onRefresh: () => void;
}

export default function WaDeviceStatus({ deviceStatus, deviceLoading, onRefresh }: WaDeviceStatusProps) {
  return (
    <div className="portal-card" style={{ padding: "1.75rem" }}>
      <h3 style={{ fontWeight: "800", fontSize: "1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
        Status Perangkat Fonnte
      </h3>

      {deviceLoading ? (
        <div className="skeleton-pulse" style={{ height: "80px", borderRadius: "8px" }} />
      ) : (
        <>
          <div style={{
            display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", borderRadius: "10px",
            backgroundColor: deviceStatus?.connected ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${deviceStatus?.connected ? "#bbf7d0" : "#fecaca"}`,
            marginBottom: "1rem",
          }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: deviceStatus?.connected ? "#22c55e" : "#ef4444", flexShrink: 0, boxShadow: deviceStatus?.connected ? "0 0 0 4px rgba(34,197,94,0.2)" : "none" }} />
            <div>
              <p style={{ fontWeight: "800", fontSize: "0.95rem", color: deviceStatus?.connected ? "#166534" : "#991b1b", margin: 0 }}>
                {deviceStatus?.connected ? "Perangkat Terhubung" : "Perangkat Tidak Terhubung"}
              </p>
              {deviceStatus?.device?.device && <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", margin: "0.2rem 0 0" }}>Nomor WA: {deviceStatus.device.device}</p>}
              {deviceStatus?.device?.name && <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", margin: "0.2rem 0 0" }}>Nama: {deviceStatus.device.name}</p>}
              {deviceStatus?.reason && <p style={{ fontSize: "0.8rem", color: "#991b1b", margin: "0.2rem 0 0" }}>{deviceStatus.reason}</p>}
            </div>
          </div>

          {!deviceStatus?.connected && (
            <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "0.85rem 1rem", fontSize: "0.82rem", color: "#92400e" }}>
              <strong>Cara mengaktifkan:</strong>
              <ol style={{ marginTop: "0.5rem", paddingLeft: "1.25rem", lineHeight: 1.8 }}>
                <li>Daftarkan akun di <a href="https://fonnte.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: "700" }}>fonnte.com</a></li>
                <li>Tambahkan perangkat &amp; scan QR Code</li>
                <li>Salin token dari menu <strong>Device › Token</strong></li>
                <li>Isi <code style={{ background: "#fef3c7", padding: "0.1rem 0.3rem", borderRadius: "3px" }}>FONNTE_API_TOKEN</code> di file <code>.env.local</code></li>
                <li>Restart server Next.js</li>
              </ol>
            </div>
          )}
        </>
      )}

      <button onClick={onRefresh} className="btn-portal-outline" style={{ marginTop: "1rem", width: "100%", justifyContent: "center", fontSize: "0.85rem" }}>
        Periksa Ulang Status
      </button>
    </div>
  );
}
