export const dynamic = 'force-dynamic';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Syarat & Ketentuan - Ibra Global English Bobong",
  description: "Syarat dan ketentuan layanan resmi bimbingan belajar dan kursus bahasa Inggris PT Ibra Global English Bobong.",
  alternates: {
    canonical: "/terms",
  },
};

import LegalLayout from "@/app/legal/LegalLayout";

export default function TermsPage() {
  return (
    <LegalLayout title="Syarat & Ketentuan Layanan">
      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          1. Persetujuan Syarat
        </h2>
        <p>
          Dengan mendaftarkan diri Anda atau anak Anda di **Ibra Global English Bobong** (di bawah naungan **PT Ibra Global English**), Anda dianggap telah membaca, memahami, dan menyetujui seluruh ketentuan dan aturan layanan yang tertulis di halaman ini. Ketentuan ini berlaku untuk seluruh pengguna layanan kursus offline, siswa, orang tua, dan pengguna portal website.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          2. Pendaftaran & Akun Portal
        </h2>
        <p>
          - Wali murid (orang tua) wajib memberikan informasi yang akurat dan lengkap saat melakukan pendaftaran secara mandiri maupun dibantu oleh staf admin.<br />
          - Anda bertanggung jawab menjaga kerahasiaan kata sandi akun portal Orang Tua Anda. Segala aktivitas yang terjadi di bawah akun Anda adalah tanggung jawab Anda sepenuhnya.<br />
          - Akun wali murid akan dipasangkan secara resmi oleh admin dengan data profil siswa (anak Anda) agar Anda dapat memantau perkembangan belajar.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          3. Ketentuan Pembayaran SPP (Biaya Kursus)
        </h2>
        <p>
          - Biaya bimbingan belajar/SPP bulanan ditentukan secara spesifik berdasarkan program belajar aktif siswa (Kids Program, Teens Program, atau Fun Calistung).<br />
          - SPP bulanan wajib dibayarkan paling lambat **tanggal 10 setiap bulannya**.<br />
          - Pembayaran dilakukan melalui metode Transfer Bank ke rekening resmi PT Ibra Global English yang tercantum di portal Orang Tua, atau dibayar Tunai secara langsung di kantor pendaftaran.<br />
          - Wali murid wajib mengunggah foto bukti transfer yang valid ke dalam sistem portal Orang Tua sebagai tanda konfirmasi pembayaran. Status penagihan akan berubah menjadi **LUNAS** setelah diverifikasi oleh admin keuangan.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          4. Kebijakan Kehadiran & Akademik
        </h2>
        <p>
          - Siswa diharapkan hadir tepat waktu sesuai jadwal sesi belajar yang telah dikonfigurasi pada Kalender Akademik.<br />
          - Jika siswa berhalangan hadir karena alasan medis (sakit) atau keperluan keluarga (izin), wali murid disarankan memberikan konfirmasi terlebih dahulu kepada tutor pendamping.<br />
          - Di akhir setiap level/modul belajar, tutor akan menerbitkan Rapor Digital yang memuat nilai evaluasi kompetensi (*Speaking, Grammar, Vocabulary, Keaktifan*). Keputusan kelulusan level didasarkan sepenuhnya pada kriteria penilaian objektif tutor.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          5. Sertifikat Kelulusan Resmi
        </h2>
        <p>
          Setiap siswa yang berhasil menyelesaikan satu tingkat level pembelajaran dengan hasil evaluasi memenuhi syarat berhak mendapatkan Sertifikat Kelulusan Resmi yang diterbitkan oleh PT Ibra Global English. Sertifikat dilengkapi kode verifikasi unik (ID Sertifikat) yang dapat divalidasi keabsahannya secara online oleh publik melalui halaman verifikasi resmi kami (`/verify/[id]`).
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          6. Pembatalan & Pengembalian Dana (Refund)
        </h2>
        <p>
          Biaya pendaftaran awal dan biaya SPP bulanan yang telah disetorkan dan dikonfirmasi lunas **tidak dapat ditarik kembali atau di-refund**, kecuali terjadi pembatalan kelas secara sepihak oleh pihak manajemen Ibra Global English karena kendala operasional internal.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          7. Perubahan Ketentuan Layanan
        </h2>
        <p>
          PT Ibra Global English berhak untuk mengubah, memperbarui, atau memodifikasi Syarat & Ketentuan ini sewaktu-waktu tanpa pemberitahuan tertulis terlebih dahulu. Perubahan akan berlaku efektif segera setelah dipublikasikan di halaman website ini. Anda disarankan untuk memeriksa halaman ini secara berkala.
        </p>
      </section>

      <section style={{ borderTop: "1px solid var(--color-gray-200)", paddingTop: "1.5rem", marginTop: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
          Hubungi Kami
        </h2>
        <p>
          Apabila Anda membutuhkan bantuan atau klarifikasi lebih lanjut mengenai Syarat & Ketentuan Layanan ini, silakan hubungi pusat bantuan kami:
        </p>
        <p style={{ marginTop: "0.5rem" }}>
          📧 Email: <strong>admin@ibraglobalenglish.uk</strong><br />
          📍 Alamat: <strong>Jl. TPU Bobong Komp. Fangahu, Lantai 1 Kost Fitrah, Kab. Pulau Taliabu, Maluku Utara</strong>
        </p>
      </section>
    </LegalLayout>
  );
}
