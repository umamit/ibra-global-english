"use client";

import React from "react";
import { PromoBannerCard } from "./PromoBannerCard";

export interface PromoBannerItem {
  id: string;
  is_active: boolean;
  badge_text?: string | null;
  title: string | null;
  message?: string | null;
  image_url: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  created_at?: string;
}

interface PromoBannerListProps {
  banners: PromoBannerItem[];
  intervalSec?: number;
  onToggleActive: (banner: PromoBannerItem) => void;
  onEdit: (banner: PromoBannerItem) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export function PromoBannerList({
  banners,
  intervalSec = 5,
  onToggleActive,
  onEdit,
  onDelete,
  onAddNew,
}: PromoBannerListProps) {
  const activeCount = banners.filter((b) => b.is_active).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          backgroundColor: "#fff",
          padding: "1.25rem 1.5rem",
          borderRadius: "16px",
          border: "1px solid var(--color-gray-200)",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>
            Daftar Banner &amp; Flyer ({banners.length})
          </h2>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "var(--color-gray-500)" }}>
            {activeCount > 1
              ? `${activeCount} item aktif berganti otomatis tiap ${intervalSec} detik di popup`
              : activeCount === 1
              ? "1 item aktif tampil tunggal di popup"
              : "Semua popup nonaktif (tidak muncul di website)"}
          </p>
        </div>

        <button
          onClick={onAddNew}
          style={{
            padding: "0.65rem 1.25rem",
            backgroundColor: "var(--color-primary, #216c7e)",
            color: "#ffffff",
            border: "none",
            borderRadius: "12px",
            fontWeight: 700,
            fontSize: "0.88rem",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            boxShadow: "0 4px 12px rgba(33, 108, 126, 0.25)",
          }}
        >
          <PlusIcon /> Tambah Flyer / Banner
        </button>
      </div>

      {/* List Items */}
      {banners.length === 0 ? (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "3rem 1.5rem",
            borderRadius: "16px",
            border: "1px dashed var(--color-gray-300)",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 1rem", color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Belum ada flyer atau banner promo yang dibuat.
          </p>
          <button
            onClick={onAddNew}
            style={{
              padding: "0.65rem 1.3rem",
              backgroundColor: "var(--color-primary, #216c7e)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <PlusIcon /> Buat Item Pertama
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
          {banners.map((item) => (
            <PromoBannerCard
              key={item.id}
              item={item}
              onToggleActive={onToggleActive}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
