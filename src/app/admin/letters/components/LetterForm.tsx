"use client";

import React from "react";
import { Letter } from "../hooks/useLetterData";

interface LetterFormProps {
  // Form state
  id: string;
  title: string; setTitle: (v: string) => void;
  letterNumber: string; setLetterNumber: (v: string) => void;
  recipient: string; setRecipient: (v: string) => void;
  subject: string; setSubject: (v: string) => void;
  content: string; setContent: (v: string) => void;
  senderName: string; setSenderName: (v: string) => void;
  senderRole: string; setSenderRole: (v: string) => void;
  lampiran: string; setLampiran: (v: string) => void;
  attachment: string; setAttachment: (v: string) => void;
  letterDate: string; setLetterDate: (v: string) => void;
  category: string;
  aiPrompt: string; setAiPrompt: (v: string) => void;
  searchQuery: string; setSearchQuery: (v: string) => void;
  isEditing: boolean;
  submitting: boolean;
  aiLoading: boolean;
  loading: boolean;
  filteredLetters: Letter[];
  // Handlers
  onCategoryChange: (cat: string) => void;
  onReset: () => void;
  onSave: (e: React.FormEvent) => void;
  onEditLetter: (letter: Letter) => void;
  onDeleteLetter: (id: string) => void;
  onInsertTableTemplate: () => void;
  onGenerateAI: () => void;
}

export default function LetterForm(props: LetterFormProps) {
  const {
    id, title, setTitle, letterNumber, setLetterNumber, recipient, setRecipient,
    subject, setSubject, content, setContent, senderName, setSenderName,
    senderRole, setSenderRole, lampiran, setLampiran, attachment, setAttachment,
    letterDate, setLetterDate, category, aiPrompt, setAiPrompt,
    searchQuery, setSearchQuery, isEditing, submitting, aiLoading, loading,
    filteredLetters, onCategoryChange, onReset, onSave,
    onEditLetter, onDeleteLetter, onInsertTableTemplate, onGenerateAI,
  } = props;

  return (
    <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* AI Drafting Assistant */}
      <div className="letters-card ai-box">
        <h2 className="card-title" style={{ color: "var(--color-primary)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/></svg>
          Groq AI Letter Assistant
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--color-gray-600)", marginBottom: "1rem" }}>
          Ketik instruksi surat (misal: *&quot;Surat izin siswa mengikuti program Tour Guide tanggal 7-8 Juli&quot;*). Groq akan menyusun isinya secara otomatis.
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
          style={{ background: "var(--color-primary)", color: "#ffffff", border: "none", fontWeight: "700", cursor: "pointer" }}
          onClick={onGenerateAI}
          disabled={aiLoading}
        >
          {aiLoading ? "Sedang Menyusun Draf..." : " Buat Draf Surat"}
        </button>
      </div>

      {/* Letter Editor Form */}
      <div className="letters-card">
        <h2 className="card-title">{isEditing ? "️ Edit Surat" : "️ Buat Surat Baru"}</h2>
        <form onSubmit={onSave}>
          <div className="form-group">
            <label>Judul Arsip (Internal) *</label>
            <input type="text" className="form-input" placeholder="e.g., Surat Permohonan Izin Tour Guide" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label>Kategori Surat</label>
              <select className="form-input" value={category} onChange={(e) => onCategoryChange(e.target.value)}>
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
              <input type="text" className="form-input" value={letterNumber} onChange={(e) => setLetterNumber(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label>Perihal *</label>
              <input type="text" className="form-input" placeholder="e.g., Permohonan Izin" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Tanggal Surat *</label>
              <input type="text" className="form-input" value={letterDate} onChange={(e) => setLetterDate(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label>Penerima Surat (Yth...) *</label>
              <input type="text" className="form-input" placeholder="e.g., Bapak/Ibu Kepala SMA Negeri 1 Pulau Taliabu" value={recipient} onChange={(e) => setRecipient(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Lampiran</label>
              <input type="text" className="form-input" value={lampiran} onChange={(e) => setLampiran(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Isi Surat (HTML/Teks) *</label>
            <textarea className="form-textarea" rows={8} placeholder="Tulis paragraf isi surat di sini..." value={content} onChange={(e) => setContent(e.target.value)} required />
          </div>

          <div className="form-group" style={{ borderTop: "1px solid var(--color-gray-100)", paddingTop: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label style={{ margin: 0 }}>Isi Lampiran (Opsional - Tabel/Daftar Siswa)</label>
              <button
                type="button"
                style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)", border: "1px solid var(--color-primary-light)", fontSize: "0.75rem", fontWeight: "700", padding: "0.25rem 0.5rem", borderRadius: "var(--radius-xs)", cursor: "pointer" }}
                onClick={onInsertTableTemplate}
              >
                Sisipkan Tabel Lampiran
              </button>
            </div>
            <textarea className="form-textarea" rows={6} placeholder="Tulis detail lampiran di sini (Mendukung HTML Table)..." value={attachment} onChange={(e) => setAttachment(e.target.value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label>Nama Penandatangan</label>
              <input type="text" className="form-input" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Jabatan Penandatangan</label>
              <input type="text" className="form-input" value={senderRole} onChange={(e) => setSenderRole(e.target.value)} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
            <button type="submit" className="form-input" style={{ background: "var(--color-primary-dark)", color: "#ffffff", border: "none", fontWeight: "700", cursor: "pointer", flex: 2 }} disabled={submitting}>
              {submitting ? "Menyimpan..." : isEditing ? "Perbarui Surat" : "Simpan Surat"}
            </button>
            <button type="button" className="form-input" style={{ background: "var(--color-gray-100)", border: "none", fontWeight: "600", cursor: "pointer", flex: 1 }} onClick={onReset}>
              Reset / Baru
            </button>
          </div>
        </form>
      </div>

      {/* Letter Archive */}
      <div className="letters-card">
        <h2 className="card-title"> Arsip Surat Resmi</h2>
        <div className="form-group">
          <input type="text" className="form-input" placeholder="Cari surat..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        {loading ? (
          <p style={{ color: "var(--color-gray-500)", textAlign: "center", padding: "1.5rem" }}>Memuat arsip surat...</p>
        ) : filteredLetters.length === 0 ? (
          <p style={{ color: "var(--color-gray-500)", textAlign: "center", padding: "1.5rem" }}>Tidak ada surat ditemukan.</p>
        ) : (
          <div className="history-list">
            {filteredLetters.map((l) => (
              <div key={l.id} className={`history-item ${id === l.id ? "active" : ""}`}>
                <div style={{ flex: 1, cursor: "pointer" }} onClick={() => onEditLetter(l)}>
                  <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--color-gray-900)" }}>{l.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", marginTop: "2px" }}>
                    No: {l.letter_number} &nbsp;|&nbsp; Kpd: {l.recipient}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button type="button" style={{ border: "none", background: "none", cursor: "pointer", fontSize: "1.1rem" }} title="Edit Surat" onClick={() => onEditLetter(l)}>️</button>
                  <button type="button" style={{ border: "none", background: "none", cursor: "pointer", fontSize: "1.1rem" }} title="Hapus Surat" onClick={() => onDeleteLetter(l.id!)}>️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
