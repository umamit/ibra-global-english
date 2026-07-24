"use client";

import React from "react";
import { useGallery } from "@/hooks/useGallery";
import "./Gallery.css";

export default function Gallery({ onOpenLightbox }: { onOpenLightbox: (src: string, caption: string) => void }) {
  const {
    galleryItems,
    activeIndex,
    setActiveIndex,
    handleNext,
    handlePrev,
    handleCardClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useGallery(onOpenLightbox);

  return (
    <section id="gallery" className="gallery-section">
      <div className="container">
        <div className="section-header scroll-fade-up">
          <h2>Galeri Kegiatan Kami di Bobong</h2>
          <p>Melihat lebih dekat keseruan belajar bahasa Inggris di Ibra Global English Bobong</p>
        </div>

        <div className="gallery-stack-wrapper scroll-zoom-in">
          <div 
            className="gallery-stack-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {galleryItems.map((item, idx) => {
              let offset = idx - activeIndex;
              if (offset < 0) offset += galleryItems.length;

              let cardStyle = {};
              if (offset === 0) {
                cardStyle = {
                  transform: "translate3d(0, 0, 0) scale(1)",
                  zIndex: 10,
                  opacity: 1,
                  pointerEvents: "auto",
                };
              } else if (offset === 1) {
                cardStyle = {
                  transform: "translate3d(0, 15px, -15px) scale(0.95)",
                  zIndex: 9,
                  opacity: 0.85,
                  pointerEvents: "auto",
                };
              } else if (offset === 2) {
                cardStyle = {
                  transform: "translate3d(0, 30px, -30px) scale(0.9)",
                  zIndex: 8,
                  opacity: 0.65,
                  pointerEvents: "auto",
                };
              } else {
                cardStyle = {
                  transform: "translate3d(0, 45px, -45px) scale(0.85)",
                  zIndex: 1,
                  opacity: 0,
                  pointerEvents: "none",
                };
              }

              return (
                <div 
                  key={idx}
                  className="gallery-stack-card"
                  style={cardStyle}
                  onClick={() => handleCardClick(idx)}
                >
                  <div className="gallery-card-image-wrap">
                    <img src={item.thumb} alt={item.alt} loading="lazy" />
                    <div className="gallery-card-overlay">
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {galleryItems.length > 1 && (
            <div className="gallery-controls-row">
              <button className="gallery-arrow-btn prev" onClick={handlePrev} aria-label="Foto Sebelumnya">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
              <div className="gallery-dots">
                {galleryItems.map((_, idx) => (
                  <button 
                    key={idx} 
                    type="button"
                    className={`gallery-dot ${idx === activeIndex ? "active" : ""}`}
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Buka foto ke-${idx + 1}`}
                  />
                ))}
              </div>
              <button className="gallery-arrow-btn next" onClick={handleNext} aria-label="Foto Selanjutnya">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}