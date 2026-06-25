"use client";

export default function MaintenanceSettings({
  maintenanceEnabled, setMaintenanceEnabled,
  maintenanceMessage, setMaintenanceMessage,
  savingMaintenance, setSavingMaintenance,
  handleSaveMaintenance
}) {
  return (
    <div className="portal-card" style={{ padding: "2rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>Pengaturan Mode Pemeliharaan</h2>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Status Mode Pemeliharaan</label>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={maintenanceEnabled}
                onChange={(e) => setMaintenanceEnabled(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <span style={{ fontSize: "0.9rem", color: "var(--color-gray-700)" }}>
                Aktifkan Mode Pemeliharaan
              </span>
            </label>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", marginTop: "0.25rem" }}>
            Saat aktif, halaman publik akan menampilkan pesan pemeliharaan dan menutup akses sementara untuk pengunjung biasa.
          </p>
        </div>

        <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Pesan yang Ditampilkan saat Pemeliharaan</label>
          <textarea
            className="form-input"
            style={{ width: "100%", minHeight: "120px", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)", resize: "vertical" }}
            placeholder="Contoh: Maaf, sistem sedang dalam pemeliharaan. Silakan kembali dalam beberapa saat."
            value={maintenanceMessage}
            onChange={(e) => setMaintenanceMessage(e.target.value)}
          />
          <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)" }}>
            Pesan ini akan ditampilkan kepada semua pengunjung saat mode pemeliharaan aktif.
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button
            type="button"
            onClick={() => handleSaveMaintenance(maintenanceEnabled, maintenanceMessage)}
            disabled={savingMaintenance}
            className="btn-portal-primary"
            style={{ padding: "0.75rem 1.5rem", fontWeight: "700" }}
          >
            {savingMaintenance ? "Menyimpan..." : "Simpan Pengaturan Pemeliharaan"}
          </button>
        </div>

        <div style={{ 
          marginTop: "1.5rem", 
          padding: "1rem", 
          backgroundColor: maintenanceEnabled ? "var(--color-red-50)" : "var(--color-green-50)",
          borderRadius: "var(--radius-md)",
          border: "1px solid " + (maintenanceEnabled ? "var(--color-red-200)" : "var(--color-green-200)")
        }}>
          <p style={{ 
            fontSize: "0.9rem", 
            fontWeight: "600", 
            color: maintenanceEnabled ? "var(--color-red-700)" : "var(--color-green-700)",
            margin: 0
          }}>
            Status Saat Ini: {maintenanceEnabled ? "🔴 Mode Pemeliharaan AKTIF" : "🟢 Mode Pemeliharaan NONAKTIF"}
          </p>
        </div>
      </div>
    </div>
  );
}