"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialFloat from "@/components/SocialFloat";
import AIChatWidget from "@/components/AIChatWidget";
import LightboxModal from "@/components/LightboxModal";
import MarqueeBanner from "@/components/MarqueeBanner";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { useGalleryData, GalleryGroup } from "./hooks/useGalleryData";
import "./gallery.css";

export default function GalleryClient() {
  const {
    theme, toggleTheme, galleryItems, activeCategory, setActiveCategory, lightbox,
    videos, allowPublicCopy, filteredItems, categories,
    openLightbox, closeLightbox, navigateLightbox, getActiveIndexForGroup, nextGroupImage, prevGroupImage, getEmbedUrl,
  } = useGalleryData();

  return (
    <div className={allowPublicCopy ? "" : "nocopy-container"}>
      <MarqueeBanner />
      <Header theme={theme} toggleTheme={toggleTheme} hasMarquee={true} />

      {/* Apple-style Hero Section */}
      <section className="apple-gallery-hero">
        <div className="apple-gallery-hero-inner">
          <p className="apple-gallery-eyebrow">Dokumentasi</p>
          <h1 className="apple-gallery-headline">Galeri Kegiatan</h1>
          <p className="apple-gallery-subhead">
            Momen belajar, bermain, dan berkembang bersama siswa Ibra Global English Bobong.
          </p>
        </div>
      </section>

      <main className="apple-gallery-main">
        <div className="apple-gallery-container">
          {/* Gallery Photos Section */}
          {galleryItems.length > 0 && (
            <>
              {/* Apple-style Segmented Control Filter */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "2.5rem" }}>
                <SegmentedControl
                  options={categories.map((cat) => ({ id: cat, label: cat }))}
                  value={activeCategory}
                  onChange={setActiveCategory}
                />
              </div>

              {/* Apple-style Photo Grid */}
              <div className="apple-gallery-grid">
                {(() => {
                  const groups: { [key: string]: GalleryGroup } = {};
                  filteredItems.forEach((item: any) => {
                    const timestamp = item.created_at || "static";
                    const key = `${item.title}_${timestamp}`;
                    if (!groups[key]) {
                      groups[key] = {
                        id: key,
                        title: item.title,
                        desc: item.desc || "",
                        category: item.category || "Kegiatan",
                        created_at: timestamp,
                        images: [],
                      };
                    }
                    groups[key].images.push({
                      thumb: item.thumb,
                      full: item.full,
                      caption: item.caption,
                    });
                  });
                  const groupedList = Object.values(groups);

                  return groupedList.map((group) => {
                    const activeImgIdx = getActiveIndexForGroup(group.id);
                    const currentImage = group.images[activeImgIdx];
                    const hasMultiple = group.images.length > 1;

                    return (
                      <div
                        key={group.id}
                        onClick={() => openLightbox(group.images, activeImgIdx)}
                        className="apple-gallery-card"
                      >
                        {/* Image Area */}
                        <div className="apple-card-image-wrap">
                          <img
                            src={currentImage.thumb}
                            alt={currentImage.caption || group.title}
                            loading="lazy"
                            className="apple-card-img"
                          />

                          {/* Hover overlay */}
                          <div className="apple-card-overlay">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                              <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                            </svg>
                          </div>

                          {/* Multiple images badge */}
                          {hasMultiple && (
                            <div className="apple-card-badge">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                                <rect x="3" y="3" width="7" height="7" rx="1"/>
                                <rect x="14" y="3" width="7" height="7" rx="1"/>
                                <rect x="3" y="14" width="7" height="7" rx="1"/>
                                <rect x="14" y="14" width="7" height="7" rx="1"/>
                              </svg>
                              <span>{group.images.length}</span>
                            </div>
                          )}

                          {/* Slide nav buttons */}
                          {hasMultiple && (
                            <>
                              <button
                                className="apple-nav-btn apple-nav-btn--prev"
                                onClick={(e) => prevGroupImage(group.id, group.images.length, e)}
                                aria-label="Foto sebelumnya"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="15 18 9 12 15 6"/>
                                </svg>
                              </button>
                              <button
                                className="apple-nav-btn apple-nav-btn--next"
                                onClick={(e) => nextGroupImage(group.id, group.images.length, e)}
                                aria-label="Foto berikutnya"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="9 18 15 12 9 6"/>
                                </svg>
                              </button>

                              {/* Dot indicators */}
                              <div className="apple-card-dots">
                                {group.images.map((_, i) => (
                                  <span
                                    key={i}
                                    className={`apple-dot ${i === activeImgIdx ? "apple-dot--active" : ""}`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Card Info */}
                        <div className="apple-card-info">
                          <h3 className="apple-card-title">{group.title}</h3>
                          {group.desc && <p className="apple-card-desc">{group.desc}</p>}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </>
          )}

          {/* Video Gallery Section */}
          {videos && videos.length > 0 && (
            <div className="apple-video-section">
              <div className="apple-video-header">
                <p className="apple-gallery-eyebrow" style={{ color: "#6e6e73" }}>Dokumentasi Video</p>
                <h2 className="apple-video-heading">Video Kegiatan Siswa</h2>
                <p className="apple-video-subhead">
                  Tonton keseruan proses belajar-mengajar, aktivitas ice breaking, dan latihan berbicara bahasa Inggris langsung dari ruang kelas kami.
                </p>
              </div>

              <div className="apple-video-grid">
                {videos.map((vid, idx) => {
                  const isFacebook = vid.url.includes("facebook.com") || vid.url.includes("fb.watch");
                  return (
                    <div key={idx} className="apple-video-card">
                      {/* Video Player Wrapper (16:9 Aspect Ratio) */}
                      <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", backgroundColor: "#000" }}>
                        <iframe
                          src={getEmbedUrl(vid.url)}
                          title={vid.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="strict-origin-when-cross-origin"
                          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                        />
                      </div>
                      {/* Video Metadata */}
                      <div style={{ padding: "1.75rem" }}>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
                          {vid.title}
                        </h3>
                        {vid.desc && (
                          <p style={{ fontSize: "0.9rem", color: "var(--color-gray-500)", lineHeight: "1.5", marginBottom: "0.75rem" }}>
                            {vid.desc}
                          </p>
                        )}
                        {isFacebook && (
                          <a
                            href={vid.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              fontSize: "0.85rem",
                              fontWeight: "700",
                              color: "#1877F2",
                              textDecoration: "none",
                              marginTop: "0.25rem",
                              padding: "0.4rem 0.8rem",
                              borderRadius: "6px",
                              backgroundColor: "rgba(24, 119, 242, 0.08)"
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Tonton Langsung di Facebook ↗
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <SocialFloat />
      <AIChatWidget />

      <LightboxModal
        isOpen={lightbox.isOpen}
        src={lightbox.src}
        caption={lightbox.caption}
        onClose={closeLightbox}
        onPrev={() => navigateLightbox(-1)}
        onNext={() => navigateLightbox(1)}
        hasNavigation={lightbox.images.length > 1}
      />
    </div>
  );
}
