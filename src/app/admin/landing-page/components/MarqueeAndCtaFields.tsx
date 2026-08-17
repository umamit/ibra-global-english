import React from "react";

const ICON_OPTIONS = [
  { id: "sparkle", label: "Sparkle Bintang", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2l2.4 7.2L21.6 12l-7.2 2.4L12 21.6l-2.4-7.2L2.4 12l7.2-2.4L12 2z" />
    </svg>
  )},
  { id: "megaphone", label: "Megafon Info", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  )},
  { id: "star", label: "Bintang Emas", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )},
  { id: "bell", label: "Lonceng Notif", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )},
  { id: "flame", label: "Promo Hot", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  )},
  { id: "check", label: "Centang Resmi", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )},
];

export function MarqueeAndCtaFields(props: any) {
  const {
    marqueeList = [], handleAddMarqueeText, handleRemoveMarqueeText, handleMarqueeTextChange,
    marqueeIcon = "sparkle", setMarqueeIcon,
    ctaTag, setCtaTag, ctaTitle, setCtaTitle, ctaDesc, setCtaDesc,
    ctaBrochureImage, setCtaBrochureImage, uploadingCtaBrochure, setUploadingCtaBrochure,
    ctaBrochureFileRef, handleUploadToStorage, getCanvaEmbedUrl
  } = props;

  return (
    <>
      <hr style={{ border: "none", borderTop: "1px solid var(--color-gray-200)", margin: "2rem 0 1rem" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-gray-800)", margin: 0 }}>
            Konfigurasi Teks Pengumuman Berjalan (Marquee)
          </h3>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.825rem", color: "var(--color-gray-500)" }}>
            Atur teks dan pilih icon pemisah berdenyut (pulsing) yang tampil di pita paling atas.
          </p>
        </div>
      </div>

      {/* Pilihan Ikon Pemisah (Icon Selector) */}
      <div style={{ marginTop: "1rem", marginBottom: "1.25rem" }}>
        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "var(--color-gray-700)", marginBottom: "0.5rem" }}>
          Pilihan Icon Pemisah (Pulsing Glow)
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(135px, 1fr))", gap: "0.5rem" }}>
          {ICON_OPTIONS.map((opt) => {
            const isSelected = marqueeIcon === opt.id;
            return (
              <button
                type="button"
                key={opt.id}
                onClick={() => setMarqueeIcon(opt.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "10px",
                  border: isSelected ? "2px solid var(--color-primary, #216c7e)" : "1px solid var(--color-gray-300)",
                  backgroundColor: isSelected ? "rgba(33, 108, 126, 0.08)" : "var(--color-gray-50, #fff)",
                  color: isSelected ? "var(--color-primary-dark, #164d57)" : "var(--color-gray-700)",
                  fontWeight: isSelected ? "700" : "500",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ color: isSelected ? "var(--color-primary, #216c7e)" : "var(--color-accent, #A68849)" }}>
                  {opt.icon}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Daftar Teks Pengumuman Dinamis */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "var(--color-gray-700)" }}>
          Daftar Teks Pengumuman ({marqueeList.length} item)
        </label>

        {marqueeList.map((text: string, idx: number) => (
          <div key={idx} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--color-gray-400)", width: "24px", flexShrink: 0, textAlign: "center" }}>
              #{idx + 1}
            </span>
            <input
              type="text"
              className="form-input"
              style={{ flex: 1 }}
              placeholder={`Teks pengumuman #${idx + 1}...`}
              value={text}
              onChange={(e) => handleMarqueeTextChange(idx, e.target.value)}
              required
            />
            {marqueeList.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveMarqueeText(idx)}
                aria-label={`Hapus teks pengumuman #${idx + 1}`}
                style={{
                  padding: "0.5rem 0.75rem",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  color: "#dc2626",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  flexShrink: 0,
                  transition: "all 0.15s ease",
                }}
              >
                Hapus
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddMarqueeText}
          className="btn-portal-outline"
          style={{ alignSelf: "flex-start", marginTop: "0.25rem", fontSize: "0.825rem", padding: "0.45rem 1rem" }}
        >
          + Tambah Teks Pengumuman
        </button>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--color-gray-200)", margin: "2rem 0 1rem" }} />
      <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1rem" }}>Konfigurasi Banner Promosi & Brosur (CTA)</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input type="text" className="form-input" placeholder="Tag Promosi CTA" value={ctaTag} onChange={(e) => setCtaTag(e.target.value)} required />
        <input type="text" className="form-input" placeholder="Judul Banner CTA" value={ctaTitle} onChange={(e) => setCtaTitle(e.target.value)} required />
        <textarea className="form-input" rows={3} placeholder="Deskripsi Banner CTA" value={ctaDesc} onChange={(e) => setCtaDesc(e.target.value)} required />

        <div>
          <label style={{ fontWeight: "600", fontSize: "0.9rem" }}>Brosur Promosi</label>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "0.5rem" }}>
            {ctaBrochureImage && (
              <div style={{ width: "120px", height: "70px", overflow: "hidden", border: "1px solid var(--color-gray-300)" }}>
                {getCanvaEmbedUrl(ctaBrochureImage) ? (
                  <iframe src={getCanvaEmbedUrl(ctaBrochureImage)!} style={{ width: "100%", height: "100%", border: "none" }} />
                ) : (
                  <img src={ctaBrochureImage} alt="Brochure" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                )}
              </div>
            )}
            <input type="file" ref={ctaBrochureFileRef} accept="image/*" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploadingCtaBrochure(true);
              try { setCtaBrochureImage(await handleUploadToStorage(file)); } catch (err: any) { alert(err.message); } finally { setUploadingCtaBrochure(false); }
            }} style={{ display: "none" }} />
            <button type="button" onClick={() => ctaBrochureFileRef.current?.click()} className="btn-portal-outline" disabled={uploadingCtaBrochure}>
              {uploadingCtaBrochure ? "Mengunggah..." : "Pilih Brosur"}
            </button>
            <input type="text" className="form-input" placeholder="Tautan Gambar URL..." value={ctaBrochureImage} onChange={(e) => setCtaBrochureImage(e.target.value)} />
          </div>
        </div>
      </div>
    </>
  );
}
