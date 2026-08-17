"use client";

import React from "react";
import { ContactAndPaymentFields } from "./ContactAndPaymentFields";
import { MarqueeAndCtaFields } from "./MarqueeAndCtaFields";

interface HeroSettingsProps {
  heroTitle: string; setHeroTitle: (val: string) => void;
  heroSubtitle: string; setHeroSubtitle: (val: string) => void;
  heroDesc: string; setHeroDesc: (val: string) => void;
  heroImage: string; setHeroImage: (val: string) => void;
  contactAddress: string; setContactAddress: (val: string) => void;
  contactPhone: string; setContactPhone: (val: string) => void;
  contactEmail: string; setContactEmail: (val: string) => void;
  paymentBankName: string; setPaymentBankName: (val: string) => void;
  paymentAccountNumber: string; setPaymentAccountNumber: (val: string) => void;
  paymentAccountName: string; setPaymentAccountName: (val: string) => void;
  paymentAccountSub: string; setPaymentAccountSub: (val: string) => void;
  paymentSppKids: string | number; setPaymentSppKids: (val: string) => void;
  paymentSppTeens: string | number; setPaymentSppTeens: (val: string) => void;
  paymentSppCalistung: string | number; setPaymentSppCalistung: (val: string) => void;
  marqueeText1: string; setMarqueeText1: (val: string) => void;
  marqueeText2: string; setMarqueeText2: (val: string) => void;
  marqueeText3: string; setMarqueeText3: (val: string) => void;
  marqueeList?: string[]; setMarqueeList?: React.Dispatch<React.SetStateAction<string[]>>;
  marqueeIcon?: string; setMarqueeIcon?: (val: string) => void;
  handleAddMarqueeText?: () => void;
  handleRemoveMarqueeText?: (index: number) => void;
  handleMarqueeTextChange?: (index: number, val: string) => void;
  ctaTag: string; setCtaTag: (val: string) => void;
  ctaTitle: string; setCtaTitle: (val: string) => void;
  ctaDesc: string; setCtaDesc: (val: string) => void;
  ctaBrochureImage: string; setCtaBrochureImage: (val: string) => void;
  uploadingHero: boolean; setUploadingHero: (val: boolean) => void;
  uploadingCtaBrochure: boolean; setUploadingCtaBrochure: (val: boolean) => void;
  heroFileRef: React.RefObject<HTMLInputElement | null>;
  ctaBrochureFileRef: React.RefObject<HTMLInputElement | null>;
  handleUploadToStorage: (file: File) => Promise<string>;
  onSave: React.FormEventHandler<HTMLFormElement>;
}

export default function HeroSettings(props: HeroSettingsProps) {
  const {
    heroTitle, setHeroTitle, heroSubtitle, setHeroSubtitle, heroDesc, setHeroDesc,
    heroImage, setHeroImage, uploadingHero, setUploadingHero, heroFileRef, handleUploadToStorage, onSave
  } = props;

  const getCanvaEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    if (url.includes("<iframe")) {
      const match = url.match(/src="([^"]+)"/);
      if (match && match[1]) return match[1];
    }
    if (url.includes("canva.com/design/")) {
      let cleanUrl = url.split("?")[0];
      return cleanUrl.endsWith("/view") || cleanUrl.endsWith("/watch") ? `${cleanUrl}?embed` : `${cleanUrl}/view?embed`;
    }
    return null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <form onSubmit={onSave} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div className="portal-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1.1rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>Konfigurasi Utama Hero Banner</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div><label className="form-label">Sub-judul / Subtitle Top</label><input type="text" className="form-input" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} required /></div>
            <div><label className="form-label">Judul Utama Banner</label><input type="text" className="form-input" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} required /></div>
            <div><label className="form-label">Deskripsi Paragraf Hero</label><textarea className="form-input" rows={3} value={heroDesc} onChange={(e) => setHeroDesc(e.target.value)} required /></div>
            <div>
              <label className="form-label">Gambar Utama / Embed Canva</label>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <input type="file" ref={heroFileRef} accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingHero(true);
                  try { setHeroImage(await handleUploadToStorage(file)); } catch (err: any) { alert(err.message); } finally { setUploadingHero(false); }
                }} style={{ display: "none" }} />
                <button type="button" onClick={() => heroFileRef.current?.click()} className="btn-portal-outline" disabled={uploadingHero}>{uploadingHero ? "Mengunggah..." : "Pilih Gambar"}</button>
                <input type="text" className="form-input" placeholder="Tautan Canva / URL..." value={heroImage} onChange={(e) => setHeroImage(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <ContactAndPaymentFields {...props} />
        <MarqueeAndCtaFields {...props} getCanvaEmbedUrl={getCanvaEmbedUrl} />

        <button type="submit" className="btn-portal-primary" style={{ padding: "0.75rem 1.5rem", fontWeight: "700" }}>Simpan Perubahan Landing Page</button>
      </form>
    </div>
  );
}
