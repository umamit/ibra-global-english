"use client";

import React from "react";

interface TestimonialSubmitModalProps {
  isModalOpen: boolean;
  closeModal: () => void;
  form: {
    author: string;
    role: string;
    rating: number;
    text: string;
  };
  setForm: React.Dispatch<React.SetStateAction<{
    author: string;
    role: string;
    rating: number;
    text: string;
  }>>;
  submitting: boolean;
  submitTestimonial: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export default function TestimonialSubmitModal({
  isModalOpen,
  closeModal,
  form,
  setForm,
  submitting,
  submitTestimonial,
}: TestimonialSubmitModalProps) {
  if (!isModalOpen) return null;

  return (
    <div className="testimonial-modal-backdrop" onClick={closeModal}>
      <div className="testimonial-modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>Kirim Ulasan / Testimoni Anda</h3>
          <button
            type="button"
            onClick={closeModal}
            style={{ background: "none", border: "none", fontSize: "1.1rem", cursor: "pointer", color: "#888" }}
            aria-label="Tutup modal"
          >
            <i className="fi fi-rr-cross"></i>
          </button>
        </div>

        <form onSubmit={submitTestimonial}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.35rem" }}>Nama Lengkap *</label>
            <input
              type="text"
              placeholder="Contoh: Ibu Rina / Ahmad Rifai"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              style={{ width: "100%", padding: "0.7rem", borderRadius: "10px", border: "1px solid #ccc", fontSize: "0.95rem" }}
              required
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.35rem" }}>Status / Peran</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              style={{ width: "100%", padding: "0.7rem", borderRadius: "10px", border: "1px solid #ccc", fontSize: "0.95rem" }}
            >
              <option value="Siswa Active (Teens Program)">Siswa Active (Teens Program)</option>
              <option value="Siswa Active (Kids Program)">Siswa Active (Kids Program)</option>
              <option value="Orang Tua Siswa">Orang Tua Siswa</option>
              <option value="Alumni Ibra Global English">Alumni Ibra Global English</option>
              <option value="Masyarakat / Pengunjung">Masyarakat / Pengunjung</option>
            </select>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.35rem" }}>Rating Penilaian (1 - 5 Bintang)</label>
            <select
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              style={{ width: "100%", padding: "0.7rem", borderRadius: "10px", border: "1px solid #ccc", fontSize: "0.95rem" }}
            >
              <option value={5}>5 Bintang (Sangat Bagus)</option>
              <option value={4}>4 Bintang (Bagus)</option>
              <option value={3}>3 Bintang (Cukup)</option>
            </select>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.35rem" }}>Pengalaman & Ulasan Anda *</label>
            <textarea
              placeholder="Ceritakan pengalaman Anda atau anak Anda selama belajar di Ibra Global English Bobong..."
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              style={{ width: "100%", minHeight: "90px", padding: "0.7rem", borderRadius: "10px", border: "1px solid #ccc", fontSize: "0.95rem", resize: "vertical" }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "0.8rem",
              borderRadius: "9999px",
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
              color: "#fff",
              fontWeight: 700,
              border: "none",
              fontSize: "1rem",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Mengirim..." : "Kirim Ulasan Sekarang"}
          </button>
        </form>
      </div>
    </div>
  );
}
