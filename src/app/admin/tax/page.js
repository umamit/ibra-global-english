"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { createAdminClient as createClient } from "@/utils/supabase/client";
import { DEFAULT_TAX_RECORDS } from "@/utils/fallbackData";

export default function AdminTaxPage() {
  const supabase = createClient();

  const [activeSubTab, setActiveSubTab] = useState("calculator"); // 'calculator' | 'archive'
  const [taxMethod, setTaxMethod] = useState("final_umkm"); // 'final_umkm' | 'badan_umum'
  
  // Calculator PPh Final UMKM
  const [grossRevenueFinal, setGrossRevenueFinal] = useState("");
  const [resultFinal, setResultFinal] = useState(null);

  // Calculator PPh Badan Pasal 31E
  const [grossRevenueBadan, setGrossRevenueBadan] = useState("");
  const [netProfitBadan, setNetProfitBadan] = useState("");
  const [resultBadan, setResultBadan] = useState(null);

  // Archive & Database states
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Form states for new record
  const [formYear, setFormYear] = useState(new Date().getFullYear());
  const [formPeriod, setFormPeriod] = useState("Tahunan");
  const [formType, setFormType] = useState("PPh Final 0.5% (PP 55/2022)");
  const [formRevenue, setFormRevenue] = useState("");
  const [formTaxDue, setFormTaxDue] = useState("");
  const [formStatus, setFormStatus] = useState("Sudah Dilaporkan");
  const [formPaymentDate, setFormPaymentDate] = useState("");
  const [formNtpn, setFormNtpn] = useState("");
  const [formBpe, setFormBpe] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  // Fetch tax records from Supabase
  useEffect(() => {
    async function fetchTaxRecords() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("landing_settings")
          .select("value")
          .eq("key", "tax_records_data")
          .single();
        
        if (error && error.code !== "PGRST116") throw error; // PGRST116 is empty/no rows
        if (data && data.value) {
          const parsed = JSON.parse(data.value);
          if (Array.isArray(parsed)) {
            setRecords(parsed);
            setLoading(false);
            return;
          }
        }
        setRecords(DEFAULT_TAX_RECORDS);
      } catch (e) {
        console.warn("Gagal mengambil data riwayat pajak dari database. Menggunakan data default.", e);
        setRecords(DEFAULT_TAX_RECORDS);
      } finally {
        setLoading(false);
      }
    }
    fetchTaxRecords();
  }, []);

  // Save updated records list to Supabase
  const saveRecordsToDatabase = async (updatedList) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("landing_settings")
        .upsert({ key: "tax_records_data", value: JSON.stringify(updatedList) });
      
      if (error) throw error;
      setRecords(updatedList);
      showToast("Arsip perpajakan berhasil diperbarui!");
      return true;
    } catch (err) {
      console.error("Gagal menyimpan data pajak:", err);
      showToast("Gagal menyimpan data ke database.", "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Handle calculation for PPh Final
  const handleCalculateFinal = (e) => {
    e.preventDefault();
    const rev = parseFloat(grossRevenueFinal);
    if (isNaN(rev) || rev < 0) {
      showToast("Masukkan nominal omzet yang valid!", "error");
      return;
    }
    // Tarif 0.5% PPh Final PP 55/2022
    const pphFinal = rev * 0.005;
    setResultFinal({
      revenue: rev,
      taxDue: pphFinal
    });
  };

  // Handle calculation for PPh Badan Pasal 31E
  const handleCalculateBadan = (e) => {
    e.preventDefault();
    const rev = parseFloat(grossRevenueBadan);
    const profit = parseFloat(netProfitBadan);
    if (isNaN(rev) || rev < 0 || isNaN(profit) || profit < 0) {
      showToast("Masukkan nominal omzet dan laba yang valid!", "error");
      return;
    }
    if (profit > rev) {
      showToast("Laba bersih tidak boleh melebihi total omzet!", "error");
      return;
    }

    // PPh Badan 31E UU HPP: diskon 50% dari tarif normal 22% (tarif efektif 11%) untuk omzet s/d 4.8 Miliar.
    // Jika omzet melebihi 4.8 Miliar s/d 50 Miliar, dihitung proporsional.
    let taxDue = 0;
    let explanation = "";

    if (rev <= 4800000000) {
      // Full mendapat fasilitas diskon 50%
      taxDue = profit * 0.11;
      explanation = "Karena omzet bruto tidak melebihi Rp 4.8 Miliar, seluruh Penghasilan Kena Pajak (PKP) berhak mendapatkan fasilitas pengurangan tarif 50% (tarif efektif 11%).";
    } else if (rev <= 50000000000) {
      // Proporsional mendapat fasilitas
      const bagianFasilitas = (4800000000 / rev) * profit;
      const bagianNonFasilitas = profit - bagianFasilitas;
      const pphFasilitas = bagianFasilitas * 0.11;
      const pphNonFasilitas = bagianNonFasilitas * 0.22;
      taxDue = pphFasilitas + pphNonFasilitas;
      explanation = `Omzet bruto antara Rp4.8M s/d Rp50M. PKP mendapat fasilitas proporsional: Rp ${bagianFasilitas.toLocaleString("id-ID")} dikenakan tarif 11%, dan sisa PKP non-fasilitas Rp ${bagianNonFasilitas.toLocaleString("id-ID")} dikenakan tarif umum 22%.`;
    } else {
      // Tidak mendapat fasilitas (Tarif penuh 22%)
      taxDue = profit * 0.22;
      explanation = "Omzet bruto melebihi Rp 50 Miliar, sehingga tidak berhak mendapatkan fasilitas Pasal 31E (tarif umum 22% diterapkan penuh pada seluruh PKP).";
    }

    setResultBadan({
      revenue: rev,
      profit: profit,
      taxDue: taxDue,
      explanation: explanation
    });
  };

  // Add new record to archive list
  const handleAddRecord = async (e) => {
    e.preventDefault();
    const rev = parseFloat(formRevenue);
    const tax = parseFloat(formTaxDue);
    
    if (isNaN(rev) || rev < 0 || isNaN(tax) || tax < 0) {
      showToast("Masukkan nominal angka yang valid!", "error");
      return;
    }

    const newRecordItem = {
      id: genRandomId(),
      tax_year: parseInt(formYear),
      tax_period: formPeriod,
      tax_type: formType,
      gross_revenue: rev,
      tax_due: tax,
      status: formStatus,
      payment_date: formPaymentDate || "-",
      ntpn_code: formNtpn || "-",
      bpe_code: formBpe || "-"
    };

    const updated = [newRecordItem, ...records];
    const success = await saveRecordsToDatabase(updated);
    if (success) {
      // Reset form fields
      setFormRevenue("");
      setFormTaxDue("");
      setFormPaymentDate("");
      setFormNtpn("");
      setFormBpe("");
    }
  };

  // Delete record from archive
  const handleDeleteRecord = async (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus arsip laporan pajak ini?")) {
      const updated = records.filter(rec => rec.id !== id);
      await saveRecordsToDatabase(updated);
    }
  };

  // Helper ID generator
  const genRandomId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(number);
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`portal-toast ${toast.type}`} style={{ position: "fixed", top: "2rem", right: "2rem", zIndex: 1000, padding: "1rem 1.5rem", borderRadius: "8px", boxShadow: "0 10px 15px rgba(0,0,0,0.1)", display: "flex", gap: "0.5rem", alignItems: "center", color: "white", backgroundColor: toast.type === "success" ? "#10b981" : "#ef4444" }}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", borderBottom: "1px solid var(--color-gray-200)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>
          SPT Pajak PT Perseorangan
        </h1>
        <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
          Kelola kepatuhan perpajakan Wajib Pajak Badan PT Perseorangan (Perseroan Perorangan) secara terstruktur.
        </p>
      </div>

      {/* Sub Tab Switching */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <button
          onClick={() => setActiveSubTab("calculator")}
          className={`btn-portal-outline ${activeSubTab === "calculator" ? "active" : ""}`}
          style={{ padding: "0.6rem 1.5rem", fontWeight: "700" }}
        >
          🧮 Kalkulator Simulasi Pajak
        </button>
        <button
          onClick={() => setActiveSubTab("archive")}
          className={`btn-portal-outline ${activeSubTab === "archive" ? "active" : ""}`}
          style={{ padding: "0.6rem 1.5rem", fontWeight: "700" }}
        >
          📂 Arsip Pelaporan SPT & PPh
        </button>
      </div>

      {/* SUBTAB 1: CALCULATOR */}
      {activeSubTab === "calculator" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Method Selector */}
          <div className="portal-card" style={{ padding: "1.5rem", display: "flex", gap: "1.5rem", alignItems: "center", backgroundColor: "var(--color-gray-50)" }}>
            <span style={{ fontWeight: "700", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Pilih Skema Perpajakan:</span>
            <div style={{ display: "flex", gap: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem" }}>
                <input
                  type="radio"
                  name="tax_method"
                  checked={taxMethod === "final_umkm"}
                  onChange={() => { setTaxMethod("final_umkm"); }}
                />
                PPh Final 0.5% (PP 55/2022) - Khusus UMKM
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem" }}>
                <input
                  type="radio"
                  name="tax_method"
                  checked={taxMethod === "badan_umum"}
                  onChange={() => { setTaxMethod("badan_umum"); }}
                />
                PPh Badan Tarif Umum (Fasilitas Pasal 31E)
              </label>
            </div>
          </div>

          {/* Form Kalkulator Final 0.5% */}
          {taxMethod === "final_umkm" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
              
              {/* Form Input */}
              <div className="portal-card" style={{ padding: "2rem" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.25rem" }}>
                  Hitung PPh Final 0.5% Bulanan / Tahunan
                </h3>
                
                <form onSubmit={handleCalculateFinal} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>
                      Omzet Kotor (Peredaran Bruto)
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontWeight: "600", color: "var(--color-gray-400)", fontSize: "0.9rem" }}>Rp</span>
                      <input
                        type="number"
                        value={grossRevenueFinal}
                        onChange={(e) => setGrossRevenueFinal(e.target.value)}
                        placeholder="Contoh: 15000000"
                        className="portal-input"
                        style={{ paddingLeft: "40px" }}
                        required
                      />
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", display: "block", marginTop: "0.25rem" }}>
                      Masukkan jumlah akumulasi total pendapatan bruto pada masa pajak yang dicari.
                    </span>
                  </div>

                  <button type="submit" className="btn-portal-primary">
                    Hitung PPh Final Terutang
                  </button>
                </form>
              </div>

              {/* Hasil Perhitungan */}
              <div className="portal-card" style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between", border: resultFinal ? "2px solid var(--color-primary)" : undefined }}>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.25rem" }}>
                    Hasil Analisis PPh Final 0.5%
                  </h3>
                  
                  {resultFinal ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                      <div style={{ borderBottom: "1px dashed var(--color-gray-250)", paddingBottom: "1rem" }}>
                        <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", marginBottom: "0.25rem" }}>Peredaran Bruto (Omzet)</p>
                        <p style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--color-gray-800)" }}>{formatRupiah(resultFinal.revenue)}</p>
                      </div>

                      <div style={{ borderBottom: "1px dashed var(--color-gray-250)", paddingBottom: "1rem" }}>
                        <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", marginBottom: "0.25rem" }}>Tarif Pajak Final (PP 55/2022)</p>
                        <p style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-primary-dark)" }}>0.5% (Setengah Persen)</p>
                      </div>

                      <div>
                        <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", marginBottom: "0.25rem" }}>Total PPh Final Terutang</p>
                        <p style={{ fontSize: "1.85rem", fontWeight: "900", color: "#10b981" }}>{formatRupiah(resultFinal.taxDue)}</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-gray-400)", fontSize: "0.9rem" }}>
                      Silakan isi form di sebelah kiri untuk menghitung kewajiban pajak PPh Final PT Anda.
                    </div>
                  )}
                </div>

                {resultFinal && (
                  <div style={{ marginTop: "1rem", backgroundColor: "var(--color-primary-light)", padding: "1rem", borderRadius: "10px", borderLeft: "4px solid var(--color-primary)" }}>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-primary-dark)", lineHeight: "1.4" }}>
                      💡 **Catatan Kepatuhan**: PPh Final 0.5% Badan PT Perseorangan berlaku maksimal 4 tahun pajak sejak didirikan. Penyetoran bulanan paling lambat tanggal 15 bulan berikutnya, dan pelaporan SPT Tahunan paling lambat 30 April tahun berikutnya.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Kalkulator PPh Badan Tarif Umum Pasal 31E */}
          {taxMethod === "badan_umum" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
              
              {/* Form Input */}
              <div className="portal-card" style={{ padding: "2rem" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.25rem" }}>
                  Simulasi Pajak PPh Badan (Fasilitas 31E)
                </h3>
                
                <form onSubmit={handleCalculateBadan} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>
                      Omzet Kotor Setahun (Peredaran Bruto)
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontWeight: "600", color: "var(--color-gray-400)", fontSize: "0.9rem" }}>Rp</span>
                      <input
                        type="number"
                        value={grossRevenueBadan}
                        onChange={(e) => setGrossRevenueBadan(e.target.value)}
                        placeholder="Contoh: 1500000000"
                        className="portal-input"
                        style={{ paddingLeft: "40px" }}
                        required
                      />
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", display: "block", marginTop: "0.25rem" }}>
                      Total peredaran bruto PT dalam satu tahun pajak untuk menentukan hak fasilitas.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>
                      Laba Bersih Fiskal (Penghasilan Kena Pajak / PKP)
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontWeight: "600", color: "var(--color-gray-400)", fontSize: "0.9rem" }}>Rp</span>
                      <input
                        type="number"
                        value={netProfitBadan}
                        onChange={(e) => setNetProfitBadan(e.target.value)}
                        placeholder="Contoh: 180000000"
                        className="portal-input"
                        style={{ paddingLeft: "40px" }}
                        required
                      />
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", display: "block", marginTop: "0.25rem" }}>
                      Keuntungan bersih setelah koreksi fiskal.
                    </span>
                  </div>

                  <button type="submit" className="btn-portal-primary">
                    Simulasikan Pajak PPh Badan
                  </button>
                </form>
              </div>

              {/* Hasil Perhitungan */}
              <div className="portal-card" style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between", border: resultBadan ? "2px solid var(--color-primary)" : undefined }}>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.25rem" }}>
                    Hasil Analisis PPh Badan
                  </h3>
                  
                  {resultBadan ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", borderBottom: "1px dashed var(--color-gray-250)", paddingBottom: "1rem" }}>
                        <div>
                          <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", marginBottom: "0.25rem" }}>Total Omzet</p>
                          <p style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-gray-800)" }}>{formatRupiah(resultBadan.revenue)}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", marginBottom: "0.25rem" }}>PKP (Laba Fiskal)</p>
                          <p style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-gray-800)" }}>{formatRupiah(resultBadan.profit)}</p>
                        </div>
                      </div>

                      <div style={{ borderBottom: "1px dashed var(--color-gray-250)", paddingBottom: "1rem" }}>
                        <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", marginBottom: "0.5rem" }}>Analisis Ketentuan Pasal 31E</p>
                        <p style={{ fontSize: "0.85rem", color: "var(--color-gray-700)", lineHeight: "1.4" }}>
                          {resultBadan.explanation}
                        </p>
                      </div>

                      <div>
                        <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", marginBottom: "0.25rem" }}>Estimasi PPh Badan Terutang (Formulir 1771)</p>
                        <p style={{ fontSize: "1.85rem", fontWeight: "900", color: "#10b981" }}>{formatRupiah(resultBadan.taxDue)}</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-gray-400)", fontSize: "0.9rem" }}>
                      Silakan isi form di sebelah kiri untuk menyimulasikan PPh Badan dengan tarif fasilitas diskon 50%.
                    </div>
                  )}
                </div>

                {resultBadan && (
                  <div style={{ marginTop: "1rem", backgroundColor: "var(--color-primary-light)", padding: "1rem", borderRadius: "10px", borderLeft: "4px solid var(--color-primary)" }}>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-primary-dark)", lineHeight: "1.4" }}>
                      ℹ️ **Aturan HPP**: Fasilitas pengurangan tarif 50% berlaku atas Penghasilan Kena Pajak yang merupakan bagian dari peredaran bruto sampai dengan Rp4,8 Miliar. Tarif PPh Badan standar di Indonesia adalah 22%.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* SUBTAB 2: ARCHIVE */}
      {activeSubTab === "archive" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Form Perekaman Baru */}
          <div className="portal-card" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>
              Rekam Pelaporan SPT / Pembayaran PPh Baru
            </h3>
            
            <form onSubmit={handleAddRecord} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>Tahun Pajak</label>
                <input
                  type="number"
                  value={formYear}
                  onChange={(e) => setFormYear(e.target.value)}
                  className="portal-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>Masa / Periode Pajak</label>
                <select
                  value={formPeriod}
                  onChange={(e) => setFormPeriod(e.target.value)}
                  className="portal-input"
                  style={{ height: "42px" }}
                >
                  <option value="Tahunan">Tahunan (SPT 1771)</option>
                  <option value="Januari">Januari</option>
                  <option value="Februari">Februari</option>
                  <option value="Maret">Maret</option>
                  <option value="April">April</option>
                  <option value="Mei">Mei</option>
                  <option value="Juni">Juni</option>
                  <option value="Juli">Juli</option>
                  <option value="Agustus">Agustus</option>
                  <option value="September">September</option>
                  <option value="Oktober">Oktober</option>
                  <option value="November">November</option>
                  <option value="Desember">Desember</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>Jenis Pelaporan Pajak</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="portal-input"
                  style={{ height: "42px" }}
                >
                  <option value="PPh Final 0.5% (PP 55/2022)">PPh Final 0.5% (PP 55/2022)</option>
                  <option value="PPh Badan Pasal 31E (Fasilitas)">PPh Badan Pasal 31E (Fasilitas)</option>
                  <option value="PPh Pasal 21 (Karyawan)">PPh Pasal 21 (Karyawan)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>Omzet Bruto (Peredaran Bruto)</label>
                <input
                  type="number"
                  value={formRevenue}
                  onChange={(e) => setFormRevenue(e.target.value)}
                  placeholder="Rp"
                  className="portal-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>Nominal Pajak Terutang</label>
                <input
                  type="number"
                  value={formTaxDue}
                  onChange={(e) => setFormTaxDue(e.target.value)}
                  placeholder="Rp"
                  className="portal-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>Status Dokumen</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="portal-input"
                  style={{ height: "42px" }}
                >
                  <option value="Sudah Dilaporkan">Sudah Dilaporkan</option>
                  <option value="Sudah Bayar">Sudah Bayar</option>
                  <option value="Kurang Bayar">Kurang Bayar</option>
                  <option value="Nihil">Nihil</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>Tanggal Bayar / Lapor</label>
                <input
                  type="date"
                  value={formPaymentDate}
                  onChange={(e) => setFormPaymentDate(e.target.value)}
                  className="portal-input"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>Kode NTPN (Penyetoran)</label>
                <input
                  type="text"
                  value={formNtpn}
                  onChange={(e) => setFormNtpn(e.target.value)}
                  placeholder="16 Digit Angka/Huruf"
                  className="portal-input"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>Kode BPE (Bukti Lapor)</label>
                <input
                  type="text"
                  value={formBpe}
                  onChange={(e) => setFormBpe(e.target.value)}
                  placeholder="Kode Bukti Terima Elektronik"
                  className="portal-input"
                />
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-portal-primary"
                  style={{ padding: "0.75rem 2rem" }}
                >
                  {saving ? "Menyimpan..." : "💾 Rekam Laporan SPT"}
                </button>
              </div>
            </form>
          </div>

          {/* Tabel Rekapitulasi Arsip */}
          <div className="portal-card" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>
              Riwayat Pembayaran & Pelaporan SPT PT Perseorangan
            </h3>
            
            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-gray-400)" }}>
                Memuat data arsip...
              </div>
            ) : records.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-gray-400)", fontSize: "0.9rem" }}>
                Belum ada arsip pelaporan yang terekam.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="portal-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--color-gray-250)", textAlign: "left", fontSize: "0.85rem", color: "var(--color-gray-500)", textTransform: "uppercase" }}>
                      <th style={{ padding: "12px 10px" }}>Periode</th>
                      <th style={{ padding: "12px 10px" }}>Jenis Pajak</th>
                      <th style={{ padding: "12px 10px" }}>Omzet Kotor</th>
                      <th style={{ padding: "12px 10px" }}>Pajak Terutang</th>
                      <th style={{ padding: "12px 10px" }}>Status</th>
                      <th style={{ padding: "12px 10px" }}>Detail Dokumen</th>
                      <th style={{ padding: "12px 10px", textAlign: "right" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((rec) => (
                      <tr key={rec.id} style={{ borderBottom: "1px solid var(--color-gray-200)", fontSize: "0.925rem", color: "var(--color-gray-800)" }}>
                        <td style={{ padding: "14px 10px", fontWeight: "700" }}>
                          {rec.tax_period} {rec.tax_year}
                        </td>
                        <td style={{ padding: "14px 10px", color: "var(--color-primary-dark)", fontWeight: "600" }}>
                          {rec.tax_type}
                        </td>
                        <td style={{ padding: "14px 10px" }}>
                          {formatRupiah(rec.gross_revenue)}
                        </td>
                        <td style={{ padding: "14px 10px", fontWeight: "700", color: rec.tax_due > 0 ? "#ef4444" : "var(--color-gray-700)" }}>
                          {formatRupiah(rec.tax_due)}
                        </td>
                        <td style={{ padding: "14px 10px" }}>
                          <span style={{ 
                            padding: "0.3rem 0.6rem", 
                            borderRadius: "50px", 
                            fontSize: "0.75rem", 
                            fontWeight: "800",
                            backgroundColor: 
                              rec.status === "Sudah Dilaporkan" ? "rgba(16, 185, 129, 0.15)" : 
                              rec.status === "Sudah Bayar" ? "rgba(59, 130, 246, 0.15)" : 
                              rec.status === "Nihil" ? "rgba(107, 114, 128, 0.15)" : "rgba(239, 68, 68, 0.15)",
                            color: 
                              rec.status === "Sudah Dilaporkan" ? "#10b981" : 
                              rec.status === "Sudah Bayar" ? "#3b82f6" : 
                              rec.status === "Nihil" ? "#6b7280" : "#ef4444"
                          }}>
                            {rec.status}
                          </span>
                        </td>
                        <td style={{ padding: "14px 10px", fontSize: "0.8rem", color: "var(--color-gray-500)", lineHeight: "1.4" }}>
                          <div>📅 Tgl: {rec.payment_date}</div>
                          <div>🔑 NTPN: {rec.ntpn_code}</div>
                          <div>📄 BPE: {rec.bpe_code}</div>
                        </td>
                        <td style={{ padding: "14px 10px", textAlign: "right" }}>
                          <button
                            onClick={() => handleDeleteRecord(rec.id)}
                            className="btn-portal-danger"
                            style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
