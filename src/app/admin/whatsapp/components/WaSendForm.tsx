"use client";

import React, { useState } from "react";

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
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>("");

  const handleAiPolish = async (topic?: string) => {
    if (!topic && !message.trim()) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "wa-manual-polish",
          payload: { message, topic },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses AI.");
      if (data.reply) {
        setMessage(data.reply);
      }
    } catch (err: any) {
      setAiError(err.message || "Gagal menghubungi Groq AI Copilot.");
    } finally {
      setAiLoading(false);
    }
  };

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
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 1 0 7.75"/></svg>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--color-gray-700)", margin: 0 }}>Pesan</label>
            <button
              type="button"
              onClick={() => handleAiPolish()}
              disabled={aiLoading || !message.trim()}
              className="btn-portal-outline"
              style={{
                height: "auto", padding: "0.2rem 0.55rem", fontSize: "0.75rem",
                display: "flex", alignItems: "center", gap: "0.35rem",
                borderColor: "var(--color-primary)", color: "var(--color-primary-dark)", fontWeight: "700",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>{aiLoading ? "Memoles AI..." : "Poles Pesan (Groq AI)"}</span>
            </button>
          </div>

          <textarea className="form-input" rows={4} placeholder="Tulis pesan WhatsApp di sini..." value={message} onChange={(e) => setMessage(e.target.value)} required style={{ resize: "vertical", marginBottom: 0 }} />

          {/* AI Quick Templates */}
          <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--color-gray-500)", fontWeight: "600" }}>AI Draf Cepat:</span>
            <button
              type="button"
              onClick={() => handleAiPolish("Pengumuman Resmi Sekolah & Kegiatan Bimbel")}
              disabled={aiLoading}
              style={{ fontSize: "0.7rem", padding: "0.18rem 0.5rem", borderRadius: "12px", border: "1px solid rgba(33, 108, 126, 0.25)", backgroundColor: "var(--color-bg-teal-50)", color: "var(--color-primary-dark)", cursor: "pointer", fontWeight: "600" }}
            >
              Info Pengumuman
            </button>
            <button
              type="button"
              onClick={() => handleAiPolish("Pemberitahuan Hari Libur & Perubahan Jadwal Belajar")}
              disabled={aiLoading}
              style={{ fontSize: "0.7rem", padding: "0.18rem 0.5rem", borderRadius: "12px", border: "1px solid rgba(33, 108, 126, 0.25)", backgroundColor: "var(--color-bg-teal-50)", color: "var(--color-primary-dark)", cursor: "pointer", fontWeight: "600" }}
            >
              Info Libur
            </button>
            <button
              type="button"
              onClick={() => handleAiPolish("Undangan Pertemuan Wali Murid & Evaluasi Belajar")}
              disabled={aiLoading}
              style={{ fontSize: "0.7rem", padding: "0.18rem 0.5rem", borderRadius: "12px", border: "1px solid rgba(33, 108, 126, 0.25)", backgroundColor: "var(--color-bg-teal-50)", color: "var(--color-primary-dark)", cursor: "pointer", fontWeight: "600" }}
            >
              Undangan Wali Murid
            </button>
          </div>

          {aiError && (
            <p style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: "0.35rem", fontWeight: "600" }}>
              {aiError}
            </p>
          )}
        </div>

        {sendResult && (() => {
          const sent = sendResult.sentCount ?? sendResult.stats?.sent ?? (sendResult.sentReal ? 1 : 0);
          const simulated = sendResult.simulatedCount ?? sendResult.stats?.simulated ?? (sendResult.status === "SIMULATED" ? 1 : 0);
          const isSuccess = sendResult.success && (sent > 0 || simulated > 0);

          let bg = "#fef2f2"; let color = "#991b1b"; let border = "#fecaca";
          if (sent > 0) {
            bg = "#f0fdf4"; color = "#166534"; border = "#bbf7d0";
          } else if (simulated > 0) {
            bg = "#fffbeb"; color = "#92400e"; border = "#fde68a";
          }

          return (
            <div style={{ padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.83rem", fontWeight: "600", backgroundColor: bg, color, border: `1px solid ${border}` }}>
              {isSuccess
                ? sent > 0
                  ? `Pesan berhasil terkirim ke ${sent} nomor via WhatsApp Fonnte!`
                  : `Pesan disimulasikan untuk ${simulated} nomor (token Fonnte belum aktif). Log disimpan.`
                : `Gagal mengirim: ${sendResult.error || "Periksa nomor telepon."}`}
            </div>
          );
        })()}

        <button type="submit" className="btn-portal-primary" style={{ width: "100%", justifyContent: "center" }} disabled={sending || aiLoading}>
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
