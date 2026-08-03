"use client";

import React from "react";
import { TaxAssetsTable } from "./TaxAssetsTable";

export default function TaxAssets(props: any) {
  const { assetsList, loadingAssets, savingAssets, assetName, setAssetName, assetGroup, setAssetGroup, assetPurchaseDate, setAssetPurchaseDate, assetPurchasePrice, setAssetPurchasePrice, assetsSummary, formatRupiah, calculateDepreciation, handleAddAsset, handleDeleteAsset } = props;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        <div className="portal-card" style={{ padding: "1.25rem" }}>
          <span>Total Harga Perolehan</span>
          <h2>{formatRupiah(assetsSummary.totalCost)}</h2>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem" }}>
        <div className="portal-card" style={{ padding: "2rem" }}>
          <h3>Tambah Aset Tetap Baru</h3>
          <form onSubmit={handleAddAsset} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input type="text" placeholder="Nama Aset" className="portal-input" value={assetName} onChange={(e) => setAssetName(e.target.value)} required />
            <select className="portal-input" value={assetGroup} onChange={(e) => setAssetGroup(e.target.value)}>
              <option value="Kelompok 1">Kelompok 1 (4 Tahun - 25%)</option>
              <option value="Kelompok 2">Kelompok 2 (8 Tahun - 12.5%)</option>
            </select>
            <input type="date" className="portal-input" value={assetPurchaseDate} onChange={(e) => setAssetPurchaseDate(e.target.value)} required />
            <input type="number" placeholder="Harga Beli" className="portal-input" value={assetPurchasePrice} onChange={(e) => setAssetPurchasePrice(e.target.value)} required />
            <button type="submit" disabled={savingAssets} className="btn-portal-primary">{savingAssets ? "Menyimpan..." : "Rekam Aset Baru"}</button>
          </form>
        </div>
      </div>

      <TaxAssetsTable loadingAssets={loadingAssets} assetsList={assetsList} calculateDepreciation={calculateDepreciation} formatRupiah={formatRupiah} handleDeleteAsset={handleDeleteAsset} />
    </div>
  );
}
