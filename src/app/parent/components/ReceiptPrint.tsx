"use client";

import { useState, useMemo } from "react";

interface PaymentRecord {
  id?: string;
  amount: number | string;
  month: string;
  status?: string;
  payment_date?: string;
}

interface SelectedChild {
  name?: string;
  program?: string;
}

interface PaymentSettings {
  contact_address?: string;
  payment_bank_name?: string;
  payment_account_number?: string;
  payment_account_name?: string;
  payment_account_sub?: string;
}

interface ReceiptPrintProps {
  printReceipt: PaymentRecord | null;
  selectedChild: SelectedChild | null;
  parentName: string;
  paymentSettings: PaymentSettings;
  getTerbilang: (amount: number | string) => string;
  getMonthName: (month: string) => string;
  getIndonesianDate: (date: string) => string;
  onBack: () => void;
}

export default function ReceiptPrint({ printReceipt, selectedChild, parentName, paymentSettings, getTerbilang, getMonthName, getIndonesianDate, onBack }: ReceiptPrintProps) {
  const receiptNo = useMemo(() => {
    if (!printReceipt) return "";
    return `IBRA-REC-${printReceipt.id ? printReceipt.id.slice(0, 8).toUpperCase() : "DRAFT"}`;
  }, [printReceipt]);

  if (!printReceipt) return null;

  const terbilangStr = getTerbilang(printReceipt.amount);

  return (
    <div style={{ padding: "2rem", backgroundColor: "white", minHeight: "100vh", color: "#333", fontFamily: "sans-serif" }}>
      <div className="no-print" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)" }}>
          * Anda sedang melihat pratinjau cetak kuitansi. Tekan Ctrl+P atau Cmd+P jika dialog print tidak terbuka otomatis.
        </p>
        <button className="btn-portal-outline" onClick={onBack}>
          ← Kembali ke Portal
        </button>
      </div>

      {/* PRINT-OPTIMIZED RECEIPT LAYOUT */}
      <div className="printable-receipt" style={{ border: "2px solid #333", padding: "2.5rem", borderRadius: "8px", maxWidth: "700px", margin: "0 auto", position: "relative" }}>

        {/* Header Kop Surat */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "3px double var(--color-primary, #216c7e)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <img src="/assets/logo.png" alt="Ibra Logo" style={{ width: "60px", height: "60px", objectFit: "contain" }} />
            <div style={{ textAlign: "left" }}>
              <h1 style={{ fontSize: "1.35rem", fontWeight: "900", margin: "0", color: "var(--color-primary-dark)" }}>IBRA GLOBAL ENGLISH</h1>
              <p style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--color-accent)", margin: "0" }}>Belajar Seru, Lancar Bicara</p>
              <p style={{ fontSize: "0.7rem", color: "#666", margin: "2px 0 0" }}>{paymentSettings.contact_address || "Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001, Bobong, Taliabu Barat, Kabupaten Pulau Taliabu, Maluku Utara 97794"}</p>
              <p style={{ fontSize: "0.65rem", color: "#888", margin: "0", fontWeight: "600" }}>Di bawah naungan PT Ibra Global English</p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0", letterSpacing: "1px" }}>KUITANSI PEMBAYARAN</h2>
            <p style={{ fontSize: "0.75rem", color: "#555", margin: "4px 0 0", fontFamily: "monospace" }}>No: {receiptNo}</p>
          </div>
        </div>

        {/* Receipt Body */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.9rem", lineHeight: "1.6" }}>

          <div className="receipt-row">
            <span style={{ fontWeight: "700", color: "#555" }}>Telah Terima Dari <span style={{ float: "right" }}>(Received From)</span></span>
            <span>:</span>
            <span style={{ fontWeight: "700" }}>{parentName}</span>
          </div>

          <div className="receipt-row">
            <span style={{ fontWeight: "700", color: "#555" }}>Nama Siswa <span style={{ float: "right" }}>(Student Name)</span></span>
            <span>:</span>
            <span style={{ fontWeight: "700", color: "var(--color-primary-dark)" }}>{selectedChild?.name}</span>
          </div>

          <div className="receipt-row">
            <span style={{ fontWeight: "700", color: "#555" }}>Program / Level <span style={{ float: "right" }}>(Program / Level)</span></span>
            <span>:</span>
            <span>{selectedChild?.program}</span>
          </div>

          <div className="receipt-row">
            <span style={{ fontWeight: "700", color: "#555" }}>Untuk Pembayaran <span style={{ float: "right" }}>(For Payment of)</span></span>
            <span>:</span>
            <span>Pembayaran SPP Kursus Masa {getMonthName(printReceipt.month)}</span>
          </div>

          <div className="receipt-row">
            <span style={{ fontWeight: "700", color: "#555" }}>Sejumlah Uang <span style={{ float: "right" }}>(Amount in Words)</span></span>
            <span>:</span>
            <span style={{ fontStyle: "italic", fontWeight: "700", color: "#444" }}>## {terbilangStr} ##</span>
          </div>

        </div>

        {/* Amount Box and Signatures */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "2.5rem" }}>

          {/* Amount Box */}
          <div style={{ border: "2px solid #333", padding: "0.75rem 1.5rem", borderRadius: "4px", backgroundColor: "#f8fafc", display: "inline-block" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", display: "block", color: "#555", borderBottom: "1px solid #333", paddingBottom: "2px", marginBottom: "4px" }}>JUMLAH (AMOUNT)</span>
            <span style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-primary-dark)", fontFamily: "monospace" }}>
              Rp {parseInt(String(printReceipt.amount)).toLocaleString("id-ID")},-
            </span>
          </div>

          {/* Signature Area with Official Digital Stamp */}
          <div style={{ textAlign: "center", width: "240px", fontSize: "0.85rem", position: "relative" }}>
            <p style={{ margin: "0 0 3.5rem" }}>Bobong, {printReceipt.payment_date && printReceipt.payment_date !== "-" ? getIndonesianDate(printReceipt.payment_date) : getIndonesianDate(new Date().toISOString().split("T")[0])}</p>

            {/* Official Digital Stamp (Stempel LUNAS & VERIFIED) */}
            {printReceipt.status === "lunas" && (
              <div style={{
                position: "absolute",
                top: "1.2rem",
                left: "-15px",
                transform: "rotate(-12deg)",
                pointerEvents: "none",
                zIndex: 2,
                opacity: 0.9,
                mixBlendMode: "multiply"
              }}>
                <svg width="130" height="130" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer Outer Circle */}
                  <circle cx="70" cy="70" r="66" stroke="#216c7e" strokeWidth="3" strokeDasharray="6 3" />
                  {/* Outer Solid Circle */}
                  <circle cx="70" cy="70" r="60" stroke="#216c7e" strokeWidth="2.5" />
                  {/* Inner Solid Circle */}
                  <circle cx="70" cy="70" r="44" stroke="#216c7e" strokeWidth="1.5" />
                  
                  {/* Curved Top Text */}
                  <path id="textPathTop" d="M 22,70 A 48,48 0 1,1 118,70" fill="none" />
                  <text fill="#216c7e" fontSize="8.5" fontWeight="800" letterSpacing="1px">
                    <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
                      PT IBRA GLOBAL ENGLISH
                    </textPath>
                  </text>

                  {/* Curved Bottom Text */}
                  <path id="textPathBottom" d="M 118,70 A 48,48 0 0,1 22,70" fill="none" />
                  <text fill="#216c7e" fontSize="7.5" fontWeight="700" letterSpacing="0.5px">
                    <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">
                      OFFICIAL VERIFIED
                    </textPath>
                  </text>

                  {/* Center Content Box */}
                  <rect x="25" y="52" width="90" height="36" fill="#ffffff" rx="4" stroke="#216c7e" strokeWidth="1.5" />
                  <text x="70" y="67" textAnchor="middle" fill="#216c7e" fontSize="11" fontWeight="900" letterSpacing="1px">
                    LUNAS
                  </text>
                  <text x="70" y="81" textAnchor="middle" fill="#a68849" fontSize="8" fontWeight="800" letterSpacing="0.5px">
                    VERIFIED &amp; VALID
                  </text>
                </svg>
              </div>
            )}

            <div style={{ borderBottom: "1px solid #333", width: "180px", margin: "0 auto 4px", position: "relative", zIndex: 1 }}></div>
            <p style={{ fontWeight: "800", margin: "0", color: "var(--color-primary-dark)" }}>Kasir / Finance Office</p>
            <p style={{ fontSize: "0.7rem", color: "#777", margin: "0" }}>Ibra Global English Bobong</p>
          </div>

        </div>

        {/* Watermark/Footer stamp */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-15deg)", opacity: "0.03", fontSize: "4.5rem", fontWeight: "900", color: "var(--color-primary)", pointerEvents: "none", whiteSpace: "nowrap", border: "8px solid var(--color-primary)", padding: "10px 20px", borderRadius: "16px" }}>
          PAID &bull; LUNAS
        </div>

      </div>
    </div>
  );
}
