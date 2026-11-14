"use client";

import { useState, useEffect } from "react";
import { LandingSettings } from "@/utils/getLandingSettings";
import { PaymentMethodType, PAYMENT_METHODS } from "../components/PaymentMethodSelector";

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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>("va_bri");
  const [studentName, setStudentName] = useState<string>("");
  const [parentName, setParentName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState<string>("");
  const [month, setMonth] = useState<string>(defaultMonth);
  const [websiteUrl, setWebsiteUrl] = useState<string>("");
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);
  const [loadingPayment, setLoadingPayment] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [paymentSuccessBanner, setPaymentSuccessBanner] = useState<boolean>(false);
  const [paymentPendingBanner, setPaymentPendingBanner] = useState<boolean>(false);
  const [detectedStudent, setDetectedStudent] = useState<{ maskedName: string; billingCycle: string; isNewRegistration?: boolean } | null>(null);

  useEffect(() => {
    const raw = studentName.trim();
    if (raw.length < 3) {
      setDetectedStudent(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/payment/student-info?q=${encodeURIComponent(raw)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.found) {
          setDetectedStudent({ maskedName: data.maskedName, billingCycle: data.billingCycle, isNewRegistration: Boolean(data.isNewRegistration) });
          const prog = data.program;
          if (prog && ["Kids Program", "Teens Program", "Fun Calistung", "Matematika Dasar"].includes(prog)) {
            setSelectedProgram(prog);
          }
          if (data.suggestedMonth && data.suggestedMonth !== month) {
            setMonth(data.suggestedMonth);
          }
        } else {
          setDetectedStudent(null);
        }
      } catch {
        // Ignore lookup error on checkout typing
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [studentName]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sName = params.get("student_name");
    const pName = params.get("parent_name");
    const em = params.get("email");
    const wa = params.get("whatsapp");
    const prog = params.get("program");
    const st = params.get("status");
    const gw = params.get("gateway");
    const txStatus = params.get("transaction_status");

    if (sName) setStudentName(sName);
    if (pName) setParentName(pName);
    if (em) setEmail(em);
    if (wa) setWhatsapp(wa);
    if (prog && ["Kids Program", "Teens Program", "Fun Calistung", "Matematika Dasar"].includes(prog)) {
      setSelectedProgram(prog);
    }
    if (txStatus === "settlement" || txStatus === "capture" || (gw === "xendit" && st === "paid")) {
      setPaymentSuccessBanner(true);
    } else if (txStatus === "pending") {
      setPaymentPendingBanner(true);
    }
  }, []);

  const activeProduct = products.find((p) => p.id === selectedProgram) || products[0];
  const rawFee = parseInt(String(initialSettings?.payment_gateway_fee || "5000"), 10);
  const serviceFee = isNaN(rawFee) ? 5000 : rawFee;
  const registrationFee = detectedStudent?.isNewRegistration ? 25000 : 0;
  const totalAmount = activeProduct.price + serviceFee + registrationFee;

  const currentOption = PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod) || PAYMENT_METHODS[0];

  const handleCheckout = async () => {
    setErrorMsg("");
    if (!studentName.trim()) {
      setErrorMsg("Mohon isi Kode ID Siswa (IGE-XXXXXX) atau Nama Lengkap Siswa terlebih dahulu.");
      return;
    }
    if (!agreedTerms) {
      setErrorMsg("Anda wajib menyetujui Syarat & Ketentuan serta Kebijakan Privasi sebelum melanjutkan pembayaran.");
      return;
    }

    setLoadingPayment(true);
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
          gateway: currentOption.gateway,
          payment_method: selectedPaymentMethod,
          website_url: websiteUrl,
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
      setLoadingPayment(false);
    }
  };

  return {
    products,
    selectedProgram,
    setSelectedProgram,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    currentOption,
    activeProduct,
    serviceFee,
    registrationFee,
    totalAmount,
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
    websiteUrl,
    setWebsiteUrl,
    agreedTerms,
    setAgreedTerms,
    loadingPayment,
    errorMsg,
    paymentSuccessBanner,
    paymentPendingBanner,
    detectedStudent,
    handleCheckout,
  };
}
