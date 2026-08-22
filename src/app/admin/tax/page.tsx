"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { useTaxPage } from "./hooks/useTaxPage";
import TaxCalculator from "./components/TaxCalculator";
import TaxArchive from "./components/TaxArchive";
import TaxAssets from "./components/TaxAssets";

export default function AdminTaxPage() {
  const {
    activeSubTab, setActiveSubTab, taxMethod, setTaxMethod, loading, saving, records,
    assetsList, loadingAssets, savingAssets, assetsSummary,
    grossRevenueFinal, setGrossRevenueFinal, resultFinal,
    grossRevenueBadan, setGrossRevenueBadan, netProfitBadan, setNetProfitBadan, resultBadan,
    formYear, setFormYear, formPeriod, setFormPeriod, formType, setFormType,
    formRevenue, setFormRevenue, formTaxDue, setFormTaxDue, formStatus, setFormStatus,
    formPaymentDate, setFormPaymentDate, formNtpn, setFormNtpn, formBpe, setFormBpe,
    assetName, setAssetName, assetGroup, setAssetGroup, assetPurchaseDate, setAssetPurchaseDate,
    assetPurchasePrice, setAssetPurchasePrice,
    handleCalculateFinal, handleCalculateBadan, handleAddRecord, handleDeleteRecord,
    handleAddAsset, handleDeleteAsset, handleSaveToArchive, calculateDepreciation, formatRupiah,
  } = useTaxPage();

  const TABS = [
    { id: "calculator", label: "Kalkulator Simulasi Pajak" },
    { id: "archive", label: "Arsip Pelaporan SPT & PPh" },
    { id: "assets", label: "Kelola Aset & Penyusutan" },
  ];

  return (
    <div style={{ padding: "1.5rem" }}>

      {/* Print Header */}
      <div className="print-only" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", borderBottom: "3px double #1f2937", paddingBottom: "0.75rem" }}>
          <img src="/assets/logo.png" alt="Logo Ibra Global English" style={{ width: "65px", height: "65px", objectFit: "contain" }} />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "1.4rem", fontWeight: "900", color: "#111827", margin: 0, textTransform: "uppercase" }}>IBRA GLOBAL ENGLISH BOBONG</h1>
            <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "#4b5563", margin: "0.1rem 0", fontStyle: "italic" }}>English Course &amp; Bimbingan Belajar Calistung Terbaik di Pulau Taliabu</p>
            <p style={{ fontSize: "0.7rem", color: "#6b7280", margin: 0 }}>Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001, Bobong, Taliabu Barat, Kabupaten Pulau Taliabu, Maluku Utara 97794 | WA: +62 813-5700-1357</p>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "0.25rem", borderBottom: "1px solid var(--color-gray-200)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>SPT Pajak PT Perseorangan</h1>
        <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>Kelola kepatuhan perpajakan Wajib Pajak Badan PT Perseorangan (Perseroan Perorangan) secara terstruktur.</p>
      </div>

      {/* Sub Tabs */}
      <div className="no-print" style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} className={`btn-portal-outline ${activeSubTab === tab.id ? "active" : ""}`} style={{ padding: "0.6rem 1.5rem", fontWeight: "700" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === "calculator" && (
        <TaxCalculator
          taxMethod={taxMethod} setTaxMethod={setTaxMethod}
          grossRevenueFinal={grossRevenueFinal} setGrossRevenueFinal={setGrossRevenueFinal}
          resultFinal={resultFinal} handleCalculateFinal={handleCalculateFinal}
          grossRevenueBadan={grossRevenueBadan} setGrossRevenueBadan={setGrossRevenueBadan}
          netProfitBadan={netProfitBadan} setNetProfitBadan={setNetProfitBadan}
          resultBadan={resultBadan} handleCalculateBadan={handleCalculateBadan}
          formatRupiah={formatRupiah} onSaveToArchive={handleSaveToArchive} onPrintResult={() => window.print()}
        />
      )}

      {activeSubTab === "archive" && (
        <TaxArchive
          records={records} loading={loading} saving={saving}
          formYear={formYear} setFormYear={setFormYear} formPeriod={formPeriod} setFormPeriod={setFormPeriod}
          formType={formType} setFormType={setFormType} formRevenue={formRevenue} setFormRevenue={setFormRevenue}
          formTaxDue={formTaxDue} setFormTaxDue={setFormTaxDue} formStatus={formStatus} setFormStatus={setFormStatus}
          formPaymentDate={formPaymentDate} setFormPaymentDate={setFormPaymentDate}
          formNtpn={formNtpn} setFormNtpn={setFormNtpn} formBpe={formBpe} setFormBpe={setFormBpe}
          handleAddRecord={handleAddRecord} handleDeleteRecord={handleDeleteRecord}
          formatRupiah={formatRupiah} onPrintArchive={() => window.print()}
        />
      )}

      {activeSubTab === "assets" && (
        <TaxAssets
          assetsList={assetsList} loadingAssets={loadingAssets} savingAssets={savingAssets}
          assetName={assetName} setAssetName={setAssetName} assetGroup={assetGroup} setAssetGroup={setAssetGroup}
          assetPurchaseDate={assetPurchaseDate} setAssetPurchaseDate={setAssetPurchaseDate}
          assetPurchasePrice={assetPurchasePrice} setAssetPurchasePrice={setAssetPurchasePrice}
          assetsSummary={assetsSummary} formatRupiah={formatRupiah} calculateDepreciation={calculateDepreciation}
          handleAddAsset={handleAddAsset} handleDeleteAsset={handleDeleteAsset}
        />
      )}
    </div>
  );
}
