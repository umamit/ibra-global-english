"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { PromoBannerFormFields, PromoBannerPreview } from "./components/PromoBannerComponents";

interface PromoBanner { id: string; is_active: boolean; title: string; message: string; image_url: string | null; cta_text: string; cta_url: string; }

export default function AdminPromoPage() {
  const [banner, setBanner] = useState<PromoBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" }>({ msg: "", type: "success" });
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const first = (json.data || [])[0] || null;
        setBanner(first);
        if (first) {
          setTitle(first.title || ""); setMessage(first.message || ""); setCtaText(first.cta_text || ""); setCtaUrl(first.cta_url || ""); setImageUrl(first.image_url || null); setIsActive(first.is_active || false);
        }
      } catch { showToast("Gagal memuat data popup.", "error"); } finally { setLoading(false); }
    };
    fetchBanner();
  }, []);

  const handleToggleActive = async () => {
    if (!banner) return;
    const newVal = !isActive;
    setIsActive(newVal);
    try {
      const res = await fetch("/api/admin/promo-banners", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: banner.id, is_active: newVal }) });
      if (!res.ok) throw new Error();
      showToast(newVal ? "Popup diaktifkan" : "Popup dinonaktifkan");
    } catch { setIsActive(!newVal); showToast("Gagal mengubah status.", "error"); }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData(); form.append("file", file);
      const res = await fetch("/api/admin/promo-banners/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload gagal.");
      setImageUrl(json.image_url); showToast("Gambar berhasil diunggah");
    } catch (err: any) { showToast(err.message || "Upload gagal.", "error"); } finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!message.trim()) { showToast("Pesan promo wajib diisi.", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/promo-banners", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: banner?.id || null, title: title.trim(), message: message.trim(), cta_text: ctaText.trim(), cta_url: ctaUrl.trim(), image_url: imageUrl, is_active: isActive }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan.");
      if (json.data) setBanner(json.data[0] || json.data);
      showToast("Perubahan berhasil disimpan!");
    } catch (err: any) { showToast(err.message || "Gagal menyimpan.", "error"); } finally { setSaving(false); }
  };

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {toast.msg && <div style={{ position: "fixed", top: "20px", right: "20px", background: toast.type === "error" ? "#ef4444" : "#10b981", color: "#fff", padding: "0.75rem 1.5rem", borderRadius: "12px", zIndex: 9999 }}>{toast.msg}</div>}

      <div>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800 }}>Manajemen Popup Promosi</h1>
        <p style={{ margin: "0.25rem 0 0", color: "var(--color-gray-500)", fontSize: "0.875rem" }}>Atur penawaran promosi melayang di Landing Page</p>
      </div>

      {loading ? <p>Memuat data...</p> : (
        <>
          <div style={{ backgroundColor: "#fff", padding: "1.25rem 1.5rem", borderRadius: "16px", border: "1px solid var(--color-gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><p style={{ margin: 0, fontWeight: 700 }}>Status Popup</p><p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "var(--color-gray-500)" }}>{isActive ? "Popup sedang aktif" : "Popup nonaktif"}</p></div>
            <button onClick={handleToggleActive} style={{ padding: "0.6rem 1.4rem", borderRadius: "999px", border: "none", cursor: "pointer", fontWeight: 700, background: isActive ? "#d1fae5" : "var(--color-gray-200)", color: isActive ? "#065f46" : "var(--color-gray-600)" }}>{isActive ? "Aktif" : "Nonaktif"}</button>
          </div>

          <PromoBannerFormFields title={title} setTitle={setTitle} message={message} setMessage={setMessage} ctaText={ctaText} setCtaText={setCtaText} ctaUrl={ctaUrl} setCtaUrl={setCtaUrl} imageUrl={imageUrl} handleRemoveImage={() => setImageUrl(null)} uploading={uploading} fileInputRef={fileInputRef} handleImageUpload={handleImageUpload} handleSave={handleSave} saving={saving} />
          <PromoBannerPreview title={title} message={message} ctaText={ctaText} ctaUrl={ctaUrl} imageUrl={imageUrl} />
        </>
      )}
    </div>
  );
}
