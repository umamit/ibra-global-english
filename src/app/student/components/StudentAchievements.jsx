"use client";

export default function StudentAchievements({ rewards }) {
  return (
    <div className="portal-card" style={{ padding: "2rem" }}>
      <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
        Papan Pencapaian Koin Prestasi
      </h3>
      <p style={{ color: "var(--color-gray-500)", fontSize: "0.9rem", marginBottom: "2rem" }}>
        Daftar histori transaksi penerimaan bintang emas dan koin penghargaan belajar.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {rewards.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gray-400)" }}>
            <p style={{ fontWeight: "600" }}>Belum ada histori koin yang masuk. Semangat belajar terus ya!</p>
          </div>
        ) : (
          rewards.map((rew) => (
            <div key={rew.id} style={{
              border: "1px solid var(--color-gray-100)",
              borderRadius: "8px",
              padding: "1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <h4 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--color-gray-800)" }}>
                  {rew.reason}
                </h4>
                <p style={{ fontSize: "0.8rem", color: "var(--color-gray-400)", marginTop: "2px" }}>
                  Diberikan pada {new Date(rew.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div style={{
                backgroundColor: rew.coins > 0 ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)",
                color: rew.coins > 0 ? "var(--color-green)" : "var(--color-red)",
                padding: "0.45rem 1rem",
                borderRadius: "16px",
                fontWeight: "900",
                fontSize: "1.1rem"
              }}>
                {rew.coins > 0 ? `+${rew.coins}` : rew.coins} Koin
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}