"use client";

import { Student, Payment, PaymentResult } from "@/types";
import { getStudentSPPDueInfo } from "../financeHelpers";

interface FinanceTableProps {
  filteredStudents: Student[];
  getStudentPayment: (
    studentId: string,
    students: Student[],
    payments: Payment[],
    month: string,
    sppPrices: Record<string, number>
  ) => PaymentResult;
  formatRupiah: (val: number) => string;
  loading: boolean;
  searchQuery: string;
  students: Student[];
  payments: Payment[];
  selectedMonth: string;
  sppPrices: Record<string, number>;
  onQuickConfirm: (studentId: string) => void;
  onPrintReceipt: (student: Student, pay: PaymentResult) => void;
  onEditPayment: (student: Student) => void;
  onTriggerWaBilling: (student: Student, pay: PaymentResult) => void;
  onViewAnnualCard?: (student: Student) => void;
  currentPage: number;
  pageSize: number;
  totalStudents: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function FinanceTable({
  filteredStudents,
  getStudentPayment,
  formatRupiah,
  loading,
  searchQuery,
  students,
  payments,
  selectedMonth,
  sppPrices,
  onQuickConfirm,
  onPrintReceipt,
  onEditPayment,
  onTriggerWaBilling,
  onViewAnnualCard,
  currentPage,
  pageSize,
  totalStudents,
  onPageChange,
  onPageSizeChange
}: FinanceTableProps) {
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

  const totalPages = pageSize >= 9999 ? 1 : Math.ceil(totalStudents / pageSize);
  const startIndex = (currentPage - 1) * pageSize;

  return (
    <div className="portal-card" style={{ padding: "1.5rem", overflowX: "auto" }}>
      <table className="portal-table student-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "rgba(33, 108, 126, 0.05)" }}>
            <th style={{ textAlign: "center", padding: "12px", width: "50px" }}>#</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Nama Siswa</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Program</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Jatuh Tempo SPP</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Wali Murid (Ortu)</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Nominal Biaya</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Metode</th>
            <th style={{ textAlign: "center", padding: "12px" }}>Status SPP</th>
            <th style={{ textAlign: "right", padding: "12px" }}>Tindakan Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student, idx) => {
             const pay = getStudentPayment(student.id, students, payments, selectedMonth, sppPrices);
             const dueInfo = getStudentSPPDueInfo(student, pay.status, selectedMonth);
            return (
              <tr key={student.id} style={{ borderBottom: "1px solid var(--color-gray-100)" }} className="table-row-hover">
                <td style={{ padding: "12px", textAlign: "center", fontWeight: "700", color: "var(--color-gray-500)" }} data-label="#">
                  {startIndex + idx + 1}
                </td>
                <td style={{ padding: "12px", fontWeight: "700", color: "var(--color-gray-800)" }} data-label="Nama Siswa">
                  {student.name}
                </td>
                <td style={{ padding: "12px" }} data-label="Program">
                  <span className="badge-program">{student.program}</span>
                </td>
                <td style={{ padding: "12px" }} data-label="Jatuh Tempo">
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.5rem",
                      borderRadius: "6px",
                      display: "inline-block",
                      width: "fit-content",
                      backgroundColor: dueInfo.dueStatus === "due_today" ? "#f59e0b" : dueInfo.dueStatus === "due_soon" ? "#fef3c7" : dueInfo.dueStatus === "overdue" ? "#ffe4e6" : dueInfo.dueStatus === "lunas" ? "#d1fae5" : "#f1f5f9",
                      color: dueInfo.dueStatus === "due_today" ? "#ffffff" : dueInfo.dueStatus === "due_soon" ? "#92400e" : dueInfo.dueStatus === "overdue" ? "#9f1239" : dueInfo.dueStatus === "lunas" ? "#065f46" : "#475569",
                      border: dueInfo.dueStatus === "due_soon" ? "1px solid #fcd34d" : dueInfo.dueStatus === "overdue" ? "1px solid #fecdd3" : "none"
                    }}>
                      {dueInfo.badgeLabel}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "var(--color-gray-500)", fontWeight: "500" }}>
                      {dueInfo.modelLabel}
                    </span>
                  </div>
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
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "110px", padding: "0.3rem 0.5rem", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800, backgroundColor: "#e6f4ea", color: "#137333", border: "1px solid rgba(19, 115, 51, 0.15)" }}>LUNAS</span>
                  ) : pay.status === "menunggu_konfirmasi" ? (
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "110px", padding: "0.3rem 0.5rem", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800, backgroundColor: "#fef7e0", color: "#b06000", border: "1px solid rgba(176, 96, 0, 0.15)" }}>KONFIRMASI</span>
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "110px", padding: "0.3rem 0.5rem", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800, backgroundColor: "#fce8e6", color: "#c5221f", border: "1px solid rgba(197, 34, 31, 0.15)" }}>BELUM BAYAR</span>
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
                    {pay.status !== "lunas" && (
                      <button
                        onClick={() => onTriggerWaBilling(student, pay)}
                        className="btn-portal-outline"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", borderColor: "var(--color-accent)", color: "var(--color-accent-dark)", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                        title="Kirim pesan tagihan via WhatsApp"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                        <span>Tagih WA</span>
                      </button>
                    )}
                    <button
                      onClick={() => onEditPayment(student)}
                      className="btn-portal-outline"
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                    >
                      Kelola SPP
                    </button>
                    {onViewAnnualCard && (
                      <button
                        onClick={() => onViewAnnualCard(student)}
                        className="btn-portal-outline"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", borderColor: "var(--color-primary)", color: "var(--color-primary)", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                        title="Lihat Rekapitulasi Kartu SPP 12 Bulan"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                        <span>Kartu SPP</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination Footer */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "1.25rem",
        paddingTop: "1rem",
        borderTop: "1px solid var(--color-gray-200, #e2e8f0)",
        flexWrap: "wrap",
        gap: "0.75rem",
        fontSize: "0.85rem"
      }}>
        <div style={{ color: "var(--color-gray-600)", fontWeight: 500 }}>
          Menampilkan <strong>{totalStudents > 0 ? startIndex + 1 : 0}</strong> – <strong>{Math.min(startIndex + filteredStudents.length, totalStudents)}</strong> dari <strong>{totalStudents}</strong> siswa
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ color: "var(--color-gray-500)" }}>Tampilkan:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                padding: "0.25rem 0.5rem",
                borderRadius: "6px",
                border: "1px solid var(--color-gray-300, #cbd5e1)",
                backgroundColor: "var(--color-bg-card, #ffffff)",
                fontSize: "0.85rem",
                cursor: "pointer"
              }}
            >
              <option value={10}>10 per halaman</option>
              <option value={25}>25 per halaman</option>
              <option value={50}>50 per halaman</option>
              <option value={9999}>Semua</option>
            </select>
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.38rem" }}>
              <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="btn-portal-outline"
                style={{
                  padding: "0.3rem 0.65rem",
                  fontSize: "0.8rem",
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer"
                }}
              >
                &laquo; Prev
              </button>
              <span style={{ fontWeight: 700, padding: "0 0.4rem", color: "var(--color-primary-dark)" }}>
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="btn-portal-outline"
                style={{
                  padding: "0.3rem 0.65rem",
                  fontSize: "0.8rem",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer"
                }}
              >
                Next &raquo;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
