import React from "react";

export function MarqueeAndCtaFields(props: any) {
  const {
    marqueeText1, setMarqueeText1, marqueeText2, setMarqueeText2, marqueeText3, setMarqueeText3,
    ctaTag, setCtaTag, ctaTitle, setCtaTitle, ctaDesc, setCtaDesc,
    ctaBrochureImage, setCtaBrochureImage, uploadingCtaBrochure, setUploadingCtaBrochure,
    ctaBrochureFileRef, handleUploadToStorage, getCanvaEmbedUrl
  } = props;

  return (
    <>
      <hr style={{ border: "none", borderTop: "1px solid var(--color-gray-200)", margin: "2rem 0 1rem" }} />
      <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1rem" }}>Konfigurasi Teks Pengumuman Berjalan (Marquee)</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input type="text" className="form-input" placeholder="Teks Box 1" value={marqueeText1} onChange={(e) => setMarqueeText1(e.target.value)} required />
        <input type="text" className="form-input" placeholder="Teks Box 2" value={marqueeText2} onChange={(e) => setMarqueeText2(e.target.value)} required />
        <input type="text" className="form-input" placeholder="Teks Box 3" value={marqueeText3} onChange={(e) => setMarqueeText3(e.target.value)} required />
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
