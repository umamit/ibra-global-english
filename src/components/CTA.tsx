"use client";
import "./CTA.css";

import { useState } from "react";
import posthog from "posthog-js";
import Button from "@/components/Button";

export default function CTA({ initialSettings }: { initialSettings: any }) {
  const [ctaTag] = useState(initialSettings?.cta_tag || "Promo Terbatas!");
  const [ctaTitle] = useState(initialSettings?.cta_title || "Kuasai Bahasa Inggris Lebih Cepat di Bobong & Jadi Percaya Diri!");
  const [ctaDesc] = useState(initialSettings?.cta_desc || "Dapatkan tes penempatan level (Placement Test) & bimbingan belajar gratis sekarang juga di Ibra Global English Bobong. Kuota sangat terbatas!");
  const [ctaBrochureImage] = useState(initialSettings?.cta_brochure_image || "/assets/brochure.png");

  const getCanvaEmbedUrl = (url: string) => {
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

  const renderTitle = (text: string) => {
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
    <section className="cta-section scroll-fade-up">
      <div className="container" style={{ display: "flex", flexDirection: "column", gap: "2.5rem", alignItems: "center" }}>
        {/* Dynamic Brochure Display Card */}
        {ctaBrochureImage && (
          <div 
            className="cta-brochure-card scroll-zoom-in"
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
            <Button href="/placement-test" variant="cta-primary" onClick={() => posthog.capture("cta_placement_test_clicked")}>Ikuti Tes Penempatan</Button>
            <Button href="#contact" variant="cta-secondary" onClick={() => posthog.capture("cta_free_registration_clicked")}>Daftar Bimbingan (Gratis)</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
