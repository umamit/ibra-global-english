"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialFloat from "@/components/SocialFloat";
import AIChatWidget from "@/components/AIChatWidget";
import LightboxModal from "@/components/LightboxModal";
import MarqueeBanner from "@/components/MarqueeBanner";
import { createClient } from "@/utils/supabase/client";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { DEFAULT_VIDEOS } from "@/utils/fallbackData";
import { STATIC_GALLERY } from "./galleryData";

interface GalleryItem {
  title: string;
  desc: string;
  thumb: string;
  full: string;
  caption: string;
  category: string;
  created_at?: string;
}

interface GalleryGroup {
  id: string;
  title: string;
  desc: string;
  category: string;
  created_at: string;
  images: Array<{
    thumb: string;
    full: string;
    caption: string;
  }>;
}

interface VideoItem {
  url: string;
  title: string;
  desc?: string;
}

export default function GalleryClient() {
  const supabase = createClient();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [lightbox, setLightbox] = useState<{
    isOpen: boolean;
    src: string;
    caption: string;
    index: number;
    images: Array<{ full: string; caption: string }>;
  }>({
    isOpen: false,
    src: "",
    caption: "",
    index: 0,
    images: []
  });
  const [groupActiveIndexes, setGroupActiveIndexes] = useState<{ [groupId: string]: number }>({});

  useScrollReveal();

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [allowPublicCopy, setAllowPublicCopy] = useState<boolean>(false);

  // Fetch copy protection setting
  useEffect(() => {
    async function fetchCopySetting() {
      try {
        const { data, error } = await supabase
          .from('landing_settings')
          .select('value')
          .eq('key', 'allow_public_copy')
          .single();
        if (data) {
          setAllowPublicCopy(data.value === "true");
        }
      } catch (e) {
        console.warn("Gagal memuat pengaturan copy protection:", e);
      }
    }
    fetchCopySetting();
  }, []);

  // Mencegah klik kanan, salin (copy), dan seret (drag) gambar jika copy protection aktif
  useEffect(() => {
    if (allowPublicCopy) {
      return;
    }

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      e.preventDefault();
    };

    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy as any);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy as any);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, [allowPublicCopy]);

  // Auto-convert standard YouTube links to privacy-enhanced embed format
  const getEmbedUrl = (url: string): string => {
    if (!url) return "";
    
    // Convert to youtube-nocookie.com domain to prevent Error 153 and enhance privacy
    // 1. YouTube watch link: https://www.youtube.com/watch?v=XXXX
    if (url.includes("youtube.com/watch")) {
      try {
        const urlObj = new URL(url);
        const v = urlObj.searchParams.get("v");
        if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
      } catch (e) {}
    }
    
    // 2. YouTube short link: https://youtu.be/XXXX
    if (url.includes("youtu.be/")) {
      const parts = url.split("/");
      const id = parts[parts.length - 1]?.split("?")[0];
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    
    // 3. YouTube shorts link: https://www.youtube.com/shorts/XXXX
    if (url.includes("youtube.com/shorts/")) {
      const parts = url.split("/shorts/");
      const id = parts[1]?.split("?")[0];
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    
    // Fallback if the URL already has youtube.com/embed/
    if (url.includes("youtube.com/embed/")) {
      return url.replace("youtube.com/embed/", "youtube-nocookie.com/embed/");
    }
    
    return url;
  };

  // Fetch dynamic videos from database
  useEffect(() => {
    async function fetchVideos() {
      try {
        const { data, error } = await supabase
          .from('landing_settings')
          .select('value')
          .eq('key', 'landing_videos')
          .single();
        
        if (error) throw error;
        if (data && data.value) {
          const parsed = JSON.parse(data.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setVideos(parsed);
            return;
          }
        }
        setVideos(DEFAULT_VIDEOS as any[]);
      } catch (e) {
        console.warn("Gagal memuat galeri video dari database, menggunakan data statis.", e);
        setVideos(DEFAULT_VIDEOS as any[]);
      }
    }
    fetchVideos();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    
    setTimeout(() => {
      setTheme(initialTheme === "dark" ? "dark" : "light");
      document.documentElement.setAttribute("data-theme", initialTheme);
    }, 0);
  }, []);

  // Handle theme toggle
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  // Fetch dynamic gallery from 'gallery' table in Supabase
  useEffect(() => {
    async function fetchGallery() {
      let supabaseItems: GalleryItem[] = [];
      try {
        const { data, error } = await supabase
          .from("gallery")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          supabaseItems = data
            .filter((item: any) => item.image_url && item.image_url !== "")
            .map((item: any) => ({
              title: item.title,
              desc: item.description || "",
              thumb: item.image_url,
              full: item.image_url,
              caption: item.caption || item.title,
              category: "Kegiatan",
              created_at: item.created_at
            }));
        }
      } catch (e) {
        console.warn("Gagal memuat galeri dari Supabase:", e);
      }

      if (supabaseItems.length > 0) {
        setGalleryItems(supabaseItems);
      } else {
        console.warn("Gagal memuat galeri dari Supabase. Menggunakan data default (statis).");
        setGalleryItems(STATIC_GALLERY);
      }
    }
    fetchGallery();
  }, []);

  // Filter items based on active category
  const filteredItems = activeCategory === "Semua" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  const allCategories = ["Semua", "Kegiatan", "Prestasi", "Fasilitas", "Kelas Online", "Kids Program", "Teens Program"];
  const categories = allCategories.filter(cat => 
    cat === "Semua" || galleryItems.some(item => item.category === cat)
  );

  const openLightbox = (groupImages: Array<{ full: string; caption: string }>, startIndex: number) => {
    setLightbox({
      isOpen: true,
      src: groupImages[startIndex].full,
      caption: groupImages[startIndex].caption,
      index: startIndex,
      images: groupImages
    });
  };

  const closeLightbox = () => {
    setLightbox({ isOpen: false, src: "", caption: "", index: 0, images: [] });
  };

  const navigateLightbox = (direction: number) => {
    if (lightbox.images.length <= 1) return;
    let nextIndex = lightbox.index + direction;
    if (nextIndex < 0) nextIndex = lightbox.images.length - 1;
    if (nextIndex >= lightbox.images.length) nextIndex = 0;
    
    setLightbox({
      ...lightbox,
      src: lightbox.images[nextIndex].full,
      caption: lightbox.images[nextIndex].caption,
      index: nextIndex
    });
  };

  const getActiveIndexForGroup = (groupId: string) => {
    return groupActiveIndexes[groupId] || 0;
  };

  const nextGroupImage = (groupId: string, max: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setGroupActiveIndexes(prev => ({
      ...prev,
      [groupId]: ((prev[groupId] || 0) + 1) % max
    }));
  };

  const prevGroupImage = (groupId: string, max: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setGroupActiveIndexes(prev => ({
      ...prev,
      [groupId]: ((prev[groupId] || 0) - 1 + max) % max
    }));
  };

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
              {/* Apple-style Category Pills */}
              <div className="apple-filter-bar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={activeCategory === cat ? "apple-pill apple-pill--active" : "apple-pill"}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Apple-style Photo Grid */}
              <div className="apple-gallery-grid">
                {(() => {
                  const groups: { [key: string]: GalleryGroup } = {};
                  filteredItems.forEach((item: any) => {
                    const timestamp = item.created_at || 'static';
                    const key = `${item.title}_${timestamp}`;
                    if (!groups[key]) {
                      groups[key] = {
                        id: key,
                        title: item.title,
                        desc: item.desc || "",
                        category: item.category || "Kegiatan",
                        created_at: timestamp,
                        images: []
                      };
                    }
                    groups[key].images.push({
                      thumb: item.thumb,
                      full: item.full,
                      caption: item.caption
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
                {videos.map((vid, idx) => (
                  <div
                    key={idx}
                    className="apple-video-card"
                  >
                    {/* Video Player Wrapper (16:9 Aspect Ratio) */}
                    <div style={{ 
                      position: "relative", 
                      paddingBottom: "56.25%",
                      height: 0, 
                      overflow: "hidden", 
                      backgroundColor: "#000" 
                    }}>
                      <iframe
                        src={getEmbedUrl(vid.url)}
                        title={vid.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        style={{ 
                          position: "absolute", 
                          top: 0, 
                          left: 0, 
                          width: "100%", 
                          height: "100%",
                          border: "none"
                        }}
                      />
                    </div>
                    {/* Video Metadata */}
                    <div style={{ padding: "1.75rem" }}>
                      <h3 style={{ 
                        fontSize: "1.25rem", 
                        fontWeight: "800", 
                        color: "var(--color-gray-900)", 
                        marginBottom: "0.5rem" 
                      }}>
                        {vid.title}
                      </h3>
                      <p style={{ 
                        fontSize: "0.9rem", 
                        color: "var(--color-gray-500)", 
                        lineHeight: "1.5" 
                      }}>
                        {vid.desc}
                      </p>
                    </div>
                  </div>
                ))}
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

      {/* Apple-style Gallery CSS */}
      <style jsx global>{`
        /* ── Hero ── */
        .apple-gallery-hero {
          background: linear-gradient(180deg, var(--color-bg-teal-50) 0%, var(--color-white) 100%);
          padding: 9rem 1.5rem 5rem;
          text-align: center;
        }
        [data-theme="dark"] .apple-gallery-hero {
          background: var(--color-gray-50);
        }
        .apple-gallery-hero-inner {
          max-width: 720px;
          margin: 0 auto;
        }
        .apple-gallery-eyebrow {
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-primary);
          margin-bottom: 0.75rem;
        }
        [data-theme="dark"] .apple-gallery-eyebrow {
          color: var(--color-accent);
        }
        .apple-gallery-headline {
          font-size: clamp(2.8rem, 6vw, 4.5rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--color-primary-dark);
          line-height: 1.05;
          margin-bottom: 1.25rem;
        }
        [data-theme="dark"] .apple-gallery-headline {
          color: var(--color-white);
        }
        .apple-gallery-subhead {
          font-size: 1.1rem;
          font-weight: 400;
          color: var(--color-gray-600);
          line-height: 1.6;
          max-width: 520px;
          margin: 0 auto;
        }
        [data-theme="dark"] .apple-gallery-subhead {
          color: var(--color-gray-500);
        }

        /* ── Main wrapper ── */
        .apple-gallery-main {
          background: #f5f5f7;
          min-height: 100vh;
          padding: 4rem 1.5rem 8rem;
        }
        [data-theme="dark"] .apple-gallery-main {
          background: #000;
        }
        .apple-gallery-container {
          max-width: 1280px;
          margin: 0 auto;
        }

        /* ── Filter Pills ── */
        .apple-filter-bar {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 3rem;
        }
        .apple-pill {
          padding: 0.5rem 1.25rem;
          border-radius: 980px;
          border: 1px solid rgba(0,0,0,0.12);
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          font-size: 0.875rem;
          font-weight: 500;
          color: #1d1d1f;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: -0.01em;
        }
        .apple-pill:hover {
          background: rgba(255,255,255,0.95);
          border-color: rgba(0,0,0,0.2);
        }
        .apple-pill--active {
          background: #1d1d1f;
          color: #f5f5f7;
          border-color: #1d1d1f;
        }
        .apple-pill--active:hover {
          background: #333;
          border-color: #333;
        }
        [data-theme="dark"] .apple-pill {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.12);
          color: #f5f5f7;
        }
        [data-theme="dark"] .apple-pill--active {
          background: #f5f5f7;
          color: #1d1d1f;
          border-color: #f5f5f7;
        }

        /* ── Photo Grid ── */
        .apple-gallery-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 1.25rem;
        }
        @media (min-width: 640px) {
          .apple-gallery-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .apple-gallery-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* ── Gallery Card ── */
        .apple-gallery-card {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 2px 12px rgba(0,0,0,0.07);
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
          position: relative;
        }
        .apple-gallery-card:hover {
          transform: translateY(-6px) scale(1.015);
          box-shadow: 0 16px 40px rgba(0,0,0,0.13);
        }
        [data-theme="dark"] .apple-gallery-card {
          background: #1c1c1e;
          box-shadow: 0 2px 12px rgba(0,0,0,0.35);
        }

        /* ── Card Image ── */
        .apple-card-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: #e5e5ea;
        }
        .apple-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }
        .apple-gallery-card:hover .apple-card-img {
          transform: scale(1.05);
        }

        /* ── Hover Overlay ── */
        .apple-card-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.25s ease;
          pointer-events: none;
        }
        .apple-gallery-card:hover .apple-card-overlay {
          opacity: 1;
        }

        /* ── Batch Badge ── */
        .apple-card-badge {
          position: absolute;
          top: 0.65rem;
          right: 0.65rem;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #fff;
          padding: 0.3rem 0.55rem;
          border-radius: 980px;
          font-size: 0.72rem;
          font-weight: 600;
          z-index: 2;
        }

        /* ── Nav Buttons ── */
        .apple-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
          z-index: 3;
          color: #1d1d1f;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .apple-nav-btn:hover {
          background: #fff;
          transform: translateY(-50%) scale(1.1);
        }
        .apple-nav-btn--prev { left: 0.6rem; }
        .apple-nav-btn--next { right: 0.6rem; }

        /* ── Dot Indicators ── */
        .apple-card-dots {
          position: absolute;
          bottom: 0.6rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 5px;
          z-index: 2;
        }
        .apple-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .apple-dot--active {
          background: #fff;
          transform: scale(1.3);
        }

        /* ── Card Info ── */
        .apple-card-info {
          padding: 1rem 1.1rem 1.1rem;
        }
        .apple-card-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1d1d1f;
          letter-spacing: -0.01em;
          margin-bottom: 0.2rem;
          line-height: 1.3;
        }
        [data-theme="dark"] .apple-card-title {
          color: #f5f5f7;
        }
        .apple-card-desc {
          font-size: 0.8rem;
          color: #6e6e73;
          line-height: 1.45;
        }

        /* ── Video Section ── */
        .apple-video-section {
          margin-top: 6rem;
          padding-top: 5rem;
          border-top: 1px solid rgba(0,0,0,0.08);
        }
        [data-theme="dark"] .apple-video-section {
          border-top-color: rgba(255,255,255,0.08);
        }
        .apple-video-header {
          text-align: center;
          margin-bottom: 3.5rem;
        }
        .apple-video-heading {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #1d1d1f;
          margin-bottom: 0.75rem;
        }
        [data-theme="dark"] .apple-video-heading {
          color: #f5f5f7;
        }
        .apple-video-subhead {
          font-size: 1rem;
          color: #6e6e73;
          max-width: 540px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .apple-video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
          gap: 2rem;
          max-width: 1080px;
          margin: 0 auto;
        }
        .apple-video-card {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.07);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          max-width: 480px;
          width: 100%;
          margin: 0 auto;
        }
        [data-theme="dark"] .apple-video-card {
          background: #1c1c1e;
        }
        .apple-video-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 40px rgba(0,0,0,0.12);
        }
      `}</style>
    </div>
  );
}
