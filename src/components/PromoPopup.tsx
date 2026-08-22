"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { usePromoPopup } from "@/hooks/usePromoPopup";
import "./PromoPopup.css";

const EXCLUDED_PATHS = ["/admin", "/student", "/parent", "/tutor", "/login", "/auth"];
const subscribe = () => () => {};

export default function PromoPopup() {
  const isMounted = useSyncExternalStore(subscribe, () => true, () => false);
  const pathname = usePathname();
  const { banner, banners, currentIndex, totalBanners, visible, dismiss, nextSlide, prevSlide, goToSlide } = usePromoPopup();
  const [cleanHtml, setCleanHtml] = useState<string>("");

  useEffect(() => {
    if (!banner?.message) { setCleanHtml(""); return; }
    import("dompurify").then(({ default: DOMPurify }) => {
      setCleanHtml(DOMPurify.sanitize(banner.message));
    });
  }, [banner?.message]);

  if (!isMounted) return null;

  const isExcludedPath = pathname ? EXCLUDED_PATHS.some((p) => pathname.startsWith(p)) : false;

  if (isExcludedPath || !visible || !banner) return null;

  const isCleanMsgEmpty = !cleanHtml || cleanHtml === "<p></p>" || cleanHtml.trim() === "";
  const isFlyerOnly = Boolean(banner.image_url) && !banner.title?.trim() && isCleanMsgEmpty;

  return (
    <>
      <div className="promo-popup-backdrop" onClick={dismiss} aria-hidden="true" />
      <div
        className={`promo-popup-card ${isFlyerOnly ? "flyer-only" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={isFlyerOnly ? undefined : "promo-title"}
      >
        <button onClick={dismiss} className={`promo-popup-close-btn ${isFlyerOnly ? "floating" : ""}`} aria-label="Tutup promo">
          &times;
        </button>

        {isFlyerOnly ? (
          <div className="promo-flyer-wrapper">
            {banner.cta_url ? (
              <a href={banner.cta_url} target="_blank" rel="noopener noreferrer" onClick={dismiss} className="promo-flyer-link">
                <img src={banner.image_url!} alt="Flyer Promo" className="promo-flyer-full-img" loading="eager" fetchPriority="high" />
              </a>
            ) : (
              <img src={banner.image_url!} alt="Flyer Promo" className="promo-flyer-full-img" loading="eager" fetchPriority="high" />
            )}

            {totalBanners > 1 && (
              <>
                <button onClick={prevSlide} className="promo-carousel-nav-btn prev floating" aria-label="Slide sebelumnya">
                  &#10094;
                </button>
                <button onClick={nextSlide} className="promo-carousel-nav-btn next floating" aria-label="Slide selanjutnya">
                  &#10095;
                </button>
                <div className="promo-carousel-dots flyer-dots">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToSlide(idx)}
                      className={`promo-carousel-dot ${idx === currentIndex ? "active" : ""}`}
                      aria-label={`Lihat slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {banner.image_url && (
              <div className="promo-popup-image-container">
                <img src={banner.image_url} alt={banner.title || "Promo Ibra Global English"} className="promo-popup-image" loading="eager" fetchPriority="high" />
                {totalBanners > 1 && (
                  <>
                    <button onClick={prevSlide} className="promo-carousel-nav-btn prev" aria-label="Banner sebelumnya">
                      &#10094;
                    </button>
                    <button onClick={nextSlide} className="promo-carousel-nav-btn next" aria-label="Banner selanjutnya">
                      &#10095;
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="promo-popup-content">
              <div className="promo-popup-header-row">
                <div className="promo-popup-badge">{banner.badge_text || "PROMO KHUSUS"}</div>
                {totalBanners > 1 && (
                  <span className="promo-carousel-counter">
                    {currentIndex + 1} / {totalBanners}
                  </span>
                )}
              </div>

              <h3 id="promo-title" className="promo-popup-title">
                {banner.title || "Informasi Promo"}
              </h3>

              {banner.message && !isCleanMsgEmpty && (
                <div
                  className="promo-popup-description"
                  dangerouslySetInnerHTML={{ __html: cleanHtml || banner.message || "" }}
                />
              )}

              {banner.cta_url && (
                <a href={banner.cta_url} target="_blank" rel="noopener noreferrer" className="promo-popup-cta-btn" onClick={dismiss}>
                  {banner.cta_text || "Klaim Promo Sekarang"}
                </a>
              )}

              {totalBanners > 1 && (
                <div className="promo-carousel-dots">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToSlide(idx)}
                      className={`promo-carousel-dot ${idx === currentIndex ? "active" : ""}`}
                      aria-label={`Lihat slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

