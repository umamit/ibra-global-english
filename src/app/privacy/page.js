export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Kebijakan Privasi - Ibra Global English Bobong",
  description: "Kebijakan privasi resmi PT Ibra Global English mengenai pengumpulan, penggunaan, dan perlindungan data siswa serta orang tua.",
  alternates: {
    canonical: "/privacy",
  },
};

import LegalLayout from "@/app/legal/LegalLayout";

export default function PrivacyPage() {
  return (
    <LegalLayout title="Kebijakan Privasi">
      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          1. Pengantar
        </h2>
        <p>
          Selamat datang di website resmi **Ibra Global English Bobong** yang dikelola di bawah naungan **PT Ibra Global English** ("Kami"). Kami berkomitmen penuh untuk melindungi privasi data pribadi Anda, baik sebagai wali murid (orang tua), siswa, tutor, maupun pengunjung website kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          2. Informasi yang Kami Kumpulkan
        </h2>
        <p>
          Kami mengumpulkan data pribadi yang Anda berikan secara sukarela untuk keperluan pendaftaran, administrasi akademik, dan pembayaran:
        </p>
        <ul style={{ paddingLeft: "1.25rem", marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <li><strong>Informasi Wali Murid (Orang Tua)</strong>: Nama lengkap, alamat email, nomor telepon/WhatsApp, dan kata sandi akun portal.</li>
          <li><strong>Informasi Siswa</strong>: Nama anak, tanggal lahir/usia, pilihan program belajar (Kids, Teens, Calistung), data kehadiran (absensi), dan pencapaian akademik (nilai rapor).</li>
          <li><strong>Informasi Pembayaran</strong>: Nominal pembayaran SPP bulanan, metode pembayaran, dan berkas foto bukti transfer yang diunggah ke portal.</li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          3. Penggunaan Informasi Anda
        </h2>
        <p>
          Informasi yang kami kumpulkan digunakan secara eksklusif untuk kepentingan internal pendidikan dan administrasi:
        </p>
        <ul style={{ paddingLeft: "1.25rem", marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <li>Menghubungkan akun orang tua dengan data perkembangan belajar siswa secara real-time.</li>
          <li>Menampilkan visualisasi statistik evaluasi nilai (Radar Chart) dan riwayat absensi anak.</li>
          <li>Memverifikasi pembayaran biaya kursus/SPP bulanan secara akurat oleh divisi keuangan.</li>
          <li>Menerbitkan sertifikat kelulusan digital resmi yang valid.</li>
          <li>Mengirimkan informasi pengumuman penting seputar kegiatan belajar mengajar.</li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          4. Perlindungan & Penyimpanan Data
        </h2>
        <p>
          Kami menyadari pentingnya keamanan informasi Anda. Seluruh data pribadi Anda disimpan secara terenkripsi dan aman di dalam database cloud terintegrasi (Supabase) dengan protokol keamanan tingkat lanjut. Kami membatasi akses ke data pribadi Anda hanya untuk staf administratif, tutor, dan pengelola keuangan PT Ibra Global English yang membutuhkannya untuk menjalankan tugas mereka.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          5. Berbagi Data dengan Pihak Ketiga
        </h2>
        <p>
          **Kami tidak akan pernah menjual, menyewakan, menukarkan, atau memberikan informasi pribadi Anda kepada pihak ketiga** mana pun untuk tujuan pemasaran atau komersial tanpa persetujuan tertulis dari Anda, kecuali diwajibkan oleh undang-undang atau otoritas hukum negara yang sah.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          6. Hak-Hak Anda
        </h2>
        <p>
          Anda memiliki hak penuh untuk meminta akses, perbaikan, atau penghapusan informasi pribadi Anda dari sistem kami. Anda juga dapat memperbarui profil atau meminta tutor untuk melakukan sinkronisasi data anak Anda apabila terdapat kesalahan pencatatan.
        </p>
      </section>

      <section style={{ borderTop: "1px solid var(--color-gray-200)", paddingTop: "1.5rem", marginTop: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
          Hubungi Kami
        </h2>
        <p>
          Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini, silakan hubungi kami melalui:
        </p>
        <p style={{ marginTop: "0.5rem" }}>
          📧 Email: <strong>admin@ibraglobalenglish.uk</strong><br />
          📍 Alamat: <strong>Jl. TPU Bobong Komp. Fangahu, Lantai 1 Kost Fitrah, Kab. Pulau Taliabu, Maluku Utara</strong>
        </p>
      </section>
    </LegalLayout>
  );
}