"use client";

export default function FinanceTable({
  filteredStudents,
  getStudentPayment,
  formatRupiah,
  loading,
  searchQuery,
  students,
  onQuickConfirm,
  onPrintReceipt,
  onEditPayment
}) {
  if (loading) {
    return (
      <div className="portal-card" style={{ padding: "1.5rem", overflowX: "auto" }}>
        <p style={{ textAlign: "center", color: "var(--color-gray-400)", padding: "2rem 0" }}>Memproses pemuatan data keuangan...</p>
      </div>
    );
  }

  if (filteredStudents.length === 0) {
    return (
      <div className="portal-card" style={{ padding: "1.5rem", overflowX: "auto" }}>
        <p style={{ textAlign: "center", color: "var(--color-gray-400)", padding: "2rem 0" }}>Tidak ada data siswa yang cocok dengan filter pencarian.</p>
      </div>
    );
  }

  return (
    <div className="portal-card" style={{ padding: "1.5rem", overflowX: "auto" }}>
      <table className="portal-table student-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "rgba(33, 108, 126, 0.05)" }}>
            <th style={{ textAlign: "left", padding: "12px" }}>Nama Siswa</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Program</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Wali Murid (Ortu)</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Nominal Biaya</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Metode</th>
            <th style={{ textAlign: "center", padding: "12px" }}>Status SPP</th>
            <th style={{ textAlign: "right", padding: "12px" }}>Tindakan Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student) => {
            const pay = getStudentPayment(student.id);
            return (
              <tr key={student.id} style={{ borderBottom: "1px solid var(--color-gray-100)" }} className="table-row-hover">
                <td style={{ padding: "12px", fontWeight: "700", color: "var(--color-gray-800)" }} data-label="Nama Siswa">
                  {student.name}
                </td>
                <td style={{ padding: "12px" }} data-label="Program">
                  <span className="badge-program">{student.program}</span>
                </td>
                <td style={{ padding: "12px", color: "var(--color-gray-600)" }} data-label="Orang Tua">
                  {student.profiles?.full_name || <em style={{ color: "var(--color-red)" }}>Belum terhubung</em>}
                </td>
                <td style={{ padding: "12px", fontWeight: "600", color: "var(--color-gray-700)" }} data-label="Biaya">
                  {formatRupiah(pay.amount)}
                </td>
                <td style={{ padding: "12px", color: "var(--color-gray-500)", fontSize: "0.9rem" }} data-label="Metode">
                  {pay.status !== "belum_bayar" ? (pay.payment_method || "Transfer Bank") : "-"}
                </td>
                <td style={{ padding: "12px", textAlign: "center" }} data-label="Status">
                  {pay.status === "lunas" ? (
                    <span className="badge-status-present" style={{ display: "inline-block", width: "120px" }}>LUNAS</span>
                  ) : pay.status === "menunggu_konfirmasi" ? (
                    <span className="badge-status-sick" style={{ display: "inline-block", width: "120px", color: "#b45309", borderColor: "#fef3c7", background: "#fef3c7" }}>KONFIRMASI</span>
                  ) : (
                    <span className="badge-status-absent" style={{ display: "inline-block", width: "120px" }}>BELUM BAYAR</span>
                  )}
                </td>
                <td style={{ padding: "12px", textAlign: "right" }} data-label="Aksi">
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    {pay.status === "menunggu_konfirmasi" && (
                      <button
                        onClick={() => onQuickConfirm(student.id)}
                        className="btn-portal-outline"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", borderColor: "#10b981", color: "#10b981", fontWeight: "600" }}
                      >
                        Setujui Lunas
                      </button>
                    )}
                    {pay.status === "lunas" && (
                      <button
                        onClick={() => onPrintReceipt(student, pay)}
                        className="btn-portal-outline"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", borderColor: "var(--color-primary-dark)", color: "var(--color-primary-dark)" }}
                        title="Cetak Kuitansi Pembayaran"
                      >
                        🖨️ Kuitansi
                      </button>
                    )}
                    <button
                      onClick={() => onEditPayment(student)}
                      className="btn-portal-outline"
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                    >
                      Kelola SPP
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}