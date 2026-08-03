// OfflineFormBody.tsx - Form isi badan cetak formulir pendaftaran
export default function OfflineFormBody() {
  const sectionStyle = { fontSize: "0.85rem", fontWeight: "800", borderBottom: "1.5px solid #374151", paddingBottom: "0.15rem", marginBottom: "0.4rem", color: "#1f2937", textTransform: "uppercase" as const };
  const row = (label: string, content?: React.ReactNode) => (
    <div className="form-print-row">
      <span className="form-print-label">{label}</span>
      <span className="form-print-colon">:</span>
      {content ?? <span className="form-print-line"></span>}
    </div>
  );

  return (
    <>
      {/* Kop Surat */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", paddingBottom: "0.25rem" }}>
        <img src="/assets/logo.png" alt="Logo Ibra Global English" style={{ width: "55px", height: "55px", objectFit: "contain" }} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "1.3rem", fontWeight: "900", color: "#1f2937", margin: 0, letterSpacing: "0.5px", textTransform: "uppercase" }}>IBRA GLOBAL ENGLISH BOBONG</h1>
          <p style={{ fontSize: "0.78rem", fontWeight: "700", color: "#4b5563", margin: "0.1rem 0", fontStyle: "italic" }}>English Course &amp; Bimbingan Belajar Calistung Terbaik di Pulau Taliabu</p>
          <p style={{ fontSize: "0.68rem", color: "#6b7280", margin: 0, lineHeight: "1.3" }}>
            Alamat: Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001, Bobong, Taliabu Barat, Kabupaten Pulau Taliabu, Maluku Utara 97794 <br />
            WhatsApp: +62 813-5700-1357 | Website: www.ibraglobalenglish.uk
          </p>
        </div>
      </div>
      <div style={{ borderBottom: "3px double #1f2937", marginBottom: "1rem" }}></div>

      {/* Judul */}
      <div style={{ textAlign: "center", marginBottom: "0.8rem" }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: "800", textTransform: "uppercase", color: "#111827", margin: 0, letterSpacing: "1px" }}>FORMULIR PENDAFTARAN SISWA BARU</h2>
        <span style={{ fontSize: "0.75rem", color: "#4b5563" }}>Silakan isi data di bawah ini dengan lengkap menggunakan huruf kapital</span>
      </div>

      {/* Form */}
      <form style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }} onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}>
        {/* A. Data Siswa */}
        <div>
          <h3 style={sectionStyle}>A. DATA CALON SISWA</h3>
          {row("Nama Lengkap")}
          {row("Nama Panggilan")}
          {row("Tempat & Tanggal Lahir")}
          {row("Jenis Kelamin", <span style={{ display: "inline-flex", gap: "2rem", paddingTop: "0.2rem", flex: 1 }}><span>[  ] Laki-laki</span><span>[  ] Perempuan</span></span>)}
          {row("Asal Sekolah & Kelas")}
          {row("Alamat Lengkap")}
        </div>

        {/* B. Data Orang Tua */}
        <div>
          <h3 style={sectionStyle}>B. DATA ORANG TUA / WALI</h3>
          {row("Nama Orang Tua / Wali")}
          {row("Pekerjaan")}
          {row("No. WhatsApp / HP")}
          {row("Email Orang Tua / Wali")}
          {row("Hubungan dengan Siswa", <span style={{ display: "inline-flex", gap: "2rem", paddingTop: "0.2rem", flex: 1 }}><span>[  ] Ayah</span><span>[  ] Ibu</span><span>[  ] Wali (Tuliskan: ..........................)</span></span>)}
        </div>

        {/* C. Program */}
        <div>
          <h3 style={sectionStyle}>C. PROGRAM YANG DIMINATI (Beri Tanda Centang)</h3>
          <div style={{ display: "flex", gap: "2.5rem", paddingLeft: "0.5rem", paddingTop: "0.15rem", fontSize: "0.78rem", color: "#1f2937", fontWeight: "600" }}>
            <span>[  ] Kids Program (5-12 tahun)</span>
            <span>[  ] Teens Program (13-17 tahun)</span>
            <span>[  ] Fun Calistung (5-7 tahun)</span>
          </div>
        </div>

        {/* D. Tanda Tangan */}
        <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ width: "45%", textAlign: "center" }}></div>
          <div style={{ width: "45%", textAlign: "center", fontSize: "0.78rem", color: "#1f2937" }}>
            <p style={{ margin: "0 0 2.25rem 0" }}>Bobong, ......................................... 20.... <br />Orang Tua / Wali Siswa,</p>
            <p style={{ margin: 0, fontWeight: "bold" }}>( ........................................................ )</p>
            <span style={{ fontSize: "0.68rem", color: "#6b7280" }}>Nama Jelas &amp; Tanda Tangan</span>
          </div>
        </div>
      </form>
    </>
  );
}
