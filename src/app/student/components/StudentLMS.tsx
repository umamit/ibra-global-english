"use client";

import { Student } from "@/types";
import StudentLMSProgress from "./StudentLMSProgress";

interface StudentLMSProps {
  student: Student | null; lmsMaterials: any[]; mySubmissions: any[]; submissionFile: File | null;
  setSubmissionFile: (f: File | null) => void; submittingMaterialId: string | null; submissionUploading: boolean;
  lmsSubTab: string; setLmsSubTab: (t: string) => void; handleSaveSubmission: (materialId: string) => void;
}

export default function StudentLMS({ student, lmsMaterials, mySubmissions, submissionFile, setSubmissionFile, submittingMaterialId, submissionUploading, lmsSubTab, setLmsSubTab, handleSaveSubmission }: StudentLMSProps) {
  if (!student) return <div className="portal-card" style={{ padding: "3rem", textAlign: "center" }}><p style={{ color: "var(--color-gray-400)" }}>Memuat data LMS...</p></div>;

  const tasks = lmsMaterials.filter(m => m.type === "tugas");

  return (
    <div className="portal-card" style={{ padding: "2rem" }}>
      <StudentLMSProgress tasks={tasks} mySubmissions={mySubmissions} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--color-gray-150)", paddingBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)" }}>LMS - Kelas Digital</h3>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.9rem", marginTop: "2px" }}>Materi bimbingan &amp; tugas rumah program <strong>{student?.program}</strong>.</p>
        </div>
        <div className="portal-tabs" style={{ display: "flex", gap: "0.5rem", border: "none", padding: "0" }}>
          {[{ key: "materi", icon: "fi-rr-book-alt", label: "Materi Bimbingan" }, { key: "tugas", icon: "fi-rr-edit", label: "Tugas Rumah (PR)" }].map(tab => (
            <button key={tab.key} onClick={() => setLmsSubTab(tab.key)} className={`portal-tab-btn ${lmsSubTab === tab.key ? "active" : ""}`} style={{ padding: "0.45rem 1.25rem", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <i className={`fi ${tab.icon}`}></i><span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {lmsSubTab === "materi" ? (
        <div>
          {lmsMaterials.filter(m => m.type === "materi").length === 0 ? <div style={{ textAlign: "center", padding: "3rem 1rem", border: "1px dashed var(--color-gray-200)", borderRadius: "12px" }}><p style={{ color: "var(--color-gray-400)", fontSize: "0.9rem" }}>Belum ada materi pembelajaran diunggah oleh tutor.</p></div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {lmsMaterials.filter(m => m.type === "materi").map(mat => (
                <div key={mat.id} style={{ border: "1px solid var(--color-gray-150)", padding: "1.25rem", borderRadius: "10px" }} className="table-row-hover">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                    <div>
                      <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--color-gray-900)" }}>{mat.title}</h4>
                      <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "2px" }}>Diunggah pada: {new Date(mat.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                      {mat.description && <p style={{ fontSize: "0.85rem", color: "var(--color-gray-600)", marginTop: "0.75rem", lineHeight: "1.5" }}>{mat.description}</p>}
                    </div>
                    {mat.file_url && <a href={mat.file_url} target="_blank" rel="noopener noreferrer" className="btn-portal-outline" style={{ padding: "0.45rem 1rem", fontSize: "0.8rem", display: "flex", gap: "0.3rem", alignItems: "center", whiteSpace: "nowrap" }}><i className="fi fi-rr-folder"></i><span>Buka File</span></a>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {tasks.length === 0 ? <div style={{ textAlign: "center", padding: "3rem 1rem", border: "1px dashed var(--color-gray-200)", borderRadius: "12px" }}><p style={{ color: "var(--color-gray-400)", fontSize: "0.9rem" }}>Belum ada tugas rumah dari tutor.</p></div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {tasks.map(task => {
                const sub = mySubmissions.find(s => s.material_id === task.id);
                return (
                  <div key={task.id} style={{ border: "1px solid var(--color-gray-150)", padding: "1.25rem", borderRadius: "10px", borderLeft: sub ? "4px solid #22c55e" : "4px solid #f59e0b" }} className="table-row-hover">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1.5rem", flexWrap: "wrap" }}>
                      <div style={{ flex: "1 1 300px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.7rem", fontWeight: "800", padding: "2px 8px", borderRadius: "4px", background: sub ? "#e6f4ea" : "#fff7ed", color: sub ? "#137333" : "#b06000", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}><i className={`fi ${sub ? "fi-rr-check" : "fi-rr-time-fast"}`}></i><span>{sub ? "Sudah Dikumpul" : "Belum Dikumpul"}</span></span>
                          {sub?.grade && <span style={{ fontSize: "0.7rem", fontWeight: "800", padding: "2px 8px", borderRadius: "4px", background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}>Nilai: {sub.grade}</span>}
                        </div>
                        <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--color-gray-900)" }}>{task.title}</h4>
                        <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "2px" }}>Diberikan pada: {new Date(task.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                        {task.description && <p style={{ fontSize: "0.85rem", color: "var(--color-gray-600)", marginTop: "0.75rem", lineHeight: "1.5" }}>{task.description}</p>}
                        {task.file_url && <div style={{ marginTop: "0.75rem" }}><a href={task.file_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: "600", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}><i className="fi fi-rr-download"></i><span>Download Berkas Soal Tugas</span></a></div>}
                      </div>
                      <div style={{ flex: "1 1 250px", background: "var(--color-gray-50)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--color-gray-150)" }}>
                        {sub ? (
                          <div>
                            <p style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", fontWeight: "600" }}>Jawaban Anda:</p>
                            <a href={sub.file_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.82rem", color: "var(--color-primary)", textDecoration: "none", marginTop: "4px", fontWeight: "700" }}><i className="fi fi-rr-paperclip"></i><span>Lihat Berkas Jawaban</span></a>
                            <p style={{ fontSize: "0.7rem", color: "var(--color-gray-400)", marginTop: "4px" }}>Dikumpul pada: {new Date(sub.submitted_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                            {sub.notes && <div style={{ marginTop: "0.75rem", borderTop: "1px dashed var(--color-gray-200)", paddingTop: "0.5rem" }}><p style={{ fontSize: "0.72rem", color: "var(--color-gray-500)", fontWeight: "600" }}>Komentar Tutor:</p><p style={{ fontSize: "0.78rem", color: "var(--color-gray-600)", fontStyle: "italic", marginTop: "2px" }}>&ldquo;{sub.notes}&rdquo;</p></div>}
                          </div>
                        ) : (
                          <div>
                            <p style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--color-gray-700)", marginBottom: "0.5rem" }}>Kumpulkan Jawaban:</p>
                            <input type="file" onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" style={{ width: "100%", fontSize: "0.75rem", color: "var(--color-gray-500)", marginBottom: "0.75rem" }} />
                            <button disabled={submissionUploading || submittingMaterialId !== task.id || !submissionFile} onClick={() => handleSaveSubmission(task.id)} className="btn-portal-primary" style={{ width: "100%", padding: "0.45rem", fontSize: "0.8rem", fontWeight: "700" }}>
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

      <style jsx>{`
        .lms-progress-ring-wrap { position: relative; width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; }
        .lms-progress-ring { transform: rotate(-90deg); }
        .lms-progress-ring circle { fill: transparent; }
        .lms-progress-ring circle.track { stroke: var(--color-gray-100); }
        .lms-progress-ring circle.fill { stroke-linecap: round; transition: stroke-dashoffset 0.5s ease-in-out; }
        .lms-progress-ring-text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 900; line-height: 1; }
        .lms-progress-ring-text span { font-size: 0.6rem; font-weight: 700; color: var(--color-gray-400); text-transform: uppercase; margin-top: 2px; }
      `}</style>
    </div>
  );
}
