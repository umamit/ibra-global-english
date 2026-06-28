"use client";
import "./Hero.css";

import { z } from "zod";
import { useState } from "react";
import Image from "next/image";
import CountUp from "./CountUp";
import posthog from "posthog-js";
import { useQuery } from "@tanstack/react-query";

const heroPropsSchema = z.object({
  initialSettings: z.object({
    hero_title: z.string().optional(),
    hero_subtitle: z.string().optional(),
    hero_desc: z.string().optional(),
    hero_image: z.string().optional(),
  }).optional(),
});

type HeroProps = z.infer<typeof heroPropsSchema>;

/**
 * Fungsi untuk mengambil jumlah siswa dari API.
 */
const fetchStudentCount = async (): Promise<{ count: number }> => {
  const res = await fetch("/api/student-count");
  if (!res.ok) {
    throw new Error("Gagal mengambil data jumlah siswa.");
  }
  const data = await res.json();
  if (typeof data.count !== 'number') {
    throw new Error("Format respons jumlah siswa tidak valid.");
  }
  return data;
};

export default function Hero({ initialSettings }: HeroProps) {
  const [heroTitle, setHeroTitle] = useState(initialSettings?.hero_title || "Kursus di Bobong | Ibra Global English");
  const [heroSubtitle, setHeroSubtitle] = useState(initialSettings?.hero_subtitle || "Belajar Seru | Lancar Bicara");
  const [heroDesc, setHeroDesc] = useState(initialSettings?.hero_desc || "Kursus di Bobong terbaik di Ibra Global English. Kursus bahasa Inggris offline & bimbingan belajar Calistung terbaik di Bobong, Pulau Taliabu. Belajar seru lancar bicara!");
  const [heroImage, setHeroImage] = useState(initialSettings?.hero_image || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect width='100%' height='100%' fill='%23f3f4f6'/><g transform='translate(400, 300)'><rect x='-60' y='-80' width='120' height='90' rx='10' fill='none' stroke='%239ca3af' stroke-width='6'/><circle cx='0' cy='-35' r='20' fill='none' stroke='%239ca3af' stroke-width='6'/><circle cx='40' cy='-65' r='6' fill='%239ca3af'/><text x='0' y='70' font-family='system-ui, sans-serif' font-size='28' font-weight='800' fill='%236b7280' text-anchor='middle'>Belum Ada Foto</text><text x='0' y='110' font-family='system-ui, sans-serif' font-size='18' fill='%239ca3af' text-anchor='middle'>Foto utama akan diperbarui oleh Admin</text></g></svg>");
  
  // Menggunakan useQuery untuk mengambil data jumlah siswa
  const { data: studentData } = useQuery({
    queryKey: ["studentCount"],
    queryFn: fetchStudentCount,
    staleTime: 5 * 60 * 1000, // Data dianggap segar selama 5 menit
    placeholderData: { count: 100 }, // Data default saat loading
  });

  const renderSubtitle = (text) => {
    if (text.includes('|')) {
      const [part1, part2] = text.split('|');
      return (
        <>
          {part1} <span className="highlight-reveal">{part2}</span>
        </>
      );
    }
    return text;
  };

  return (
    <section id="home" className="hero">
      {/* Decorative Parallax Background Elements */}
      <div className="hero-parallax-bg hero-decor-1"></div>
      <div className="hero-parallax-bg hero-decor-2"></div>
      <div className="hero-parallax-bg hero-decor-3"></div>

      <div className="container hero-grid">
        <div className="hero-content" data-aos="fade-right">
          <div className="hero-badge">
            <span>📍 Kursus Bahasa Inggris di Bobong, Pulau Taliabu</span>
          </div>
          <h1>{heroTitle}</h1>
          <p className="hero-subtitle">{renderSubtitle(heroSubtitle)}</p>
          <p className="hero-desc">{heroDesc}</p>
          <div className="hero-actions">
            <a href="#contact" className="btn-primary">Daftar Gratis</a>
            <a href="/placement-test" className="btn-secondary" onClick={() => posthog.capture("hero_placement_test_clicked")}>Ikuti Tes Penempatan</a>
          </div>

          <div className="hero-trilogy">
            <div className="hero-trilogy-item">
              <span className="hero-trilogy-icon">🎉</span>
              <span className="hero-trilogy-label">Belajar Seru</span>
            </div>
            <span className="hero-trilogy-sep">•</span>
            <div className="hero-trilogy-item">
              <span className="hero-trilogy-icon">🗣️</span>
              <span className="hero-trilogy-label">Berani Bicara</span>
            </div>
            <span className="hero-trilogy-sep">•</span>
            <div className="hero-trilogy-item">
              <span className="hero-trilogy-icon">🌍</span>
              <span className="hero-trilogy-label">Siap Mendunia</span>
            </div>
          </div>
        </div>
        
        <div className="hero-image-container" data-aos="fade-left">
          <div className="hero-card">
            <Image 
               src={heroImage} 
               alt="Siswa belajar Bahasa Inggris di Ibra Global English Bobong, Pulau Taliabu" 
               className="hero-img" 
               width={600}
               height={400}
               priority
            />
          </div>
          <div className="hero-stats-badge">
            <div className="badge-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trophy">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 3 0 0 0 12 0V2Z" />
              </svg>
            </div>
            <div className="badge-text">
              <p className="stat-num"><CountUp target={studentData?.count ?? 100} />+</p>
              <p className="stat-desc">Jumlah Siswa</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
