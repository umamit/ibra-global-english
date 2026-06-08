"use client";

import { useState, useEffect } from "react";
import { createClient } from "../utils/supabase/client";
import packageInfo from "../../package.json";

export default function Footer() {
  const supabase = createClient();
  const [footerSubtitle, setFooterSubtitle] = useState("Belajar Seru Lancar Bicara");
  const [footerDesc, setFooterDesc] = useState("Kursus Bahasa Inggris Offline Terbaik di Bobong");

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
          if (settings.hero_desc) {
            // Jika deskripsi sangat panjang, batasi di footer demi estetika tata letak
            const cleanDesc = settings.hero_desc.length > 120 
              ? settings.hero_desc.substring(0, 120) + "..."
              : settings.hero_desc;
            setFooterDesc(cleanDesc);
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
          <img src="/assets/logo.png" alt="Ibra Global English Logo" loading="lazy" />
          <div className="footer-logo-text">
            <h3>Ibra Global English</h3>
            <p>{footerSubtitle}</p>
          </div>
        </div>
        <p className="footer-desc">{footerDesc}</p>
        <p className="footer-copyright">
          &copy; 2026 Ibra Global English. All rights reserved. 
          <span className="footer-version" style={{ opacity: 0.6, fontSize: "0.85em", marginLeft: "8px" }}>
            v{packageInfo.version}
          </span>
        </p>
      </div>
    </footer>
  );
}
