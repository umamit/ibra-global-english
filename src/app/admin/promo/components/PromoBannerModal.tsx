"use client";

import React, { useState, useRef, useEffect } from "react";
import { PromoBannerItem } from "./PromoBannerList";
import { PromoBannerPreview } from "./PromoBannerComponents";
import { PromoModalFormFields } from "./PromoModalFormFields";

interface PromoBannerModalProps {
  isOpen: boolean;
  editingItem: PromoBannerItem | null;
  onClose: () => void;
  onSaved: (item: PromoBannerItem) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export function PromoBannerModal({
  isOpen,
  editingItem,
  onClose,
  onSaved,
  showToast,
}: PromoBannerModalProps) {
  const [mode, setMode] = useState<"flyer" | "banner">("flyer");
  const [badgeText, setBadgeText] = useState("PROMO KHUSUS");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingItem) {
      const isFlyer = Boolean(editingItem.image_url) && !editingItem.title?.trim();
      setMode(isFlyer ? "flyer" : "banner");
      setBadgeText(editingItem.badge_text || "PROMO KHUSUS");
      setTitle(editingItem.title || "");
      setMessage(editingItem.message || "");
      setCtaText(editingItem.cta_text || "");
      setCtaUrl(editingItem.cta_url || "");
      setImageUrl(editingItem.image_url || null);
      setIsActive(editingItem.is_active !== false);
    } else {
      setMode("flyer");
      setBadgeText("PROMO KHUSUS");
      setTitle("");
      setMessage("");
      setCtaText("");
      setCtaUrl("");
      setImageUrl(null);
      setIsActive(true);
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/promo-banners/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload gagal.");
      setImageUrl(json.image_url);
      showToast("Gambar berhasil diunggah", "success");
    } catch (err: any) {
      showToast(err.message || "Upload gagal.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "flyer" && !imageUrl) {
      showToast("Harap unggah gambar flyer terlebih dahulu.", "error");
      return;
    }
    if (mode === "banner" && !message.trim()) {
      showToast("Pesan promo wajib diisi untuk mode banner.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: editingItem?.id,
        badge_text: mode === "banner" ? badgeText.trim() : "FLYER",
        title: mode === "banner" ? title.trim() : "",
        message: mode === "banner" ? message.trim() : "",
        cta_text: mode === "banner" ? ctaText.trim() : "",
        cta_url: ctaUrl.trim(),
        image_url: imageUrl,
        is_active: isActive,
      };

      const url = "/api/admin/promo-banners";
      const method = editingItem ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan item.");

      showToast(editingItem ? "Perubahan berhasil disimpan!" : "Flyer/Banner baru berhasil ditambahkan!", "success");
      onSaved(json.data);
      onClose();
    } catch (err: any) {
      showToast(err.message || "Gagal menyimpan.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="portal-modal-overlay" onClick={() => { if (!saving) onClose(); }}>
      <div
        className="portal-modal"
        style={{ maxWidth: "840px", width: "94%", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>
              {editingItem ? "Edit Flyer / Banner" : "Tambah Flyer / Banner Baru"}
            </h3>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "var(--color-gray-500)" }}>
              Pilih format tampilan pop-up dan lengkapi pengaturannya
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--color-gray-400)" }}>✕</button>
        </div>

        {/* Mode Selector Tabs */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", backgroundColor: "var(--color-gray-100)", padding: "4px", borderRadius: "14px" }}>
          <button
            type="button"
            onClick={() => setMode("flyer")}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: "0.9rem",
              backgroundColor: mode === "flyer" ? "#ffffff" : "transparent",
              color: mode === "flyer" ? "var(--color-primary)" : "var(--color-gray-600)",
              boxShadow: mode === "flyer" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            }}
          >
            🖼️ Mode Flyer Gambar Saja
          </button>
          <button
            type="button"
            onClick={() => setMode("banner")}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: "0.9rem",
              backgroundColor: mode === "banner" ? "#ffffff" : "transparent",
              color: mode === "banner" ? "var(--color-primary)" : "var(--color-gray-600)",
              boxShadow: mode === "banner" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            }}
          >
            📝 Mode Banner + Teks
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <PromoModalFormFields
            mode={mode}
            badgeText={badgeText} setBadgeText={setBadgeText}
            title={title} setTitle={setTitle}
            message={message} setMessage={setMessage}
            ctaText={ctaText} setCtaText={setCtaText}
            ctaUrl={ctaUrl} setCtaUrl={setCtaUrl}
            imageUrl={imageUrl} setImageUrl={setImageUrl}
            uploading={uploading} fileInputRef={fileInputRef}
            handleImageUpload={handleImageUpload}
            isActive={isActive} setIsActive={setIsActive}
          />

          {/* Live Preview */}
          <div style={{ marginTop: "0.5rem" }}>
            <PromoBannerPreview
              mode={mode}
              badgeText={badgeText}
              title={title}
              message={message}
              ctaText={ctaText}
              ctaUrl={ctaUrl}
              imageUrl={imageUrl}
            />
          </div>

          {/* Modal Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "0.7rem 1.25rem", borderRadius: "10px", border: "1px solid var(--color-gray-300)", backgroundColor: "#fff", fontWeight: 700, cursor: "pointer" }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              style={{
                padding: "0.7rem 1.75rem",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "var(--color-primary, #216c7e)",
                color: "#fff",
                fontWeight: 700,
                cursor: saving || uploading ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Menyimpan..." : "Simpan Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
