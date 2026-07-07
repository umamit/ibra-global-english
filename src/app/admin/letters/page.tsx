"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import "./letters.css";

interface Letter {
  id?: string;
  title: string;
  letter_number: string;
  recipient: string;
  subject: string;
  content: string;
  sender_name: string;
  sender_role: string;
  created_at?: string;
}

export default function AdminLettersPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Form Fields
  const [id, setId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [letterNumber, setLetterNumber] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [senderName, setSenderName] = useState<string>("Husnita Usman");
  const [senderRole, setSenderRole] = useState<string>("Direktur Utama");

  // AI Prompt Assistant Field
  const [aiPrompt, setAiPrompt] = useState<string>("");

  // UI state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success"
  });

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const fetchLetters = async () => {
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
  };

  useEffect(() => {
    fetchLetters();
    generateSuggestedNumber();
  }, []);

  const generateSuggestedNumber = () => {
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const now = new Date();
    const month = romanMonths[now.getMonth()];
    const year = now.getFullYear();
    const count = letters.length + 1;
    const paddedCount = String(count).padStart(3, "0");
    setLetterNumber(`${paddedCount}/IGE-B/${month}/${year}`);
  };

  // Autocomplete suggested letter number when creating new
  const handleResetForm = () => {
    setId("");
    setTitle("");
    setRecipient("");
    setSubject("");
    setContent("");
    setSenderName("Husnita Usman");
    setSenderRole("Direktur Utama");
    setAiPrompt("");
    setIsEditing(false);
    
    // Auto calculate letter number
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const now = new Date();
    const month = romanMonths[now.getMonth()];
    const year = now.getFullYear();
    const count = letters.length + 1;
    const paddedCount = String(count).padStart(3, "0");
    setLetterNumber(`${paddedCount}/IGE-B/${month}/${year}`);
  };

  // Memanggil Groq via ai-assist route
  const handleGenerateLetterWithAI = async () => {
    if (!aiPrompt.trim()) {
      triggerToast("Harap masukkan instruksi untuk AI!", "error");
      return;
    }

    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "letter-draft",
          payload: {
            instruction: aiPrompt,
            recipient: recipient || "Pihak Terkait",
            subject: subject || "Perihal Terkait",
            letter_number: letterNumber
          }
        })
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

  // Simpan data ke database
  const handleSaveLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !letterNumber || !recipient || !subject || !content) {
      triggerToast("Mohon isi semua kolom bertanda bintang (*).", "error");
      return;
    }

    setSubmitting(true);
    const payload = {
      id: id || undefined,
      title,
      letter_number: letterNumber,
      recipient,
      subject,
      content,
      sender_name: senderName,
      sender_role: senderRole
    };

    try {
      const method = isEditing ? "PATCH" : "POST";
      const res = await fetch("/api/admin/letters", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok && result.success) {
        triggerToast(isEditing ? "Surat berhasil diperbarui!" : "Surat berhasil disimpan!");
        fetchLetters();
        if (!isEditing) {
          handleResetForm();
        }
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
    setId(letter.id || "");
    setTitle(letter.title);
    setLetterNumber(letter.letter_number);
    setRecipient(letter.recipient);
    setSubject(letter.subject);
    setContent(letter.content);
    setSenderName(letter.sender_name);
    setSenderRole(letter.sender_role);
    setIsEditing(true);
  };

  const handleDeleteLetter = async (letterId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus surat ini dari arsip?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/letters?id=${letterId}`, {
        method: "DELETE"
      });
      const result = await res.json();
      if (res.ok && result.success) {
        triggerToast("Surat berhasil dihapus.");
        fetchLetters();
        if (id === letterId) {
          handleResetForm();
        }
      } else {
        triggerToast(result.error || "Gagal menghapus surat.", "error");
      }
    } catch (err: any) {
      triggerToast("Kesalahan jaringan: " + err.message, "error");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredLetters = letters.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.letter_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLocalDateString = () => {
    return new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <div className="letters-container">
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 9999,
          padding: "0.75rem 1.5rem",
          borderRadius: "var(--radius-md)",
          backgroundColor: toast.type === "success" ? "var(--color-green)" : "var(--color-red)",
          color: "#ffffff",
          boxShadow: "var(--shadow-md)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontWeight: "600"
        }}>
          {toast.message}
        </div>
      )}

      {/* Header bar */}
      <div className="no-print" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", borderBottom: "1px solid var(--color-gray-200)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>Kelola Surat Resmi & AI</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Tulis, draf dengan asisten AI Groq, dan cetak surat resmi ber-kop lembaga secara instan.
          </p>
        </div>
      </div>

      <div className="letters-grid">
        {/* LEFT COLUMN: Input Form & AI Panel */}
        <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* AI Drafting Assistant Card */}
          <div className="letters-card ai-box">
            <h2 className="card-title" style={{ color: "var(--color-primary)", marginBottom: "0.75rem" }}>
              🪄 Groq AI Letter Assistant
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--color-gray-600)", marginBottom: "1rem" }}>
              Tulis instruksi dalam bahasa sehari-hari. Asisten AI akan otomatis memformat paragraf isi surat yang baku dan formal.
            </p>
            <div className="form-group">
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Contoh: Buat surat undangan rapat komite wali murid hari Sabtu depan membahas persiapan Ujian Akhir Semester."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="form-input"
              style={{
                background: "var(--color-primary)",
                color: "#ffffff",
                border: "none",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem"
              }}
              onClick={handleGenerateLetterWithAI}
              disabled={aiLoading}
            >
              {aiLoading ? "Sedang Menyusun Draf..." : "🪄 Buat Draf Surat Resmi"}
            </button>
          </div>

          {/* Letter Editor Form */}
          <div className="letters-card">
            <h2 className="card-title">
              {isEditing ? "✏️ Edit Surat" : "✍️ Buat Surat Baru"}
            </h2>
            <form onSubmit={handleSaveLetter}>
              <div className="form-group">
                <label>Judul Arsip (Internal) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Undangan Rapor Semester Ganjil"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>Nomor Surat Resmi *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={letterNumber}
                    onChange={(e) => setLetterNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Penerima *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Wali Murid IGE Bobong"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Perihal / Hal *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Undangan Rapat Evaluasi Belajar"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Isi Surat (HTML/Teks) *</label>
                <textarea
                  className="form-textarea"
                  rows={10}
                  placeholder="Tulis pembuka, paragraf isi, dan penutup di sini..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
                <span style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", marginTop: "4px", display: "block" }}>
                  Mendukung tag HTML dasar (seperti &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;, dll) jika Anda ingin memformat draf secara detail.
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>Nama Penandatangan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Jabatan Penandatangan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={senderRole}
                    onChange={(e) => setSenderRole(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button
                  type="submit"
                  className="form-input"
                  style={{
                    background: "var(--color-primary-dark)",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: "700",
                    cursor: "pointer",
                    flex: 2
                  }}
                  disabled={submitting}
                >
                  {submitting ? "Menyimpan..." : isEditing ? "Perbarui Surat" : "Simpan Surat"}
                </button>
                <button
                  type="button"
                  className="form-input"
                  style={{
                    background: "var(--color-gray-100)",
                    border: "none",
                    fontWeight: "600",
                    cursor: "pointer",
                    flex: 1
                  }}
                  onClick={handleResetForm}
                >
                  Reset / Baru
                </button>
              </div>
            </form>
          </div>

          {/* Letter History/Archive */}
          <div className="letters-card">
            <h2 className="card-title">📦 Arsip Surat Resmi</h2>
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                placeholder="Cari surat berdasarkan judul/nomor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {loading ? (
              <p style={{ color: "var(--color-gray-500)", textAlign: "center", padding: "1.5rem" }}>
                Memuat arsip surat...
              </p>
            ) : filteredLetters.length === 0 ? (
              <p style={{ color: "var(--color-gray-500)", textAlign: "center", padding: "1.5rem" }}>
                Tidak ada surat ditemukan.
              </p>
            ) : (
              <div className="history-list">
                {filteredLetters.map((l) => (
                  <div key={l.id} className={`history-item ${id === l.id ? "active" : ""}`}>
                    <div style={{ flex: 1, cursor: "pointer" }} onClick={() => handleEditLetter(l)}>
                      <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--color-gray-900)" }}>{l.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", marginTop: "2px" }}>
                        No: {l.letter_number} &nbsp;|&nbsp; Kpd: {l.recipient}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        type="button"
                        style={{ border: "none", background: "none", cursor: "pointer", fontSize: "1.1rem" }}
                        title="Edit Surat"
                        onClick={() => handleEditLetter(l)}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        style={{ border: "none", background: "none", cursor: "pointer", fontSize: "1.1rem" }}
                        title="Hapus Surat"
                        onClick={() => handleDeleteLetter(l.id!)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Real-time Letter Preview & Letterhead */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--color-gray-900)" }}>🖨️ Pratinjau Cetak Lembar A4</h2>
            <button
              type="button"
              className="no-print"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius-sm)",
                background: "var(--color-accent)",
                color: "#ffffff",
                border: "none",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                boxShadow: "var(--shadow-sm)"
              }}
              onClick={handlePrint}
              disabled={!content}
            >
              🖨️ Cetak Surat (PDF)
            </button>
          </div>

          {/* Letterhead and Sheet Visual */}
          <div className="letter-preview-sheet">
            {/* Kop Resmi Surat IGE */}
            <div className="official-letterhead">
              <img
                src="/assets/logo.png"
                alt="Logo IGE"
                className="letterhead-logo"
              />
              <div className="letterhead-info">
                <h2>PT. IBRA GLOBAL ENGLISH BOBONG</h2>
                <div className="sub-tagline">Kursus Bahasa Inggris & Bimbingan Belajar Calistung</div>
                <p className="address-line">
                  Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001, Bobong,<br />
                  Taliabu Barat, Kabupaten Pulau Taliabu, Maluku Utara 97794<br />
                  Email: ibraglobalenglish@gmail.com | Kontak: +62 822-1323-4482
                </p>
              </div>
            </div>

            {/* Letter Meta Details */}
            <div className="letter-meta-row">
              <div className="letter-meta-left">
                <div>Nomor : {letterNumber || "___/IGE-B/___/2026"}</div>
                <div>Perihal: {subject || "________________________"}</div>
              </div>
              <div className="letter-meta-right">
                <div>Bobong, {getLocalDateString()}</div>
                <div>Kepada Yth:</div>
                <div style={{ fontWeight: "bold" }}>{recipient || "________________________"}</div>
                <div>di Tempat</div>
              </div>
            </div>

            {/* Letter Title / Subject */}
            <div className="letter-title-subject">
              <h3>{subject || "PEMBERITAHUAN"}</h3>
            </div>

            {/* Main Content Body */}
            <div
              className="letter-body"
              dangerouslySetInnerHTML={{
                __html: content || "<p style='color:#777; text-align:center;'>Isi draf surat masih kosong. Silakan gunakan <strong>Groq AI Assistant</strong> di sebelah kiri untuk menyusun teks draf secara otomatis atau ketik isi surat Anda langsung di formulir.</p>"
              }}
            />

            {/* Signature Block */}
            <div className="letter-signature-block">
              <div className="letter-signature-wrap">
                <div>Hormat Kami,</div>
                <div style={{ fontWeight: "bold" }}>PT. Ibra Global English</div>
                <div className="signature-space"></div>
                <div className="signature-name">{senderName}</div>
                <div style={{ fontSize: "0.85rem", color: "#555" }}>{senderRole}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
