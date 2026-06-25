"use client";

export default function TaxAssets({
  assetsList,
  loadingAssets,
  savingAssets,
  assetName,
  setAssetName,
  assetGroup,
  setAssetGroup,
  assetPurchaseDate,
  setAssetPurchaseDate,
  assetPurchasePrice,
  setAssetPurchasePrice,
  assetsSummary,
  formatRupiah,
  calculateDepreciation,
  handleAddAsset,
  handleDeleteAsset
}) {
  return (
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
  );
}