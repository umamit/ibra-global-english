"use client";

import React, { useMemo } from "react";
import "./MarqueeBanner.css";

interface MarqueeBannerProps {
  initialSettings?: any;
}

function MarqueeIcon({ iconType }: { iconType?: string }) {
  switch (iconType) {
    case "megaphone":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 11 18-5v12L3 14v-3z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
      );
    case "star":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    case "bell":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      );
    case "flame":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );
    case "check":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case "sparkle":
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M12 2l2.4 7.2L21.6 12l-7.2 2.4L12 21.6l-2.4-7.2L2.4 12l7.2-2.4L12 2z" />
        </svg>
      );
  }
}

export default function MarqueeBanner({ initialSettings }: MarqueeBannerProps) {
  const iconType = initialSettings?.marquee_icon || "sparkle";

  const marqueeItems = useMemo(() => {
    const raw = initialSettings?.marquee_items;
    if (raw) {
      if (Array.isArray(raw)) {
        const filtered = raw.filter((s) => typeof s === "string" && s.trim().length > 0);
        if (filtered.length > 0) return filtered;
      } else if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter((s) => typeof s === "string" && s.trim().length > 0);
            if (filtered.length > 0) return filtered;
          }
        } catch {
          // Ignored fallback
        }
      }
    }

    const fallbackList = [
      initialSettings?.marquee_text_1 || "Pendaftaran Siswa Baru Ibra Global English Bobong Telah Dibuka! Segera Daftarkan Putra-Putri Anda!",
      initialSettings?.marquee_text_2 || "Dapatkan Metode Pembelajaran Bahasa Inggris Interaktif, Fun, dan Tutor Berpengalaman!",
      initialSettings?.marquee_text_3 || "Ikuti Placement Test Online Secara Gratis di Website Kami dan Cari Tahu Tingkat Kemampuan Anda!"
    ].filter((s) => s && s.trim().length > 0);

    return fallbackList.length > 0 ? fallbackList : ["Selamat Datang di Ibra Global English Bobong"];
  }, [initialSettings]);

  return (
    <div className="marquee-container" aria-label="Pengumuman Berjalan">
      <div className="marquee-track">
        {/* Set 1 */}
        <div className="marquee-content-block">
          {marqueeItems.map((item, idx) => (
            <div key={`set1-${idx}`} className="marquee-item">
              <span className="marquee-divider" aria-hidden="true">
                <MarqueeIcon iconType={iconType} />
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        {/* Set 2 (Seamless loop duplicate) */}
        <div className="marquee-content-block" aria-hidden="true">
          {marqueeItems.map((item, idx) => (
            <div key={`set2-${idx}`} className="marquee-item">
              <span className="marquee-divider">
                <MarqueeIcon iconType={iconType} />
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
