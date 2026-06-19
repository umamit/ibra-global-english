"use client";

import { useState } from "react";
import packageInfo from "../../package.json";

export default function Footer({ initialSettings }) {
  const [footerSubtitle] = useState(() => {
    if (initialSettings?.hero_subtitle) {
      return initialSettings.hero_subtitle.replace(/\s*\|\s*/g, " ");
    }
    return "Belajar Seru Lancar Bicara";
  });

  return (
    <footer>
      <div className="footer-yellow-ribbon">
        <div className="container">
          <div className="footer-logo">
            <img src="/assets/apple-touch-icon.png" alt="Ibra Global English Logo" loading="lazy" />
            <div className="footer-logo-text">
              <h3>Ibra Global English</h3>
              <p>{footerSubtitle}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="container footer-content">
        <p className="footer-copyright" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", textAlign: "center" }}>
          <span style={{ maxWidth: "100%", wordBreak: "break-word" }}>
            &copy; 2026 Ibra Global English. Di bawah naungan PT Ibra Global English. All rights reserved. 
            <span className="footer-version" style={{ opacity: 0.6, fontSize: "0.85em", marginLeft: "8px" }}>
              v{packageInfo.version}
            </span>
          </span>
          <span style={{ fontSize: "0.8rem", opacity: 0.7, display: "flex", gap: "0.5rem 1rem", marginTop: "0.25rem", flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
            <a href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Kebijakan Privasi</a>
            <span style={{ opacity: 0.5 }}>&bull;</span>
            <a href="/terms" style={{ color: "inherit", textDecoration: "none" }}>Syarat & Ketentuan</a>
          </span>
        </p>
      </div>
    </footer>
  );
}
