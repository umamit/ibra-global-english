import { useState } from "react";

export interface TestimonialFormData {
  author: string;
  role: string;
  rating: number;
  text: string;
}

export function useTestimonialForm() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ msg: string; type: "success" | "error" }>({
    msg: "",
    type: "success",
  });

  const [form, setForm] = useState<TestimonialFormData>({
    author: "",
    role: "Siswa Active (Teens Program)",
    rating: 5,
    text: "",
  });

  const resetForm = () => {
    setForm({
      author: "",
      role: "Siswa Active (Teens Program)",
      rating: 5,
      text: "",
    });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const submitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author.trim() || !form.text.trim()) {
      alert("Mohon lengkapi Nama Anda dan Pesan Ulasan.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      if (res.ok) {
        setToastMsg({
          msg: "Terima kasih! Ulasan Anda telah terkirim dan akan ditinjau oleh Admin sebelum ditayangkan.",
          type: "success",
        });
        resetForm();
        setIsModalOpen(false);
        setTimeout(() => setToastMsg({ msg: "", type: "success" }), 5000);
      } else {
        alert(result.error || "Gagal mengirim ulasan.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    setForm,
    isModalOpen,
    openModal,
    closeModal,
    submitting,
    toastMsg,
    submitTestimonial,
  };
}
