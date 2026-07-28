"use client";
import "./Benefits.css";

import { useState, useEffect } from "react";
import { DEFAULT_BENEFITS } from "../utils/fallbackData";
const ICON_MAP = {
  users: <i className="fi fi-rr-users"></i>,
  award: <i className="fi fi-rr-award"></i>,
  clock: <i className="fi fi-rr-clock"></i>,
  trophy: <i className="fi fi-rr-trophy"></i>,
  message: <i className="fi fi-rr-comment-alt-middle"></i>,
  check: <i className="fi fi-rr-check"></i>
};

export default function Benefits({ initialSettings }: { initialSettings: any }) {
  const [benefits, setBenefits] = useState(DEFAULT_BENEFITS);

  useEffect(() => {
    async function loadBenefits() {
      // Get Supabase / fallback benefits
      let baseBenefits = DEFAULT_BENEFITS;
      if (initialSettings && initialSettings.landing_benefits) {
        try {
          const parsed = typeof initialSettings.landing_benefits === "string"
            ? JSON.parse(initialSettings.landing_benefits)
            : initialSettings.landing_benefits;
          if (Array.isArray(parsed) && parsed.length > 0) {
            baseBenefits = parsed;
          }
        } catch (e: any) {}
      }

      setBenefits(baseBenefits);
    }

    loadBenefits();
  }, [initialSettings]);

  // Subtle GSAP Wave Parallax Effect for Benefit Cards
  useEffect(() => {
    let ctx: any;
    import("gsap").then((gsapModule) => {
      import("gsap/ScrollTrigger").then((stModule) => {
        const gsap = gsapModule.default || gsapModule;
        const ScrollTrigger = stModule.ScrollTrigger || stModule.default;
        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          if (window.innerWidth > 768) {
            gsap.fromTo(
              ".benefit-card",
              { y: 35, opacity: 0.85 },
              {
                y: -15,
                opacity: 1,
                stagger: {
                  amount: 0.4,
                  grid: [2, 3],
                  from: "start",
                },
                ease: "power1.out",
                scrollTrigger: {
                  trigger: ".benefits-grid",
                  start: "top 85%",
                  end: "bottom 30%",
                  scrub: 1.2,
                },
              }
            );
          }
        });
      });
    });

    return () => ctx && ctx.revert();
  }, [benefits]);

  return (
    <section id="benefits" className="benefits-section">
      <div className="container">
        <div className="section-header scroll-fade-up">
          <h2>Mengapa Pilih Ibra Global English Bobong?</h2>
          <p>Keunggulan kursus bahasa Inggris kami di Pulau Taliabu</p>
        </div>
        
        <div className="benefits-grid scroll-stagger">
          {benefits.map((b, idx) => (
            <div key={idx} className="benefit-card glowing-card scroll-fade-up">
              <div className="benefit-icon-box">
                {ICON_MAP[b.iconKey as keyof typeof ICON_MAP] || ICON_MAP.check}
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

