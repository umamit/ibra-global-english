"use client";

import "./Programs.css";
import React, { useState } from "react";
import { DEFAULT_PROGRAMS } from "../utils/fallbackData";

const ICON_MAP = {
  book: <i className="fi fi-rr-book-open-reader"></i>,
  graduation: <i className="fi fi-rr-graduation-cap"></i>,
  users: <i className="fi fi-rr-users"></i>,
};

export default function Programs({ initialSettings }: any) {
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

  // Handler 3D Holographic Tilt physics
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Maksimal derajat rotasi 3D (14° deg)
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    // Posisi persentase untuk Holographic Glare
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.setProperty("--glare-x", `${glareX}%`);
    card.style.setProperty("--glare-y", `${glareY}%`);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    // Spring reset ke posisi semula secara halus
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <section id="programs" className="programs-section">
      <div className="container">
        <div className="section-header scroll-fade-up">
          <h2>Program Kursus di Bobong</h2>
          <p>
            Pilih program kursus di Bobong terbaik: kursus bahasa Inggris dan
            bimbingan belajar Calistung terbaik untuk Anda di Pulau Taliabu
          </p>
        </div>

        <div className="programs-grid scroll-stagger">
          {programs.map((prog: any, idx: number) => (
            <div
              key={idx}
              id={prog.title.toLowerCase().replace(/\s+/g, "-")}
              className={`program-card bento-card-${idx} scroll-fade-up`}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Holographic Refraction Glare Overlay */}
              <div className="holographic-glare" />

              <div className="bento-content-wrapper">
                <div className="bento-main-info">
                  <div className="program-icon-box">
                    {ICON_MAP[prog.iconKey as keyof typeof ICON_MAP] || ICON_MAP.book}
                  </div>
                  <h3>{prog.title}</h3>
                  <p className="program-age">{prog.age}</p>
                  <p className="program-desc">{prog.desc}</p>
                </div>
                <div className="bento-features-info">
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
