"use client";

import React from "react";

interface Student {
  id: string;
  name: string;
  program: string;
}

interface LmsMaterial {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  program: string;
  file_url?: string | null;
  due_date?: string | null;
  created_at: string;
}

interface LmsSubmission {
  id: string;
  material_id: string;
  student_id: string;
  file_url: string;
  submitted_at: string;
  grade?: string | null;
  notes?: string | null;
  students?: {
    name: string;
  } | null;
}

interface TutorLMSProps {
  students: Student[];
  lmsMaterials: LmsMaterial[];
  lmsSubmissions: LmsSubmission[];
  activeLmsGrading: LmsMaterial | null;
  selectedSubmission: LmsSubmission | null;
  studentGrade: string;
  studentFeedback: string;
  gradingLoading: boolean;
  lmsUploading: boolean;
  lmsTitle: string;
  setLmsTitle: (val: string) => void;
  lmsDesc: string;
  setLmsDesc: (val: string) => void;
  lmsProgram: string;
  setLmsProgram: (val: string) => void;
  lmsType: string;
  setLmsType: (val: string) => void;
  lmsDueDate: string;
  setLmsDueDate: (val: string) => void;
  lmsFile: File | null;
  setLmsFile: (val: File | null) => void;
  handleSaveLmsMaterial: (e: React.FormEvent<HTMLFormElement>) => void;
  handleViewSubmissions: (material: LmsMaterial) => void;
  handleDeleteLmsMaterial: (id: string) => void;
  handleSaveGrade: (submissionId: string) => void;
  setSelectedSubmission: (val: LmsSubmission | null) => void;
  setStudentGrade: (val: string) => void;
  setStudentFeedback: (val: string) => void;
}

export default function TutorLMS({
  students,
  lmsMaterials,
  lmsSubmissions,
  activeLmsGrading,
  selectedSubmission,
  studentGrade,
  studentFeedback,
  gradingLoading,
  lmsUploading,
  lmsTitle,
  setLmsTitle,
  lmsDesc,
  setLmsDesc,
  lmsProgram,
  setLmsProgram,
  lmsType,
  setLmsType,
  lmsDueDate,
  setLmsDueDate,
  lmsFile,
  setLmsFile,
  handleSaveLmsMaterial,
  handleViewSubmissions,
  handleDeleteLmsMaterial,
  handleSaveGrade,
  setSelectedSubmission,
  setStudentGrade,
  setStudentFeedback
}: TutorLMSProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "2rem", alignItems: "start" }} className="report-detail-layout">
      
      {/* Form Section */}
      <div className="portal-card" style={{ padding: "2rem" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.5rem" }}>
          Unggah Materi & Tugas Baru
        </h3>
        <form onSubmit={handleSaveLmsMaterial}>
          
          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label className="form-label">Judul Materi / Tugas</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Modul 1 - Tenses dasar atau PR Grammar"
              value={lmsTitle}
              onChange={(e) => setLmsTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label className="form-label">Deskripsi & Instruksi</label>
            <textarea
              className="form-input"
              style={{ minHeight: "80px", fontFamily: "inherit" }}
              placeholder="Tuliskan petunjuk atau detail materi/tugas di sini..."
              value={lmsDesc}
              onChange={(e) => setLmsDesc(e.target.value)}
            />
          </div>

          <div className="form-grid" style={{ gap: "1rem", marginBottom: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label">Program Belajar</label>
              <select
                className="form-input"
                value={lmsProgram}
                onChange={(e) => setLmsProgram(e.target.value)}
              >
                <option value="Kids Program">Kids Program</option>
                <option value="Teens Program">Teens Program</option>
                <option value="Fun Calistung">Fun Calistung</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select
                className="form-input"
                value={lmsType}
                onChange={(e) => setLmsType(e.target.value)}
              >
                <option value="materi">Materi Belajar</option>
                <option value="tugas">Tugas Rumah (PR)</option>
              </select>
            </div>
          </div>

          {lmsType === "tugas" && (
            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
              <label className="form-label">Tenggat Waktu Pengumpulan (Due Date)</label>
              <input
                type="datetime-local"
                className="form-input"
                value={lmsDueDate}
                onChange={(e) => setLmsDueDate(e.target.value)}
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: "2rem" }}>
            <label className="form-label">Pilih Berkas Lampiran (File PDF/Doc/Image)</label>
            <input
              type="file"
              className="form-input"
              onChange={(e) => setLmsFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            />
            <p style={{ fontSize: "0.72rem", color: "var(--color-gray-400)", marginTop: "4px" }}>
              Format berkas: .pdf, .docx, .png, .jpg (Maksimal 10MB)
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="btn-portal-primary"
              disabled={lmsUploading}
            >
              {lmsUploading ? "Mengunggah..." : "Unggah Berkas ke LMS"}
            </button>
          </div>
        </form>
      </div>

      {/* Materials List Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* Submissions Modal / Sidebar inside layout */}
        {activeLmsGrading && (
          <div className="portal-card" style={{ padding: "1.5rem", border: "1.5px solid var(--color-primary-light)", background: "var(--color-gray-50)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h4 style={{ fontWeight: "800", color: "var(--color-primary-dark)", fontSize: "0.95rem" }}>
                📥 Daftar Pengumpulan Tugas
              </h4>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="btn-portal-outline"
                style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", height: "auto" }}
              >
                Tutup Panel
              </button>
            </div>

            {lmsSubmissions.length === 0 ? (
              <p style={{ color: "var(--color-gray-400)", fontSize: "0.85rem", textAlign: "center", padding: "1rem 0" }}>
                Belum ada siswa yang mengumpulkan jawaban.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {lmsSubmissions.map(sub => (
                  <div key={sub.id} style={{
                    border: "1px solid var(--color-gray-200)",
                    borderRadius: "8px",
                    padding: "0.85rem",
                    backgroundColor: selectedSubmission?.id === sub.id ? "white" : "transparent"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong>{sub.students?.name}</strong>
                      <span style={{ fontSize: "0.75rem", color: sub.grade ? "var(--color-green)" : "var(--color-accent)", fontWeight: "700" }}>
                        {sub.grade ? `Nilai: ${sub.grade}` : "⏳ Belum Dinilai"}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.72rem", color: "var(--color-gray-400)", marginTop: "2px" }}>
                      Dikumpul: {new Date(sub.submitted_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem" }}>
                      <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="btn-portal-outline" style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", textDecoration: "none" }}>
                        📎 Buka File
                      </a>
                      <button
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setStudentGrade(sub.grade || "");
                          setStudentFeedback(sub.notes || "");
                        }}
                        className="btn-portal-primary"
                        style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", height: "auto" }}
                      >
                        ✍️ Beri Nilai
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grading Form Panel */}
            {selectedSubmission && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSaveGrade(selectedSubmission.id);
              }} style={{ marginTop: "1.25rem", borderTop: "1px dashed var(--color-gray-200)", paddingTop: "1rem" }}>
                <h5 style={{ fontWeight: "800", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                  Form Penilaian: {selectedSubmission.students?.name}
                </h5>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2.5fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Nilai"
                    className="form-input"
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(e.target.value)}
                    required
                    disabled={gradingLoading}
                    style={{ padding: "0.45rem", fontSize: "0.85rem" }}
                  />
                  <input
                    type="text"
                    placeholder="Komentar / Feedback..."
                    className="form-input"
                    value={studentFeedback}
                    onChange={(e) => setStudentFeedback(e.target.value)}
                    disabled={gradingLoading}
                    style={{ padding: "0.45rem", fontSize: "0.85rem" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={gradingLoading}
                  className="btn-portal-primary"
                  style={{ width: "100%", padding: "0.4rem", fontSize: "0.8rem" }}
                >
                  {gradingLoading ? "Menyimpan..." : "Simpan & Kirim Nilai"}
                </button>
              </form>
            )}
          </div>
        )}

        <div className="portal-card" style={{ padding: "1.75rem" }}>
          <h3 style={{ fontWeight: "800", fontSize: "1rem", marginBottom: "1.25rem" }}>
            Materi & Tugas Terunggah ({lmsMaterials.length})
          </h3>

          {lmsMaterials.length === 0 ? (
            <p style={{ color: "var(--color-gray-400)", fontSize: "0.85rem", textAlign: "center", padding: "2rem 0" }}>
              Belum ada materi atau tugas rumah diunggah.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {lmsMaterials.map(mat => (
                <div key={mat.id} style={{
                  border: "1px solid var(--color-gray-200)",
                  borderRadius: "10px",
                  padding: "1rem"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                    <div>
                      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.25rem" }}>
                        <span style={{ fontSize: "0.68rem", fontWeight: "800", padding: "1px 6px", borderRadius: "4px", background: mat.type === "tugas" ? "#fff7ed" : "var(--color-primary-light)", color: mat.type === "tugas" ? "#b06000" : "var(--color-primary-dark)" }}>
                          {mat.type === "tugas" ? "Tugas Rumah" : "Materi"}
                        </span>
                        <span style={{ fontSize: "0.68rem", fontWeight: "600", padding: "1px 6px", borderRadius: "4px", background: "var(--color-gray-100)", color: "var(--color-gray-600)" }}>
                          {mat.program}
                        </span>
                      </div>
                      <h4 style={{ fontWeight: "800", fontSize: "0.95rem", color: "var(--color-gray-900)" }}>{mat.title}</h4>
                      {mat.description && <p style={{ fontSize: "0.8rem", color: "var(--color-gray-600)", marginTop: "0.25rem", lineHeight: 1.4 }}>{mat.description}</p>}
                    </div>

                    <button
                      onClick={() => handleDeleteLmsMaterial(mat.id)}
                      className="btn-portal-danger"
                      style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", height: "auto" }}
                    >
                      Hapus
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.85rem", borderTop: "1px dashed var(--color-gray-150)", paddingTop: "0.75rem" }}>
                    {mat.file_url && (
                      <a href={mat.file_url} target="_blank" rel="noopener noreferrer" className="btn-portal-outline" style={{ padding: "0.3rem 0.75rem", fontSize: "0.78rem", textDecoration: "none" }}>
                        📂 Unduh Berkas
                      </a>
                    )}
                    {mat.type === "tugas" && (
                      <button
                        onClick={() => handleViewSubmissions(mat)}
                        className="btn-portal-primary"
                        style={{ padding: "0.3rem 0.75rem", fontSize: "0.78rem", height: "auto" }}
                      >
                        📥 Cek Pengumpulan
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
