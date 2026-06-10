"use client";

import { useState, useEffect } from "react";

export default function Header({ theme, toggleTheme, hasMarquee }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle scroll effect on header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
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
          <a href="#home" className="logo-link" id="logo-nav">
            <img src="/assets/logo.png" alt="Ibra Global English Logo" className="logo-img" />
            <div className="logo-text">
              <h1>Ibra Global English</h1>
              <p>Belajar Seru Lancar Bicara</p>
            </div>
          </a>
          
          <nav className="nav-links" aria-label="Navigasi Utama">
            <a href="#home" className="nav-link">Home</a>
            <a href="#programs" className="nav-link">Program</a>
            <a href="#benefits" className="nav-link">Keunggulan</a>
            <a href="#gallery" className="nav-link">Galeri</a>
            <a href="#testimonials" className="nav-link">Testimoni</a>
            <a href="#faq" className="nav-link">FAQ</a>
            <a href="#contact" className="nav-link">Kontak</a>
          </nav>
          
          <div className="nav-right-group">
            <button 
              id="theme-toggle" 
              className="theme-toggle" 
              onClick={toggleTheme} 
              aria-label={theme === "light" ? "Aktifkan Mode Gelap" : "Aktifkan Mode Terang"}
            >
              <svg className="sun-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>
              <svg className="moon-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            </button>
            
            <a href="/login" className="nav-btn-outline nav-btn-desktop" style={{ marginRight: "0.75rem" }}>Portal Login</a>
            <a href="#contact" className="nav-btn nav-btn-desktop">Daftar Sekarang</a>
            
            <button 
              className="menu-toggle" 
              id="menu-toggle" 
              aria-label="Buka Menu" 
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
            <a href="#home" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Home</a>
            <a href="#programs" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Program</a>
            <a href="#benefits" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Keunggulan</a>
            <a href="#gallery" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Galeri</a>
            <a href="#testimonials" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Testimoni</a>
            <a href="#faq" className="mobile-link" onClick={() => setIsMenuOpen(false)}>FAQ</a>
            <a href="#contact" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Kontak</a>
            <a href="/login" className="mobile-link" onClick={() => setIsMenuOpen(false)} style={{ color: "var(--color-primary-dark)", fontWeight: "700" }}>Login Portal</a>
          </nav>
          <a href="#contact" className="mobile-nav-btn mobile-link" onClick={() => setIsMenuOpen(false)}>Daftar Sekarang</a>
        </div>
      </div>
    </>
  );
}
