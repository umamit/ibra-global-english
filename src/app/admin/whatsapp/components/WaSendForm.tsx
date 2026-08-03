"use client";

import React from "react";

interface WaSendFormProps {
  phone: string;
  setPhone: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
  sending: boolean;
  sendResult: any;
  contacts: { name: string; phone: string }[];
  recentContacts: string[];
  onSelectContact: (num: string) => void;
  onOpenPicker: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function WaSendForm({
  phone, setPhone, message, setMessage, sending, sendResult,
  contacts, recentContacts, onSelectContact, onOpenPicker, onSubmit,
}: WaSendFormProps) {
  return (
    <div className="portal-card" style={{ padding: "1.75rem" }}>
      <h3 style={{ fontWeight: "800", fontSize: "1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        Kirim Pesan Manual
      </h3>

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--color-gray-700)", margin: 0 }}>
              Nomor WhatsApp Penerima
            </label>
            <button type="button" onClick={onOpenPicker} className="btn-portal-outline" style={{ height: "auto", padding: "0.25rem 0.5rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>Pilih Kontak ({contacts.length})</span>
            </button>
          </div>
          <textarea className="form-input" rows={2} placeholder="Contoh: 6281234567890, 6289876543210" value={phone} onChange={(e) => setPhone(e.target.value)} required style={{ resize: "vertical", marginBottom: 0, fontSize: "0.85rem" }} />
          <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.35rem" }}>
            Pisahkan nomor dengan koma (`,`) jika ingin mengirim ke banyak nomor sekaligus.
          </p>

          {recentContacts.length > 0 && (
            <div style={{ marginTop: "0.6rem", display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--color-gray-400)" }}>Baru dihubungi:</span>
              {recentContacts.slice(0, 3).map((num) => {
                const isSelected = phone.split(",").map((p) => p.trim()).includes(num);
                return (
                  <button type="button" key={`quick-${num}`} onClick={() => onSelectContact(num)} style={{
                    fontSize: "0.68rem", padding: "0.15rem 0.4rem", borderRadius: "4px",
                    border: `1px solid ${isSelected ? "var(--color-primary)" : "var(--color-gray-300)"}`,
                    backgroundColor: isSelected ? "var(--color-primary-light)" : "#fff",
                    color: isSelected ? "var(--color-primary-dark)" : "var(--color-gray-600)",
                    cursor: "pointer", fontWeight: isSelected ? "700" : "500",
                  }}>{num}</button>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--color-gray-700)", marginBottom: "0.4rem" }}>Pesan</label>
          <textarea className="form-input" rows={4} placeholder="Tulis pesan WhatsApp di sini..." value={message} onChange={(e) => setMessage(e.target.value)} required style={{ resize: "vertical", marginBottom: 0 }} />
        </div>

        {sendResult && (
          <div style={{
            padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.83rem", fontWeight: "600",
            backgroundColor: sendResult.stats?.sent > 0 || sendResult.sentReal ? "#f0fdf4" : sendResult.stats?.simulated > 0 || sendResult.status === "SIMULATED" ? "#fffbeb" : "#fef2f2",
            color: sendResult.stats?.sent > 0 || sendResult.sentReal ? "#166534" : sendResult.stats?.simulated > 0 || sendResult.status === "SIMULATED" ? "#92400e" : "#991b1b",
            border: `1px solid ${sendResult.stats?.sent > 0 || sendResult.sentReal ? "#bbf7d0" : sendResult.stats?.simulated > 0 || sendResult.status === "SIMULATED" ? "#fde68a" : "#fecaca"}`,
          }}>
            {sendResult.stats
              ? `Berhasil memproses ${sendResult.stats.total} nomor: ${sendResult.stats.sent} Terkirim, ${sendResult.stats.simulated} Simulasi, ${sendResult.stats.failed} Gagal`
              : sendResult.sentReal ? "Pesan berhasil terkirim via Fonnte!"
              : sendResult.status === "SIMULATED" ? "Pesan disimulasikan (token Fonnte belum aktif). Log sudah disimpan."
              : `Gagal mengirim: ${sendResult.error || "Periksa konfigurasi."}`}
          </div>
        )}

        <button type="submit" className="btn-portal-primary" style={{ width: "100%", justifyContent: "center" }} disabled={sending}>
          {sending ? (
            <>
              <svg style={{ animation: "spin 1s linear infinite", width: "16px", height: "16px", marginRight: "0.4rem", display: "inline-block" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Mengirim...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.4rem" }}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Kirim Pesan
            </>
          )}
        </button>
      </form>
    </div>
  );
}
