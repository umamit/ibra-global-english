// AboutStaticSections.tsx - Visi Misi, Nilai Utama, Legalitas, Partnership
import Link from "next/link";

export default function AboutStaticSections() {
  return (
    <>
      <section className="about-vision-mission-section reveal">
        <div className="about-container">
          <div className="about-vision-mission">
            <div className="vision-card">
              <span className="card-icon" aria-hidden="true" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></span>
              <h2>Visi Kami</h2>
              <p>Menjadi pusat bimbingan pendidikan non-formal terdepan di Pulau Taliabu yang mampu melahirkan generasi muda yang cerdas, kreatif, berakhlak mulia, serta fasih berkomunikasi secara aktif dalam Bahasa Inggris untuk siap bersaing di kancah global.</p>
            </div>
            <div className="mission-card">
              <span className="card-icon" aria-hidden="true" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></span>
              <h2>Misi Kami</h2>
              <ul>
                <li>Menyelenggarakan kursus Bahasa Inggris dengan metode belajar sambil bermain (*fun learning method*) bebas tekanan.</li>
                <li>Menyediakan program bimbingan membaca, menulis, dan berhitung yang terstruktur dan ramah anak.</li>
                <li>Melatih kemampuan berdiskusi dan berbicara aktif (*Speaking-First*) siswa sejak pertemuan pertama.</li>
                <li>Memfasilitasi pemantauan hasil belajar secara terbuka bagi orang tua melalui laporan berkala.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="about-values-section reveal">
        <div className="about-container">
          <h2 className="section-title">Nilai-Nilai Utama Kami</h2>
          <div className="values-grid">
            {[
              { icon: <><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></>, title: "Child-Friendly Method", desc: "Pembelajaran dirancang khusus tanpa tekanan akademis berlebih untuk merawat kesehatan mental dan kreativitas anak." },
              { icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>, title: "Speaking-First Approach", desc: "Mendorong siswa aktif berbicara bahasa Inggris minimal 70% dari waktu pertemuan di kelas untuk melatih mental berbicara sejak dini." },
              { icon: <><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M6 18.8v-4L2 13v6a1 1 0 0 0 1 1h3Z"/><path d="M21.5 12v6h-1.18a1 1 0 0 0-.96.72l-.72 2.56a1 1 0 0 1-1.92 0l-.72-2.56a1 1 0 0 0-.96-.72H15v-6"/></>, title: "Attention to Detail", desc: "Kapasitas kelas dibatasi maksimal 10 siswa agar pengajar dapat fokus memberikan perhatian personal ke setiap individu secara adil." },
            ].map(v => (
              <div key={v.title} className="value-card">
                <span className="value-icon" aria-hidden="true" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{v.icon}</svg></span>
                <h3>{v.title}</h3><p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-legal-section reveal">
        <div className="about-container">
          <h2 className="section-title">Legalitas &amp; Badan Hukum</h2>
          <div className="about-legal-card">
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--color-gray-200)", paddingBottom: "1rem" }}>
              <img src="/assets/logo.png" alt="Logo PT. Ibra Global English" style={{ width: "50px", height: "50px", objectFit: "contain", marginRight: "1.25rem" }} />
              <div><h3 style={{ margin: "0", fontSize: "1.35rem", fontWeight: "700", color: "var(--color-gray-900)" }}>PT. Ibra Global English</h3><p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--color-primary-dark)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>Perseroan Perorangan</p></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[["Nomor SK Pendirian Kemenkumham", "AHU-A096371.AH.01.30.Tahun 2026"], ["Nomor Induk Berusaha (NIB)", "2806230044842"]].map(([label, val]) => (
                <div key={label}><p style={{ margin: "0", fontSize: "0.75rem", color: "var(--color-gray-400)", fontWeight: "bold", textTransform: "uppercase" }}>{label}</p><p style={{ margin: "2px 0 0", fontSize: "1rem", color: "var(--color-gray-800)", fontWeight: "600" }}>{val}</p></div>
              ))}
              <div><p style={{ margin: "0", fontSize: "0.75rem", color: "var(--color-gray-400)", fontWeight: "bold", textTransform: "uppercase" }}>Status Verifikasi</p><p style={{ margin: "2px 0 0", fontSize: "1rem", color: "#10b981", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}><i className="fi fi-rr-check-circle"></i> Terdaftar &amp; Terverifikasi Resmi</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section" style={{ background: "rgba(33, 108, 126, 0.04)", borderRadius: "18px", padding: "2.5rem 1.5rem", textAlign: "center", marginBlock: "3rem 1rem", border: "1px solid rgba(33, 108, 126, 0.12)" }}>
        <div className="about-container">
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem", color: "var(--color-primary)" }}>Peluang Kemitraan Sekolah &amp; Instansi</h2>
          <p style={{ fontSize: "0.92rem", color: "var(--color-gray-600)", maxWidth: "600px", marginInline: "auto", marginBottom: "1.5rem", lineHeight: 1.6 }}>Ingin menjadikan Ibra Global English sebagai mitra rujukan resmi pembelajaran bahasa Inggris untuk siswa atau staf sekolah/instansi Anda? Dapatkan akses Diagnostic Test gratis &amp; voucher khusus mitra.</p>
          <Link href="/kemitraan" className="about-cta-btn" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "var(--color-primary)", color: "#ffffff", padding: "0.75rem 1.5rem", borderRadius: "9999px", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", boxShadow: "0 4px 14px rgba(33, 108, 126, 0.25)" }}>Lihat Penawaran Kemitraan →</Link>
        </div>
      </section>
    </>
  );
}
