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
  lampiran: string;
  attachment: string;
  letter_date: string;
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
  const [senderName, setSenderName] = useState<string>("Husnita Usman, M.Pd.");
  const [senderRole, setSenderRole] = useState<string>("Direktur");
  const [lampiran, setLampiran] = useState<string>("-");
  const [attachment, setAttachment] = useState<string>("");
  const [letterDate, setLetterDate] = useState<string>("");
  const [category, setCategory] = useState<string>("PER"); // Default category: PER (Permohonan)

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
    initDefaultDateAndNumber();
  }, []);

  const getCategoryFromNumber = (num: string) => {
    if (num.includes("IGE-PER")) return "PER";
    if (num.includes("IGE-UND")) return "UND";
    if (num.includes("IGE-PEM")) return "PEM";
    if (num.includes("IGE-KET")) return "KET";
    if (num.includes("IGE-SK")) return "SK";
    if (num.includes("IGE-ST")) return "ST";
    return "GEN";
  };

  const generateNumber = (cat: string, allLetters: Letter[]) => {
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const now = new Date();
    const month = romanMonths[now.getMonth()];
    const year = now.getFullYear();
    const suffix = cat === "GEN" ? "IGE" : `IGE-${cat}`;

    // Hitung surat dalam kategori yang sama
    const countInCategory = allLetters.filter(l =>
      getCategoryFromNumber(l.letter_number) === cat
    ).length;
    const nextCount = countInCategory + 1;
    const paddedCount = String(nextCount).padStart(3, "0");
    return `${paddedCount}/${suffix}/${month}/${year}`;
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    setLetterNumber(generateNumber(newCat, letters));
  };

  const initDefaultDateAndNumber = () => {
    const now = new Date();
    const day = now.getDate();
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const monthText = monthNames[now.getMonth()];
    const year = now.getFullYear();
    
    setLetterNumber(generateNumber("PER", letters));
    setLetterDate(`Bobong, ${day} ${monthText} ${year}`);
  };

  const handleResetForm = () => {
    setId("");
    setTitle("");
    setRecipient("");
    setSubject("");
    setContent("");
    setSenderName("Husnita Usman, M.Pd.");
    setSenderRole("Direktur");
    setLampiran("-");
    setAttachment("");
    setAiPrompt("");
    setCategory("PER");
    setIsEditing(false);
    
    const now = new Date();
    const day = now.getDate();
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    
    setLetterNumber(generateNumber("PER", letters));
    setLetterDate(`Bobong, ${day} ${monthNames[now.getMonth()]} ${now.getFullYear()}`);
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

  // Menyisipkan template tabel lampiran
  const handleInsertTableTemplate = () => {
    const tableTemplate = `<p>Sehubungan dengan surat <strong>${subject || "Permohonan Izin"}</strong>, berikut kami sampaikan daftar peserta didik.</p>
<table>
  <thead>
    <tr>
      <th style="width: 50px; text-align: center;">No.</th>
      <th>Nama Siswa</th>
      <th>Asal Sekolah</th>
      <th style="width: 80px; text-align: center;">Kelas</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align: center;">1.</td>
      <td>Teresa Margareth Wandan</td>
      <td>SMA Negeri 1 Pulau Taliabu</td>
      <td style="text-align: center;">X</td>
    </tr>
    <tr>
      <td style="text-align: center;">2.</td>
      <td>Nurul Mutia Dg Pabila</td>
      <td>SMA Negeri 1 Pulau Taliabu</td>
      <td style="text-align: center;">X</td>
    </tr>
  </tbody>
</table>`;
    setAttachment(tableTemplate);
    setLampiran("1 Lembar");
    triggerToast("Template tabel lampiran disisipkan!");
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
      sender_role: senderRole,
      lampiran,
      attachment,
      letter_date: letterDate
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
    setLampiran(letter.lampiran || "-");
    setAttachment(letter.attachment || "");
    setLetterDate(letter.letter_date || "");
    setCategory(getCategoryFromNumber(letter.letter_number));
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
            Buat draf surat menggunakan Groq AI dan cetak dengan Kop Surat Resmi Ibra Global English.
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
              Ketik instruksi surat (misal: *"Surat izin siswa mengikuti program Tour Guide tanggal 7-8 Juli"*). Groq akan menyusun isinya secara otomatis.
            </p>
            <div className="form-group">
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Tulis instruksi surat di sini..."
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
                cursor: "pointer"
              }}
              onClick={handleGenerateLetterWithAI}
              disabled={aiLoading}
            >
              {aiLoading ? "Sedang Menyusun Draf..." : "🪄 Buat Draf Surat"}
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
                  placeholder="e.g., Surat Permohonan Izin Tour Guide"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>Kategori Surat</label>
                  <select
                    className="form-input"
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="GEN">Umum (IGE)</option>
                    <option value="PER">Permohonan (IGE-PER)</option>
                    <option value="UND">Undangan (IGE-UND)</option>
                    <option value="PEM">Pemberitahuan (IGE-PEM)</option>
                    <option value="KET">Keterangan (IGE-KET)</option>
                    <option value="SK">Keputusan (IGE-SK)</option>
                    <option value="ST">Surat Tugas (IGE-ST)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Nomor Surat *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={letterNumber}
                    onChange={(e) => setLetterNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>Perihal *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Permohonan Izin"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tanggal Surat *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={letterDate}
                    onChange={(e) => setLetterDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>Penerima Surat (Yth...) *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Bapak/Ibu Kepala SMA Negeri 1 Pulau Taliabu"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Lampiran</label>
                  <input
                    type="text"
                    className="form-input"
                    value={lampiran}
                    onChange={(e) => setLampiran(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Isi Surat (HTML/Teks) *</label>
                <textarea
                  className="form-textarea"
                  rows={8}
                  placeholder="Tulis paragraf isi surat di sini..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ borderTop: "1px solid var(--color-gray-100)", paddingTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <label style={{ margin: 0 }}>Isi Lampiran (Opsional - Tabel/Daftar Siswa)</label>
                  <button
                    type="button"
                    style={{
                      background: "var(--color-primary-light)",
                      color: "var(--color-primary-dark)",
                      border: "1px solid var(--color-primary-light)",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "var(--radius-xs)",
                      cursor: "pointer"
                    }}
                    onClick={handleInsertTableTemplate}
                  >
                    ➕ Sisipkan Tabel Lampiran
                  </button>
                </div>
                <textarea
                  className="form-textarea"
                  rows={6}
                  placeholder="Tulis detail lampiran di sini (Mendukung HTML Table)..."
                  value={attachment}
                  onChange={(e) => setAttachment(e.target.value)}
                />
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
                placeholder="Cari surat..."
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
                boxShadow: "var(--shadow-sm)"
              }}
              onClick={handlePrint}
              disabled={!content}
            >
              🖨️ Cetak Surat (PDF)
            </button>
          </div>

          {/* Letterhead and Sheet Visual */}
          <div className="letter-preview-sheet" id="print-area">
            {/* Kop Resmi Surat IGE */}
            <div className="official-letterhead">
              <img
                src="/assets/logo.png"
                alt="Logo IGE"
                className="letterhead-logo"
              />
              <div className="letterhead-info">
                <h2>IBRA GLOBAL ENGLISH</h2>
                <p className="address-line" style={{ fontSize: "0.78rem" }}>
                  Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001,<br />
                  Bobong, Taliabu Barat, Kabupaten Pulau Taliabu, Maluku Utara 97794<br />
                  HP/WA: +62 813-5700-1357 | Email: <span style={{ textDecoration: "underline", color: "var(--color-primary)" }}>admin@ibraglobalenglish.uk</span>
                </p>
              </div>
            </div>

            {/* Letter Meta Details (Precisely Aligned Colons) */}
            <div className="letter-meta-block">
              <div className="meta-item">
                <span className="meta-label">Nomor</span>
                <span className="meta-colon">:</span>
                <span className="meta-value">{letterNumber || "___/IGE-B/___/2026"}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Lampiran</span>
                <span className="meta-colon">:</span>
                <span className="meta-value">{lampiran}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Perihal</span>
                <span className="meta-colon">:</span>
                <span className="meta-value" style={{ fontWeight: "500" }}>{subject || "________________________"}</span>
              </div>
            </div>

            {/* Recipient Block */}
            <div className="letter-recipient-block">
              <div>Kepada Yth.</div>
              <div style={{ fontWeight: "bold" }}>{recipient || "________________________"}</div>
              <div>di Tempat</div>
            </div>

            {/* Salutation */}
            <div className="letter-salutation">
              Dengan hormat,
            </div>

            {/* Main Content Body */}
            <div
              className="letter-body"
              dangerouslySetInnerHTML={{
                __html: content || "<p style='color:#777; text-align:center;'>Isi draf surat masih kosong. Silakan gunakan <strong>Groq AI Assistant</strong> untuk menyusun draf secara otomatis.</p>"
              }}
            />

            {/* Signature Block */}
            <div className="letter-signature-block">
              <div className="letter-signature-wrap">
                <div>{letterDate || "Bobong, ___ ___________ 2026"}</div>
                <div>Hormat kami,</div>
                <div style={{ fontWeight: "bold" }}>IBRA GLOBAL ENGLISH</div>
                <div className="signature-space"></div>
                <div className="signature-name">{senderName}</div>
                <div style={{ fontSize: "0.9rem", color: "#333333" }}>{senderRole}</div>
              </div>
            </div>

            {/* Double-page Attachment Block (Renders if attachment is not empty) */}
            {attachment && (
              <div className="letter-attachment-page">
                <div className="no-print" style={{ borderBottom: "1px dashed #ccc", paddingBottom: "0.5rem", marginBottom: "1.5rem", color: "var(--color-primary-dark)", fontWeight: "bold" }}>
                  📄 Halaman 2: Lampiran Surat
                </div>
                <h3 className="attachment-title">LAMPIRAN</h3>
                <div
                  className="attachment-body"
                  dangerouslySetInnerHTML={{ __html: attachment }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
