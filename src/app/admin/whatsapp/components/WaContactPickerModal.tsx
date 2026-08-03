"use client";

import React from "react";
import { Contact } from "../hooks/useWhatsAppDashboard";

interface WaContactPickerModalProps {
  phone: string;
  recentContacts: string[];
  filteredContacts: Contact[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onSelectContact: (num: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export default function WaContactPickerModal({
  phone, recentContacts, filteredContacts, searchQuery, setSearchQuery, onSelectContact, onClear, onClose,
}: WaContactPickerModalProps) {
  const selectedNums = phone.split(",").map((p) => p.trim());

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
      <div className="portal-card" style={{ width: "100%", maxWidth: "500px", maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column", padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontWeight: "800", fontSize: "1.1rem", margin: 0 }}>Daftar Kontak Proyek</h3>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: "var(--color-gray-500)", fontWeight: "600" }}>×</button>
        </div>

        <input type="text" placeholder="Cari nama siswa, orang tua, atau nomor..." className="form-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ marginBottom: "1rem" }} />

        <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem", paddingRight: "0.2rem" }}>
          {recentContacts.length > 0 && searchQuery === "" && (
            <div style={{ marginBottom: "0.5rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--color-primary-dark)", textTransform: "uppercase", marginBottom: "0.4rem", letterSpacing: "0.5px" }}>Terakhir Dihubungi (Manual)</p>
              {recentContacts.map((num) => {
                const isChecked = selectedNums.includes(num);
                return (
                  <label key={`recent-${num}`} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.82rem", padding: "0.5rem 0.75rem", borderRadius: "8px", backgroundColor: isChecked ? "var(--color-primary-light)" : "var(--color-gray-50)", border: `1px solid ${isChecked ? "var(--color-primary)" : "var(--color-gray-200)"}`, cursor: "pointer", transition: "all 0.15s ease", marginBottom: "0.35rem" }}>
                    <input type="checkbox" checked={isChecked} onChange={() => onSelectContact(num)} style={{ cursor: "pointer", width: "16px", height: "16px" }} />
                    <div>
                      <span style={{ fontWeight: "700", color: "var(--color-gray-900)" }}>{num}</span>
                      <span style={{ fontSize: "0.72rem", color: "var(--color-gray-400)", marginLeft: "0.5rem" }}>(Riwayat Kirim)</span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          <p style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--color-gray-400)", textTransform: "uppercase", marginBottom: "0.4rem", letterSpacing: "0.5px" }}>Kontak dari Sistem ({filteredContacts.length})</p>
          {filteredContacts.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "var(--color-gray-400)", fontStyle: "italic", textAlign: "center", padding: "1rem 0" }}>Tidak ada kontak ditemukan.</p>
          ) : (
            filteredContacts.map((c, idx) => {
              const isChecked = selectedNums.includes(c.phone);
              return (
                <label key={`contact-${idx}`} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.82rem", padding: "0.5rem 0.75rem", borderRadius: "8px", backgroundColor: isChecked ? "var(--color-primary-light)" : "var(--color-gray-50)", border: `1px solid ${isChecked ? "var(--color-primary)" : "var(--color-gray-200)"}`, cursor: "pointer", transition: "all 0.15s ease" }}>
                  <input type="checkbox" checked={isChecked} onChange={() => onSelectContact(c.phone)} style={{ cursor: "pointer", width: "16px", height: "16px" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "700", color: "var(--color-gray-900)" }}>{c.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", display: "flex", justifyContent: "space-between", marginTop: "0.1rem" }}>
                      <span>{c.phone}</span>
                      <span style={{ fontSize: "0.68rem", fontWeight: "700", color: "var(--color-primary-dark)", background: "var(--color-primary-light)", padding: "0.05rem 0.4rem", borderRadius: "4px" }}>{c.source}</span>
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button type="button" onClick={onClear} className="btn-portal-outline" style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", height: "auto" }}>Hapus Pilihan</button>
          <button type="button" onClick={onClose} className="btn-portal-primary" style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", height: "auto" }}>Selesai</button>
        </div>
      </div>
    </div>
  );
}
