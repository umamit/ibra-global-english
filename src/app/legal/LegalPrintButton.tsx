"use client";

import React from "react";

export default function LegalPrintButton() {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.print();
        }
      }}
      aria-label="Cetak atau Simpan PDF"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.5rem 1rem",
        borderRadius: "9999px",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        background: "var(--color-white, #ffffff)",
        fontSize: "0.85rem",
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
      }}
    >
      <i className="fi fi-rr-print"></i>
      <span>Cetak / Simpan PDF</span>
    </button>
  );
}
