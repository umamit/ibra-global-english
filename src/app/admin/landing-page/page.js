"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

export default function LandingPageCMS() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState("hero");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

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
  const [uploadingHero, setUploadingHero] = useState(false);
  const heroFileRef = useRef(null);

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
      }
    } catch (err) {
      console.error("Gagal mengambil konfigurasi hero:", err);
      showToast("Gagal memuat beberapa pengaturan landing page dari database.", "error");
    } finally {
      setLoading(false);
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
      { key: "payment_spp_amount", value: paymentSppAmount.trim() },
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
          onClick={() => setActiveTab("testimonials")}
          className={`btn-portal-outline ${activeTab === "testimonials" ? "active" : ""}`}
          style={{ padding: "0.6rem 1.2rem", fontWeight: "600", whiteSpace: "nowrap" }}
        >
          Ulasan & Testimoni
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr md:1fr 1fr", gap: "1rem" }}>
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
                    placeholder="Contoh: contact@ibraglobalenglish.uk"
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

                {/* Nominal SPP */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Nominal SPP Bulanan (Rupiah)</label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                    placeholder="Contoh: 150000"
                    value={paymentSppAmount}
                    onChange={(e) => setPaymentSppAmount(e.target.value)}
                    required
                  />
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr md:1fr", gap: "1rem" }}>
                
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr md:1fr", gap: "1rem" }}>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr md:1fr 1fr", gap: "1rem" }}>
                
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
    </div>
  );
}
