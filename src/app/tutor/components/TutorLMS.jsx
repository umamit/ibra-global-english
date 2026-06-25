"use client";

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
}) {
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
                required={lmsType === "tugas"}
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: "1.75rem" }}>
            <label className="form-label">Lampiran Berkas (PDF, Dokumen, atau Gambar)</label>
            <input
              id="lms-file-input"
              type="file"
              className="form-input"
              onChange={(e) => setLmsFile(e.target.files[0])}
              style={{ padding: "0.5rem" }}
            />
          </div>

          <button
            type="submit"
            className="btn-portal-primary"
            style={{ width: "100%", padding: "0.85rem" }}
            disabled={lmsUploading}
          >
            {lmsUploading ? "Mengunggah..." : "Terbitkan ke LMS"}
          </button>

        </form>
      </div>

      {/* List & Submissions Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* List of LMS Materials */}
        <div className="portal-card" style={{ padding: "2rem" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1rem" }}>
            Daftar Konten LMS Aktif
          </h3>

          {/* Ringkasan Progress Kelas */}
          {(() => {
            const tasks = lmsMaterials.filter(m => m.type === "tugas");
            if (tasks.length === 0) return null;
            const totalSubmissions = lmsSubmissions.length;
            const totalExpected = tasks.length * Math.max(students.length, 1);
            const pct = totalExpected > 0 ? Math.round((totalSubmissions / totalExpected) * 100) : 0;
            const barColor = pct >= 75 ? "var(--color-green)" : pct >= 50 ? "#f59e0b" : "var(--color-red)";
            return (
              <div style={{ marginBottom: "1.5rem", padding: "0.9rem 1.1rem", background: "var(--color-gray-50)", borderRadius: "10px", border: "1px solid var(--color-gray-150)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontWeight: "700", fontSize: "0.825rem", color: "var(--color-gray-700)" }}>📊 Progress Kelas Keseluruhan</span>
                  <span style={{ fontWeight: "800", fontSize: "0.875rem", color: barColor }}>{pct}%</span>
                </div>
                <div style={{ background: "var(--color-gray-200)", borderRadius: "99px", height: "8px", overflow: "hidden", marginBottom: "0.5rem" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: "99px", transition: "width 0.8s ease" }} />
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--color-gray-500)" }}>
                  Total pengumpulan: <strong>{totalSubmissions}</strong> dari <strong>{totalExpected}</strong> yang diharapkan ({tasks.length} tugas × {students.length} siswa)
                </p>
              </div>
            );
          })()}

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "400px", overflowY: "auto" }}>
            {lmsMaterials.length === 0 ? (
              <p style={{ color: "var(--color-gray-400)", textAlign: "center", padding: "2rem 0" }}>Belum ada materi atau tugas yang diunggah.</p>
            ) : (
              lmsMaterials.map((mat) => (
                <div key={mat.id} style={{ borderBottom: "1px solid var(--color-gray-100)", paddingBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "4px" }}>
                      <span style={{ 
                        fontSize: "0.7rem", 
                        fontWeight: "bold", 
                        padding: "2px 6px", 
                        borderRadius: "4px", 
                        backgroundColor: mat.type === "materi" ? "rgba(74, 155, 168, 0.1)" : "rgba(166, 136, 73, 0.1)",
                        color: mat.type === "materi" ? "var(--color-primary)" : "var(--color-accent)",
                        textTransform: "uppercase"
                      }}>
                        {mat.type}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-gray-400)" }}>{mat.program}</span>
                    </div>
                    <strong style={{ color: "var(--color-gray-900)", fontSize: "0.95rem" }}>{mat.title}</strong>
                    {mat.due_date && (
                      <p style={{ fontSize: "0.75rem", color: "var(--color-red)", marginTop: "2px", fontWeight: "bold" }}>
                        Tenggat: {new Date(mat.due_date).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                    {mat.file_url && (
                      <a href={mat.file_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", fontSize: "0.75rem", color: "var(--color-primary)", marginTop: "4px" }}>
                        📁 Buka File Lampiran
                      </a>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", alignItems: "flex-end" }}>
                    {mat.type === "tugas" && (
                      <button 
                        className="btn-portal-outline" 
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", borderColor: "var(--color-primary)", color: "var(--color-primary)", cursor: "pointer" }}
                        onClick={() => handleViewSubmissions(mat)}
                      >
                        Jawaban Siswa
                      </button>
                    )}
                    <button 
                      className="btn-portal-danger" 
                      style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", cursor: "pointer" }}
                      onClick={() => handleDeleteLmsMaterial(mat.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Submissions/Grading Panel */}
        {activeLmsGrading && (
          <div className="portal-card animate-scale-in" style={{ padding: "2rem", borderLeft: "4px solid var(--color-primary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--color-gray-900)", margin: "0" }}>
                Jawaban Siswa: {activeLmsGrading.title}
              </h3>
              <button 
                style={{ background: "none", border: "none", color: "var(--color-gray-400)", cursor: "pointer", fontSize: "1.25rem", fontWeight: "bold" }}
                onClick={() => setActiveLmsGrading(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "350px", overflowY: "auto" }}>
              {lmsSubmissions.length === 0 ? (
                <p style={{ color: "var(--color-gray-400)", textAlign: "center", padding: "1.5rem 0" }}>Belum ada siswa yang mengumpulkan jawaban.</p>
              ) : (
                lmsSubmissions.map((sub) => (
                  <div key={sub.id} style={{ borderBottom: "1px solid var(--color-gray-100)", paddingBottom: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <strong style={{ color: "var(--color-gray-800)" }}>{sub.students?.name}</strong>
                      <span style={{ fontSize: "0.7rem", color: "var(--color-gray-400)" }}>
                        {new Date(sub.submitted_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                      <a href={sub.file_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: "bold" }}>
                        📁 Buka File Jawaban Siswa
                      </a>
                      
                      {sub.grade ? (
                        <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "4px", backgroundColor: "rgba(166,136,73,0.1)", color: "var(--color-accent)", fontWeight: "bold" }}>
                          Nilai: {sub.grade} {sub.feedback ? "✓" : ""}
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.7rem", color: "var(--color-red)", fontWeight: "bold" }}>
                          Belum Dinilai
                        </span>
                      )}
                    </div>

                    {/* Grade Action form inline */}
                    {selectedSubmission?.id === sub.id ? (
                      <div style={{ marginTop: "1rem", backgroundColor: "var(--color-gray-50)", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-150)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Nilai (0-100)"
                            value={studentGrade}
                            onChange={(e) => setStudentGrade(e.target.value)}
                            style={{ padding: "0.35rem 0.5rem", fontSize: "0.8rem" }}
                          />
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Catatan umpan balik..."
                            value={studentFeedback}
                            onChange={(e) => setStudentFeedback(e.target.value)}
                            style={{ padding: "0.35rem 0.5rem", fontSize: "0.8rem" }}
                          />
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <button 
                            className="btn-portal-outline" 
                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", cursor: "pointer" }}
                            onClick={() => setSelectedSubmission(null)}
                          >
                            Batal
                          </button>
                          <button 
                            className="btn-portal-primary" 
                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", cursor: "pointer" }}
                            onClick={() => handleSaveGrade(sub.id)}
                            disabled={gradingLoading}
                          >
                            {gradingLoading ? "Menyimpan..." : "Simpan Nilai"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="btn-portal-outline"
                        style={{ 
                          padding: "0.25rem 0.5rem", 
                          fontSize: "0.75rem", 
                          borderColor: "var(--color-accent)", 
                          color: "var(--color-accent)", 
                          cursor: "pointer", 
                          marginTop: "8px", 
                          display: "block" 
                        }}
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setStudentGrade(sub.grade || "");
                          setStudentFeedback(sub.feedback || "");
                        }}
                      >
                        {sub.grade ? "Edit Penilaian" : "Beri Nilai & Masukan"}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}