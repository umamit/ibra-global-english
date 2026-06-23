"use client";
import "./Benefits.css";

import { useState } from "react";
import { DEFAULT_BENEFITS } from "../utils/fallbackData";

const ICON_MAP = {
  users: <i className="fi fi-rr-users"></i>,
  award: <i className="fi fi-rr-award"></i>,
  clock: <i className="fi fi-rr-clock"></i>,
  trophy: <i className="fi fi-rr-trophy"></i>,
  message: <i className="fi fi-rr-comment-alt-middle"></i>,
  check: <i className="fi fi-rr-check"></i>
};

export default function Benefits({ initialSettings }) {
  const [benefits] = useState(() => {
    if (initialSettings && initialSettings.landing_benefits) {
      try {
        const parsed = typeof initialSettings.landing_benefits === "string"
          ? JSON.parse(initialSettings.landing_benefits)
          : initialSettings.landing_benefits;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // Fallback to default benefits
      }
    }
    return DEFAULT_BENEFITS;
  });

  return (
    <section id="benefits" className="benefits-section">
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <h2>Mengapa Pilih Ibra Global English Bobong?</h2>
          <p>Keunggulan kursus bahasa Inggris kami di Pulau Taliabu</p>
        </div>
        
        <div className="benefits-grid">
          {benefits.map((b, idx) => (
            <div key={idx} className="benefit-card glowing-card" data-aos="fade-up" data-aos-delay={idx * 100}>
              <div className="benefit-icon-box">
                {ICON_MAP[b.iconKey] || ICON_MAP.check}
              </div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
