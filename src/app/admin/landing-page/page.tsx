"use client";

export const dynamic = 'force-dynamic';

import React from 'react';
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { DEFAULT_PROGRAMS, DEFAULT_BENEFITS, DEFAULT_FAQS, DEFAULT_VIDEOS, DEFAULT_NAVIGATION_MENU } from "@/utils/fallbackData";
import HeroSettings from "./components/HeroSettings";
import NavigationManager from "./components/NavigationManager";
import GalleryManager from "./components/GalleryManager";
import VideoGallery from "./components/VideoGallery";
import TestimonialManager from "./components/TestimonialManager";
import ProgramManager from "./components/ProgramManager";
import BenefitManager from "./components/BenefitManager";
import FAQManager from "./components/FAQManager";
import MaintenanceSettings from "./components/MaintenanceSettings";
import ToastNotification from "../components/ToastNotification";
import LandingTabs from "./components/LandingTabs";
import { GalleryItem, Testimonial } from "@/types";

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export default function LandingPageCMS() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<string>("hero");
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" });

  // Maintenance mode
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [savingMaintenance, setSavingMaintenance] = useState<boolean>(false);

  // Copy protection setting
  const [allowPublicCopy, setAllowPublicCopy] = useState<boolean>(false);
  const [savingCopySetting, setSavingCopySetting] = useState<boolean>(false);

  // Visitor counter offset
  const [visitorOffset, setVisitorOffset] = useState<string>("0");
  const [savingVisitorOffset, setSavingVisitorOffset] = useState<boolean>(false);

  // ----------------------------------------------------
  // FORM STATES: HERO & CONTACT PROFILE
  // ----------------------------------------------------
  const [heroTitle, setHeroTitle] = useState<string>("");
  const [heroSubtitle, setHeroSubtitle] = useState<string>("");
  const [heroDesc, setHeroDesc] = useState<string>("");
  const [heroImage, setHeroImage] = useState<string>("");
  const [contactAddress, setContactAddress] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");

  // Payment configuration states
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

  // ----------------------------------------------------
  // LISTS & FORMS STATES: GALLERY
  // ----------------------------------------------------
  const [galleryList, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState<boolean>(false);
  const [galleryTitle, setGalleryTitle] = useState<string>("");
  const [galleryDesc, setGalleryDesc] = useState<string>("");
  const [galleryCaption, setGalleryCaption] = useState<string>("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [addingGallery, setAddingGallery] = useState<boolean>(false);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  // ----------------------------------------------------
  // LISTS & FORMS STATES: TESTIMONIALS
  // ----------------------------------------------------
  const [testimonialsList, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState<boolean>(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [author, setAuthor] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [testimonialText, setTestimonialText] = useState<string>("");
  const [savingTestimonial, setSavingTestimonial] = useState<boolean>(false);

  const [programsList, setProgramsList] = useState<any[]>([]);
  const [benefitsList, setBenefitsList] = useState<any[]>([]);
  const [faqsList, setFaqsList] = useState<any[]>([]);
  const [videosList, setVideosList] = useState<any[]>([]);
  const [savingVideos, setSavingVideos] = useState<boolean>(false);
  const [navigationList, setNavigationList] = useState<any[]>([]);
  const [savingNavigation, setSavingNavigation] = useState<boolean>(false);

  // ----------------------------------------------------
  // UTILITIES & NOTIFICATIONS
  // ----------------------------------------------------
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  // ----------------------------------------------------
  // FETCH DATA FUNCTIONS
  // ----------------------------------------------------
  const fetchHeroSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("landing_settings").select("*");
      if (error) throw error;
      if (data && data.length > 0) {
        const settings: Record<string, string> = {};
        data.forEach(item => {
          settings[item.key] = item.value;
        });
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
        setPaymentSppAmount(settings.payment_spp_amount || "");
        setPaymentSppKids(settings.payment_spp_kids || "300000");
        setPaymentSppTeens(settings.payment_spp_teens || "300000");
        setPaymentSppCalistung(settings.payment_spp_calistung || "350000");
        setMarqueeText1(settings.marquee_text_1 || "Pendaftaran Siswa Baru Ibra Global English Bobong Telah Dibuka! Segera Daftarkan Putra-Putri Anda!");
        setMarqueeText2(settings.marquee_text_2 || "Dapatkan Metode Pembelajaran Bahasa Inggris Interaktif, Fun, dan Tutor Berpengalaman!");
        setMarqueeText3(settings.marquee_text_3 || "Ikuti Placement Test Online Secara Gratis di Website Kami dan Cari Tahu Tingkat Kemampuan Anda!");
        setCtaTag(settings.cta_tag || "Promo Terbatas!");
        setCtaTitle(settings.cta_title || "Kuasai Bahasa Inggris Lebih Cepat di Bobong & Jadi Percaya Diri!");
        setCtaDesc(settings.cta_desc || "Dapatkan tes penempatan level (Placement Test) & bimbingan belajar gratis sekarang juga di Ibra Global English Bobong. Kuota sangat terbatas!");
        setCtaBrochureImage(settings.cta_brochure_image || "/assets/brochure.png");
        setAllowPublicCopy(settings.allow_public_copy === "true");
        setVisitorOffset(settings.visitor_offset || "0");

        const programsRaw = settings.landing_programs;
        const benefitsRaw = settings.landing_benefits;
        const faqRaw = settings.landing_faq;
        const navigationRaw = settings.landing_navigation_menu;
        
        if (navigationRaw) {
          try {
            setNavigationList(JSON.parse(navigationRaw));
          } catch (e) {
            setNavigationList(DEFAULT_NAVIGATION_MENU);
          }
        } else {
          setNavigationList(DEFAULT_NAVIGATION_MENU);
        }
        
        if (programsRaw) {
          try {
            setProgramsList(JSON.parse(programsRaw));
          } catch (e) {
            setProgramsList(DEFAULT_PROGRAMS);
          }
        } else {
          setProgramsList(DEFAULT_PROGRAMS);
        }
        
        if (benefitsRaw) {
          try {
            setBenefitsList(JSON.parse(benefitsRaw));
          } catch (e) {
            setBenefitsList(DEFAULT_BENEFITS);
          }
        } else {
          setBenefitsList(DEFAULT_BENEFITS);
        }
        
        if (faqRaw) {
          try {
            setFaqsList(JSON.parse(faqRaw));
          } catch (e) {
            setFaqsList(DEFAULT_FAQS);
          }
        } else {
          setFaqsList(DEFAULT_FAQS);
        }

        const videosRaw = settings.landing_videos;
        if (videosRaw) {
          try {
            setVideosList(JSON.parse(videosRaw));
          } catch (e) {
            setVideosList(DEFAULT_VIDEOS);
          }
        } else {
          setVideosList(DEFAULT_VIDEOS);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil konfigurasi hero:", err);
      showToast("Gagal memuat beberapa pengaturan landing page dari database.", "error");
    } finally {
      setLoading(false);
    }

    // Fetch maintenance mode status dari API route
    try {
      const res = await fetch("/api/maintenance");
      if (res.ok) {
        const data = await res.json();
        setMaintenanceMode(data.maintenance === true);
      }
    } catch (_) {
      // Biarkan default false jika gagal
    }
  };

  const triggerRevalidation = async () => {
    try {
      await fetch("/api/revalidate?path=/", { method: "POST" });
    } catch (err) {
      console.warn("Gagal trigger revalidasi:", err);
    }
  };

  const handleSaveNavigation = async (updatedList: any[]) => {
    setSavingNavigation(true);
    try {
      const { error } = await supabase
        .from("landing_settings")
        .upsert({ key: "landing_navigation_menu", value: JSON.stringify(updatedList) });
      if (error) throw error;
      setNavigationList(updatedList);
      showToast("Struktur menu navigasi berhasil disimpan!");
      await triggerRevalidation();
    } catch (err) {
      console.error("Gagal menyimpan navigasi:", err);
      showToast("Gagal menyimpan menu navigasi ke database.", "error");
    } finally {
      setSavingNavigation(false);
    }
  };

  const handleSaveVideos = async (updatedList: any[]) => {
    setSavingVideos(true);
    try {
      const { error } = await supabase
        .from("landing_settings")
        .upsert({ key: "landing_videos", value: JSON.stringify(updatedList) });
      
      if (error) throw error;
      setVideosList(updatedList);
      showToast("Galeri video berhasil disimpan!");
      await triggerRevalidation();
    } catch (err) {
      console.error("Gagal menyimpan galeri video:", err);
      showToast("Gagal menyimpan galeri video ke database.", "error");
    } finally {
      setSavingVideos(false);
    }
  };

  const handleToggleCopySetting = async () => {
    const newValue = !allowPublicCopy;
    setSavingCopySetting(true);
    try {
      const { error } = await supabase
        .from("landing_settings")
        .upsert({ key: "allow_public_copy", value: String(newValue) });
      if (error) throw error;
      setAllowPublicCopy(newValue);
      showToast(newValue ? "Proteksi salin dinonaktifkan!" : "Proteksi salin diaktifkan!");
      await triggerRevalidation();
    } catch (err: any) {
      showToast("Gagal mengubah pengaturan: " + err.message, "error");
    } finally {
      setSavingCopySetting(false);
    }
  };

  const handleSaveVisitorOffset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingVisitorOffset(true);
    try {
      const { error } = await supabase
        .from("landing_settings")
        .upsert({ key: "visitor_offset", value: visitorOffset.trim() });
      if (error) throw error;
      showToast("Angka awal pengunjung berhasil disimpan!");
      await triggerRevalidation();
    } catch (err: any) {
      showToast("Gagal menyimpan angka awal pengunjung: " + err.message, "error");
    } finally {
      setSavingVisitorOffset(false);
    }
  };

  const fetchGallery = async () => {
    setGalleryLoading(true);
    try {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setGalleryItems((data as GalleryItem[]) || []);
    } catch (err) {
      console.error("Gagal mengambil galeri:", err);
    } finally {
      setGalleryLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    setTestimonialsLoading(true);
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTestimonials((data as Testimonial[]) || []);
    } catch (err) {
      console.error("Gagal mengambil testimoni:", err);
    } finally {
      setTestimonialsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHeroSettings();
      fetchGallery();
      fetchTestimonials();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSavePrograms = async (newPrograms: any[]) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("landing_settings")
        .upsert({ key: "landing_programs", value: JSON.stringify(newPrograms) });
      if (error) throw error;
      setProgramsList(newPrograms);
      showToast("Daftar Program Kursus berhasil disimpan!", "success");
      await triggerRevalidation();
    } catch (err) {
      console.error(err);
      showToast("Gagal menyimpan program kursus.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBenefits = async (newBenefits: any[]) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("landing_settings")
        .upsert({ key: "landing_benefits", value: JSON.stringify(newBenefits) });
      if (error) throw error;
      setBenefitsList(newBenefits);
      showToast("Daftar Keunggulan berhasil disimpan!", "success");
      await triggerRevalidation();
    } catch (err) {
      console.error(err);
      showToast("Gagal menyimpan keunggulan.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFaqs = async (newFaqs: any[]) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("landing_settings")
        .upsert({ key: "landing_faq", value: JSON.stringify(newFaqs) });
      if (error) throw error;
      setFaqsList(newFaqs);
      showToast("Daftar FAQ berhasil disimpan!", "success");
      await triggerRevalidation();
    } catch (err) {
      console.error(err);
      showToast("Gagal menyimpan FAQ.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // UPLOAD HELPER FUNCTION
  // ----------------------------------------------------
  const handleUploadToStorage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery-uploads")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("gallery-uploads")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err: any) {
      console.error("Kesalahan unggah:", err);
      throw new Error(
        `Detail: ${err.message || err}. Pastikan Anda login sebagai Admin, bucket 'gallery-uploads' sudah dibuat di Supabase, dan kebijakan RLS (Row Level Security) mengizinkan upload.`
      );
    }
  };

  // ----------------------------------------------------
  // HERO & PROFILE ACTIONS
  // ----------------------------------------------------
  const handleHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    try {
      const publicUrl = await handleUploadToStorage(file);
      setHeroImage(publicUrl);
      showToast("Foto hero utama berhasil diunggah ke storage!");
    } catch (err: any) {
      showToast("Gagal mengunggah foto hero. " + err.message, "error");
    } finally {
      setUploadingHero(false);
    }
  };

  const handleCtaBrochureImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCtaBrochure(true);
    try {
      const publicUrl = await handleUploadToStorage(file);
      setCtaBrochureImage(publicUrl);
      showToast("Berkas brosur promosi berhasil diunggah ke storage!");
    } catch (err: any) {
      showToast("Gagal mengunggah brosur promosi. " + err.message, "error");
    } finally {
      setUploadingCtaBrochure(false);
    }
  };

  const handleSaveHeroSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = [
      { key: "hero_title", value: heroTitle.trim() },
      { key: "hero_subtitle", value: heroSubtitle.trim() },
      { key: "hero_desc", value: heroDesc.trim() },
      { key: "hero_image", value: heroImage.trim() },
      { key: "contact_address", value: contactAddress.trim() },
      { key: "contact_phone", value: contactPhone.trim() },
      { key: "contact_email", value: contactEmail.trim() },
      { key: "payment_bank_name", value: paymentBankName.trim() },
      { key: "payment_account_number", value: paymentAccountNumber.trim() },
      { key: "payment_account_name", value: paymentAccountName.trim() },
      { key: "payment_account_sub", value: paymentAccountSub.trim() },
      { key: "payment_spp_amount", value: paymentSppKids.trim() }, // fallback / backward-compatibility
      { key: "payment_spp_kids", value: paymentSppKids.trim() },
      { key: "payment_spp_teens", value: paymentSppTeens.trim() },
      { key: "payment_spp_calistung", value: paymentSppCalistung.trim() },
      { key: "marquee_text_1", value: marqueeText1.trim() },
      { key: "marquee_text_2", value: marqueeText2.trim() },
      { key: "marquee_text_3", value: marqueeText3.trim() },
      { key: "cta_tag", value: ctaTag.trim() },
      { key: "cta_title", value: ctaTitle.trim() },
      { key: "cta_desc", value: ctaDesc.trim() },
      { key: "cta_brochure_image", value: ctaBrochureImage.trim() },
    ];

    try {
      const { error } = await supabase.from("landing_settings").upsert(payload);
      if (error) throw error;
      showToast("Konfigurasi profil dan hero utama berhasil diperbarui!");
      await triggerRevalidation();
    } catch (err) {
      console.error("Kesalahan simpan hero:", err);
      showToast("Gagal menyimpan konfigurasi. Periksa koneksi internet atau schema database.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // GALLERY ACTIONS
  // ----------------------------------------------------
  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    if (selectedFiles.length > 20) {
      showToast("Maksimal 20 foto yang dapat diunggah sekaligus.", "error");
      return;
    }

    setGalleryFiles(selectedFiles);
    const previews = selectedFiles.map(file => URL.createObjectURL(file));
    setGalleryPreviews(previews);
  };

  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryTitle.trim() || galleryFiles.length === 0) {
      showToast("Judul kegiatan dan berkas foto wajib diisi.", "error");
      return;
    }

    setAddingGallery(true);
    try {
      const batchTimestamp = new Date().toISOString();

      for (let i = 0; i < galleryFiles.length; i++) {
        const file = galleryFiles[i];

        const uploadedUrl = await handleUploadToStorage(file);

        const { error } = await supabase.from("gallery").insert([
          {
            title: galleryTitle.trim(),
            description: galleryDesc.trim() || null,
            caption: galleryCaption.trim() || null,
            image_url: uploadedUrl,
            created_at: batchTimestamp
          },
        ]);

        if (error) throw error;
      }

      showToast(`Berhasil menambahkan ${galleryFiles.length} foto kegiatan ke galeri publik!`);
      setGalleryTitle("");
      setGalleryDesc("");
      setGalleryCaption("");
      setGalleryFiles([]);
      setGalleryPreviews([]);
      if (galleryFileRef.current) galleryFileRef.current.value = "";
      fetchGallery();
      await triggerRevalidation();
    } catch (err: any) {
      console.error("Kesalahan tambah galeri:", err);
      showToast(err.message || "Gagal menyimpan foto kegiatan galeri.", "error");
    } finally {
      setAddingGallery(false);
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus foto kegiatan ini dari galeri publik?")) return;

    try {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;
      showToast("Foto kegiatan berhasil dihapus dari galeri publik.");
      fetchGallery();
      await triggerRevalidation();
    } catch (err) {
      console.error("Kesalahan hapus galeri:", err);
      showToast("Gagal menghapus item galeri.", "error");
    }
  };

  // ----------------------------------------------------
  // TESTIMONIAL ACTIONS
  // ----------------------------------------------------
  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !role.trim() || !testimonialText.trim()) {
      showToast("Nama penulis, peran, dan teks ulasan wajib diisi.", "error");
      return;
    }

    setSavingTestimonial(true);
    try {
      if (editingTestimonialId) {
        // Update
        const { error } = await supabase
          .from("testimonials")
          .update({
            author: author.trim(),
            role: role.trim(),
            rating: parseInt(rating as any),
            text: testimonialText.trim(),
          })
          .eq("id", editingTestimonialId);

        if (error) throw error;
        showToast("Testimonial berhasil disunting.");
        setEditingTestimonialId(null);
      } else {
        // Create
        const { error } = await supabase.from("testimonials").insert([
          {
            author: author.trim(),
            role: role.trim(),
            rating: parseInt(rating as any),
            text: testimonialText.trim(),
          },
        ]);

        if (error) throw error;
        showToast("Testimonial ulasan baru berhasil ditambahkan!");
      }

      setAuthor("");
      setRole("");
      setRating(5);
      setTestimonialText("");
      fetchTestimonials();
      await triggerRevalidation();
    } catch (err) {
      console.error("Kesalahan simpan testimoni:", err);
      showToast("Gagal menyimpan data ulasan testimoni.", "error");
    } finally {
      setSavingTestimonial(false);
    }
  };

  const handleEditTestimonialClick = (t: Testimonial) => {
    setEditingTestimonialId(t.id);
    setAuthor(t.author);
    setRole(t.role);
    setRating(t.rating);
    setTestimonialText(t.text);
  };

  const handleCancelEditTestimonial = () => {
    setEditingTestimonialId(null);
    setAuthor("");
    setRole("");
    setRating(5);
    setTestimonialText("");
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus ulasan testimoni ini dari halaman utama?")) return;

    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
      showToast("Ulasan testimoni berhasil dihapus.");
      fetchTestimonials();
      await triggerRevalidation();
    } catch (err) {
      console.error("Kesalahan hapus testimoni:", err);
      showToast("Gagal menghapus testimoni.", "error");
    }
  };

  const handleSaveMaintenance = async (enabled: boolean, message: string) => {
    setSavingMaintenance(true);
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, message }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan pengaturan maintenance");
      setMaintenanceMode(enabled);
      showToast("Pengaturan mode pemeliharaan berhasil disimpan!", enabled ? "error" : "success");
    } catch (err: any) {
      showToast("Gagal menyimpan pengaturan: " + err.message, "error");
    } finally {
      setSavingMaintenance(false);
    }
  };

  return (
    <div style={{ padding: "1.5rem 1rem", maxWidth: "1200px", margin: "0 auto" }}>
      <ToastNotification toast={toast as any} />

      {/* Top Header Section */}
      <div className="dashboard-topbar" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.25rem", borderBottom: "1px solid var(--color-gray-200)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>Kelola Landing Page</h1>
        <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
          Sesuaikan seluruh isi tulisan, gambar pahlawan (hero), galeri kelas, dan review wali murid di landing page utama secara real-time.
        </p>
      </div>

      <LandingTabs activeTab={activeTab} setActiveTab={setActiveTab} maintenanceMode={maintenanceMode} />

      {/* Tab Contents */}
      {activeTab === "hero" && (
        <HeroSettings
          heroTitle={heroTitle} setHeroTitle={setHeroTitle}
          heroSubtitle={heroSubtitle} setHeroSubtitle={setHeroSubtitle}
          heroDesc={heroDesc} setHeroDesc={setHeroDesc}
          heroImage={heroImage} setHeroImage={setHeroImage}
          contactAddress={contactAddress} setContactAddress={setContactAddress}
          contactPhone={contactPhone} setContactPhone={setContactPhone}
          contactEmail={contactEmail} setContactEmail={setContactEmail}
          paymentBankName={paymentBankName} setPaymentBankName={setPaymentBankName}
          paymentAccountNumber={paymentAccountNumber} setPaymentAccountNumber={setPaymentAccountNumber}
          paymentAccountName={paymentAccountName} setPaymentAccountName={setPaymentAccountName}
          paymentAccountSub={paymentAccountSub} setPaymentAccountSub={setPaymentAccountSub}
          paymentSppKids={paymentSppKids} setPaymentSppKids={setPaymentSppKids}
          paymentSppTeens={paymentSppTeens} setPaymentSppTeens={setPaymentSppTeens}
          paymentSppCalistung={paymentSppCalistung} setPaymentSppCalistung={setPaymentSppCalistung}
          marqueeText1={marqueeText1} setMarqueeText1={setMarqueeText1}
          marqueeText2={marqueeText2} setMarqueeText2={setMarqueeText2}
          marqueeText3={marqueeText3} setMarqueeText3={setMarqueeText3}
          ctaTag={ctaTag} setCtaTag={setCtaTag}
          ctaTitle={ctaTitle} setCtaTitle={setCtaTitle}
          ctaDesc={ctaDesc} setCtaDesc={setCtaDesc}
          ctaBrochureImage={ctaBrochureImage} setCtaBrochureImage={setCtaBrochureImage}
          uploadingHero={uploadingHero} setUploadingHero={setUploadingHero}
          uploadingCtaBrochure={uploadingCtaBrochure} setUploadingCtaBrochure={setUploadingCtaBrochure}
          heroFileRef={heroFileRef} ctaBrochureFileRef={ctaBrochureFileRef}
          handleUploadToStorage={handleUploadToStorage}
          onSave={handleSaveHeroSettings}
        />
      )}

      {activeTab === "navigation" && (
        <NavigationManager
          navigationList={navigationList}
          setNavigationList={setNavigationList}
          handleSaveNavigation={handleSaveNavigation}
        />
      )}

      {activeTab === "gallery" && (
        <GalleryManager
          galleryTitle={galleryTitle} setGalleryTitle={setGalleryTitle}
          galleryDesc={galleryDesc} setGalleryDesc={setGalleryDesc}
          galleryCaption={galleryCaption} setGalleryCaption={setGalleryCaption}
          galleryPreviews={galleryPreviews} setGalleryPreviews={setGalleryPreviews}
          galleryFiles={galleryFiles} setGalleryFiles={setGalleryFiles}
          galleryFileRef={galleryFileRef}
          addingGallery={addingGallery} setAddingGallery={setAddingGallery}
          galleryList={galleryList} setGalleryList={setGalleryItems}
          galleryLoading={galleryLoading}
          handleGalleryFileChange={handleGalleryFileChange}
          handleAddGalleryItem={handleAddGalleryItem}
          handleDeleteGalleryItem={handleDeleteGalleryItem}
        />
      )}

      {activeTab === "videos" && (
        <VideoGallery
          videosList={videosList} setVideosList={setVideosList}
          savingVideos={savingVideos} setSavingVideos={setSavingVideos}
          handleSaveVideos={handleSaveVideos}
        />
      )}

      {activeTab === "testimonials" && (
        <TestimonialManager
          editingTestimonialId={editingTestimonialId} setEditingTestimonialId={setEditingTestimonialId}
          author={author} setAuthor={setAuthor}
          role={role} setRole={setRole}
          rating={rating} setRating={setRating}
          testimonialText={testimonialText} setTestimonialText={setTestimonialText}
          savingTestimonial={savingTestimonial} setSavingTestimonial={setSavingTestimonial}
          testimonialsList={testimonialsList} setTestimonialsList={setTestimonials}
          testimonialsLoading={testimonialsLoading}
          handleSaveTestimonial={handleSaveTestimonial}
          handleCancelEditTestimonial={handleCancelEditTestimonial}
          handleEditTestimonialClick={handleEditTestimonialClick}
          handleDeleteTestimonial={handleDeleteTestimonial}
        />
      )}

      {activeTab === "programs" && (
        <ProgramManager
          programsList={programsList} setProgramsList={setProgramsList}
          handleSavePrograms={handleSavePrograms}
        />
      )}

      {activeTab === "benefits" && (
        <BenefitManager
          benefitsList={benefitsList} setBenefitsList={setBenefitsList}
          handleSaveBenefits={handleSaveBenefits}
        />
      )}

      {activeTab === "faq" && (
        <FAQManager
          faqsList={faqsList} setFaqsList={setFaqsList}
          handleSaveFaqs={handleSaveFaqs}
        />
      )}

      {activeTab === "maintenance" && (
        <MaintenanceSettings
          maintenanceEnabled={maintenanceMode} setMaintenanceEnabled={setMaintenanceMode}
          maintenanceMessage={""} setMaintenanceMessage={() => {}}
          savingMaintenance={savingMaintenance} setSavingMaintenance={setSavingMaintenance}
          handleSaveMaintenance={handleSaveMaintenance}
        />
      )}
    </div>
  );
}
