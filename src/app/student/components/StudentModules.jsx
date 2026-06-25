"use client";

export default function StudentModules({ student, getModulesList }) {
  if (!student) {
    return (
      <div className="portal-card" style={{ padding: "3rem", textAlign: "center" }}>
        <p style={{ color: "var(--color-gray-400)" }}>Memuat data modul...</p>
      </div>
    );
  }

  return (
    <div className="portal-card" style={{ padding: "2rem" }}>
      <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
        Modul Belajar & Lembar Kerja (Worksheet)
      </h3>
      <p style={{ color: "var(--color-gray-500)", fontSize: "0.9rem", marginBottom: "2rem" }}>
        Unduh lembar latihan, worksheet, modul teori belajar bahasa Inggris dan materi pembelajaran kelas Anda secara aman.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
        {getModulesList(student.program).map((mod, idx) => (
          <div key={idx} style={{
            border: "1px solid var(--color-gray-150)",
            borderRadius: "8px",
            padding: "1.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem"
          }} className="table-row-hover">
            <div>
              <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--color-gray-900)" }}>
                {mod.name}
              </h4>
              <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginTop: "2px" }}>
                Ukuran Berkas: <strong>{mod.size}</strong>
              </p>
            </div>
            <button
              onClick={() => alert("Mengunduh berkas modul pembelajaran...")}
              className="btn-portal-primary"
              style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", display: "flex", gap: "0.45rem", alignItems: "center" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span>Unduh PDF</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}