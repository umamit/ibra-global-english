"use client";

import { useState, useEffect } from "react";

export default function Header({ theme, toggleTheme, hasMarquee }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <a href="/#home" className="logo-link" id="logo-nav">
            <img src="/assets/logo.png" alt="Ibra Global English Logo" className="logo-img" />
            <div className="logo-text">
              <h1>Ibra Global English</h1>
              <p>Belajar Seru Lancar Bicara</p>
            </div>
          </a>
          
          <nav className="nav-links" aria-label="Navigasi Utama">
            <a href="/#home" className="nav-link">Home</a>
            <a href="/#programs" className="nav-link">Program</a>
            <a href="/gallery" className="nav-link">Galeri</a>
            <a href="/placement-test" className="nav-link">Tes Penempatan</a>
            <a href="/#faq" className="nav-link">FAQ</a>
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
            
            <a href="/login" className="nav-btn-outline nav-btn-desktop" style={{ marginRight: "0.75rem" }}>Portal Login</a>
            <a href="/#contact" className="nav-btn nav-btn-desktop">Daftar Sekarang</a>
            
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
          if (e.target.id === "mobile-nav") {
            setIsMenuOpen(false);
          }
        }}
      >
        <div className="mobile-nav-content">
          <nav className="mobile-nav-links" aria-label="Navigasi Seluler">
            <a href="/#home" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Home</a>
            <a href="/#programs" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Program</a>
            <a href="/gallery" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Galeri</a>
            <a href="/placement-test" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Tes Penempatan</a>
            <a href="/#faq" className="mobile-link" onClick={() => setIsMenuOpen(false)}>FAQ</a>
            <a href="/login" className="mobile-link" onClick={() => setIsMenuOpen(false)} style={{ color: "var(--color-primary-dark)", fontWeight: "700" }}>Login Portal</a>
          </nav>
          <a href="/#contact" className="mobile-nav-btn mobile-link" onClick={() => setIsMenuOpen(false)}>Daftar Sekarang</a>
        </div>
      </div>
    </>
  );
}
