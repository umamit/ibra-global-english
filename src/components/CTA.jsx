"use client";

import { useEffect, useState } from "react";
import { createClient } from "../utils/supabase/client";

export default function CTA() {
  const supabase = createClient();
  const [ctaTag, setCtaTag] = useState("Promo Terbatas!");
  const [ctaTitle, setCtaTitle] = useState("Kuasai Bahasa Inggris Lebih Cepat di Bobong & Jadi Percaya Diri!");
  const [ctaDesc, setCtaDesc] = useState("Dapatkan tes penempatan level (Placement Test) & bimbingan belajar gratis sekarang juga di Ibra Global English Bobong. Kuota sangat terbatas!");
  const [ctaBrochureImage, setCtaBrochureImage] = useState("/assets/brochure.png");

  useEffect(() => {
    async function fetchCTASettings() {
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
          if (settings.cta_tag) setCtaTag(settings.cta_tag);
          if (settings.cta_title) setCtaTitle(settings.cta_title);
          if (settings.cta_desc) setCtaDesc(settings.cta_desc);
          if (settings.cta_brochure_image) setCtaBrochureImage(settings.cta_brochure_image);
        }
      } catch (e) {
        console.warn("Gagal memuat pengaturan CTA dari database. Menggunakan data default.", e);
      }
    }
    fetchCTASettings();
  }, []);

  const getCanvaEmbedUrl = (url) => {
    if (!url) return null;
    
    // Jika berupa embed code/iframe penuh, ekstrak src-nya
    if (url.includes("<iframe")) {
      const match = url.match(/src="([^"]+)"/);
      if (match && match[1]) return match[1];
    }
    
    // Jika berupa link share biasa dari Canva
    if (url.includes("canva.com/design/")) {
      let cleanUrl = url.split("?")[0];
      if (cleanUrl.endsWith("/view") || cleanUrl.endsWith("/watch")) {
        return `${cleanUrl}?embed`;
      }
      return `${cleanUrl}/view?embed`;
    }
    
    return null;
  };

  const renderTitle = (text) => {
    if (text.includes('&')) {
      const [part1, part2] = text.split('&');
      return (
        <>
          {part1} & <span className="highlight-reveal">{part2}</span>
        </>
      );
    }
    return text;
  };

  const canvaEmbedUrl = getCanvaEmbedUrl(ctaBrochureImage);

  return (
    <section className="cta-section" data-aos="fade-up">
      <div className="container" style={{ display: "flex", flexDirection: "column", gap: "2.5rem", alignItems: "center" }}>
        {/* Dynamic Brochure Display Card */}
        {ctaBrochureImage && (
          <div 
            className="cta-brochure-card" 
            style={{ 
              width: "100%", 
              maxWidth: "850px", 
              borderRadius: "16px", 
              overflow: "hidden", 
              boxShadow: "var(--shadow-xl)",
              border: "4px solid var(--color-white)",
              transition: "transform var(--transition-normal)",
              aspectRatio: canvaEmbedUrl ? "16 / 9" : "auto",
              position: "relative"
            }}
            data-aos="zoom-in"
          >
            {canvaEmbedUrl ? (
              <iframe 
                src={canvaEmbedUrl} 
                loading="lazy" 
                style={{ 
                  position: "absolute", 
                  top: 0, 
                  left: 0, 
                  width: "100%", 
                  height: "100%", 
                  border: "none", 
                  padding: 0, 
                  margin: 0 
                }} 
                allowFullScreen 
                allow="fullscreen"
              />
            ) : (
              <img 
                src={ctaBrochureImage} 
                alt="Brosur Promosi Ibra Global English" 
                width={800}
                height={1130}
                loading="lazy"
                style={{ width: "100%", height: "auto", display: "block" }} 
              />
            )}
          </div>
        )}

        <div className="cta-banner" style={{ width: "100%" }}>
          <div className="cta-content">
            <span className="cta-tag">{ctaTag}</span>
            <h2>{renderTitle(ctaTitle)}</h2>
            <p>{ctaDesc}</p>
          </div>
          <div className="cta-actions">
            <a href="#contact" className="btn-cta-primary">Daftar Sekarang (Gratis)</a>
            <a 
              href="https://wa.me/6281357001357?text=Halo%20Ibra%20Global%20English%2C%20saya%20tertarik%20dengan%20Promo%20Placement%20Test%20Gratis." 
              className="btn-cta-secondary" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Tanya di WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
