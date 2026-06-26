"use client";
import "./Testimonials.css";

import { createClient } from "../utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
  const supabase = createClient();
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  if (data && data.length > 0) {
    return data.map((item, index) => ({
      rating: item.rating || 5,
      text: item.text,
      author: item.author,
      role: item.role,
      delay: (index % 3) * 100
    }));
  }

  return null;
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
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <p className="author-name">{t.author}</p>
                <p className="author-role">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}