export const dynamic = 'force-dynamic';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Kebijakan Privasi - Ibra Digital Engineering",
  description: "Kebijakan privasi resmi pengumpulan dan pengelolaan data klien oleh Ibra Digital Engineering.",
  alternates: {
    canonical: "/digital-agency/privacy",
  },
};

import LegalLayout from "@/app/legal/LegalLayout";

export default function AgencyPrivacyPage() {
  return (
    <LegalLayout title="Kebijakan Privasi" lastUpdated="15 Juli 2026" publisher="Ibra Digital Engineering">
      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          1. Pengumpulan Informasi Klien
        </h2>
        <p>
          Ibra Digital Engineering mengumpulkan data kontak penting (seperti nama lengkap, alamat email, nomor telepon/WhatsApp, dan rincian kebutuhan bisnis) yang Anda kirimkan secara sukarela melalui formulir konsultasi, formulir pemesanan proyek, atau kontak pesan langsung. Kami tidak mengumpulkan informasi sensitif tanpa persetujuan eksplisit dari Anda.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          2. Penggunaan Informasi
        </h2>
        <p>
          Data yang kami kumpulkan dari Anda digunakan secara terbatas untuk kepentingan:
          - Memproses dan menindaklanjuti permintaan penawaran harga pengerjaan website.<br />
          - Keperluan komunikasi, riset kebutuhan fungsionalitas sistem, dan koordinasi progres pengerjaan proyek.<br />
          - Mengirimkan berkas tagihan, bukti pembayaran, dokumen kontrak/SPK, serta informasi pemeliharaan berkala.<br />
          - Menyediakan dukungan teknis pasca peluncuran website.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          3. Perlindungan & Keamanan Data (Supabase & RLS)
        </h2>
        <p>
          - Kami sangat menghormati keamanan data bisnis dan kerahasiaan ide komersial Klien. Semua berkas desain UI/UX, database skema, dan kredensial akses server dikelola dalam lingkungan terbatas dan aman.<br />
          - Sebagai bentuk komitmen perlindungan data, kami menerapkan arsitektur keamanan tingkat lanjut pada database Supabase milik Klien dengan mengonfigurasi aturan **Row Level Security (RLS)** secara ketat. Hal ini menjamin bahwa data sensitif operasional Klien tidak dapat diakses secara publik oleh pihak ketiga yang tidak berwenang.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          4. Integrasi Layanan Pihak Ketiga (Third-Party APIs)
        </h2>
        <p>
          - Website atau web app yang kami bangun untuk Klien mungkin menggunakan integrasi API pihak ketiga (seperti WhatsApp Gateway/Fonnte, sistem pembayaran Midtrans, dan pemetaan Google Maps).<br />
          - Tanggung jawab perlindungan data pada API eksternal tersebut tunduk sepenuhnya pada syarat penggunaan dan kebijakan privasi masing-masing penyedia layanan pihak ketiga yang bersangkutan.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          5. Perubahan Kebijakan Privasi
        </h2>
        <p>
          Ibra Digital Engineering berhak untuk memperbarui Kebijakan Privasi ini sewaktu-waktu demi menyesuaikan dengan perkembangan teknologi dan regulasi hukum yang berlaku. Setiap perubahan akan diumumkan langsung di halaman ini dan berlaku segera setelah dipublikasikan.
        </p>
      </section>

      <section style={{ borderTop: "1px solid var(--color-gray-200)", paddingTop: "1.5rem", marginTop: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
          Layanan Bantuan Privasi
        </h2>
        <p>
          Apabila Anda memiliki keluhan atau memerlukan bantuan terkait privasi data proyek Anda, silakan hubungi kami melalui:
        </p>
        <p style={{ marginTop: "0.5rem" }}>
          📧 Email: <strong>digital@ibraglobalenglish.uk</strong><br />
          💬 WhatsApp Support: <strong>+62 813-5700-1357</strong>
        </p>
      </section>
    </LegalLayout>
  );
}
