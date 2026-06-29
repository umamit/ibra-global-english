"use client";

interface SelectedChild {
  name?: string;
  program?: string;
}

interface LmsMaterial {
  id: string;
  type: string;
  title: string;
  description?: string;
  file_url?: string;
  due_date?: string;
  created_at: string;
}

interface LmsSubmission {
  material_id: string;
  grade?: string | number | null;
  feedback?: string;
  submitted_at: string;
  file_url?: string;
}

interface LMSViewProps {
  selectedChild: SelectedChild | null;
  lmsMaterials: LmsMaterial[];
  lmsSubmissions: LmsSubmission[];
  detailsLoading: boolean;
}

export default function LMSView({
  selectedChild,
  lmsMaterials,
  lmsSubmissions,
  detailsLoading
}: LMSViewProps) {
  return (
    <div className="portal-card">
      <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
        LMS & Tugas Rumah Anak
      </h3>
      <p style={{ color: "var(--color-gray-500)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
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
          <div style={{ marginBottom: "2rem", padding: "1.25rem 1.5rem", background: "linear-gradient(135deg, var(--color-primary-light) 0%, rgba(255,255,255,0.9) 100%)", borderRadius: "14px", border: "1px solid var(--color-primary-light)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.75rem" }}>
              <div>
                <p style={{ fontWeight: "800", fontSize: "0.95rem", color: "var(--color-primary-dark)", marginBottom: "2px" }}>📊 Ringkasan Progress Tugas</p>
                <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>Data real-time dari LMS Ibra Global English</p>
              </div>
              <div style={{ textAlign: "center", background: "white", borderRadius: "10px", padding: "0.35rem 0.85rem", boxShadow: "0 2px 6px rgba(33,108,126,0.06)", border: "1px solid var(--color-primary-light)" }}>
                <p style={{ fontSize: "1.35rem", fontWeight: "900", color: barColor, lineHeight: 1 }}>{pct}%</p>
                <p style={{ fontSize: "0.65rem", color: "var(--color-gray-500)", fontWeight: "600", marginTop: "2px" }}>Selesai</p>
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: "99px", height: "10px", overflow: "hidden", marginBottom: "0.75rem", border: "1px solid rgba(226,232,240,0.5)" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: "99px", transition: "width 1s ease" }} />
            </div>
            <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.8rem", flexWrap: "wrap" }}>
              <span style={{ color: "var(--color-green)", fontWeight: "700" }}>✅ {done} Selesai</span>
              <span style={{ color: "var(--color-gray-500)", fontWeight: "600" }}>⏳ {total - done} Belum</span>
              <span style={{ color: "var(--color-primary-dark)", fontWeight: "600" }}>📚 {total} Total Tugas</span>
            </div>
          </div>
        ) : null;
      })()}

      {detailsLoading ? (
        <div className="lms-grid">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="lms-card" style={{ borderLeft: "5px solid var(--color-gray-200)" }}>
              <div className="skeleton-pulse skeleton-title" style={{ width: "150px", marginBottom: "0.5rem" }} />
              <div className="skeleton-pulse skeleton-text" style={{ width: "250px" }} />
            </div>
          ))}
        </div>
      ) : lmsMaterials.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gray-400)" }}>
          <p style={{ fontWeight: "600" }}>Belum ada materi atau tugas yang dibagikan untuk program ini.</p>
        </div>
      ) : (
        <div className="lms-grid">
          {lmsMaterials.map((mat) => {
            const submission = lmsSubmissions.find(sub => sub.material_id === mat.id);
            const isSubmitted = !!submission;
            const isGraded = isSubmitted && submission.grade !== null && submission.grade !== undefined && submission.grade !== "";

            return (
              <div key={mat.id} className="lms-card" style={{ borderTop: mat.type === "tugas" ? "3px solid var(--color-accent)" : "3px solid var(--color-primary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{
                      backgroundColor: mat.type === "tugas" ? "var(--color-accent-light)" : "var(--color-primary-light)",
                      color: mat.type === "tugas" ? "var(--color-accent)" : "var(--color-primary)",
                      fontSize: "0.7rem",
                      fontWeight: "800",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "6px",
                      textTransform: "uppercase"
                    }}>
                      {mat.type === "tugas" ? "Tugas" : "Materi"}
                    </span>

                    {mat.type === "tugas" && (
                      isGraded ? (
                        <span className="status-badge submitted">Nilai</span>
                      ) : isSubmitted ? (
                        <span className="status-badge pending">Tinjau</span>
                      ) : (
                        <span className="status-badge unpaid">Belum</span>
                      )
                    )}
                  </div>

                  {mat.file_url && (
                    <a
                      href={mat.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-portal-outline"
                      style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem", textDecoration: "none", display: "inline-flex", gap: "0.3rem", alignItems: "center", margin: 0 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      <span>Berkas</span>
                    </a>
                  )}
                </div>

                <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
                  {mat.title}
                </h4>

                {mat.description && (
                  <p style={{ color: "var(--color-gray-600)", fontSize: "0.85rem", lineHeight: "1.5", whiteSpace: "pre-line", flexGrow: 1, marginBottom: "1rem" }}>
                    {mat.description.length > 150 ? `${mat.description.slice(0, 150)}...` : mat.description}
                  </p>
                )}

                {/* Status & Ulasan panel */}
                {mat.type === "tugas" && (
                  <div style={{
                    borderTop: "1px solid var(--color-gray-100)",
                    paddingTop: "0.75rem",
                    marginBottom: "0.75rem"
                  }}>
                    {isGraded && submission ? (
                      <div style={{
                        background: "linear-gradient(135deg, rgba(34, 197, 94, 0.04) 0%, rgba(166, 136, 73, 0.04) 100%)",
                        border: "1px solid rgba(166, 136, 73, 0.15)",
                        borderRadius: "8px",
                        padding: "0.75rem 1rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: "800", color: "var(--color-gray-800)", fontSize: "0.85rem" }}>🏆 Evaluasi Tutor</span>
                          <span style={{
                            backgroundColor: "var(--color-accent)",
                            color: "white",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "12px",
                            fontWeight: "900",
                            fontSize: "0.85rem"
                          }}>
                            Skor: {submission.grade}
                          </span>
                        </div>
                        {submission.feedback && (
                          <p style={{ color: "#a68849", fontStyle: "italic", fontSize: "0.8rem", margin: 0, borderLeft: "2px solid var(--color-accent)", paddingLeft: "0.5rem" }}>
                            &ldquo;{submission.feedback}&rdquo;
                          </p>
                        )}
                        <div style={{ fontSize: "0.72rem", color: "var(--color-gray-400)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                          <span>Selesai: {new Date(submission.submitted_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                          {submission.file_url && (
                            <a href={submission.file_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: "700", textDecoration: "none" }}>Berkas Jawaban ↗</a>
                          )}
                        </div>
                      </div>
                    ) : isSubmitted && submission ? (
                      <div style={{
                        backgroundColor: "var(--color-gray-50)",
                        border: "1px solid var(--color-gray-150)",
                        borderRadius: "8px",
                        padding: "0.75rem",
                        fontSize: "0.8rem",
                        color: "var(--color-gray-600)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <span>Jawaban dikirim</span>
                        {submission.file_url && (
                          <a href={submission.file_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: "700", textDecoration: "none" }}>Lihat Berkas ↗</a>
                        )}
                      </div>
                    ) : (
                      <div style={{
                        backgroundColor: "rgba(239, 68, 68, 0.03)",
                        border: "1px dashed rgba(239, 68, 68, 0.15)",
                        borderRadius: "8px",
                        padding: "0.75rem",
                        fontSize: "0.78rem",
                        color: "var(--color-red)",
                        fontWeight: "600",
                        lineHeight: 1.4
                      }}>
                        ⚠️ Menunggu Jawaban Anak
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--color-gray-400)", borderTop: "1px solid var(--color-gray-100)", paddingTop: "0.75rem", marginTop: "auto" }}>
                  <span>Tenggat: <strong>
                    {mat.due_date ? new Date(mat.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "-"}
                  </strong></span>
                  <span>Rilis: {new Date(mat.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
