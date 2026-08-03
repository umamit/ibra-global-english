import React from "react";

export function PromoBannerFormFields(props: any) {
  const { title, setTitle, message, setMessage, ctaText, setCtaText, ctaUrl, setCtaUrl, imageUrl, handleRemoveImage, uploading, fileInputRef, handleImageUpload, handleSave, saving } = props;
  const inputStyle = { width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" };
  const labelStyle = { display: "block", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.4rem" };

  return (
    <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--color-gray-200)" }}>
      <h2 style={{ margin: "0 0 1.25rem", fontSize: "1rem", fontWeight: 700 }}>Konten Popup</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label style={labelStyle}>Judul</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Penawaran Spesial!" style={inputStyle} maxLength={80} />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label style={labelStyle}>Pesan <span style={{ color: "#ef4444" }}>*</span></label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tulis deskripsi promosi..." rows={3} style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }} maxLength={300} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div><label style={labelStyle}>Teks Tombol</label><input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Daftar Sekarang" style={inputStyle} maxLength={40} /></div>
        <div><label style={labelStyle}>Link Tombol</label><input type="text" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="/placement-test" style={inputStyle} maxLength={200} /></div>
      </div>
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={labelStyle}>Gambar Banner</label>
        {imageUrl ? (
          <div style={{ position: "relative", display: "inline-block" }}>
            <img src={imageUrl} alt="Preview" width={320} height={160} style={{ width: "100%", maxWidth: "320px", borderRadius: "12px" }} />
            <button onClick={handleRemoveImage} style={{ position: "absolute", top: "8px", right: "8px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer" }}>✕</button>
          </div>
        ) : (
          <div onClick={() => fileInputRef.current?.click()} style={{ border: "2px dashed var(--color-gray-300)", borderRadius: "12px", padding: "2rem", textAlign: "center", cursor: "pointer" }}>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>{uploading ? "Mengunggah..." : "Klik untuk unggah gambar banner"}</p>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); e.target.value = ""; }} />
      </div>
      <button onClick={handleSave} disabled={saving} style={{ padding: "0.75rem 2rem", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </div>
  );
}

export function PromoBannerPreview({ title, message, ctaText, ctaUrl, imageUrl }: any) {
  return (
    <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--color-gray-200)" }}>
      <h2 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700 }}>Preview Popup</h2>
      <div style={{ border: "1px solid var(--color-gray-200)", borderRadius: "16px", overflow: "hidden", maxWidth: "400px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
        {imageUrl && <img src={imageUrl} alt="Preview" width={400} height={200} style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }} />}
        <div style={{ padding: "1.25rem 1.5rem 1.5rem" }}>
          {title && <p style={{ margin: "0 0 0.5rem", fontWeight: 700, color: "var(--color-primary-dark)", fontSize: "1.05rem" }}>{title}</p>}
          <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "var(--color-gray-600)" }}>{message || "Tulis pesan di form atas..."}</p>
          {ctaText && ctaUrl && <span style={{ display: "inline-block", padding: "0.55rem 1.2rem", background: "var(--color-primary)", color: "#fff", borderRadius: "10px", fontWeight: 600 }}>{ctaText} →</span>}
        </div>
      </div>
    </div>
  );
}
