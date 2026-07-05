"use client";

import React, { useState } from "react";

interface NavigationItem {
  label: string;
  path: string;
}

interface NavigationManagerProps {
  navigationList: NavigationItem[];
  setNavigationList: (list: NavigationItem[]) => void;
  handleSaveNavigation: (list: NavigationItem[]) => void;
}

export default function NavigationManager({
  navigationList,
  setNavigationList,
  handleSaveNavigation,
}: NavigationManagerProps) {
  const [newLabel, setNewLabel] = useState("");
  const [newPath, setNewPath] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) {
      setErrorMsg("Label navigasi wajib diisi.");
      return;
    }
    if (!newPath.trim()) {
      setErrorMsg("Path link tujuan wajib diisi (misal: /about atau /#faq).");
      return;
    }

    const next = [...navigationList, { label: newLabel.trim(), path: newPath.trim() }];
    setNavigationList(next);
    setNewLabel("");
    setNewPath("");
    setErrorMsg("");
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...navigationList];
    const temp = next[index];
    next[index] = next[index - 1];
    next[index - 1] = temp;
    setNavigationList(next);
  };

  const handleMoveDown = (index: number) => {
    if (index === navigationList.length - 1) return;
    const next = [...navigationList];
    const temp = next[index];
    next[index] = next[index + 1];
    next[index + 1] = temp;
    setNavigationList(next);
  };

  const handleDeleteItem = (index: number) => {
    const next = [...navigationList];
    next.splice(index, 1);
    setNavigationList(next);
  };

  return (
    <div className="portal-card" style={{ padding: "2rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "0.5rem" }}>
        Kelola Menu Navigasi (Header / Footer)
      </h2>
      <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", marginBottom: "1.5rem" }}>
        Atur daftar menu navigasi yang akan ditampilkan di header dan drawer seluler website publik.
      </p>

      {errorMsg && (
        <div style={{ padding: "0.75rem 1rem", background: "rgba(220, 38, 38, 0.08)", border: "1px solid rgba(220, 38, 38, 0.2)", borderRadius: "var(--radius-md)", color: "var(--color-red)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Form Input Item Baru */}
      <form onSubmit={handleAddItem} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "1rem", alignItems: "flex-end", padding: "1.25rem", background: "var(--color-gray-50)", border: "1px dashed var(--color-gray-300)", borderRadius: "var(--radius-lg)", marginBottom: "2rem" }}>
        <div className="form-group">
          <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "600", fontSize: "0.85rem", color: "var(--color-gray-700)" }}>Nama Menu (Label)</label>
          <input
            type="text"
            className="form-input"
            placeholder="Contoh: Galeri, FAQ"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "600", fontSize: "0.85rem", color: "var(--color-gray-700)" }}>Link Tujuan (Path / ID)</label>
          <input
            type="text"
            className="form-input"
            placeholder="Contoh: /gallery atau /#faq"
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-portal-outline" style={{ height: "42px", paddingInline: "1.5rem" }}>
          + Tambah Menu
        </button>
      </form>

      {/* Tabel Visual Daftar Menu */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {navigationList.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-lg)", color: "var(--color-gray-400)" }}>
            Belum ada menu navigasi kustom. System akan menggunakan menu bawaan (default).
          </div>
        ) : (
          navigationList.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.25rem",
                background: "#fff",
                border: "1px solid var(--color-gray-200)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-xs)"
              }}
            >
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-gray-400)", width: "20px" }}>
                  #{idx + 1}
                </span>
                <div>
                  <div style={{ fontWeight: "700", color: "var(--color-gray-800)", fontSize: "0.95rem" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-primary-dark)", marginTop: "0.1rem" }}>
                    <code>{item.path}</code>
                  </div>
                </div>
              </div>

              {/* Aksi Baris */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => handleMoveUp(idx)}
                  disabled={idx === 0}
                  className="btn-portal-outline"
                  style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", minWidth: "30px", opacity: idx === 0 ? 0.3 : 1 }}
                  aria-label="Pindahkan Keatas"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(idx)}
                  disabled={idx === navigationList.length - 1}
                  className="btn-portal-outline"
                  style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", minWidth: "30px", opacity: idx === navigationList.length - 1 ? 0.3 : 1 }}
                  aria-label="Pindahkan Kebawah"
                >
                  ▼
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(idx)}
                  className="btn-portal-danger"
                  style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}
                >
                  Hapus
                </button>
              </div>
            </div>
          ))
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
          <button
            onClick={() => handleSaveNavigation(navigationList)}
            className="btn-portal-primary"
            style={{ paddingInline: "2rem" }}
          >
            Simpan Struktur Menu Navigasi
          </button>
        </div>
      </div>
    </div>
  );
}
