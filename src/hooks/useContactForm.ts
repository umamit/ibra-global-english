import { useState } from "react";

export function useContactForm({ form, setForm, honeypot, initialSettings }: any) {
  const [address] = useState(
    initialSettings?.contact_address ||
      "Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001, Bobong, Taliabu Barat, Kabupaten Pulau Taliabu, Maluku Utara 97794"
  );
  const [phone] = useState(initialSettings?.contact_phone || "+62 813-5700-1357");
  const [rawPhone] = useState(() => {
    const p = initialSettings?.contact_phone || "6281357001357";
    return p.replace(/[^0-9]/g, "");
  });
  const [email] = useState(initialSettings?.contact_email || "admin@ibraglobalenglish.uk");

  const [activeTab, setActiveTab] = useState("whatsapp");

  const [regForm, setRegForm] = useState({
    student_name: "",
    student_age: "",
    parent_name: "",
    parent_email: "",
    whatsapp: "",
    program: "Kids Program (5-12 tahun)",
  });
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState("");

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (honeypot) {
      console.warn("Spam bot submission caught.");
      setForm({ name: "", whatsapp: "", program: "Kids Program (5-12 tahun)" });
      return;
    }

    if (!form.name || !form.whatsapp) {
      alert("Mohon isi semua data pendaftaran dengan benar.");
      return;
    }

    const numericWhatsapp = form.whatsapp.replace(/[^0-9]/g, "");
    if (numericWhatsapp.length < 9) {
      alert("Mohon masukkan nomor WhatsApp yang valid.");
      return;
    }

    try {
      await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_name: form.name,
          whatsapp: numericWhatsapp,
          program: form.program,
        }),
      });
    } catch (err) {
      console.error("Gagal menyimpan pendaftaran:", err);
    }

    const targetPhone = rawPhone;
    const message = `Halo Ibra Global English, saya ingin mendaftar kursus.\n\n*Nama Lengkap:* ${form.name}\n*Nomor WhatsApp:* ${form.whatsapp}\n*Program yang Diminati:* ${form.program}`;
    const encodedMessage = encodeURIComponent(message);

    window.location.href = `https://wa.me/${targetPhone}?text=${encodedMessage}`;
    setForm({ name: "", whatsapp: "", program: "Kids Program (5-12 tahun)" });
  };

  const handleRegSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegError("");
    setRegSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm),
      });

      const result = await res.json();

      if (!res.ok) {
        setRegError(result.error || "Gagal mengirim pendaftaran.");
        return;
      }

      setRegSuccess(true);
      setRegForm({
        student_name: "",
        student_age: "",
        parent_name: "",
        parent_email: "",
        whatsapp: "",
        program: "Kids Program (5-12 tahun)",
      });
    } catch {
      setRegError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setRegSubmitting(false);
    }
  };

  return {
    address,
    phone,
    rawPhone,
    email,
    activeTab,
    setActiveTab,
    regForm,
    setRegForm,
    regSubmitting,
    regSuccess,
    setRegSuccess,
    regError,
    handleFormSubmit,
    handleRegSubmit,
  };
}
