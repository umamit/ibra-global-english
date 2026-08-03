import React from "react";

export function TaxAssetsTable({ loadingAssets, assetsList, calculateDepreciation, formatRupiah, handleDeleteAsset }: any) {
  return (
    <div className="portal-card" style={{ padding: "2rem" }}>
      <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "1.5rem" }}>Tabel Rekapitulasi Penyusutan Aset Tetap</h3>
      {loadingAssets ? <p>Memuat...</p> : assetsList.length === 0 ? <p>Belum ada aset tetap.</p> : (
        <table className="portal-table" style={{ width: "100%" }}>
          <thead>
            <tr><th>Nama</th><th>Kelompok</th><th>Harga Beli</th><th>Penyusutan Bln</th><th>Nilai Buku</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {assetsList.map((asset: any) => {
              const { monthlyDep, accumDep, bookValue, monthsElapsed, maxMonths } = calculateDepreciation(asset.purchase_price, asset.purchase_date, asset.group);
              const isFullyDepreciated = monthsElapsed >= maxMonths;
              return (
                <tr key={asset.id}>
                  <td><strong>{asset.name}</strong></td>
                  <td>{asset.group}</td>
                  <td>{formatRupiah(asset.purchase_price)}</td>
                  <td>{formatRupiah(isFullyDepreciated ? 0 : monthlyDep)}</td>
                  <td>{formatRupiah(bookValue)}</td>
                  <td><button onClick={() => handleDeleteAsset(asset.id)} className="btn-portal-danger">Hapus</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
