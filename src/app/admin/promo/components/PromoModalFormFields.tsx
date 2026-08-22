"use client";

import React from "react";
import { PromoTiptapEditor } from "./PromoBannerComponents";

interface PromoModalFormFieldsProps {
  mode: "flyer" | "banner";
  badgeText: string;
  setBadgeText: (v: string) => void;
  title: string;
  setTitle: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
  ctaText: string;
  setCtaText: (v: string) => void;
  ctaUrl: string;
  setCtaUrl: (v: string) => void;
  imageUrl: string | null;
  setImageUrl: (v: string | null) => void;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleImageUpload: (file: File) => void;
  isActive: boolean;
  setIsActive: (v: boolean) => void;
}

export function PromoModalFormFields({
  mode,
  badgeText,
  setBadgeText,
  title,
  setTitle,
  message,
  setMessage,
  ctaText,
  setCtaText,
  ctaUrl,
  setCtaUrl,
  imageUrl,
  setImageUrl,
  uploading,
  fileInputRef,
  handleImageUpload,
  isActive,
  setIsActive,
}: PromoModalFormFieldsProps) {
  const inputStyle = {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "10px",
    border: "1px solid var(--color-gray-300)",
  };
  const labelStyle = {
    display: "block",
    fontWeight: 700,
    fontSize: "0.85rem",
    marginBottom: "0.4rem",
    color: "var(--color-gray-800)",
  };

  return (
    <>
      {/* Image Upload Area */}
      <div>
        <label style={labelStyle}>
          {mode === "flyer"
            ? "Berkas Gambar Flyer (Poster Vertikal / Horizontal) *"
            : "Gambar Banner Utama"}
        </label>
        {imageUrl ? (
          <div style={{ position: "relative", display: "inline-block", maxWidth: "260px" }}>
            <img
              src={imageUrl}
              alt="Uploaded"
              style={{
                width: "100%",
                maxHeight: "200px",
                objectFit: "contain",
                borderRadius: "12px",
                border: "1px solid var(--color-gray-300)",
              }}
            />
            <button
              type="button"
              onClick={() => setImageUrl(null)}
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "26px",
                height: "26px",
                cursor: "pointer",
              }}
              aria-label="Hapus gambar"
            >
              &times;
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "2px dashed var(--color-gray-300)",
              borderRadius: "12px",
              padding: "1.75rem",
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: "var(--color-gray-50)",
            }}
          >
            <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "var(--color-gray-700)" }}>
              {uploading ? "Sedang Mengunggah..." : "Klik untuk Unggah Gambar Flyer / Banner"}
            </p>
            <span style={{ fontSize: "0.75rem", color: "var(--color-gray-400)" }}>Format JPG, PNG, atau WebP</span>
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

      {/* Mode-Specific Fields */}
      {mode === "banner" ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Label Badge</label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="PROMO KHUSUS"
                style={inputStyle}
                maxLength={40}
              />
            </div>
            <div>
              <label style={labelStyle}>Judul Promo</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Pendaftaran Dibuka!"
                style={inputStyle}
                maxLength={80}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Pesan &amp; Deskripsi Promo *</label>
            <PromoTiptapEditor value={message} onChange={setMessage} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Teks Tombol CTA</label>
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
              <label style={labelStyle}>Link Tujuan CTA</label>
              <input
                type="text"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://wa.me/6282299578986"
                style={inputStyle}
                maxLength={200}
              />
            </div>
          </div>
        </>
      ) : (
        <div>
          <label style={labelStyle}>Tautan Tujuan Saat Flyer Diklik (Opsional)</label>
          <input
            type="text"
            value={ctaUrl}
            onChange={(e) => setCtaUrl(e.target.value)}
            placeholder="https://wa.me/6282299578986 atau /formulir-offline"
            style={inputStyle}
            maxLength={250}
          />
          <span style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", marginTop: "4px", display: "block" }}>
            Jika diisi, pengunjung yang mengklik gambar flyer akan langsung diarahkan ke link ini.
          </span>
        </div>
      )}

      {/* Status Toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.85rem 1rem",
          backgroundColor: "var(--color-gray-50)",
          borderRadius: "12px",
          border: "1px solid var(--color-gray-200)",
        }}
      >
        <div>
          <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Status Tayang</span>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--color-gray-500)" }}>
            {isActive ? "Aktif (Akan tampil di pop-up website)" : "Nonaktif (Disembunyikan sementara)"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          style={{
            padding: "0.45rem 1.1rem",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: "0.82rem",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            backgroundColor: isActive ? "#d1fae5" : "var(--color-gray-200)",
            color: isActive ? "#065f46" : "var(--color-gray-600)",
          }}
        >
          {isActive ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
            </svg>
          )}
          <span>{isActive ? "Aktif" : "Nonaktif"}</span>
        </button>
      </div>
    </>
  );
}
