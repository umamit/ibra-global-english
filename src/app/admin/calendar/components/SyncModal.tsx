import React from "react";

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SyncModal({ isOpen, onClose }: SyncModalProps) {
  if (!isOpen) return null;

  return (
    <div className="portal-modal-overlay" onClick={onClose}>
      <div className="portal-modal" style={{
        maxWidth: "500px",
        padding: "2rem",
        animation: "slideIn 0.2s ease"
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--color-gray-900)", margin: 0 }}>
            🔗 Sinkronkan Kalender ke HP
          </h2>
          <button 
            type="button" 
            onClick={onClose}
            style={{ background: "transparent", border: "none", fontSize: "1.5rem", fontWeight: "800", color: "var(--color-gray-400)", cursor: "pointer" }}
          >
            &times;
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "0.9rem", color: "var(--color-gray-700)", lineHeight: "1.6" }}>
          <p style={{ margin: 0 }}>
            Ikuti langkah berikut untuk menyinkronkan seluruh jadwal kalender akademik ini ke aplikasi kalender di HP Anda (Google Calendar / Apple Calendar). **Tautan ini juga dapat Anda bagikan kepada para Tutor/Pengajar agar mereka dapat menyinkronkan seluruh jadwal mengajar mereka secara otomatis.**
          </p>

          <div>
            <label className="form-label" style={{ fontWeight: "800", marginBottom: "0.5rem", display: "block" }}>Tautan Sinkronisasi (iCal Link)</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input 
                type="text" 
                className="form-input" 
                readOnly 
                value={typeof window !== "undefined" ? `${window.location.origin}/api/calendar/export?program=All` : ""} 
                style={{ fontSize: "0.8rem", backgroundColor: "var(--color-gray-50)", cursor: "text" }}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                id="ical-link-input"
              />
              <button 
                type="button" 
                className="btn-portal-primary"
                style={{ padding: "0.5rem 1rem", whiteSpace: "nowrap" }}
                onClick={() => {
                  const input = document.getElementById("ical-link-input") as HTMLInputElement;
                  if (input) {
                    input.select();
                    navigator.clipboard.writeText(input.value);
                    alert("Tautan kalender berhasil disalin!");
                  }
                }}
              >
                Salin Link
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: "var(--color-primary-light)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-primary-dark)", color: "var(--color-primary-dark)" }}>
            <h4 style={{ margin: "0 0 0.5rem 0", fontWeight: "800", fontSize: "0.88rem" }}>📱 Cara Menghubungkan ke HP:</h4>
            <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.82rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li>
                <strong>iPhone (Apple Calendar):</strong> Buka menu <em>Pengaturan (Settings)</em> &gt; <em>Kalender (Calendar)</em> &gt; <em>Akun (Accounts)</em> &gt; <em>Tambah Akun (Add Account)</em> &gt; <em>Lainnya (Other)</em> &gt; <em>Tambah Kalender Berlangganan (Add Subscribed Calendar)</em>, lalu tempel (*paste*) tautan di atas.
              </li>
              <li>
                <strong>Android & Google Calendar:</strong> Buka <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", fontWeight: "800", textDecoration: "underline" }}>Google Calendar Web</a> di laptop/komputer. Di sidebar kiri, klik tanda **`+`** di sebelah *"Kalender lainnya"* &gt; pilih **Dari URL**, lalu tempel tautan di atas. Kalender akan otomatis tersinkronisasi ke aplikasi Google Calendar di HP Android Anda.
              </li>
            </ul>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
          <button type="button" className="btn-portal-outline" style={{ padding: "0.5rem 1.5rem" }} onClick={onClose}>
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
