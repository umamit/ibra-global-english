"use client";
import "./Benefits.css";

import { useState, useEffect } from "react";
import { DEFAULT_BENEFITS } from "../utils/fallbackData";
import { client as sanityClient } from "@/lib/sanity/client";

const ICON_MAP = {
  users: <i className="fi fi-rr-users"></i>,
  award: <i className="fi fi-rr-award"></i>,
  clock: <i className="fi fi-rr-clock"></i>,
  trophy: <i className="fi fi-rr-trophy"></i>,
  message: <i className="fi fi-rr-comment-alt-middle"></i>,
  check: <i className="fi fi-rr-check"></i>
};

export default function Benefits({ initialSettings }) {
  const [benefits, setBenefits] = useState(DEFAULT_BENEFITS);

  useEffect(() => {
    async function loadBenefits() {
      // 1. Get Supabase / fallback benefits
      let baseBenefits = DEFAULT_BENEFITS;
      if (initialSettings && initialSettings.landing_benefits) {
        try {
          const parsed = typeof initialSettings.landing_benefits === "string"
            ? JSON.parse(initialSettings.landing_benefits)
            : initialSettings.landing_benefits;
          if (Array.isArray(parsed) && parsed.length > 0) {
            baseBenefits = parsed;
          }
        } catch (e) {}
      }

      // 2. Fetch Sanity benefits
      let sanityBenefits = [];
      const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
      const useSanity = projectId && projectId !== "placeholder" && projectId !== "";

      if (useSanity) {
        try {
          const data = await sanityClient.fetch(`*[_type == "benefit"] | order(order asc)`);
          if (data && data.length > 0) {
            sanityBenefits = data.map((item) => ({
              title: item.title,
              desc: item.desc,
              iconKey: item.iconKey || "check"
            }));
          }
        } catch (e) {
          console.warn("Gagal memuat keunggulan dari Sanity:", e);
        }
      }

      // Use Sanity benefits if present, else fallback to Supabase/default
      if (sanityBenefits.length > 0) {
        setBenefits(sanityBenefits);
      } else {
        setBenefits(baseBenefits);
      }
    }

    loadBenefits();
  }, [initialSettings]);

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

