"use client";

import { useState, useMemo } from "react";

export default function ReceiptPrint({ printReceipt, selectedChild, parentName, paymentSettings, getTerbilang, getMonthName, getIndonesianDate, onBack }) {
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "3px double #333", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <img src="/assets/logo.png" alt="Ibra Logo" style={{ width: "56px", height: "56px" }} />
            <div style={{ textAlign: "left" }}>
              <h1 style={{ fontSize: "1.35rem", fontWeight: "900", margin: "0", color: "var(--color-primary-dark)" }}>IBRA GLOBAL ENGLISH</h1>
              <p style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--color-accent)", margin: "0" }}>Belajar Seru, Lancar Bicara</p>
              <p style={{ fontSize: "0.7rem", color: "#666", margin: "2px 0 0" }}>{paymentSettings.contact_address || "Jl. TPU Bobong Komp. Fangahu, Lantai 1 Kost Fitrah"}</p>
              <p style={{ fontSize: "0.65rem", color: "#888", margin: "0", fontWeight: "600" }}>Di bawah naungan PT Ibra Global English</p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "900", color: "#333", margin: "0", letterSpacing: "1px" }}>KUITANSI PEMBAYARAN</h2>
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
              Rp {parseInt(printReceipt.amount).toLocaleString("id-ID")},-
            </span>
          </div>

          {/* Signature Area */}
          <div style={{ textAlign: "center", width: "220px", fontSize: "0.85rem" }}>
            <p style={{ margin: "0 0 4rem" }}>Bobong, {printReceipt.payment_date && printReceipt.payment_date !== "-" ? getIndonesianDate(printReceipt.payment_date) : getIndonesianDate(new Date().toISOString().split("T")[0])}</p>
            <div style={{ borderBottom: "1px solid #333", width: "180px", margin: "0 auto 4px" }}></div>
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