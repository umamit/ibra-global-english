"use client";
import "./FAQ.css";

import { useState, useEffect } from "react";
import { DEFAULT_FAQS } from "../utils/fallbackData";
import { client as sanityClient } from "@/lib/sanity/client";

export default function FAQ({ initialSettings }) {
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    async function loadFaqs() {
      // 1. Get Supabase / fallback FAQs
      let supabaseFaqs = DEFAULT_FAQS;
      if (initialSettings && initialSettings.landing_faq) {
        try {
          const parsed = typeof initialSettings.landing_faq === "string"
            ? JSON.parse(initialSettings.landing_faq)
            : initialSettings.landing_faq;
          if (Array.isArray(parsed) && parsed.length > 0) {
            supabaseFaqs = parsed;
          }
        } catch (e) {}
      }

      // 2. Fetch Sanity FAQs
      let sanityFaqs = [];
      const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
      const useSanity = projectId && projectId !== "placeholder" && projectId !== "";
      
      if (useSanity) {
        try {
          const data = await sanityClient.fetch(`*[_type == "faqItem"] | order(order asc)`);
          if (data && data.length > 0) {
            sanityFaqs = data.map((item, idx) => ({
              id: `sanity-${item._id || idx}`,
              question: item.question,
              answer: item.answer,
            }));
          }
        } catch (e) {
          console.warn("Gagal memuat FAQ dari Sanity:", e);
        }
      }

      // Combine both (Sanity first, then Supabase)
      setFaqs([...sanityFaqs, ...supabaseFaqs]);
    }

    loadFaqs();
  }, [initialSettings]);

  const toggleFaq = (id) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  return (
    <section id="faq" className="faq-section">
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <h2>Tanya Jawab (FAQ) Kursus Bobong</h2>
          <p>Pertanyaan yang sering diajukan seputar kursus bahasa Inggris Ibra Global English di Bobong, Pulau Taliabu</p>
        </div>

        <div className="faq-container">
          <div className="faq-list">
            {faqs.map((faq, idx) => {
              const faqId = faq.id || idx + 1;
              return (
                <div key={faqId} className={`faq-item ${activeFaq === faqId ? "active" : ""}`} data-aos="fade-up">
                  <button 
                    className="faq-question" 
                    aria-expanded={activeFaq === faqId} 
                    aria-controls={`faq-answer-${faqId}`}
                    onClick={() => toggleFaq(faqId)}
                  >
                    <span>{faq.question}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  <div id={`faq-answer-${faqId}`} className="faq-answer" aria-hidden={activeFaq !== faqId}>
                    <p>{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
