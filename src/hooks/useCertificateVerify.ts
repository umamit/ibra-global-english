import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export interface CertStudents {
  name: string;
  program: string;
}

export interface CertReport {
  speaking_score: number;
  grammar_score: number;
  vocabulary_score: number;
  active_score: number;
  tutor_notes?: string;
}

export interface CertData {
  id: string;
  cert_number?: string;
  issue_date: string;
  module_name: string;
  grade: string;
  tutor_name: string;
  student_id: string;
  custom_image_url: string;
  students?: CertStudents;
  reports?: CertReport | null;
}

export function useCertificateVerify() {
  const params = useParams();
  const id = params?.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState<boolean>(true);
  const [cert, setCert] = useState<CertData | null>(null);
  const [theme, setTheme] = useState<string>("light");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTimeout(() => {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }, 0);

    if (!id) return;

    async function fetchCertificate() {
      try {
        const { data, error } = await supabase
          .from("certificates")
          .select("*, students(*), reports(*)")
          .eq("id", id)
          .single();

        if (error) throw error;

        let finalCert: CertData = data as CertData;
        if (!finalCert.reports && finalCert.student_id) {
          const { data: repData } = await supabase
            .from("reports")
            .select("*")
            .eq("student_id", finalCert.student_id)
            .ilike("module_name", finalCert.module_name)
            .limit(1)
            .maybeSingle();
          if (repData) {
            finalCert = { ...finalCert, reports: repData as CertReport };
          }
        }
        setCert(finalCert);
      } catch (err) {
        console.error("Certificate not found:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCertificate();
  }, [id]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  return {
    id,
    loading,
    cert,
    theme,
    toggleTheme,
    isGeneratingPDF,
    setIsGeneratingPDF,
  };
}
