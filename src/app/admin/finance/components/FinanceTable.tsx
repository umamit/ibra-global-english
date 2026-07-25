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
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", borderColor: "var(--color-accent)", color: "var(--color-accent-dark)", fontWeight: "600" }}
                        title="Kirim pesan tagihan via WhatsApp"
                      >
                        💬 Tagih WA
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
