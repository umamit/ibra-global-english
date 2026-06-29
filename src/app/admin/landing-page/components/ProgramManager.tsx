"use client";

interface Program {
  title: string;
  age: string;
  desc: string;
  iconKey: string;
  features?: string[];
}

interface ProgramManagerProps {
  programsList: Program[];
  setProgramsList: (list: Program[]) => void;
  handleSavePrograms: (list: Program[]) => void;
}

export default function ProgramManager({
  programsList, setProgramsList,
  handleSavePrograms
}: ProgramManagerProps) {
  return (
    <div className="portal-card" style={{ padding: "2rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>Kelola Program Kursus</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {programsList.map((prog, idx) => (
          <div key={idx} style={{ padding: "1.5rem", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-lg)", position: "relative" }}>
            <button
              onClick={() => {
                const next = [...programsList];
                next.splice(idx, 1);
                handleSavePrograms(next);
              }}
              className="btn-portal-danger"
              style={{ position: "absolute", top: "1rem", right: "1rem", padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
            >
              Hapus
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Nama Program</label>
                <input
                  type="text"
                  className="form-input"
                  value={prog.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const next = [...programsList];
                    next[idx] = { ...next[idx], title: e.target.value };
                    setProgramsList(next);
                  }}
                />
              </div>
              <div className="form-group">
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Kategori Umur / Keterangan</label>
                <input
                  type="text"
                  className="form-input"
                  value={prog.age}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const next = [...programsList];
                    next[idx] = { ...next[idx], age: e.target.value };
                    setProgramsList(next);
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Deskripsi Singkat</label>
                <textarea
                  className="form-input"
                  value={prog.desc}
                  style={{ height: "80px", resize: "none" }}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    const next = [...programsList];
                    next[idx] = { ...next[idx], desc: e.target.value };
                    setProgramsList(next);
                  }}
                />
              </div>
              <div className="form-group">
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Pilihan Ikon</label>
                <select
                  className="form-input"
                  value={prog.iconKey || "book"}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const next = [...programsList];
                    next[idx] = { ...next[idx], iconKey: e.target.value };
                    setProgramsList(next);
                  }}
                >
                  <option value="book">Book (Buku)</option>
                  <option value="graduation">Graduation (Topi Toga)</option>
                  <option value="users">Users (Kelompok/Orang)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Fitur / Materi Unggulan (Pisahkan dengan koma)</label>
              <input
                type="text"
                className="form-input"
                value={(prog.features || []).join(", ")}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const next = [...programsList];
                  next[idx] = { ...next[idx], features: e.target.value.split(",").map(f => f.trim()) };
                  setProgramsList(next);
                }}
              />
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button
            onClick={() => {
              const next = [...programsList, { title: "Program Baru", age: "5-10 tahun", desc: "Deskripsi program baru", iconKey: "book", features: ["Fitur 1"] }];
              setProgramsList(next);
            }}
            className="btn-portal-outline"
          >
            + Tambah Program Baru
          </button>
          <button
            onClick={() => handleSavePrograms(programsList)}
            className="btn-portal-primary"
          >
            Simpan Semua Program
          </button>
        </div>
      </div>
    </div>
  );
}
