"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialFloat from "@/components/SocialFloat";
import AIChatWidget from "@/components/AIChatWidget";
import MarqueeBanner from "@/components/MarqueeBanner";
import "./calendar.css";

interface CalendarEvent {
  date: string;
  month: string;
  title: string;
  category: "Penting" | "Ujian" | "Libur" | "Kegiatan";
  desc: string;
}

export default function CalendarPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

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

  const academicEvents: CalendarEvent[] = [
    {
      date: "01",
      month: "AGUSTUS",
      title: "Awal Pembukaan Gelombang Pendaftaran Baru",
      category: "Penting",
      desc: "Pendaftaran peserta didik baru untuk program Kids, Teens, dan Fun Calistung T.A 2026/2027.",
    },
    {
      date: "15",
      month: "AGUSTUS",
      title: "Pelaksanaan Free Placement Test",
      category: "Kegiatan",
      desc: "Tes penempatan kemampuan awal gratis secara online maupun offline di Gedung IGE Bobong.",
    },
    {
      date: "17",
      month: "AGUSTUS",
      title: "Libur Nasional HUT RI Ke-81",
      category: "Libur",
      desc: "Kegiatan belajar mengajar diliburkan menyambut Hari Kemerdekaan Republik Indonesia.",
    },
    {
      date: "01",
      month: "SEPTEMBER",
      title: "Awal Pertemuan Pertama Perdana (KBM)",
      category: "Penting",
      desc: "Hari pertama masuk kelas tatap muka untuk seluruh jenjang kursus.",
    },
    {
      date: "25",
      month: "OKTOBER",
      title: "Mid-Term Progress Evaluation (Ujian Tengah Level)",
      category: "Ujian",
      desc: "Evaluasi lisan (speaking test) dan tertulis tengah semester untuk melihat keaktifan siswa.",
    },
  ];

  return (
    <>
      <Header theme={theme} toggleTheme={toggleTheme} hasMarquee={true} />
      <MarqueeBanner />

      <main className="calendar-main">
        <section className="calendar-hero">
          <div className="calendar-container">
            <span className="calendar-badge">Jadwal Resmi T.A 2026/2027</span>
            <h1 className="calendar-title">Kalender Akademik & Kegiatan</h1>
            <p className="calendar-subtitle">
              Informasi lengkap seputar jadwal pendaftaran, tes evaluasi, kegiatan belajar, dan libur semester di Ibra Global English Bobong.
            </p>
          </div>
        </section>

        <section className="calendar-content">
          <div className="calendar-container">
            <div className="calendar-grid">
              {academicEvents.map((evt, idx) => (
                <div className="calendar-card" key={idx}>
                  <div className="calendar-date-box">
                    <span className="calendar-day">{evt.date}</span>
                    <span className="calendar-month">{evt.month}</span>
                  </div>
                  <div className="calendar-details">
                    <div className="calendar-tag-row">
                      <span className={`calendar-category-tag tag-${evt.category.toLowerCase()}`}>
                        {evt.category}
                      </span>
                    </div>
                    <h3 className="calendar-event-title">{evt.title}</h3>
                    <p className="calendar-event-desc">{evt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SocialFloat />
      <AIChatWidget />
      <Footer />
    </>
  );
}
