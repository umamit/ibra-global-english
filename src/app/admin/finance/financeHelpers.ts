import { Student, Payment, PaymentResult } from "@/types";
import { getStudentSPPDueInfo } from "./dueInfoHelper";
import { printReceiptHTML } from "./printReceiptHelper";

export { getStudentSPPDueInfo, printReceiptHTML };

export const getStudentPayment = (
  studentId: string, students: Student[], payments: Payment[], selectedMonth: string, sppPrices: Record<string, number>
): PaymentResult => {
  const student = students.find((s: Student) => s.id === studentId);
  const programLower = (student?.program || "").toLowerCase();
  const defaultPrice = programLower.includes("calistung") ? 350000 : 300000;
  const matchedKey = Object.keys(sppPrices).find(k => k.toLowerCase() === programLower);
  const baseAmount = matchedKey ? sppPrices[matchedKey] : (sppPrices[student?.program || ""] || defaultPrice);

  const pay = payments.find((p: Payment) => p.student_id === studentId);
  if (pay) {
    return {
      amount: pay.status === "belum_bayar" ? baseAmount : pay.amount,
      status: pay.status, payment_method: pay.payment_method, receipt_url: pay.receipt_url, payment_date: pay.payment_date
    };
  }

  return { amount: baseAmount, status: "belum_bayar", payment_method: "Transfer Bank", receipt_url: "" };
};

export const exportPaymentsCSV = (
  students: Student[], payments: Payment[], selectedMonth: string, sppPrices: Record<string, number>, formatRupiah: (n: number) => string
): void => {
  const statusLabel = (s: string) => s === "lunas" ? "Lunas" : s === "menunggu_konfirmasi" ? "Menunggu Konfirmasi" : "Belum Bayar";
  const headers = ["No", "Nama Siswa", "Program", "Bulan", "Nominal SPP", "Status", "Metode Bayar", "Tanggal Bayar"];
  const rows = students.map((student: Student, idx: number) => {
    const pay = getStudentPayment(student.id, students, payments, selectedMonth, sppPrices);
    return [idx + 1, student.name, student.program, selectedMonth || "-", formatRupiah(pay.amount), statusLabel(pay.status), pay.payment_method || "-", pay.payment_date ? new Date(pay.payment_date).toLocaleDateString("id-ID") : "-"];
  });

  const csvContent = [headers, ...rows].map((r: any[]) => r.map((v: any) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `laporan_spp_${selectedMonth || "semua"}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
