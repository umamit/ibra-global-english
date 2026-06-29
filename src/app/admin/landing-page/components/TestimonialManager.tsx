"use client";

import React from "react";
import Link from "next/link";

import { Testimonial } from "@/types";

interface TestimonialManagerProps {
  editingTestimonialId: string | null;
  setEditingTestimonialId: (id: string | null) => void;
  author: string;
  setAuthor: (val: string) => void;
  role: string;
  setRole: (val: string) => void;
  rating: number;
  setRating: (val: number) => void;
  testimonialText: string;
  setTestimonialText: (val: string) => void;
  savingTestimonial: boolean;
  setSavingTestimonial: (val: boolean) => void;
  testimonialsList: Testimonial[];
  setTestimonialsList: (list: Testimonial[]) => void;
  testimonialsLoading: boolean;
  handleSaveTestimonial: React.FormEventHandler<HTMLFormElement>;
  handleCancelEditTestimonial: () => void;
  handleEditTestimonialClick: (t: Testimonial) => void;
  handleDeleteTestimonial: (id: string) => void;
}

export default function TestimonialManager({
  editingTestimonialId, setEditingTestimonialId,
  author, setAuthor,
  role, setRole,
  rating, setRating,
  testimonialText, setTestimonialText,
  savingTestimonial, setSavingTestimonial,
  testimonialsList, setTestimonialsList,
  testimonialsLoading,
  handleSaveTestimonial,
  handleCancelEditTestimonial,
  handleEditTestimonialClick,
  handleDeleteTestimonial
}: TestimonialManagerProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      {/* Notifikasi Sanity Studio */}
      <div style={{
        padding: "1rem 1.25rem",
        background: "var(--color-primary-light, #e0f2fe)",
        borderRadius: "8px",
        borderLeft: "4px solid var(--color-primary, #0284c7)",
        color: "var(--color-primary-dark, #0369a1)",
        fontSize: "0.85rem",
        lineHeight: 1.5,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem"
      }}>
        <span>💡</span>
        <div>
          <strong>Info Integrasi CMS:</strong> Anda sekarang juga dapat mengelola testimoni menggunakan <strong><Link href="/studio" style={{ textDecoration: "underline", color: "inherit", fontWeight: "bold" }}>Sanity Studio di sini</Link></strong> untuk pemuatan data yang lebih cepat dan manajemen aset yang terpusat. Website utama akan otomatis mengutamakan data dari Sanity.
        </div>
      </div>

      {/* Form Testimoni */}
      <div className="portal-card" style={{ padding: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>
          {editingTestimonialId ? "Sunting Ulasan Testimoni" : "Tambah Ulasan Testimoni Baru"}
        </h2>

        <form onSubmit={handleSaveTestimonial} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>

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
                      &ldquo;{t.text}&rdquo;
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
  );
}
