"use client";

import { useEffect, useState } from "react";
import { createClient } from "../utils/supabase/client";

export default function MarqueeBanner() {
  const supabase = createClient();
  const [text1, setText1] = useState("Pendaftaran Siswa Baru Ibra Global English Bobong Telah Dibuka! Segera Daftarkan Putra-Putri Anda!");
  const [text2, setText2] = useState("Dapatkan Metode Pembelajaran Bahasa Inggris Interaktif, Fun, dan Tutor Berpengalaman!");
  const [text3, setText3] = useState("Ikuti Placement Test Online Secara Gratis di Website Kami dan Cari Tahu Tingkat Kemampuan Anda!");

  useEffect(() => {
    async function fetchMarqueeSettings() {
      try {
        const { data, error } = await supabase
          .from("landing_settings")
          .select("key, value");
        if (error) throw error;
        if (data && data.length > 0) {
          const settings = {};
          data.forEach(item => {
            settings[item.key] = item.value;
          });
          if (settings.marquee_text_1) setText1(settings.marquee_text_1);
          if (settings.marquee_text_2) setText2(settings.marquee_text_2);
          if (settings.marquee_text_3) setText3(settings.marquee_text_3);
        }
      } catch (e) {
        console.warn("Gagal memuat teks marquee dari database. Menggunakan data default.", e);
      }
    }
    fetchMarqueeSettings();
  }, []);

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
