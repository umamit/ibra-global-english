export const dynamic = 'force-dynamic';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Syarat & Ketentuan - Ibra Digital Engineering",
  description: "Syarat dan ketentuan layanan resmi pengerjaan proyek website dan aplikasi digital oleh Ibra Digital Engineering.",
  alternates: {
    canonical: "/digital-agency/terms",
  },
};

import LegalLayout from "@/app/legal/LegalLayout";

export default function AgencyTermsPage() {
  return (
    <LegalLayout title="Syarat & Ketentuan Layanan" lastUpdated="15 Juli 2026" publisher="Ibra Digital Engineering">
      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          1. Cakupan Proyek & Layanan
        </h2>
        <p>
          Ibra Digital Engineering menyediakan jasa perancangan, pengembangan, & integrasi sistem digital yang mencakup pembuatan **Landing Page Premium, Portal Bisnis / Custom Web App, dan LMS / Sistem Edukasi**. Setiap spesifikasi fitur dan lingkup pekerjaan akan disepakati secara tertulis di awal proyek sebelum pengerjaan dimulai.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          2. Skema & Ketentuan Pembayaran
        </h2>
        <p>
          - Pembayaran pengerjaan proyek menggunakan skema termin: **Uang Muka (DP) sebesar 50%** wajib diselesaikan sebelum pengerjaan desain UI/UX dan pengodean dimulai.<br />
          - **Pelunasan sisa 50%** diselesaikan segera setelah website selesai dideploy di server staging/produksi, diuji bersama, dan siap untuk dipublikasikan secara komersial.<br />
          - Seluruh biaya proyek yang telah dibayarkan pada termin berjalan bersifat *non-refundable* (tidak dapat dikembalikan) jika terjadi pembatalan sepihak oleh klien saat proyek sedang berlangsung.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          3. Pengaturan Cloud Hosting & Database (Supabase & Vercel)
        </h2>
        <p>
          - Demi menghemat biaya klien, pengerjaan website secara default akan dikonfigurasi menggunakan layanan cloud gratis (**Free Tier**) pada platform **Vercel** dan database **Supabase**.<br />
          - Penyedia jasa (Ibra Digital Engineering) tidak bertanggung jawab atas biaya bulanan server di kemudian hari. Apabila kapasitas lalu lintas (*traffic*) website atau ruang penyimpanan data klien telah melampaui batas kuota gratis tersebut, biaya peningkatan kapasitas server ke paket berbayar (**Pro Tier**) sepenuhnya menjadi tanggung jawab Klien dan akan ditagihkan langsung ke kartu pembayaran milik Klien yang terdaftar di akun cloud masing-masing.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          4. Kepemilikan Hak Cipta & Source Code
        </h2>
        <p>
          - Setelah Klien menyelesaikan seluruh pelunasan pembayaran proyek, hak kepemilikan penuh dan hak guna atas seluruh kode program (*source code*) serta aset desain website diserahkan sepenuhnya kepada Klien.<br />
          - Penyedia jasa (Ibra Digital Engineering) berhak untuk menyertakan hasil pengerjaan proyek ini ke dalam portofolio agensi kami, serta menyisipkan signature pengembang (*"Developed by Ibra Digital Engineering"*) di bagian footer website Klien, kecuali disepakati lain secara tertulis sebelumnya.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          5. Garansi Pemeliharaan (Maintenance) & Bug Fixes
        </h2>
        <p>
          - Kami memberikan **garansi pemeliharaan gratis selama 3 bulan pertama** sejak website dideploy secara resmi di domain utama Klien.<br />
          - Garansi ini mencakup perbaikan kesalahan teknis sistem (*bug fixes*), kegagalan database, serta konsultasi teknis gratis.<br />
          - Garansi ini **tidak mencakup** penambahan fitur baru di luar kesepakatan awal proyek, pemulihan data akibat kelalaian Klien dalam mengelola akun admin, atau gangguan server luar (Vercel/Supabase down). Penambahan fitur baru pasca peluncuran akan dikenakan tarif tambahan (*add-on*).
        </p>
      </section>

      <section style={{ borderTop: "1px solid var(--color-gray-200)", paddingTop: "1.5rem", marginTop: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
          Hubungi Kami
        </h2>
        <p>
          Apabila Anda memiliki pertanyaan lebih lanjut mengenai ketentuan layanan pengerjaan proyek digital ini, silakan hubungi tim kami melalui:
        </p>
        <p style={{ marginTop: "0.5rem" }}>
          📧 Email: <strong>digital@ibraglobalenglish.uk</strong><br />
          💬 WhatsApp Support: <strong>+62 813-5700-1357</strong>
        </p>
      </section>
    </LegalLayout>
  );
}
