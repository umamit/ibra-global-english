"use client";

import React, { useRef } from "react";
import { Student, Payment } from "@/types";
import { SPPCardPrintTemplate } from "./SPPCardPrintTemplate";

interface AnnualSPPCardModalProps {
  isOpen: boolean; onClose: () => void; student: Student | null; allPayments: Payment[];
  sppPrices: Record<string, number>; formatRupiah: (val: number) => string; selectedYear?: string;
}

const MONTH_NAMES = [
  { key: "01", label: "Januari" }, { key: "02", label: "Februari" }, { key: "03", label: "Maret" },
  { key: "04", label: "April" }, { key: "05", label: "Mei" }, { key: "06", label: "Juni" },
  { key: "07", label: "Juli" }, { key: "08", label: "Agustus" }, { key: "09", label: "September" },
  { key: "10", label: "Oktober" }, { key: "11", label: "November" }, { key: "12", label: "Desember" }
];

export default function AnnualSPPCardModal({ isOpen, onClose, student, allPayments, sppPrices, formatRupiah, selectedYear = "2026" }: AnnualSPPCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  if (!isOpen || !student) return null;

  const basePrice = sppPrices[student.program] || 300000;
  const joinMonth = student.created_at ? student.created_at.substring(0, 7) : "2026-01";

  const matrixData = MONTH_NAMES.map(({ key, label }) => {
    const monthCode = `${selectedYear}-${key}`;
    const pay = allPayments.find(p => p.student_id === student.id && p.month === monthCode);
    const isBeforeJoin = joinMonth > monthCode;
    let status = pay ? (pay.status || "belum_bayar") : (isBeforeJoin ? "belum_masuk" : "belum_bayar");
    return { monthCode, label, status, amount: status === "lunas" ? (pay?.amount || basePrice) : basePrice, payDate: pay?.payment_date ? pay.payment_date.substring(0, 10) : "-", payMethod: pay?.payment_method || "Transfer Bank" };
  });

  const totalPaidCount = matrixData.filter(m => m.status === "lunas").length;
  const totalPaidAmount = matrixData.filter(m => m.status === "lunas").reduce((acc, curr) => acc + curr.amount, 0);
  const totalUnpaidCount = matrixData.filter(m => m.status === "belum_bayar").length;

  const handlePrint = () => {
    const printContent = cardRef.current;
    if (!printContent) return;
    const printWindow = window.open("", "_blank", "width=900,height=750");
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>Kartu SPP - ${student.name}</title></head><body>${printContent.innerHTML}<script>window.onload = function() { window.print(); }</script></body></html>`);
    printWindow.document.close();
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", width: "100%", maxWidth: "860px", maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0" }}>
          <div><h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#216c7e", margin: 0 }}>Kartu SPP Tahunan ({selectedYear})</h3></div>
          <div style={{ display: "flex", gap: "0.5rem" }}><button onClick={handlePrint} className="btn-portal-primary">Cetak Kartu</button><button onClick={onClose} className="btn-portal-outline">Tutup</button></div>
        </div>
        <div style={{ padding: "1.5rem" }}>
          <SPPCardPrintTemplate student={student} selectedYear={selectedYear} basePrice={basePrice} formatRupiah={formatRupiah} matrixData={matrixData} totalPaidCount={totalPaidCount} totalPaidAmount={totalPaidAmount} totalUnpaidCount={totalUnpaidCount} cardRef={cardRef} />
        </div>
      </div>
    </div>
  );
}
