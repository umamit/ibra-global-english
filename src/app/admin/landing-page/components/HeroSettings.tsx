"use client";

import React, { useState, useRef } from "react";

interface HeroSettingsProps {
  heroTitle: string;
  setHeroTitle: (val: string) => void;
  heroSubtitle: string;
  setHeroSubtitle: (val: string) => void;
  heroDesc: string;
  setHeroDesc: (val: string) => void;
  heroImage: string;
  setHeroImage: (val: string) => void;
  contactAddress: string;
  setContactAddress: (val: string) => void;
  contactPhone: string;
  setContactPhone: (val: string) => void;
  contactEmail: string;
  setContactEmail: (val: string) => void;
  paymentBankName: string;
  setPaymentBankName: (val: string) => void;
  paymentAccountNumber: string;
  setPaymentAccountNumber: (val: string) => void;
  paymentAccountName: string;
  setPaymentAccountName: (val: string) => void;
  paymentAccountSub: string;
  setPaymentAccountSub: (val: string) => void;
  paymentSppKids: string | number;
  setPaymentSppKids: (val: string) => void;
  paymentSppTeens: string | number;
  setPaymentSppTeens: (val: string) => void;
  paymentSppCalistung: string | number;
  setPaymentSppCalistung: (val: string) => void;
  marqueeText1: string;
  setMarqueeText1: (val: string) => void;
  marqueeText2: string;
  setMarqueeText2: (val: string) => void;
  marqueeText3: string;
  setMarqueeText3: (val: string) => void;
  ctaTag: string;
  setCtaTag: (val: string) => void;
  ctaTitle: string;
  setCtaTitle: (val: string) => void;
  ctaDesc: string;
  setCtaDesc: (val: string) => void;
  ctaBrochureImage: string;
  setCtaBrochureImage: (val: string) => void;
  uploadingHero: boolean;
  setUploadingHero: (val: boolean) => void;
  uploadingCtaBrochure: boolean;
  setUploadingCtaBrochure: (val: boolean) => void;
  heroFileRef: React.RefObject<HTMLInputElement | null>;
  ctaBrochureFileRef: React.RefObject<HTMLInputElement | null>;
  handleUploadToStorage: (file: File) => Promise<string>;
  onSave: React.FormEventHandler<HTMLFormElement>;
}

export default function HeroSettings({
  heroTitle, setHeroTitle,
  heroSubtitle, setHeroSubtitle,
  heroDesc, setHeroDesc,
  heroImage, setHeroImage,
  contactAddress, setContactAddress,
  contactPhone, setContactPhone,
  contactEmail, setContactEmail,
  paymentBankName, setPaymentBankName,
  paymentAccountNumber, setPaymentAccountNumber,
  paymentAccountName, setPaymentAccountName,
  paymentAccountSub, setPaymentAccountSub,
  paymentSppKids, setPaymentSppKids,
  paymentSppTeens, setPaymentSppTeens,
  paymentSppCalistung, setPaymentSppCalistung,
  marqueeText1, setMarqueeText1,
  marqueeText2, setMarqueeText2,
  marqueeText3, setMarqueeText3,
  ctaTag, setCtaTag,
  ctaTitle, setCtaTitle,
  ctaDesc, setCtaDesc,
  ctaBrochureImage, setCtaBrochureImage,
  uploadingHero, setUploadingHero,
  uploadingCtaBrochure, setUploadingCtaBrochure,
  heroFileRef, ctaBrochureFileRef,
  handleUploadToStorage,
  onSave
}: HeroSettingsProps) {
  const getCanvaEmbedUrl = (url: string): string | null => {
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

  return (
    <div className="portal-card" style={{ padding: "2rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>Profil & Hero Utama</h2>

      <form onSubmit={onSave} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
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
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingHero(true);
                    try {
                      const publicUrl = await handleUploadToStorage(file);
                      setHeroImage(publicUrl);
                    } catch (err) {
                      alert("Gagal mengunggah foto hero: " + (err instanceof Error ? err.message : String(err)));
                    } finally {
                      setUploadingHero(false);
                    }
                  }}
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Alamat Lengkap Lembaga</label>
              <textarea
                className="form-input"
                style={{ width: "100%", height: "80px", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                placeholder="Contoh: Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001, Bobong, Taliabu Barat, Kabupaten Pulau Taliabu, Maluku Utara 97794"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                required
              />
            </div>

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
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Nama Bank</label>
              <input type="text" className="form-input" style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }} placeholder="Contoh: Bank Mandiri" value={paymentBankName} onChange={(e) => setPaymentBankName(e.target.value)} required />
            </div>
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Nomor Rekening</label>
              <input type="text" className="form-input" style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }} placeholder="Contoh: 137-00-1234567-8" value={paymentAccountNumber} onChange={(e) => setPaymentAccountNumber(e.target.value)} required />
            </div>
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Atas Nama Rekening</label>
              <input type="text" className="form-input" style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }} placeholder="Contoh: Ibra Global English" value={paymentAccountName} onChange={(e) => setPaymentAccountName(e.target.value)} required />
            </div>
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Sub-keterangan Atas Nama</label>
              <input type="text" className="form-input" style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }} placeholder="Contoh: Bobong Learning Centre" value={paymentAccountSub} onChange={(e) => setPaymentAccountSub(e.target.value)} />
            </div>
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Nominal SPP Kids Program (Rupiah)</label>
              <input type="number" className="form-input" style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }} placeholder="Contoh: 300000" value={paymentSppKids} onChange={(e) => setPaymentSppKids(e.target.value)} required />
            </div>
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Nominal SPP Teens Program (Rupiah)</label>
              <input type="number" className="form-input" style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }} placeholder="Contoh: 300000" value={paymentSppTeens} onChange={(e) => setPaymentSppTeens(e.target.value)} required />
            </div>
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Nominal SPP Fun Calistung (Rupiah)</label>
              <input type="number" className="form-input" style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }} placeholder="Contoh: 350000" value={paymentSppCalistung} onChange={(e) => setPaymentSppCalistung(e.target.value)} required />
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
              <input type="text" className="form-input" style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }} placeholder="Kalimat pengumuman pertama..." value={marqueeText1} onChange={(e) => setMarqueeText1(e.target.value)} required />
            </div>
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Teks Pengumuman Box 2</label>
              <input type="text" className="form-input" style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }} placeholder="Kalimat pengumuman kedua..." value={marqueeText2} onChange={(e) => setMarqueeText2(e.target.value)} required />
            </div>
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Teks Pengumuman Box 3</label>
              <input type="text" className="form-input" style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }} placeholder="Kalimat pengumuman ketiga..." value={marqueeText3} onChange={(e) => setMarqueeText3(e.target.value)} required />
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
              <input type="text" className="form-input" style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }} placeholder="Contoh: Promo Terbatas!" value={ctaTag} onChange={(e) => setCtaTag(e.target.value)} required />
            </div>
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Judul Banner CTA (Gunakan &apos;&amp;&apos; untuk teks highlight kuning)</label>
              <input type="text" className="form-input" style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }} placeholder="Contoh: Belajar Cepat & Jadi Percaya Diri!" value={ctaTitle} onChange={(e) => setCtaTitle(e.target.value)} required />
            </div>
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Deskripsi Banner CTA</label>
              <textarea className="form-input" style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)", minHeight: "100px", resize: "vertical" }} placeholder="Masukkan teks deskripsi promosi..." value={ctaDesc} onChange={(e) => setCtaDesc(e.target.value)} required />
            </div>

            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Brosur Promosi (Tampilan di Bawah CTA Banner)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center" }}>
                {ctaBrochureImage && (
                  <div style={{ width: "160px", height: "90px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--color-gray-300)", position: "relative" }}>
                    {getCanvaEmbedUrl(ctaBrochureImage) ? (
                      <iframe src={getCanvaEmbedUrl(ctaBrochureImage)!} style={{ width: "100%", height: "100%", border: "none" }} loading="lazy" />
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
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingCtaBrochure(true);
                      try {
                        const publicUrl = await handleUploadToStorage(file);
                        setCtaBrochureImage(publicUrl);
                      } catch (err) {
                        alert("Gagal mengunggah brosur: " + (err instanceof Error ? err.message : String(err)));
                      } finally {
                        setUploadingCtaBrochure(false);
                      }
                    }}
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
          >
            Simpan Perubahan Landing Page
          </button>
        </div>
      </form>
    </div>
  );
}
