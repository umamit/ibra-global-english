/**
 * Get payment information for a specific student
 * @param {string} studentId - The ID of the student
 * @param {Array} students - List of all students
 * @param {Array} payments - List of all payments
 * @param {string} selectedMonth - The selected month in YYYY-MM format
 * @param {Object} sppPrices - SPP price configuration by program
 * @returns {Object} Payment information object
 */
export const getStudentPayment = (studentId, students, payments, selectedMonth, sppPrices) => {
  const student = students.find(s => s.id === studentId);
  if (!student) {
    return {
      student_id: studentId,
      month: selectedMonth,
      amount: 300000,
      status: "belum_bayar",
      payment_method: "Transfer Bank",
      receipt_url: ""
    };
  }

  const program = student.program || "Kids Program";
  const baseAmount = sppPrices[program] || 300000;

  const pay = payments.find(p => p.student_id === studentId);
  if (pay) {
    return { ...pay, amount: pay.status === "belum_bayar" ? baseAmount : pay.amount };
  }

  return {
    student_id: studentId,
    month: selectedMonth,
    amount: baseAmount,
    status: "belum_bayar",
    payment_method: "Transfer Bank",
    receipt_url: ""
  };
};

/**
 * Get payment information for a student with context (simplified version)
 * @param {string} studentId - The ID of the student
 * @returns {Object} Payment information object
 */
export const getStudentPaymentWithContext = (studentId) => {
  // This function should be used within a context where students, payments, selectedMonth, and sppPrices are available
  // For now, we'll keep the original function and address this in the next refactoring step
  console.warn("getStudentPaymentWithContext should be used within a proper context");
  return getStudentPayment(studentId, [], [], "", {});
};

export const exportPaymentsCSV = (students, payments, selectedMonth, sppPrices, formatRupiah) => {
  const statusLabel = (s) => s === "lunas" ? "Lunas" : s === "menunggu_konfirmasi" ? "Menunggu Konfirmasi" : "Belum Bayar";

  const headers = ["No", "Nama Siswa", "Program", "Bulan", "Nominal SPP", "Status", "Metode Bayar", "Tanggal Bayar"];
  const rows = students.map((student, idx) => {
    const pay = getStudentPayment(student.id, students, payments, selectedMonth, sppPrices);
    return [
      idx + 1,
      student.name,
      student.program,
      selectedMonth || "-",
      formatRupiah(pay.amount),
      statusLabel(pay.status),
      pay.payment_method || "-",
      pay.paid_at ? new Date(pay.paid_at).toLocaleDateString("id-ID") : "-"
    ];
  });

  const csvContent = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `laporan_spp_${selectedMonth || "semua"}_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
