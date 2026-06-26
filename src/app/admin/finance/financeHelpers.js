export const getStudentPayment = (studentId, students, payments, selectedMonth, sppPrices) => {
  const student = students.find(s => s.id === studentId);
  const program = student?.program || "Kids Program";
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

export const exportPaymentsCSV = (students, payments, selectedMonth, sppPrices) => {
  const formatRupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
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