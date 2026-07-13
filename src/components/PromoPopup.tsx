"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Halaman yang tidak menampilkan popup
const EXCLUDED_PATHS = ["/admin", "/student", "/parent", "/tutor", "/login", "/auth", "/digital-agency"];

interface PromoBanner {
  id: string;
  title: string | null;
  message: string;
  image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
}

const SESSION_KEY = "promo_popup_dismissed";

export default function PromoPopup() {
  const pathname = usePathname();
  const [banner, setBanner] = useState<PromoBanner | null>(null);
  const [visible, setVisible] = useState(false);
  const [isExcluded, setIsExcluded] = useState(true);

  useEffect(() => {
    const isExcludedPath = EXCLUDED_PATHS.some((p) => pathname.startsWith(p));
    const isDigitalSubdomain = typeof window !== "undefined" && (
      window.location.hostname.startsWith("digital.")
    );
    setIsExcluded(isExcludedPath || isDigitalSubdomain);
  }, [pathname]);

  useEffect(() => {
    if (isExcluded) return;
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY)) return;

    const fetchBanner = async () => {
      try {
        const res = await fetch("/api/promo-banners");
        if (!res.ok) return;
        const data = await res.json();
        if (!data) return;
        setBanner(data);

        // Muncul setelah 3 detik
        const timer = setTimeout(() => setVisible(true), 3000);
        return () => clearTimeout(timer);
      } catch {
        // Gagal fetch = tidak tampilkan popup
      }
    };

    fetchBanner();
  }, [isExcluded]);

  const dismiss = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, "1");
    }
  };

  if (!visible || !banner) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          zIndex: 9999,
          animation: "promo-fade-in 0.3s ease",
        }}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={banner.title || "Promosi"}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10000,
          background: "var(--color-surface, #fff)",
          borderRadius: "20px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
          width: "min(480px, 92vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          animation: "promo-scale-in 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Tombol Tutup */}
        <button
          onClick={dismiss}
          className="promo-close-btn"
          aria-label="Tutup promosi"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "rgba(0,0,0,0.08)",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--color-gray-700, #444)",
            zIndex: 1,
            transition: "background 0.2s, outline 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.15)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.08)")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Gambar Banner (opsional) */}
        {banner.image_url && (
          <div style={{ borderRadius: "20px 20px 0 0", overflow: "hidden", lineHeight: 0 }}>
            <img
              src={banner.image_url}
              alt={banner.title || "Promo banner"}
              width={480}
              height={240}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "240px",
                objectFit: "cover",
                display: "block",
              }}
              loading="lazy"
            />
          </div>
        )}

        {/* Konten Teks */}
        <div style={{ padding: banner.image_url ? "1.5rem 1.75rem 1.75rem" : "2.25rem 1.75rem 1.75rem" }}>
          {banner.title && (
            <h2 style={{
              margin: "0 0 0.75rem",
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--color-primary-dark, #2c7a87)",
              lineHeight: 1.3,
            }}>
              {banner.title}
            </h2>
          )}

          <p style={{
            margin: "0 0 1.5rem",
            fontSize: "0.975rem",
            color: "var(--color-gray-600, #555)",
            lineHeight: 1.65,
          }}>
            {banner.message}
          </p>

          {/* Tombol CTA */}
          {banner.cta_text && banner.cta_url && (
            <a
              href={banner.cta_url}
              onClick={dismiss}
              className="promo-cta-btn"
              style={{
                display: "inline-block",
                padding: "0.7rem 1.5rem",
                background: "var(--color-primary, #4a9ba8)",
                color: "#fff",
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "0.9rem",
                textDecoration: "none",
                transition: "background 0.2s, transform 0.15s, outline 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-primary-dark, #2c7a87)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--color-primary, #4a9ba8)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {banner.cta_text} →
            </a>
          )}
        </div>
      </div>

      {/* Animasi CSS */}
      <style>{`
        @keyframes promo-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes promo-scale-in {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.88); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        .promo-close-btn:focus-visible {
          outline: 2px solid var(--color-primary, #216c7e);
          outline-offset: 2px;
        }
        .promo-cta-btn:focus-visible {
          outline: 2px solid var(--color-primary, #216c7e);
          outline-offset: 3px;
        }
      `}</style>
    </>
  );
}
