"use client";
import "./FAQ.css";

import { z } from "zod";
import { useState, useMemo } from "react";
import { DEFAULT_FAQS } from "../utils/fallbackData";
import type { FaqItem } from "../../sanity.types";
import { useSanityQuery } from "@/hooks/useSanityQuery";

const faqPropsSchema = z.object({
  initialSettings: z.object({
    landing_faq: z.union([z.string(), z.array(z.any())]).optional(),
  }).optional(),
});

type FAQProps = z.infer<typeof faqPropsSchema>;

interface FAQEntry {
  id: string;
  question?: string;
  answer?: string;
}

export default function FAQ({ initialSettings }: FAQProps) {
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  // 1. Ambil data dari Sanity menggunakan custom hook yang baru dibuat.
  const { data: sanityFaqsData, isLoading } = useSanityQuery<FaqItem[]>({
    query: `*[_type == "faqItem"] | order(order asc)`,
    options: {
      // Hanya jalankan query ini jika Sanity Project ID dikonfigurasi
      enabled: !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder",
    }
  });

  // 2. Gabungkan data dari Sanity dengan data fallback/Supabase
  const faqs = useMemo(() => {
    // Ambil data dari Supabase/initialSettings sebagai fallback
    let supabaseFaqs = DEFAULT_FAQS;
    if (initialSettings?.landing_faq) {
      try {
        const parsed = typeof initialSettings.landing_faq === "string"
          ? JSON.parse(initialSettings.landing_faq)
          : initialSettings.landing_faq;
        if (Array.isArray(parsed) && parsed.length > 0) {
          supabaseFaqs = parsed;
        }
      } catch (e) {
        console.warn("Gagal mem-parsing FAQ dari initialSettings.");
      }
    }

    const mappedSanityFaqs: FAQEntry[] = sanityFaqsData?.map((item) => ({
      id: `sanity-${item._id}`,
      question: item.question,
      answer: item.answer,
    })) || [];

    return [...mappedSanityFaqs, ...supabaseFaqs];
  }, [sanityFaqsData, initialSettings]);

  const toggleFaq = (id: string) => {
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
          {isLoading && <p style={{ textAlign: 'center' }}>Memuat FAQ...</p>}
          
          {!isLoading && faqs.length === 0 && <p style={{ textAlign: 'center' }}>Belum ada FAQ yang tersedia.</p>}

          <div className="faq-list">
            {faqs.map((faq, idx) => {
              const faqId: string = String(faq.id ?? idx + 1);
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
