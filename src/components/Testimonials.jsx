"use client";
import "./Testimonials.css";

import { createClient } from "../utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/sanity/client";

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

async function fetchTestimonials() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const useSanity = projectId && projectId !== "placeholder" && projectId !== "";
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

  let sanityData = [];
  if (useSanity) {
    try {
      const data = await client.fetch(`*[_type == "testimonial"] | order(_createdAt desc)`);
      if (data && data.length > 0) {
        sanityData = data.map((item) => {
          let avatarUrl = null;
          if (item.avatar?.asset?._ref) {
            const parts = item.avatar.asset._ref.split('-');
            if (parts.length >= 4) {
              const assetId = parts[1];
              const dimensions = parts[2];
              const extension = parts[3];
              avatarUrl = `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetId}-${dimensions}.${extension}`;
            }
          }
          return {
            rating: 5,
            text: item.content,
            author: item.name,
            role: item.role || item.program || "Siswa",
            avatar: avatarUrl,
          };
        });
      }
    } catch (err) {
      console.warn("Failed to fetch testimonials from Sanity:", err);
    }
  }

  let supabaseData = [];
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data && data.length > 0) {
      supabaseData = data.map((item) => ({
        rating: item.rating || 5,
        text: item.text,
        author: item.author,
        role: item.role,
        avatar: null,
      }));
    }
  } catch (err) {
    console.warn("Failed to fetch testimonials from Supabase:", err);
  }

  // Combine testimonials from both sources
  const combined = [...sanityData, ...supabaseData];

  if (combined.length === 0) {
    return null;
  }

  // Map to add delay animation property
  return combined.map((item, index) => ({
    ...item,
    delay: (index % 3) * 100
  }));
}


export default function Testimonials() {
  const { data: testimonials = TESTIMONIALS_FALLBACK } = useQuery({
    queryKey: ['testimonials'],
    queryFn: fetchTestimonials,
    staleTime: 10 * 60 * 1000, // 10 menit
    retry: 1,
  });

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <h2>Testimoni Siswa di Bobong</h2>
          <p>Apa kata mereka tentang kami</p>
        </div>
        
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
              <p className="testimonial-text">&ldquo;{t.text}&rdquo;</p>
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
                      {t.author.substring(0, 2).toUpperCase()}
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
      </div>
    </section>
  );
}