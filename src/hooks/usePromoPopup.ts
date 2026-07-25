import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const EXCLUDED_PATHS = ["/admin", "/student", "/parent", "/tutor", "/login", "/auth", "/digital-agency"];
const SESSION_KEY = "promo_popup_dismissed";

export interface PromoBanner {
  id: string;
  title: string | null;
  message: string;
  image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
}

export function usePromoPopup() {
  const pathname = usePathname();
  const [banner, setBanner] = useState<PromoBanner | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!pathname) return;
    const isExcludedPath = EXCLUDED_PATHS.some((p) => pathname.startsWith(p));
    const isDigitalSubdomain = typeof window !== "undefined" && (
      window.location.hostname.startsWith("digital.")
    );

    if (isExcludedPath || isDigitalSubdomain) return;
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY)) return;

    let timer: NodeJS.Timeout;
    const fetchBanner = async () => {
      try {
        const res = await fetch("/api/promo-banners");
        if (!res.ok) return;
        const data = await res.json();
        if (!data) return;
        setBanner(data);

        timer = setTimeout(() => setVisible(true), 3000);
      } catch {
        // Ignored
      }
    };

    fetchBanner();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [pathname]);

  const dismiss = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, "1");
    }
  };

  return {
    banner,
    visible,
    dismiss,
  };
}
