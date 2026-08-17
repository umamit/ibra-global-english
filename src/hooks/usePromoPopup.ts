import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const EXCLUDED_PATHS = ["/admin", "/student", "/parent", "/tutor", "/login", "/auth"];
const SESSION_KEY = "promo_popup_dismissed";

export interface PromoBanner {
  id: string;
  badge_text?: string | null;
  title: string | null;
  message: string;
  image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
}

export function usePromoPopup() {
  const pathname = usePathname();
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!pathname) return;
    const isExcludedPath = EXCLUDED_PATHS.some((p) => pathname.startsWith(p));
    const isDigitalSubdomain = typeof window !== "undefined" && (
      window.location.hostname.startsWith("digital.")
    );

    if (isExcludedPath || isDigitalSubdomain) return;

    let timer: NodeJS.Timeout;
    const fetchBanners = async () => {
      try {
        const res = await fetch("/api/promo-banners");
        if (!res.ok) return;
        const data = await res.json();
        const list: PromoBanner[] = Array.isArray(data) ? data : data ? [data] : [];
        if (list.length === 0) return;

        setBanners(list);
        if (typeof window !== "undefined") {
          list.forEach((b) => {
            if (b.image_url) {
              const img = new Image();
              img.src = b.image_url;
            }
          });
        }

        timer = setTimeout(() => setVisible(true), 1200);
      } catch {
        // Ignored
      }
    };

    fetchBanners();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [pathname]);

  // Auto-slide interval every 5 seconds if multiple banners exist
  useEffect(() => {
    if (!visible || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [visible, banners.length]);

  const nextSlide = () => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (idx: number) => {
    if (idx >= 0 && idx < banners.length) {
      setCurrentIndex(idx);
    }
  };

  const dismiss = () => {
    setVisible(false);
  };

  const currentBanner = banners[currentIndex] || null;

  return {
    banners,
    banner: currentBanner,
    currentIndex,
    totalBanners: banners.length,
    visible,
    dismiss,
    nextSlide,
    prevSlide,
    goToSlide,
  };
}
