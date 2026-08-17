"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useLandingPageGallery } from "./useLandingPageGallery";

export interface ToastState { show: boolean; message: string; type: "success" | "error"; }

export function useLandingPageCMS() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<string>("hero");
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingSettings, setFetchingSettings] = useState<boolean>(true);
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" });

  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [savingMaintenance, setSavingMaintenance] = useState<boolean>(false);
  const [allowPublicCopy, setAllowPublicCopy] = useState<boolean>(false);
  const [savingCopySetting, setSavingCopySetting] = useState<boolean>(false);
  const [visitorOffset, setVisitorOffset] = useState<string>("0");
  const [savingVisitorOffset, setSavingVisitorOffset] = useState<boolean>(false);

  const [heroTitle, setHeroTitle] = useState<string>("");
  const [heroSubtitle, setHeroSubtitle] = useState<string>("");
  const [heroDesc, setHeroDesc] = useState<string>("");
  const [heroImage, setHeroImage] = useState<string>("");
  const [contactAddress, setContactAddress] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");

  const [paymentBankName, setPaymentBankName] = useState<string>("");
  const [paymentAccountNumber, setPaymentAccountNumber] = useState<string>("");
  const [paymentAccountName, setPaymentAccountName] = useState<string>("");
  const [paymentAccountSub, setPaymentAccountSub] = useState<string>("");
  const [paymentSppAmount, setPaymentSppAmount] = useState<string>("");
  const [paymentSppKids, setPaymentSppKids] = useState<string>("");
  const [paymentSppTeens, setPaymentSppTeens] = useState<string>("");
  const [paymentSppCalistung, setPaymentSppCalistung] = useState<string>("");

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
  const galleryFileRef = useRef<HTMLInputElement>(null);

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

  const triggerRevalidation = async () => { try { await fetch("/api/revalidate?path=/", { method: "POST" }); } catch {} };

  const galleryState = useLandingPageGallery(showToast, triggerRevalidation);

  const fetchLandingSettings = async () => {
    setFetchingSettings(true);
    try {
      const { data, error } = await supabase.from("landing_settings").select("key, value");
      if (error) throw error;
      if (data) {
        const map: Record<string, any> = {};
        data.forEach((item: { key: string; value: any }) => {
          map[item.key] = item.value;
        });

        setHeroTitle(map["hero_title"] || "Ibra Global English Bobong");
        setHeroSubtitle(map["hero_subtitle"] || "Belajar Seru | Lancar Bicara");
        setHeroDesc(map["hero_desc"] || "Saatnya Percaya Diri Berbahasa Inggris,\nDi IBRA Global English Bobong, belajar tidak hanya tentang teori. Nikmati pengalaman belajar yang seru, aktif, dan penuh praktik sehingga kamu bisa memahami, menggunakan, dan berbicara bahasa Inggris dengan lebih lancar setiap hari.");
        setHeroImage(map["hero_image"] || "/assets/logo.png");
        setContactAddress(map["contact_address"] || "Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001, Bobong, Taliabu Barat, Kabupaten Pulau Taliabu, Maluku Utara 97794");
        setContactPhone(map["contact_phone"] || "+6281357001357");
        setContactEmail(map["contact_email"] || "admin@ibraglobalenglish.uk");
        setPaymentBankName(map["payment_bank_name"] || "BRI");
        setPaymentAccountNumber(map["payment_account_number"] || "767901015374533");
        setPaymentAccountName(map["payment_account_name"] || "Husnita Usman");
        setPaymentAccountSub(map["payment_account_sub"] || "Ibra Global English");
        setPaymentSppAmount(map["payment_spp_amount"] || "300000");
        setPaymentSppKids(map["payment_spp_kids"] || "300000");
        setPaymentSppTeens(map["payment_spp_teens"] || "300000");
        setPaymentSppCalistung(map["payment_spp_calistung"] || "350000");
        setMarqueeText1(map["marquee_text_1"] || "Pendaftaran ditutup karena kelas full");
        setMarqueeText2(map["marquee_text_2"] || "Dapatkan Metode Pembelajaran Bahasa Inggris Interaktif, Fun, dan Tutor Berpengalaman!");
        setMarqueeText3(map["marquee_text_3"] || "Ikuti Placement Test Offline Secara Gratis, Ayo Kesini dan Cari Tahu Tingkat Kemampuan Kalian");
        setCtaTag(map["cta_tag"] || "Promo Terbatas!");
        setCtaTitle(map["cta_title"] || "Kuasai Bahasa Inggris Lebih Cepat di Ibra Global English Bobong & Jadi Percaya Diri!");
        setCtaDesc(map["cta_desc"] || "Dapatkan tes penempatan level (Placement Test) & bimbingan belajar gratis sekarang juga di Ibra Global English Bobong. Kuota sangat terbatas!");
        setCtaBrochureImage(map["cta_brochure_image"] || "/assets/brochure.png");
        setAllowPublicCopy(map["allow_public_copy"] === "true" || map["allow_public_copy"] === true);
        setMaintenanceMode(map["maintenance_mode"] === "true" || map["maintenance_mode"] === true);
        setVisitorOffset(String(map["visitor_offset"] || "0"));

        const parseList = (raw: any, fallback: any[]) => {
          if (!raw) return fallback;
          if (Array.isArray(raw)) return raw;
          try { return JSON.parse(raw); } catch { return fallback; }
        };

        setVideosList(parseList(map["landing_videos"], [{ title: "Final", desc: "Shorts Video", url: "https://youtube.com/shorts/qvVL3p9qybM" }]));
        setFaqsList(parseList(map["landing_faq"], [
          { question: "Dimana lokasi les Ibra Global English Bobong?", answer: "Gedung Kost Fitrah Lantai 1, Belakang Mess Tambang, Bobong, Pulau Taliabu." },
          { question: "Program apa saja yang tersedia?", answer: "Fun Calistung, Kids Program, dan Teens Program." }
        ]));
        setProgramsList(parseList(map["landing_programs"], [
          { title: "Fun Calistung", level: "PAUD & TK", desc: "Membaca, Menulis, Berhitung dengan menyenangkan." },
          { title: "Kids Program", level: "SD Level 1-6", desc: "Bahasa Inggris interaktif untuk anak SD." },
          { title: "Teens Program", level: "SMP & SMA", desc: "Bahasa Inggris tingkat lanjut untuk remaja." }
        ]));
        setBenefitsList(parseList(map["landing_benefits"], [
          { title: "Tutor Berpengalaman", desc: "Dididik oleh lulusan S2 Pendidikan Bahasa Inggris." },
          { title: "Metode Fun & Active", desc: "Belajar interaktif berbasis games & praktik langsung." }
        ]));
        setNavigationList(parseList(map["landing_navigation"], [
          { label: "Beranda", url: "#home" },
          { label: "Program", url: "#programs" },
          { label: "Fasilitas", url: "#benefits" },
          { label: "Galeri", url: "/gallery" },
          { label: "Kontak", url: "#contact" }
        ]));
      }
    } catch (err: any) {
      showToast("Gagal memuat data pengaturan: " + err.message, "error");
    } finally {
      setFetchingSettings(false);
    }
  };

  const handleUploadToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;
    const { error: uploadError } = await supabase.storage.from("gallery-uploads").upload(filePath, file);
    if (uploadError) throw new Error(uploadError.message);
    return supabase.storage.from("gallery-uploads").getPublicUrl(filePath).data.publicUrl;
  };

  const handleHeroImageChange = async (file: File) => {
    setUploadingHero(true);
    try { setHeroImage(await handleUploadToStorage(file)); showToast("Gambar Hero diunggah!"); } catch (err: any) { showToast(err.message, "error"); } finally { setUploadingHero(false); }
  };

  const handleCtaBrochureImageChange = async (file: File) => {
    setUploadingCtaBrochure(true);
    try { setCtaBrochureImage(await handleUploadToStorage(file)); showToast("Brosur CTA diunggah!"); } catch (err: any) { showToast(err.message, "error"); } finally { setUploadingCtaBrochure(false); }
  };

  const handleSaveHeroSettings = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const settings = [
        { key: "hero_title", value: heroTitle }, { key: "hero_subtitle", value: heroSubtitle }, { key: "hero_desc", value: heroDesc },
        { key: "hero_image", value: heroImage }, { key: "contact_address", value: contactAddress }, { key: "contact_phone", value: contactPhone },
        { key: "contact_email", value: contactEmail }, { key: "payment_bank_name", value: paymentBankName }, { key: "payment_account_number", value: paymentAccountNumber },
        { key: "payment_account_name", value: paymentAccountName }, { key: "payment_account_sub", value: paymentAccountSub }, { key: "payment_spp_amount", value: paymentSppAmount },
        { key: "payment_spp_kids", value: paymentSppKids }, { key: "payment_spp_teens", value: paymentSppTeens }, { key: "payment_spp_calistung", value: paymentSppCalistung },
        { key: "marquee_text_1", value: marqueeText1 }, { key: "marquee_text_2", value: marqueeText2 }, { key: "marquee_text_3", value: marqueeText3 },
        { key: "cta_tag", value: ctaTag }, { key: "cta_title", value: ctaTitle }, { key: "cta_desc", value: ctaDesc }, { key: "cta_brochure_image", value: ctaBrochureImage }
      ];
      const { error } = await supabase.from("landing_settings").upsert(settings);
      if (error) throw error;
      showToast("Pengaturan Landing Page berhasil disimpan!"); await triggerRevalidation();
    } catch (err: any) { showToast("Gagal menyimpan: " + err.message, "error"); } finally { setLoading(false); }
  };

  const handleSaveVideos = async (listToSave: any[]) => {
    setSavingVideos(true);
    try {
      const payload = JSON.stringify(listToSave);
      const { error } = await supabase
        .from("landing_settings")
        .upsert([{ key: "landing_videos", value: payload }]);

      if (error) throw error;
      showToast("Galeri video berhasil disimpan ke database!");
      await triggerRevalidation();
    } catch (err: any) {
      showToast("Gagal menyimpan galeri video: " + err.message, "error");
    } finally {
      setSavingVideos(false);
    }
  };

  const handleSavePrograms = async (listToSave: any[]) => {
    try {
      const payload = JSON.stringify(listToSave);
      const { error } = await supabase.from("landing_settings").upsert([{ key: "landing_programs", value: payload }]);
      if (error) throw error;
      showToast("Daftar program berhasil disimpan!");
      await triggerRevalidation();
    } catch (err: any) {
      showToast("Gagal menyimpan program: " + err.message, "error");
    }
  };

  const handleSaveBenefits = async (listToSave: any[]) => {
    try {
      const payload = JSON.stringify(listToSave);
      const { error } = await supabase.from("landing_settings").upsert([{ key: "landing_benefits", value: payload }]);
      if (error) throw error;
      showToast("Daftar keunggulan berhasil disimpan!");
      await triggerRevalidation();
    } catch (err: any) {
      showToast("Gagal menyimpan keunggulan: " + err.message, "error");
    }
  };

  const handleSaveFaqs = async (listToSave: any[]) => {
    try {
      const payload = JSON.stringify(listToSave);
      const { error } = await supabase.from("landing_settings").upsert([{ key: "landing_faqs", value: payload }]);
      if (error) throw error;
      showToast("Daftar FAQ berhasil disimpan!");
      await triggerRevalidation();
    } catch (err: any) {
      showToast("Gagal menyimpan FAQ: " + err.message, "error");
    }
  };

  const handleSaveNavigation = async (listToSave: any[]) => {
    try {
      const payload = JSON.stringify(listToSave);
      const { error } = await supabase.from("landing_settings").upsert([{ key: "landing_navigation", value: payload }]);
      if (error) throw error;
      showToast("Daftar navigasi berhasil disimpan!");
      await triggerRevalidation();
    } catch (err: any) {
      showToast("Gagal menyimpan navigasi: " + err.message, "error");
    }
  };

  useEffect(() => {
    fetchLandingSettings();
    galleryState.fetchGallery();
  }, []);

  return {
    activeTab, setActiveTab, loading, fetchingSettings, toast, maintenanceMode, setMaintenanceMode,
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
    heroFileRef, ctaBrochureFileRef, galleryFileRef,
    ...galleryState,
    handleGalleryFileChange: () => {}, handleAddGalleryItem: () => {},
    handleSaveNavigation, handleSaveVideos, handleSavePrograms, handleSaveBenefits, handleSaveFaqs,
    programsList, setProgramsList, benefitsList, setBenefitsList, faqsList, setFaqsList,
    videosList, setVideosList, savingVideos, navigationList, setNavigationList, savingNavigation,
    handleSaveHeroSettings, handleHeroImageChange, handleCtaBrochureImageChange,
    handleSaveMaintenance: () => {}, handleUploadToStorage, showToast, triggerRevalidation,
  };
}
