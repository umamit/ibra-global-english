"use client";

import React from "react";
import { Letter } from "../hooks/useLetterData";

interface LetterPreviewProps {
  letterNumber: string;
  lampiran: string;
  subject: string;
  recipient: string;
  content: string;
  letterDate: string;
  senderName: string;
  senderRole: string;
  attachment: string;
  onPrint: () => void;
}

export default function LetterPreview({ letterNumber, lampiran, subject, recipient, content, letterDate, senderName, senderRole, attachment, onPrint }: LetterPreviewProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Print button header */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--color-gray-900)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect width="12" height="8" x="6" y="14"/>
          </svg>
          Pratinjau Cetak Lembar A4
        </h2>
        <button
          type="button"
          className="no-print"
          style={{ padding: "0.5rem 1rem", borderRadius: "var(--radius-sm)", background: "var(--color-accent)", color: "#ffffff", border: "none", fontWeight: "700", cursor: "pointer", boxShadow: "var(--shadow-sm)", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
          onClick={onPrint}
          disabled={!content}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect width="12" height="8" x="6" y="14"/>
          </svg>
          Cetak Surat (PDF)
        </button>
      </div>

      {/* A4 Sheet */}
      <div className="letter-preview-sheet" id="print-area">
        {/* Letterhead */}
        <div className="official-letterhead">
          <img src="/assets/logo.png" alt="Logo IGE" className="letterhead-logo" width={60} height={64} />
          <div className="letterhead-info">
            <h2>IBRA GLOBAL ENGLISH</h2>
            <p className="address-line" style={{ fontSize: "0.78rem" }}>
              Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001,<br />
              Bobong, Taliabu Barat, Kabupaten Pulau Taliabu, Maluku Utara 97794<br />
              HP/WA: +62 813-5700-1357 | Email: <span style={{ textDecoration: "underline", color: "var(--color-primary)" }}>admin@ibraglobalenglish.uk</span>
            </p>
          </div>
        </div>

        {/* Meta block */}
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

        {/* Recipient */}
        <div className="letter-recipient-block">
          <div>Kepada Yth.</div>
          <div style={{ fontWeight: "bold" }}>{recipient || "________________________"}</div>
          <div>di Tempat</div>
        </div>

        {/* Salutation */}
        <div className="letter-salutation">Dengan hormat,</div>

        {/* Body */}
        <div
          className="letter-body"
          dangerouslySetInnerHTML={{
            __html: content || "<p style='color:#777; text-align:center;'>Isi draf surat masih kosong. Silakan gunakan <strong>Groq AI Assistant</strong> untuk menyusun draf secara otomatis.</p>",
          }}
        />

        {/* Signature */}
        <div className="letter-signature-block">
          <div className="letter-signature-wrap">
            <div>{letterDate || "Bobong, ___ ___________ 2026"}</div>
            <div>Hormat kami,</div>
            <div style={{ fontWeight: "bold" }}>IBRA GLOBAL ENGLISH</div>
            <div className="signature-space" />
            <div className="signature-name">{senderName}</div>
            <div style={{ fontSize: "0.9rem", color: "#333333" }}>{senderRole}</div>
          </div>
        </div>

        {/* Attachment page */}
        {attachment && (
          <div className="letter-attachment-page">
            <div className="no-print" style={{ borderBottom: "1px dashed #ccc", paddingBottom: "0.5rem", marginBottom: "1.5rem", color: "var(--color-primary-dark)", fontWeight: "bold" }}>
              Halaman 2: Lampiran Surat
            </div>
            <h3 className="attachment-title">LAMPIRAN</h3>
            <div className="attachment-body" dangerouslySetInnerHTML={{ __html: attachment }} />
          </div>
        )}
      </div>
    </div>
  );
}
