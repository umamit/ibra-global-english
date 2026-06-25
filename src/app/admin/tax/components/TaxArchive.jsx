"use client";

export default function TaxArchive({
  records,
  loading,
  saving,
  formYear,
  setFormYear,
  formPeriod,
  setFormPeriod,
  formType,
  setFormType,
  formRevenue,
  setFormRevenue,
  formTaxDue,
  setFormTaxDue,
  formStatus,
  setFormStatus,
  formPaymentDate,
  setFormPaymentDate,
  formNtpn,
  setFormNtpn,
  formBpe,
  setFormBpe,
  handleAddRecord,
  handleDeleteRecord,
  formatRupiah,
  onPrintArchive
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* Form Perekaman Baru */}
      <div className="portal-card no-print" style={{ padding: "2rem" }}>
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
      <div className="portal-card print-card" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--color-gray-800)", margin: 0 }}>
            Riwayat Pembayaran & Pelaporan SPT PT Perseorangan
          </h3>
          {!loading && records.length > 0 && (
            <button
              onClick={() => onPrintArchive()}
              className="btn-portal-outline no-print"
              style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", fontWeight: "700" }}
            >
              🖨️ Cetak Riwayat (PDF)
            </button>
          )}
        </div>
        
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
                  <th className="no-print" style={{ padding: "12px 10px", textAlign: "right" }}>Aksi</th>
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
                    <td className="no-print" style={{ padding: "14px 10px", textAlign: "right" }}>
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
  );
}