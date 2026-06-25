"use client";

export default function LMSView({
  selectedChild,
  lmsMaterials,
  lmsSubmissions,
  detailsLoading
}) {
  return (
    <div className="portal-card" style={{ padding: "2rem" }}>
      <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
        LMS & Tugas Rumah Anak
      </h3>
      <p style={{ color: "var(--color-gray-500)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
        Pantau daftar materi belajar dan status penyelesaian tugas rumah yang diberikan oleh Tutor untuk <strong>{selectedChild?.name}</strong>.
      </p>

      {/* Progress Summary Card */}
      {(() => {
        const tasks = lmsMaterials.filter(m => m.type === "tugas");
        const done = tasks.filter(t => lmsSubmissions.some(s => s.material_id === t.id)).length;
        const total = tasks.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const barColor = pct >= 75 ? "var(--color-green)" : pct >= 50 ? "#f59e0b" : pct > 0 ? "var(--color-red)" : "var(--color-gray-300)";
        return total > 0 ? (
          <div style={{ marginBottom: "1.75rem", padding: "1.25rem 1.5rem", background: "linear-gradient(135deg, var(--color-primary-light) 0%, rgba(255,255,255,0.8) 100%)", borderRadius: "14px", border: "1px solid var(--color-primary-light)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div>
                <p style={{ fontWeight: "800", fontSize: "0.95rem", color: "var(--color-primary-dark)", marginBottom: "2px" }}>📊 Ringkasan Progress Tugas</p>
                <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>Data real-time dari LMS Ibra Global English</p>
              </div>
              <div style={{ textAlign: "center", background: "white", borderRadius: "12px", padding: "0.5rem 1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <p style={{ fontSize: "1.5rem", fontWeight: "900", color: barColor, lineHeight: 1 }}>{pct}%</p>
                <p style={{ fontSize: "0.7rem", color: "var(--color-gray-500)", fontWeight: "600" }}>Selesai</p>
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: "99px", height: "12px", overflow: "hidden", marginBottom: "0.75rem" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: "99px", transition: "width 1s ease", boxShadow: `0 0 8px ${barColor}55` }} />
            </div>
            <div style={{ display: "flex", gap: "2rem", fontSize: "0.82rem" }}>
              <span style={{ color: "var(--color-green)", fontWeight: "700" }}>✅ {done} Selesai</span>
              <span style={{ color: "var(--color-gray-500)", fontWeight: "600" }}>⏳ {total - done} Belum</span>
              <span style={{ color: "var(--color-primary-dark)", fontWeight: "600" }}>📚 {total} Total Tugas</span>
            </div>
          </div>
        ) : null;
      })()}

      {detailsLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="portal-card" style={{ borderLeft: "5px solid var(--color-gray-200)", padding: "1.5rem" }}>
              <div className="skeleton-pulse skeleton-title" style={{ width: "200px", marginBottom: "0.5rem" }} />
              <div className="skeleton-pulse skeleton-text" style={{ width: "320px" }} />
            </div>
          ))}
        </div>
      ) : lmsMaterials.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gray-400)" }}>
          <p style={{ fontWeight: "600" }}>Belum ada materi atau tugas yang dibagikan untuk program ini.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {lmsMaterials.map((mat) => {
            const submission = lmsSubmissions.find(sub => sub.material_id === mat.id);
            const isSubmitted = !!submission;
            const isGraded = isSubmitted && submission.grade !== null && submission.grade !== undefined && submission.grade !== "";
            
            return (
              <div key={mat.id} style={{
                border: "1px solid var(--color-gray-150)",
                borderRadius: "12px",
                padding: "1.5rem",
                backgroundColor: "var(--color-gray-50)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem"
              }} className="table-row-hover">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{
                        backgroundColor: mat.type === "tugas" ? "rgba(166, 136, 73, 0.1)" : "rgba(33, 108, 126, 0.1)",
                        color: mat.type === "tugas" ? "var(--color-accent)" : "var(--color-primary-dark)",
                        fontSize: "0.75rem",
                        fontWeight: "800",
                        padding: "0.25rem 0.65rem",
                        borderRadius: "12px",
                        textTransform: "uppercase"
                      }}>
                        {mat.type === "tugas" ? "Tugas" : "Materi"}
                      </span>
                      
                      {mat.type === "tugas" && (
                        isGraded ? (
                          <span style={{
                            backgroundColor: "rgba(34, 197, 94, 0.12)",
                            color: "var(--color-green)",
                            fontSize: "0.75rem",
                            fontWeight: "800",
                            padding: "0.25rem 0.65rem",
                            borderRadius: "12px"
                          }}>
                            Sudah Dinilai
                          </span>
                        ) : isSubmitted ? (
                          <span style={{
                            backgroundColor: "rgba(59, 130, 246, 0.12)",
                            color: "#2563eb",
                            fontSize: "0.75rem",
                            fontWeight: "800",
                            padding: "0.25rem 0.65rem",
                            borderRadius: "12px"
                          }}>
                            Menunggu Penilaian
                          </span>
                        ) : (
                          <span style={{
                            backgroundColor: "rgba(239, 68, 68, 0.12)",
                            color: "var(--color-red)",
                            fontSize: "0.75rem",
                            fontWeight: "800",
                            padding: "0.25rem 0.65rem",
                            borderRadius: "12px"
                          }}>
                            Belum Mengumpulkan
                          </span>
                        )
                      )}
                    </div>
                    <h4 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--color-gray-900)", marginTop: "0.5rem" }}>
                      {mat.title}
                    </h4>
                  </div>

                  {mat.file_url && (
                    <a
                      href={mat.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-portal-outline"
                      style={{ padding: "0.45rem 1rem", fontSize: "0.8rem", textDecoration: "none", display: "inline-flex", gap: "0.45rem", alignItems: "center" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      <span>Unduh Berkas</span>
                    </a>
                  )}
                </div>

                {mat.description && (
                  <p style={{ color: "var(--color-gray-600)", fontSize: "0.95rem", lineHeight: "1.5", whiteSpace: "pre-line" }}>
                    {mat.description}
                  </p>
                )}

                {/* Status & Ulasan panel */}
                {mat.type === "tugas" && (
                  <div style={{
                    borderTop: "1px solid var(--color-gray-200)",
                    paddingTop: "1rem",
                    marginTop: "0.5rem"
                  }}>
                    {isGraded ? (
                      <div style={{
                        background: "linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(166, 136, 73, 0.05) 100%)",
                        border: "1px solid rgba(166, 136, 73, 0.2)",
                        borderRadius: "10px",
                        padding: "1.25rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontSize: "1.25rem" }}>🏆</span>
                            <span style={{ fontWeight: "800", color: "var(--color-gray-800)", fontSize: "0.95rem" }}>Penilaian Tutor</span>
                          </div>
                          <div style={{
                            backgroundColor: "var(--color-accent)",
                            color: "white",
                            padding: "0.35rem 0.85rem",
                            borderRadius: "20px",
                            fontWeight: "900",
                            fontSize: "1rem",
                            boxShadow: "var(--shadow-sm)"
                          }}>
                            Nilai: {submission.grade}
                          </div>
                        </div>
                        {submission.feedback ? (
                          <p style={{ color: "#a68849", fontStyle: "italic", fontSize: "0.9rem", margin: 0, paddingLeft: "1.75rem", borderLeft: "2px solid var(--color-accent)" }}>
                            "{submission.feedback}"
                          </p>
                        ) : (
                          <p style={{ color: "var(--color-gray-500)", fontStyle: "italic", fontSize: "0.9rem", margin: 0, paddingLeft: "1.75rem" }}>
                            Tidak ada catatan umpan balik.
                          </p>
                        )}
                        <div style={{ fontSize: "0.8rem", color: "var(--color-gray-400)", paddingLeft: "1.75rem" }}>
                          Dikumpulkan: {new Date(submission.submitted_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          &nbsp;&bull;&nbsp; <a href={submission.file_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: "bold" }}>Lihat Berkas Jawaban Anak</a>
                        </div>
                      </div>
                    ) : isSubmitted ? (
                      <div style={{
                        backgroundColor: "var(--color-gray-100)",
                        borderRadius: "8px",
                        padding: "1rem",
                        fontSize: "0.9rem",
                        color: "var(--color-gray-600)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <span>✅ Jawaban dikirim pada {new Date(submission.submitted_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        <a href={submission.file_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: "bold" }}>Buka Jawaban Anak ↗</a>
                      </div>
                    ) : (
                      <div style={{
                        backgroundColor: "rgba(239, 68, 68, 0.05)",
                        border: "1px dashed rgba(239, 68, 68, 0.2)",
                        borderRadius: "8px",
                        padding: "1rem",
                        fontSize: "0.9rem",
                        color: "var(--color-red)",
                        fontWeight: "600"
                      }}>
                        ⚠️ Anak Anda belum mengumpulkan tugas ini. Harap ingatkan anak Anda untuk mengerjakan tugas sebelum tenggat waktu.
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-gray-400)", borderTop: "1px solid var(--color-gray-150)", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
                  <span>Tenggat Waktu: <strong>
                    {mat.due_date ? new Date(mat.due_date).toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Tidak ada tenggat"}
                  </strong></span>
                  <span>Diterbitkan: {new Date(mat.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}