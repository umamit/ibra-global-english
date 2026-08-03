// TaxArchiveForm.tsx - Form perekaman pajak baru
import React from "react";

interface FormProps {
  saving: boolean; formYear: string | number; setFormYear: (v: string) => void;
  formPeriod: string; setFormPeriod: (v: string) => void;
  formType: string; setFormType: (v: string) => void;
  formRevenue: string | number; setFormRevenue: (v: string) => void;
  formTaxDue: string | number; setFormTaxDue: (v: string) => void;
  formStatus: string; setFormStatus: (v: string) => void;
  formPaymentDate: string; setFormPaymentDate: (v: string) => void;
  formNtpn: string; setFormNtpn: (v: string) => void;
  formBpe: string; setFormBpe: (v: string) => void;
  handleAddRecord: React.FormEventHandler<HTMLFormElement>;
}

const labelStyle = { display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" } as const;
const PERIODS = ["Tahunan", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function TaxArchiveForm({ saving, formYear, setFormYear, formPeriod, setFormPeriod, formType, setFormType, formRevenue, setFormRevenue, formTaxDue, setFormTaxDue, formStatus, setFormStatus, formPaymentDate, setFormPaymentDate, formNtpn, setFormNtpn, formBpe, setFormBpe, handleAddRecord }: FormProps) {
  return (
    <div className="portal-card no-print" style={{ padding: "2rem" }}>
      <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>Rekam Pelaporan SPT / Pembayaran PPh Baru</h3>
      <form onSubmit={handleAddRecord} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
        <div><label style={labelStyle}>Tahun Pajak</label><input type="number" value={formYear} onChange={e => setFormYear(e.target.value)} className="portal-input" required /></div>
        <div>
          <label style={labelStyle}>Masa / Periode Pajak</label>
          <select value={formPeriod} onChange={e => setFormPeriod(e.target.value)} className="portal-input" style={{ height: "42px" }}>
            {PERIODS.map(p => <option key={p} value={p}>{p === "Tahunan" ? "Tahunan (SPT 1771)" : p}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Jenis Pelaporan Pajak</label>
          <select value={formType} onChange={e => setFormType(e.target.value)} className="portal-input" style={{ height: "42px" }}>
            <option value="PPh Final 0.5% (PP 55/2022)">PPh Final 0.5% (PP 55/2022)</option>
            <option value="PPh Badan Pasal 31E (Fasilitas)">PPh Badan Pasal 31E (Fasilitas)</option>
            <option value="PPh Pasal 21 (Karyawan)">PPh Pasal 21 (Karyawan)</option>
          </select>
        </div>
        <div><label style={labelStyle}>Omzet Bruto (Peredaran Bruto)</label><input type="number" value={formRevenue} onChange={e => setFormRevenue(e.target.value)} placeholder="Rp" className="portal-input" required /></div>
        <div><label style={labelStyle}>Nominal Pajak Terutang</label><input type="number" value={formTaxDue} onChange={e => setFormTaxDue(e.target.value)} placeholder="Rp" className="portal-input" required /></div>
        <div>
          <label style={labelStyle}>Status Dokumen</label>
          <select value={formStatus} onChange={e => setFormStatus(e.target.value)} className="portal-input" style={{ height: "42px" }}>
            {["Sudah Dilaporkan", "Sudah Bayar", "Kurang Bayar", "Nihil"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div><label style={labelStyle}>Tanggal Bayar / Lapor</label><input type="date" value={formPaymentDate} onChange={e => setFormPaymentDate(e.target.value)} className="portal-input" /></div>
        <div><label style={labelStyle}>Kode NTPN (Penyetoran)</label><input type="text" value={formNtpn} onChange={e => setFormNtpn(e.target.value)} placeholder="16 Digit Angka/Huruf" className="portal-input" /></div>
        <div><label style={labelStyle}>Kode BPE (Bukti Lapor)</label><input type="text" value={formBpe} onChange={e => setFormBpe(e.target.value)} placeholder="Kode Bukti Terima Elektronik" className="portal-input" /></div>
        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
          <button type="submit" disabled={saving} className="btn-portal-primary" style={{ padding: "0.75rem 2rem" }}>{saving ? "Menyimpan..." : "Rekam Laporan SPT"}</button>
        </div>
      </form>
    </div>
  );
}
