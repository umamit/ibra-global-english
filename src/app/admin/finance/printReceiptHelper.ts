export const printReceiptHTML = (
  student: any, pay: any, selectedMonth: string, getMonthName: (m: string) => string, formatRupiah: (n: number) => string, terbilang: (n: number) => string
): void => {
  const amountVal = typeof pay.amount === "string" ? parseInt(pay.amount, 10) : (pay.amount || 0);
  const formattedAmount = formatRupiah(amountVal);
  const amountInWords = (terbilang(amountVal) || "Nol").trim() + " Rupiah";
  const monthName = getMonthName(pay.month || selectedMonth);
  const dateObj = pay.payment_date ? new Date(pay.payment_date) : new Date();
  const paymentDateStr = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const receiptNo = `IBRA/SPP/${(pay.id || "000").substring(0, 6).toUpperCase()}/${dateObj.getFullYear()}`;

  const printWindow = window.open("", "_blank", "width=850,height=700");
  if (!printWindow) return;

  printWindow.document.write(`
    <html><head><title>Kuitansi SPP - ${student.name}</title></head>
    <body style="font-family: sans-serif; padding: 20px;">
      <div style="border: 2px solid #216c7e; padding: 20px; border-radius: 8px;">
        <h2 style="color: #216c7e; margin: 0;">IBRA GLOBAL ENGLISH</h2>
        <p style="color: #a68849; font-weight: bold; margin: 2px 0 15px;">KUITANSI PEMBAYARAN SPP OFFICIAL</p>
        <hr/>
        <p><strong>No Kuitansi:</strong> ${receiptNo}</p>
        <p><strong>Diterima Dari:</strong> ${student.profiles?.full_name || "-"} (Wali dari ${student.name})</p>
        <p><strong>Untuk Pembayaran:</strong> SPP Program ${student.program} - Bulan ${monthName}</p>
        <p><strong>Jumlah Uang:</strong> <em># ${amountInWords} #</em></p>
        <div style="margin-top: 20px; font-size: 1.2rem; font-weight: bold; color: #216c7e; border: 2px solid #216c7e; padding: 10px; display: inline-block;">
          Nominal: ${formattedAmount}
        </div>
        <div style="float: right; text-align: center;">
          <p>Bobong, ${paymentDateStr}</p>
          <br/><br/>
          <p><strong>Admin Keuangan</strong></p>
        </div>
      </div>
      <script>window.onload = function() { window.print(); }</script>
    </body></html>
  `);
  printWindow.document.close();
};
