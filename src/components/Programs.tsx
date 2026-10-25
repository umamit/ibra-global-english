"use client";

import "./Programs.css";
import React, { useState, useEffect, useRef } from "react";
import { DEFAULT_PROGRAMS } from "../utils/fallbackData";

const ICON_MAP = {
  book: <i className="fi fi-rr-book-open-reader"></i>,
  graduation: <i className="fi fi-rr-graduation-cap"></i>,
  users: <i className="fi fi-rr-users"></i>,
  calculator: <i className="fi fi-rr-calculator"></i>,
};

export default function Programs({ initialSettings }: any) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const [programs] = useState(() => {
    if (initialSettings && initialSettings.landing_programs) {
      try {
        const parsed =
          typeof initialSettings.landing_programs === "string"
            ? JSON.parse(initialSettings.landing_programs)
            : initialSettings.landing_programs;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // Fallback to default programs
      }
    }
    return DEFAULT_PROGRAMS;
  });

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth <= 768) return;

    let ctx: any;
    import("gsap").then((gsapModule) => {
      const gsap = gsapModule.default;
      import("gsap/ScrollTrigger").then((stModule) => {
        const ScrollTrigger = stModule.ScrollTrigger || stModule.default;
        gsap.registerPlugin(ScrollTrigger);

        if (!sectionRef.current) return;

        ctx = gsap.context(() => {
          const cards = sectionRef.current?.querySelectorAll(".program-card-wrapper");
          cards?.forEach((card, idx) => {
            const yOffset = idx === 1 ? -30 : -12; // Kartu tengah melayang lebih tinggi
            gsap.fromTo(
              card,
              { y: 25 },
              {
                y: yOffset,
                ease: "none",
                scrollTrigger: {
                  trigger: sectionRef.current,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1.2,
                },
              }
            );
          });
        }, sectionRef);
      });
    });

    return () => {
      if (ctx) ctx.revert();
    };
  }, []);

  const getDefaultSchedule = (title: string) => {
    const t = (title || "").toLowerCase();
    if (t.includes("teens")) return "2x Seminggu · 90 Menit/Sesi";
    if (t.includes("calistung")) return "3x Seminggu · 45 Menit/Sesi";
    return "3x Seminggu · 75 Menit/Sesi";
  };

  const handleChooseProgram = (title: string) => {
    window.dispatchEvent(new CustomEvent("select-course-program", { detail: title }));
    const contactEl = document.getElementById("contact");
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="programs" className="programs-section ios-aurora-bg" ref={sectionRef}>
      {/* Ambient Aurora Orbs for True iOS Glass Refraction */}
      <div className="ios-aurora-orb ios-aurora-orb-teal" style={{ top: "-5%", left: "-8%" }} />
      <div className="ios-aurora-orb ios-aurora-orb-gold" style={{ top: "35%", right: "-6%" }} />
      <div className="ios-aurora-orb ios-aurora-orb-sky" style={{ bottom: "-10%", left: "25%" }} />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="section-header">
          <h2>Program Kursus di Bobong</h2>
          <p>
            Pilih program kursus terbaik di Bobong: Bahasa Inggris (Kids &amp; Teens),
            Fun Calistung, dan Matematika Dasar di Pulau Taliabu
          </p>
        </div>

        <div className="programs-grid">
          {programs.map((prog: any, idx: number) => (
            <div
              key={idx}
              className={`program-card-wrapper bento-card-${idx}`}
            >
              {/* Glow Stack / Neumorphic Backlight Layer */}
              <div className="glow-stack-backplate"></div>

              <div
                id={prog.title.toLowerCase().replace(/\s+/g, "-")}
                className="program-card glowing-card"
              >
                <div className="bento-content-wrapper">
                  <div className="bento-main-info">
                    <div className="program-icon-box">
                      {ICON_MAP[prog.iconKey as keyof typeof ICON_MAP] || ICON_MAP.book}
                    </div>
                    <h3>{prog.title}</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center", marginBottom: "0.5rem" }}>
                      <p className="program-age" style={{ marginBottom: 0 }}>{prog.age}</p>
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-primary-dark)", backgroundColor: "var(--color-bg-teal-50)", padding: "0.2rem 0.65rem", borderRadius: "9999px", border: "1px solid rgba(33, 108, 126, 0.12)" }}>
                        {prog.schedule || getDefaultSchedule(prog.title)}
                      </span>
                    </div>
                    <p className="program-desc">{prog.desc}</p>
                  </div>
                  <div className="bento-features-info" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1rem" }}>
                    <ul className="program-features">
                      {(prog.features || []).map((feature: any, fIdx: number) => (
                        <li key={fIdx}>
                          <i
                            className="fi fi-rr-check-circle"
                            style={{
                              color: "var(--color-green)",
                              fontSize: "1.25rem",
                              flexShrink: 0,
                            }}
                          ></i>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => handleChooseProgram(prog.title)}
                      style={{
                        marginTop: "0.5rem",
                        padding: "0.65rem 1.1rem",
                        borderRadius: "10px",
                        border: "1px solid rgba(33, 108, 126, 0.2)",
                        backgroundColor: "var(--color-bg-teal-50)",
                        color: "var(--color-primary-dark)",
                        fontWeight: "700",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.4rem",
                        transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        alignSelf: "flex-start"
                      }}
                    >
                      <span>Daftar {prog.title}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
