"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";

interface PromoBanner {
  id: string;
  is_active: boolean;
  title: string;
  message: string;
  image_url: string | null;
  cta_text: string;
  cta_url: string;
}

export default function AdminPromoPage() {
  const [banner, setBanner] = useState<PromoBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" }>({ msg: "", type: "success" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch("/api/admin/promo-banners");
        const json = await res.json();
        const data: PromoBanner[] = json.data || [];
        const first = data[0] || null;
        setBanner(first);
        if (first) {
          setTitle(first.title || "");
          setMessage(first.message || "");
          setCtaText(first.cta_text || "");
          setCtaUrl(first.cta_url || "");
          setImageUrl(first.image_url || null);
          setIsActive(first.is_active || false);
        }
      } catch {
        showToast("Gagal memuat data popup.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, []);

  const handleToggleActive = async () => {
    if (!banner) return;
    const newVal = !isActive;
    setIsActive(newVal);
    try {
      const res = await fetch("/api/admin/promo-banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: banner.id, is_active: newVal }),
      });
      if (!res.ok) throw new Error();
      showToast(newVal ? "Popup diaktifkan ✓" : "Popup dinonaktifkan ✓");
    } catch {
      setIsActive(!newVal);
      showToast("Gagal mengubah status.", "error");
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/promo-banners/upload", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload gagal.");
      setImageUrl(json.image_url);
      showToast("Gambar berhasil diunggah ✓");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Upload gagal.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!banner) return;
    if (!message.trim()) {
      showToast("Pesan tidak boleh kosong.", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/promo-banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: banner.id,
          title: title.trim(),
          message: message.trim(),
          cta_text: ctaText.trim(),
          cta_url: ctaUrl.trim(),
          image_url: imageUrl,
          is_active: isActive,
        }),
      });
      if (!res.ok) throw new Error();
      showToast("Perubahan berhasil disimpan ✓");
    } catch {
      showToast("Gagal menyimpan perubahan.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = async () => {
    setImageUrl(null);
  };

  // --- STYLES ---
  const cardStyle: React.CSSProperties = {
    background: "var(--color-surface, #fff)",
    borderRadius: "16px",
    padding: "1.75rem",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    marginBottom: "1.5rem",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--color-gray-500)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: "0.4rem",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.7rem 0.9rem",
    borderRadius: "10px",
    border: "1px solid var(--color-gray-300)",
    fontSize: "0.95rem",
    background: "var(--color-bg)",
    color: "var(--color-text)",
    boxSizing: "border-box",
  };

  return (
    <div style={{ maxWidth: "780px", margin: "0 auto", padding: "2rem 1rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
          🎯 Kelola Promo Popup
        </h1>
        <p style={{ color: "var(--color-gray-500)", margin: "0.3rem 0 0", fontSize: "0.9rem" }}>
          Popup promosi akan muncul otomatis kepada pengunjung 3 detik setelah membuka halaman.
        </p>
      </div>

      {/* Toast */}
      {toast.msg && (
        <div style={{
          padding: "0.8rem 1.2rem",
          borderRadius: "10px",
          marginBottom: "1.25rem",
          background: toast.type === "success" ? "#d1fae5" : "#fee2e2",
          color: toast.type === "success" ? "#065f46" : "#991b1b",
          fontWeight: 600,
          fontSize: "0.9rem",
        }}>
          {toast.msg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-gray-400)" }}>
          Memuat data...
        </div>
      ) : !banner ? (
        <div style={{ ...cardStyle, textAlign: "center", color: "var(--color-gray-500)" }}>
          <p>Belum ada data popup. Silakan jalankan migrasi SQL terlebih dahulu.</p>
        </div>
      ) : (
        <>
          {/* Toggle Aktif */}
          <div style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "1rem" }}>Status Popup</p>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.875rem", color: "var(--color-gray-500)" }}>
                {isActive ? "🟢 Popup sedang aktif dan terlihat pengunjung" : "⚫ Popup nonaktif, tidak ditampilkan"}
              </p>
            </div>
            <button
              onClick={handleToggleActive}
              aria-pressed={isActive}
              style={{
                flexShrink: 0,
                padding: "0.6rem 1.4rem",
                borderRadius: "999px",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.875rem",
                background: isActive ? "#d1fae5" : "var(--color-gray-200)",
                color: isActive ? "#065f46" : "var(--color-gray-600)",
                transition: "all 0.2s",
              }}
            >
              {isActive ? "✓ Aktif" : "Nonaktif"}
            </button>
          </div>

          {/* Form Edit Konten */}
          <div style={cardStyle}>
            <h2 style={{ margin: "0 0 1.25rem", fontSize: "1rem", fontWeight: 700 }}>✏️ Konten Popup</h2>

            {/* Judul */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Judul <span style={{ color: "var(--color-gray-400)", fontWeight: 400, textTransform: "none" }}>(opsional)</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Penawaran Spesial! 🎉"
                style={inputStyle}
                maxLength={80}
              />
            </div>

            {/* Pesan */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Pesan <span style={{ color: "#ef4444" }}>*</span></label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis deskripsi promosi yang menarik..."
                rows={3}
                style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
                maxLength={300}
              />
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem", color: "var(--color-gray-400)" }}>
                {message.length}/300 karakter
              </p>
            </div>

            {/* CTA */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={labelStyle}>Teks Tombol <span style={{ color: "var(--color-gray-400)", fontWeight: 400, textTransform: "none" }}>(opsional)</span></label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Daftar Sekarang"
                  style={inputStyle}
                  maxLength={40}
                />
              </div>
              <div>
                <label style={labelStyle}>Link Tombol <span style={{ color: "var(--color-gray-400)", fontWeight: 400, textTransform: "none" }}>(opsional)</span></label>
                <input
                  type="text"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="/placement-test"
                  style={inputStyle}
                  maxLength={200}
                />
              </div>
            </div>

            {/* Upload Gambar */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Gambar Banner <span style={{ color: "var(--color-gray-400)", fontWeight: 400, textTransform: "none" }}>(opsional · JPG/PNG/WEBP · maks 2MB)</span></label>
              {imageUrl ? (
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={imageUrl}
                    alt="Preview banner"
                    width={320}
                    height={160}
                    style={{ width: "100%", maxWidth: "320px", height: "auto", borderRadius: "12px", display: "block", objectFit: "cover" }}
                  />
                  <button
                    onClick={handleRemoveImage}
                    title="Hapus gambar"
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: "28px",
                      height: "28px",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: "2px dashed var(--color-gray-300)",
                    borderRadius: "12px",
                    padding: "2rem",
                    textAlign: "center",
                    cursor: "pointer",
                    color: "var(--color-gray-500)",
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-gray-300)")}
                >
                  {uploading ? (
                    <p style={{ margin: 0, fontSize: "0.9rem" }}>⏳ Mengunggah gambar...</p>
                  ) : (
                    <>
                      <p style={{ margin: "0 0 0.3rem", fontSize: "1.5rem" }}>🖼️</p>
                      <p style={{ margin: 0, fontSize: "0.875rem" }}>Klik untuk unggah gambar banner</p>
                    </>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = "";
                }}
              />
            </div>

            {/* Tombol Simpan */}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "0.75rem 2rem",
                background: "var(--color-primary, #4a9ba8)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
                transition: "background 0.2s",
              }}
            >
              {saving ? "Menyimpan..." : "💾 Simpan Perubahan"}
            </button>
          </div>

          {/* Preview */}
          <div style={cardStyle}>
            <h2 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700 }}>👁️ Preview Popup</h2>
            <div style={{
              border: "1px solid var(--color-gray-200)",
              borderRadius: "16px",
              overflow: "hidden",
              maxWidth: "400px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  width={400}
                  height={200}
                  style={{ width: "100%", height: "auto", maxHeight: "200px", objectFit: "cover", display: "block" }}
                />
              )}
              <div style={{ padding: imageUrl ? "1.25rem 1.5rem 1.5rem" : "1.75rem 1.5rem 1.5rem" }}>
                {title && (
                  <p style={{ margin: "0 0 0.5rem", fontWeight: 700, color: "var(--color-primary-dark)", fontSize: "1.05rem" }}>
                    {title}
                  </p>
                )}
                <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "var(--color-gray-600)", lineHeight: 1.6 }}>
                  {message || <span style={{ color: "var(--color-gray-400)" }}>Tulis pesan di form atas...</span>}
                </p>
                {ctaText && ctaUrl && (
                  <span style={{
                    display: "inline-block",
                    padding: "0.55rem 1.2rem",
                    background: "var(--color-primary)",
                    color: "#fff",
                    borderRadius: "10px",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}>
                    {ctaText} →
                  </span>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
