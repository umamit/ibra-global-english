import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const EXCLUDED_PATHS = ["/admin", "/student", "/parent", "/tutor", "/login", "/auth"];

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
  const [intervalMs, setIntervalMs] = useState<number>(5000);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!pathname) return;
    const isExcludedPath = EXCLUDED_PATHS.some((p) => pathname.startsWith(p));
    if (isExcludedPath) return;

    let timer: NodeJS.Timeout;
    const fetchBanners = async () => {
      try {
        const res = await fetch("/api/promo-banners");
        if (!res.ok) return;
        const json = await res.json();

        const list: PromoBanner[] = Array.isArray(json)
          ? json
          : Array.isArray(json.banners)
          ? json.banners
          : json.data || [];

        if (list.length === 0) return;

        if (json && typeof json.interval === "number" && json.interval > 0) {
          setIntervalMs(json.interval * 1000);
        }

        setBanners(list);
        if (typeof window !== "undefined") {
          list.forEach((b) => {
            if (b.image_url) {
              const img = new Image();
              img.src = b.image_url;
            }
          });
        }

        timer = setTimeout(() => setVisible(true), 1000);
      } catch {
        // Ignored
      }
    };

    fetchBanners();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [pathname]);

  // Auto-slide interval based on dynamic duration if multiple banners exist
  useEffect(() => {
    if (!visible || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [visible, banners.length, intervalMs]);

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
