"use client";

import React from "react";

import { GalleryItem } from "@/types";

interface GalleryManagerProps {
  galleryTitle: string;
  setGalleryTitle: (val: string) => void;
  galleryDesc: string;
  setGalleryDesc: (val: string) => void;
  galleryCaption: string;
  setGalleryCaption: (val: string) => void;
  galleryPreviews: string[];
  setGalleryPreviews: (val: string[]) => void;
  galleryFiles: File[];
  setGalleryFiles: (val: File[]) => void;
  galleryFileRef: React.RefObject<HTMLInputElement | null>;
  addingGallery: boolean;
  setAddingGallery: (val: boolean) => void;
  galleryList: GalleryItem[];
  setGalleryList: (list: GalleryItem[]) => void;
  galleryLoading: boolean;
  handleGalleryFileChange: React.ChangeEventHandler<HTMLInputElement>;
  handleAddGalleryItem: React.FormEventHandler<HTMLFormElement>;
  handleDeleteGalleryItem: (id: string) => void;
}

export default function GalleryManager({
  galleryTitle, setGalleryTitle,
  galleryDesc, setGalleryDesc,
  galleryCaption, setGalleryCaption,
  galleryPreviews, setGalleryPreviews,
  galleryFiles, setGalleryFiles,
  galleryFileRef,
  addingGallery, setAddingGallery,
  galleryList, setGalleryList,
  galleryLoading,
  handleGalleryFileChange,
  handleAddGalleryItem,
  handleDeleteGalleryItem
}: GalleryManagerProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Form Tambah Item */}
      <div className="portal-card" style={{ padding: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>Unggah Foto Kegiatan Baru (Maks 20 Sekaligus)</h2>

        <form onSubmit={handleAddGalleryItem} style={{ display: "flex", flexFlow: "column", gap: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
              <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Berkas Gambar (Foto, bisa pilih maks 20)</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <input
                  type="file"
                  ref={galleryFileRef}
                  accept="image/*"
                  multiple
                  onChange={handleGalleryFileChange}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={() => galleryFileRef.current?.click()}
                  className="btn-portal-outline"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", width: "100%" }}
                >
                  {galleryFiles.length > 0 ? `${galleryFiles.length} Berkas Foto Terpilih` : "Pilih Berkas Foto..."}
                </button>
                {galleryPreviews.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                    {galleryPreviews.map((src, i) => (
                      <div key={i} style={{ width: "60px", height: "45px", borderRadius: "4px", overflow: "hidden", border: "1px solid var(--color-gray-300)" }}>
                        <img src={src} alt={`Preview ${i+1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                )}
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
  );
}
