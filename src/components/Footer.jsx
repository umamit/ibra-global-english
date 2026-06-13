"use client";

import { useState, useEffect } from "react";
import { createClient } from "../utils/supabase/client";
import packageInfo from "../../package.json";

export default function Footer() {
  const supabase = createClient();
  const [footerSubtitle, setFooterSubtitle] = useState("Belajar Seru Lancar Bicara");

  useEffect(() => {
    async function fetchFooterSettings() {
      try {
        const { data, error } = await supabase
          .from('landing_settings')
          .select('key, value');
        if (error) throw error;
        if (data && data.length > 0) {
          const settings = {};
          data.forEach(item => {
            settings[item.key] = item.value;
          });
          if (settings.hero_subtitle) {
            setFooterSubtitle(settings.hero_subtitle.replace(/\s*\|\s*/g, " "));
          }
        }
      } catch (e) {
        // Terjadi galat, biarkan nilai fallback yang bekerja
      }
    }
    fetchFooterSettings();
  }, []);

  return (
    <footer>
      <div className="container footer-content">
        <div className="footer-logo">
          <img src="/assets/apple-touch-icon.png" alt="Ibra Global English Logo" loading="lazy" />
          <div className="footer-logo-text">
            <h3>Ibra Global English</h3>
            <p>{footerSubtitle}</p>
          </div>
        </div>
        <p className="footer-copyright" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
          <span>
            &copy; 2026 Ibra Global English. Di bawah naungan PT Ibra Global English. All rights reserved. 
            <span className="footer-version" style={{ opacity: 0.6, fontSize: "0.85em", marginLeft: "8px" }}>
              v{packageInfo.version}
            </span>
          </span>
          <span style={{ fontSize: "0.8rem", opacity: 0.7, display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
            <a href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Kebijakan Privasi</a>
            <span>&bull;</span>
            <a href="/terms" style={{ color: "inherit", textDecoration: "none" }}>Syarat & Ketentuan</a>
          </span>
        </p>
      </div>
    </footer>
  );
}
