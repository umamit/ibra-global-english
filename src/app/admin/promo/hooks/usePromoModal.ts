"use client";

import { useState, useRef, useEffect } from "react";
import { PromoBannerItem } from "../components/PromoBannerList";

interface UsePromoModalProps {
  editingItem: PromoBannerItem | null;
  isOpen: boolean;
  onSaved: (item: PromoBannerItem) => void;
  onClose: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export function usePromoModal({
  editingItem,
  isOpen,
  onSaved,
  onClose,
  showToast,
}: UsePromoModalProps) {
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

      const res = await fetch("/api/admin/promo-banners", {
        method: editingItem ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan item.");

      showToast(editingItem ? "Perubahan berhasil disimpan!" : "Flyer/Banner berhasil ditambahkan!", "success");
      onSaved(json.data);
      onClose();
    } catch (err: any) {
      showToast(err.message || "Gagal menyimpan.", "error");
    } finally {
      setSaving(false);
    }
  };

  return {
    mode, setMode,
    badgeText, setBadgeText,
    title, setTitle,
    message, setMessage,
    ctaText, setCtaText,
    ctaUrl, setCtaUrl,
    imageUrl, setImageUrl,
    isActive, setIsActive,
    saving, uploading,
    fileInputRef,
    handleImageUpload,
    handleSave,
  };
}
