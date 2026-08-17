import html2canvas from "html2canvas";

export const generateReceiptPNG = async (elementId: string, filename: string): Promise<string | null> => {
  const elem = document.getElementById(elementId);
  if (!elem) return null;
  try {
    const canvas = await html2canvas(elem, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `${filename}.png`;
    link.click();
    return image;
  } catch (err) {
    console.error("Gagal membuat gambar kuitansi PNG:", err);
    return null;
  }
};

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

  const printWindow = window.open("", "_blank", "width=850,height=750");
  if (!printWindow) {
    alert("Popup diblokir peramban. Harap izinkan popup untuk mencetak kuitansi PDF.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <title>Kuitansi SPP - ${student.name}</title>
      <style>
        @media print { body { margin: 0; padding: 20px; } .no-print { display: none; } }
        body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; padding: 25px; background: #fff; }
        .receipt-card { border: 2px solid #216c7e; border-radius: 12px; padding: 25px; max-width: 650px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 18px; }
        .brand-title { color: #216c7e; font-size: 1.4rem; font-weight: 800; margin: 0; }
        .subtitle { color: #a68849; font-size: 0.8rem; font-weight: 700; margin-top: 3px; text-transform: uppercase; }
        .info-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.9rem; }
        .info-table td { padding: 6px 0; }
        .info-table td.label { font-weight: 600; color: #64748b; width: 150px; }
        .amount-box { margin-top: 20px; padding: 10px 18px; background-color: #eef6f8; border: 2px solid #216c7e; border-radius: 8px; font-size: 1.2rem; font-weight: 800; color: #216c7e; display: inline-block; }
        .footer { margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 0.8rem; }
      </style>
    </head>
    <body>
      <div class="receipt-card">
        <div class="header">
          <div>
            <h1 class="brand-title">IBRA GLOBAL ENGLISH</h1>
            <div class="subtitle">Kuitansi Pembayaran SPP Resmi</div>
          </div>
          <div style="text-align: right; font-size: 0.8rem; color: #64748b;">
            <div>No. Kuitansi:</div>
            <div style="color: #0f172a; font-weight: 700;">${receiptNo}</div>
          </div>
        </div>
        <table class="info-table">
          <tr><td class="label">Nama Siswa</td><td>: <strong>${student.name}</strong> (${student.program})</td></tr>
          <tr><td class="label">Diterima Dari</td><td>: ${student.profiles?.full_name || "Wali Murid " + student.name}</td></tr>
          <tr><td class="label">Untuk Pembayaran</td><td>: SPP Bulan <strong>${monthName}</strong></td></tr>
          <tr><td class="label">Terbilang</td><td>: <em># ${amountInWords} #</em></td></tr>
          <tr><td class="label">Tanggal Bayar</td><td>: ${paymentDateStr}</td></tr>
          <tr><td class="label">Metode Pembayaran</td><td>: ${pay.payment_method || "Transfer Bank"}</td></tr>
        </table>
        <div class="amount-box">Nominal: ${formattedAmount}</div>
        <div class="footer">
          <div style="color: #94a3b8;">* Bukti pembayaran sah LKP Ibra Global English.</div>
          <div style="text-align: center;">
            <div>Bobong, ${paymentDateStr}</div>
            <div style="height: 45px;"></div>
            <div style="font-weight: 700; border-top: 1px solid #cbd5e1; padding-top: 4px; min-width: 130px;">Admin Keuangan</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 250);
};

export const printAllFinanceReportHTML = (
  students: any[], payments: any[], selectedMonth: string, getMonthName: (m: string) => string, formatRupiah: (n: number) => string, sppPrices: Record<string, number>
): void => {
  const monthName = getMonthName(selectedMonth);
  const nowStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  let expected = 0, collected = 0, lunasCount = 0, unpaidCount = 0;
  const rows = students.map((student, idx) => {
    const pay = payments.find((p) => p.student_id === student.id && p.month === selectedMonth);
    const baseAmount = sppPrices[student.program] || 300000;
    const amount = pay && pay.status === "lunas" ? pay.amount : baseAmount;
    expected += amount;

    const isLunas = pay?.status === "lunas";
    if (isLunas) {
      collected += amount;
      lunasCount++;
    } else {
      unpaidCount++;
    }

    const joinDate = student.created_at ? new Date(student.created_at) : null;
    const joinDay = joinDate ? joinDate.getDate() : 10;
    const payDateObj = pay?.payment_date ? new Date(pay.payment_date) : null;
    const payDay = payDateObj ? payDateObj.getDate() : null;
    const payMonthStr = payDateObj ? `${payDateObj.getFullYear()}-${String(payDateObj.getMonth() + 1).padStart(2, "0")}` : "";

    let badgeText = "Unpaid";
    let badgeColor = "#991b1b";
    let badgeBg = "#fef2f2";

    if (pay?.payment_type === "prepaid") {
      badgeText = "Prepaid"; badgeColor = "#065f46"; badgeBg = "#ecfdf5";
    } else if (pay?.payment_type === "postpaid") {
      badgeText = "Postpaid"; badgeColor = "#92400e"; badgeBg = "#fffbeb";
    } else if (isLunas) {
      if (payMonthStr < selectedMonth || (payMonthStr === selectedMonth && payDay && payDay <= joinDay)) {
        badgeText = "Prepaid"; badgeColor = "#065f46"; badgeBg = "#ecfdf5";
      } else {
        badgeText = "Postpaid"; badgeColor = "#92400e"; badgeBg = "#fffbeb";
      }
    }

    return `
      <tr>
        <td style="padding: 7px; text-align: center; border-bottom: 1px solid #e2e8f0;">${idx + 1}</td>
        <td style="padding: 7px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">${student.name}</td>
        <td style="padding: 7px; border-bottom: 1px solid #e2e8f0;">${student.program}</td>
        <td style="padding: 7px; border-bottom: 1px solid #e2e8f0;">${student.profiles?.full_name || "-"}</td>
        <td style="padding: 7px; border-bottom: 1px solid #e2e8f0;">${formatRupiah(amount)}</td>
        <td style="padding: 7px; text-align: center; border-bottom: 1px solid #e2e8f0;">
          <span style="font-size: 0.72rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background-color: ${badgeBg}; color: ${badgeColor};">
            ${badgeText}
          </span>
        </td>
        <td style="padding: 7px; text-align: center; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
          ${isLunas ? `<span style="color: #166534;">LUNAS</span>` : `<span style="color: #991b1b;">BELUM BAYAR</span>`}
        </td>
        <td style="padding: 7px; border-bottom: 1px solid #e2e8f0; font-size: 0.8rem;">
          ${pay?.payment_date ? new Date(pay.payment_date).toLocaleDateString("id-ID") : "-"}
        </td>
      </tr>
    `;
  }).join("");

  const printWindow = window.open("", "_blank", "width=1000,height=800");
  if (!printWindow) {
    alert("Popup diblokir peramban. Harap izinkan popup untuk mencetak laporan PDF.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <title>Laporan Rekapitulasi SPP - ${monthName}</title>
      <style>
        @media print { body { margin: 0; padding: 15px; } .no-print { display: none; } }
        body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; padding: 25px; background: #fff; }
        .header-box { border-bottom: 3px double #216c7e; padding-bottom: 10px; margin-bottom: 18px; }
        .title { color: #216c7e; font-size: 1.5rem; font-weight: 800; margin: 0; }
        .subtitle { color: #a68849; font-weight: 700; font-size: 0.85rem; margin-top: 2px; text-transform: uppercase; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px; }
        .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 8px; text-align: center; }
        .summary-card .val { font-size: 1.05rem; font-weight: 800; color: #216c7e; }
        .summary-card .lbl { font-size: 0.72rem; color: #64748b; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.82rem; }
        th { background: #216c7e; color: #fff; padding: 8px; text-align: left; font-size: 0.78rem; }
        .footer { margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 0.8rem; }
      </style>
    </head>
    <body>
      <div class="header-box">
        <h1 class="title">IBRA GLOBAL ENGLISH</h1>
        <div class="subtitle">Laporan Rekapitulasi Pembayaran SPP — Bulan ${monthName}</div>
        <div style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">
          Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lt. 1, Bobong, Taliabu Barat, Maluku Utara
        </div>
      </div>
      <div class="summary-grid">
        <div class="summary-card"><div class="val">${formatRupiah(expected)}</div><div class="lbl">Total Target SPP</div></div>
        <div class="summary-card"><div class="val" style="color: #166534;">${formatRupiah(collected)}</div><div class="lbl">Total Kas Diterima</div></div>
        <div class="summary-card"><div class="val" style="color: #166534;">${lunasCount} Siswa</div><div class="lbl">Status Lunas</div></div>
        <div class="summary-card"><div class="val" style="color: #991b1b;">${unpaidCount} Siswa</div><div class="lbl">Belum Bayar</div></div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 25px; text-align: center;">#</th>
            <th>Nama Siswa</th>
            <th>Program</th>
            <th>Wali Murid</th>
            <th>Nominal</th>
            <th style="text-align: center;">Tipe SPP</th>
            <th style="text-align: center;">Status</th>
            <th>Tgl Bayar</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="footer">
        <div style="color: #94a3b8;">Dicetak dari Portal Admin Ibra Global English pada ${nowStr}</div>
        <div style="text-align: center;">
          <div>Bobong, ${nowStr}</div>
          <div style="height: 45px;"></div>
          <div style="font-weight: 700; border-top: 1px solid #cbd5e1; padding-top: 4px; min-width: 130px;">Admin Keuangan</div>
        </div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 250);
};
