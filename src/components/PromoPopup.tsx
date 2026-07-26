"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { usePromoPopup } from "@/hooks/usePromoPopup";

const EXCLUDED_PATHS = ["/admin", "/student", "/parent", "/tutor", "/login", "/auth", "/digital-agency"];

export default function PromoPopup() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { banner, visible, dismiss } = usePromoPopup();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isExcludedPath = pathname ? EXCLUDED_PATHS.some((p) => pathname.startsWith(p)) : false;

  if (isExcludedPath || !visible || !banner) return null;

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
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Close Button */}
        <button
          onClick={dismiss}
          aria-label="Tutup promosi"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "rgba(0,0,0,0.12)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-text, #333)",
            zIndex: 1,
          }}
        >
          <i className="fi fi-rr-cross-small"></i>
        </button>

        {/* Banner Image */}
        {banner.image_url && (
          <img
            src={banner.image_url}
            alt={banner.title || "Gambar Promosi"}
            style={{
              width: "100%",
              maxHeight: "220px",
              objectFit: "cover",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px",
            }}
          />
        )}

        {/* Content */}
        <div style={{ padding: "1.5rem" }}>
          {banner.title && (
            <h3
              style={{
                margin: "0 0 0.5rem",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--color-primary, #216c7e)",
                textAlign: "center",
              }}
            >
              {banner.title}
            </h3>
          )}
          <p
            style={{
              margin: "0 0 1.25rem",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              color: "var(--color-text-secondary, #555)",
              whiteSpace: "pre-line",
              textAlign: "justify",
            }}
          >
            {banner.message}
          </p>

          {banner.cta_text && banner.cta_url && (
            <a
              href={banner.cta_url}
              target={banner.cta_url.startsWith("http") ? "_blank" : "_self"}
              rel="noopener noreferrer"
              onClick={dismiss}
              style={{
                display: "block",
                textAlign: "center",
                background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
                color: "#fff",
                fontWeight: 700,
                padding: "0.75rem 1.25rem",
                borderRadius: "12px",
                textDecoration: "none",
                fontSize: "0.95rem",
              }}
            >
              {banner.cta_text}
            </a>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes promo-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes promo-scale-in {
          from { opacity: 0; transform: translate(-50%, -46%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}
