"use client";

import React from "react";
import TaxArchiveForm from "./TaxArchiveForm";

interface TaxRecord { id: string; tax_period: string; tax_year: string | number; tax_type: string; gross_revenue: number; tax_due: number; status: string; payment_date: string; ntpn_code: string; bpe_code: string; }
interface Props extends Omit<React.ComponentProps<typeof TaxArchiveForm>, ""> {
  records: TaxRecord[]; loading: boolean; saving: boolean; handleDeleteRecord: (id: string) => void; formatRupiah: (value: number) => string; onPrintArchive: () => void;
  formYear: string | number; setFormYear: (v: string) => void; formPeriod: string; setFormPeriod: (v: string) => void; formType: string; setFormType: (v: string) => void;
  formRevenue: string | number; setFormRevenue: (v: string) => void; formTaxDue: string | number; setFormTaxDue: (v: string) => void; formStatus: string; setFormStatus: (v: string) => void;
  formPaymentDate: string; setFormPaymentDate: (v: string) => void; formNtpn: string; setFormNtpn: (v: string) => void; formBpe: string; setFormBpe: (v: string) => void;
  handleAddRecord: React.FormEventHandler<HTMLFormElement>;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = { "Sudah Dilaporkan": { bg: "rgba(16, 185, 129, 0.15)", color: "#10b981" }, "Sudah Bayar": { bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }, "Nihil": { bg: "rgba(107, 114, 128, 0.15)", color: "#6b7280" } };

export default function TaxArchive({ records, loading, saving, formatRupiah, onPrintArchive, handleDeleteRecord, formYear, setFormYear, formPeriod, setFormPeriod, formType, setFormType, formRevenue, setFormRevenue, formTaxDue, setFormTaxDue, formStatus, setFormStatus, formPaymentDate, setFormPaymentDate, formNtpn, setFormNtpn, formBpe, setFormBpe, handleAddRecord }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <TaxArchiveForm saving={saving} formYear={formYear} setFormYear={setFormYear} formPeriod={formPeriod} setFormPeriod={setFormPeriod} formType={formType} setFormType={setFormType} formRevenue={formRevenue} setFormRevenue={setFormRevenue} formTaxDue={formTaxDue} setFormTaxDue={setFormTaxDue} formStatus={formStatus} setFormStatus={setFormStatus} formPaymentDate={formPaymentDate} setFormPaymentDate={setFormPaymentDate} formNtpn={formNtpn} setFormNtpn={setFormNtpn} formBpe={formBpe} setFormBpe={setFormBpe} handleAddRecord={handleAddRecord} />

      <div className="portal-card print-card" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--color-gray-800)", margin: 0 }}>Riwayat Pembayaran &amp; Pelaporan SPT PT Perseorangan</h3>
          {!loading && records.length > 0 && <button onClick={onPrintArchive} className="btn-portal-outline no-print" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", fontWeight: "700" }}>Cetak Riwayat (PDF)</button>}
        </div>
        {loading ? <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-gray-400)" }}>Memuat data arsip...</div>
          : records.length === 0 ? <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-gray-400)", fontSize: "0.9rem" }}>Belum ada arsip pelaporan yang terekam.</div>
          : (
            <div style={{ overflowX: "auto" }}>
              <table className="portal-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--color-gray-250)", textAlign: "left", fontSize: "0.85rem", color: "var(--color-gray-500)", textTransform: "uppercase" }}>
                    {["Periode", "Jenis Pajak", "Omzet Kotor", "Pajak Terutang", "Status", "Detail Dokumen"].map(h => <th key={h} style={{ padding: "12px 10px" }}>{h}</th>)}
                    <th className="no-print" style={{ padding: "12px 10px", textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(rec => {
                    const st = STATUS_STYLE[rec.status] || { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" };
                    return (
                      <tr key={rec.id} style={{ borderBottom: "1px solid var(--color-gray-200)", fontSize: "0.925rem", color: "var(--color-gray-800)" }}>
                        <td style={{ padding: "14px 10px", fontWeight: "700" }}>{rec.tax_period} {rec.tax_year}</td>
                        <td style={{ padding: "14px 10px", color: "var(--color-primary-dark)", fontWeight: "600" }}>{rec.tax_type}</td>
                        <td style={{ padding: "14px 10px" }}>{formatRupiah(rec.gross_revenue)}</td>
                        <td style={{ padding: "14px 10px", fontWeight: "700", color: rec.tax_due > 0 ? "#ef4444" : "var(--color-gray-700)" }}>{formatRupiah(rec.tax_due)}</td>
                        <td style={{ padding: "14px 10px" }}><span style={{ padding: "0.3rem 0.6rem", borderRadius: "50px", fontSize: "0.75rem", fontWeight: "800", backgroundColor: st.bg, color: st.color }}>{rec.status}</span></td>
                        <td style={{ padding: "14px 10px", fontSize: "0.8rem", color: "var(--color-gray-500)", lineHeight: "1.4" }}><div>Tgl: {rec.payment_date}</div><div>NTPN: {rec.ntpn_code}</div><div>BPE: {rec.bpe_code}</div></td>
                        <td className="no-print" style={{ padding: "14px 10px", textAlign: "right" }}><button onClick={() => handleDeleteRecord(rec.id)} className="btn-portal-danger" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>Hapus</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}
