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
    <LegalLayout title="Syarat & Ketentuan Layanan" lastUpdated="1 Juli 2026">
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
          - Pembayaran SPP bulanan wajib diselesaikan selambat-lambatnya menyesuaikan dengan tanggal awal masuk/mulai kursus masing-masing siswa di setiap bulannya.<br />
          - Pembayaran dilakukan melalui metode Transfer Bank ke rekening yang tertera di portal Orang Tua, atau dibayar Tunai secara langsung di kantor pendaftaran.<br />
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
          5. Kebijakan Kelas Pengganti (Makeup Class)
        </h2>
        <p>
          - Jadwal pelaksanaan Kelas Pengganti wajib didiskusikan dan disepakati bersama dengan tutor pendamping terlebih dahulu.<br />
          - Kelas Pengganti tidak selalu bersifat privat (satu lawan satu), melainkan dapat digabungkan dengan kelas paralel lain yang mempelajari topik atau modul yang setara.<br />
          - Jadwal Kelas Pengganti yang sudah disepakati tidak dapat dijadwalkan ulang kembali apabila siswa kembali berhalangan hadir pada waktu yang ditentukan tersebut.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          6. Toleransi Keterlambatan Kehadiran
        </h2>
        <p>
          - Toleransi keterlambatan kehadiran maksimal bagi siswa adalah 15 menit.<br />
          - Siswa yang terlambat lebih dari 15 menit tetap diperbolehkan mengikuti kelas, namun tutor tidak wajib mengulang materi yang tertinggal atau menambah durasi sesi belajar melewati jadwal aslinya.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          7. Kebijakan Penggunaan Gadget Pribadi
        </h2>
        <p>
          - Penggunaan gadget pribadi (smartphone, tablet, dll.) oleh siswa dinonaktifkan atau disimpan selama kelas berlangsung.<br />
          - Penggunaan gadget hanya diperbolehkan apabila diinstruksikan langsung oleh tutor untuk menunjang aktivitas belajar (misalnya membuka kamus digital atau mengikuti kuis interaktif).
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          8. Ketentuan Cuti Belajar
        </h2>
        <p>
          - Siswa diperbolehkan mengajukan cuti belajar (non-aktif sementara) dengan memberikan pemberitahuan tertulis sebelumnya kepada admin atau tutor.<br />
          - Pengaturan teknis terkait slot kelas selama cuti akan disesuaikan dengan kapasitas kelas yang tersedia saat siswa kembali aktif.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          9. Pembatalan & Pengembalian Dana (Refund)
        </h2>
        <p>
          - Biaya pendaftaran awal dan SPP bulanan yang telah disetorkan bersifat *non-refundable* (tidak dapat ditarik kembali/dikembalikan).<br />
          - Pengecualian refund hanya berlaku jika terjadi pembatalan kelas secara sepihak oleh manajemen Ibra Global English karena kendala operasional internal.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          10. Batasan Pergantian Program
        </h2>
        <p>
          - Siswa tidak diperbolehkan mengganti program belajar (misalnya berpindah dari Kids Program ke Fun Calistung atau sebaliknya) saat periode pembelajaran berjalan telah dimulai.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          11. Larangan Pemindahtanganan Program
        </h2>
        <p>
          - Program belajar yang telah didaftarkan atas nama siswa tertentu bersifat personal.<br />
          - Pendaftaran tidak diperbolehkan untuk dipindahtangankan kepada orang lain atau digantikan oleh siswa lain.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          12. Tata Tertib & Sopan Santun
        </h2>
        <p>
          - Siswa wajib berpakaian rapi, sopan, dan bersepatu selama mengikuti kegiatan belajar di lingkungan tempat kursus.<br />
          - Siswa diharapkan selalu menjaga nilai kesopanan, saling menghormati tutor, staf admin, serta sesama teman sekelas.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          13. Kebersihan & Ketertiban Kelas
        </h2>
        <p>
          - Siswa wajib ikut menjaga kebersihan ruang kelas dengan membuang sampah pada tempat yang telah disediakan.<br />
          - Siswa wajib merawat dan tidak merusak fasilitas belajar, mainan edukatif, atau alat peraga yang disediakan di ruang kelas.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          14. Prosedur Penjemputan Siswa
        </h2>
        <p>
          - Orang tua atau wali murid diharapkan menjemput siswa tepat waktu setelah jam kelas berakhir.<br />
          - Demi keamanan siswa (terutama kelompok usia Kids & Calistung), tutor pendamping akan tetap menunggu bersama anak dan segera menghubungi orang tua/wali apabila jemputan belum tiba setelah kelas usai.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          15. Komitmen Lingkungan Aman (Anti-Bullying)
        </h2>
        <p>
          - Ibra Global English berkomitmen penuh menciptakan lingkungan belajar yang aman dan mendukung perkembangan psikologis anak.<br />
          - Kami melarang keras segala bentuk perundungan (*bullying*), intimidasi, serta kekerasan fisik maupun verbal di lingkungan tempat kursus.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          16. Informasi Kondisi Kesehatan & Medis
        </h2>
        <p>
          - Orang tua atau wali murid wajib menginformasikan riwayat medis khusus, alergi berat, atau kondisi kesehatan tertentu anak kepada admin atau tutor pendamping saat pendaftaran.<br />
          - Keterbukaan informasi ini sangat penting agar tutor dapat memberikan perhatian dan penanganan yang tepat demi keselamatan belajar anak.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          17. Hak Cipta & Hak Kekayaan Intelektual
        </h2>
        <p>
          - Seluruh materi pembelajaran, modul, lembar kerja (*handout*), media cetak, serta media digital yang disediakan oleh Ibra Global English adalah milik kekayaan intelektual resmi lembaga.<br />
          - Pengguna layanan dilarang memperbanyak, membagikan secara publik, atau menjual kembali materi belajar tersebut tanpa izin tertulis dari manajemen.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          18. Hak Dokumentasi & Publikasi (Media Release)
        </h2>
        <p>
          - Manajemen Ibra Global English memiliki izin untuk mendokumentasikan kegiatan belajar mengajar dalam bentuk foto atau video.<br />
          - Dokumentasi tersebut dapat digunakan untuk keperluan publikasi prestasi, media sosial, dan materi promosi resmi lembaga. Orang tua yang berkeberatan dapat menyampaikan hal tersebut secara tertulis saat pendaftaran.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          19. Kebijakan Keadaan Darurat (Force Majeure)
        </h2>
        <p>
          - Apabila terjadi bencana alam, wabah penyakit, atau diterbitkannya peraturan darurat pemerintah yang menghalangi kegiatan belajar mengajar secara tatap muka langsung, pembelajaran offline akan dihentikan sementara sampai kondisi kondusif.<br />
          - Alternatif pembelajaran dapat dialihkan ke media daring (online) sesuai dengan kebijakan teknis yang ditetapkan manajemen kemudian.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.75rem" }}>
          20. Perubahan Ketentuan Layanan
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
