"use client";

export default function StudentLMS({
  student,
  lmsMaterials,
  mySubmissions,
  submissionFile,
  setSubmissionFile,
  submittingMaterialId,
  submissionUploading,
  lmsSubTab,
  setLmsSubTab,
  handleSaveSubmission
}) {
  if (!student) {
    return (
      <div className="portal-card" style={{ padding: "3rem", textAlign: "center" }}>
        <p style={{ color: "var(--color-gray-400)" }}>Memuat data LMS...</p>
      </div>
    );
  }

  return (
    <div className="portal-card" style={{ padding: "2rem" }}>
      {/* A2: SVG Circular Progress Ring */}
      {(() => {
        const tasks = lmsMaterials.filter(m => m.type === "tugas");
        const done = tasks.filter(t => mySubmissions.some(s => s.material_id === t.id)).length;
        const total = tasks.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const ringColor = pct >= 75 ? "#22c55e" : pct >= 50 ? "#f59e0b" : pct > 0 ? "#ef4444" : "#e5e7eb";
        const r = 40;
        const circ = 2 * Math.PI * r;
        const offset = circ - (pct / 100) * circ;
        return total > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem", padding: "1rem 1.25rem", background: "var(--color-gray-50)", borderRadius: "14px", border: "1px solid var(--color-gray-150)" }}>
            {/* Ring SVG */}
            <div className="lms-progress-ring-wrap">
              <svg className="lms-progress-ring" width="100" height="100" viewBox="0 0 100 100">
                <circle className="track" cx="50" cy="50" r={r} strokeWidth="10" />
                <circle
                  className="fill"
                  cx="50" cy="50" r={r}
                  strokeWidth="10"
                  stroke={ringColor}
                  strokeDasharray={circ}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className="lms-progress-ring-text" style={{ color: ringColor, fontSize: "1.25rem" }}>
                {pct}%
                <span>selesai</span>
              </div>
            </div>
            {/* Stats */}
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: "800", fontSize: "0.95rem", color: "var(--color-gray-800)", marginBottom: "0.5rem" }}>
                📋 Progress Tugas LMS
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e", display: "inline-block", flexShrink: 0 }} />
                  <span style={{ color: "var(--color-gray-600)" }}>Selesai:</span>
                  <strong style={{ color: "#22c55e" }}>{done} tugas</strong>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--color-gray-300)", display: "inline-block", flexShrink: 0 }} />
                  <span style={{ color: "var(--color-gray-600)" }}>Belum dikumpul:</span>
                  <strong style={{ color: "var(--color-gray-700)" }}>{total - done} tugas</strong>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--color-primary)", display: "inline-block", flexShrink: 0 }} />
                  <span style={{ color: "var(--color-gray-600)" }}>Total tugas:</span>
                  <strong style={{ color: "var(--color-primary-dark)" }}>{total} tugas</strong>
                </div>
              </div>
            </div>
          </div>
        ) : null;
      })()}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--color-gray-150)", paddingBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)" }}>
            LMS - Kelas Digital
          </h3>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.9rem", marginTop: "2px" }}>
            Materi bimbingan & tugas rumah program <strong>{student?.program}</strong>.
          </p>
        </div>

        {/* Sub-Tab switcher */}
        <div className="portal-tabs" style={{ display: "flex", gap: "0.5rem", border: "none", padding: "0" }}>
          <button
            onClick={() => setLmsSubTab("materi")}
            className={`portal-tab-btn ${lmsSubTab === "materi" ? "active" : ""}`}
            style={{
              padding: "0.45rem 1.25rem",
              borderRadius: "20px",
              fontSize: "0.85rem",
              fontWeight: "700",
              border: "1px solid var(--color-gray-200)",
              backgroundColor: lmsSubTab === "materi" ? "var(--color-primary)" : "transparent",
              color: lmsSubTab === "materi" ? "white" : "var(--color-gray-600)",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            📖 Materi Belajar
          </button>
          <button
            onClick={() => setLmsSubTab("tugas")}
            className={`portal-tab-btn ${lmsSubTab === "tugas" ? "active" : ""}`}
            style={{
              padding: "0.45rem 1.25rem",
              borderRadius: "20px",
              fontSize: "0.85rem",
              fontWeight: "700",
              border: "1px solid var(--color-gray-200)",
              backgroundColor: lmsSubTab === "tugas" ? "var(--color-primary)" : "transparent",
              color: lmsSubTab === "tugas" ? "white" : "var(--color-gray-600)",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            📝 Tugas Rumah
          </button>
        </div>
      </div>

      {lmsSubTab === "materi" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {lmsMaterials.filter(m => m.type === "materi").length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gray-400)" }}>
              <p style={{ fontWeight: "600" }}>Belum ada materi belajar yang dibagikan untuk program ini.</p>
            </div>
          ) : (
            lmsMaterials.filter(m => m.type === "materi").map((mat) => (
              <div key={mat.id} style={{
                border: "1px solid var(--color-gray-150)",
                borderRadius: "12px",
                padding: "1.5rem",
                backgroundColor: "var(--color-gray-50)",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                boxShadow: "var(--shadow-sm)"
              }} className="table-row-hover">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <div>
                    <span style={{
                      backgroundColor: "rgba(33, 108, 126, 0.1)",
                      color: "var(--color-primary-dark)",
                      fontSize: "0.75rem",
                      fontWeight: "800",
                      padding: "0.25rem 0.65rem",
                      borderRadius: "12px",
                      textTransform: "uppercase"
                    }}>
                      Materi
                    </span>
                    <h4 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--color-gray-900)", marginTop: "0.5rem" }}>
                      {mat.title}
                    </h4>
                  </div>
                  {mat.file_url && (
                    <a
                      href={mat.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-portal-primary"
                      style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", textDecoration: "none", display: "inline-flex", gap: "0.5rem", alignItems: "center" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      <span>Unduh Berkas</span>
                    </a>
                  )}
                </div>
                {mat.description && (
                  <p style={{ color: "var(--color-gray-600)", fontSize: "0.95rem", lineHeight: "1.5", whiteSpace: "pre-line" }}>
                    {mat.description}
                  </p>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-gray-400)", borderTop: "1px solid var(--color-gray-200)", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
                  <span>Oleh Tutor: <strong>{mat.tutor_name}</strong></span>
                  <span>Diterbitkan: {new Date(mat.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {lmsMaterials.filter(m => m.type === "tugas").length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gray-400)" }}>
              <p style={{ fontWeight: "600" }}>Belum ada tugas rumah yang dibagikan untuk program ini.</p>
            </div>
          ) : (
            lmsMaterials.filter(m => m.type === "tugas").map((mat) => {
              const submission = mySubmissions.find(sub => sub.material_id === mat.id);
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
                  gap: "1rem",
                  boxShadow: "var(--shadow-sm)"
                }} className="table-row-hover">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{
                          backgroundColor: "rgba(166, 136, 73, 0.1)",
                          color: "var(--color-accent)",
                          fontSize: "0.75rem",
                          fontWeight: "800",
                          padding: "0.25rem 0.65rem",
                          borderRadius: "12px",
                          textTransform: "uppercase"
                        }}>
                          Tugas
                        </span>
                        
                        {/* Status Badge */}
                        {isGraded ? (
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
                        <span>Unduh Soal</span>
                      </a>
                    )}
                  </div>

                  {mat.description && (
                    <p style={{ color: "var(--color-gray-600)", fontSize: "0.95rem", lineHeight: "1.5", whiteSpace: "pre-line" }}>
                      {mat.description}
                    </p>
                  )}

                  {/* Submission / Grade Panel */}
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
                            <span style={{ fontWeight: "800", color: "var(--color-gray-800)", fontSize: "0.95rem" }}>Hasil Evaluasi Tutor</span>
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
                          Terkirim: {new Date(submission.submitted_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          &nbsp;&bull;&nbsp; <a href={submission.file_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: "bold" }}>Buka file jawaban</a>
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
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "0.5rem"
                      }}>
                        <div>
                          <span>✅ Jawaban terkirim pada {new Date(submission.submitted_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          &nbsp;&bull;&nbsp; <a href={submission.file_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: "bold" }}>Lihat Berkas Jawaban</a>
                        </div>
                        <span style={{ fontSize: "0.8rem", color: "var(--color-gray-400)" }}>Menunggu dinilai oleh Coach</span>
                      </div>
                    ) : (
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem"
                      }}>
                        <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-gray-700)", margin: 0 }}>
                          Kirim Jawaban Tugas:
                        </p>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          flexWrap: "wrap"
                        }}>
                          <input
                            type="file"
                            id={`file-upload-${mat.id}`}
                            onChange={(e) => setSubmissionFile(e.target.files[0])}
                            style={{
                              fontSize: "0.85rem",
                              color: "var(--color-gray-600)",
                              border: "1px dashed var(--color-gray-300)",
                              padding: "0.5rem",
                              borderRadius: "8px",
                              backgroundColor: "white",
                              flex: "1",
                              minWidth: "200px"
                            }}
                            disabled={submissionUploading && submittingMaterialId === mat.id}
                          />
                          <button
                            onClick={() => handleSaveSubmission(mat.id)}
                            className="btn-portal-primary"
                            style={{
                              padding: "0.6rem 1.5rem",
                              fontSize: "0.85rem",
                              fontWeight: "800"
                            }}
                            disabled={submissionUploading}
                          >
                            {submissionUploading && submittingMaterialId === mat.id ? "Mengirim..." : "Kirim Tugas"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-gray-400)", borderTop: "1px solid var(--color-gray-150)", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
                    <span>Tenggat Waktu: <strong style={{ color: mat.due_date && new Date(mat.due_date) < new Date() && !isSubmitted ? "var(--color-red)" : "inherit" }}>
                      {mat.due_date ? new Date(mat.due_date).toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Tidak ada tenggat"}
                    </strong></span>
                    <span>Diterbitkan: {new Date(mat.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}