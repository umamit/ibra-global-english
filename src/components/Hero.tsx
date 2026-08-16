"use client";
import "./Hero.css";

import { z } from "zod";
import { useState, useEffect } from "react";
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

const fetchStudentCount = async (): Promise<{ count: number }> => {
  const res = await fetch("/api/student-count");
  if (!res.ok) {
    throw new Error("Gagal mengambil data jumlah siswa.");
  }
  const data = await res.json();
  if (typeof data.count !== "number") {
    throw new Error("Format respons jumlah siswa tidak valid.");
  }
  return data;
};

export default function Hero({ initialSettings }: HeroProps) {
  const heroTitle = initialSettings?.hero_title || "Kursus di Bobong | Ibra Global English";
  const heroSubtitle = initialSettings?.hero_subtitle || "Belajar Seru | Lancar Bicara";
  const heroDesc = initialSettings?.hero_desc || "Kursus di Bobong terbaik di Ibra Global English. Kursus bahasa Inggris offline & bimbingan belajar Calistung terbaik di Bobong, Pulau Taliabu. Belajar seru lancar bicara!";
  const rawHeroImage = initialSettings?.hero_image || "/assets/logo.png";
  
  const [imgError, setImgError] = useState(false);
  const displayImage = imgError ? "/assets/logo.png" : rawHeroImage;

  const { data: studentData } = useQuery({
    queryKey: ["studentCount"],
    queryFn: fetchStudentCount,
    staleTime: 5 * 60 * 1000,
    placeholderData: { count: 100 },
  });

  // Subtle GSAP Parallax Effect (Apple Style)
  useEffect(() => {
    let ctx: any;
    import("gsap").then((gsapModule) => {
      import("gsap/ScrollTrigger").then((stModule) => {
        const gsap = gsapModule.default || gsapModule;
        const ScrollTrigger = stModule.ScrollTrigger || stModule.default;
        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          if (window.innerWidth > 768) {
            gsap.to(".hero-card", {
              yPercent: 12,
              ease: "none",
              scrollTrigger: {
                trigger: ".hero-section",
                start: "top top",
                end: "bottom top",
                scrub: 1.2,
              },
            });

            gsap.to(".hero-stats-badge", {
              yPercent: -25,
              ease: "none",
              scrollTrigger: {
                trigger: ".hero-section",
                start: "top top",
                end: "bottom top",
                scrub: 1.5,
              },
            });
          }
        });
      });
    });

    return () => ctx && ctx.revert();
  }, []);

  const renderSubtitle = (text: string) => {
    if (text.includes("|")) {
      const [part1, part2] = text.split("|");
      return (
        <>
          {part1} <span className="highlight-reveal">{part2}</span>
        </>
      );
    }
    return text;
  };

  return (
    <section id="home" className="hero hero-section">
      {/* Decorative Parallax Background Elements */}
      <div className="hero-parallax-bg hero-decor-1"></div>
      <div className="hero-parallax-bg hero-decor-2"></div>
      <div className="hero-parallax-bg hero-decor-3"></div>

      <div className="container hero-grid">
        <div className="hero-content scroll-fade-right" data-aos-delay="0">
          <div className="hero-badge">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>Kursus Bahasa Inggris di Bobong, Pulau Taliabu</span>
            </span>
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
              <span className="hero-trilogy-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              </span>
              <span className="hero-trilogy-label">Building Confident English Communicators.</span>
            </div>
          </div>
        </div>

        <div className="hero-image-container scroll-fade-left">
          <div className="hero-card">
            <Image
              src={displayImage}
              alt="Husnita Usman, M.Pd., Direktur & Pendiri Ibra Global English Bobong"
              className="hero-img"
              width={600}
              height={480}
              priority
              onError={() => setImgError(true)}
            />
            <div className="hero-director-overlay">
              <span className="hero-director-name">Husnita Usman, M.Pd.</span>
              <span className="hero-director-title">Direktur & Pendiri Ibra Global English</span>
            </div>
          </div>
          <div className="hero-stats-badge">
            <div className="badge-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="badge-text">
              <div className="stat-num">
                <CountUp target={studentData?.count || 100} />+
              </div>
              <div className="stat-desc">Siswa Terdaftar</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
