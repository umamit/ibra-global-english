"use client";
import "./Hero.css";

import { z } from "zod";
import { useState } from "react";
import Image from "next/image";
import CountUp from "./CountUp";
import posthog from "posthog-js";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";

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
  const [heroImage, setHeroImage] = useState(initialSettings?.hero_image || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><defs><linearGradient id='tealGold' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%231a5765'/><stop offset='50%' stop-color='%23216c7e'/><stop offset='100%' stop-color='%23A68849'/></linearGradient><linearGradient id='glowGrad' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23ffffff' stop-opacity='0.25'/><stop offset='100%' stop-color='%23ffffff' stop-opacity='0'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23tealGold)'/><circle cx='150' cy='150' r='300' fill='url(%23glowGrad)'/><circle cx='650' cy='450' r='200' fill='url(%23glowGrad)'/><g transform='translate(400, 300)' text-anchor='middle'><path d='M-30 -50 L30 -50 L45 -20 L-45 -20 Z' fill='%23ffffff' opacity='0.9'/><circle cx='0' cy='-15' r='18' fill='%23A68849'/><circle cx='0' cy='-15' r='12' fill='%23ffffff'/><path d='M-10 15 L10 15 L20 40 L-20 40 Z' fill='%23ffffff' opacity='0.95'/><text x='0' y='95' font-family='system-ui, -apple-system, BlinkMacSystemFont, sans-serif' font-size='32' font-weight='900' fill='%23ffffff' letter-spacing='-0.02em'>Ibra Global English</text><text x='0' y='130' font-family='system-ui, -apple-system, BlinkMacSystemFont, sans-serif' font-size='16' font-weight='600' fill='%23eef6f8' opacity='0.85' letter-spacing='0.05em'>BELAJAR SERU • LANCAR BICARA</text></g><path d='M100 100 L115 115 M115 100 L100 115' stroke='%23ffffff' stroke-width='4' opacity='0.3'/><path d='M700 120 L710 130 M710 120 L700 130' stroke='%23ffffff' stroke-width='3' opacity='0.3'/><circle cx='680' cy='220' r='5' fill='%23ffffff' opacity='0.4'/><circle cx='120' cy='480' r='8' fill='%23ffffff' opacity='0.3'/></svg>");
  
  // Menggunakan useQuery untuk mengambil data jumlah siswa
  const { data: studentData } = useQuery({
    queryKey: ["studentCount"],
    queryFn: fetchStudentCount,
    staleTime: 5 * 60 * 1000, // Data dianggap segar selama 5 menit
    placeholderData: { count: 100 }, // Data default saat loading
  });

  const renderSubtitle = (text: string) => {
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
            <Button href="#contact" variant="primary">Daftar Gratis</Button>
            <Button href="/placement-test" variant="secondary" onClick={() => posthog.capture("hero_placement_test_clicked")}>Ikuti Tes Penempatan</Button>
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
