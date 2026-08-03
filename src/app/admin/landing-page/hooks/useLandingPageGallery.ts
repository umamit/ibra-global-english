import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { GalleryItem } from "@/types";

export function useLandingPageGallery(showToast: (msg: string, type?: "success" | "error") => void, triggerRevalidation: () => Promise<void>) {
  const supabase = createClient();
  const [galleryList, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState<boolean>(false);
  const [galleryTitle, setGalleryTitle] = useState<string>("");
  const [galleryDesc, setGalleryDesc] = useState<string>("");
  const [galleryCaption, setGalleryCaption] = useState<string>("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [addingGallery, setAddingGallery] = useState<boolean>(false);

  const fetchGallery = async () => {
    setGalleryLoading(true);
    try {
      const { data, error } = await supabase.from("gallery_items").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setGalleryItems(data || []);
    } catch { showToast("Gagal memuat galeri foto.", "error"); } finally { setGalleryLoading(false); }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm("Hapus foto dari galeri?")) return;
    try {
      const { error } = await supabase.from("gallery_items").delete().eq("id", id);
      if (error) throw error;
      showToast("Foto berhasil dihapus!"); fetchGallery(); triggerRevalidation();
    } catch (err: any) { showToast(err.message, "error"); }
  };

  return {
    galleryList, galleryLoading, galleryTitle, setGalleryTitle, galleryDesc, setGalleryDesc,
    galleryCaption, setGalleryCaption, galleryFiles, galleryPreviews, addingGallery,
    fetchGallery, handleDeleteGalleryItem, setGalleryItems, setGalleryFiles, setGalleryPreviews, setAddingGallery
  };
}
