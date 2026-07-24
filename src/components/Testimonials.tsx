"use client";

import React, { useMemo, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import "./Testimonials.css";

const TESTIMONIALS_FALLBACK = [
  {
    rating: 5,
    text: "Sangat senang menyekolahkan anak saya di Ibra Global English Bobong. Metodenya seru dan interaktif, anak saya sekarang jadi rajin belajar dan berani berbicara bahasa Inggris sehari-hari!",
    author: "Bapak Andi",
    role: "Orang Tua Siswa (Kids Program)",
    delay: 0,
  },
  {
    rating: 5,
    text: "Tutor di sini asyik dan sabar banget. Dulu saya selalu minder kalau disuruh bicara bahasa Inggris, tapi setelah bergabung di Teens Program, sekarang saya jadi jauh lebih percaya diri berbicara di depan kelas.",
    author: "Rania",
    role: "Siswa SMP (Teens Program)",
    delay: 100,
  },
  {
    rating: 5,
    text: "Program Fun Calistung-nya sangat direkomendasikan untuk anak usia dini. Metode belajarnya santai, penuh gambar warna-warni, sehingga anak saya cepat paham membaca dan menulis tanpa merasa tertekan.",
    author: "Ibu Fitri",
    role: "Orang Tua Siswa (Fun Calistung)",
    delay: 200,
  }
];

interface Testimonial {
  rating: number;
  text?: string;
  author?: string;
  role?: string;
  avatar?: string | null;
  delay: number;
}

export default function Testimonials() {
  const [supabaseData, setSupabaseData] = useState<any[]>([]);
  const [supabaseLoading, setSupabaseLoading] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ msg: string; type: "success" | "error" }>({ msg: "", type: "success" });

  const [form, setForm] = useState({
    author: "",
    role: "Siswa / Alumni",
    rating: 5,
    text: "",
  });

  const fetchSupabaseTestimonials = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setSupabaseData(data);
      }
    } catch (err) {
      console.error("Gagal memuat testimoni dari Supabase:", err);
    } finally {
      setSupabaseLoading(false);
    }
  };

  useEffect(() => {
    fetchSupabaseTestimonials();
  }, []);

  const testimonials: Testimonial[] = useMemo(() => {
    const combined: Testimonial[] = [];

    if (supabaseData && supabaseData.length > 0) {
      supabaseData.forEach((item) => {
        combined.push({
          rating: item.rating || 5,
          text: item.text,
          author: item.author,
          role: item.role || "Siswa/Orang Tua",
          avatar: item.avatar || null,
          delay: 0,
        });
      });
    }

    if (combined.length > 0) {
      return combined.map((item, index) => ({
        ...item,
        delay: (index % 3) * 100,
      }));
    }

    return TESTIMONIALS_FALLBACK;
  }, [supabaseData]);

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author.trim() || !form.text.trim()) {
      alert("Mohon lengkapi Nama Anda dan Pesan Ulasan.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      if (res.ok) {
        setToastMsg({
          msg: "Terima kasih! Ulasan Anda telah terkirim dan akan ditinjau oleh Admin sebelum ditayangkan.",
          type: "success",
        });
        setForm({ author: "", role: "Siswa / Alumni", rating: 5, text: "" });
        setIsModalOpen(false);
        setTimeout(() => setToastMsg({ msg: "", type: "success" }), 5000);
      } else {
        alert(result.error || "Gagal mengirim ulasan.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="container">
        {/* Header Group with Submit Button */}
        <div className="testimonials-header-group">
          <div className="section-header" style={{ marginBottom: 0, textAlign: "left" }}>
            <h2>Testimoni Siswa dan Orang Tua di Bobong</h2>
            <p>Apa kata mereka tentang kami</p>
          </div>

          <button
            type="button"
            className="submit-testimonial-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            + Kirim Ulasan / Testimoni Anda
          </button>
        </div>

        {/* Toast Alert */}
        {toastMsg.msg && (
          <div style={{ padding: "1rem 1.25rem", borderRadius: "12px", background: "#d1e7dd", color: "#0f5132", marginBottom: "2rem", fontSize: "0.95rem", fontWeight: 600 }}>
            ✓ {toastMsg.msg}
          </div>
        )}

        {supabaseLoading && <p style={{ textAlign: 'center' }}>Memuat testimoni...</p>}

        {!supabaseLoading && (
          <div className={`testimonials-grid ${testimonials.length < 3 ? 'justify-center-flex' : ''}`}>
            {testimonials.map((t, idx) => (
              <div key={idx} className="testimonial-card">
                <div className="testimonial-rating">
                  {[...Array(t.rating)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  ))}
                </div>
                <p className="testimonial-text">{t.text ? `“${t.text}”` : ""}</p>
                <div className="testimonial-author">
                  <div className="author-avatar-wrapper">
                    {t.avatar ? (
                      <img 
                        src={t.avatar} 
                        alt={t.author} 
                        className="author-avatar-img" 
                        width="44"
                        height="44"
                        loading="lazy"
                      />
                    ) : (
                      <div className="author-avatar-placeholder">
                        {t.author?.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="author-info">
                    <p className="author-name">{t.author}</p>
                    <p className="author-role">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Pop-up Kirim Testimoni Publik */}
      {isModalOpen && (
        <div className="testimonial-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="testimonial-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>Kirim Ulasan / Testimoni Anda</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: "#888" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTestimonial}>
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
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang - Sangat Bagus)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Bintang - Bagus)</option>
                  <option value={3}>⭐⭐⭐ (3 Bintang - Cukup)</option>
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
      )}
    </section>
  );
}