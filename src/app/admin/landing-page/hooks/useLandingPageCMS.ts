"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useLandingPageGallery } from "./useLandingPageGallery";

export interface ToastState { show: boolean; message: string; type: "success" | "error"; }

export function useLandingPageCMS() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<string>("hero");
  const [loading, setLoading] = useState<boolean>(false);
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

  useEffect(() => { galleryState.fetchGallery(); }, []);

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
    heroFileRef, ctaBrochureFileRef, galleryFileRef,
    ...galleryState,
    handleGalleryFileChange: () => {}, handleAddGalleryItem: () => {},
    handleSaveNavigation: () => {}, handleSaveVideos: () => {}, handleSavePrograms: () => {}, handleSaveBenefits: () => {}, handleSaveFaqs: () => {},
    programsList, setProgramsList, benefitsList, setBenefitsList, faqsList, setFaqsList,
    videosList, setVideosList, savingVideos, navigationList, setNavigationList, savingNavigation,
    handleSaveHeroSettings, handleHeroImageChange, handleCtaBrochureImageChange,
    handleSaveMaintenance: () => {}, handleUploadToStorage, showToast, triggerRevalidation,
  };
}
