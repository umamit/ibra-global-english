"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

export default function WhatsAppDashboard() {
  const [deviceStatus, setDeviceStatus] = useState(null);
  const [deviceLoading, setDeviceLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, sent: 0, simulated: 0, failed: 0 });
  const [logsLoading, setLogsLoading] = useState(true);

  // Form kirim manual
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  // Daftar Kontak
  const [contacts, setContacts] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDeviceStatus = useCallback(async () => {
    setDeviceLoading(true);
    try {
      const res = await fetch("/api/whatsapp-simulator?action=device");
      const data = await res.json();
      setDeviceStatus(data);
    } catch {
      setDeviceStatus({ connected: false, reason: "Gagal terhubung ke server." });
    } finally {
      setDeviceLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await fetch("/api/whatsapp-simulator");
      const data = await res.json();
      setLogs(data.logs || []);
      if (data.stats) setStats(data.stats);
    } catch {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp-simulator?action=contacts");
      const data = await res.json();
      if (data.contacts) {
        setContacts(data.contacts);
      }
    } catch (err) {
      console.error("Gagal mengambil kontak:", err);
    }
  }, []);

  useEffect(() => {


    let cancelled = false;


    const load = async () => {


      if (cancelled) return;


      fetchDeviceStatus();
    fetchLogs();
    fetchContacts();
    const stored = JSON.parse(localStorage.getItem("recent_manual_wa_numbers") || "[]");
    setRecentContacts(stored);


    };


    load();


    return () => {


      cancelled = true;


    };


  }, [fetchDeviceStatus, fetchLogs, fetchContacts]);

  const handleSelectContact = (num) => {
    const cleanNum = num.trim().replace(/[^0-9]/g, "");
    if (!cleanNum) return;

    let currentPhones = phone.split(",").map(p => p.trim()).filter(Boolean);
    if (currentPhones.includes(cleanNum)) {
      // Hapus jika sudah dipilih
      currentPhones = currentPhones.filter(p => p !== cleanNum);
    } else {
      // Tambah jika belum ada
      currentPhones.push(cleanNum);
    }
    setPhone(currentPhones.join(", "));
  };

  const handleSendManual = async (e) => {
    e.preventDefault();
    if (!phone.trim() || !message.trim()) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/whatsapp-simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), message: message.trim(), type: "manual" }),
      });
      const data = await res.json();
      setSendResult(data);
      if (data.success) {
        // Simpan nomor-nomor baru ke recent list
        const cleanNumbers = phone
          .split(",")
          .map((n) => n.trim().replace(/[^0-9]/g, ""))
          .filter((n) => n.length >= 9);

        let updatedRecent = [...recentContacts];
        cleanNumbers.forEach((num) => {
          if (!updatedRecent.includes(num)) {
            updatedRecent.unshift(num); // Tambahkan ke depan
          } else {
            // Pindahkan ke depan jika sudah ada
            updatedRecent = [num, ...updatedRecent.filter((n) => n !== num)];
          }
        });
        // Batasi maksimal 15 nomor terakhir
        updatedRecent = updatedRecent.slice(0, 15);
        setRecentContacts(updatedRecent);
        localStorage.setItem("recent_manual_wa_numbers", JSON.stringify(updatedRecent));

        setPhone("");
        setMessage("");
        fetchLogs(); // Refresh log
      }
    } catch (err) {
      setSendResult({ success: false, error: err.message });
    } finally {
      setSending(false);
    }
  };

  // Filter kontak berdasarkan pencarian
  const filteredContacts = contacts.filter((c) => {
    const term = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.phone.includes(term)
    );
  });

  const typeLabel = {
    approval: { label: "Persetujuan", color: "#166534", bg: "#dcfce7" },
    rejection: { label: "Penolakan", color: "#991b1b", bg: "#fee2e2" },
    manual: { label: "Manual", color: "#1e40af", bg: "#dbeafe" },
    absence: { label: "Absensi", color: "#92400e", bg: "#fef3c7" },
    certificate: { label: "Sertifikat", color: "#6b21a8", bg: "#f3e8ff" },
  };

  const statusStyle = {
    SENT: { label: "✓ Terkirim", color: "#166534", bg: "#dcfce7" },
    SIMULATED: { label: "◎ Simulasi", color: "#92400e", bg: "#fef3c7" },
    FAILED: { label: "✗ Gagal", color: "#991b1b", bg: "#fee2e2" },
    UNKNOWN: { label: "? Tidak diketahui", color: "#6b7280", bg: "#f3f4f6" },
  };

  return (
    <div>
      {/* Header */}
      <div className="dashboard-topbar">
        <div className="topbar-title">
          <h1>WhatsApp Gateway</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Monitor & kelola pengiriman pesan WhatsApp via Fonnte
          </p>
        </div>
        <div className="topbar-user">
          <button
            onClick={() => { fetchDeviceStatus(); fetchLogs(); fetchContacts(); }}
            className="btn-portal-outline"
            style={{ height: "auto", padding: "0.5rem 1rem", fontSize: "0.85rem" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.4rem" }}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.26-3.67"/></svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Statistik Cards */}
      <div className="stat-grid" style={{ marginBottom: "1.75rem" }}>
        <div className="portal-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Pesan</span>
            <div className="stat-card-icon" style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
          </div>
          <p className="stat-card-value">{stats.total}</p>
        </div>

        <div className="portal-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Hari Ini</span>
            <div className="stat-card-icon" style={{ backgroundColor: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
          </div>
          <p className="stat-card-value">{stats.today}</p>
        </div>

        <div className="portal-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Terkirim Real</span>
            <div className="stat-card-icon" style={{ backgroundColor: "var(--color-green-light)", color: "var(--color-green)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
          <p className="stat-card-value">{stats.sent}</p>
        </div>

        <div className="portal-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Simulasi / Gagal</span>
            <div className="stat-card-icon" style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
          </div>
          <p className="stat-card-value">{stats.simulated + (stats.failed || 0)}</p>
        </div>
      </div>

      {/* Status Perangkat + Kirim Manual (2 kolom) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.75rem" }}>

        {/* Status Perangkat Fonnte */}
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
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1rem 1.25rem",
                borderRadius: "10px",
                backgroundColor: deviceStatus?.connected ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${deviceStatus?.connected ? "#bbf7d0" : "#fecaca"}`,
                marginBottom: "1rem"
              }}>
                <div style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: deviceStatus?.connected ? "#22c55e" : "#ef4444",
                  flexShrink: 0,
                  boxShadow: deviceStatus?.connected ? "0 0 0 4px rgba(34,197,94,0.2)" : "none",
                  animation: deviceStatus?.connected ? "pulse 2s infinite" : "none"
                }} />
                <div>
                  <p style={{ fontWeight: "800", fontSize: "0.95rem", color: deviceStatus?.connected ? "#166534" : "#991b1b", margin: 0 }}>
                    {deviceStatus?.connected ? "Perangkat Terhubung ✓" : "Perangkat Tidak Terhubung"}
                  </p>
                  {deviceStatus?.device?.device && (
                    <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", margin: "0.2rem 0 0" }}>
                      Nomor WA: {deviceStatus.device.device}
                    </p>
                  )}
                  {deviceStatus?.device?.name && (
                    <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", margin: "0.2rem 0 0" }}>
                      Nama: {deviceStatus.device.name}
                    </p>
                  )}
                  {deviceStatus?.reason && (
                    <p style={{ fontSize: "0.8rem", color: "#991b1b", margin: "0.2rem 0 0" }}>
                      {deviceStatus.reason}
                    </p>
                  )}
                </div>
              </div>

              {!deviceStatus?.connected && (
                <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "0.85rem 1rem", fontSize: "0.82rem", color: "#92400e" }}>
                  <strong>Cara mengaktifkan:</strong>
                  <ol style={{ marginTop: "0.5rem", paddingLeft: "1.25rem", lineHeight: 1.8 }}>
                    <li>Daftarkan akun di <a href="https://fonnte.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: "700" }}>fonnte.com</a></li>
                    <li>Tambahkan perangkat & scan QR Code</li>
                    <li>Salin token dari menu <strong>Device › Token</strong></li>
                    <li>Isi <code style={{ background: "#fef3c7", padding: "0.1rem 0.3rem", borderRadius: "3px" }}>FONNTE_API_TOKEN</code> di file <code>.env.local</code></li>
                    <li>Restart server Next.js</li>
                  </ol>
                </div>
              )}
            </>
          )}

          <button
            onClick={fetchDeviceStatus}
            className="btn-portal-outline"
            style={{ marginTop: "1rem", width: "100%", justifyContent: "center", fontSize: "0.85rem" }}
          >
            Periksa Ulang Status
          </button>
        </div>

        {/* Form Kirim Manual */}
        <div className="portal-card" style={{ padding: "1.75rem" }}>
          <h3 style={{ fontWeight: "800", fontSize: "1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Kirim Pesan Manual
          </h3>

          <form onSubmit={handleSendManual}>
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--color-gray-700)", margin: 0 }}>
                  Nomor WhatsApp Penerima
                </label>
                <button
                  type="button"
                  onClick={() => setShowContactPicker(true)}
                  className="btn-portal-outline"
                  style={{ height: "auto", padding: "0.25rem 0.5rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  📋 Pilih Kontak ({contacts.length})
                </button>
              </div>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Contoh: 6281234567890, 6289876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={{ resize: "vertical", marginBottom: 0, fontSize: "0.85rem" }}
              />
              <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.35rem" }}>
                Pisahkan nomor dengan koma (`,`) jika ingin mengirim ke banyak nomor sekaligus.
              </p>

              {/* Riwayat Baru Dihubungi */}
              {recentContacts.length > 0 && (
                <div style={{ marginTop: "0.6rem", display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--color-gray-400)" }}>Baru dihubungi:</span>
                  {recentContacts.slice(0, 3).map((num) => {
                    const isSelected = phone.split(",").map(p => p.trim()).includes(num);
                    return (
                      <button
                        type="button"
                        key={`quick-${num}`}
                        onClick={() => handleSelectContact(num)}
                        style={{
                          fontSize: "0.68rem",
                          padding: "0.15rem 0.4rem",
                          borderRadius: "4px",
                          border: `1px solid ${isSelected ? "var(--color-primary)" : "var(--color-gray-300)"}`,
                          backgroundColor: isSelected ? "var(--color-primary-light)" : "#fff",
                          color: isSelected ? "var(--color-primary-dark)" : "var(--color-gray-600)",
                          cursor: "pointer",
                          fontWeight: isSelected ? "700" : "500"
                        }}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--color-gray-700)", marginBottom: "0.4rem" }}>
                Pesan
              </label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Tulis pesan WhatsApp di sini..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                style={{ resize: "vertical", marginBottom: 0 }}
              />
            </div>

            {sendResult && (
              <div style={{
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                fontSize: "0.83rem",
                fontWeight: "600",
                backgroundColor: sendResult.stats?.sent > 0 || sendResult.sentReal ? "#f0fdf4" : sendResult.stats?.simulated > 0 || sendResult.status === "SIMULATED" ? "#fffbeb" : "#fef2f2",
                color: sendResult.stats?.sent > 0 || sendResult.sentReal ? "#166534" : sendResult.stats?.simulated > 0 || sendResult.status === "SIMULATED" ? "#92400e" : "#991b1b",
                border: `1px solid ${sendResult.stats?.sent > 0 || sendResult.sentReal ? "#bbf7d0" : sendResult.stats?.simulated > 0 || sendResult.status === "SIMULATED" ? "#fde68a" : "#fecaca"}`
              }}>
                {sendResult.stats
                  ? `🚀 Berhasil memproses ${sendResult.stats.total} nomor: ${sendResult.stats.sent} Terkirim, ${sendResult.stats.simulated} Simulasi, ${sendResult.stats.failed} Gagal`
                  : sendResult.sentReal
                  ? "✅ Pesan berhasil terkirim via Fonnte!"
                  : sendResult.status === "SIMULATED"
                  ? "⚠️ Pesan disimulasikan (token Fonnte belum aktif). Log sudah disimpan."
                  : `❌ Gagal mengirim: ${sendResult.error || "Periksa konfigurasi."}`}
              </div>
            )}

            <button
              type="submit"
              className="btn-portal-primary"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={sending}
            >
              {sending ? (
                <>
                  <svg style={{ animation: "spin 1s linear infinite", width: "16px", height: "16px" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Mengirim...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Kirim Pesan
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Riwayat Log Pengiriman */}
      <div className="portal-card" style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <h3 style={{ fontWeight: "800", fontSize: "1rem", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Riwayat Log Pengiriman
          </h3>
          <button
            onClick={fetchLogs}
            className="btn-portal-outline"
            style={{ height: "auto", padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
          >
            Refresh Log
          </button>
        </div>

        {logsLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton-pulse" style={{ height: "52px", borderRadius: "8px" }} />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-400)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 1rem", display: "block", opacity: 0.4 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <p style={{ fontSize: "0.9rem" }}>Belum ada riwayat pengiriman pesan.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="portal-table" style={{ fontSize: "0.83rem" }}>
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Tipe</th>
                  <th>Nomor Tujuan</th>
                  <th>Status</th>
                  <th>Pesan</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 50).map((log, idx) => {
                  const tStyle = typeLabel[log.type] || { label: log.type || "-", color: "#6b7280", bg: "#f3f4f6" };
                  const sStyle = statusStyle[log.status] || statusStyle.UNKNOWN;
                  const dateStr = log.timestamp
                    ? new Date(log.timestamp).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                    : "-";

                  return (
                    <tr key={idx}>
                      <td style={{ whiteSpace: "nowrap", color: "var(--color-gray-500)", fontSize: "0.78rem" }}>
                        {dateStr}
                      </td>
                      <td>
                        <span style={{ backgroundColor: tStyle.bg, color: tStyle.color, padding: "0.15rem 0.5rem", borderRadius: "6px", fontWeight: "700", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                          {tStyle.label}
                        </span>
                      </td>
                      <td style={{ fontFamily: "monospace", fontWeight: "600" }}>
                        {log.phone ? (
                          <a
                            href={`https://wa.me/${log.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--color-primary)", textDecoration: "none" }}
                          >
                            {log.phone}
                          </a>
                        ) : "-"}
                      </td>
                      <td>
                        <span style={{ backgroundColor: sStyle.bg, color: sStyle.color, padding: "0.15rem 0.5rem", borderRadius: "6px", fontWeight: "700", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                          {sStyle.label}
                        </span>
                      </td>
                      <td style={{ maxWidth: "300px" }}>
                        <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", color: "var(--color-gray-600)", lineHeight: 1.4 }}>
                          {log.message || log.raw || "-"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {logs.length > 50 && (
              <p style={{ textAlign: "center", padding: "0.75rem 0", fontSize: "0.8rem", color: "var(--color-gray-400)" }}>
                Menampilkan 50 pesan terbaru dari total {logs.length} log.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modal Pemilih Kontak */}
      {showContactPicker && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "1rem"
        }}>
          <div className="portal-card" style={{
            width: "100%",
            maxWidth: "500px",
            maxHeight: "80vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            padding: "1.5rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontWeight: "800", fontSize: "1.1rem", margin: 0 }}>Daftar Kontak Proyek</h3>
              <button
                type="button"
                onClick={() => setShowContactPicker(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: "var(--color-gray-500)", fontWeight: "600" }}
              >
                ×
              </button>
            </div>

            {/* Input Pencarian */}
            <input
              type="text"
              placeholder="Cari nama siswa, orang tua, atau nomor..."
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ marginBottom: "1rem" }}
            />

            {/* Scrollable list */}
            <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem", paddingRight: "0.2rem" }}>
              {/* Seksi Recent */}
              {recentContacts.length > 0 && searchQuery === "" && (
                <div style={{ marginBottom: "0.5rem" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--color-primary-dark)", textTransform: "uppercase", marginBottom: "0.4rem", letterSpacing: "0.5px" }}>
                    Terakhir Dihubungi (Manual)
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "0.75rem" }}>
                    {recentContacts.map((num) => {
                      const isChecked = phone.split(",").map(p => p.trim()).includes(num);
                      return (
                        <label key={`recent-${num}`} style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6rem",
                          fontSize: "0.82rem",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "8px",
                          backgroundColor: isChecked ? "var(--color-primary-light)" : "var(--color-gray-50)",
                          border: `1px solid ${isChecked ? "var(--color-primary)" : "var(--color-gray-200)"}`,
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleSelectContact(num)}
                            style={{ cursor: "pointer", width: "16px", height: "16px" }}
                          />
                          <div>
                            <span style={{ fontWeight: "700", color: "var(--color-gray-900)" }}>{num}</span>
                            <span style={{ fontSize: "0.72rem", color: "var(--color-gray-400)", marginLeft: "0.5rem" }}>(Riwayat Kirim)</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Seksi Database Kontak */}
              <p style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--color-gray-400)", textTransform: "uppercase", marginBottom: "0.4rem", letterSpacing: "0.5px" }}>
                Kontak dari Sistem ({filteredContacts.length})
              </p>
              {filteredContacts.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "var(--color-gray-400)", fontStyle: "italic", textAlign: "center", padding: "1rem 0" }}>
                  Tidak ada kontak ditemukan.
                </p>
              ) : (
                filteredContacts.map((c, idx) => {
                  const isChecked = phone.split(",").map(p => p.trim()).includes(c.phone);
                  return (
                    <label key={`contact-${idx}`} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      fontSize: "0.82rem",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "8px",
                      backgroundColor: isChecked ? "var(--color-primary-light)" : "var(--color-gray-50)",
                      border: `1px solid ${isChecked ? "var(--color-primary)" : "var(--color-gray-200)"}`,
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSelectContact(c.phone)}
                        style={{ cursor: "pointer", width: "16px", height: "16px" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "700", color: "var(--color-gray-900)" }}>{c.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", display: "flex", justifyContent: "space-between", marginTop: "0.1rem" }}>
                          <span>{c.phone}</span>
                          <span style={{ fontSize: "0.68rem", fontWeight: "700", color: "var(--color-primary-dark)", background: "var(--color-primary-light)", padding: "0.05rem 0.4rem", borderRadius: "4px" }}>
                            {c.source}
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => {
                  setPhone("");
                }}
                className="btn-portal-outline"
                style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", height: "auto" }}
              >
                Hapus Pilihan
              </button>
              <button
                type="button"
                onClick={() => setShowContactPicker(false)}
                className="btn-portal-primary"
                style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", height: "auto" }}
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
