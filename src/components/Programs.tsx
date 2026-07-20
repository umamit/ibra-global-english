"use client";
import "./Programs.css";

import { useState } from "react";
import { DEFAULT_PROGRAMS } from "../utils/fallbackData";

const ICON_MAP = {
  book: <i className="fi fi-rr-book-open-reader"></i>,
  graduation: <i className="fi fi-rr-graduation-cap"></i>,
  users: <i className="fi fi-rr-users"></i>
};

export default function Programs({ initialSettings }: any) {
  const [programs] = useState(() => {
    if (initialSettings && initialSettings.landing_programs) {
      try {
        const parsed = typeof initialSettings.landing_programs === "string"
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

  return (
    <section id="programs" className="programs-section">
      <div className="container">
        <div className="section-header scroll-fade-up">
          <h2>Program Kursus di Bobong</h2>
          <p>Pilih program kursus di Bobong terbaik: kursus bahasa Inggris dan bimbingan belajar Calistung untuk Anda di Pulau Taliabu</p>
        </div>
        
        <div className="programs-grid scroll-stagger">
          {programs.map((prog, idx) => (
            <div 
              key={idx} 
              id={prog.title.toLowerCase().replace(/\s+/g, "-")}
              className={`program-card glowing-card bento-card-${idx} scroll-fade-up`}
            >
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
                        <i className="fi fi-rr-check-circle" style={{ color: "var(--color-green)", fontSize: "1.25rem", flexShrink: 0 }}></i>
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
