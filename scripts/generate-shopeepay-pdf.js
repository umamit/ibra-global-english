const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

async function generatePdf() {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Brand Colors
  const tealPrimary = rgb(0.129, 0.424, 0.494); // #216c7e
  const tealDark = rgb(0.086, 0.302, 0.341);    // #164d57
  const grayText = rgb(0.349, 0.38, 0.431);     // #59616e
  const darkText = rgb(0.11, 0.14, 0.17);       // #1c242c
  const goldAccent = rgb(0.651, 0.533, 0.286);  // #A68849
  const lightBg = rgb(0.96, 0.965, 0.97);       // #f5f6f8
  const borderColor = rgb(0.85, 0.88, 0.9);

  let y = height - 45;

  // Header Bar Box
  page.drawRectangle({
    x: 40,
    y: y - 65,
    width: width - 80,
    height: 75,
    color: lightBg,
    borderColor: borderColor,
    borderWidth: 1,
  });

  // Header Title
  page.drawText("PANDUAN ALUR PEMBAYARAN SHOPEEPAY (USER JOURNEY)", {
    x: 55,
    y: y - 20,
    size: 13,
    font: fontBold,
    color: tealDark,
  });

  page.drawText("Dokumen Standar Verifikasi & Aktivasi Saluran Pembayaran Midtrans Snap", {
    x: 55,
    y: y - 36,
    size: 9,
    font: fontRegular,
    color: grayText,
  });

  page.drawText("Merchant: PT. IBRA GLOBAL ENGLISH (NPSN: K7069872) | URL: https://www.ibraglobalenglish.uk", {
    x: 55,
    y: y - 52,
    size: 8.5,
    font: fontBold,
    color: goldAccent,
  });

  y -= 90;

  function drawSectionHeader(title) {
    page.drawRectangle({
      x: 40,
      y: y - 6,
      width: width - 80,
      height: 20,
      color: rgb(0.93, 0.96, 0.97),
    });
    page.drawText(title, {
      x: 50,
      y: y,
      size: 10,
      font: fontBold,
      color: tealPrimary,
    });
    y -= 24;
  }

  function drawTextLine(text, isBold = false, indent = 45, customColor = darkText, size = 8.5) {
    page.drawText(text, {
      x: indent,
      y: y,
      size: size,
      font: isBold ? fontBold : fontRegular,
      color: customColor,
    });
    y -= 13.5;
  }

  // 1. Informasi Merchant & Profil Bisnis
  drawSectionHeader("1. INFORMASI MERCHANT & PLATFORM");
  drawTextLine("Nama Entitas Usaha : PT. IBRA GLOBAL ENGLISH", true);
  drawTextLine("Model Bisnis       : Lembaga Kursus Bahasa Inggris & Pendidikan Non-Formal Berkelanjutan");
  drawTextLine("Domain Web         : https://www.ibraglobalenglish.uk");
  drawTextLine("Halaman Checkout   : https://www.ibraglobalenglish.uk/checkout");
  drawTextLine("Integrasi Gateway  : Midtrans Snap (REST API v2 / Core API / Mobile App Deeplink)");
  y -= 8;

  // 2. Alur Pengguna (User Journey)
  drawSectionHeader("2. ALUR TRANSAKSI PENGGUNA (STEP-BY-STEP USER JOURNEY)");
  drawTextLine("Langkah 1: Pemilihan Program & Identitas Siswa", true, 45, tealDark);
  drawTextLine("- Wali murid mengakses halaman checkout resmi: https://www.ibraglobalenglish.uk/checkout");
  drawTextLine("- Wali murid memilih program kursus (Kids Program / Teens Program / Fun Calistung / Matematika).");
  drawTextLine("- Wali murid menginput Kode ID Kartu QR Siswa (IGE-XXXXXX) atau Nama Lengkap, dan Periode Bulan SPP.");
  y -= 4;

  drawTextLine("Langkah 2: Pemilihan Metode Pembayaran ShopeePay", true, 45, tealDark);
  drawTextLine("- Pada daftar metode pembayaran e-commerce, wali murid memilih opsi 'ShopeePay'.");
  drawTextLine("- Wali murid menyetujui Syarat & Ketentuan serta Kebijakan Privasi IGE, lalu menekan tombol 'Bayar Sekarang'.");
  y -= 4;

  drawTextLine("Langkah 3: Pemrosesan melalui Midtrans Snap", true, 45, tealDark);
  drawTextLine("A. Skenario Mobile (Smartphone / Ponsel Pintar):", true, 55, darkText);
  drawTextLine("   - Jendela pop-up Midtrans Snap menginisiasi tombol 'Bayar dengan ShopeePay'.", false, 55);
  drawTextLine("   - Sistem Midtrans melakukan Deeplink Redirect yang otomatis membuka aplikasi Shopee di perangkat pengguna.", false, 55);
  drawTextLine("   - Aplikasi Shopee menampilkan rincian nama merchant (PT. IBRA GLOBAL ENGLISH) dan nominal tagihan terkunci.", false, 55);
  drawTextLine("   - Pengguna mengonfirmasi transaksi dan memasukkan PIN ShopeePay atau verifikasi biometrik (Fingerprint/Face ID).", false, 55);

  drawTextLine("B. Skenario Desktop (Laptop / Komputer):", true, 55, darkText);
  drawTextLine("   - Jendela Midtrans Snap menampilkan QR Code Dinamis resmi ShopeePay.", false, 55);
  drawTextLine("   - Pengguna membuka aplikasi Shopee di smartphone, memilih menu Scan QR, dan memindai kode di layar desktop.", false, 55);
  drawTextLine("   - Rincian transaksi dikonfirmasi di aplikasi Shopee, lalu pengguna memasukkan PIN ShopeePay.", false, 55);
  y -= 4;

  drawTextLine("Langkah 4: Notifikasi & Penyelesaian Transaksi (Post-Payment Callback)", true, 45, tealDark);
  drawTextLine("- Midtrans mengirimkan notifikasi Webhook resmi (POST) ke endpoint server IGE: /api/payment/midtrans-webhook.");
  drawTextLine("- Server IGE memvalidasi SHA-512 Signature Key secara otomatis. Status SPP diupdate seketika menjadi 'Lunas'.");
  drawTextLine("- Pengguna dialihkan ke halaman notifikasi sukses (/checkout?status=success) dan kuitansi resmi otomatis terbit.");
  y -= 8;

  // 3. Diagram Alur
  drawSectionHeader("3. DIAGRAM SKEMATIK INTEGRASI API");
  page.drawRectangle({
    x: 45,
    y: y - 58,
    width: width - 90,
    height: 65,
    color: rgb(0.97, 0.98, 0.99),
    borderColor: borderColor,
    borderWidth: 1,
  });

  page.drawText("[ Pengguna di Website IGE ]  --->  [ Backend IGE (/api/payment/public-checkout) ]", {
    x: 55,
    y: y - 15,
    size: 8,
    font: fontBold,
    color: tealDark,
  });
  page.drawText("                                                | (Request Snap Token via POST /snap/v1/transactions)", {
    x: 55,
    y: y - 28,
    size: 7.5,
    font: fontRegular,
    color: grayText,
  });
  page.drawText("                                                v", {
    x: 55,
    y: y - 38,
    size: 8,
    font: fontBold,
    color: tealDark,
  });
  page.drawText("[ Aplikasi Shopee (Mobile Deeplink) / Scan QR ] <--- [ Midtrans Snap Payment Gateway UI ]", {
    x: 55,
    y: y - 48,
    size: 8,
    font: fontBold,
    color: tealPrimary,
  });
  y -= 74;

  // 4. Kebijakan Transaksi
  drawSectionHeader("4. KETENTUAN TRANSAKSI & KEBIJAKAN PENGEMBALIAN DANA (REFUND)");
  drawTextLine("Nominal Terkunci   : Nominal transaksi pada sesi Snap bersifat mutlak sesuai biaya SPP resmi dan tidak dapat dimanipulasi.");
  drawTextLine("Batas Waktu Bayar  : Setiap sesi QR / Deeplink dibatasi waktu aktif selama 15 menit (otomatis kedaluwarsa jika lewat waktu).");
  drawTextLine("Kebijakan Refund   : Pembayaran yang telah berstatus settlement bersifat definitif untuk periode berjalan (No Refund).");
  drawTextLine("Pusat Bantuan Resmi: Admin Keuangan PT. IGE: 0813-5491-0370 | info@ibraglobalenglish.uk");
  y -= 14;

  // Footer Signature Line
  page.drawLine({
    start: { x: 40, y: y },
    end: { x: width - 40, y: y },
    thickness: 1,
    color: borderColor,
  });

  page.drawText("Disusun oleh: IT & Financial Operations Division - PT. IBRA GLOBAL ENGLISH", {
    x: 45,
    y: y - 14,
    size: 8,
    font: fontBold,
    color: grayText,
  });
  page.drawText("Dokumen Resmi untuk Persyaratan Verifikasi Merchant Midtrans - November 2026", {
    x: width - 330,
    y: y - 14,
    size: 7.5,
    font: fontOblique,
    color: grayText,
  });

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(process.cwd(), "public/docs/Panduan_Payment_Flow_ShopeePay_Midtrans_IGE.pdf");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, pdfBytes);
  console.log("PDF created successfully at: " + outputPath);
}

generatePdf().catch((err) => {
  console.error(err);
  process.exit(1);
});
