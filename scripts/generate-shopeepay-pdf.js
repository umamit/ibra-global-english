const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

const SHOTS = [
  {
    step: "Langkah 1: Halaman Utama Website (Homepage)",
    url: "https://www.ibraglobalenglish.uk",
    desc: [
      "1. Wali murid / calon siswa membuka halaman utama resmi PT. IBRA GLOBAL ENGLISH.",
      "2. Halaman menampilkan informasi program kursus (Kids, Teens, Fun Calistung, Matematika),",
      "   legalitas lembaga (NPSN K7069872), serta tombol navigasi menuju Portal & Pembayaran.",
    ],
    imgPath: "/Users/husnitausman/.gemini/antigravity/brain/21a1b31b-b2f7-4001-932c-64b90c161204/browser_sandbox/screenshots/step_4_shot_1.png",
  },
  {
    step: "Langkah 2: Pemilihan Program Kursus & Pengisian Data Siswa",
    url: "https://www.ibraglobalenglish.uk/checkout",
    desc: [
      "1. Pengguna mengakses halaman checkout resmi di https://www.ibraglobalenglish.uk/checkout.",
      "2. Pengguna memilih Program Kursus yang akan dibayar beserta nominal SPP bulanan.",
      "3. Pengguna mengisi ID Siswa (IGE-XXXXXX) atau Nama Lengkap Siswa, Periode Bulan SPP,",
      "   serta kontak opsional (Email / WhatsApp) untuk pengiriman kuitansi otomatis.",
    ],
    imgPath: "/Users/husnitausman/.gemini/antigravity/brain/21a1b31b-b2f7-4001-932c-64b90c161204/browser_sandbox/screenshots/step_6_shot_1.png",
  },
  {
    step: "Langkah 3: Pemilihan Metode Pembayaran & Tombol Bayar Sekarang",
    url: "https://www.ibraglobalenglish.uk/checkout",
    desc: [
      "1. Pada bagian '3. Metode Pembayaran', pengguna memilih metode pembayaran yang tersedia",
      "   (terintegrasi dengan Midtrans Snap: Virtual Account Bank, GoPay, Kartu Kredit/Google Pay,",
      "   serta ShopeePay setelah aktivasi disetujui).",
      "2. Pengguna menyetujui Syarat & Ketentuan serta Kebijakan Privasi IGE, lalu menekan tombol",
      "   'Bayar Sekarang' untuk masuk ke jendela pembayaran resmi Midtrans Snap.",
    ],
    imgPath: "/Users/husnitausman/.gemini/antigravity/brain/21a1b31b-b2f7-4001-932c-64b90c161204/browser_sandbox/screenshots/step_16_shot_1.png",
  },
];

async function generatePdf() {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const tealPrimary = rgb(0.129, 0.424, 0.494);
  const tealDark = rgb(0.086, 0.302, 0.341);
  const grayText = rgb(0.349, 0.38, 0.431);
  const darkText = rgb(0.11, 0.14, 0.17);
  const goldAccent = rgb(0.651, 0.533, 0.286);
  const lightBg = rgb(0.96, 0.965, 0.97);
  const borderColor = rgb(0.85, 0.88, 0.9);

  // Page 1: Cover + Step 1
  for (let i = 0; i < SHOTS.length; i++) {
    const item = SHOTS[i];
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    let y = height - 40;

    if (i === 0) {
      page.drawRectangle({ x: 40, y: y - 62, width: width - 80, height: 70, color: lightBg, borderColor, borderWidth: 1 });
      page.drawText("PANDUAN ALUR TRANSAKSI & SHOPEEPAY (CUSTOMER JOURNEY)", { x: 52, y: y - 18, size: 12.5, font: fontBold, color: tealDark });
      page.drawText("Dokumen Verifikasi & Aktivasi Saluran Pembayaran Midtrans Snap", { x: 52, y: y - 34, size: 9, font: fontRegular, color: grayText });
      page.drawText("Merchant: PT. IBRA GLOBAL ENGLISH (NPSN: K7069872) | https://www.ibraglobalenglish.uk", { x: 52, y: y - 49, size: 8.5, font: fontBold, color: goldAccent });
      y -= 86;
    }

    // Step Header
    page.drawRectangle({ x: 40, y: y - 6, width: width - 80, height: 22, color: rgb(0.93, 0.96, 0.97) });
    page.drawText(item.step, { x: 50, y: y + 1, size: 10.5, font: fontBold, color: tealPrimary });
    y -= 22;

    page.drawText(`URL: ${item.url}`, { x: 45, y, size: 8, font: fontOblique, color: grayText });
    y -= 15;

    for (const line of item.desc) {
      page.drawText(line, { x: 45, y, size: 8.8, font: fontRegular, color: darkText });
      y -= 13.5;
    }
    y -= 8;

    // Embed Screenshot
    if (fs.existsSync(item.imgPath)) {
      const imgBytes = fs.readFileSync(item.imgPath);
      const pngImage = await pdfDoc.embedPng(imgBytes);
      const maxW = width - 80;
      const maxH = y - 60;
      const scale = Math.min(maxW / pngImage.width, maxH / pngImage.height);
      const drawW = pngImage.width * scale;
      const drawH = pngImage.height * scale;
      const drawX = (width - drawW) / 2;
      const drawY = y - drawH;

      page.drawRectangle({ x: drawX - 2, y: drawY - 2, width: drawW + 4, height: drawH + 4, borderColor, borderWidth: 1 });
      page.drawImage(pngImage, { x: drawX, y: drawY, width: drawW, height: drawH });
    }

    page.drawText(`Halaman ${i + 1} dari ${SHOTS.length + 1} - PT. IBRA GLOBAL ENGLISH`, { x: 40, y: 25, size: 7.5, font: fontOblique, color: grayText });
  }

  // Final Page: Midtrans Snap ShopeePay Flow & Refund Policy
  const lastPage = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = lastPage.getSize();
  let y = height - 50;

  lastPage.drawRectangle({ x: 40, y: y - 6, width: width - 80, height: 22, color: rgb(0.93, 0.96, 0.97) });
  lastPage.drawText("Langkah 4: Pemrosesan Pembayaran ShopeePay di Midtrans Snap & Verifikasi", { x: 50, y: y + 1, size: 10.5, font: fontBold, color: tealPrimary });
  y -= 28;

  const flowLines = [
    "A. Skenario Mobile (Smartphone / Ponsel Pintar):",
    "   - Jendela Midtrans Snap menampilkan tombol 'Bayar dengan ShopeePay'.",
    "   - Sistem melakukan Deeplink Redirect langsung ke aplikasi Shopee di perangkat pengguna.",
    "   - Aplikasi Shopee menampilkan nama merchant (PT. IBRA GLOBAL ENGLISH) dan nominal terkunci.",
    "   - Pengguna memasukkan PIN ShopeePay / verifikasi biometrik untuk menyelesaikan pembayaran.",
    "",
    "B. Skenario Desktop (Laptop / Komputer):",
    "   - Jendela Midtrans Snap menampilkan QR Code Dinamis resmi ShopeePay.",
    "   - Pengguna membuka aplikasi Shopee di smartphone, memilih Scan QR, dan memindai kode di layar.",
    "   - Pengguna mengonfirmasi pembayaran dan memasukkan PIN ShopeePay.",
    "",
    "C. Penyelesaian Transaksi & Verifikasi Status (Post-Payment):",
    "   - Midtrans mengirimkan HTTP POST Webhook ke endpoint /api/payment/midtrans-webhook.",
    "   - Server IGE memvalidasi SHA-512 Signature Key dan mengubah status tagihan SPP menjadi 'Lunas'.",
    "   - Pengguna diarahkan kembali ke halaman status pembayaran (/checkout) dan kuitansi WhatsApp terbit.",
  ];

  for (const line of flowLines) {
    const isSub = line.startsWith("A.") || line.startsWith("B.") || line.startsWith("C.");
    lastPage.drawText(line, { x: 45, y, size: 9, font: isSub ? fontBold : fontRegular, color: isSub ? tealDark : darkText });
    y -= 14.5;
  }

  y -= 18;
  lastPage.drawRectangle({ x: 40, y: y - 6, width: width - 80, height: 22, color: rgb(0.93, 0.96, 0.97) });
  lastPage.drawText("Ketentuan Transaksi & Kebijakan Pengembalian Dana (Refund Policy)", { x: 50, y: y + 1, size: 10.5, font: fontBold, color: tealPrimary });
  y -= 26;

  const policyLines = [
    "- Nominal Terkunci: Nominal tagihan SPP dikunci oleh server dan tidak dapat diubah oleh pengguna.",
    "- Batas Waktu Sesi: Sesi QR / Deeplink ShopeePay aktif selama 15 menit sebelum otomatis kedaluwarsa.",
    "- Kebijakan Refund: Pembayaran SPP yang telah berstatus settlement bersifat definitif (No Refund).",
    "- Pusat Bantuan: Admin Keuangan PT. IGE - WhatsApp: 0813-5491-0370 | info@ibraglobalenglish.uk",
  ];
  for (const line of policyLines) {
    lastPage.drawText(line, { x: 45, y, size: 9, font: fontRegular, color: darkText });
    y -= 15;
  }

  lastPage.drawText(`Halaman ${SHOTS.length + 1} dari ${SHOTS.length + 1} - PT. IBRA GLOBAL ENGLISH`, { x: 40, y: 25, size: 7.5, font: fontOblique, color: grayText });

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(process.cwd(), "public/docs/Panduan_Payment_Flow_ShopeePay_Midtrans_IGE.pdf");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, pdfBytes);
  console.log("PDF with screenshots created at:", outputPath);
}

generatePdf().catch((err) => {
  console.error(err);
  process.exit(1);
});
