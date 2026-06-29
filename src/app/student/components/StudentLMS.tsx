"use client";

import React from "react";
import { Student } from "@/types";

interface StudentLMSProps {
  student: Student | null;
  lmsMaterials: any[];
  mySubmissions: any[];
  submissionFile: File | null;
  setSubmissionFile: (f: File | null) => void;
  submittingMaterialId: string | null;
  submissionUploading: boolean;
  lmsSubTab: string;
  setLmsSubTab: (t: string) => void;
  handleSaveSubmission: (materialId: string) => void;
}

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
}: StudentLMSProps) {
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
              fontWeight: "700"
            }}
          >
            📚 Materi Bimbingan
          </button>
          <button
            onClick={() => setLmsSubTab("tugas")}
            className={`portal-tab-btn ${lmsSubTab === "tugas" ? "active" : ""}`}
            style={{
              padding: "0.45rem 1.25rem",
              borderRadius: "20px",
              fontSize: "0.85rem",
              fontWeight: "700"
            }}
          >
            ✍️ Tugas Rumah (PR)
          </button>
        </div>
      </div>

      {lmsSubTab === "materi" ? (
        <div>
          {lmsMaterials.filter(m => m.type === "materi").length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", border: "1px dashed var(--color-gray-200)", borderRadius: "12px" }}>
              <p style={{ color: "var(--color-gray-400)", fontSize: "0.9rem" }}>Belum ada materi pembelajaran diunggah oleh tutor.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {lmsMaterials.filter(m => m.type === "materi").map(mat => (
                <div key={mat.id} style={{ border: "1px solid var(--color-gray-150)", padding: "1.25rem", borderRadius: "10px" }} className="table-row-hover">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                    <div>
                      <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--color-gray-900)" }}>{mat.title}</h4>
                      <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "2px" }}>
                        Diunggah pada: {new Date(mat.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      {mat.description && (
                        <p style={{ fontSize: "0.85rem", color: "var(--color-gray-600)", marginTop: "0.75rem", lineHeight: "1.5" }}>
                          {mat.description}
                        </p>
                      )}
                    </div>
                    {mat.file_url && (
                      <a
                        href={mat.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-portal-outline"
                        style={{ padding: "0.45rem 1rem", fontSize: "0.8rem", display: "flex", gap: "0.3rem", alignItems: "center", whiteSpace: "nowrap" }}
                      >
                        📂 Buka File
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {lmsMaterials.filter(m => m.type === "tugas").length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", border: "1px dashed var(--color-gray-200)", borderRadius: "12px" }}>
              <p style={{ color: "var(--color-gray-400)", fontSize: "0.9rem" }}>Belum ada tugas rumah dari tutor.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {lmsMaterials.filter(m => m.type === "tugas").map(task => {
                const sub = mySubmissions.find(s => s.material_id === task.id);
                return (
                  <div key={task.id} style={{ border: "1px solid var(--color-gray-150)", padding: "1.25rem", borderRadius: "10px", borderLeft: sub ? "4px solid #22c55e" : "4px solid #f59e0b" }} className="table-row-hover">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1.5rem", flexWrap: "wrap" }}>
                      <div style={{ flex: "1 1 300px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.7rem", fontWeight: "800", padding: "2px 8px", borderRadius: "4px", background: sub ? "#e6f4ea" : "#fff7ed", color: sub ? "#137333" : "#b06000" }}>
                            {sub ? "✓ Sudah Dikumpul" : "⏳ Belum Dikumpul"}
                          </span>
                          {sub?.grade && (
                            <span style={{ fontSize: "0.7rem", fontWeight: "800", padding: "2px 8px", borderRadius: "4px", background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}>
                              Nilai: {sub.grade}
                            </span>
                          )}
                        </div>
                        <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--color-gray-900)" }}>{task.title}</h4>
                        <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "2px" }}>
                          Diberikan pada: {new Date(task.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        {task.description && (
                          <p style={{ fontSize: "0.85rem", color: "var(--color-gray-600)", marginTop: "0.75rem", lineHeight: "1.5" }}>
                            {task.description}
                          </p>
                        )}
                        {task.file_url && (
                          <div style={{ marginTop: "0.75rem" }}>
                            <a
                              href={task.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: "600", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                            >
                              📥 Download Berkas Soal Tugas
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Form Pengumpulan */}
                      <div style={{ flex: "1 1 250px", background: "var(--color-gray-50)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--color-gray-150)" }}>
                        {sub ? (
                          <div>
                            <p style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", fontWeight: "600" }}>Jawaban Anda:</p>
                            <a
                              href={sub.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: "block", fontSize: "0.82rem", color: "var(--color-primary)", textDecoration: "none", marginTop: "4px", fontWeight: "700", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                            >
                              📎 Lihat Berkas Jawaban
                            </a>
                            <p style={{ fontSize: "0.7rem", color: "var(--color-gray-400)", marginTop: "4px" }}>
                              Dikumpul pada: {new Date(sub.submitted_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </p>
                            {sub.notes && (
                              <div style={{ marginTop: "0.75rem", borderTop: "1px dashed var(--color-gray-200)", paddingTop: "0.5rem" }}>
                                <p style={{ fontSize: "0.72rem", color: "var(--color-gray-500)", fontWeight: "600" }}>Komentar Tutor:</p>
                                <p style={{ fontSize: "0.78rem", color: "var(--color-gray-600)", fontStyle: "italic", marginTop: "2px" }}>"{sub.notes}"</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--color-gray-700)", marginBottom: "0.5rem" }}>Kumpulkan Jawaban:</p>
                            <input
                              type="file"
                              onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                              style={{ width: "100%", fontSize: "0.75rem", color: "var(--color-gray-500)", marginBottom: "0.75rem" }}
                            />
                            <button
                              disabled={submissionUploading || submittingMaterialId !== task.id || !submissionFile}
                              onClick={() => handleSaveSubmission(task.id)}
                              className="btn-portal-primary"
                              style={{ width: "100%", padding: "0.45rem", fontSize: "0.8rem", fontWeight: "700" }}
                            >
                              {submissionUploading && submittingMaterialId === task.id ? "Mengirim..." : "Kirim Tugas"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Progress Ring Styling */}
      <style jsx>{`
        .lms-progress-ring-wrap {
          position: relative;
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lms-progress-ring {
          transform: rotate(-90deg);
        }
        .lms-progress-ring circle {
          fill: transparent;
        }
        .lms-progress-ring circle.track {
          stroke: var(--color-gray-100);
        }
        .lms-progress-ring circle.fill {
          stroke-linecap: round;
          transition: stroke-dashoffset 0.5s ease-in-out;
        }
        .lms-progress-ring-text {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          line-height: 1;
        }
        .lms-progress-ring-text span {
          font-size: 0.6rem;
          font-weight: 700;
          color: var(--color-gray-400);
          text-transform: uppercase;
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}
