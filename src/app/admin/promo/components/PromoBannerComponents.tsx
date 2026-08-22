"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import DOMPurify from "dompurify";

function PromoTiptapEditor({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  const btnStyle = (isActive: boolean) => ({
    padding: "4px 10px",
    borderRadius: "6px",
    border: "1px solid var(--color-gray-300)",
    backgroundColor: isActive ? "var(--color-primary)" : "#f8fafc",
    color: isActive ? "#fff" : "#334155",
    fontWeight: isActive ? 800 : 600,
    fontSize: "0.8rem",
    cursor: "pointer",
    transition: "all 0.15s ease",
  });

  return (
    <div style={{ border: "1px solid var(--color-gray-300)", borderRadius: "10px", overflow: "hidden", backgroundColor: "#fff" }}>
      {/* Apple HIG Toolbar */}
      <div style={{ display: "flex", gap: "6px", padding: "6px 8px", borderBottom: "1px solid var(--color-gray-200)", backgroundColor: "#f1f5f9", flexWrap: "wrap", alignItems: "center" }}>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={btnStyle(editor.isActive("bold"))} title="Tebal (Bold)">
          B
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={btnStyle(editor.isActive("italic"))} title="Miring (Italic)">
          I
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={btnStyle(editor.isActive("bulletList"))} title="Daftar Poin">
          • Poin
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} style={btnStyle(editor.isActive("orderedList"))} title="Daftar Nomor">
          1. Nomor
        </button>
        <button type="button" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} style={{ ...btnStyle(false), color: "#94a3b8" }} title="Bersihkan Format">
          Reset
        </button>
      </div>

      {/* Editor Content Area */}
      <div style={{ padding: "0.75rem 1rem", minHeight: "110px" }}>
        <style dangerouslySetInnerHTML={{ __html: `.ProseMirror { outline: none; min-height: 90px; font-size: 0.9rem; color: #334155; line-height: 1.6; } .ProseMirror p { margin: 0 0 0.5rem 0; } .ProseMirror ul, .ProseMirror ol { margin: 0 0 0.5rem 1.25rem; padding: 0; } .ProseMirror li { margin-bottom: 0.25rem; }` }} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export function PromoBannerFormFields(props: any) {
  const { badgeText, setBadgeText, title, setTitle, message, setMessage, ctaText, setCtaText, ctaUrl, setCtaUrl, imageUrl, handleRemoveImage, uploading, fileInputRef, handleImageUpload, handleSave, saving } = props;
  const inputStyle = { width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--color-gray-300)" };
  const labelStyle = { display: "block", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.4rem" };

  return (
    <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--color-gray-200)" }}>
      <h2 style={{ margin: "0 0 1.25rem", fontSize: "1rem", fontWeight: 700 }}>Konten Popup Promo (TipTap Editor)</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label style={labelStyle}>Label / Badge Atas (misal: PROMO KHUSUS / PENGUMUMAN PENTING)</label>
        <input type="text" value={badgeText} onChange={(e) => setBadgeText(e.target.value)} placeholder="PROMO KHUSUS" style={inputStyle} maxLength={40} />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label style={labelStyle}>Judul Promo</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Penawaran Spesial!" style={inputStyle} maxLength={80} />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label style={labelStyle}>Pesan &amp; Poin Promo <span style={{ color: "#ef4444" }}>*</span></label>
        <PromoTiptapEditor value={message} onChange={setMessage} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div><label style={labelStyle}>Teks Tombol</label><input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Daftar Sekarang" style={inputStyle} maxLength={40} /></div>
        <div><label style={labelStyle}>Link Tombol</label><input type="text" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="/onboarding" style={inputStyle} maxLength={200} /></div>
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

export { PromoTiptapEditor };

export function PromoBannerPreview({ mode, badgeText, title, message, ctaText, ctaUrl, imageUrl }: any) {
  const isFlyer = mode === "flyer" || (Boolean(imageUrl) && !title?.trim());
  const cleanHtml = typeof window !== "undefined" ? DOMPurify.sanitize(message || "") : message;

  return (
    <div style={{ backgroundColor: "#fff", padding: "1.25rem", borderRadius: "16px", border: "1px solid var(--color-gray-200)" }}>
      <h2 style={{ margin: "0 0 0.75rem", fontSize: "0.95rem", fontWeight: 700, color: "var(--color-gray-700)" }}>
        Pratinjau Live ({isFlyer ? "Mode Flyer Saja" : "Mode Banner Teks"})
      </h2>

      {isFlyer ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {imageUrl ? (
            <div style={{ position: "relative", maxWidth: "340px", width: "100%" }}>
              <img
                src={imageUrl}
                alt="Flyer Preview"
                style={{
                  width: "100%",
                  maxHeight: "360px",
                  objectFit: "contain",
                  borderRadius: "16px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                }}
              />
              {ctaUrl && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "rgba(15, 23, 42, 0.8)",
                    color: "#fff",
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <span>Link: {ctaUrl}</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: "2rem", border: "1px dashed var(--color-gray-300)", borderRadius: "12px", textAlign: "center", color: "var(--color-gray-400)", fontSize: "0.85rem", width: "100%" }}>
              Unggah gambar flyer untuk melihat pratinjau
            </div>
          )}
        </div>
      ) : (
        <div style={{ border: "1px solid var(--color-gray-200)", borderRadius: "16px", overflow: "hidden", maxWidth: "380px", margin: "0 auto", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
          {imageUrl && <img src={imageUrl} alt="Preview" width={380} height={180} style={{ width: "100%", maxHeight: "180px", objectFit: "cover" }} />}
          <div style={{ padding: "1.25rem" }}>
            <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0.25rem 0.75rem", fontSize: "0.68rem", fontWeight: 800, borderRadius: "9999px", backgroundColor: "rgba(33, 108, 126, 0.1)", color: "#216c7e", border: "1px solid rgba(33, 108, 126, 0.2)", textTransform: "uppercase" }}>
                {badgeText || "PROMO KHUSUS"}
              </span>
            </div>
            {title && <p style={{ margin: "0 0 0.4rem", fontWeight: 700, color: "var(--color-primary-dark)", fontSize: "1rem", textAlign: "center" }}>{title}</p>}
            <div
              style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: "var(--color-gray-600)", lineHeight: 1.5 }}
              dangerouslySetInnerHTML={{ __html: cleanHtml || "<p style='text-align:center'>Isi pesan promo...</p>" }}
            />
            {ctaText && <div style={{ textAlign: "center" }}><span style={{ display: "inline-block", padding: "0.5rem 1.2rem", background: "var(--color-primary)", color: "#fff", borderRadius: "10px", fontWeight: 700, fontSize: "0.85rem" }}>{ctaText} →</span></div>}
          </div>
        </div>
      )}
    </div>
  );
}

