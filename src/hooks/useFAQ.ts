import { useState, useMemo } from "react";
import { DEFAULT_FAQS } from "@/utils/fallbackData";

export interface FAQEntry {
  id: string;
  question?: string;
  answer?: string;
}

export function useFAQ(initialSettings?: { landing_faq?: string | any[] }) {
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  const faqs = useMemo(() => {
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

    return supabaseFaqs;
  }, [initialSettings]);

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  return {
    faqs,
    activeFaq,
    toggleFaq,
  };
}
