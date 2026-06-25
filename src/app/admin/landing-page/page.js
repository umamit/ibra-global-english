"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { DEFAULT_PROGRAMS, DEFAULT_BENEFITS, DEFAULT_FAQS, DEFAULT_VIDEOS } from "@/utils/fallbackData";

export default function LandingPageCMS() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState("hero");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Maintenance mode
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [savingMaintenance, setSavingMaintenance] = useState(false);

  // Copy protection setting
  const [allowPublicCopy, setAllowPublicCopy] = useState(false);
  const [savingCopySetting, setSavingCopySetting] = useState(false);

  // Visitor counter offset
  const [visitorOffset, setVisitorOffset] = useState("0");
  const [savingVisitorOffset, setSavingVisitorOffset] = useState(false);

  // ----------------------------------------------------
  // FORM STATES: HERO & CONTACT PROFILE
  // ----------------------------------------------------
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroDesc, setHeroDesc] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // Payment configuration states
  const [paymentBankName, setPaymentBankName] = useState("");
  const [paymentAccountNumber, setPaymentAccountNumber] = useState("");
  const [paymentAccountName, setPaymentAccountName] = useState("");
  const [paymentAccountSub, setPaymentAccountSub] = useState("");
  const [paymentSppAmount, setPaymentSppAmount] = useState("");
  const [paymentSppKids, setPaymentSppKids] = useState("");
  const [paymentSppTeens, setPaymentSppTeens] = useState("");
  const [paymentSppCalistung, setPaymentSppCalistung] = useState("");
  const [marqueeText1, setMarqueeText1] = useState("");
  const [marqueeText2, setMarqueeText2] = useState("");
  const [marqueeText3, setMarqueeText3] = useState("");
  const [ctaTag, setCtaTag] = useState("");
  const [ctaTitle, setCtaTitle] = useState("");
  const [ctaDesc, setCtaDesc] = useState("");
  const [ctaBrochureImage, setCtaBrochureImage] = useState("");
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingCtaBrochure, setUploadingCtaBrochure] = useState(false);
  const heroFileRef = useRef(null);
  const ctaBrochureFileRef = useRef(null);


  // ----------------------------------------------------
  // LISTS & FORMS STATES: GALLERY
  // ----------------------------------------------------
  const [galleryList, setGalleryItems] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryDesc, setGalleryDesc] = useState("");
  const [galleryCaption, setGalleryCaption] = useState("");
  const [galleryFile, setGalleryFile] = useState(null);
  const [galleryPreview, setGalleryPreview] = useState("");
  const [addingGallery, setAddingGallery] = useState(false);
  const galleryFileRef = useRef(null);

  // ----------------------------------------------------
  // LISTS & FORMS STATES: TESTIMONIALS
  // ----------------------------------------------------
  const [testimonialsList, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState(null);
  const [author, setAuthor] = useState("");
  const [role, setRole] = useState("");
  const [rating, setRating] = useState(5);
  const [testimonialText, setTestimonialText] = useState("");
  const [savingTestimonial, setSavingTestimonial] = useState(false);

  // Programs, Benefits, FAQ, Videos list states
  const [programsList, setProgramsList] = useState([]);
  const [benefitsList, setBenefitsList] = useState([]);
  const [faqsList, setFaqsList] = useState([]);
  const [videosList, setVideosList] = useState([]);
  const [savingVideos, setSavingVideos] = useState(false);

  // ----------------------------------------------------
  // UTILITIES & NOTIFICATIONS
  // ----------------------------------------------------
  const showToast = (message, type = "success") => {
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
        const settings = {};
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

    // Fetch maintenance mode status dari API route (pakai service role, bypass RLS)
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

  const handleSaveVideos = async (updatedList) => {
    setSavingVideos(true);
    try {
      const { error } = await supabase
        .from("landing_settings")
        .upsert({ key: "landing_videos", value: JSON.stringify(updatedList) });
      
      if (error) throw error;
      setVideosList(updatedList);
      showToast("Galeri video berhasil disimpan!");
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
    } catch (err) {
      showToast("Gagal mengubah pengaturan: " + err.message, "error");
    } finally {
      setSavingCopySetting(false);
    }
  };

  const handleSaveVisitorOffset = async (e) => {
    e.preventDefault();
    setSavingVisitorOffset(true);
    try {
      const { error } = await supabase
        .from("landing_settings")
        .upsert({ key: "visitor_offset", value: visitorOffset.trim() });
      if (error) throw error;
      showToast("Angka awal pengunjung berhasil disimpan!");
    } catch (err) {
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
      setGalleryItems(data || []);
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
      setTestimonials(data || []);
    } catch (err) {
      console.error("Gagal mengambil testimoni:", err);
    } finally {
      setTestimonialsLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroSettings();
    fetchGallery();
    fetchTestimonials();
  }, []);

  const handleSavePrograms = async (newPrograms) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("landing_settings")
        .upsert({ key: "landing_programs", value: JSON.stringify(newPrograms) });
      if (error) throw error;
      setProgramsList(newPrograms);
      showToast("Daftar Program Kursus berhasil disimpan!", "success");
    } catch (err) {
      console.error(err);
      showToast("Gagal menyimpan program kursus.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBenefits = async (newBenefits) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("landing_settings")
        .upsert({ key: "landing_benefits", value: JSON.stringify(newBenefits) });
      if (error) throw error;
      setBenefitsList(newBenefits);
      showToast("Daftar Keunggulan berhasil disimpan!", "success");
    } catch (err) {
      console.error(err);
      showToast("Gagal menyimpan keunggulan.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFaqs = async (newFaqs) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("landing_settings")
        .upsert({ key: "landing_faq", value: JSON.stringify(newFaqs) });
      if (error) throw error;
      setFaqsList(newFaqs);
      showToast("Daftar FAQ berhasil disimpan!", "success");
    } catch (err) {
      console.error(err);
      showToast("Gagal menyimpan FAQ.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getCanvaEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("<iframe")) {
      const match = url.match(/src="([^"]+)"/);
      if (match && match[1]) return match[1];
    }
    if (url.includes("canva.com/design/")) {
      let cleanUrl = url.split("?")[0];
      if (cleanUrl.endsWith("/view") || cleanUrl.endsWith("/watch")) {
        return `${cleanUrl}?embed`;
      }
      return `${cleanUrl}/view?embed`;
    }
    return null;
  };

  // ----------------------------------------------------
  // UPLOAD HELPER FUNCTION
  // ----------------------------------------------------
  const handleUploadToStorage = async (file) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery-uploads")
        .upload(filePath, file);

      if (uploadError) {
        // Jika bucket tidak ditemukan, coba membuat bucket secara otomatis
        if (uploadError.message.includes("bucket not found") || uploadError.message.includes("does not exist")) {
          const { error: bucketError } = await supabase.storage.createBucket("gallery-uploads", {
            public: true,
            fileSizeLimit: 5242880, // 5MB
          });
          if (bucketError) throw bucketError;

          // Coba unggah kembali setelah bucket dibuat
          const { error: retryError } = await supabase.storage
            .from("gallery-uploads")
            .upload(filePath, file);
          if (retryError) throw retryError;
        } else {
          throw uploadError;
        }
      }

      const { data } = supabase.storage
        .from("gallery-uploads")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error("Kesalahan unggah:", err);
      throw new Error(
        `Detail: ${err.message || err}. Pastikan Anda login sebagai Admin, bucket 'gallery-uploads' sudah dibuat di Supabase, dan kebijakan RLS (Row Level Security) mengizinkan upload.`
      );
    }
  };

  // ----------------------------------------------------
  // HERO & PROFILE ACTIONS
  // ----------------------------------------------------
  const handleHeroImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    try {
      const publicUrl = await handleUploadToStorage(file);
      setHeroImage(publicUrl);
      showToast("Foto hero utama berhasil diunggah ke storage!");
    } catch (err) {
      showToast("Gagal mengunggah foto hero. " + err.message, "error");
    } finally {
      setUploadingHero(false);
    }
  };

  const handleCtaBrochureImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCtaBrochure(true);
    try {
      const publicUrl = await handleUploadToStorage(file);
      setCtaBrochureImage(publicUrl);
      showToast("Berkas brosur promosi berhasil diunggah ke storage!");
    } catch (err) {
      showToast("Gagal mengunggah brosur promosi. " + err.message, "error");
    } finally {
      setUploadingCtaBrochure(false);
    }
  };

  const handleSaveHeroSettings = async (e) => {
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
  const handleGalleryFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGalleryFile(file);
    setGalleryPreview(URL.createObjectURL(file));
  };

  const handleAddGalleryItem = async (e) => {
    e.preventDefault();
    if (!galleryTitle.trim() || !galleryFile) {
      showToast("Judul kegiatan dan berkas foto wajib diisi.", "error");
      return;
    }

    setAddingGallery(true);
    try {
      const uploadedUrl = await handleUploadToStorage(galleryFile);

      const { error } = await supabase.from("gallery").insert([
        {
          title: galleryTitle.trim(),
          description: galleryDesc.trim() || null,
          caption: galleryCaption.trim() || null,
          image_url: uploadedUrl,
        },
      ]);

      if (error) throw error;

      showToast("Foto kegiatan baru berhasil ditambahkan ke galeri publik!");
      setGalleryTitle("");
      setGalleryDesc("");
      setGalleryCaption("");
      setGalleryFile(null);
      setGalleryPreview("");
      if (galleryFileRef.current) galleryFileRef.current.value = "";
      fetchGallery();
    } catch (err) {
      console.error("Kesalahan tambah galeri:", err);
      showToast(err.message || "Gagal menyimpan foto kegiatan galeri.", "error");
    } finally {
      setAddingGallery(false);
    }
  };

  const handleDeleteGalleryItem = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus foto kegiatan ini dari galeri publik?")) return;

    try {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;
      showToast("Foto kegiatan berhasil dihapus dari galeri publik.");
      fetchGallery();
    } catch (err) {
      console.error("Kesalahan hapus galeri:", err);
      showToast("Gagal menghapus item galeri.", "error");
    }
  };

  // ----------------------------------------------------
  // TESTIMONIAL ACTIONS
  // ----------------------------------------------------
  const handleSaveTestimonial = async (e) => {
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
            rating: parseInt(rating),
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
            rating: parseInt(rating),
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
    } catch (err) {
      console.error("Kesalahan simpan testimoni:", err);
      showToast("Gagal menyimpan data ulasan testimoni.", "error");
    } finally {
      setSavingTestimonial(false);
    }
  };

  const handleEditTestimonialClick = (t) => {
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

  const handleDeleteTestimonial = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus ulasan testimoni ini dari halaman utama?")) return;

    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
      showToast("Ulasan testimoni berhasil dihapus.");
      fetchTestimonials();
    } catch (err) {
      console.error("Kesalahan hapus testimoni:", err);
      showToast("Gagal menghapus testimoni.", "error");
    }
  };

  return (
    <div style={{ padding: "1.5rem 1rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Toast Alert */}
      {toast.show && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 1000,
            padding: "1rem 1.5rem",
            borderRadius: "8px",
            backgroundColor: toast.type === "success" ? "#10b981" : "#ef4444",
            color: "white",
            fontWeight: "600",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            animation: "slideIn 0.3s ease",
          }}
        >
          {toast.type === "success" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header Section */}
      <div className="dashboard-topbar" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.25rem", borderBottom: "1px solid var(--color-gray-200)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>Kelola Landing Page</h1>
        <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
          Sesuaikan seluruh isi tulisan, gambar pahlawan (hero), galeri kelas, dan review wali murid di landing page utama secara real-time.
        </p>
      </div>

      {/* Tab Navigations */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
        <button
          onClick={() => setActiveTab("hero")}
          className={`btn-portal-outline ${activeTab === "hero" ? "active" : ""}`}
          style={{ padding: "0.6rem 1.2rem", fontWeight: "600", whiteSpace: "nowrap" }}
        >
          Profil & Hero Utama
        </button>
        <button
          onClick={() => setActiveTab("gallery")}
          className={`btn-portal-outline ${activeTab === "gallery" ? "active" : ""}`}
          style={{ padding: "0.6rem 1.2rem", fontWeight: "600", whiteSpace: "nowrap" }}
        >
          Galeri Kegiatan
        </button>
        <button
          onClick={() => setActiveTab("videos")}
          className={`btn-portal-outline ${activeTab === "videos" ? "active" : ""}`}
          style={{ padding: "0.6rem 1.2rem", fontWeight: "600", whiteSpace: "nowrap" }}
        >
          Galeri Video
        </button>
        <button
          onClick={() => setActiveTab("testimonials")}
          className={`btn-portal-outline ${activeTab === "testimonials" ? "active" : ""}`}
          style={{ padding: "0.6rem 1.2rem", fontWeight: "600", whiteSpace: "nowrap" }}
        >
          Ulasan & Testimoni
        </button>
        <button
          onClick={() => setActiveTab("programs")}
          className={`btn-portal-outline ${activeTab === "programs" ? "active" : ""}`}
          style={{ padding: "0.6rem 1.2rem", fontWeight: "600", whiteSpace: "nowrap" }}
        >
          Program Kursus
        </button>
        <button
          onClick={() => setActiveTab("benefits")}
          className={`btn-portal-outline ${activeTab === "benefits" ? "active" : ""}`}
          style={{ padding: "0.6rem 1.2rem", fontWeight: "600", whiteSpace: "nowrap" }}
        >
          Keunggulan
        </button>
        <button
          onClick={() => setActiveTab("faq")}
          className={`btn-portal-outline ${activeTab === "faq" ? "active" : ""}`}
          style={{ padding: "0.6rem 1.2rem", fontWeight: "600", whiteSpace: "nowrap" }}
        >
          Tanya Jawab (FAQ)
        </button>
        <button
          onClick={() => setActiveTab("maintenance")}
          className={`btn-portal-outline ${activeTab === "maintenance" ? "active" : ""}`}
          style={{ padding: "0.6rem 1.2rem", fontWeight: "600", whiteSpace: "nowrap", borderColor: maintenanceMode ? "#ef4444" : undefined, color: maintenanceMode ? "#ef4444" : undefined }}
        >
          {maintenanceMode ? "🔴" : "⚙️"} Sistem & Keamanan
        </button>
      </div>

      {/* =====================================================================
          TAB 1: PROFIL & HERO UTAMA
          ===================================================================== */}
      {activeTab === "hero" && (
        <div className="portal-card" style={{ padding: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>Profil & Hero Utama</h2>
          
          <form onSubmit={handleSaveHeroSettings} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>
              
              {/* Judul Hero */}
              <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Nama Lembaga (Judul Hero)</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                  placeholder="Contoh: Ibra Global English Bobong"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  required
                />
              </div>

              {/* Subjudul Hero */}
              <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Tagline Subjudul Hero</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                  placeholder="Gunakan tanda pipe '|' untuk bagian warna ungu. Contoh: Belajar Seru | Lancar Bicara"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  required
                />
                <span style={{ fontSize: "0.8rem", color: "var(--color-gray-400)" }}>
                  Kata-kata setelah tanda pipe ( | ) otomatis memiliki warna gradasi ungu neon yang mewah di halaman publik.
                </span>
              </div>

              {/* Deskripsi Hero */}
              <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Deskripsi Singkat Hero</label>
                <textarea
                  className="form-input"
                  style={{ width: "100%", height: "100px", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)", resize: "vertical" }}
                  placeholder="Ketik deskripsi singkat kursus bimbingan belajar Anda..."
                  value={heroDesc}
                  onChange={(e) => setHeroDesc(e.target.value)}
                  required
                />
              </div>

              {/* Upload Gambar Hero */}
              <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Foto Hero Utama</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center" }}>
                  {heroImage && (
                    <div style={{ width: "120px", height: "80px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--color-gray-300)" }}>
                      <img src={heroImage} alt="Hero Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <input
                      type="file"
                      ref={heroFileRef}
                      accept="image/*"
                      onChange={handleHeroImageChange}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => heroFileRef.current?.click()}
                      className="btn-portal-outline"
                      style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", marginBottom: "0.5rem" }}
                      disabled={uploadingHero}
                    >
                      {uploadingHero ? "Mengunggah..." : "Pilih Berkas Foto Baru"}
                    </button>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: "100%", padding: "0.5rem", fontSize: "0.85rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)", opacity: 0.8 }}
                      placeholder="Atau masukkan tautan URL gambar eksternal di sini..."
                      value={heroImage}
                      onChange={(e) => setHeroImage(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid var(--color-gray-200)", margin: "1rem 0" }} />

              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-gray-800)" }}>Kontak & Lokasi Hubungi Kami</h3>

              <div className="three-column-grid" style={{ gap: "1rem" }}>
                {/* Alamat Google Map */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Alamat Lengkap Lembaga</label>
                  <textarea
                    className="form-input"
                    style={{ width: "100%", height: "80px", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    placeholder="Contoh: Jl. TPU Bobong Komp. Fangahu, Lantai 1 Kost Fitrah"
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    required
                  />
                </div>

                {/* No Telepon */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Nomor WA / Telepon</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    placeholder="Contoh: +62 813-5700-1357"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                  />
                </div>

                {/* Email */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Alamat Email</label>
                  <input
                    type="email"
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    placeholder="Contoh: admin@ibraglobalenglish.uk"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid var(--color-gray-200)", margin: "2rem 0 1rem" }} />

              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1rem" }}>Konfigurasi Rekening & Nominal SPP</h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                {/* Nama Bank */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Nama Bank</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    placeholder="Contoh: Bank Mandiri"
                    value={paymentBankName}
                    onChange={(e) => setPaymentBankName(e.target.value)}
                    required
                  />
                </div>

                {/* Nomor Rekening */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Nomor Rekening</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    placeholder="Contoh: 137-00-1234567-8"
                    value={paymentAccountNumber}
                    onChange={(e) => setPaymentAccountNumber(e.target.value)}
                    required
                  />
                </div>

                {/* Atas Nama Rekening */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Atas Nama Rekening</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    placeholder="Contoh: Ibra Global English"
                    value={paymentAccountName}
                    onChange={(e) => setPaymentAccountName(e.target.value)}
                    required
                  />
                </div>

                {/* Sub-text Rekening */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Sub-keterangan Atas Nama</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    placeholder="Contoh: Bobong Learning Centre"
                    value={paymentAccountSub}
                    onChange={(e) => setPaymentAccountSub(e.target.value)}
                  />
                </div>

                {/* Nominal SPP Per Program */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Nominal SPP Kids Program (Rupiah)</label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    placeholder="Contoh: 300000"
                    value={paymentSppKids}
                    onChange={(e) => setPaymentSppKids(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Nominal SPP Teens Program (Rupiah)</label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    placeholder="Contoh: 300000"
                    value={paymentSppTeens}
                    onChange={(e) => setPaymentSppTeens(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Nominal SPP Fun Calistung (Rupiah)</label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    placeholder="Contoh: 350000"
                    value={paymentSppCalistung}
                    onChange={(e) => setPaymentSppCalistung(e.target.value)}
                    required
                  />
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid var(--color-gray-200)", margin: "2rem 0 1rem" }} />

              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1rem" }}>Konfigurasi Teks Pengumuman Berjalan (Marquee)</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", marginBottom: "1.5rem" }}>
                Atur 3 kalimat pengumuman yang akan ditampilkan berjalan di bagian atas halaman Landing Page.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Teks Pengumuman Box 1</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    placeholder="Kalimat pengumuman pertama..."
                    value={marqueeText1}
                    onChange={(e) => setMarqueeText1(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Teks Pengumuman Box 2</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    placeholder="Kalimat pengumuman kedua..."
                    value={marqueeText2}
                    onChange={(e) => setMarqueeText2(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Teks Pengumuman Box 3</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    placeholder="Kalimat pengumuman ketiga..."
                    value={marqueeText3}
                    onChange={(e) => setMarqueeText3(e.target.value)}
                    required
                  />
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid var(--color-gray-200)", margin: "2rem 0 1rem" }} />

              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1rem" }}>Konfigurasi Banner Promosi & Brosur (CTA)</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", marginBottom: "1.5rem" }}>
                Atur judul, deskripsi tag, dan unggah berkas brosur promosi untuk bagian Call to Action (CTA) di landing page.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Tag Promosi CTA (Kecil di Atas)</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    placeholder="Contoh: Promo Terbatas!"
                    value={ctaTag}
                    onChange={(e) => setCtaTag(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Judul Banner CTA (Gunakan '&' untuk teks highlight kuning)</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    placeholder="Contoh: Belajar Cepat & Jadi Percaya Diri!"
                    value={ctaTitle}
                    onChange={(e) => setCtaTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Deskripsi Banner CTA</label>
                  <textarea
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)", minHeight: "100px", resize: "vertical" }}
                    placeholder="Masukkan teks deskripsi promosi..."
                    value={ctaDesc}
                    onChange={(e) => setCtaDesc(e.target.value)}
                    required
                  />
                </div>

                {/* Upload Gambar Brosur Promosi */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Brosur Promosi (Tampilan di Bawah CTA Banner)</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center" }}>
                    {ctaBrochureImage && (
                      <div style={{ width: "160px", height: "90px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--color-gray-300)", position: "relative" }}>
                        {getCanvaEmbedUrl(ctaBrochureImage) ? (
                          <iframe
                            src={getCanvaEmbedUrl(ctaBrochureImage)}
                            style={{ width: "100%", height: "100%", border: "none" }}
                            loading="lazy"
                          />
                        ) : (
                          <img src={ctaBrochureImage} alt="Brochure Preview" style={{ width: "100%", height: "100%", objectFit: "contain", backgroundColor: "var(--color-gray-50)" }} />
                        )}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <input
                        type="file"
                        ref={ctaBrochureFileRef}
                        accept="image/*"
                        onChange={handleCtaBrochureImageChange}
                        style={{ display: "none" }}
                      />
                      <button
                        type="button"
                        onClick={() => ctaBrochureFileRef.current?.click()}
                        className="btn-portal-outline"
                        style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", marginBottom: "0.5rem" }}
                        disabled={uploadingCtaBrochure}
                      >
                        {uploadingCtaBrochure ? "Mengunggah..." : "Pilih Berkas Brosur Baru"}
                      </button>
                      <input
                        type="text"
                        className="form-input"
                        style={{ width: "100%", padding: "0.5rem", fontSize: "0.85rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)", opacity: 0.8 }}
                        placeholder="Atau masukkan tautan URL gambar eksternal di sini..."
                        value={ctaBrochureImage}
                        onChange={(e) => setCtaBrochureImage(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <button
                type="submit"
                className="btn-portal-primary"
                style={{ padding: "0.75rem 1.5rem", fontWeight: "700" }}
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan Landing Page"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          TAB 2: KELOLA GALERI KEGIATAN
          ===================================================================== */}
      {activeTab === "gallery" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Form Tambah Item */}
          <div className="portal-card" style={{ padding: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>Unggah Foto Kegiatan Baru</h2>
            
            <form onSubmit={handleAddGalleryItem} style={{ display: "flex", flexFlow: "column", gap: "1.25rem" }}>
              <div className="form-grid" style={{ gap: "1rem" }}>
                
                {/* Judul Kegiatan */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Judul Kegiatan</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    placeholder="Contoh: Speaking Practice Session"
                    value={galleryTitle}
                    onChange={(e) => setGalleryTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Keterangan */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Deskripsi Singkat (Kecil)</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    placeholder="Contoh: Belajar seru melalui aktivitas kuis interaktif"
                    value={galleryDesc}
                    onChange={(e) => setGalleryDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid" style={{ gap: "1rem" }}>
                {/* Caption / Keterangan Lightbox */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Keterangan Lengkap (Caption Foto)</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    placeholder="Contoh: Suasana Latihan Percakapan Speaking Practice Kelas Dewasa"
                    value={galleryCaption}
                    onChange={(e) => setGalleryCaption(e.target.value)}
                  />
                </div>

                {/* Pilih Berkas */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Berkas Gambar (Foto)</label>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    {galleryPreview && (
                      <div style={{ width: "70px", height: "50px", borderRadius: "4px", overflow: "hidden", border: "1px solid var(--color-gray-300)", flexShrink: 0 }}>
                        <img src={galleryPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                    <input
                      type="file"
                      ref={galleryFileRef}
                      accept="image/*"
                      onChange={handleGalleryFileChange}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => galleryFileRef.current?.click()}
                      className="btn-portal-outline"
                      style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", width: "100%" }}
                    >
                      {galleryFile ? galleryFile.name : "Pilih Berkas Foto..."}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="btn-portal-primary"
                  style={{ padding: "0.6rem 1.2rem", fontWeight: "700" }}
                  disabled={addingGallery}
                >
                  {addingGallery ? "Mengunggah & Menyimpan..." : "Tambah Foto Kegiatan"}
                </button>
              </div>
            </form>
          </div>

          {/* List Item Galeri */}
          <div className="portal-card" style={{ padding: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>Daftar Foto Galeri Aktif</h2>
            
            {galleryLoading ? (
              <p style={{ color: "var(--color-gray-400)" }}>Memuat foto galeri...</p>
            ) : galleryList.length === 0 ? (
              <p style={{ color: "var(--color-gray-400)" }}>Tidak ada foto kegiatan tambahan di database. Landing page akan menggunakan foto default aslinya (statis).</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="portal-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "10px" }}>Foto</th>
                      <th style={{ textAlign: "left", padding: "10px" }}>Judul & Subjudul</th>
                      <th style={{ textAlign: "left", padding: "10px" }}>Caption Lightbox</th>
                      <th style={{ textAlign: "right", padding: "10px" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {galleryList.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid var(--color-gray-100)" }}>
                        <td style={{ padding: "10px" }}>
                          <img
                            src={item.image_url}
                            alt={item.title}
                            loading="lazy"
                            style={{ width: "80px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                          />
                        </td>
                        <td style={{ padding: "10px" }}>
                          <div style={{ fontWeight: "700", color: "var(--color-gray-800)" }}>{item.title}</div>
                          <div style={{ fontSize: "0.85rem", color: "var(--color-gray-500)" }}>{item.description}</div>
                        </td>
                        <td style={{ padding: "10px", fontSize: "0.9rem", color: "var(--color-gray-600)" }}>
                          {item.caption || "-"}
                        </td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          <button
                            onClick={() => handleDeleteGalleryItem(item.id)}
                            className="btn-portal-danger"
                            style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* =====================================================================
          TAB EXTRA: KELOLA GALERI VIDEO
          ===================================================================== */}
      {activeTab === "videos" && (
        <div className="portal-card" style={{ padding: "2rem" }}>
          <div style={{ borderBottom: "1px solid var(--color-gray-250)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-primary-dark)" }}>Kelola Galeri Video Kegiatan</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", marginTop: "0.25rem" }}>
              Tambahkan tautan video dokumentasi kegiatan Ibra Global English. Tautan YouTube biasa atau YouTube Shorts otomatis dikonversi ke format embed yang bisa diputar di web.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {videosList.map((vid, idx) => (
              <div 
                key={idx} 
                style={{ 
                  padding: "1.5rem", 
                  backgroundColor: "var(--color-gray-50)", 
                  borderRadius: "var(--radius-xl)", 
                  border: "1px solid var(--color-gray-200)",
                  position: "relative"
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    const updated = videosList.filter((_, i) => i !== idx);
                    setVideosList(updated);
                  }}
                  className="btn-portal-danger"
                  style={{ position: "absolute", top: "1.5rem", right: "1.5rem", padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}
                >
                  Hapus Video
                </button>

                <h4 style={{ fontWeight: "700", color: "var(--color-gray-700)", marginBottom: "1rem" }}>Video #{idx + 1}</h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>Judul Video</label>
                    <input
                      type="text"
                      value={vid.title}
                      onChange={(e) => {
                        const updated = [...videosList];
                        updated[idx].title = e.target.value;
                        setVideosList(updated);
                      }}
                      className="portal-input"
                      placeholder="Contoh: Belajar Ceria Bersama Siswa Kids Program"
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>Deskripsi Singkat</label>
                    <textarea
                      value={vid.desc}
                      onChange={(e) => {
                        const updated = [...videosList];
                        updated[idx].desc = e.target.value;
                        setVideosList(updated);
                      }}
                      className="portal-input"
                      rows="2"
                      placeholder="Keterangan singkat tentang apa yang dilakukan siswa di video ini"
                      style={{ resize: "vertical" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>URL Tautan Video (YouTube/CapCut)</label>
                    <input
                      type="text"
                      value={vid.url}
                      onChange={(e) => {
                        const updated = [...videosList];
                        updated[idx].url = e.target.value;
                        setVideosList(updated);
                      }}
                      className="portal-input"
                      placeholder="Contoh: https://www.youtube.com/watch?v=XXXX atau https://youtu.be/XXXX"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button
                type="button"
                onClick={() => setVideosList([...videosList, { title: "", desc: "", url: "" }])}
                className="btn-portal-outline"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                + Tambah Video Baru
              </button>
              <button
                type="button"
                onClick={() => handleSaveVideos(videosList)}
                disabled={savingVideos}
                className="btn-portal-primary"
              >
                {savingVideos ? "Menyimpan..." : "Simpan Semua Video"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: KELOLA ULASAN & TESTIMONI
          ===================================================================== */}
      {activeTab === "testimonials" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Form Testimoni */}
          <div className="portal-card" style={{ padding: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>
              {editingTestimonialId ? "Sunting Ulasan Testimoni" : "Tambah Ulasan Testimoni Baru"}
            </h2>
            
            <form onSubmit={handleSaveTestimonial} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="three-column-grid" style={{ gap: "1rem" }}>
                
                {/* Nama Penulis */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Nama Penulis</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    placeholder="Contoh: Bapak Andi / Rania"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                  />
                </div>

                {/* Peran / Identitas */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Peran / Identitas</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    placeholder="Contoh: Orang Tua Siswa / Siswa SMP"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  />
                </div>

                {/* Rating Bintang */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Rating Bintang</label>
                  <select
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                  >
                    <option value={5}>5 Bintang (Sangat Puas)</option>
                    <option value={4}>4 Bintang (Puas)</option>
                    <option value={3}>3 Bintang (Cukup)</option>
                    <option value={2}>2 Bintang (Kurang)</option>
                    <option value={1}>1 Bintang (Buruk)</option>
                  </select>
                </div>
              </div>

              {/* Teks Ulasan */}
              <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Teks Isi Ulasan</label>
                <textarea
                  className="form-input"
                  style={{ width: "100%", height: "100px", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                  placeholder="Ketik komentar, ulasan positif, atau saran wali murid di sini..."
                  value={testimonialText}
                  onChange={(e) => setTestimonialText(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="submit"
                  className="btn-portal-primary"
                  style={{ padding: "0.6rem 1.2rem", fontWeight: "700" }}
                  disabled={savingTestimonial}
                >
                  {savingTestimonial ? "Menyimpan..." : editingTestimonialId ? "Simpan Perubahan" : "Tambah Testimoni"}
                </button>
                {editingTestimonialId && (
                  <button
                    type="button"
                    onClick={handleCancelEditTestimonial}
                    className="btn-portal-outline"
                    style={{ padding: "0.6rem 1.2rem", fontWeight: "600" }}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List Testimoni */}
          <div className="portal-card" style={{ padding: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>Daftar Testimoni Aktif</h2>
            
            {testimonialsLoading ? (
              <p style={{ color: "var(--color-gray-400)" }}>Memuat ulasan testimoni...</p>
            ) : testimonialsList.length === 0 ? (
              <p style={{ color: "var(--color-gray-400)" }}>Tidak ada testimoni tambahan di database. Landing page akan menggunakan testimoni default aslinya (statis).</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="portal-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "10px", width: "100px" }}>Bintang</th>
                      <th style={{ textAlign: "left", padding: "10px", width: "180px" }}>Penulis</th>
                      <th style={{ textAlign: "left", padding: "10px" }}>Teks Isi Ulasan</th>
                      <th style={{ textAlign: "right", padding: "10px", width: "150px" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testimonialsList.map((t) => (
                      <tr key={t.id} style={{ borderBottom: "1px solid var(--color-gray-100)" }}>
                        <td style={{ padding: "10px" }}>
                          <span style={{ color: "#fbbf24", fontWeight: "bold" }}>{"★".repeat(t.rating)}</span>
                        </td>
                        <td style={{ padding: "10px" }}>
                          <div style={{ fontWeight: "700", color: "var(--color-gray-800)" }}>{t.author}</div>
                          <div style={{ fontSize: "0.85rem", color: "var(--color-gray-500)" }}>{t.role}</div>
                        </td>
                        <td style={{ padding: "10px", fontSize: "0.9rem", color: "var(--color-gray-600)" }}>
                          "{t.text}"
                        </td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                            <button
                              onClick={() => handleEditTestimonialClick(t)}
                              className="btn-portal-outline"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTestimonial(t.id)}
                              className="btn-portal-danger"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* =====================================================================
          TAB: PROGRAMS
          ===================================================================== */}
      {activeTab === "programs" && (
        <div className="portal-card" style={{ padding: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>Kelola Program Kursus</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {programsList.map((prog, idx) => (
              <div key={idx} style={{ padding: "1.5rem", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-lg)", position: "relative" }}>
                <button 
                  onClick={() => {
                    const next = [...programsList];
                    next.splice(idx, 1);
                    handleSavePrograms(next);
                  }}
                  className="btn-portal-danger" 
                  style={{ position: "absolute", top: "1rem", right: "1rem", padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                >
                  Hapus
                </button>
                
                <div className="form-grid" style={{ gap: "1rem", marginBottom: "1rem" }}>
                  <div className="form-group">
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Nama Program</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={prog.title} 
                      onChange={(e) => {
                        const next = [...programsList];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setProgramsList(next);
                      }} 
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Kategori Umur / Keterangan</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={prog.age} 
                      onChange={(e) => {
                        const next = [...programsList];
                        next[idx] = { ...next[idx], age: e.target.value };
                        setProgramsList(next);
                      }} 
                    />
                  </div>
                </div>

                <div className="form-grid" style={{ gap: "1rem", marginBottom: "1rem" }}>
                  <div className="form-group">
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Deskripsi Singkat</label>
                    <textarea 
                      className="form-input" 
                      value={prog.desc} 
                      style={{ height: "80px", resize: "none" }}
                      onChange={(e) => {
                        const next = [...programsList];
                        next[idx] = { ...next[idx], desc: e.target.value };
                        setProgramsList(next);
                      }} 
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Pilihan Ikon</label>
                    <select
                      className="form-input"
                      value={prog.iconKey || "book"}
                      onChange={(e) => {
                        const next = [...programsList];
                        next[idx] = { ...next[idx], iconKey: e.target.value };
                        setProgramsList(next);
                      }}
                    >
                      <option value="book">Book (Buku)</option>
                      <option value="graduation">Graduation (Topi Toga)</option>
                      <option value="users">Users (Kelompok/Orang)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Fitur / Materi Unggulan (Pisahkan dengan koma)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={(prog.features || []).join(", ")} 
                    onChange={(e) => {
                      const next = [...programsList];
                      next[idx] = { ...next[idx], features: e.target.value.split(",").map(f => f.trim()) };
                      setProgramsList(next);
                    }} 
                  />
                </div>
              </div>
            ))}
            
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button 
                onClick={() => {
                  const next = [...programsList, { title: "Program Baru", age: "5-10 tahun", desc: "Deskripsi program baru", iconKey: "book", features: ["Fitur 1"] }];
                  setProgramsList(next);
                }} 
                className="btn-portal-outline"
              >
                + Tambah Program Baru
              </button>
              <button 
                onClick={() => handleSavePrograms(programsList)}
                className="btn-portal-primary"
              >
                Simpan Semua Program
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB: BENEFITS
          ===================================================================== */}
      {activeTab === "benefits" && (
        <div className="portal-card" style={{ padding: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>Kelola Keunggulan</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {benefitsList.map((b, idx) => (
              <div key={idx} style={{ padding: "1.5rem", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-lg)", position: "relative" }}>
                <button 
                  onClick={() => {
                    const next = [...benefitsList];
                    next.splice(idx, 1);
                    handleSaveBenefits(next);
                  }}
                  className="btn-portal-danger" 
                  style={{ position: "absolute", top: "1rem", right: "1rem", padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                >
                  Hapus
                </button>
                
                <div className="form-grid" style={{ gap: "1rem" }}>
                  <div className="form-group">
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Judul Keunggulan</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={b.title} 
                      onChange={(e) => {
                        const next = [...benefitsList];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setBenefitsList(next);
                      }} 
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Pilihan Ikon</label>
                    <select
                      className="form-input"
                      value={b.iconKey || "check"}
                      onChange={(e) => {
                        const next = [...benefitsList];
                        next[idx] = { ...next[idx], iconKey: e.target.value };
                        setBenefitsList(next);
                      }}
                    >
                      <option value="users">Users (Kelompok)</option>
                      <option value="award">Award (Penghargaan)</option>
                      <option value="clock">Clock (Jam/Waktu)</option>
                      <option value="trophy">Trophy (Piala)</option>
                      <option value="message">Message (Pesan)</option>
                      <option value="check">Checkmark (Centang)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Deskripsi Keunggulan</label>
                  <textarea 
                    className="form-input" 
                    value={b.desc} 
                    style={{ height: "60px", resize: "none" }}
                    onChange={(e) => {
                      const next = [...benefitsList];
                      next[idx] = { ...next[idx], desc: e.target.value };
                      setBenefitsList(next);
                    }} 
                  />
                </div>
              </div>
            ))}
            
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button 
                onClick={() => {
                  const next = [...benefitsList, { title: "Keunggulan Baru", desc: "Deskripsi keunggulan baru", iconKey: "check" }];
                  setBenefitsList(next);
                }} 
                className="btn-portal-outline"
              >
                + Tambah Keunggulan Baru
              </button>
              <button 
                onClick={() => handleSaveBenefits(benefitsList)}
                className="btn-portal-primary"
              >
                Simpan Semua Keunggulan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB: FAQ
          ===================================================================== */}
      {activeTab === "faq" && (
        <div className="portal-card" style={{ padding: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>Kelola Tanya Jawab (FAQ)</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {faqsList.map((faq, idx) => (
              <div key={idx} style={{ padding: "1.5rem", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-lg)", position: "relative" }}>
                <button 
                  onClick={() => {
                    const next = [...faqsList];
                    next.splice(idx, 1);
                    handleSaveFaqs(next);
                  }}
                  className="btn-portal-danger" 
                  style={{ position: "absolute", top: "1rem", right: "1rem", padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                >
                  Hapus
                </button>
                
                <div className="form-group">
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Pertanyaan</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={faq.question} 
                    onChange={(e) => {
                      const next = [...faqsList];
                      next[idx] = { ...next[idx], question: e.target.value };
                      setFaqsList(next);
                    }} 
                  />
                </div>

                <div className="form-group" style={{ marginTop: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Jawaban</label>
                  <textarea 
                    className="form-input" 
                    value={faq.answer} 
                    style={{ height: "100px", resize: "none" }}
                    onChange={(e) => {
                      const next = [...faqsList];
                      next[idx] = { ...next[idx], answer: e.target.value };
                      setFaqsList(next);
                    }} 
                  />
                </div>
              </div>
            ))}
            
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button 
                onClick={() => {
                  const next = [...faqsList, { question: "Pertanyaan Baru?", answer: "Jawaban baru." }];
                  setFaqsList(next);
                }} 
                className="btn-portal-outline"
              >
                + Tambah FAQ Baru
              </button>
              <button 
                onClick={() => handleSaveFaqs(faqsList)}
                className="btn-portal-primary"
              >
                Simpan Semua FAQ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: MODE MAINTENANCE
          ===================================================================== */}
      {activeTab === "maintenance" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Status card */}
          <div className="portal-card" style={{
            padding: "2rem",
            borderLeft: `5px solid ${maintenanceMode ? "#ef4444" : "#22c55e"}`,
            background: maintenanceMode
              ? "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(255,255,255,0) 100%)"
              : "linear-gradient(135deg, rgba(34,197,94,0.06) 0%, rgba(255,255,255,0) 100%)"
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1.5rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                  <span style={{
                    width: "12px", height: "12px", borderRadius: "50%",
                    backgroundColor: maintenanceMode ? "#ef4444" : "#22c55e",
                    display: "inline-block",
                    boxShadow: `0 0 0 4px ${maintenanceMode ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
                    animation: "pulse-dot 2s infinite"
                  }} />
                  <span style={{ fontWeight: "800", fontSize: "1.1rem", color: "var(--color-gray-900)" }}>
                    Status Website: {maintenanceMode ? "🔴 Mode Maintenance AKTIF" : "🟢 Website Normal (Online)"}
                  </span>
                </div>
                <p style={{ fontSize: "0.9rem", color: "var(--color-gray-500)", maxWidth: "480px", lineHeight: "1.6" }}>
                  {maintenanceMode
                    ? "Website sedang dalam mode maintenance. Pengunjung umum & orang tua akan diarahkan ke halaman maintenance. Admin tetap bisa login dan mengakses dashboard."
                    : "Website berjalan normal. Semua pengguna dapat mengakses landing page dan portal orang tua."}
                </p>
              </div>

              {/* Toggle switch */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                <button
                  onClick={async () => {
                    const newValue = !maintenanceMode;
                    setSavingMaintenance(true);
                    try {
                      const res = await fetch("/api/maintenance", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ enabled: newValue }),
                      });
                      const result = await res.json();
                      if (!res.ok) throw new Error(result.error || "Gagal mengubah mode maintenance");
                      setMaintenanceMode(newValue);
                      showToast(newValue ? "Mode Maintenance DIAKTIFKAN. Website tidak dapat diakses publik." : "Mode Maintenance DINONAKTIFKAN. Website kembali online!", newValue ? "error" : "success");
                    } catch (err) {
                      showToast("Gagal mengubah mode maintenance: " + err.message, "error");
                    } finally {
                      setSavingMaintenance(false);
                    }
                  }}
                  disabled={savingMaintenance}
                  style={{
                    position: "relative",
                    width: "72px", height: "38px",
                    borderRadius: "100px",
                    border: "none",
                    cursor: savingMaintenance ? "not-allowed" : "pointer",
                    backgroundColor: maintenanceMode ? "#ef4444" : "#22c55e",
                    transition: "background-color 0.3s",
                    padding: 0,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                  }}
                >
                  <span style={{
                    position: "absolute",
                    top: "4px",
                    left: maintenanceMode ? "38px" : "4px",
                    width: "30px", height: "30px",
                    borderRadius: "50%",
                    backgroundColor: "white",
                    transition: "left 0.3s",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                  }} />
                </button>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: maintenanceMode ? "#ef4444" : "#22c55e" }}>
                  {savingMaintenance ? "Menyimpan..." : (maintenanceMode ? "MAINTENANCE" : "ONLINE")}
                </span>
              </div>
            </div>
          </div>

          {/* Copy protection card */}
          <div className="portal-card" style={{
            padding: "2rem",
            borderLeft: `5px solid ${allowPublicCopy ? "#3b82f6" : "#f59e0b"}`,
            background: allowPublicCopy
              ? "linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(255,255,255,0) 100%)"
              : "linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(255,255,255,0) 100%)"
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1.5rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                  <span style={{
                    width: "12px", height: "12px", borderRadius: "50%",
                    backgroundColor: allowPublicCopy ? "#3b82f6" : "#f59e0b",
                    display: "inline-block",
                    boxShadow: `0 0 0 4px ${allowPublicCopy ? "rgba(59,130,246,0.2)" : "rgba(245,158,11,0.2)"}`
                  }} />
                  <span style={{ fontWeight: "800", fontSize: "1.1rem", color: "var(--color-gray-900)" }}>
                    Proteksi Salin Konten (Copy Protection)
                  </span>
                </div>
                <p style={{ fontSize: "0.9rem", color: "var(--color-gray-500)", maxWidth: "480px", lineHeight: "1.6" }}>
                  {allowPublicCopy
                    ? "🔓 Proteksi dinonaktifkan. Pengunjung dapat melakukan klik kanan, menyeleksi teks, menyalin (copy) konten, dan men-drag gambar dari website publik."
                    : "🔒 Proteksi aktif. Pengunjung dibatasi untuk melakukan klik kanan, menyeleksi teks, menyalin (copy) konten, atau menyeret gambar dari website publik demi keamanan konten."}
                </p>
              </div>

              {/* Toggle switch */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                <button
                  onClick={handleToggleCopySetting}
                  disabled={savingCopySetting}
                  style={{
                    position: "relative",
                    width: "72px", height: "38px",
                    borderRadius: "100px",
                    border: "none",
                    cursor: savingCopySetting ? "not-allowed" : "pointer",
                    backgroundColor: allowPublicCopy ? "#3b82f6" : "#f59e0b",
                    transition: "background-color 0.3s",
                    padding: 0,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                  }}
                >
                  <span style={{
                    position: "absolute",
                    top: "4px",
                    left: allowPublicCopy ? "38px" : "4px",
                    width: "30px", height: "30px",
                    borderRadius: "50%",
                    backgroundColor: "white",
                    transition: "left 0.3s",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                  }} />
                </button>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: allowPublicCopy ? "#3b82f6" : "#f59e0b" }}>
                  {savingCopySetting ? "Menyimpan..." : (allowPublicCopy ? "DIIZINKAN (OPEN)" : "TERPROTEKSI (SAFE)")}
                </span>
              </div>
            </div>
          </div>

          {/* Visitor counter card */}
          <div className="portal-card" style={{
            padding: "2rem",
            borderLeft: "5px solid #14b8a6",
            background: "linear-gradient(135deg, rgba(20,184,166,0.06) 0%, rgba(255,255,255,0) 100%)"
          }}>
            <form onSubmit={handleSaveVisitorOffset}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1.5rem" }}>
                <div style={{ flex: 1, minWidth: "280px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                    <span style={{
                      width: "12px", height: "12px", borderRadius: "50%",
                      backgroundColor: "#14b8a6",
                      display: "inline-block",
                      boxShadow: "0 0 0 4px rgba(20,184,166,0.2)"
                    }} />
                    <span style={{ fontWeight: "800", fontSize: "1.1rem", color: "var(--color-gray-900)" }}>
                      Pengaturan Angka Awal Pengunjung (Visitor Offset)
                    </span>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "var(--color-gray-500)", maxWidth: "480px", lineHeight: "1.6", marginBottom: "1rem" }}>
                    Tentukan angka awal untuk memulai penghitung pengunjung di website utama. Nilai ini akan ditambahkan ke jumlah pengunjung unik baru yang terdeteksi di database.
                  </p>
                  
                  <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "250px" }}>
                    <label style={{ fontWeight: "700", color: "var(--color-gray-700)", fontSize: "0.85rem" }}>Angka Awal Pengunjung</label>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                      placeholder="Contoh: 1210"
                      value={visitorOffset}
                      onChange={(e) => setVisitorOffset(e.target.value)}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button
                    type="submit"
                    className="btn-portal"
                    disabled={savingVisitorOffset}
                    style={{
                      padding: "0.75rem 1.5rem",
                      fontWeight: "700",
                      borderRadius: "6px",
                      cursor: savingVisitorOffset ? "not-allowed" : "pointer"
                    }}
                  >
                    {savingVisitorOffset ? "Menyimpan..." : "Simpan Angka Awal"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Info card */}
          <div className="portal-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontWeight: "800", fontSize: "1rem", color: "var(--color-gray-900)", marginBottom: "1rem" }}>
              ℹ️ Cara Kerja Mode Maintenance
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { icon: "🌐", text: "Landing page utama (/) akan menampilkan halaman maintenance yang elegan." },
                { icon: "👨‍💼", text: "Admin tetap bisa login dan mengakses dashboard secara penuh." },
                { icon: "👪", text: "Orang tua yang sudah login atau mencoba login akan diarahkan ke halaman maintenance." },
                { icon: "📞", text: "Halaman maintenance menampilkan tombol WhatsApp agar orang tua tetap bisa menghubungi." },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{item.icon}</span>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-gray-600)", lineHeight: "1.6" }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
