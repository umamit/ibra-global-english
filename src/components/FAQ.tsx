"use client";

import { z } from "zod";
import { useFAQ } from "@/hooks/useFAQ";
import "./FAQ.css";

const faqPropsSchema = z.object({
  initialSettings: z.object({
    landing_faq: z.union([z.string(), z.array(z.any())]).optional(),
  }).optional(),
});

type FAQProps = z.infer<typeof faqPropsSchema>;

export default function FAQ({ initialSettings }: FAQProps) {
  const { faqs, activeFaq, toggleFaq } = useFAQ(initialSettings);

  return (
    <section id="faq" className="faq-section">
      <div className="container">
        <div className="section-header scroll-fade-up">
          <h2>Tanya Jawab (FAQ) Kursus Bobong</h2>
          <p>Pertanyaan yang sering diajukan seputar kursus bahasa Inggris Ibra Global English di Bobong, Pulau Taliabu</p>
        </div>

        <div className="faq-container">
          {faqs.length === 0 && <p style={{ textAlign: 'center' }}>Belum ada FAQ yang tersedia.</p>}

          <div className="faq-list">
            {faqs.map((faq, idx) => {
              const faqId: string = String(faq.id ?? idx + 1);
              return (
                <div key={faqId} className={`faq-item scroll-fade-up ${activeFaq === faqId ? "active" : ""}`}>
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
