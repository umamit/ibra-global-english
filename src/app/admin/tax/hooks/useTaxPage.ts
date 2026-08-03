"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { DEFAULT_TAX_RECORDS, DEFAULT_TAX_ASSETS } from "@/utils/fallbackData";
import { formatRupiah } from "../../utils";

export interface TaxRecord {
  id: string; tax_year: number; tax_period: string; tax_type: string;
  gross_revenue: number; tax_due: number; status: string;
  payment_date: string; ntpn_code: string; bpe_code: string;
}

export interface TaxAsset {
  id: string; name: string; group: string; purchase_date: string; purchase_price: number;
}

export interface ResultFinal { revenue: number; taxDue: number; }
export interface ResultBadan { revenue: number; profit: number; taxDue: number; explanation: string; }

export interface AssetDepreciation {
  monthlyDep: number; accumDep: number; bookValue: number; monthsElapsed: number; maxMonths: number;
}

export interface ToastState { show: boolean; message: string; type: string; }

const genRandomId = () => Math.random().toString(36).substring(2, 9);

export function useTaxPage() {
  const supabase = createClient();

  const [activeSubTab, setActiveSubTab] = useState<string>("calculator");
  const [taxMethod, setTaxMethod] = useState<string>("final_umkm");
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" });
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [records, setRecords] = useState<TaxRecord[]>([]);
  const [assetsList, setAssetsList] = useState<TaxAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState<boolean>(false);
  const [savingAssets, setSavingAssets] = useState<boolean>(false);

  // Calculator
  const [grossRevenueFinal, setGrossRevenueFinal] = useState<string>("");
  const [resultFinal, setResultFinal] = useState<ResultFinal | null>(null);
  const [grossRevenueBadan, setGrossRevenueBadan] = useState<string>("");
  const [netProfitBadan, setNetProfitBadan] = useState<string>("");
  const [resultBadan, setResultBadan] = useState<ResultBadan | null>(null);

  // Archive form
  const [formYear, setFormYear] = useState<string | number>(new Date().getFullYear());
  const [formPeriod, setFormPeriod] = useState<string>("Tahunan");
  const [formType, setFormType] = useState<string>("PPh Final 0.5% (PP 55/2022)");
  const [formRevenue, setFormRevenue] = useState<string | number>("");
  const [formTaxDue, setFormTaxDue] = useState<string | number>("");
  const [formStatus, setFormStatus] = useState<string>("Sudah Dilaporkan");
  const [formPaymentDate, setFormPaymentDate] = useState<string>("");
  const [formNtpn, setFormNtpn] = useState<string>("");
  const [formBpe, setFormBpe] = useState<string>("");

  // Asset form
  const [assetName, setAssetName] = useState<string>("");
  const [assetGroup, setAssetGroup] = useState<string>("Kelompok 1");
  const [assetPurchaseDate, setAssetPurchaseDate] = useState<string>("");
  const [assetPurchasePrice, setAssetPurchasePrice] = useState<string>("");

  const showToast = (message: string, type: string = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  useEffect(() => {
    async function fetchTaxRecords() {
      setLoading(true);
      try {
        const { data, error } = await supabase.from("landing_settings").select("value").eq("key", "tax_records_data").single();
        if (error && error.code !== "PGRST116") throw error;
        if (data?.value) { const p = JSON.parse(data.value); if (Array.isArray(p)) { setRecords(p); return; } }
        setRecords(DEFAULT_TAX_RECORDS);
      } catch { setRecords(DEFAULT_TAX_RECORDS); }
      finally { setLoading(false); }
    }
    async function fetchTaxAssets() {
      setLoadingAssets(true);
      try {
        const { data, error } = await supabase.from("landing_settings").select("value").eq("key", "tax_assets_data").single();
        if (error && error.code !== "PGRST116") throw error;
        if (data?.value) { const p = JSON.parse(data.value); if (Array.isArray(p)) { setAssetsList(p); return; } }
        setAssetsList(DEFAULT_TAX_ASSETS);
      } catch { setAssetsList(DEFAULT_TAX_ASSETS); }
      finally { setLoadingAssets(false); }
    }
    fetchTaxRecords(); fetchTaxAssets();
  }, []);

  const saveRecordsToDatabase = async (updatedList: TaxRecord[]): Promise<boolean> => {
    setSaving(true);
    try {
      const { error } = await supabase.from("landing_settings").upsert({ key: "tax_records_data", value: JSON.stringify(updatedList) });
      if (error) throw error;
      setRecords(updatedList); showToast("Arsip perpajakan berhasil diperbarui!"); return true;
    } catch { showToast("Gagal menyimpan data ke database.", "error"); return false; }
    finally { setSaving(false); }
  };

  const saveAssetsToDatabase = async (updatedList: TaxAsset[]): Promise<boolean> => {
    setSavingAssets(true);
    try {
      const { error } = await supabase.from("landing_settings").upsert({ key: "tax_assets_data", value: JSON.stringify(updatedList) });
      if (error) throw error;
      setAssetsList(updatedList); showToast("Data aset berhasil disimpan ke database!"); return true;
    } catch { showToast("Gagal menyimpan data aset ke database.", "error"); return false; }
    finally { setSavingAssets(false); }
  };

  const calculateDepreciation = (price: number, purchaseDate: string, group: string): AssetDepreciation => {
    const pDate = new Date(purchaseDate);
    const maxMonths = group === "Kelompok 1" ? 48 : 96;
    if (isNaN(pDate.getTime()) || price <= 0) return { monthlyDep: 0, accumDep: 0, bookValue: price, monthsElapsed: 0, maxMonths };
    const pYear = pDate.getFullYear(); const pMonth = pDate.getMonth();
    const currentYear = 2026; const currentMonth = 5;
    if (pYear > currentYear || (pYear === currentYear && pMonth > currentMonth)) return { monthlyDep: 0, accumDep: 0, bookValue: price, monthsElapsed: 0, maxMonths };
    const monthsElapsed = (currentYear - pYear) * 12 + (currentMonth - pMonth) + 1;
    const actualDepMonths = Math.min(monthsElapsed, maxMonths);
    const monthlyDep = price / maxMonths;
    return { monthlyDep, accumDep: monthlyDep * actualDepMonths, bookValue: Math.max(0, price - monthlyDep * actualDepMonths), monthsElapsed, maxMonths };
  };

  const getAssetsSummary = () => {
    let totalCost = 0, totalMonthlyDep = 0, totalAccumDep = 0, totalBookValue = 0;
    assetsList.forEach((asset) => {
      const { monthlyDep, accumDep, bookValue, monthsElapsed, maxMonths } = calculateDepreciation(asset.purchase_price, asset.purchase_date, asset.group);
      totalCost += asset.purchase_price;
      if (monthsElapsed <= maxMonths && monthsElapsed > 0) totalMonthlyDep += monthlyDep;
      totalAccumDep += accumDep; totalBookValue += bookValue;
    });
    return { totalCost, totalMonthlyDep, totalAccumDep, totalBookValue };
  };

  const handleCalculateFinal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const rev = parseFloat(grossRevenueFinal);
    if (isNaN(rev) || rev < 0) { showToast("Masukkan nominal omzet yang valid!", "error"); return; }
    setResultFinal({ revenue: rev, taxDue: rev * 0.005 });
  };

  const handleCalculateBadan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const rev = parseFloat(grossRevenueBadan); const profit = parseFloat(netProfitBadan);
    if (isNaN(rev) || rev < 0 || isNaN(profit) || profit < 0) { showToast("Masukkan nominal omzet dan laba yang valid!", "error"); return; }
    if (profit > rev) { showToast("Laba bersih tidak boleh melebihi total omzet!", "error"); return; }
    let taxDue = 0; let explanation = "";
    if (rev <= 4800000000) { taxDue = profit * 0.11; explanation = "Karena omzet bruto tidak melebihi Rp 4.8 Miliar, seluruh PKP berhak mendapatkan fasilitas pengurangan tarif 50% (tarif efektif 11%)."; }
    else if (rev <= 50000000000) {
      const bagianFasilitas = (4800000000 / rev) * profit; const bagianNonFasilitas = profit - bagianFasilitas;
      taxDue = bagianFasilitas * 0.11 + bagianNonFasilitas * 0.22;
      explanation = `Omzet bruto antara Rp4.8M s/d Rp50M. PKP mendapat fasilitas proporsional.`;
    } else { taxDue = profit * 0.22; explanation = "Omzet bruto melebihi Rp 50 Miliar, tarif umum 22% diterapkan penuh."; }
    setResultBadan({ revenue: rev, profit, taxDue, explanation });
  };

  const handleAddRecord = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const rev = parseFloat(String(formRevenue)); const tax = parseFloat(String(formTaxDue));
    if (isNaN(rev) || rev < 0 || isNaN(tax) || tax < 0) { showToast("Masukkan nominal angka yang valid!", "error"); return; }
    const newRecord: TaxRecord = { id: genRandomId(), tax_year: parseInt(String(formYear)), tax_period: formPeriod, tax_type: formType, gross_revenue: rev, tax_due: tax, status: formStatus, payment_date: formPaymentDate || "-", ntpn_code: formNtpn || "-", bpe_code: formBpe || "-" };
    const success = await saveRecordsToDatabase([newRecord, ...records]);
    if (success) { setFormRevenue(""); setFormTaxDue(""); setFormPaymentDate(""); setFormNtpn(""); setFormBpe(""); }
  };

  const handleDeleteRecord = async (id: string): Promise<void> => {
    if (confirm("Apakah Anda yakin ingin menghapus arsip laporan pajak ini?")) await saveRecordsToDatabase(records.filter((r) => r.id !== id));
  };

  const handleAddAsset = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const price = parseFloat(assetPurchasePrice);
    if (isNaN(price) || price <= 0) { showToast("Masukkan harga perolehan yang valid!", "error"); return; }
    if (!assetPurchaseDate) { showToast("Pilih tanggal perolehan aset!", "error"); return; }
    if (!assetName.trim()) { showToast("Masukkan nama aset!", "error"); return; }
    const newAsset: TaxAsset = { id: genRandomId(), name: assetName.trim(), group: assetGroup, purchase_date: assetPurchaseDate, purchase_price: price };
    const success = await saveAssetsToDatabase([newAsset, ...assetsList]);
    if (success) { setAssetName(""); setAssetGroup("Kelompok 1"); setAssetPurchaseDate(""); setAssetPurchasePrice(""); }
  };

  const handleDeleteAsset = async (id: string): Promise<void> => {
    if (confirm("Apakah Anda yakin ingin menghapus aset ini dari pencatatan fiskal?")) await saveAssetsToDatabase(assetsList.filter((a) => a.id !== id));
  };

  const handleSaveToArchive = () => {
    if (resultFinal) { setFormYear(new Date().getFullYear()); setFormPeriod("Bulanan"); setFormType("PPh Final 0.5% (PP 55/2022)"); setFormRevenue(resultFinal.revenue); setFormTaxDue(resultFinal.taxDue); setActiveSubTab("archive"); showToast("Form arsip berhasil diisi otomatis!"); }
    else if (resultBadan) { setFormYear(new Date().getFullYear()); setFormPeriod("Tahunan"); setFormType("PPh Badan Pasal 31E (Fasilitas)"); setFormRevenue(resultBadan.revenue); setFormTaxDue(resultBadan.taxDue); setActiveSubTab("archive"); showToast("Form arsip berhasil diisi otomatis!"); }
  };

  const assetsSummary = getAssetsSummary();

  return {
    activeSubTab, setActiveSubTab, taxMethod, setTaxMethod, toast, loading, saving, records,
    assetsList, loadingAssets, savingAssets, assetsSummary,
    grossRevenueFinal, setGrossRevenueFinal, resultFinal, grossRevenueBadan, setGrossRevenueBadan,
    netProfitBadan, setNetProfitBadan, resultBadan,
    formYear, setFormYear, formPeriod, setFormPeriod, formType, setFormType, formRevenue, setFormRevenue,
    formTaxDue, setFormTaxDue, formStatus, setFormStatus, formPaymentDate, setFormPaymentDate,
    formNtpn, setFormNtpn, formBpe, setFormBpe,
    assetName, setAssetName, assetGroup, setAssetGroup, assetPurchaseDate, setAssetPurchaseDate,
    assetPurchasePrice, setAssetPurchasePrice,
    handleCalculateFinal, handleCalculateBadan, handleAddRecord, handleDeleteRecord,
    handleAddAsset, handleDeleteAsset, handleSaveToArchive, calculateDepreciation, formatRupiah,
  };
}
