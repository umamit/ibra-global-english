"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";

const CATEGORIES = ["Kegiatan", "Prestasi", "Fasilitas", "Kelas Online"];

export default function AdminGalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Kegiatan");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const fetchItems = async () => {
    setLoading(true);
    const res = await fetch("/api/gallery?all=true");
    const { data } = await res.json();
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (cancelled) return;
      await fetchItems();
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title.trim()) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("category", category);
    fd.append("file", file);

    const res = await fetch("/api/gallery", { method: "POST", body: fd });
    if (res.ok) {
      setTitle(""); setDescription(""); setFile(null); setPreview(null);
      document.getElementById("gallery-file-input").value = "";
      fetchItems();
      showToast("Foto berhasil diunggah ke galeri! ✅");
    } else {
      const { error } = await res.json();
      showToast(`Error: ${error}`);
    }
    setUploading(false);
  };

  const handleToggle = async (id, isActive) => {
    await fetch("/api/gallery", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, is_active: !isActive }) });
    fetchItems();
    showToast(isActive ? "Foto disembunyikan dari galeri." : "Foto ditampilkan kembali.");
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus foto ini secara permanen? File di storage juga akan dihapus.")) return;
    await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
    fetchItems();
    showToast("Foto dihapus.");
  };

  const catColor = (c) => {
    const map = { Kegiatan: "var(--color-primary)", Prestasi: "#f59e0b", Fasilitas: "#8b5cf6", "Kelas Online": "#22c55e" };
    return map[c] || "var(--color-gray-500)";
  };

  return (
    <div className="dashboard-main" style={{ padding: "2rem" }}>
      {toast && (
        <div className="auth-success-banner" style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 9999, maxWidth: "380px" }}>
          {toast}
        </div>
      )}

      <div className="dashboard-topbar" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>🖼️ Kelola Galeri Foto</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>Upload foto kegiatan yang akan tampil di website publik.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "2rem", alignItems: "start" }} className="report-detail-layout">

        {/* Form Upload */}
        <div className="portal-card" style={{ padding: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem", color: "var(--color-gray-900)" }}>
            📤 Upload Foto Baru
          </h3>
          <form onSubmit={handleSubmit}>
            {/* Preview */}
            <div style={{ marginBottom: "1.25rem", borderRadius: "12px", overflow: "hidden", background: "var(--color-gray-100)", height: "180px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed var(--color-gray-200)" }}>
              {preview ? (
                <img src={preview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ color: "var(--color-gray-400)", fontSize: "0.875rem", fontWeight: "600" }}>📷 Preview foto</span>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Pilih Foto</label>
              <input id="gallery-file-input" type="file" accept="image/*" className="form-input" onChange={handleFileChange} required style={{ padding: "0.5rem" }} />
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Judul Foto</label>
              <input className="form-input" placeholder="Contoh: Kelas Speaking Sesi Juni 2026" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Kategori</label>
              <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">Deskripsi (Opsional)</label>
              <textarea className="form-input" style={{ minHeight: "70px", fontFamily: "inherit" }} placeholder="Keterangan singkat tentang foto..." value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <button type="submit" className="btn-portal-primary" style={{ width: "100%", padding: "0.85rem" }} disabled={uploading || !file}>
              {uploading ? "Mengunggah..." : "🖼️ Upload ke Galeri"}
            </button>
          </form>
        </div>

        {/* Grid Foto */}
        <div className="portal-card" style={{ padding: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem", color: "var(--color-gray-900)" }}>
            📸 Semua Foto ({items.length})
          </h3>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton-pulse" style={{ height: "160px", borderRadius: "12px" }} />)}
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-400)" }}>
              <p style={{ fontWeight: "600" }}>Belum ada foto di galeri.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", maxHeight: "620px", overflowY: "auto" }}>
              {items.map(item => (
                <div key={item.id} style={{ borderRadius: "12px", overflow: "hidden", border: "1.5px solid var(--color-gray-150)", opacity: item.is_active ? 1 : 0.55, position: "relative" }}>
                  <div style={{ position: "relative", height: "140px", overflow: "hidden", background: "var(--color-gray-100)" }}>
                    <img src={item.image_url} alt={item.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {!item.is_active && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "white", fontWeight: "800", fontSize: "0.75rem" }}>TERSEMBUNYI</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "0.6rem 0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.4rem", marginBottom: "0.3rem" }}>
                      <span style={{ fontSize: "0.65rem", fontWeight: "700", padding: "2px 6px", borderRadius: "10px", background: `${catColor(item.category)}18`, color: catColor(item.category) }}>{item.category}</span>
                    </div>
                    <p style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "0.5rem", lineHeight: 1.3 }}>
                      {item.title.length > 40 ? item.title.slice(0, 40) + "..." : item.title}
                    </p>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button onClick={() => handleToggle(item.id, item.is_active)} style={{ flex: 1, fontSize: "0.7rem", padding: "0.3rem", borderRadius: "6px", border: "1px solid var(--color-gray-200)", background: "none", cursor: "pointer", color: item.is_active ? "#f59e0b" : "#22c55e", fontWeight: "700" }}>
                        {item.is_active ? "Sembunyikan" : "Tampilkan"}
                      </button>
                      <button onClick={() => handleDelete(item.id)} style={{ fontSize: "0.7rem", padding: "0.3rem 0.5rem", borderRadius: "6px", border: "1.5px solid #ef444433", background: "#ef444410", cursor: "pointer", color: "#ef4444", fontWeight: "700" }}>
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
