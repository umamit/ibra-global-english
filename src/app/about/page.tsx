"use client";

import React from 'react';
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialFloat from "@/components/SocialFloat";
import AIChatWidget from "@/components/AIChatWidget";
import MarqueeBanner from "@/components/MarqueeBanner";
import { createClient } from "@/utils/supabase/client";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import "./about.css";

interface Tutor {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
}


export default function AboutPage() {
  const supabase = createClient();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useScrollReveal();

  // Handle theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

    setTimeout(() => {
      setTheme(initialTheme === "dark" ? "dark" : "light");
    }, 0);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  // Fetch tutors from Supabase database
  useEffect(() => {
    let isMounted = true;
    async function fetchTutors() {
      try {
        const { data, error } = await supabase
          .from("tutors")
          .select("id, name, role, bio, image_url")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) throw error;

        if (isMounted) {
          if (data && data.length > 0) {
            setTutors(data as Tutor[]);
          } else {
            setTutors([]);
          }
        }
      } catch (err) {
        console.warn("Gagal memuat data tutor dari database:", err);
        if (isMounted) {
          setTutors([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchTutors();
    return () => {
      isMounted = false;
    };
  }, [supabase]);

  // Helper to render initials as a clean placeholder for tutor photos
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("");
  };

  return (
    <>
      <Header theme={theme} toggleTheme={toggleTheme} hasMarquee={true} />
      <MarqueeBanner />

      <main className="about-wrapper">
        
        {/* 1. Hero Section */}
        <section className="about-hero-section reveal">
          <div className="about-container text-center">
            <h1>Tentang Kami</h1>
            <p>
              Ibra Global English Bobong berkomitmen untuk menghadirkan bimbingan kursus Bahasa Inggris berkualitas premium dan bimbingan Calistung (Membaca, Menulis, Berhitung) yang interaktif, menyenangkan, dan berpusat pada perkembangan rasa percaya diri anak di Pulau Taliabu.
            </p>
          </div>
        </section>

        {/* 2. Visi & Misi Section (Soft Teal Background) */}
        <section className="about-vision-mission-section reveal">
          <div className="about-container">
            <div className="about-vision-mission">
              <div className="vision-card">
                <span className="card-icon" aria-hidden="true">👁️‍🗨️</span>
                <h2>Visi Kami</h2>
                <p>
                  Menjadi pusat bimbingan pendidikan non-formal terdepan di Pulau Taliabu yang mampu melahirkan generasi muda yang cerdas, kreatif, berakhlak mulia, serta fasih berkomunikasi secara aktif dalam Bahasa Inggris untuk siap bersaing di kancah global.
                </p>
              </div>

              <div className="mission-card">
                <span className="card-icon" aria-hidden="true">🎯</span>
                <h2>Misi Kami</h2>
                <ul>
                  <li>Menyelenggarakan kursus Bahasa Inggris dengan metode belajar sambil bermain (*fun learning method*) bebas tekanan.</li>
                  <li>Menyediakan program bimbingan membaca, menulis, dan berhitung yang terstruktur dan ramah anak.</li>
                  <li>Melatih kemampuan berdiskusi dan berbicara aktif (*Speaking-First*) siswa sejak pertemuan pertama.</li>
                  <li>Memfasilitasi pemantauan hasil belajar secara terbuka bagi orang tua melalui laporan berkala.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Core Values Section (White Background) */}
        <section className="about-values-section reveal">
          <div className="about-container">
            <h2 className="section-title">Nilai-Nilai Utama Kami</h2>
            <div className="values-grid">
              <div className="value-card">
                <span className="value-icon" aria-hidden="true">🤝</span>
                <h3>Child-Friendly Method</h3>
                <p>Pembelajaran dirancang khusus tanpa tekanan akademis berlebih untuk merawat kesehatan mental dan kreativitas anak.</p>
              </div>

              <div className="value-card">
                <span className="value-icon" aria-hidden="true">🗣️</span>
                <h3>Speaking-First Approach</h3>
                <p>Mendorong siswa aktif berbicara bahasa Inggris minimal 70% dari waktu pertemuan di kelas untuk melatih mental berbicara sejak dini.</p>
              </div>

              <div className="value-card">
                <span className="value-icon" aria-hidden="true">🎓</span>
                <h3>Attention to Detail</h3>
                <p>Kapasitas kelas dibatasi maksimal 10 siswa agar pengajar dapat fokus memberikan perhatian personal ke setiap individu secara adil.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3.5. Legalitas & Badan Hukum Section */}
        <section className="about-legal-section reveal">
          <div className="about-container">
            <h2 className="section-title">Legalitas & Badan Hukum</h2>
            <div className="about-legal-card">
              <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--color-gray-200)", paddingBottom: "1rem" }}>
                <img src="/assets/logo.png" alt="Logo PT. Ibra Global English" style={{ width: "50px", height: "50px", objectFit: "contain", marginRight: "1.25rem" }} />
                <div>
                  <h3 style={{ margin: "0", fontSize: "1.35rem", fontWeight: "700", color: "var(--color-gray-900)" }}>PT. Ibra Global English</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--color-primary-dark)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>Perseroan Perorangan</p>
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <p style={{ margin: "0", fontSize: "0.75rem", color: "var(--color-gray-400)", fontWeight: "bold", textTransform: "uppercase" }}>Nomor SK Pendirian Kemenkumham</p>
                  <p style={{ margin: "2px 0 0", fontSize: "1rem", color: "var(--color-gray-800)", fontWeight: "600" }}>AHU-A096371.AH.01.30.Tahun 2026</p>
                </div>
                <div>
                  <p style={{ margin: "0", fontSize: "0.75rem", color: "var(--color-gray-400)", fontWeight: "bold", textTransform: "uppercase" }}>Nomor Induk Berusaha (NIB)</p>
                  <p style={{ margin: "2px 0 0", fontSize: "1rem", color: "var(--color-gray-800)", fontWeight: "600" }}>2806230044842</p>
                </div>
                <div>
                  <p style={{ margin: "0", fontSize: "0.75rem", color: "var(--color-gray-400)", fontWeight: "bold", textTransform: "uppercase" }}>Nomor Pokok Wajib Pajak (NPWP)</p>
                  <p style={{ margin: "2px 0 0", fontSize: "1rem", color: "var(--color-gray-800)", fontWeight: "600" }}>1000 0000 0996 6538</p>
                </div>
                <div>
                  <p style={{ margin: "0", fontSize: "0.75rem", color: "var(--color-gray-400)", fontWeight: "bold", textTransform: "uppercase" }}>Status Verifikasi</p>
                  <p style={{ margin: "2px 0 0", fontSize: "1rem", color: "#10b981", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>✓</span> Terdaftar & Terverifikasi Resmi
                  </p>
                </div>
              </div>
            </div>

            {/* CEFR-aligned Curriculum Card */}
            <div className="about-legal-card" style={{ marginTop: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--color-gray-200)", paddingBottom: "1rem" }}>
                <span style={{ fontSize: "2.5rem", marginRight: "1.25rem" }}>🇪🇺</span>
                <div>
                  <h3 style={{ margin: "0", fontSize: "1.35rem", fontWeight: "700", color: "var(--color-gray-900)" }}>IGE Curriculum</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--color-primary-dark)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>Diselaraskan dengan Standar Internasional CEFR</p>
                </div>
              </div>
              <div>
                <p style={{ margin: "0", fontSize: "0.95rem", color: "var(--color-gray-600)", lineHeight: "1.65" }}>
                  Kurikulum Ibra Global English mengintegrasikan Kurikulum Merdeka dengan kerangka kompetensi internasional Common European Framework of Reference for Languages (CEFR). Setiap level pembelajaran dirancang dengan capaian kompetensi yang jelas dan terukur, sehingga peserta didik berkembang secara bertahap sesuai standar internasional yang digunakan di berbagai negara.
                </p>
              </div>
              <div style={{ marginTop: "1.5rem", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--color-gray-200)" }}>
                      <th style={{ padding: "0.75rem 0.5rem", fontWeight: "bold", color: "var(--color-gray-900)" }}>IGE Curriculum</th>
                      <th style={{ padding: "0.75rem 0.5rem", fontWeight: "bold", color: "var(--color-gray-900)" }}>CEFR Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid var(--color-gray-100)" }}>
                      <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-gray-700)", fontWeight: "500" }}>Foundation 1–5</td>
                      <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-primary-dark)", fontWeight: "bold" }}>A1</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--color-gray-100)" }}>
                      <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-gray-700)", fontWeight: "500" }}>Bridge 1–5</td>
                      <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-primary-dark)", fontWeight: "bold" }}>A2</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--color-gray-100)" }}>
                      <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-gray-700)", fontWeight: "500" }}>Communicator 1–5</td>
                      <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-primary-dark)", fontWeight: "bold" }}>B1</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--color-gray-100)" }}>
                      <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-gray-700)", fontWeight: "500" }}>Achiever 1–5</td>
                      <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-primary-dark)", fontWeight: "bold" }}>B2</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--color-gray-100)" }}>
                      <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-gray-700)", fontWeight: "500" }}>Professional 1–5</td>
                      <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-primary-dark)", fontWeight: "bold" }}>C1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Tutors Section — hanya tampil jika ada data tutor */}
        {(loading || tutors.length > 0) && (
          <section className="about-tutors-section reveal">
            <div className="about-container">
              <h2 className="section-title">Tim Pengajar Kami</h2>
              
              {loading ? (
                <div className="tutors-grid">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="tutor-card skeleton-pulse" style={{ height: "350px", borderRadius: "18px" }}></div>
                  ))}
                </div>
              ) : (
                <div className="tutors-grid">
                  {tutors.map(tutor => (
                    <div key={tutor.id} className="tutor-card">
                      <div className="tutor-image-container">
                        {tutor.image_url ? (
                          <img 
                            src={tutor.image_url} 
                            alt={`Foto ${tutor.name}`} 
                            className="tutor-img"
                            loading="lazy" 
                          />
                        ) : (
                          <div className="tutor-avatar-placeholder" aria-hidden="true">
                            {getInitials(tutor.name)}
                          </div>
                        )}
                      </div>
                      <div className="tutor-info">
                        <h3>{tutor.name}</h3>
                        <span className="tutor-role">{tutor.role}</span>
                        <p className="tutor-bio">{tutor.bio || "Tutor berpengalaman di Ibra Global English."}</p>
                      </div>
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
