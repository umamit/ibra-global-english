"use client";

import React from "react";
import { PromoBannerItem } from "./PromoBannerList";
import { PromoBannerPreview } from "./PromoBannerComponents";
import { PromoModalFormFields } from "./PromoModalFormFields";
import { usePromoModal } from "../hooks/usePromoModal";

interface PromoBannerModalProps {
  isOpen: boolean;
  editingItem: PromoBannerItem | null;
  onClose: () => void;
  onSaved: (item: PromoBannerItem) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

const ImageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-3px", marginRight: "6px" }}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

const FileTextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-3px", marginRight: "6px" }}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <line x1="10" x2="8" y1="9" y2="9" />
  </svg>
);

export function PromoBannerModal(props: PromoBannerModalProps) {
  const { isOpen, editingItem, onClose, onSaved, showToast } = props;
  const modal = usePromoModal({ editingItem, isOpen, onSaved, onClose, showToast });

  if (!isOpen) return null;

  return (
    <div className="portal-modal-overlay" onClick={() => { if (!modal.saving) onClose(); }}>
      <div
        className="portal-modal"
        style={{
          maxWidth: "960px",
          width: "95%",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Modal Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.25rem 1.75rem",
            borderBottom: "1px solid var(--color-gray-200)",
            backgroundColor: "#ffffff",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "var(--color-gray-900)" }}>
              {editingItem ? "Edit Flyer / Banner Promo" : "Tambah Flyer / Banner Baru"}
            </h3>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.82rem", color: "var(--color-gray-500)" }}>
              Pilih format tampilan pop-up dan lengkapi pengaturannya
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--color-gray-100)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              cursor: "pointer",
              color: "var(--color-gray-500)",
              transition: "all 0.2s ease",
            }}
            aria-label="Tutup modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <form id="promo-banner-form" onSubmit={modal.handleSave} style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto" }}>
          <div style={{ padding: "1.5rem 1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Mode Selector Tabs */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                backgroundColor: "var(--color-gray-100)",
                padding: "5px",
                borderRadius: "14px",
              }}
            >
              <button
                type="button"
                onClick={() => modal.setMode("flyer")}
                style={{
                  flex: 1,
                  padding: "0.7rem 1rem",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: modal.mode === "flyer" ? "#ffffff" : "transparent",
                  color: modal.mode === "flyer" ? "var(--color-primary, #216c7e)" : "var(--color-gray-600)",
                  boxShadow: modal.mode === "flyer" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                <ImageIcon /> Mode Flyer Gambar Saja
              </button>
              <button
                type="button"
                onClick={() => modal.setMode("banner")}
                style={{
                  flex: 1,
                  padding: "0.7rem 1rem",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: modal.mode === "banner" ? "#ffffff" : "transparent",
                  color: modal.mode === "banner" ? "var(--color-primary, #216c7e)" : "var(--color-gray-600)",
                  boxShadow: modal.mode === "banner" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                <FileTextIcon /> Mode Banner + Teks
              </button>
            </div>

            {/* 2-Column Responsive Layout for Form & Live Preview */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                gap: "1.5rem",
                alignItems: "start",
              }}
            >
              {/* Left Column: Form Fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                <PromoModalFormFields
                  mode={modal.mode}
                  badgeText={modal.badgeText} setBadgeText={modal.setBadgeText}
                  title={modal.title} setTitle={modal.setTitle}
                  message={modal.message} setMessage={modal.setMessage}
                  ctaText={modal.ctaText} setCtaText={modal.setCtaText}
                  ctaUrl={modal.ctaUrl} setCtaUrl={modal.setCtaUrl}
                  imageUrl={modal.imageUrl} setImageUrl={modal.setImageUrl}
                  uploading={modal.uploading} fileInputRef={modal.fileInputRef}
                  handleImageUpload={modal.handleImageUpload}
                  isActive={modal.isActive} setIsActive={modal.setIsActive}
                />
              </div>

              {/* Right Column: Live Preview */}
              <div style={{ position: "sticky", top: 0 }}>
                <PromoBannerPreview
                  mode={modal.mode}
                  badgeText={modal.badgeText}
                  title={modal.title}
                  message={modal.message}
                  ctaText={modal.ctaText}
                  ctaUrl={modal.ctaUrl}
                  imageUrl={modal.imageUrl}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Sticky Modal Footer (Never Cut Off!) */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "0.75rem",
            padding: "1rem 1.75rem",
            borderTop: "1px solid var(--color-gray-200)",
            backgroundColor: "#ffffff",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "0.65rem 1.4rem",
              borderRadius: "12px",
              border: "1px solid var(--color-gray-300)",
              backgroundColor: "#ffffff",
              color: "var(--color-gray-700)",
              fontWeight: 700,
              fontSize: "0.88rem",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Batal
          </button>
          <button
            type="submit"
            form="promo-banner-form"
            disabled={modal.saving || modal.uploading}
            style={{
              padding: "0.65rem 1.75rem",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "var(--color-primary, #216c7e)",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "0.88rem",
              cursor: modal.saving || modal.uploading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(33, 108, 126, 0.3)",
              transition: "all 0.15s ease",
            }}
          >
            {modal.saving ? "Menyimpan..." : "Simpan Item"}
          </button>
        </div>
      </div>
    </div>
  );
}
