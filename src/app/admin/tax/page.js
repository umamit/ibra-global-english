"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { createAdminClient as createClient } from "@/utils/supabase/client";
import { DEFAULT_TAX_RECORDS, DEFAULT_TAX_ASSETS } from "@/utils/fallbackData";

export default function AdminTaxPage() {
  const supabase = createClient();

  const [activeSubTab, setActiveSubTab] = useState("calculator"); // 'calculator' | 'archive' | 'assets'
  const [taxMethod, setTaxMethod] = useState("final_umkm"); // 'final_umkm' | 'badan_umum'

  // Assets & Depreciation states
  const [assetsList, setAssetsList] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [savingAssets, setSavingAssets] = useState(false);

  // Form states for new asset
  const [assetName, setAssetName] = useState("");
  const [assetGroup, setAssetGroup] = useState("Kelompok 1");
  const [assetPurchaseDate, setAssetPurchaseDate] = useState("");
  const [assetPurchasePrice, setAssetPurchasePrice] = useState("");
  
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

  // Fetch tax assets from Supabase
  useEffect(() => {
    async function fetchTaxAssets() {
      setLoadingAssets(true);
      try {
        const { data, error } = await supabase
          .from("landing_settings")
          .select("value")
          .eq("key", "tax_assets_data")
          .single();
        
        if (error && error.code !== "PGRST116") throw error; // PGRST116 is empty/no rows
        if (data && data.value) {
          const parsed = JSON.parse(data.value);
          if (Array.isArray(parsed)) {
            setAssetsList(parsed);
            setLoadingAssets(false);
            return;
          }
        }
        setAssetsList(DEFAULT_TAX_ASSETS);
      } catch (e) {
        console.warn("Gagal mengambil data aset dari database. Menggunakan data default.", e);
        setAssetsList(DEFAULT_TAX_ASSETS);
      } finally {
        setLoadingAssets(false);
      }
    }
    fetchTaxAssets();
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

  // Save updated assets list to Supabase
  const saveAssetsToDatabase = async (updatedList) => {
    setSavingAssets(true);
    try {
      const { error } = await supabase
        .from("landing_settings")
        .upsert({ key: "tax_assets_data", value: JSON.stringify(updatedList) });
      
      if (error) throw error;
      setAssetsList(updatedList);
      showToast("Data aset berhasil disimpan ke database!");
      return true;
    } catch (err) {
      console.error("Gagal menyimpan data aset:", err);
      showToast("Gagal menyimpan data aset ke database.", "error");
      return false;
    } finally {
      setSavingAssets(false);
    }
  };

  // Add new asset to list
  const handleAddAsset = async (e) => {
    e.preventDefault();
    const price = parseFloat(assetPurchasePrice);
    if (isNaN(price) || price <= 0) {
      showToast("Masukkan harga perolehan yang valid!", "error");
      return;
    }
    if (!assetPurchaseDate) {
      showToast("Pilih tanggal perolehan aset!", "error");
      return;
    }
    if (!assetName.trim()) {
      showToast("Masukkan nama aset!", "error");
      return;
    }

    const newAsset = {
      id: genRandomId(),
      name: assetName.trim(),
      group: assetGroup,
      purchase_date: assetPurchaseDate,
      purchase_price: price
    };

    const updated = [newAsset, ...assetsList];
    const success = await saveAssetsToDatabase(updated);
    if (success) {
      setAssetName("");
      setAssetGroup("Kelompok 1");
      setAssetPurchaseDate("");
      setAssetPurchasePrice("");
    }
  };

  // Delete asset from list
  const handleDeleteAsset = async (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus aset ini dari pencatatan fiskal?")) {
      const updated = assetsList.filter(asset => asset.id !== id);
      await saveAssetsToDatabase(updated);
    }
  };

  // Helper function to calculate straight line depreciation
  const calculateDepreciation = (price, purchaseDate, group) => {
    const pDate = new Date(purchaseDate);
    if (isNaN(pDate.getTime()) || price <= 0) {
      return {
        monthlyDep: 0,
        accumDep: 0,
        bookValue: price,
        monthsElapsed: 0,
        maxMonths: group === "Kelompok 1" ? 48 : 96
      };
    }

    const pYear = pDate.getFullYear();
    const pMonth = pDate.getMonth(); // 0-11

    // Reference date: June 2026 (year = 2026, month = 5)
    const currentYear = 2026;
    const currentMonth = 5;

    if (pYear > currentYear || (pYear === currentYear && pMonth > currentMonth)) {
      return {
        monthlyDep: 0,
        accumDep: 0,
        bookValue: price,
        monthsElapsed: 0,
        maxMonths: group === "Kelompok 1" ? 48 : 96
      };
    }

    const monthsElapsed = (currentYear - pYear) * 12 + (currentMonth - pMonth) + 1;
    const maxMonths = group === "Kelompok 1" ? 48 : 96;
    const actualDepMonths = Math.min(monthsElapsed, maxMonths);

    const monthlyDep = price / maxMonths;
    const accumDep = monthlyDep * actualDepMonths;
    const bookValue = Math.max(0, price - accumDep);

    return {
      monthlyDep,
      accumDep,
      bookValue,
      monthsElapsed,
      maxMonths
    };
  };

  // Get assets summary metrics
  const getAssetsSummary = () => {
    let totalCost = 0;
    let totalMonthlyDep = 0;
    let totalAccumDep = 0;
    let totalBookValue = 0;

    assetsList.forEach((asset) => {
      const { monthlyDep, accumDep, bookValue } = calculateDepreciation(
        asset.purchase_price,
        asset.purchase_date,
        asset.group
      );
      totalCost += asset.purchase_price;
      
      const pDate = new Date(asset.purchase_date);
      const pYear = pDate.getFullYear();
      const pMonth = pDate.getMonth();
      const monthsElapsed = (2026 - pYear) * 12 + (5 - pMonth) + 1;
      const maxMonths = asset.group === "Kelompok 1" ? 48 : 96;
      
      if (monthsElapsed <= maxMonths && monthsElapsed > 0) {
        totalMonthlyDep += monthlyDep;
      }
      totalAccumDep += accumDep;
      totalBookValue += bookValue;
    });

    return {
      totalCost,
      totalMonthlyDep,
      totalAccumDep,
      totalBookValue
    };
  };

  const assetsSummary = getAssetsSummary();

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
        <button
          onClick={() => setActiveSubTab("assets")}
          className={`btn-portal-outline ${activeSubTab === "assets" ? "active" : ""}`}
          style={{ padding: "0.6rem 1.5rem", fontWeight: "700" }}
        >
          📦 Kelola Aset & Penyusutan
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
                      <div className="form-grid" style={{ gap: "1rem", borderBottom: "1px dashed var(--color-gray-250)", paddingBottom: "1rem", marginBottom: 0 }}>
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

      {/* SUBTAB 3: ASSETS & DEPRECIATION */}
      {activeSubTab === "assets" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Ketentuan Fiskal Callout */}
          <div style={{ backgroundColor: "var(--color-primary-light)", padding: "1.25rem", borderRadius: "10px", borderLeft: "4px solid var(--color-primary)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <h4 style={{ fontWeight: "800", color: "var(--color-primary-dark)", fontSize: "0.95rem" }}>
              💡 Ketentuan Penyusutan Fiskal (Metode Garis Lurus)
            </h4>
            <p style={{ fontSize: "0.85rem", color: "var(--color-gray-700)", lineHeight: "1.5" }}>
              Berdasarkan Undang-Undang Pajak Penghasilan (UU PPh) di Indonesia, wajib pajak dapat menyusutkan harta berwujud menggunakan Metode Garis Lurus (Straight Line Method) dengan masa manfaat per kelompok sebagai berikut:
            </p>
            <ul style={{ fontSize: "0.85rem", color: "var(--color-gray-700)", paddingLeft: "1.25rem", lineHeight: "1.5" }}>
              <li><strong>Kelompok 1 (Masa manfaat 4 tahun)</strong>: Tarif penyusutan tahunan 25% (2.083% per bulan). Contoh: laptop, komputer, printer, handphone, sepeda motor.</li>
              <li><strong>Kelompok 2 (Masa manfaat 8 tahun)</strong>: Tarif penyusutan tahunan 12.5% (1.042% per bulan). Contoh: mebel kayu/besi (meja belajar, kursi kelas, lemari buku), AC, lemari arsip, mobil box.</li>
            </ul>
            <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginTop: "0.25rem" }}>
              * Penyusutan dimulai pada bulan perolehan aset. Perhitungan nilai buku di bawah menggunakan tanggal referensi berjalan: <strong>Juni 2026</strong>.
            </p>
          </div>

          {/* Summary Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--color-primary)", background: "rgba(33, 108, 126, 0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Total Harga Perolehan</span>
                <span style={{ fontSize: "1.2rem" }}>📦</span>
              </div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>
                {formatRupiah(assetsSummary.totalCost)}
              </h2>
              <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>
                Akumulasi nilai beli seluruh aset tetap.
              </p>
            </div>

            <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid #f59e0b", background: "rgba(245, 158, 11, 0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-50)" }}>Penyusutan Bulanan</span>
                <span style={{ fontSize: "1.2rem" }}>📉</span>
              </div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#92400e" }}>
                {formatRupiah(assetsSummary.totalMonthlyDep)}
              </h2>
              <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>
                Beban penyusutan fiskal per bulan saat ini.
              </p>
            </div>

            <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid #ef4444", background: "rgba(239, 68, 68, 0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Akumulasi Penyusutan</span>
                <span style={{ fontSize: "1.2rem" }}>📊</span>
              </div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#991b1b" }}>
                {formatRupiah(assetsSummary.totalAccumDep)}
              </h2>
              <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>
                Total penyusutan terkumpul s/d Juni 2026.
              </p>
            </div>

            <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid #10b981", background: "rgba(16, 185, 129, 0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Sisa Nilai Buku Fiskal</span>
                <span style={{ fontSize: "1.2rem" }}>📑</span>
              </div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#065f46" }}>
                {formatRupiah(assetsSummary.totalBookValue)}
              </h2>
              <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>
                Nilai sisa aset yang belum disusutkan.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
            
            {/* Form Input Aset Baru */}
            <div className="portal-card" style={{ padding: "2rem" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>
                Perekaman Aset Inventaris Baru
              </h3>
              
              <form onSubmit={handleAddAsset} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>
                    Nama Aset / Inventaris
                  </label>
                  <input
                    type="text"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    placeholder="Contoh: Laptop Asus Zenbook Tutor"
                    className="portal-input"
                    required
                  />
                </div>

                <div className="form-grid" style={{ gap: "1rem", marginBottom: 0 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>
                      Kelompok Pajak
                    </label>
                    <select
                      value={assetGroup}
                      onChange={(e) => setAssetGroup(e.target.value)}
                      className="portal-input"
                      style={{ height: "42px" }}
                    >
                      <option value="Kelompok 1">Kelompok 1 (4 Tahun / 25%)</option>
                      <option value="Kelompok 2">Kelompok 2 (8 Tahun / 12.5%)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>
                      Tanggal Perolehan
                    </label>
                    <input
                      type="date"
                      value={assetPurchaseDate}
                      onChange={(e) => setAssetPurchaseDate(e.target.value)}
                      className="portal-input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>
                    Harga Perolehan (Harga Beli)
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontWeight: "600", color: "var(--color-gray-400)", fontSize: "0.9rem" }}>Rp</span>
                    <input
                      type="number"
                      value={assetPurchasePrice}
                      onChange={(e) => setAssetPurchasePrice(e.target.value)}
                      placeholder="Contoh: 12000000"
                      className="portal-input"
                      style={{ paddingLeft: "40px" }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingAssets}
                  className="btn-portal-primary"
                  style={{ marginTop: "0.5rem" }}
                >
                  {savingAssets ? "Menyimpan Aset..." : "💾 Rekam Aset Baru"}
                </button>
              </form>
            </div>

            {/* Rekomendasi/Keterangan Kelompok */}
            <div className="portal-card" style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.25rem" }}>
                  Panduan Pengelompokan Aset Fiskal
                </h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.9rem", color: "var(--color-gray-700)" }}>
                  <div style={{ borderBottom: "1px solid var(--color-gray-150)", paddingBottom: "0.75rem" }}>
                    <p style={{ fontWeight: "700", color: "var(--color-primary-dark)", marginBottom: "0.25rem" }}>💻 Kelompok 1 (Masa Manfaat 4 Tahun)</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>
                      Perangkat komputer, printer, scanner, handphone, tablet, sepeda motor, alat komunikasi, perkakas kayu/logam ringan.
                    </p>
                  </div>
                  <div>
                    <p style={{ fontWeight: "700", color: "var(--color-primary-dark)", marginBottom: "0.25rem" }}>🏢 Kelompok 2 (Masa Manfaat 8 Tahun)</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>
                      Pendingin ruangan (AC), kipas angin besar, mebel kayu/besi (meja belajar, kursi kelas, lemari buku), mesin cuci, mobil box, sepeda, kulkas, genset portabel.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "1.5rem", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--color-gray-200)" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--color-gray-600)", lineHeight: "1.4" }}>
                  ⚠️ <strong>Penting</strong>: Penyusutan fiskal ini sangat penting sebagai pengurang laba bruto usaha dalam SPT Tahunan PPh Badan 1771 untuk memperoleh Laba Bersih Fiskal yang sah secara hukum pajak.
                </p>
              </div>
            </div>

          </div>

          {/* Tabel Rekapitulasi Aset */}
          <div className="portal-card" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>
              Tabel Rekapitulasi Penyusutan Aset Tetap (Juni 2026)
            </h3>
            
            {loadingAssets ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-gray-400)" }}>
                Memuat data daftar aset...
              </div>
            ) : assetsList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-gray-400)", fontSize: "0.9rem" }}>
                Belum ada aset tetap yang terekam.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="portal-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--color-gray-250)", textAlign: "left", fontSize: "0.85rem", color: "var(--color-gray-500)", textTransform: "uppercase" }}>
                      <th style={{ padding: "12px 10px" }}>Nama Aset</th>
                      <th style={{ padding: "12px 10px" }}>Kelompok</th>
                      <th style={{ padding: "12px 10px" }}>Tgl Perolehan</th>
                      <th style={{ padding: "12px 10px" }}>Harga Perolehan</th>
                      <th style={{ padding: "12px 10px" }}>Masa Pakai</th>
                      <th style={{ padding: "12px 10px" }}>Penyusutan Bulanan</th>
                      <th style={{ padding: "12px 10px" }}>Akm. Penyusutan</th>
                      <th style={{ padding: "12px 10px" }}>Nilai Buku Fiskal</th>
                      <th style={{ padding: "12px 10px", textAlign: "right" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetsList.map((asset) => {
                      const { monthlyDep, accumDep, bookValue, monthsElapsed, maxMonths } = calculateDepreciation(
                        asset.purchase_price,
                        asset.purchase_date,
                        asset.group
                      );
                      const isFullyDepreciated = monthsElapsed >= maxMonths;
                      
                      return (
                        <tr key={asset.id} style={{ borderBottom: "1px solid var(--color-gray-200)", fontSize: "0.925rem", color: "var(--color-gray-800)" }}>
                          <td style={{ padding: "14px 10px", fontWeight: "700" }}>
                            {asset.name}
                          </td>
                          <td style={{ padding: "14px 10px" }}>
                            <span style={{ 
                              padding: "0.25rem 0.5rem", 
                              borderRadius: "4px", 
                              fontSize: "0.75rem", 
                              fontWeight: "700",
                              backgroundColor: asset.group === "Kelompok 1" ? "rgba(33, 108, 126, 0.1)" : "rgba(245, 158, 11, 0.1)",
                              color: asset.group === "Kelompok 1" ? "var(--color-primary-dark)" : "#b45309"
                            }}>
                              {asset.group}
                            </span>
                          </td>
                          <td style={{ padding: "14px 10px", color: "var(--color-gray-600)" }}>
                            {asset.purchase_date}
                          </td>
                          <td style={{ padding: "14px 10px", fontWeight: "600" }}>
                            {formatRupiah(asset.purchase_price)}
                          </td>
                          <td style={{ padding: "14px 10px", fontSize: "0.85rem" }}>
                            <span style={{ fontWeight: "700", color: isFullyDepreciated ? "#ef4444" : "var(--color-gray-800)" }}>
                              {monthsElapsed}
                            </span> / {maxMonths} Bulan
                            {isFullyDepreciated && (
                              <span style={{ display: "block", fontSize: "0.7rem", color: "#ef4444", fontWeight: "700" }}>Habis Manfaat</span>
                            )}
                          </td>
                          <td style={{ padding: "14px 10px", color: "var(--color-gray-600)" }}>
                            {formatRupiah(isFullyDepreciated ? 0 : monthlyDep)}
                          </td>
                          <td style={{ padding: "14px 10px", color: "#991b1b", fontWeight: "600" }}>
                            {formatRupiah(accumDep)}
                          </td>
                          <td style={{ padding: "14px 10px", fontWeight: "800", color: bookValue > 0 ? "#065f46" : "var(--color-gray-400)" }}>
                            {formatRupiah(bookValue)}
                          </td>
                          <td style={{ padding: "14px 10px", textAlign: "right" }}>
                            <button
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="btn-portal-danger"
                              style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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
