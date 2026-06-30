"use client";
import "./Testimonials.css";

import { useMemo, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

// Data fallback jika API gagal atau tidak ada data
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

  // Mengambil data ulasan dari Supabase
  useEffect(() => {
    async function fetchSupabaseTestimonials() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) {
          setSupabaseData(data);
        }
      } catch (err) {
        console.error("Gagal memuat testimoni dari Supabase:", err);
      } finally {
        setSupabaseLoading(false);
      }
    }
    fetchSupabaseTestimonials();
  }, []);

  const combinedLoading = supabaseLoading;

  // Menggabungkan data dari Supabase dengan data fallback data statis
  const testimonials: Testimonial[] = useMemo(() => {
    const combined: Testimonial[] = [];

    // 1. Tambah data dari Supabase jika ada
    if (supabaseData && supabaseData.length > 0) {
      supabaseData.forEach((item) => {
        combined.push({
          rating: item.rating || 5,
          text: item.text,
          author: item.author,
          role: item.role || "Siswa/Orang Tua",
          avatar: null, // Testimoni dari DB admin Supabase tidak memiliki foto profil saat ini
          delay: 0,
        });
      });
    }

    // 2. Jika ada ulasan gabungan, beri efek delay AOS berurutan
    if (combined.length > 0) {
      return combined.map((item, index) => ({
        ...item,
        delay: (index % 3) * 100,
      }));
    }

    // Fallback jika sama sekali tidak ada data dari kedua API
    return TESTIMONIALS_FALLBACK;
  }, [supabaseData]);

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <h2>Testimoni Siswa dan Orang Tua di Bobong</h2>
          <p>Apa kata mereka tentang kami</p>
        </div>
        
        {combinedLoading && <p style={{ textAlign: 'center' }}>Memuat testimoni...</p>}
 
        {!combinedLoading && (
          <div className={`testimonials-grid ${testimonials.length < 3 ? 'justify-center-flex' : ''}`}>
          {testimonials.map((t, idx) => (
            <div key={idx} className="testimonial-card" data-aos="fade-up" data-aos-delay={t.delay}>
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
                      width="48"
                      height="48"
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
    </section>
  );
}