"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import DOMPurify from "dompurify";
import { usePromoPopup } from "@/hooks/usePromoPopup";
import "./PromoPopup.css";

const EXCLUDED_PATHS = ["/admin", "/student", "/parent", "/tutor", "/login", "/auth", "/digital-agency"];
const subscribe = () => () => {};

export default function PromoPopup() {
  const isMounted = useSyncExternalStore(subscribe, () => true, () => false);
  const pathname = usePathname();
  const { banner, visible, dismiss } = usePromoPopup();

  if (!isMounted) return null;

  const isExcludedPath = pathname ? EXCLUDED_PATHS.some((p) => pathname.startsWith(p)) : false;

  if (isExcludedPath || !visible || !banner) return null;

  const cleanMessageHtml = typeof window !== "undefined" && banner.message ? DOMPurify.sanitize(banner.message) : banner.message;

  return (
    <>
      <div className="promo-popup-backdrop" onClick={dismiss} aria-hidden="true" />
      <div className="promo-popup-card" role="dialog" aria-modal="true" aria-labelledby="promo-title">
        <button onClick={dismiss} className="promo-popup-close-btn" aria-label="Tutup promo">
          &times;
        </button>

        {banner.image_url && (
          <div className="promo-popup-image-container">
            <img src={banner.image_url} alt={banner.title || "Promo Ibra Global English"} className="promo-popup-image" />
          </div>
        )}

        <div className="promo-popup-content">
          <div className="promo-popup-badge">{banner.badge_text || "PROMO KHUSUS"}</div>

          <h3 id="promo-title" className="promo-popup-title">
            {banner.title || "Informasi Promo"}
          </h3>

          {banner.message && (
            <div
              className="promo-popup-description"
              dangerouslySetInnerHTML={{ __html: cleanMessageHtml || "" }}
            />
          )}

          {banner.cta_url && (
            <a href={banner.cta_url} target="_blank" rel="noopener noreferrer" className="promo-popup-cta-btn" onClick={dismiss}>
              {banner.cta_text || "Klaim Promo Sekarang"}
            </a>
          )}
        </div>
      </div>
    </>
  );
}
