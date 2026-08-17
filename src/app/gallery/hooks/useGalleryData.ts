import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { DEFAULT_VIDEOS } from "@/utils/fallbackData";
import { STATIC_GALLERY } from "../galleryData";

export interface GalleryItem {
  title: string;
  desc: string;
  thumb: string;
  full: string;
  caption: string;
  category: string;
  created_at?: string;
}

export interface GalleryGroup {
  id: string;
  title: string;
  desc: string;
  category: string;
  created_at: string;
  images: Array<{ thumb: string; full: string; caption: string }>;
}

export interface VideoItem {
  url: string;
  title: string;
  desc?: string;
}

export function useGalleryData() {
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
    isOpen: false, src: "", caption: "", index: 0, images: []
  });
  const [groupActiveIndexes, setGroupActiveIndexes] = useState<{ [groupId: string]: number }>({});
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [allowPublicCopy, setAllowPublicCopy] = useState<boolean>(false);

  useEffect(() => {
    async function fetchCopySetting() {
      try {
        const { data } = await supabase.from("landing_settings").select("value").eq("key", "allow_public_copy").single();
        if (data) setAllowPublicCopy(data.value === "true");
      } catch (e) {
        console.warn("Gagal memuat pengaturan copy protection:", e);
      }
    }
    fetchCopySetting();
  }, []);

  useEffect(() => {
    if (allowPublicCopy) return;
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      e.preventDefault();
    };
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      e.preventDefault();
    };
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") e.preventDefault();
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

  const getEmbedUrl = (url: string): string => {
    if (!url) return "";
    if (url.includes("facebook.com/") || url.includes("fb.watch/")) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
    }
    if (url.includes("youtube.com/watch")) {
      try {
        const urlObj = new URL(url);
        const v = urlObj.searchParams.get("v");
        if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
      } catch {}
    }
    if (url.includes("youtu.be/")) {
      const parts = url.split("/");
      const id = parts[parts.length - 1]?.split("?")[0];
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (url.includes("youtube.com/shorts/")) {
      const parts = url.split("/shorts/");
      const id = parts[1]?.split("?")[0];
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (url.includes("youtube.com/embed/")) {
      return url.replace("youtube.com/embed/", "youtube-nocookie.com/embed/");
    }
    return url;
  };

  useEffect(() => {
    async function fetchVideos() {
      try {
        const { data, error } = await supabase.from("landing_settings").select("value").eq("key", "landing_videos").single();
        if (error) throw error;
        if (data?.value) {
          const parsed = JSON.parse(data.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setVideos(parsed);
            return;
          }
        }
        setVideos(DEFAULT_VIDEOS as any[]);
      } catch {
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

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  useEffect(() => {
    async function fetchGallery() {
      let supabaseItems: GalleryItem[] = [];
      try {
        const { data, error } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
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
              created_at: item.created_at,
            }));
        }
      } catch (e) {
        console.warn("Gagal memuat galeri dari Supabase:", e);
      }
      if (supabaseItems.length > 0) {
        setGalleryItems(supabaseItems);
      } else {
        setGalleryItems(STATIC_GALLERY);
      }
    }
    fetchGallery();
  }, []);

  const filteredItems = activeCategory === "Semua" ? galleryItems : galleryItems.filter((item) => item.category === activeCategory);
  const allCategories = ["Semua", "Kegiatan", "Prestasi", "Fasilitas", "Kelas Online", "Kids Program", "Teens Program"];
  const categories = allCategories.filter((cat) => cat === "Semua" || galleryItems.some((item) => item.category === cat));

  const openLightbox = (groupImages: Array<{ full: string; caption: string }>, startIndex: number) => {
    setLightbox({ isOpen: true, src: groupImages[startIndex].full, caption: groupImages[startIndex].caption, index: startIndex, images: groupImages });
  };

  const closeLightbox = () => {
    setLightbox({ isOpen: false, src: "", caption: "", index: 0, images: [] });
  };

  const navigateLightbox = (direction: number) => {
    if (lightbox.images.length <= 1) return;
    let nextIndex = lightbox.index + direction;
    if (nextIndex < 0) nextIndex = lightbox.images.length - 1;
    if (nextIndex >= lightbox.images.length) nextIndex = 0;
    setLightbox({ ...lightbox, src: lightbox.images[nextIndex].full, caption: lightbox.images[nextIndex].caption, index: nextIndex });
  };

  const getActiveIndexForGroup = (groupId: string) => groupActiveIndexes[groupId] || 0;

  const nextGroupImage = (groupId: string, max: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setGroupActiveIndexes((prev) => ({ ...prev, [groupId]: ((prev[groupId] || 0) + 1) % max }));
  };

  const prevGroupImage = (groupId: string, max: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setGroupActiveIndexes((prev) => ({ ...prev, [groupId]: ((prev[groupId] || 0) - 1 + max) % max }));
  };

  return {
    theme, toggleTheme, galleryItems, activeCategory, setActiveCategory, lightbox, setLightbox,
    groupActiveIndexes, videos, allowPublicCopy, filteredItems, categories,
    openLightbox, closeLightbox, navigateLightbox, getActiveIndexForGroup, nextGroupImage, prevGroupImage, getEmbedUrl,
  };
}
