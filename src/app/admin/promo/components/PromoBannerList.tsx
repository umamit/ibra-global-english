"use client";

import React from "react";

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
  onToggleActive: (banner: PromoBannerItem) => void;
  onEdit: (banner: PromoBannerItem) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export function PromoBannerList({
  banners,
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
              ? `${activeCount} item aktif berganti otomatis tiap 2 detik di popup`
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
            gap: "0.4rem",
            boxShadow: "0 4px 12px rgba(33, 108, 126, 0.25)",
          }}
        >
          + Tambah Flyer / Banner
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
              padding: "0.6rem 1.2rem",
              backgroundColor: "var(--color-primary, #216c7e)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            + Buat Item Pertama
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
          {banners.map((item) => {
            const isFlyer = Boolean(item.image_url) && !item.title?.trim();

            return (
              <div
                key={item.id}
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
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  {/* Independent On/Off Toggle Button */}
                  <button
                    type="button"
                    onClick={() => onToggleActive(item)}
                    style={{
                      padding: "0.5rem 1.1rem",
                      borderRadius: "999px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 800,
                      fontSize: "0.82rem",
                      backgroundColor: item.is_active ? "#d1fae5" : "var(--color-gray-200)",
                      color: item.is_active ? "#065f46" : "var(--color-gray-600)",
                      transition: "all 0.15s ease",
                    }}
                    title={item.is_active ? "Klik untuk mematikan popup ini" : "Klik untuk menyalakan popup ini"}
                  >
                    {item.is_active ? "● Aktif" : "○ Nonaktif"}
                  </button>

                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    style={{
                      padding: "0.5rem 0.9rem",
                      backgroundColor: "var(--color-gray-100)",
                      border: "1px solid var(--color-gray-300)",
                      borderRadius: "10px",
                      fontWeight: 600,
                      fontSize: "0.82rem",
                      color: "var(--color-gray-700)",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    style={{
                      padding: "0.5rem 0.9rem",
                      backgroundColor: "#fee2e2",
                      border: "1px solid #fecaca",
                      borderRadius: "10px",
                      fontWeight: 600,
                      fontSize: "0.82rem",
                      color: "#dc2626",
                      cursor: "pointer",
                    }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
