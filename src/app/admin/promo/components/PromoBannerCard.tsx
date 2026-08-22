"use client";

import React from "react";
import { PromoBannerItem } from "./PromoBannerList";

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const OffCircleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

interface PromoBannerCardProps {
  item: PromoBannerItem;
  onToggleActive: (banner: PromoBannerItem) => void;
  onEdit: (banner: PromoBannerItem) => void;
  onDelete: (id: string) => void;
}

export function PromoBannerCard({
  item,
  onToggleActive,
  onEdit,
  onDelete,
}: PromoBannerCardProps) {
  const isFlyer = Boolean(item.image_url) && !item.title?.trim();

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "16px",
        border: `1.5px solid ${item.is_active ? "rgba(33, 108, 126, 0.3)" : "var(--color-gray-200)"}`,
        padding: "1.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1.25rem",
        flexWrap: "wrap",
        opacity: item.is_active ? 1 : 0.65,
        transition: "all 0.2s ease",
      }}
    >
      {/* Left Side: Thumbnail & Details */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: "260px" }}>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt="Thumbnail"
            style={{
              width: "80px",
              height: "80px",
              objectFit: "cover",
              borderRadius: "12px",
              border: "1px solid var(--color-gray-200)",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "12px",
              backgroundColor: "var(--color-gray-100)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              color: "var(--color-gray-400)",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            Teks Saja
          </div>
        )}

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 800,
                padding: "0.15rem 0.55rem",
                borderRadius: "999px",
                backgroundColor: isFlyer ? "rgba(166, 136, 73, 0.15)" : "rgba(33, 108, 126, 0.12)",
                color: isFlyer ? "#8c6f32" : "var(--color-primary)",
                textTransform: "uppercase",
              }}
            >
              {isFlyer ? "Mode Flyer Saja" : "Mode Banner Teks"}
            </span>
            {item.badge_text && !isFlyer && (
              <span style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", fontWeight: 600 }}>
                • {item.badge_text}
              </span>
            )}
          </div>

          <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--color-gray-900)" }}>
            {item.title || "Flyer Gambar Promosi"}
          </h4>

          {item.cta_url && (
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "var(--color-gray-500)" }}>
              Link: <span style={{ color: "var(--color-primary)" }}>{item.cta_url}</span>
            </p>
          )}
        </div>
      </div>

      {/* Right Side: Actions & Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        {/* Independent On/Off Toggle Button */}
        <button
          type="button"
          onClick={() => onToggleActive(item)}
          style={{
            padding: "0.45rem 1rem",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: "0.82rem",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            backgroundColor: item.is_active ? "#d1fae5" : "var(--color-gray-200)",
            color: item.is_active ? "#065f46" : "var(--color-gray-600)",
            transition: "all 0.15s ease",
          }}
          title={item.is_active ? "Klik untuk mematikan popup ini" : "Klik untuk menyalakan popup ini"}
        >
          {item.is_active ? <CheckCircleIcon /> : <OffCircleIcon />}
          <span>{item.is_active ? "Aktif" : "Nonaktif"}</span>
        </button>

        <button
          type="button"
          onClick={() => onEdit(item)}
          style={{
            padding: "0.45rem 0.85rem",
            backgroundColor: "var(--color-gray-100)",
            border: "1px solid var(--color-gray-300)",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "0.82rem",
            color: "var(--color-gray-700)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          <EditIcon /> Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(item.id)}
          style={{
            padding: "0.45rem 0.85rem",
            backgroundColor: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "0.82rem",
            color: "#dc2626",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          <TrashIcon /> Hapus
        </button>
      </div>
    </div>
  );
}
