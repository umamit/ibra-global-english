import { Student, Payment, PaymentResult } from "@/types";
import { getStudentSPPDueInfo } from "./dueInfoHelper";
import { printReceiptHTML, printAllFinanceReportHTML } from "./printReceiptHelper";

export { getStudentSPPDueInfo, printReceiptHTML, printAllFinanceReportHTML };

export interface PaymentBadgeInfo {
  type: "prepaid" | "postpaid" | "unpaid";
  label: string;
  badgeStyle: React.CSSProperties;
  description: string;
}

export const calculatePaymentBadge = (
  student: Student | undefined,
  paymentDate: string | null | undefined,
  month: string,
  explicitType?: string | null
): PaymentBadgeInfo => {
  if (explicitType === "prepaid") {
    return {
      type: "prepaid",
      label: "🟢 Prepaid",
      badgeStyle: { backgroundColor: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" },
      description: "Pra-Bayar (Disetel Admin)",
    };
  }
  if (explicitType === "postpaid") {
    return {
      type: "postpaid",
      label: "🟡 Postpaid",
      badgeStyle: { backgroundColor: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" },
      description: "Pasca-Bayar (Disetel Admin)",
    };
  }

  if (!paymentDate) {
    return {
      type: "unpaid",
      label: "Belum Bayar",
      badgeStyle: { backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" },
      description: "Belum Melakukan Pembayaran",
    };
  }

  let targetDay = 10;
  if (typeof student?.due_day === "number" && student.due_day >= 1 && student.due_day <= 31) {
    targetDay = student.due_day;
  } else if (student?.created_at) {
    targetDay = new Date(student.created_at).getDate();
  }

  const payDateObj = new Date(paymentDate);
  const payDay = payDateObj.getDate();
  const payMonthStr = `${payDateObj.getFullYear()}-${String(payDateObj.getMonth() + 1).padStart(2, "0")}`;

  if (payMonthStr < month || (payMonthStr === month && payDay <= targetDay)) {
    return {
      type: "prepaid",
      label: "🟢 Prepaid",
      badgeStyle: { backgroundColor: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" },
      description: `Bayar tgl ${payDay} (Jatuh tempo tgl ${targetDay}) - Tepat Waktu`,
    };
  }

  return {
    type: "postpaid",
    label: "🟡 Postpaid",
    badgeStyle: { backgroundColor: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" },
    description: `Bayar tgl ${payDay} (Jatuh tempo tgl ${targetDay}) - Susulan`,
  };
};

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
      status: pay.status, payment_method: pay.payment_method, payment_type: pay.payment_type, receipt_url: pay.receipt_url, payment_date: pay.payment_date
    };
  }

  return { amount: baseAmount, status: "belum_bayar", payment_method: "Transfer Bank", payment_type: null, receipt_url: "" };
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
