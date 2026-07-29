"use client";

import React, { useRef } from "react";
import { Student, Payment } from "@/types";

interface AnnualSPPCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  allPayments: Payment[];
  sppPrices: Record<string, number>;
  formatRupiah: (val: number) => string;
  selectedYear?: string;
}

const MONTH_NAMES = [
  { key: "01", label: "Januari" },
  { key: "02", label: "Februari" },
  { key: "03", label: "Maret" },
  { key: "04", label: "April" },
  { key: "05", label: "Mei" },
  { key: "06", label: "Juni" },
  { key: "07", label: "Juli" },
  { key: "08", label: "Agustus" },
  { key: "09", label: "September" },
  { key: "10", label: "Oktober" },
  { key: "11", label: "November" },
  { key: "12", label: "Desember" }
];

export default function AnnualSPPCardModal({
  isOpen,
  onClose,
  student,
  allPayments,
  sppPrices,
  formatRupiah,
  selectedYear = "2026"
}: AnnualSPPCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !student) return null;

  const basePrice = sppPrices[student.program] || 300000;
  const joinMonth = student.created_at ? student.created_at.substring(0, 7) : "2026-01";

  // Build 12 month data
  const matrixData = MONTH_NAMES.map(({ key, label }) => {
    const monthCode = `${selectedYear}-${key}`;
    const pay = allPayments.find(p => p.student_id === student.id && p.month === monthCode);

    const isBeforeJoin = joinMonth > monthCode;

    let status = "belum_bayar";
    let paidAmount = 0;
    let payDate = "-";
    let payMethod = "-";

    if (pay) {
      status = pay.status || "belum_bayar";
      paidAmount = pay.amount || basePrice;
      payDate = pay.payment_date ? pay.payment_date.substring(0, 10) : "-";
      payMethod = pay.payment_method || "Transfer Bank";
    } else if (isBeforeJoin) {
      status = "belum_masuk";
    }

    return {
      monthCode,
      label,
      status,
      amount: status === "lunas" ? paidAmount : basePrice,
      payDate,
      payMethod
    };
  });

  const totalPaidCount = matrixData.filter(m => m.status === "lunas").length;
  const totalPaidAmount = matrixData
    .filter(m => m.status === "lunas")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalUnpaidCount = matrixData.filter(m => m.status === "belum_bayar").length;

  const handlePrint = () => {
    const printContent = cardRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=900,height=750");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kartu SPP Tahunan - ${student.name}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            body {
              font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 0;
              background-color: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .card-container {
              border: 2px solid #216c7e;
              border-radius: 12px;
              padding: 25px;
              background: #fff;
            }
            .header-banner {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 2px solid #216c7e;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .logo-group {
              display: flex;
              align-items: center;
              gap: 15px;
            }
            .logo-group img {
              width: 55px;
              height: 55px;
              object-fit: contain;
            }
            .title-group h1 {
              font-size: 1.3rem;
              margin: 0;
              color: #216c7e;
              font-weight: 800;
            }
            .title-group p {
              font-size: 0.8rem;
              margin: 3px 0 0;
              color: #a68849;
              font-weight: 700;
            }
            .student-info {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 12px 18px;
              margin-bottom: 20px;
              font-size: 0.85rem;
            }
            .info-item {
              display: flex;
              gap: 8px;
            }
            .info-label {
              font-weight: 600;
              color: #64748b;
              width: 110px;
            }
            .info-val {
              font-weight: 700;
              color: #0f172a;
            }
            .matrix-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              margin-bottom: 20px;
            }
            .month-box {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 10px 12px;
              background: #fafafa;
            }
            .month-name {
              font-weight: 800;
              font-size: 0.85rem;
              color: #1e293b;
              margin-bottom: 6px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .badge-lunas {
              background: #d1fae5;
              color: #065f46;
              font-size: 0.68rem;
              font-weight: 800;
              padding: 2px 7px;
              border-radius: 6px;
            }
            .badge-pending {
              background: #fef3c7;
              color: #92400e;
              font-size: 0.68rem;
              font-weight: 800;
              padding: 2px 7px;
              border-radius: 6px;
            }
            .badge-unpaid {
              background: #ffe4e6;
              color: #9f1239;
              font-size: 0.68rem;
              font-weight: 800;
              padding: 2px 7px;
              border-radius: 6px;
            }
            .badge-skip {
              background: #f1f5f9;
              color: #64748b;
              font-size: 0.68rem;
              font-weight: 600;
              padding: 2px 7px;
              border-radius: 6px;
            }
            .month-detail {
              font-size: 0.75rem;
              color: #475569;
              line-height: 1.4;
            }
            .summary-box {
              display: flex;
              justify-content: space-between;
              background: rgba(33, 108, 126, 0.06);
              border: 1px solid rgba(33, 108, 126, 0.2);
              border-radius: 8px;
              padding: 12px 18px;
              font-size: 0.85rem;
            }
            .summary-item strong {
              color: #216c7e;
              font-weight: 800;
            }
            .footer-sign {
              margin-top: 30px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              font-size: 0.8rem;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(4px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div style={{
        backgroundColor: "var(--color-bg-card, #ffffff)",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "860px",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Header Bar Modal */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid var(--color-gray-200, #e2e8f0)"
        }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--color-primary-dark)", margin: 0 }}>
               Kartu SPP Tahunan ({selectedYear})
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", margin: "2px 0 0" }}>
              Rekapitulasi 12 bulan pembayaran SPP an. <strong>{student.name}</strong>
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handlePrint}
              className="btn-portal-primary"
              style={{ padding: "0.45rem 0.9rem", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              ️ Cetak Kartu SPP
            </button>
            <button
              onClick={onClose}
              className="btn-portal-outline"
              style={{ padding: "0.45rem 0.75rem", fontSize: "0.85rem" }}
            >
               Tutup
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div style={{ padding: "1.5rem" }}>
          <div ref={cardRef} className="card-container">
            {/* Header Banner */}
            <div className="header-banner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #216c7e", paddingBottom: "12px", marginBottom: "16px" }}>
              <div className="logo-group" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img src="/assets/logo.png" alt="Logo" style={{ width: "50px", height: "50px", objectFit: "contain" }} />
                <div className="title-group">
                  <h1 style={{ margin: 0, fontSize: "1.2rem", color: "#216c7e", fontWeight: "800" }}>IBRA GLOBAL ENGLISH</h1>
                  <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#a68849", fontWeight: "700" }}>KARTU REKAPITULASI SPP TAHUNAN ({selectedYear})</p>
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: "0.75rem", color: "#64748b" }}>
                <div>Bobong, Pulau Taliabu</div>
                <div style={{ fontWeight: 700, color: "#216c7e" }}>Tahun Ajaran {selectedYear}</div>
              </div>
            </div>

            {/* Student Info Box */}
            <div className="student-info" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px 16px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "0.85rem" }}>
              <div className="info-item"><span className="info-label" style={{ fontWeight: 600, color: "#64748b", width: "100px", display: "inline-block" }}>Nama Siswa</span>: <strong className="info-val" style={{ color: "#0f172a" }}>{student.name}</strong></div>
              <div className="info-item"><span className="info-label" style={{ fontWeight: 600, color: "#64748b", width: "100px", display: "inline-block" }}>Wali Murid</span>: <span className="info-val" style={{ color: "#0f172a", fontWeight: 700 }}>{student.profiles?.full_name || "-"}</span></div>
              <div className="info-item"><span className="info-label" style={{ fontWeight: 600, color: "#64748b", width: "100px", display: "inline-block" }}>Program</span>: <span className="info-val" style={{ color: "#0f172a", fontWeight: 700 }}>{student.program}</span></div>
              <div className="info-item"><span className="info-label" style={{ fontWeight: 600, color: "#64748b", width: "100px", display: "inline-block" }}>Nominal / Bln</span>: <span className="info-val" style={{ color: "#216c7e", fontWeight: 800 }}>{formatRupiah(basePrice)}</span></div>
            </div>

            {/* 12 Month Grid */}
            <div className="matrix-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
              {matrixData.map((m) => (
                <div key={m.monthCode} className="month-box" style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px", backgroundColor: m.status === "lunas" ? "#f0fdf4" : m.status === "menunggu_konfirmasi" ? "#fffbeb" : m.status === "belum_masuk" ? "#f8fafc" : "#fff1f2" }}>
                  <div className="month-name" style={{ fontWeight: 800, fontSize: "0.82rem", color: "#1e293b", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{m.label}</span>
                    {m.status === "lunas" && <span className="badge-lunas" style={{ background: "#d1fae5", color: "#065f46", fontSize: "0.65rem", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>LUNAS</span>}
                    {m.status === "menunggu_konfirmasi" && <span className="badge-pending" style={{ background: "#fef3c7", color: "#92400e", fontSize: "0.65rem", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>KONFIRMASI</span>}
                    {m.status === "belum_bayar" && <span className="badge-unpaid" style={{ background: "#ffe4e6", color: "#9f1239", fontSize: "0.65rem", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>BELUM BAYAR</span>}
                    {m.status === "belum_masuk" && <span className="badge-skip" style={{ background: "#f1f5f9", color: "#64748b", fontSize: "0.65rem", fontWeight: 600, padding: "2px 6px", borderRadius: "4px" }}>BELUM BERGABUNG</span>}
                  </div>
                  <div className="month-detail" style={{ fontSize: "0.72rem", color: "#475569", lineHeight: 1.3 }}>
                    <div>Nominal: <strong>{formatRupiah(m.amount)}</strong></div>
                    <div>Tgl Bayar: {m.payDate}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Footer */}
            <div className="summary-box" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(33, 108, 126, 0.06)", border: "1px solid rgba(33, 108, 126, 0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "0.82rem" }}>
              <div className="summary-item">Bulan Lunas: <strong style={{ color: "#065f46" }}>{totalPaidCount} / 12 Bulan</strong></div>
              <div className="summary-item">Total Terbayar: <strong style={{ color: "#216c7e", fontSize: "0.95rem" }}>{formatRupiah(totalPaidAmount)}</strong></div>
              <div className="summary-item">Sisa Tagihan: <strong style={{ color: totalUnpaidCount > 0 ? "#9f1239" : "#065f46" }}>{totalUnpaidCount} Bulan</strong></div>
            </div>

            {/* Signatures for Print */}
            <div className="footer-sign" style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: "0.78rem" }}>
              <div style={{ color: "#64748b" }}>
                * Dokumen ini diterbitkan secara elektronik oleh Admin Ibra Global English Bobong.
              </div>
              <div style={{ textAlign: "center", width: "180px" }}>
                <div>Bobong, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
                <div style={{ borderBottom: "1px solid #333", margin: "40px auto 4px" }}></div>
                <div style={{ fontWeight: 800, color: "#216c7e" }}>Admin Keuangan</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
