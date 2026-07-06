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

export const printReceiptHTML = (
  student: Student,
  pay: any,
  selectedMonth: string,
  getMonthName: (m: string) => string,
  formatRupiah: (n: number) => string,
  terbilang: (n: number) => string
): void => {
  const amountVal = typeof pay.amount === "string" ? parseInt(pay.amount, 10) : (pay.amount || 0);
  const formattedAmount = formatRupiah(amountVal);
  const amountInWords = (terbilang(amountVal) || "Nol").trim() + " Rupiah";
  const payMonth = pay.month || selectedMonth;
  const receiptNo = `INV/${payMonth.replace("-", "")}/${student.id.substring(0, 6).toUpperCase()}`;
  const paymentDateStr = pay.payment_date
    ? new Date(pay.payment_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const monthName = getMonthName(payMonth);

  const printWindow = window.open("", "_blank", "width=850,height=650");
  if (!printWindow) return;
  printWindow.document.write(`
    <html>
      <head>
        <title>Kuitansi Pembayaran SPP - ${student.name}</title>
        <style>
          body {
            font-family: 'Montserrat', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #1e293b;
            background-color: #fff;
            margin: 0;
            padding: 40px;
          }
          .receipt-container {
            border: 2px solid #216c7e;
            padding: 30px;
            position: relative;
            max-width: 700px;
            margin: 0 auto;
            background-color: #fff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #216c7e;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .logo-text h1 {
            font-size: 1.5rem;
            font-weight: 800;
            color: #216c7e;
            margin: 0;
            letter-spacing: 0.03em;
          }
          .logo-text p {
            font-size: 0.8rem;
            color: #64748b;
            margin: 3px 0 0 0;
            font-weight: 500;
          }
          .receipt-title {
            text-align: right;
          }
          .receipt-title h2 {
            font-size: 2rem;
            font-weight: 800;
            color: #216c7e;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          .receipt-title p {
            font-size: 0.85rem;
            color: #475569;
            margin: 5px 0 0 0;
            font-weight: 700;
            font-family: monospace;
          }
          .content-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .content-table td {
            padding: 12px 0;
            vertical-align: middle;
            font-size: 0.95rem;
          }
          .content-table td.label {
            width: 170px;
            font-weight: 600;
            color: #475569;
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 0.05em;
          }
          .content-table td.value {
            color: #0f172a;
          }
          .dotted-underline {
            border-bottom: 1.5px dotted #cbd5e1;
            display: block;
            padding-bottom: 3px;
          }
          .amount-box {
            background-color: #f8fafc;
            border: 2.5px solid #216c7e;
            padding: 12px 25px;
            font-size: 1.4rem;
            font-weight: 800;
            color: #216c7e;
            display: inline-block;
            margin-top: 5px;
            border-radius: 4px;
            letter-spacing: 0.02em;
          }
          .footer-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 40px;
          }
          .note {
            font-size: 0.75rem;
            color: #64748b;
            max-width: 320px;
            line-height: 1.5;
          }
          .signature {
            text-align: right;
            font-size: 0.85rem;
            color: #334155;
          }
          .signature .name {
            display: block;
            margin-top: 50px;
            font-weight: 800;
            text-decoration: underline;
            color: #0f172a;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-15deg);
            font-size: 5.5rem;
            font-weight: 900;
            color: rgba(33, 108, 126, 0.03);
            white-space: nowrap;
            pointer-events: none;
            letter-spacing: 0.15em;
          }
          @media print {
            body {
              padding: 0;
            }
            .receipt-container {
              border: 2px solid #000;
            }
            .logo-text h1, .receipt-title h2 {
              color: #000;
            }
            .amount-box {
              border-color: #000;
            }
            .watermark {
              color: rgba(0, 0, 0, 0.02);
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="watermark">IBRA GLOBAL</div>

          <div class="header">
            <div class="logo-text">
              <h1>IBRA GLOBAL ENGLISH</h1>
              <p>Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001, Bobong, Taliabu Barat, Kabupaten Pulau Taliabu, Maluku Utara 97794</p>
              <p>HP/WA: +62 813-5700-1357 | Email: admin@ibraglobalenglish.uk</p>
            </div>
            <div class="receipt-title">
              <h2>Kuitansi</h2>
              <p>No: ${receiptNo}</p>
            </div>
          </div>

          <table class="content-table">
            <tr>
              <td class="label">Diterima Dari</td>
              <td class="value">
                <span class="dotted-underline"><strong>${student.profiles?.full_name || "-"}</strong> (Orang Tua/Wali dari <strong>${student.name}</strong>)</span>
              </td>
            </tr>
            <tr>
              <td class="label">Untuk Pembayaran</td>
              <td class="value">
                <span class="dotted-underline">SPP Bimbingan Belajar Program <strong>${student.program}</strong> - Bulan <strong>${monthName}</strong></span>
              </td>
            </tr>
            <tr>
              <td class="label">Sejumlah Uang</td>
              <td class="value">
                <span class="dotted-underline" style="font-style: italic; font-weight: 600;"># ${amountInWords} #</span>
              </td>
            </tr>
            <tr>
              <td class="label">Metode Bayar</td>
              <td class="value">
                <span class="dotted-underline">${pay.payment_method || "Transfer Bank"}</span>
              </td>
            </tr>
          </table>

          <div class="footer-section">
            <div>
              <p style="margin: 0; font-size: 0.85rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">Jumlah Nominal:</p>
              <div class="amount-box">${formattedAmount}</div>
              <div class="note" style="margin-top: 15px;">
                * Bukti pembayaran ini diterbitkan secara sah dan elektronik.<br/>
                * Pembayaran yang telah lunas tidak dapat ditarik kembali.
              </div>
            </div>

            <div class="signature">
              <p>Bobong, ${paymentDateStr}</p>
              <p style="margin-top: 5px; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em;">Penerima / Admin,</p>
              <span class="name">Husnita Usman, M.Pd.</span>
              <p style="margin-top: 5px; font-size: 0.75rem; font-weight: 600; color: #64748b;">Ibra Global English</p>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
