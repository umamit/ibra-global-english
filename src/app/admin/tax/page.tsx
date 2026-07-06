"use client";

export const dynamic = 'force-dynamic';

import React from 'react';
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { DEFAULT_TAX_RECORDS, DEFAULT_TAX_ASSETS } from "@/utils/fallbackData";
import TaxCalculator from "./components/TaxCalculator";
import TaxArchive from "./components/TaxArchive";
import TaxAssets from "./components/TaxAssets";

interface TaxRecord {
  id: string;
  tax_year: number;
  tax_period: string;
  tax_type: string;
  gross_revenue: number;
  tax_due: number;
  status: string;
  payment_date: string;
  ntpn_code: string;
  bpe_code: string;
}

interface TaxAsset {
  id: string;
  name: string;
  group: string;
  purchase_date: string;
  purchase_price: number;
}

interface ResultFinal {
  revenue: number;
  taxDue: number;
}

interface ResultBadan {
  revenue: number;
  profit: number;
  taxDue: number;
  explanation: string;
}

interface AssetDepreciation {
  monthlyDep: number;
  accumDep: number;
  bookValue: number;
  monthsElapsed: number;
  maxMonths: number;
}

interface ToastState {
  show: boolean;
  message: string;
  type: string;
}

export default function AdminTaxPage() {
  const supabase = createClient();

  const [activeSubTab, setActiveSubTab] = useState<string>("calculator"); // 'calculator' | 'archive' | 'assets'
  const [taxMethod, setTaxMethod] = useState<string>("final_umkm"); // 'final_umkm' | 'badan_umum'

  // Assets & Depreciation states
  const [assetsList, setAssetsList] = useState<TaxAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState<boolean>(false);
  const [savingAssets, setSavingAssets] = useState<boolean>(false);

  // Form states for new asset
  const [assetName, setAssetName] = useState<string>("");
  const [assetGroup, setAssetGroup] = useState<string>("Kelompok 1");
  const [assetPurchaseDate, setAssetPurchaseDate] = useState<string>("");
  const [assetPurchasePrice, setAssetPurchasePrice] = useState<string>("");

  // Calculator PPh Final UMKM
  const [grossRevenueFinal, setGrossRevenueFinal] = useState<string>("");
  const [resultFinal, setResultFinal] = useState<ResultFinal | null>(null);

  // Calculator PPh Badan Pasal 31E
  const [grossRevenueBadan, setGrossRevenueBadan] = useState<string>("");
  const [netProfitBadan, setNetProfitBadan] = useState<string>("");
  const [resultBadan, setResultBadan] = useState<ResultBadan | null>(null);

  // Archive & Database states
  const [records, setRecords] = useState<TaxRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" });

  // Form states for new record
  const [formYear, setFormYear] = useState<string | number>(new Date().getFullYear());
  const [formPeriod, setFormPeriod] = useState<string>("Tahunan");
  const [formType, setFormType] = useState<string>("PPh Final 0.5% (PP 55/2022)");
  const [formRevenue, setFormRevenue] = useState<string | number>("");
  const [formTaxDue, setFormTaxDue] = useState<string | number>("");
  const [formStatus, setFormStatus] = useState<string>("Sudah Dilaporkan");
  const [formPaymentDate, setFormPaymentDate] = useState<string>("");
  const [formNtpn, setFormNtpn] = useState<string>("");
  const [formBpe, setFormBpe] = useState<string>("");

  const showToast = (message: string, type: string = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  // Fetch tax records from Supabase
  useEffect(() => {
    async function fetchTaxRecords(): Promise<void> {
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
    async function fetchTaxAssets(): Promise<void> {
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
  const saveRecordsToDatabase = async (updatedList: TaxRecord[]): Promise<boolean> => {
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
  const saveAssetsToDatabase = async (updatedList: TaxAsset[]): Promise<boolean> => {
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
  const handleAddAsset = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
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

    const newAsset: TaxAsset = {
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
  const handleDeleteAsset = async (id: string): Promise<void> => {
    if (confirm("Apakah Anda yakin ingin menghapus aset ini dari pencatatan fiskal?")) {
      const updated = assetsList.filter(asset => asset.id !== id);
      await saveAssetsToDatabase(updated);
    }
  };

  // Helper function to calculate straight line depreciation
  const calculateDepreciation = (price: number, purchaseDate: string, group: string): AssetDepreciation => {
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
  const handleCalculateFinal = (e: React.FormEvent<HTMLFormElement>) => {
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
  const handleCalculateBadan = (e: React.FormEvent<HTMLFormElement>) => {
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
  const handleAddRecord = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const rev = parseFloat(String(formRevenue));
    const tax = parseFloat(String(formTaxDue));

    if (isNaN(rev) || rev < 0 || isNaN(tax) || tax < 0) {
      showToast("Masukkan nominal angka yang valid!", "error");
      return;
    }

    const newRecordItem: TaxRecord = {
      id: genRandomId(),
      tax_year: parseInt(String(formYear)),
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
  const handleDeleteRecord = async (id: string): Promise<void> => {
    if (confirm("Apakah Anda yakin ingin menghapus arsip laporan pajak ini?")) {
      const updated = records.filter(rec => rec.id !== id);
      await saveRecordsToDatabase(updated);
    }
  };

  // Helper ID generator
  const genRandomId = (): string => {
    return Math.random().toString(36).substring(2, 9);
  };

  const formatRupiah = (number: number): string => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(number);
  };

  const handlePrintResult = () => {
    window.print();
  };

  const handlePrintArchive = () => {
    window.print();
  };

  return (
    <div style={{ padding: "1.5rem" }}>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`portal-toast ${toast.type}`} style={{ position: "fixed", top: "2rem", right: "2rem", zIndex: 1000, padding: "1rem 1.5rem", borderRadius: "8px", boxShadow: "0 10px 15px rgba(0,0,0,0.1)", display: "flex", gap: "0.5rem", alignItems: "center", color: "white", backgroundColor: toast.type === "success" ? "#10b981" : "#ef4444" }}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Kop Laporan Resmi (Hanya muncul saat dicetak) */}
      <div className="print-only" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", borderBottom: "3px double #1f2937", paddingBottom: "0.75rem" }}>
          <img
            src="/assets/logo.png"
            alt="Logo Ibra Global English"
            style={{ width: "65px", height: "65px", objectFit: "contain" }}
          />
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: "1.4rem",
              fontWeight: "900",
              color: "#111827",
              margin: 0,
              letterSpacing: "0.5px",
              textTransform: "uppercase"
            }}>
              IBRA GLOBAL ENGLISH BOBONG
            </h1>
            <p style={{
              fontSize: "0.85rem",
              fontWeight: "700",
              color: "#4b5563",
              margin: "0.1rem 0",
              fontStyle: "italic"
            }}>
              English Course & Bimbingan Belajar Calistung Terbaik di Pulau Taliabu
            </p>
            <p style={{ fontSize: "0.7rem", color: "#6b7280", margin: 0, lineHeight: "1.3" }}>
              Alamat: Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001, Bobong, Taliabu Barat, Kabupaten Pulau Taliabu, Maluku Utara 97794 <br />
              WhatsApp: +62 813-5700-1357 | Website: www.ibraglobalenglish.uk
            </p>
          </div>
        </div>
      </div>

      {/* Top Header */}
      <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "0.25rem", borderBottom: "1px solid var(--color-gray-200)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>
          SPT Pajak PT Perseorangan
        </h1>
        <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
          Kelola kepatuhan perpajakan Wajib Pajak Badan PT Perseorangan (Perseroan Perorangan) secara terstruktur.
        </p>
      </div>

      {/* Sub Tab Switching */}
      <div className="no-print" style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
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
        <TaxCalculator
          taxMethod={taxMethod}
          setTaxMethod={setTaxMethod}
          grossRevenueFinal={grossRevenueFinal}
          setGrossRevenueFinal={setGrossRevenueFinal}
          resultFinal={resultFinal}
          handleCalculateFinal={handleCalculateFinal}
          grossRevenueBadan={grossRevenueBadan}
          setGrossRevenueBadan={setGrossRevenueBadan}
          netProfitBadan={netProfitBadan}
          setNetProfitBadan={setNetProfitBadan}
          resultBadan={resultBadan}
          handleCalculateBadan={handleCalculateBadan}
          formatRupiah={formatRupiah}
          onSaveToArchive={() => {
            if (resultFinal) {
              setFormYear(new Date().getFullYear());
              setFormPeriod("Bulanan");
              setFormType("PPh Final 0.5% (PP 55/2022)");
              setFormRevenue(resultFinal.revenue);
              setFormTaxDue(resultFinal.taxDue);
              setActiveSubTab("archive");
              showToast("Form arsip berhasil diisi otomatis, silakan klik 'Rekam Laporan SPT'!");
            } else if (resultBadan) {
              setFormYear(new Date().getFullYear());
              setFormPeriod("Tahunan");
              setFormType("PPh Badan Pasal 31E (Fasilitas)");
              setFormRevenue(resultBadan.revenue);
              setFormTaxDue(resultBadan.taxDue);
              setActiveSubTab("archive");
              showToast("Form arsip berhasil diisi otomatis, silakan klik 'Rekam Laporan SPT'!");
            }
          }}
          onPrintResult={handlePrintResult}
        />
      )}

      {/* SUBTAB 2: ARCHIVE */}
      {activeSubTab === "archive" && (
        <TaxArchive
          records={records}
          loading={loading}
          saving={saving}
          formYear={formYear}
          setFormYear={setFormYear}
          formPeriod={formPeriod}
          setFormPeriod={setFormPeriod}
          formType={formType}
          setFormType={setFormType}
          formRevenue={formRevenue}
          setFormRevenue={setFormRevenue}
          formTaxDue={formTaxDue}
          setFormTaxDue={setFormTaxDue}
          formStatus={formStatus}
          setFormStatus={setFormStatus}
          formPaymentDate={formPaymentDate}
          setFormPaymentDate={setFormPaymentDate}
          formNtpn={formNtpn}
          setFormNtpn={setFormNtpn}
          formBpe={formBpe}
          setFormBpe={setFormBpe}
          handleAddRecord={handleAddRecord}
          handleDeleteRecord={handleDeleteRecord}
          formatRupiah={formatRupiah}
          onPrintArchive={handlePrintArchive}
        />
      )}

      {/* SUBTAB 3: ASSETS & DEPRECIATION */}
      {activeSubTab === "assets" && (
        <TaxAssets
          assetsList={assetsList}
          loadingAssets={loadingAssets}
          savingAssets={savingAssets}
          assetName={assetName}
          setAssetName={setAssetName}
          assetGroup={assetGroup}
          setAssetGroup={setAssetGroup}
          assetPurchaseDate={assetPurchaseDate}
          setAssetPurchaseDate={setAssetPurchaseDate}
          assetPurchasePrice={assetPurchasePrice}
          setAssetPurchasePrice={setAssetPurchasePrice}
          assetsSummary={assetsSummary}
          formatRupiah={formatRupiah}
          calculateDepreciation={calculateDepreciation}
          handleAddAsset={handleAddAsset}
          handleDeleteAsset={handleDeleteAsset}
        />
      )}

    </div>
  );
}
