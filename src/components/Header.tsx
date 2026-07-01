"use client";
import "./Header.css";

import { z } from "zod";
import { useState, useEffect } from "react";
import Link from "next/link";

const headerPropsSchema = z.object({
  theme: z.enum(["light", "dark"]),
  toggleTheme: z.function(),
  hasMarquee: z.boolean().optional(),
});

type HeaderProps = z.infer<typeof headerPropsSchema>;

export default function Header({ theme, toggleTheme, hasMarquee }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

  // Handle scroll effect on header
  useEffect(() => {
    const handleScroll = () => {
      const sy = window.scrollY;
      // CSS variable untuk fallback kalkulasi top di browser non-scroll-driven
      document.documentElement.style.setProperty("--scroll-y", `${sy}px`);
      if (sy > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    handleScroll(); // Run once initially to sync scroll position
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
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header id="header" className={`${isScrolled ? "scrolled" : ""} ${hasMarquee ? "has-marquee" : ""}`}>
        <div className="container nav-container">
          <Link href="/#home" className="logo-link" id="logo-nav">
            <img src="/assets/logo.png" alt="Ibra Global English Logo" className="logo-img" />
            <div className="logo-text">
              <h1>Ibra Global English</h1>
              <p>Belajar Seru Lancar Bicara</p>
            </div>
          </Link>
          
          <nav className="nav-links" aria-label="Navigasi Utama">
            <Link href="/#home" className="nav-link">Home</Link>
            <div className="dropdown-container">
              <button className="nav-link dropdown-toggle" aria-haspopup="true" aria-expanded="false">
                Program <span className="dropdown-chevron">▼</span>
              </button>
              <div className="dropdown-menu">
                <Link href="/#programs" className="dropdown-item">Semua Program</Link>
                <Link href="/#kids-program" className="dropdown-item">Kids Program</Link>
                <Link href="/#teens-program" className="dropdown-item">Teens Program</Link>
                <Link href="/#fun-calistung" className="dropdown-item">Fun Calistung</Link>
              </div>
            </div>
            <Link href="/gallery" className="nav-link">Galeri</Link>
            <Link href="/placement-test" className="nav-link">Tes Penempatan</Link>
            <Link href="/#faq" className="nav-link">FAQ</Link>
          </nav>
          
          <div className="nav-right-group">
            <button 
              id="theme-toggle" 
              className="theme-toggle" 
              onClick={toggleTheme} 
              aria-label={theme === "light" ? "Aktifkan Mode Gelap" : "Aktifkan Mode Terang"}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{
                  transform: theme === "dark" ? "rotate(40deg)" : "rotate(0deg)",
                  transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  overflow: "visible",
                  width: "1.25rem",
                  height: "1.25rem"
                }}
              >
                <mask id="header-moon-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  <circle 
                    cx={theme === "dark" ? "12" : "30"} 
                    cy={theme === "dark" ? "4" : "0"} 
                    r="8" 
                    fill="black" 
                    style={{
                      transition: "cx 0.5s cubic-bezier(0.4, 0, 0.2, 1), cy 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  />
                </mask>
                
                <circle 
                  cx="12" 
                  cy="12" 
                  r={theme === "dark" ? "9" : "5"} 
                  fill="currentColor"
                  mask="url(#header-moon-mask)"
                  style={{
                    transition: "r 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                />
                
                <g 
                  stroke="currentColor"
                  style={{
                    opacity: theme === "dark" ? 0 : 1,
                    transform: theme === "dark" ? "scale(0.5)" : "scale(1)",
                    transformOrigin: "center",
                    transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                >
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </g>
              </svg>
            </button>
            
            <Link href="/login" className="nav-btn-outline nav-btn-desktop" style={{ marginRight: "0.75rem" }}>Portal Login</Link>
            <Link href="/#contact" className="nav-btn nav-btn-desktop">Daftar Sekarang</Link>
            
            <button 
              className="menu-toggle" 
              id="menu-toggle" 
              aria-label={isMenuOpen ? "Tutup Menu Navigasi" : "Buka Menu Navigasi"} 
              aria-expanded={isMenuOpen} 
              aria-controls="mobile-nav"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span style={{ transform: isMenuOpen ? "translateY(5px) rotate(45deg)" : "none" }}></span>
              <span style={{ opacity: isMenuOpen ? "0" : "1" }}></span>
              <span style={{ transform: isMenuOpen ? "translateY(-4px) rotate(-45deg)" : "none" }}></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div 
        className={`mobile-nav ${isMenuOpen ? "active" : ""}`} 
        id="mobile-nav" 
        aria-hidden={!isMenuOpen}
        onClick={(e) => {
          if ((e.target as HTMLElement).id === "mobile-nav") {
            setIsMenuOpen(false);
          }
        }}
      >
        <div className="mobile-nav-content">
          <nav className="mobile-nav-links" aria-label="Navigasi Seluler">
            <Link href="/#home" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
            
            <div className="mobile-dropdown-container" style={{ display: "flex", flexDirection: "column" }}>
              <button 
                className="mobile-link mobile-dropdown-toggle" 
                onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
              >
                Program <span className="dropdown-chevron" style={{ transform: isMobileDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}>▼</span>
              </button>
              <div className={`mobile-dropdown-menu ${isMobileDropdownOpen ? "active" : ""}`}>
                <Link href="/#programs" className="mobile-link mobile-dropdown-item" onClick={() => setIsMenuOpen(false)}>Semua Program</Link>
                <Link href="/#kids-program" className="mobile-link mobile-dropdown-item" onClick={() => setIsMenuOpen(false)}>Kids Program</Link>
                <Link href="/#teens-program" className="mobile-link mobile-dropdown-item" onClick={() => setIsMenuOpen(false)}>Teens Program</Link>
                <Link href="/#fun-calistung" className="mobile-link mobile-dropdown-item" onClick={() => setIsMenuOpen(false)}>Fun Calistung</Link>
              </div>
            </div>

            <Link href="/gallery" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Galeri</Link>
            <Link href="/placement-test" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Tes Penempatan</Link>
            <Link href="/#faq" className="mobile-link" onClick={() => setIsMenuOpen(false)}>FAQ</Link>
            <Link href="/login" className="mobile-link" onClick={() => setIsMenuOpen(false)} style={{ color: "var(--color-primary-dark)", fontWeight: "700" }}>Login Portal</Link>
          </nav>
          <Link href="/#contact" className="mobile-nav-btn mobile-link" onClick={() => setIsMenuOpen(false)}>Daftar Sekarang</Link>
        </div>
      </div>
    </>
  );
}
