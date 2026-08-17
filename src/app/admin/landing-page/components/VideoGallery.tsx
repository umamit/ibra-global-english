"use client";

import React, { useState } from "react";

interface Video {
  title: string;
  desc: string;
  url: string;
}

interface VideoGalleryProps {
  videosList: Video[];
  setVideosList: (list: Video[]) => void;
  savingVideos: boolean;
  setSavingVideos: (val: boolean) => void;
  handleSaveVideos: (list: Video[]) => void;
}

export default function VideoGallery({
  videosList,
  setVideosList,
  savingVideos,
  handleSaveVideos,
}: VideoGalleryProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const handleAddAndSaveNewVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) {
      alert("Tautan/URL Video wajib diisi.");
      return;
    }

    const newItem: Video = {
      title: newTitle.trim() || "Dokumentasi Kegiatan Ibra Global English",
      desc: newDesc.trim(),
      url: newUrl.trim(),
    };

    const updated = [newItem, ...videosList];
    setVideosList(updated);
    handleSaveVideos(updated);

    setNewTitle("");
    setNewDesc("");
    setNewUrl("");
  };

  const handleDeleteVideo = (index: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus video ini dari galeri?")) return;
    const updated = videosList.filter((_, i) => i !== index);
    setVideosList(updated);
    handleSaveVideos(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Form Input Video Baru (Cepat & Langsung Simpan) */}
      <div className="portal-card" style={{ padding: "2rem" }}>
        <div style={{ borderBottom: "1px solid var(--color-gray-200)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-primary-dark)" }}>
            + Tambah Video Baru ke Galeri
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", marginTop: "0.25rem" }}>
            Isi tautan video Facebook (Video/Reel) atau YouTube, lalu klik tombol simpan di bawah. Video baru akan langsung tersimpan ke Supabase Database.
          </p>
        </div>

        <form onSubmit={handleAddAndSaveNewVideo} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-700)", marginBottom: "0.35rem" }}>
              Judul Video
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="portal-input"
              placeholder="Contoh: Belajar Ceria Bersama Siswa Kids Program"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-700)", marginBottom: "0.35rem" }}>
              Deskripsi Singkat (Opsional)
            </label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="portal-input"
              rows={2}
              placeholder="Keterangan singkat tentang apa yang dilakukan siswa di video ini"
              style={{ resize: "vertical" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-700)", marginBottom: "0.35rem" }}>
              URL Tautan Video (Facebook / YouTube) <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="portal-input"
              placeholder="Contoh: https://www.facebook.com/watch/?v=XXX atau https://youtu.be/XXX"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={savingVideos}
              className="btn-portal-primary"
              style={{ padding: "0.6rem 1.5rem", fontWeight: "700" }}
            >
              {savingVideos ? "Menyimpan ke Supabase..." : "+ Tambah & Simpan Video Ini"}
            </button>
          </div>
        </form>
      </div>

      {/* Daftar Video Tersimpan dalam Database */}
      <div className="portal-card" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-gray-200)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-gray-900)" }}>
              Daftar Video Tersimpan ({videosList.length} Video)
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginTop: "0.2rem" }}>
              Seluruh video yang saat ini aktif tampil di galeri web publik.
            </p>
          </div>
          {videosList.length > 0 && (
            <button
              type="button"
              onClick={() => handleSaveVideos(videosList)}
              disabled={savingVideos}
              className="btn-portal-outline"
              style={{ fontSize: "0.85rem", padding: "0.4rem 1rem" }}
            >
              {savingVideos ? "Menyimpan Perubahan..." : "Simpan Perubahan Daftar"}
            </button>
          )}
        </div>

        {videosList.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--color-gray-400)", padding: "2rem" }}>
            Belum ada video tersimpan. Gunakan formulir di atas untuk menambahkan video baru.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {videosList.map((vid, idx) => (
              <div
                key={idx}
                style={{
                  padding: "1.25rem",
                  backgroundColor: "var(--color-gray-50)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-gray-200)",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <h4 style={{ fontWeight: "700", color: "var(--color-primary-dark)", margin: 0, fontSize: "0.95rem" }}>
                    Video #{idx + 1}: {vid.title || "Tanpa Judul"}
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleDeleteVideo(idx)}
                    className="btn-portal-danger"
                    style={{ padding: "0.25rem 0.6rem", fontSize: "0.78rem" }}
                  >
                    Hapus Video
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.85rem" }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: "600", color: "var(--color-gray-600)" }}>Judul</label>
                    <input
                      type="text"
                      value={vid.title}
                      onChange={(e) => {
                        const updated = [...videosList];
                        updated[idx].title = e.target.value;
                        setVideosList(updated);
                      }}
                      className="portal-input"
                      style={{ fontSize: "0.88rem", padding: "0.4rem 0.6rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: "600", color: "var(--color-gray-600)" }}>URL Tautan</label>
                    <input
                      type="text"
                      value={vid.url}
                      onChange={(e) => {
                        const updated = [...videosList];
                        updated[idx].url = e.target.value;
                        setVideosList(updated);
                      }}
                      className="portal-input"
                      style={{ fontSize: "0.88rem", padding: "0.4rem 0.6rem" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
