"use client";

import React from "react";

interface TaxResultFinal {
  revenue: number;
  taxDue: number;
}

interface TaxResultBadan {
  revenue: number;
  profit: number;
  explanation: string;
  taxDue: number;
}

interface Props {
  taxMethod: string;
  setTaxMethod: (method: string) => void;
  grossRevenueFinal: string;
  setGrossRevenueFinal: (v: string) => void;
  resultFinal: TaxResultFinal | null;
  handleCalculateFinal: React.FormEventHandler<HTMLFormElement>;
  grossRevenueBadan: string;
  setGrossRevenueBadan: (v: string) => void;
  netProfitBadan: string;
  setNetProfitBadan: (v: string) => void;
  resultBadan: TaxResultBadan | null;
  handleCalculateBadan: React.FormEventHandler<HTMLFormElement>;
  formatRupiah: (value: number) => string;
  onSaveToArchive: () => void;
  onPrintResult: () => void;
}

export default function TaxCalculator({
  taxMethod,
  setTaxMethod,
  grossRevenueFinal,
  setGrossRevenueFinal,
  resultFinal,
  handleCalculateFinal,
  grossRevenueBadan,
  setGrossRevenueBadan,
  netProfitBadan,
  setNetProfitBadan,
  resultBadan,
  handleCalculateBadan,
  formatRupiah,
  onSaveToArchive,
  onPrintResult
}: Props) {
  return (
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGrossRevenueFinal(e.target.value)}
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
          <div className="portal-card print-card" style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between", border: resultFinal ? "2px solid var(--color-primary)" : undefined }}>
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
              <div>
                <div style={{ marginTop: "1rem", backgroundColor: "var(--color-primary-light)", padding: "1rem", borderRadius: "10px", borderLeft: "4px solid var(--color-primary)" }}>
                  <p style={{ fontSize: "0.8rem", color: "var(--color-primary-dark)", lineHeight: "1.4" }}>
                    💡 **Catatan Kepatuhan**: PPh Final 0.5% Badan PT Perseorangan berlaku maksimal 4 tahun pajak sejak didirikan. Penyetoran bulanan paling lambat tanggal 15 bulan berikutnya, dan pelaporan SPT Tahunan paling lambat 30 April tahun berikutnya.
                  </p>
                </div>
                <div className="no-print" style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem" }}>
                  <button
                    onClick={() => onPrintResult()}
                    className="btn-portal-primary"
                    style={{ flex: 1, padding: "0.6rem 1.25rem", fontSize: "0.85rem", fontWeight: "700" }}
                  >
                    🖨️ Cetak Hasil (PDF)
                  </button>
                  <button
                    onClick={onSaveToArchive}
                    className="btn-portal-outline"
                    style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem", fontWeight: "700" }}
                  >
                    💾 Simpan ke Arsip
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Kalkulator PPh Badan Tarif Umum Pasal 31E */}
      {taxMethod === "badan_umum" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>

          {/* Form Input */}
          <div className="portal-card no-print" style={{ padding: "2rem" }}>
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGrossRevenueBadan(e.target.value)}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNetProfitBadan(e.target.value)}
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
          <div className="portal-card print-card" style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between", border: resultBadan ? "2px solid var(--color-primary)" : undefined }}>
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
              <div>
                <div style={{ marginTop: "1rem", backgroundColor: "var(--color-primary-light)", padding: "1rem", borderRadius: "10px", borderLeft: "4px solid var(--color-primary)" }}>
                  <p style={{ fontSize: "0.8rem", color: "var(--color-primary-dark)", lineHeight: "1.4" }}>
                    ℹ️ **Aturan HPP**: Fasilitas pengurangan tarif 50% berlaku atas Penghasilan Kena Pajak yang merupakan bagian dari peredaran bruto sampai dengan Rp4,8 Miliar. Tarif PPh Badan standar di Indonesia adalah 22%.
                  </p>
                </div>
                <div className="no-print" style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem" }}>
                  <button
                    onClick={() => onPrintResult()}
                    className="btn-portal-primary"
                    style={{ flex: 1, padding: "0.6rem 1.25rem", fontSize: "0.85rem", fontWeight: "700" }}
                  >
                    🖨️ Cetak Hasil (PDF)
                  </button>
                  <button
                    onClick={onSaveToArchive}
                    className="btn-portal-outline"
                    style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem", fontWeight: "700" }}
                  >
                    💾 Simpan ke Arsip
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
