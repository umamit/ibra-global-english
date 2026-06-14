"use client";

import { useState, useEffect } from "react";
import { createClient } from "../utils/supabase/client";
import CountUp from "./CountUp";

export default function Hero() {
  const supabase = createClient();
  const [heroTitle, setHeroTitle] = useState("Ibra Global English Bobong");
  const [heroSubtitle, setHeroSubtitle] = useState("Belajar Seru | Lancar Bicara");
  const [heroDesc, setHeroDesc] = useState("Kursus bahasa Inggris offline terbaik di Bobong, Pulau Taliabu. Dengan metode pembelajaran yang menyenangkan dan efektif untuk tingkatkan kemampuan speaking Anda bersama tutor berpengalaman!");
  const [heroImage, setHeroImage] = useState("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect width='100%' height='100%' fill='%23f3f4f6'/><g transform='translate(400, 300)'><rect x='-60' y='-80' width='120' height='90' rx='10' fill='none' stroke='%239ca3af' stroke-width='6'/><circle cx='0' cy='-35' r='20' fill='none' stroke='%239ca3af' stroke-width='6'/><circle cx='40' cy='-65' r='6' fill='%239ca3af'/><text x='0' y='70' font-family='system-ui, sans-serif' font-size='28' font-weight='800' fill='%236b7280' text-anchor='middle'>Belum Ada Foto</text><text x='0' y='110' font-family='system-ui, sans-serif' font-size='18' fill='%239ca3af' text-anchor='middle'>Foto utama akan diperbarui oleh Admin</text></g></svg>");
  const [studentCount, setStudentCount] = useState(100);

  useEffect(() => {
    async function fetchHeroSettings() {
      try {
        const { data, error } = await supabase
          .from('landing_settings')
          .select('key, value');
        if (error) throw error;
        if (data && data.length > 0) {
          const settings = {};
          data.forEach(item => {
            settings[item.key] = item.value;
          });
          if (settings.hero_title) setHeroTitle(settings.hero_title);
          if (settings.hero_subtitle) setHeroSubtitle(settings.hero_subtitle);
          if (settings.hero_desc) setHeroDesc(settings.hero_desc);
          if (settings.hero_image) setHeroImage(settings.hero_image);
        }
      } catch (e) {
        console.warn("Gagal memuat pengaturan hero dari database. Menggunakan data default (statis).", e);
      }
    }

    async function fetchStudentCount() {
      try {
        const res = await fetch("/api/student-count");
        if (res.ok) {
          const data = await res.json();
          if (typeof data.count === "number") {
            setStudentCount(data.count);
          }
        }
      } catch (e) {
        console.warn("Gagal mengambil jumlah siswa dari API. Menggunakan data default.", e);
      }
    }

    fetchHeroSettings();
    fetchStudentCount();
  }, []);

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
          <h2>{heroTitle}</h2>
          <p className="hero-subtitle">{renderSubtitle(heroSubtitle)}</p>
          <p className="hero-desc">{heroDesc}</p>
          <div className="hero-actions">
            <a href="#contact" className="btn-primary">Daftar Gratis</a>
            <a href="/placement-test" className="btn-secondary">Ikuti Tes Penempatan</a>
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
            <img 
               src={heroImage} 
               alt="Siswa belajar Bahasa Inggris di Ibra Global English Bobong, Pulau Taliabu" 
               className="hero-img" 
               width={600}
               height={400}
               fetchPriority="high" 
               loading="eager"
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
              <p className="stat-num"><CountUp target={studentCount} />+</p>
              <p className="stat-desc">Jumlah Siswa</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
