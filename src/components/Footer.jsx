"use client";
import "./Footer.css";

import { useState, useEffect } from "react";
import packageInfo from "../../package.json";

export default function Footer({ initialSettings }) {
  const [footerSubtitle] = useState(() => {
    if (initialSettings?.hero_subtitle) {
      return initialSettings.hero_subtitle.replace(/\s*\|\s*/g, " ");
    }
    return "Belajar Seru Lancar Bicara";
  });

  const [visitorCount, setVisitorCount] = useState(null);

  useEffect(() => {
    async function trackVisitor() {
      try {
        const tracked = localStorage.getItem("ibra_unique_visitor_tracked");
        let res;
        if (!tracked) {
          res = await fetch("/api/visitor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isNew: true })
          });
          if (res.ok) {
            localStorage.setItem("ibra_unique_visitor_tracked", "true");
          }
        } else {
          res = await fetch("/api/visitor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isNew: false })
          });
        }

        if (res && res.ok) {
          const data = await res.json();
          if (typeof data.count === "number") {
            setVisitorCount(data.count);
          }
        }
      } catch (err) {
        console.warn("Failed to track visitor count:", err);
      }
    }
    trackVisitor();
  }, []);

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
            <span style={{ opacity: 0.5 }}>&bull;</span>
            <a href="/formulir-offline" style={{ color: "inherit", textDecoration: "none" }}>Formulir Offline</a>
          </span>
          {visitorCount !== null && (
            <span style={{ fontSize: "0.8rem", opacity: 0.8, display: "inline-flex", alignItems: "center", gap: "0.25rem", marginTop: "0.5rem" }} className="footer-visitor-counter">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle" }}>
                <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {visitorCount.toLocaleString("id-ID")} Pengunjung Unik
            </span>
          )}
        </p>
      </div>
    </footer>
  );
}
