"use client";

import { useState, useEffect, useCallback } from "react";

export interface Letter {
  id?: string;
  title: string;
  letter_number: string;
  recipient: string;
  subject: string;
  content: string;
  sender_name: string;
  sender_role: string;
  lampiran: string;
  attachment: string;
  letter_date: string;
  created_at?: string;
}

const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const ROMAN_MONTHS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function getCategoryFromNumber(num: string): string {
  if (num.includes("IGE-PER")) return "PER";
  if (num.includes("IGE-UND")) return "UND";
  if (num.includes("IGE-PEM")) return "PEM";
  if (num.includes("IGE-KET")) return "KET";
  if (num.includes("IGE-SK")) return "SK";
  if (num.includes("IGE-ST")) return "ST";
  return "GEN";
}

export function generateNumber(cat: string, allLetters: Letter[]): string {
  const now = new Date();
  const month = ROMAN_MONTHS[now.getMonth()];
  const year = now.getFullYear();
  const suffix = cat === "GEN" ? "IGE" : `IGE-${cat}`;
  const countInCategory = allLetters.filter((l) => getCategoryFromNumber(l.letter_number) === cat).length;
  const nextCount = countInCategory + 1;
  const paddedCount = String(nextCount).padStart(3, "0");
  return `${paddedCount}/${suffix}/${month}/${year}`;
}

export function getDefaultDate(): string {
  const now = new Date();
  return `Bobong, ${now.getDate()} ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
}

export function useLetterData() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });

  // Form state
  const [id, setId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [letterNumber, setLetterNumber] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [senderName, setSenderName] = useState<string>("Husnita Usman, M.Pd.");
  const [senderRole, setSenderRole] = useState<string>("Direktur");
  const [lampiran, setLampiran] = useState<string>("-");
  const [attachment, setAttachment] = useState<string>("");
  const [letterDate, setLetterDate] = useState<string>("");
  const [category, setCategory] = useState<string>("PER");
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const triggerToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  }, []);

  const fetchLetters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/letters");
      const result = await res.json();
      if (res.ok && result.data) {
        setLetters(result.data);
      } else {
        triggerToast(result.error || "Gagal mengambil data surat.", "error");
      }
    } catch (err: any) {
      triggerToast("Kesalahan jaringan: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [triggerToast]);

  const handleResetForm = useCallback(() => {
    setId(""); setTitle(""); setRecipient(""); setSubject(""); setContent("");
    setSenderName("Husnita Usman, M.Pd."); setSenderRole("Direktur");
    setLampiran("-"); setAttachment(""); setAiPrompt(""); setCategory("PER"); setIsEditing(false);
    setLetterDate(getDefaultDate());
  }, []);

  const handleCategoryChange = useCallback((newCat: string) => {
    setCategory(newCat);
    setLetterNumber(generateNumber(newCat, letters));
  }, [letters]);

  const handleGenerateLetterWithAI = async () => {
    if (!aiPrompt.trim()) { triggerToast("Harap masukkan instruksi untuk AI!", "error"); return; }
    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "letter-draft", payload: { instruction: aiPrompt, recipient: recipient || "Pihak Terkait", subject: subject || "Perihal Terkait", letter_number: letterNumber } }),
      });
      const result = await res.json();
      if (res.ok && result.reply) {
        setContent(result.reply);
        triggerToast("Draf surat berhasil dibuat oleh Groq!");
      } else {
        triggerToast(result.error || "Gagal membuat draf surat.", "error");
      }
    } catch (err: any) {
      triggerToast("Kesalahan AI: " + err.message, "error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleInsertTableTemplate = () => {
    const tableTemplate = `<p>Sehubungan dengan surat <strong>${subject || "Permohonan Izin"}</strong>, berikut kami sampaikan daftar peserta didik.</p>
<table>
  <thead><tr><th style="width: 50px; text-align: center;">No.</th><th>Nama Siswa</th><th>Asal Sekolah</th><th style="width: 80px; text-align: center;">Kelas</th></tr></thead>
  <tbody>
    <tr><td style="text-align: center;">1.</td><td>Teresa Margareth Wandan</td><td>SMA Negeri 1 Pulau Taliabu</td><td style="text-align: center;">X</td></tr>
    <tr><td style="text-align: center;">2.</td><td>Nurul Mutia Dg Pabila</td><td>SMA Negeri 1 Pulau Taliabu</td><td style="text-align: center;">X</td></tr>
  </tbody>
</table>`;
    setAttachment(tableTemplate);
    setLampiran("1 Lembar");
    triggerToast("Template tabel lampiran disisipkan!");
  };

  const handleSaveLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !letterNumber || !recipient || !subject || !content) {
      triggerToast("Mohon isi semua kolom bertanda bintang (*).", "error");
      return;
    }
    setSubmitting(true);
    const payload = { id: id || undefined, title, letter_number: letterNumber, recipient, subject, content, sender_name: senderName, sender_role: senderRole, lampiran, attachment, letter_date: letterDate };
    try {
      const method = isEditing ? "PATCH" : "POST";
      const res = await fetch("/api/admin/letters", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (res.ok && result.success) {
        triggerToast(isEditing ? "Surat berhasil diperbarui!" : "Surat berhasil disimpan!");
        fetchLetters();
        if (!isEditing) handleResetForm();
      } else {
        triggerToast(result.error || "Gagal menyimpan surat.", "error");
      }
    } catch (err: any) {
      triggerToast("Kesalahan jaringan: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditLetter = (letter: Letter) => {
    setId(letter.id || ""); setTitle(letter.title); setLetterNumber(letter.letter_number);
    setRecipient(letter.recipient); setSubject(letter.subject); setContent(letter.content);
    setSenderName(letter.sender_name); setSenderRole(letter.sender_role);
    setLampiran(letter.lampiran || "-"); setAttachment(letter.attachment || "");
    setLetterDate(letter.letter_date || ""); setCategory(getCategoryFromNumber(letter.letter_number));
    setIsEditing(true);
  };

  const handleDeleteLetter = async (letterId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus surat ini dari arsip?")) return;
    try {
      const res = await fetch(`/api/admin/letters?id=${letterId}`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok && result.success) {
        triggerToast("Surat berhasil dihapus.");
        fetchLetters();
        if (id === letterId) handleResetForm();
      } else {
        triggerToast(result.error || "Gagal menghapus surat.", "error");
      }
    } catch (err: any) {
      triggerToast("Kesalahan jaringan: " + err.message, "error");
    }
  };

  useEffect(() => {
    fetchLetters();
    setLetterDate(getDefaultDate());
  }, []);

  useEffect(() => {
    if (letters.length > 0 && !isEditing) {
      setLetterNumber(generateNumber("PER", letters));
    }
  }, [letters.length, isEditing]);

  const filteredLetters = letters.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.letter_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    letters, loading, submitting, aiLoading, toast,
    id, title, setTitle, letterNumber, setLetterNumber, recipient, setRecipient,
    subject, setSubject, content, setContent, senderName, setSenderName,
    senderRole, setSenderRole, lampiran, setLampiran, attachment, setAttachment,
    letterDate, setLetterDate, category, aiPrompt, setAiPrompt,
    searchQuery, setSearchQuery, isEditing, filteredLetters,
    handleCategoryChange, handleResetForm, handleSaveLetter,
    handleEditLetter, handleDeleteLetter, handleInsertTableTemplate,
    handleGenerateLetterWithAI,
  };
}
