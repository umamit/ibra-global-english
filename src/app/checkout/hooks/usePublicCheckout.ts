"use client";

import { useState } from "react";
import { LandingSettings } from "@/utils/getLandingSettings";

export interface CourseProduct {
  id: string;
  name: string;
  age: string;
  schedule: string;
  price: number;
  desc: string;
}

export function usePublicCheckout(initialSettings: LandingSettings) {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const products: CourseProduct[] = [
    {
      id: "Kids Program",
      name: "Kids Program",
      age: "Usia 5-12 Tahun (SD)",
      schedule: "3x Seminggu · 75 Menit/Sesi",
      price: parseInt(String(initialSettings?.payment_spp_kids || "300000"), 10) || 300000,
      desc: "Bimbingan Bahasa Inggris interaktif anak dengan metode visual, lagu, dan aktivitas kelas.",
    },
    {
      id: "Teens Program",
      name: "Teens Program",
      age: "Usia 13-17 Tahun (SMP/SMA)",
      schedule: "2x Seminggu · 90 Menit/Sesi",
      price: parseInt(String(initialSettings?.payment_spp_teens || "300000"), 10) || 300000,
      desc: "Program percakapan aktif (Speaking Practice), Grammar, dan penulisan akademik remaja.",
    },
    {
      id: "Fun Calistung",
      name: "Fun Calistung",
      age: "Usia 5-7 Tahun (PAUD/TK)",
      schedule: "3x Seminggu · 45 Menit/Sesi",
      price: parseInt(String(initialSettings?.payment_spp_calistung || "350000"), 10) || 350000,
      desc: "Bimbingan dasar membaca, menulis, dan berhitung cepat dengan pendekatan ramah anak.",
    },
    {
      id: "Matematika Dasar",
      name: "Matematika Dasar",
      age: "Usia 6-12 Tahun (SD)",
      schedule: "3x Seminggu · 75 Menit/Sesi",
      price: parseInt(String(initialSettings?.payment_spp_math || initialSettings?.payment_spp_kids || "300000"), 10) || 300000,
      desc: "Penguasaan konsep operasi hitung dasar, penalaran logika soal cerita, dan ketelitian.",
    },
  ];

  const [selectedProgram, setSelectedProgram] = useState<string>("Kids Program");
  const [studentName, setStudentName] = useState<string>("");
  const [parentName, setParentName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState<string>("");
  const [month, setMonth] = useState<string>(defaultMonth);
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);
  const [loadingGateway, setLoadingGateway] = useState<"midtrans" | "xendit" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const activeProduct = products.find((p) => p.id === selectedProgram) || products[0];

  const handleCheckout = async (gateway: "midtrans" | "xendit") => {
    setErrorMsg("");
    if (!studentName.trim() || !parentName.trim() || !email.trim() || !whatsapp.trim()) {
      setErrorMsg("Mohon lengkapi seluruh data siswa, orang tua, email, dan nomor WhatsApp.");
      return;
    }
    if (!agreedTerms) {
      setErrorMsg("Anda wajib menyetujui Syarat & Ketentuan serta Kebijakan Privasi sebelum melanjutkan pembayaran.");
      return;
    }

    setLoadingGateway(gateway);
    try {
      const res = await fetch("/api/payment/public-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_name: studentName,
          parent_name: parentName,
          email,
          whatsapp,
          program: selectedProgram,
          month,
          gateway,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat sesi pembayaran.");
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kendala saat menghubungkan ke gerbang pembayaran.");
    } finally {
      setLoadingGateway(null);
    }
  };

  return {
    products,
    selectedProgram,
    setSelectedProgram,
    activeProduct,
    studentName,
    setStudentName,
    parentName,
    setParentName,
    email,
    setEmail,
    whatsapp,
    setWhatsapp,
    month,
    setMonth,
    agreedTerms,
    setAgreedTerms,
    loadingGateway,
    errorMsg,
    handleCheckout,
  };
}
