"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { DEFAULT_PROGRAMS, DEFAULT_BENEFITS, DEFAULT_FAQS, DEFAULT_VIDEOS, DEFAULT_NAVIGATION_MENU } from "@/utils/fallbackData";
import { GalleryItem } from "@/types";

export interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export function useLandingPageCMS() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<string>("hero");
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" });

  // Maintenance
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [savingMaintenance, setSavingMaintenance] = useState<boolean>(false);

  // Copy protection
  const [allowPublicCopy, setAllowPublicCopy] = useState<boolean>(false);
  const [savingCopySetting, setSavingCopySetting] = useState<boolean>(false);

  // Visitor counter
  const [visitorOffset, setVisitorOffset] = useState<string>("0");
  const [savingVisitorOffset, setSavingVisitorOffset] = useState<boolean>(false);

  // Hero & contact
  const [heroTitle, setHeroTitle] = useState<string>("");
  const [heroSubtitle, setHeroSubtitle] = useState<string>("");
  const [heroDesc, setHeroDesc] = useState<string>("");
  const [heroImage, setHeroImage] = useState<string>("");
  const [contactAddress, setContactAddress] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");

  // Payment
  const [paymentBankName, setPaymentBankName] = useState<string>("");
  const [paymentAccountNumber, setPaymentAccountNumber] = useState<string>("");
  const [paymentAccountName, setPaymentAccountName] = useState<string>("");
  const [paymentAccountSub, setPaymentAccountSub] = useState<string>("");
  const [paymentSppAmount, setPaymentSppAmount] = useState<string>("");
  const [paymentSppKids, setPaymentSppKids] = useState<string>("");
  const [paymentSppTeens, setPaymentSppTeens] = useState<string>("");
  const [paymentSppCalistung, setPaymentSppCalistung] = useState<string>("");

  // Marquee / CTA
  const [marqueeText1, setMarqueeText1] = useState<string>("");
  const [marqueeText2, setMarqueeText2] = useState<string>("");
  const [marqueeText3, setMarqueeText3] = useState<string>("");
  const [ctaTag, setCtaTag] = useState<string>("");
  const [ctaTitle, setCtaTitle] = useState<string>("");
  const [ctaDesc, setCtaDesc] = useState<string>("");
  const [ctaBrochureImage, setCtaBrochureImage] = useState<string>("");
  const [uploadingHero, setUploadingHero] = useState<boolean>(false);
  const [uploadingCtaBrochure, setUploadingCtaBrochure] = useState<boolean>(false);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const ctaBrochureFileRef = useRef<HTMLInputElement>(null);

  // Gallery
  const [galleryList, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState<boolean>(false);
  const [galleryTitle, setGalleryTitle] = useState<string>("");
  const [galleryDesc, setGalleryDesc] = useState<string>("");
  const [galleryCaption, setGalleryCaption] = useState<string>("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [addingGallery, setAddingGallery] = useState<boolean>(false);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  // Lists
  const [programsList, setProgramsList] = useState<any[]>([]);
  const [benefitsList, setBenefitsList] = useState<any[]>([]);
  const [faqsList, setFaqsList] = useState<any[]>([]);
  const [videosList, setVideosList] = useState<any[]>([]);
  const [savingVideos, setSavingVideos] = useState<boolean>(false);
  const [navigationList, setNavigationList] = useState<any[]>([]);
  const [savingNavigation, setSavingNavigation] = useState<boolean>(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const triggerRevalidation = async () => {
    try { await fetch("/api/revalidate?path=/", { method: "POST" }); } catch {}
  };

  const handleUploadToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;
    const { error: uploadError } = await supabase.storage.from("gallery-uploads").upload(filePath, file);
    if (uploadError) throw new Error(`Detail: ${uploadError.message}. Pastikan bucket 'gallery-uploads' ada dan RLS mengizinkan upload.`);
    const { data } = supabase.storage.from("gallery-uploads").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const fetchGallery = useCallback(async () => {
    setGalleryLoading(true);
    try {
      const { data, error } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setGalleryItems((data as GalleryItem[]) || []);
    } catch (err) { console.error("Gagal mengambil galeri:", err); }
    finally { setGalleryLoading(false); }
  }, [supabase]);

  const fetchHeroSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("landing_settings").select("*");
      if (error) throw error;
      if (data && data.length > 0) {
        const settings: Record<string, string> = {};
        data.forEach((item) => { settings[item.key] = item.value; });
        setHeroTitle(settings.hero_title || "");
        setHeroSubtitle(settings.hero_subtitle || "");
        setHeroDesc(settings.hero_desc || "");
        setHeroImage(settings.hero_image || "");
        setContactAddress(settings.contact_address || "");
        setContactPhone(settings.contact_phone || "");
        setContactEmail(settings.contact_email || "");
        setPaymentBankName(settings.payment_bank_name || "");
        setPaymentAccountNumber(settings.payment_account_number || "");
        setPaymentAccountName(settings.payment_account_name || "");
        setPaymentAccountSub(settings.payment_account_sub || "");
        setPaymentSppKids(settings.payment_spp_kids || "300000");
        setPaymentSppTeens(settings.payment_spp_teens || "300000");
        setPaymentSppCalistung(settings.payment_spp_calistung || "350000");
        setMarqueeText1(settings.marquee_text_1 || "Pendaftaran Siswa Baru Ibra Global English Bobong Telah Dibuka!");
        setMarqueeText2(settings.marquee_text_2 || "Dapatkan Metode Pembelajaran Bahasa Inggris Interaktif, Fun, dan Tutor Berpengalaman!");
        setMarqueeText3(settings.marquee_text_3 || "Ikuti Placement Test Online Secara Gratis di Website Kami!");
        setCtaTag(settings.cta_tag || "Promo Terbatas!");
        setCtaTitle(settings.cta_title || "");
        setCtaDesc(settings.cta_desc || "");
        setCtaBrochureImage(settings.cta_brochure_image || "/assets/brochure.png");
        setAllowPublicCopy(settings.allow_public_copy === "true");
        setVisitorOffset(settings.visitor_offset || "0");

        const tryParse = (raw: string | undefined, fallback: any) => { try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
        setNavigationList(tryParse(settings.landing_navigation_menu, DEFAULT_NAVIGATION_MENU));
        setProgramsList(tryParse(settings.landing_programs, DEFAULT_PROGRAMS));
        setBenefitsList(tryParse(settings.landing_benefits, DEFAULT_BENEFITS));
        setFaqsList(tryParse(settings.landing_faq, DEFAULT_FAQS));
        setVideosList(tryParse(settings.landing_videos, DEFAULT_VIDEOS));
      }
    } catch (err) {
      showToast("Gagal memuat beberapa pengaturan landing page dari database.", "error");
    } finally {
      setLoading(false);
    }
    try {
      const res = await fetch("/api/maintenance");
      if (res.ok) { const d = await res.json(); setMaintenanceMode(d.maintenance === true); }
    } catch {}
  }, [supabase]);

  // Actions
  const handleSaveHeroSettings = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const payload = [
      { key: "hero_title", value: heroTitle.trim() }, { key: "hero_subtitle", value: heroSubtitle.trim() },
      { key: "hero_desc", value: heroDesc.trim() }, { key: "hero_image", value: heroImage.trim() },
      { key: "contact_address", value: contactAddress.trim() }, { key: "contact_phone", value: contactPhone.trim() },
      { key: "contact_email", value: contactEmail.trim() }, { key: "payment_bank_name", value: paymentBankName.trim() },
      { key: "payment_account_number", value: paymentAccountNumber.trim() }, { key: "payment_account_name", value: paymentAccountName.trim() },
      { key: "payment_account_sub", value: paymentAccountSub.trim() }, { key: "payment_spp_amount", value: paymentSppKids.trim() },
      { key: "payment_spp_kids", value: paymentSppKids.trim() }, { key: "payment_spp_teens", value: paymentSppTeens.trim() },
      { key: "payment_spp_calistung", value: paymentSppCalistung.trim() }, { key: "marquee_text_1", value: marqueeText1.trim() },
      { key: "marquee_text_2", value: marqueeText2.trim() }, { key: "marquee_text_3", value: marqueeText3.trim() },
      { key: "cta_tag", value: ctaTag.trim() }, { key: "cta_title", value: ctaTitle.trim() },
      { key: "cta_desc", value: ctaDesc.trim() }, { key: "cta_brochure_image", value: ctaBrochureImage.trim() },
    ];
    try {
      const { error } = await supabase.from("landing_settings").upsert(payload);
      if (error) throw error;
      showToast("Konfigurasi profil dan hero utama berhasil diperbarui!");
      await triggerRevalidation();
    } catch { showToast("Gagal menyimpan konfigurasi.", "error"); }
    finally { setLoading(false); }
  };

  const handleHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setUploadingHero(true);
    try { const url = await handleUploadToStorage(file); setHeroImage(url); showToast("Foto hero berhasil diunggah!"); }
    catch (err: any) { showToast("Gagal mengunggah foto hero. " + err.message, "error"); }
    finally { setUploadingHero(false); }
  };

  const handleCtaBrochureImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setUploadingCtaBrochure(true);
    try { const url = await handleUploadToStorage(file); setCtaBrochureImage(url); showToast("Brosur berhasil diunggah!"); }
    catch (err: any) { showToast("Gagal mengunggah brosur. " + err.message, "error"); }
    finally { setUploadingCtaBrochure(false); }
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    if (selectedFiles.length > 20) { showToast("Maksimal 20 foto yang dapat diunggah sekaligus.", "error"); return; }
    setGalleryFiles(selectedFiles);
    setGalleryPreviews(selectedFiles.map((f) => URL.createObjectURL(f)));
  };

  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryTitle.trim() || galleryFiles.length === 0) { showToast("Judul dan berkas foto wajib diisi.", "error"); return; }
    setAddingGallery(true);
    try {
      const batchTimestamp = new Date().toISOString();
      for (const file of galleryFiles) {
        const uploadedUrl = await handleUploadToStorage(file);
        const { error } = await supabase.from("gallery").insert([{ title: galleryTitle.trim(), description: galleryDesc.trim() || null, caption: galleryCaption.trim() || null, image_url: uploadedUrl, created_at: batchTimestamp }]);
        if (error) throw error;
      }
      showToast(`Berhasil menambahkan ${galleryFiles.length} foto kegiatan ke galeri publik!`);
      setGalleryTitle(""); setGalleryDesc(""); setGalleryCaption(""); setGalleryFiles([]); setGalleryPreviews([]);
      if (galleryFileRef.current) galleryFileRef.current.value = "";
      fetchGallery(); await triggerRevalidation();
    } catch (err: any) { showToast(err.message || "Gagal menyimpan foto kegiatan galeri.", "error"); }
    finally { setAddingGallery(false); }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus foto kegiatan ini dari galeri publik?")) return;
    try {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;
      showToast("Foto kegiatan berhasil dihapus dari galeri publik.");
      fetchGallery(); await triggerRevalidation();
    } catch { showToast("Gagal menghapus item galeri.", "error"); }
  };

  const handleSaveNavigation = async (updatedList: any[]) => {
    setSavingNavigation(true);
    try {
      const { error } = await supabase.from("landing_settings").upsert({ key: "landing_navigation_menu", value: JSON.stringify(updatedList) });
      if (error) throw error;
      setNavigationList(updatedList); showToast("Struktur menu navigasi berhasil disimpan!"); await triggerRevalidation();
    } catch { showToast("Gagal menyimpan menu navigasi ke database.", "error"); }
    finally { setSavingNavigation(false); }
  };

  const handleSaveVideos = async (updatedList: any[]) => {
    setSavingVideos(true);
    try {
      const { error } = await supabase.from("landing_settings").upsert({ key: "landing_videos", value: JSON.stringify(updatedList) });
      if (error) throw error;
      setVideosList(updatedList); showToast("Galeri video berhasil disimpan!"); await triggerRevalidation();
    } catch { showToast("Gagal menyimpan galeri video ke database.", "error"); }
    finally { setSavingVideos(false); }
  };

  const handleSavePrograms = async (newPrograms: any[]) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("landing_settings").upsert({ key: "landing_programs", value: JSON.stringify(newPrograms) });
      if (error) throw error;
      setProgramsList(newPrograms); showToast("Daftar Program Kursus berhasil disimpan!", "success"); await triggerRevalidation();
    } catch { showToast("Gagal menyimpan program kursus.", "error"); }
    finally { setLoading(false); }
  };

  const handleSaveBenefits = async (newBenefits: any[]) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("landing_settings").upsert({ key: "landing_benefits", value: JSON.stringify(newBenefits) });
      if (error) throw error;
      setBenefitsList(newBenefits); showToast("Daftar Keunggulan berhasil disimpan!", "success"); await triggerRevalidation();
    } catch { showToast("Gagal menyimpan keunggulan.", "error"); }
    finally { setLoading(false); }
  };

  const handleSaveFaqs = async (newFaqs: any[]) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("landing_settings").upsert({ key: "landing_faq", value: JSON.stringify(newFaqs) });
      if (error) throw error;
      setFaqsList(newFaqs); showToast("Daftar FAQ berhasil disimpan!", "success"); await triggerRevalidation();
    } catch { showToast("Gagal menyimpan FAQ.", "error"); }
    finally { setLoading(false); }
  };

  const handleToggleCopySetting = async () => {
    const newValue = !allowPublicCopy; setSavingCopySetting(true);
    try {
      const { error } = await supabase.from("landing_settings").upsert({ key: "allow_public_copy", value: String(newValue) });
      if (error) throw error;
      setAllowPublicCopy(newValue); showToast(newValue ? "Proteksi salin dinonaktifkan!" : "Proteksi salin diaktifkan!"); await triggerRevalidation();
    } catch (err: any) { showToast("Gagal mengubah pengaturan: " + err.message, "error"); }
    finally { setSavingCopySetting(false); }
  };

  const handleSaveVisitorOffset = async (e: React.FormEvent) => {
    e.preventDefault(); setSavingVisitorOffset(true);
    try {
      const { error } = await supabase.from("landing_settings").upsert({ key: "visitor_offset", value: visitorOffset.trim() });
      if (error) throw error;
      showToast("Angka awal pengunjung berhasil disimpan!"); await triggerRevalidation();
    } catch (err: any) { showToast("Gagal menyimpan: " + err.message, "error"); }
    finally { setSavingVisitorOffset(false); }
  };

  const handleSaveMaintenance = async (enabled: boolean, message: string) => {
    setSavingMaintenance(true);
    try {
      const res = await fetch("/api/maintenance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled, message }) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan pengaturan maintenance");
      setMaintenanceMode(enabled); showToast("Pengaturan mode pemeliharaan berhasil disimpan!", enabled ? "error" : "success");
    } catch (err: any) { showToast("Gagal menyimpan pengaturan: " + err.message, "error"); }
    finally { setSavingMaintenance(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchHeroSettings(); fetchGallery(); }, 0);
    return () => clearTimeout(timer);
  }, []);

  return {
    activeTab, setActiveTab, loading, toast, maintenanceMode, setMaintenanceMode,
    savingMaintenance, allowPublicCopy, savingCopySetting, visitorOffset, setVisitorOffset, savingVisitorOffset,
    heroTitle, setHeroTitle, heroSubtitle, setHeroSubtitle, heroDesc, setHeroDesc, heroImage, setHeroImage,
    contactAddress, setContactAddress, contactPhone, setContactPhone, contactEmail, setContactEmail,
    paymentBankName, setPaymentBankName, paymentAccountNumber, setPaymentAccountNumber,
    paymentAccountName, setPaymentAccountName, paymentAccountSub, setPaymentAccountSub,
    paymentSppAmount, setPaymentSppAmount, paymentSppKids, setPaymentSppKids,
    paymentSppTeens, setPaymentSppTeens, paymentSppCalistung, setPaymentSppCalistung,
    marqueeText1, setMarqueeText1, marqueeText2, setMarqueeText2, marqueeText3, setMarqueeText3,
    ctaTag, setCtaTag, ctaTitle, setCtaTitle, ctaDesc, setCtaDesc,
    ctaBrochureImage, setCtaBrochureImage, uploadingHero, uploadingCtaBrochure,
    heroFileRef, ctaBrochureFileRef,
    galleryList, galleryLoading, galleryTitle, setGalleryTitle, galleryDesc, setGalleryDesc,
    galleryCaption, setGalleryCaption, galleryFiles, galleryPreviews, addingGallery, galleryFileRef,
    programsList, setProgramsList, benefitsList, setBenefitsList, faqsList, setFaqsList,
    videosList, setVideosList, savingVideos, navigationList, setNavigationList, savingNavigation,
    handleSaveHeroSettings, handleHeroImageChange, handleCtaBrochureImageChange,
    handleGalleryFileChange, handleAddGalleryItem, handleDeleteGalleryItem,
    handleSaveNavigation, handleSaveVideos, handleSavePrograms, handleSaveBenefits, handleSaveFaqs,
    handleToggleCopySetting, handleSaveVisitorOffset, handleSaveMaintenance,
    handleUploadToStorage, showToast, triggerRevalidation,
  };
}
