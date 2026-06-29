"use client";

interface Benefit {
  title: string;
  desc: string;
  iconKey: string;
}

interface BenefitManagerProps {
  benefitsList: Benefit[];
  setBenefitsList: (list: Benefit[]) => void;
  handleSaveBenefits: (list: Benefit[]) => void;
}

export default function BenefitManager({
  benefitsList, setBenefitsList,
  handleSaveBenefits
}: BenefitManagerProps) {
  return (
    <div className="portal-card" style={{ padding: "2rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>Kelola Keunggulan</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {benefitsList.map((b, idx) => (
          <div key={idx} style={{ padding: "1.5rem", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-lg)", position: "relative" }}>
            <button
              onClick={() => {
                const next = [...benefitsList];
                next.splice(idx, 1);
                handleSaveBenefits(next);
              }}
              className="btn-portal-danger"
              style={{ position: "absolute", top: "1rem", right: "1rem", padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
            >
              Hapus
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Judul Keunggulan</label>
                <input
                  type="text"
                  className="form-input"
                  value={b.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const next = [...benefitsList];
                    next[idx] = { ...next[idx], title: e.target.value };
                    setBenefitsList(next);
                  }}
                />
              </div>
              <div className="form-group">
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Pilihan Ikon</label>
                <select
                  className="form-input"
                  value={b.iconKey || "check"}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const next = [...benefitsList];
                    next[idx] = { ...next[idx], iconKey: e.target.value };
                    setBenefitsList(next);
                  }}
                >
                  <option value="users">Users (Kelompok)</option>
                  <option value="award">Award (Penghargaan)</option>
                  <option value="clock">Clock (Jam/Waktu)</option>
                  <option value="trophy">Trophy (Piala)</option>
                  <option value="message">Message (Pesan)</option>
                  <option value="check">Checkmark (Centang)</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Deskripsi Keunggulan</label>
              <textarea
                className="form-input"
                value={b.desc}
                style={{ height: "60px", resize: "none" }}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  const next = [...benefitsList];
                  next[idx] = { ...next[idx], desc: e.target.value };
                  setBenefitsList(next);
                }}
              />
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button
            onClick={() => {
              const next = [...benefitsList, { title: "Keunggulan Baru", desc: "Deskripsi keunggulan baru", iconKey: "check" }];
              setBenefitsList(next);
            }}
            className="btn-portal-outline"
          >
            + Tambah Keunggulan Baru
          </button>
          <button
            onClick={() => handleSaveBenefits(benefitsList)}
            className="btn-portal-primary"
          >
            Simpan Semua Keunggulan
          </button>
        </div>
      </div>
    </div>
  );
}
