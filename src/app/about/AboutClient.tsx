"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialFloat from "@/components/SocialFloat";
import AIChatWidget from "@/components/AIChatWidget";
import MarqueeBanner from "@/components/MarqueeBanner";
import AboutStaticSections from "./AboutStaticSections";
import { createClient } from "@/utils/supabase/client";
import "./about.css";

interface Tutor { id: string; name: string; role: string; bio: string; image_url: string; }

const getInitials = (name: string) => name.split(" ").map(n => n[0]).slice(0, 2).join("");

export default function AboutPage() {
  const mainRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const initialTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTimeout(() => setTheme(initialTheme === "dark" ? "dark" : "light"), 0);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth <= 768 || loading) return;
    let ctx: any;
    import("gsap").then(({ default: gsap }) => {
      import("gsap/ScrollTrigger").then((stModule) => {
        const ScrollTrigger = stModule.ScrollTrigger || stModule.default;
        gsap.registerPlugin(ScrollTrigger);
        if (!mainRef.current) return;
        ctx = gsap.context(() => {
          mainRef.current?.querySelectorAll(".about-value-card, .tutor-card")?.forEach((card, idx) => {
            gsap.fromTo(card, { y: 20 }, { y: idx % 2 === 0 ? -20 : -10, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 1.2 } });
          });
        }, mainRef);
      });
    });
    return () => { if (ctx) ctx.revert(); };
  }, [loading, tutors]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next); document.documentElement.setAttribute("data-theme", next); localStorage.setItem("theme", next);
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data, error } = await supabase.from("tutors").select("id, name, role, bio, image_url").eq("is_active", true).order("display_order", { ascending: true });
        if (error) throw error;
        if (isMounted) setTutors(data && data.length > 0 ? (data as Tutor[]) : []);
      } catch { if (isMounted) setTutors([]); } finally { if (isMounted) setLoading(false); }
    })();
    return () => { isMounted = false; };
  }, [supabase]);

  return (
    <>
      <Header theme={theme} toggleTheme={toggleTheme} hasMarquee={true} />
      <MarqueeBanner />
      <main className="about-main" ref={mainRef}>
        <section className="about-hero-section reveal">
          <div className="about-container text-center">
            <h1>Tentang Kami</h1>
            <p>Ibra Global English Bobong berkomitmen untuk menghadirkan bimbingan kursus Bahasa Inggris berkualitas premium dan bimbingan Calistung (Membaca, Menulis, Berhitung) yang interaktif, menyenangkan, dan berpusat pada perkembangan rasa percaya diri anak di Pulau Taliabu.</p>
          </div>
        </section>

        <AboutStaticSections />

        {(loading || tutors.length > 0) && (
          <section className="about-tutors-section reveal">
            <div className="about-container">
              <h2 className="section-title">Tim Pengajar Kami</h2>
              {loading ? (
                <div className="tutors-grid">{[1, 2, 3].map(i => <div key={i} className="tutor-card skeleton-pulse" style={{ height: "350px", borderRadius: "18px" }}></div>)}</div>
              ) : (
                <div className="tutors-grid">
                  {tutors.map(tutor => (
                    <div key={tutor.id} className="tutor-card">
                      <div className="tutor-image-container">
                        {tutor.image_url ? <img src={tutor.image_url} alt={`Foto ${tutor.name}`} className="tutor-img" loading="lazy" /> : <div className="tutor-avatar-placeholder" aria-hidden="true">{getInitials(tutor.name)}</div>}
                      </div>
                      <div className="tutor-info"><h3>{tutor.name}</h3><span className="tutor-role">{tutor.role}</span><p className="tutor-bio">{tutor.bio || "Tutor berpengalaman di Ibra Global English."}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
      <Footer />
      <SocialFloat />
      <AIChatWidget />
    </>
  );
}
