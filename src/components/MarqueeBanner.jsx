"use client";
import "./MarqueeBanner.css";

import { useState } from "react";

export default function MarqueeBanner({ initialSettings }) {
  const [text1, setText1] = useState(initialSettings?.marquee_text_1 || "Pendaftaran Siswa Baru Ibra Global English Bobong Telah Dibuka! Segera Daftarkan Putra-Putri Anda!");
  const [text2, setText2] = useState(initialSettings?.marquee_text_2 || "Dapatkan Metode Pembelajaran Bahasa Inggris Interaktif, Fun, dan Tutor Berpengalaman!");
  const [text3, setText3] = useState(initialSettings?.marquee_text_3 || "Ikuti Placement Test Online Secara Gratis di Website Kami dan Cari Tahu Tingkat Kemampuan Anda!");

  const marqueeItems = [text1, text2, text3];

  return (
    <div className="marquee-container">
      <div className="marquee-track">
        {/* Set 1 */}
        <div className="marquee-content-block">
          {marqueeItems.map((item, idx) => (
            <div key={`set1-${idx}`} className="marquee-item">
              <span className="marquee-divider">✨</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        {/* Set 2 (Duplicate for seamless loop) */}
        <div className="marquee-content-block">
          {marqueeItems.map((item, idx) => (
            <div key={`set2-${idx}`} className="marquee-item">
              <span className="marquee-divider">✨</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
