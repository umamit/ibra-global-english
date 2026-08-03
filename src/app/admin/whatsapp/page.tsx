"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { useWhatsAppDashboard } from "./hooks/useWhatsAppDashboard";
import WaDeviceStatus from "./components/WaDeviceStatus";
import WaSendForm from "./components/WaSendForm";
import WaLogTable from "./components/WaLogTable";
import WaContactPickerModal from "./components/WaContactPickerModal";

export default function WhatsAppDashboard() {
  const {
    deviceStatus, deviceLoading, logs, stats, logsLoading,
    phone, setPhone, message, setMessage, sending, sendResult,
    contacts, recentContacts, showContactPicker, setShowContactPicker,
    searchQuery, setSearchQuery, filteredContacts,
    fetchDeviceStatus, fetchLogs, fetchContacts,
    handleSelectContact, handleSendManual,
  } = useWhatsAppDashboard();

  return (
    <div>
      {/* Header */}
      <div className="dashboard-topbar">
        <div className="topbar-title">
          <h1>WhatsApp Gateway</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>Monitor &amp; kelola pengiriman pesan WhatsApp via Fonnte</p>
        </div>
        <div className="topbar-user">
          <button onClick={() => { fetchDeviceStatus(); fetchLogs(); fetchContacts(); }} className="btn-portal-outline" style={{ height: "auto", padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.4rem" }}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.26-3.67"/></svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: "1.75rem" }}>
        {[
          { title: "Total Pesan", value: stats.total, iconColor: "#0369a1", iconBg: "#e0f2fe", path: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
          { title: "Hari Ini", value: stats.today, iconColor: "var(--color-primary-dark)", iconBg: "var(--color-primary-light)", path: "" },
          { title: "Terkirim Real", value: stats.sent, iconColor: "var(--color-green)", iconBg: "var(--color-green-light)", path: "" },
          { title: "Simulasi / Gagal", value: stats.simulated + (stats.failed || 0), iconColor: "#92400e", iconBg: "#fef3c7", path: "" },
        ].map((s, i) => (
          <div className="portal-card" key={i}>
            <div className="stat-card-header">
              <span className="stat-card-title">{s.title}</span>
              <div className="stat-card-icon" style={{ backgroundColor: s.iconBg, color: s.iconColor }}>
                {i === 0 && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                {i === 1 && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                {i === 2 && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                {i === 3 && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
              </div>
            </div>
            <p className="stat-card-value">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Device Status + Send Form */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.75rem" }}>
        <WaDeviceStatus deviceStatus={deviceStatus} deviceLoading={deviceLoading} onRefresh={fetchDeviceStatus} />
        <WaSendForm
          phone={phone} setPhone={setPhone} message={message} setMessage={setMessage}
          sending={sending} sendResult={sendResult} contacts={contacts} recentContacts={recentContacts}
          onSelectContact={handleSelectContact} onOpenPicker={() => setShowContactPicker(true)} onSubmit={handleSendManual}
        />
      </div>

      {/* Log Table */}
      <WaLogTable logs={logs} logsLoading={logsLoading} onRefresh={fetchLogs} />

      {/* Contact Picker Modal */}
      {showContactPicker && (
        <WaContactPickerModal
          phone={phone} recentContacts={recentContacts} filteredContacts={filteredContacts}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          onSelectContact={handleSelectContact} onClear={() => setPhone("")} onClose={() => setShowContactPicker(false)}
        />
      )}
    </div>
  );
}
