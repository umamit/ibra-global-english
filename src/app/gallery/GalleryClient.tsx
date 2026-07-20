"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialFloat from "@/components/SocialFloat";
import AIChatWidget from "@/components/AIChatWidget";
import LightboxModal from "@/components/LightboxModal";
import MarqueeBanner from "@/components/MarqueeBanner";
import { createClient } from "@/utils/supabase/client";

import { DEFAULT_VIDEOS } from "@/utils/fallbackData";
import { STATIC_GALLERY } from "./galleryData";
import "./gallery.css";

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

    </div>
  );
}
