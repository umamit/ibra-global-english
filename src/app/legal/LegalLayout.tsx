import React from "react";
import Link from "next/link";

interface LegalLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  lastUpdated?: string;
  publisher?: string;
}

export default function LegalLayout({ title, subtitle, children, lastUpdated = "13 Juni 2026", publisher = "PT Ibra Global English" }: LegalLayoutProps) {
  return (
    <div style={{ backgroundColor: "var(--color-gray-50, #f5f5f7)", minHeight: "100vh", padding: "3.5rem 1.5rem", color: "var(--color-gray-800)", fontFamily: "var(--font-sans), sans-serif" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Navigation & Action Bar */}
        <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <Link href="/" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.95rem" }}>
            <i className="fi fi-rr-arrow-left"></i>
            <span>Kembali ke Beranda</span>
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.5rem 1rem",
              borderRadius: "9999px",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              background: "var(--color-white)",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
            }}
          >
            <i className="fi fi-rr-print"></i>
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>

        {/* Legal Card */}
        <div style={{
          backgroundColor: "var(--color-white, #ffffff)",
          padding: "3.5rem 3rem",
          borderRadius: "var(--radius-2xl, 24px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.03), 0 20px 48px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0, 0, 0, 0.06)",
          transition: "transform 0.35s ease, box-shadow 0.35s ease",
        }}>
          <div style={{ borderBottom: "1px solid var(--color-gray-150, #e2e8f0)", paddingBottom: "1.75rem", marginBottom: "2.25rem" }}>
            <h1 style={{ fontSize: "2.125rem", fontWeight: "900", color: "var(--color-primary-dark, #164d57)", marginBottom: "0.6rem", letterSpacing: "-0.025em" }}>
              {title}
            </h1>
            <p style={{ color: "var(--color-gray-500)", fontSize: "0.875rem", margin: 0, fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <i className="fi fi-rr-clock"></i>
              <span>Terakhir Diperbarui: {lastUpdated} | {publisher}</span>
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", lineHeight: "1.75", fontSize: "0.975rem" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
