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
import { STATIC_GALLERY } from "./galleryData";
import { DEFAULT_VIDEOS } from "@/utils/fallbackData";

export default function GalleryClient() {
  const supabase = createClient();
  const [theme, setTheme] = useState("light");
  const [galleryItems, setGalleryItems] = useState(STATIC_GALLERY);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [lightbox, setLightbox] = useState({ isOpen: false, src: "", caption: "", index: 0 });

  useScrollReveal();

  const [videos, setVideos] = useState([]);
  const [allowPublicCopy, setAllowPublicCopy] = useState(false);

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

    const handleContextMenu = (e) => {
      const target = e.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      e.preventDefault();
    };

    const handleCopy = (e) => {
      const target = e.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      e.preventDefault();
    };

    const handleDragStart = (e) => {
      const target = e.target;
      if (target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, [allowPublicCopy]);

  // Auto-convert standard YouTube links to embed format
  const getEmbedUrl = (url) => {
    if (!url) return "";
    
    // 1. YouTube watch link: https://www.youtube.com/watch?v=XXXX
    if (url.includes("youtube.com/watch")) {
      try {
        const urlObj = new URL(url);
        const v = urlObj.searchParams.get("v");
        if (v) return `https://www.youtube.com/embed/${v}`;
      } catch (e) {}
    }
    
    // 2. YouTube short link: https://youtu.be/XXXX
    if (url.includes("youtu.be/")) {
      const parts = url.split("/");
      const id = parts[parts.length - 1]?.split("?")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    
    // 3. YouTube shorts link: https://www.youtube.com/shorts/XXXX
    if (url.includes("youtube.com/shorts/")) {
      const parts = url.split("/shorts/");
      const id = parts[1]?.split("?")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
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
        setVideos(DEFAULT_VIDEOS);
      } catch (e) {
        console.warn("Gagal memuat galeri video dari database, menggunakan data statis.", e);
        setVideos(DEFAULT_VIDEOS);
      }
    }
    fetchVideos();
  }, []);

  // Handle theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  // Handle theme toggle
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  // Fetch dynamic gallery from gallery_items (B3: admin-managed)
  useEffect(() => {
    async function fetchGallery() {
      try {
        // Coba ambil dari gallery_items (tabel baru yang dikelola admin)
        const res = await fetch("/api/gallery");
        if (res.ok) {
          const { data } = await res.json();
          if (data && data.length > 0) {
            const mappedData = data.map((item) => ({
              title: item.title,
              desc: item.description || "",
              thumb: item.image_url,
              full: item.image_url,
              caption: item.title,
              category: item.category || "Kegiatan"
            }));
            setGalleryItems([...mappedData, ...STATIC_GALLERY]);
            return;
          }
        }
        // Fallback ke tabel gallery lama
        const { data: oldData } = await supabase
          .from('gallery')
          .select('*')
          .order('created_at', { ascending: false });
        if (oldData && oldData.length > 0) {
          const mappedData = oldData.map((item) => ({
            title: item.title,
            desc: item.description || "",
            thumb: item.image_url,
            full: item.image_url,
            caption: item.caption || item.title,
            category: item.category || "Kegiatan"
          }));
          setGalleryItems([...mappedData, ...STATIC_GALLERY]);
        }
      } catch (e) {
        console.warn("Gagal memuat galeri dari database, menggunakan data statis.", e);
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

  const openLightbox = (src, caption, index) => {
    setLightbox({ isOpen: true, src, caption, index });
  };

  const closeLightbox = () => {
    setLightbox({ isOpen: false, src: "", caption: "", index: 0 });
  };

  const navigateLightbox = (direction) => {
    if (filteredItems.length <= 1) return;
    let nextIndex = lightbox.index + direction;
    if (nextIndex < 0) nextIndex = filteredItems.length - 1;
    if (nextIndex >= filteredItems.length) nextIndex = 0;
    
    setLightbox({
      isOpen: true,
      src: filteredItems[nextIndex].full,
      caption: filteredItems[nextIndex].caption,
      index: nextIndex
    });
  };

  return (
    <div className={allowPublicCopy ? "" : "nocopy-container"}>
      <MarqueeBanner />
      <Header theme={theme} toggleTheme={toggleTheme} hasMarquee={true} />
      
      <main style={{ minHeight: "100vh", backgroundColor: "var(--color-gray-50)", padding: "7rem 1rem 8rem" }} className="gallery-page">
        <div className="container">
          
          {/* Header Section */}
          <div className="section-header" style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "2px", display: "inline-block", marginBottom: "0.5rem" }}>
              Dokumentasi Belajar
            </span>
            <h1 style={{ fontSize: "2.5rem", fontWeight: "900", color: "var(--color-gray-900)", marginBottom: "1rem" }}>
              Galeri Kegiatan Siswa
            </h1>
            <p style={{ color: "var(--color-gray-600)", maxWidth: "600px", margin: "0 auto", fontSize: "1.05rem" }}>
              Keseruan proses belajar-mengajar aktif, latihan percakapan, games kelompok, dan keceriaan siswa Ibra Global English Bobong.
            </p>
          </div>

          {/* Category Tabs */}
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "3rem" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={activeCategory === cat ? "btn-portal-primary" : "btn-portal-outline"}
                style={{
                  padding: "0.6rem 1.5rem",
                  borderRadius: "50px",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  boxShadow: activeCategory === cat ? "0 4px 12px rgba(33, 108, 126, 0.2)" : "none"
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          {filteredItems.length === 0 ? null : (
            <div className="gallery-masonry">
              {filteredItems.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => openLightbox(item.full, item.caption, idx)}
                  className="gallery-masonry-item"
                >
                  <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
                    <img
                      src={item.thumb}
                      alt={item.caption || "Foto kegiatan belajar mengajar aktif di Ibra Global English Bobong"}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        transition: "transform 0.5s ease"
                      }}
                      className="gallery-item-image"
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "rgba(33, 108, 126, 0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "opacity 0.3s ease"
                      }}
                      className="gallery-item-overlay"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                      </svg>
                    </div>
                  </div>
                  <div style={{ padding: "1.25rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--color-primary)", textTransform: "uppercase", display: "inline-block", marginBottom: "0.25rem" }}>
                      {item.category}
                    </span>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.35rem" }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", lineHeight: "1.4" }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dedicated Video Gallery Section */}
          {videos && videos.length > 0 && (
            <div style={{ marginTop: "6rem", paddingTop: "5rem", borderTop: "2px dashed var(--color-gray-200)" }}>
              {/* Section Header */}
              <div className="section-header" style={{ textAlign: "center", marginBottom: "4rem" }} data-aos="fade-up">
                <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "2px", display: "inline-block", marginBottom: "0.5rem" }}>
                  Dokumentasi Video
                </span>
                <h2 style={{ fontSize: "2.2rem", fontWeight: "900", color: "var(--color-gray-900)", marginBottom: "1rem" }}>
                  Video Kegiatan Siswa
                </h2>
                <p style={{ color: "var(--color-gray-600)", maxWidth: "600px", margin: "0 auto", fontSize: "1.05rem" }}>
                  Tonton keseruan proses belajar-mengajar, aktivitas ice breaking, dan latihan berbicara bahasa Inggris langsung dari ruang kelas kami.
                </p>
              </div>

              {/* Video Grid */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 450px), 1fr))", 
                gap: "3rem",
                justifyContent: "center"
              }}>
                {videos.map((vid, idx) => (
                  <div 
                    key={idx} 
                    className="video-card-item"
                    data-aos="fade-up" 
                    data-aos-delay={idx * 100}
                    style={{
                      backgroundColor: "var(--color-white)",
                      borderRadius: "var(--radius-2xl)",
                      overflow: "hidden",
                      boxShadow: "var(--shadow-lg)",
                      border: "1px solid var(--color-gray-150)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease"
                    }}
                  >
                    {/* Video Player Wrapper (16:9 Aspect Ratio) */}
                    <div style={{ 
                      position: "relative", 
                      paddingBottom: "56.25%", /* 16:9 */
                      height: 0, 
                      overflow: "hidden", 
                      backgroundColor: "#000" 
                    }}>
                      <iframe
                        src={getEmbedUrl(vid.url)}
                        title={vid.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
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
        hasNavigation={filteredItems.length > 1}
      />

      {/* CSS Styles injection for Gallery Masonry & Visual Scrapbook Effects */}
      <style jsx global>{`
        .gallery-masonry {
          column-count: 1;
          column-gap: 1.5rem;
        }
        @media (min-width: 640px) {
          .gallery-masonry {
            column-count: 2;
          }
        }
        @media (min-width: 1024px) {
          .gallery-masonry {
            column-count: 3;
          }
        }
        .gallery-masonry-item {
          display: inline-block;
          width: 100%;
          margin-bottom: 1.5rem;
          break-inside: avoid;
          background-color: white;
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--color-gray-150);
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
        }
        .gallery-masonry-item:nth-child(odd) {
          transform: rotate(-0.75deg);
        }
        .gallery-masonry-item:nth-child(even) {
          transform: rotate(0.75deg);
        }
        .gallery-masonry-item:hover {
          transform: translateY(-8px) scale(1.025) rotate(0deg) !important;
          box-shadow: 0 20px 40px rgba(33, 108, 126, 0.16);
          z-index: 10;
        }
        .gallery-masonry-item:hover .gallery-item-image {
          transform: scale(1.06);
        }
        .gallery-masonry-item:hover .gallery-item-overlay {
          opacity: 1;
        }
        .video-card-item {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .video-card-item:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(33, 108, 126, 0.15) !important;
        }
      `}</style>
    </div>
  );
}
