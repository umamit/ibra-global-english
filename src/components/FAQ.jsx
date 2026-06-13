"use client";

import { useState, useEffect } from "react";
import { createClient } from "../utils/supabase/client";
import { DEFAULT_FAQS } from "../utils/fallbackData";

export default function FAQ() {
  const supabase = createClient();
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const { data, error } = await supabase
          .from("landing_settings")
          .select("value")
          .eq("key", "landing_faq")
          .single();
        if (error) throw error;
        if (data && data.value) {
          const parsed = JSON.parse(data.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFaqs(parsed);
          }
        }
      } catch (e) {
        // Fallback to default FAQs
      }
    }
    fetchFaqs();
  }, []);

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
                    className="faq-trigger" 
                    aria-expanded={activeFaq === faqId} 
                    aria-controls={`faq-content-${faqId}`}
                    onClick={() => toggleFaq(faqId)}
                  >
                    <span>{faq.question}</span>
                    <span className="faq-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </span>
                  </button>
                  <div id={`faq-content-${faqId}`} className="faq-content" aria-hidden={activeFaq !== faqId}>
                    <div className="faq-content-inner">
                      <p>{faq.answer}</p>
                    </div>
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
