"use client";

import { useState } from "react";
import { DEFAULT_FAQS } from "../utils/fallbackData";

export default function FAQ({ initialSettings }) {
  const [faqs] = useState(() => {
    if (initialSettings && initialSettings.landing_faq) {
      try {
        const parsed = typeof initialSettings.landing_faq === "string"
          ? JSON.parse(initialSettings.landing_faq)
          : initialSettings.landing_faq;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // Fallback to default FAQs
      }
    }
    return DEFAULT_FAQS;
  });
  const [activeFaq, setActiveFaq] = useState(null);

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
