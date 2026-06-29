"use client";
import "./Testimonials.css";

import { useMemo } from "react";
import { useSanityQuery } from "@/hooks/useSanityQuery";
import type { Testimonial as SanityTestimonial } from "../../sanity.types";
import { createImageUrlBuilder } from "@sanity/image-url";
import { client as sanityClient } from "@/lib/sanity/client";

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

// Helper untuk membangun URL gambar dari Sanity
const builder = createImageUrlBuilder(sanityClient);
function urlFor(source: any) {
  return builder.image(source);
}

interface Testimonial {
  rating: number;
  text?: string;
  author?: string;
  role?: string;
  avatar?: string | null;
  delay: number;
}

export default function Testimonials() {
  // Menggunakan hook useSanityQuery yang sudah type-safe
  const { data: sanityData, isLoading } = useSanityQuery<SanityTestimonial[]>({
    query: `*[_type == "testimonial"] | order(_createdAt desc)`,
    options: {
      staleTime: 10 * 60 * 1000, // 10 menit
      enabled: !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder",
    }
  });

  // Menggabungkan data dari Sanity dengan data fallback menggunakan useMemo
  const testimonials: Testimonial[] = useMemo(() => {
    if (sanityData && sanityData.length > 0) {
      return sanityData.map((item, index) => ({
        rating: 5, // Asumsi rating 5 untuk data dari Sanity
        text: item.content,
        author: item.name,
        role: item.role || "Siswa",
        avatar: item.avatar ? urlFor(item.avatar).width(96).height(96).quality(80).url() : null,
        delay: (index % 3) * 100,
      }));
    }
    // Jika tidak ada data dari Sanity atau sedang loading, gunakan fallback
    return TESTIMONIALS_FALLBACK;
  }, [sanityData]);

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <h2>Testimoni Siswa di Bobong</h2>
          <p>Apa kata mereka tentang kami</p>
        </div>
        
        {isLoading && <p style={{ textAlign: 'center' }}>Memuat testimoni...</p>}

        {!isLoading && (
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