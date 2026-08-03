"use client";

import { useEffect } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import OfflineFormBody from "./OfflineFormBody";

export default function OfflineFormPage() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  const handlePrint = () => { posthog.capture("offline_form_printed"); window.print(); };

  return (
    <div className="print-body-wrapper" style={{ backgroundColor: "#f3f4f6", minHeight: "100vh", padding: "2rem 1rem" }}>
      {/* Kontrol Tombol - Tidak Tercetak */}
      <div className="no-print" style={{ maxWidth: "800px", margin: "0 auto 1.5rem auto", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", padding: "1rem 1.5rem", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
        <Link href="/" style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--color-primary-dark, #216c7e)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          ← Kembali ke Beranda
        </Link>
        <button className="btn-print" onClick={handlePrint} style={{ backgroundColor: "var(--color-primary)", color: "white", padding: "0.75rem 1.5rem", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <i className="fi fi-rr-print"></i>
          <span>Cetak Formulir (Print / Save PDF)</span>
        </button>
      </div>

      {/* Lembar Formulir */}
      <div className="print-page" style={{ maxWidth: "800px", margin: "0 auto", backgroundColor: "white", padding: "3rem", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", border: "1px solid #e5e7eb", borderRadius: "12px", boxSizing: "border-box" }}>
        <OfflineFormBody />
      </div>

      <style jsx>{`
        .form-print-row { display: flex; align-items: flex-end; margin-bottom: 0.38rem; font-size: 0.78rem; color: #374151; }
        .form-print-label { width: 170px; font-weight: 700; flex-shrink: 0; }
        .form-print-colon { width: 15px; flex-shrink: 0; font-weight: 700; }
        .form-print-line { flex-grow: 1; border-bottom: 1px dotted #4b5563; height: 1.0rem; margin-bottom: 2px; }
        @media print {
          @page { size: A4; margin: 8mm 12mm 8mm 12mm; }
          html, body { height: 99%; overflow: hidden; }
          .print-body-wrapper { background-color: white !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .print-page { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; max-width: 100% !important; width: 100% !important; }
          body { background: white !important; color: black !important; }
        }
      `}</style>
    </div>
  );
}
