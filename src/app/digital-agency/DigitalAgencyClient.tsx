"use client";

import React, { useEffect, useRef } from "react";
import styles from "./digital-agency.module.css";
import TechLogoGrid from "./components/TechLogoGrid";
import WorkingProcess from "./components/WorkingProcess";
import AboutUs from "./components/AboutUs";
import AgencyHero from "./components/AgencyHero";
import AgencyFeatures from "./components/AgencyFeatures";
import AgencyPortfolio from "./components/AgencyPortfolio";
import AgencyPricing from "./components/AgencyPricing";
import AgencyFaq from "./components/AgencyFaq";
import AgencyOrderForm from "./components/AgencyOrderForm";

export default function DigitalAgencyClient() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth <= 768) return;

    let ctx: any;
    import("gsap").then((gsapModule) => {
      const gsap = gsapModule.default;
      import("gsap/ScrollTrigger").then((stModule) => {
        const ScrollTrigger = stModule.ScrollTrigger || stModule.default;
        gsap.registerPlugin(ScrollTrigger);

        if (!containerRef.current) return;

        ctx = gsap.context(() => {
          const cards = containerRef.current?.querySelectorAll(`.${styles.card}, .${styles.pricingCard}`);
          cards?.forEach((card, idx) => {
            const yOffset = (idx % 2 === 0) ? -20 : -10;
            gsap.fromTo(
              card,
              { y: 20 },
              {
                y: yOffset,
                ease: "none",
                scrollTrigger: {
                  trigger: card,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1.2,
                },
              }
            );
          });
        }, containerRef);
      });
    });

    return () => {
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <div className={styles.pageWrapper} ref={containerRef}>
      {/* ── Navigation Bar ── */}
      <header className={styles.navbar}>
        <div className={styles.navContainer}>
          <a href="#" className={styles.logo}>
            <img 
              src="/assets/ibra-digital-logo-v3.png" 
              alt="Ibra Digital Engineering Logo" 
              width={147} 
              height={80} 
              className={styles.logoImg} 
            />
            <span className={styles.logoText}>IBRA Digital Engineering</span>
          </a>
          <nav className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>Keunggulan</a>
            <a href="#portfolio" className={styles.navLink}>Portofolio</a>
            <a href="#pricing" className={styles.navLink}>Paket Harga</a>
            <a href="#faq" className={styles.navLink}>FAQ</a>
            <a href="#order" className={styles.navLink}>Pesan Sekarang</a>
          </nav>
          <a href="#order" className={styles.navCTA}>Konsultasi Gratis</a>
        </div>
      </header>

      <main>
        <AgencyHero />
        <AboutUs />
        <TechLogoGrid />
        <AgencyFeatures />
        <WorkingProcess />
        <AgencyPortfolio />
        <AgencyPricing />
        <AgencyFaq />
        <AgencyOrderForm />
      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
          <img 
            src="/assets/ibra-digital-logo-v3.png" 
            alt="Ibra Digital Engineering Logo" 
            width={156} 
            height={85} 
            loading="lazy"
          />
        </div>
        <p style={{ color: "var(--color-gray-700)", fontWeight: 600 }}>&copy; {new Date().getFullYear()} Ibra Digital Engineering. All rights reserved.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "10px", fontSize: "0.88rem" }}>
          <a href="/digital-agency/terms" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: "600" }}>Syarat & Ketentuan</a>
          <span style={{ color: "rgba(33, 108, 126, 0.3)" }}>|</span>
          <a href="/digital-agency/privacy" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: "600" }}>Kebijakan Privasi</a>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--color-gray-600)", marginTop: "10px" }}>
          Mitra resmi pengembangan teknologi <a href="https://www.ibraglobalenglish.uk" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary-dark)", textDecoration: "none", fontWeight: "800" }}>Ibra Global English Bobong</a>.
        </p>
      </footer>

      {/* ── Floating WhatsApp Button ── */}
      <a
        href="https://wa.me/6281357001357"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.floatingWhatsapp}
        aria-label="Hubungi kami melalui WhatsApp"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.233-1.372a9.994 9.994 0 0 0 4.78 1.217h.005c5.505 0 9.99-4.478 9.99-9.986 0-2.67-1.037-5.18-2.92-7.062A9.925 9.925 0 0 0 12.012 2zm5.835 14.165c-.253.714-1.47 1.3-2.025 1.385-.482.072-1.107.13-3.21-.75-2.69-1.125-4.394-3.87-4.528-4.05-.135-.18-1.078-1.432-1.078-2.73 0-1.3.678-1.936.92-2.2.202-.22.506-.275.759-.275.253 0 .506.002.72.013.23.011.53-.088.828.627.303.73.99 2.42 1.078 2.6.088.18.135.385.023.605-.11.22-.242.36-.375.528-.135.165-.285.344-.12.632.165.286.733 1.22 1.572 1.97.165.14.333.286.58.385.247.1.393.077.54-.088.146-.165.626-.732.793-.984.168-.253.337-.21.56-.126.225.082 1.433.682 1.68.803s.416.182.478.292c.062.11.062.632-.19 1.347z" />
        </svg>
      </a>
    </div>
  );
}


      {/* ── Footer (Full Bleed Edge-to-Edge Soft Light Teal #eef6f8) ── */}
      <footer className={styles.footer}>
        <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
          <img 
            src="/assets/ibra-digital-logo-v3.png" 
            alt="Ibra Digital Engineering Logo" 
            width={156} 
            height={85} 
            loading="lazy"
          />
        </div>
        <p style={{ color: "var(--color-gray-700)", fontWeight: 600 }}>&copy; {new Date().getFullYear()} Ibra Digital Engineering. All rights reserved.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "10px", fontSize: "0.88rem" }}>
          <a href="/digital-agency/terms" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: "600" }}>Syarat & Ketentuan</a>
          <span style={{ color: "rgba(33, 108, 126, 0.3)" }}>|</span>
          <a href="/digital-agency/privacy" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: "600" }}>Kebijakan Privasi</a>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--color-gray-600)", marginTop: "10px" }}>
          Mitra resmi pengembangan teknologi <a href="https://www.ibraglobalenglish.uk" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary-dark)", textDecoration: "none", fontWeight: "800" }}>Ibra Global English Bobong</a>.
        </p>
      </footer>

      {/* ── Floating WhatsApp Button ── */}
      <a
        href="https://wa.me/6281357001357"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.floatingWhatsapp}
        aria-label="Hubungi kami melalui WhatsApp"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.233-1.372a9.994 9.994 0 0 0 4.78 1.217h.005c5.505 0 9.99-4.478 9.99-9.986 0-2.67-1.037-5.18-2.92-7.062A9.925 9.925 0 0 0 12.012 2zm5.835 14.165c-.253.714-1.47 1.3-2.025 1.385-.482.072-1.107.13-3.21-.75-2.69-1.125-4.394-3.87-4.528-4.05-.135-.18-1.078-1.432-1.078-2.73 0-1.3.678-1.936.92-2.2.202-.22.506-.275.759-.275.253 0 .506.002.72.013.23.011.53-.088.828.627.303.73.99 2.42 1.078 2.6.088.18.135.385.023.605-.11.22-.242.36-.375.528-.135.165-.285.344-.12.632.165.286.733 1.22 1.572 1.97.165.14.333.286.58.385.247.1.393.077.54-.088.146-.165.626-.732.793-.984.168-.253.337-.21.56-.126.225.082 1.433.682 1.68.803s.416.182.478.292c.062.11.062.632-.19 1.347z" />
        </svg>
      </a>
    </div>
  );
}
