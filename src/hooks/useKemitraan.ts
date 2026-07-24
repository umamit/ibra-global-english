import { useState, useEffect } from "react";
import { SITE_CONFIG } from "@/config/siteConfig";

export interface KemitraanForm {
  institution_name: string;
  rep_name: string;
  rep_role: string;
  phone: string;
  notes: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export const KEMITRAAN_FAQS: FAQItem[] = [
  {
    question: "Apakah pihak sekolah / instansi mitra perlu mengeluarkan anggaran/biaya?",
    answer: "SAMA SEKALI TIDAK. Kerja sama ini 100% GRATIS untuk sekolah/instansi mitra. Pihak sekolah tidak perlu mengalokasikan anggaran sekolah atau dana BOS sepeser pun."
  },
  {
    question: "Siapa yang membayarkan biaya kursus siswa?",
    answer: "Biaya kursus (SPP bulanan) dibayarkan mandiri oleh orang tua murid. Sebagai siswa dari sekolah mitra, orang tua murid justru mendapatkan keuntungan khusus berupa Bebas Biaya Pendaftaran dan Voucher Potongan Khusus."
  },
  {
    question: "Apakah sesi Diagnostic Test gratis mengganggu jam pelajaran sekolah?",
    answer: "Tidak mengganggu. Pelaksanaan Diagnostic Test gratis disesuaikan sepenuhnya dengan waktu luang yang disepakati sekolah (misal saat jam pelajaran seni/olahraga atau sesi kegiatan ekstra)."
  },
  {
    question: "Bagaimana cara sekolah kami mendaftar menjadi mitra rujukan resmi?",
    answer: "Sangat mudah. Pihak Kepala Sekolah, Guru, atau Perwakilan Sekolah cukup mengisi formulir di bawah ini atau menghubungi WhatsApp resmi Direksi Ibra Global English Bobong untuk diskusi singkat."
  }
];

export function useKemitraan() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const [form, setForm] = useState<KemitraanForm>({
    institution_name: "",
    rep_name: "",
    rep_role: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

    setTimeout(() => {
      setTheme(initialTheme === "dark" ? "dark" : "light");
    }, 0);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.institution_name || !form.rep_name || !form.phone) {
      alert("Mohon lengkapi Nama Sekolah/Instansi, Nama Perwakilan, dan Nomor WhatsApp.");
      return;
    }

    const targetPhone = SITE_CONFIG.contact.phoneRaw;
    const message = `Halo Ibra Global English, saya ingin mengajukan diskusi *Kemitraan Rekomendasi Resmi*.\n\n*Nama Sekolah/Instansi:* ${form.institution_name}\n*Nama Perwakilan:* ${form.rep_name} (${form.rep_role || "Perwakilan"})\n*Nomor WhatsApp:* ${form.phone}\n*Catatan/Pesan:* ${form.notes || "-"}`;
    const encoded = encodeURIComponent(message);

    window.open(`https://wa.me/${targetPhone}?text=${encoded}`, "_blank");
  };

  return {
    theme,
    toggleTheme,
    openFaqIndex,
    toggleFaq,
    form,
    setForm,
    handleSubmit,
    faqs: KEMITRAAN_FAQS,
  };
}
