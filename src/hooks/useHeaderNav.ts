import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_NAVIGATION_MENU, NavigationItem } from "@/utils/fallbackData";

export function useHeaderNav(initialSettings?: any) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const pathname = usePathname();

  const [navigationMenu] = useState<NavigationItem[]>(() => {
    if (initialSettings && initialSettings.landing_navigation_menu) {
      try {
        const parsed = typeof initialSettings.landing_navigation_menu === "string"
          ? JSON.parse(initialSettings.landing_navigation_menu)
          : initialSettings.landing_navigation_menu;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_NAVIGATION_MENU;
  });

  // Scrollspy logic
  useEffect(() => {
    if (pathname === "/about") {
      const t = setTimeout(() => setActiveSection("about"), 0);
      return () => clearTimeout(t);
    }
    if (pathname === "/gallery") {
      const t = setTimeout(() => setActiveSection("gallery"), 0);
      return () => clearTimeout(t);
    }
    if (pathname === "/placement-test") {
      const t = setTimeout(() => setActiveSection("placement-test"), 0);
      return () => clearTimeout(t);
    }
    if (pathname === "/calendar") {
      const t = setTimeout(() => setActiveSection("calendar"), 0);
      return () => clearTimeout(t);
    }
    if (pathname === "/kemitraan") {
      const t = setTimeout(() => setActiveSection("kemitraan"), 0);
      return () => clearTimeout(t);
    }
    if (pathname !== "/") {
      const t = setTimeout(() => setActiveSection(""), 0);
      return () => clearTimeout(t);
    }

    const handleScrollspy = () => {
      const scrollPosition = window.scrollY + 140;
      const sections = ["home", "programs", "faq"];

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 20) {
        setActiveSection("faq");
        return;
      }

      for (const sec of sections) {
        const el = document.getElementById(sec);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sec);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScrollspy, { passive: true });
    handleScrollspy();

    return () => window.removeEventListener("scroll", handleScrollspy);
  }, [pathname]);

  // Handle scroll effect on header
  useEffect(() => {
    const handleScroll = () => {
      const sy = window.scrollY;
      document.documentElement.style.setProperty("--scroll-y", `${sy}px`);
      if (sy > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Close mobile menu on screen resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1100) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    isScrolled,
    isMenuOpen,
    setIsMenuOpen,
    isMobileDropdownOpen,
    setIsMobileDropdownOpen,
    activeSection,
    navigationMenu,
    pathname,
  };
}
