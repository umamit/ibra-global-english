"use client";

import { useState, useEffect } from "react";
import { createClient } from "../utils/supabase/client";

const GALLERY_DATA = [
  {
    title: "Kids Interactive Study",
    desc: "Belajar seru melalui aktivitas kelompok",
    thumb: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop",
    full: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1000&auto=format&fit=crop",
    caption: "Kegiatan Belajar Kelompok Anak-Anak",
    delay: 0,
    alt: "Anak-anak belajar berkelompok dengan menyenangkan"
  },
  {
    title: "Speaking Practice Session",
    desc: "Membangun kepercayaan diri berbicara di depan umum",
    thumb: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop",
    full: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop",
    caption: "Latihan Percakapan (Speaking Practice) Kelas Dewasa",
    delay: 100,
    alt: "Siswa kelas dewasa sedang berlatih percakapan"
  },
  {
    title: "Experienced Teaching",
    desc: "Materi disampaikan dengan metode yang mudah dipahami",
    thumb: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&auto=format&fit=crop",
    full: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1000&auto=format&fit=crop",
    caption: "Penjelasan Materi oleh Experienced Teacher",
    delay: 200,
    alt: "Pengajar menjelaskan materi di papan tulis"
  },
  {
    title: "Fun Classroom Games",
    desc: "Belajar aktif tanpa rasa bosan",
    thumb: "/assets/fun_classroom_games.jpg",
    full: "/assets/fun_classroom_games.jpg",
    caption: "Aktivitas Games & Kuis Interaktif",
    delay: 300,
    alt: "Siswa tersenyum gembira saat mengikuti kuis"
  },
  {
    title: "Interactive Study Group",
    desc: "Kolaborasi aktif antar siswa dalam memecahkan soal",
    thumb: "/assets/interactive_study_group.jpg",
    full: "/assets/interactive_study_group.jpg",
    caption: "Suasana Belajar Kelompok di Kelas",
    delay: 400,
    alt: "Siswa belajar bersama dengan ceria"
  },
  {
    title: "Teens Project Discussion",
    desc: "Meningkatkan kemampuan tata bahasa dan menulis bersama",
    thumb: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop",
    full: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000&auto=format&fit=crop",
    caption: "Diskusi Kelompok Kelas Teens Program",
    delay: 500,
    alt: "Siswa remaja sedang berdiskusi kelompok"
  }
];

export default function Gallery({ onOpenLightbox }) {
  const supabase = createClient();
  const [galleryItems, setGalleryItems] = useState(GALLERY_DATA);
  const [activeIndex, setActiveIndex] = useState(0);

  // Touch swiping states
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  useEffect(() => {
    async function fetchGallery() {
      try {
        const { data, error } = await supabase
          .from('gallery')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          const mappedData = data.map((item, index) => ({
            title: item.title,
            desc: item.description || "",
            thumb: item.image_url,
            full: item.image_url,
            caption: item.caption || item.title,
            delay: (index % 6) * 100,
            alt: item.caption || item.title
          }));
          setGalleryItems(mappedData);
        }
      } catch (e) {
        console.warn("Gagal memuat galeri dari database. Menggunakan data default (statis).", e);
      }
    }
    fetchGallery();
  }, []);

  const handleNext = () => {
    setGalleryItems((items) => {
      if (items.length <= 1) return items;
      setActiveIndex((prev) => (prev + 1) % items.length);
      return items;
    });
  };

  const handlePrev = () => {
    setGalleryItems((items) => {
      if (items.length <= 1) return items;
      setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
      return items;
    });
  };

  // Autoplay effect
  useEffect(() => {
    if (galleryItems.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % galleryItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [galleryItems.length]);

  const handleCardClick = (idx) => {
    if (idx === activeIndex) {
      onOpenLightbox(galleryItems[idx].full, galleryItems[idx].caption);
    } else {
      setActiveIndex(idx);
    }
  };

  // Touch gesture handlers
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  return (
    <section id="gallery" className="gallery-section">
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <h2>Galeri Kegiatan Kami di Bobong</h2>
          <p>Melihat lebih dekat keseruan belajar bahasa Inggris di Ibra Global English Bobong</p>
        </div>

        <div className="gallery-stack-wrapper" data-aos="fade-up">
          <div 
            className="gallery-stack-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {galleryItems.map((item, idx) => {
              // Calculate relative offset in circular stack
              let offset = idx - activeIndex;
              if (offset < 0) offset += galleryItems.length;

              let cardStyle = {};
              if (offset === 0) {
                // Top Card
                cardStyle = {
                  transform: "translate3d(0, 0, 0) scale(1)",
                  zIndex: 10,
                  opacity: 1,
                  pointerEvents: "auto",
                };
              } else if (offset === 1) {
                // Second Card
                cardStyle = {
                  transform: "translate3d(0, 15px, -15px) scale(0.95)",
                  zIndex: 9,
                  opacity: 0.85,
                  pointerEvents: "auto",
                };
              } else if (offset === 2) {
                // Third Card
                cardStyle = {
                  transform: "translate3d(0, 30px, -30px) scale(0.9)",
                  zIndex: 8,
                  opacity: 0.65,
                  pointerEvents: "auto",
                };
              } else {
                // Hidden Cards behind
                cardStyle = {
                  transform: "translate3d(0, 45px, -45px) scale(0.85)",
                  zIndex: 1,
                  opacity: 0,
                  pointerEvents: "none",
                };
              }

              return (
                <div 
                  key={idx}
                  className="gallery-stack-card"
                  style={cardStyle}
                  onClick={() => handleCardClick(idx)}
                >
                  <div className="gallery-card-image-wrap">
                    <img src={item.thumb} alt={item.alt} />
                    <div className="gallery-card-overlay">
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {galleryItems.length > 1 && (
            <div className="gallery-controls-row">
              <button className="gallery-arrow-btn prev" onClick={handlePrev} aria-label="Foto Sebelumnya">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
              <div className="gallery-dots">
                {galleryItems.map((_, idx) => (
                  <span 
                    key={idx} 
                    className={`gallery-dot ${idx === activeIndex ? "active" : ""}`}
                    onClick={() => setActiveIndex(idx)}
                  />
                ))}
              </div>
              <button className="gallery-arrow-btn next" onClick={handleNext} aria-label="Foto Selanjutnya">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
