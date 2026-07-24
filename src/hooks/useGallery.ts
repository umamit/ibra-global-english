import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

export const GALLERY_FALLBACK = [
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

async function fetchGallery() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;

  if (data && data.length > 0) {
    return data.map((item, index) => ({
      title: item.title,
      desc: item.description || "",
      thumb: item.image_url,
      full: item.image_url,
      caption: item.caption || item.title,
      delay: (index % 6) * 100,
      alt: item.caption || item.title
    }));
  }

  return [];
}

export function useGallery(onOpenLightbox?: (src: string, caption: string) => void) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const { data: galleryItems = GALLERY_FALLBACK } = useQuery({
    queryKey: ['gallery'],
    queryFn: fetchGallery,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const minSwipeDistance = 50;

  const handleNext = () => {
    if (galleryItems.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % galleryItems.length);
  };

  const handlePrev = () => {
    if (galleryItems.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

  const handleCardClick = (idx: number) => {
    if (idx === activeIndex) {
      if (onOpenLightbox) {
        onOpenLightbox(galleryItems[idx].full, galleryItems[idx].caption);
      }
    } else {
      setActiveIndex(idx);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
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

  return {
    galleryItems,
    activeIndex,
    setActiveIndex,
    handleNext,
    handlePrev,
    handleCardClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
