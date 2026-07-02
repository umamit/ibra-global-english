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
      
      <main style={{ minHeight: "100vh", backgroundColor: "var(--color-gray-50)", padding: "7rem 1rem 8rem" }} className="gallery-page">
        <div className="container">
          
          {/* Header Section & Category Tabs & Gallery Grid */}
          {galleryItems.length > 0 && (
            <>
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
              <div className="gallery-masonry">
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
                        className="gallery-masonry-item"
                        style={{ position: "relative" }}
                      >
                        <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
                          <img
                            src={currentImage.thumb}
                            alt={currentImage.caption || group.title}
                            loading="lazy"
                            style={{
                              width: "100%",
                              height: "auto",
                              display: "block",
                              transition: "transform 0.5s ease"
                            }}
                            className="gallery-item-image"
                          />
                          
                          {/* Multiple images indicator */}
                          {hasMultiple && (
                            <div style={{
                              position: "absolute",
                              top: "0.75rem",
                              right: "0.75rem",
                              backgroundColor: "rgba(0, 0, 0, 0.7)",
                              color: "#fff",
                              padding: "0.25rem 0.5rem",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              zIndex: 2
                            }}>
                              <span>{activeImgIdx + 1} / {group.images.length}</span>
                            </div>
                          )}

                          {/* Slide Navigation overlays */}
                          {hasMultiple && (
                            <>
                              <button
                                onClick={(e) => prevGroupImage(group.id, group.images.length, e)}
                                style={{
                                  position: "absolute",
                                  left: "0.5rem",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  background: "rgba(255, 255, 255, 0.85)",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: "28px",
                                  height: "28px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                  zIndex: 3,
                                  fontWeight: "bold",
                                  fontSize: "1rem"
                                }}
                              >
                                ‹
                              </button>
                              <button
                                onClick={(e) => nextGroupImage(group.id, group.images.length, e)}
                                style={{
                                  position: "absolute",
                                  right: "0.5rem",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  background: "rgba(255, 255, 255, 0.85)",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: "28px",
                                  height: "28px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                  zIndex: 3,
                                  fontWeight: "bold",
                                  fontSize: "1rem"
                                }}
                              >
                                ›
                              </button>
                            </>
                          )}

                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              backgroundColor: "rgba(33, 108, 126, 0.4)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: 0,
                              transition: "opacity 0.3s ease",
                              pointerEvents: "none"
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
                            {group.category}
                          </span>
                          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.35rem" }}>
                            {group.title}
                          </h3>
                          <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", lineHeight: "1.4" }}>
                            {group.desc}
                          </p>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </>
          )}

          {/* Dedicated Video Gallery Section */}
          {videos && videos.length > 0 && (
            <div style={{ marginTop: "6rem", paddingTop: "5rem", borderTop: "2px dashed var(--color-gray-200)" }}>
              {/* Section Header */}
              <div className="section-header" style={{ textAlign: "center", marginBottom: "4rem" }}>
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
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", 
                gap: "2.5rem",
                justifyContent: "center",
                maxWidth: "1100px",
                margin: "0 auto"
              }}>
                {videos.map((vid, idx) => (
                  <div 
                    key={idx} 
                    className="video-card-item"
                    style={{
                      backgroundColor: "var(--color-white)",
                      borderRadius: "var(--radius-2xl)",
                      overflow: "hidden",
                      boxShadow: "var(--shadow-lg)",
                      border: "1px solid var(--color-gray-150)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      maxWidth: "480px",
                      width: "100%",
                      margin: "0 auto"
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
