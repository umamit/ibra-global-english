import { Student, Payment, PaymentResult } from "@/types";

/**
 * Get payment information for a specific student
 * @param {string} studentId - The ID of the student
 * @param {Array} students - List of all students
 * @param {Array} payments - List of all payments
 * @param {string} selectedMonth - The selected month in YYYY-MM format
 * @param {Object} sppPrices - SPP price configuration by program
 * @returns {PaymentResult} Payment information object
 */
export const getStudentPayment = (
  studentId: string,
  students: Student[],
  payments: Payment[],
  selectedMonth: string,
  sppPrices: Record<string, number>
): PaymentResult => {
  const student = students.find((s: Student) => s.id === studentId);
  if (!student) {
    return {
      amount: 300000,
      status: "belum_bayar",
      payment_method: "Transfer Bank",
      receipt_url: ""
    };
  }

  const program = student.program || "Kids Program";
  const baseAmount = sppPrices[program] || 300000;

  const pay = payments.find((p: Payment) => p.student_id === studentId);
  if (pay) {
    return {
      amount: pay.status === "belum_bayar" ? baseAmount : pay.amount,
      status: pay.status,
      payment_method: pay.payment_method,
      receipt_url: pay.receipt_url,
      payment_date: pay.payment_date
    };
  }

  return {
    amount: baseAmount,
    status: "belum_bayar",
    payment_method: "Transfer Bank",
    receipt_url: ""
  };
};

/**
 * Get payment information for a student with context (simplified version)
 * @param {string} studentId - The ID of the student
 * @returns {PaymentResult} Payment information object
 */
export const getStudentPaymentWithContext = (studentId: string): PaymentResult => {
  console.warn("getStudentPaymentWithContext should be used within a proper context");
  return getStudentPayment(studentId, [], [], "", {});
};

export const exportPaymentsCSV = (
  students: Student[],
  payments: Payment[],
  selectedMonth: string,
  sppPrices: Record<string, number>,
  formatRupiah: (n: number) => string
): void => {
  const statusLabel = (s: string) =>
    s === "lunas" ? "Lunas" : s === "menunggu_konfirmasi" ? "Menunggu Konfirmasi" : "Belum Bayar";

  const headers = ["No", "Nama Siswa", "Program", "Bulan", "Nominal SPP", "Status", "Metode Bayar", "Tanggal Bayar"];
  const rows = students.map((student: Student, idx: number) => {
    const pay = getStudentPayment(student.id, students, payments, selectedMonth, sppPrices);
    return [
      idx + 1,
      student.name,
      student.program,
      selectedMonth || "-",
      formatRupiah(pay.amount),
      statusLabel(pay.status),
      pay.payment_method || "-",
      pay.payment_date ? new Date(pay.payment_date).toLocaleDateString("id-ID") : "-"
    ];
  });

  const csvContent = [headers, ...rows].map((r: any[]) => r.map((v: any) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `laporan_spp_${selectedMonth || "semua"}_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
