"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function StudentManagement() {
  const supabase = createClient();

  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [program, setProgram] = useState("Kids Program");
  const [parentId, setParentId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch students with parent info
      const { data: studentData, error: errS } = await supabase
        .from("students")
        .select(`
          id,
          name,
          age,
          program,
          parent_id,
          profiles (
            id,
            full_name
          )
        `)
        .order("name", { ascending: true });

      if (errS) throw errS;
      setStudents(studentData || []);

      // Fetch parents to populate the link dropdown
      const { data: parentData, error: errP } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "parent")
        .order("full_name", { ascending: true });

      if (errP) throw errP;
      setParents(parentData || []);
    } catch (err) {
      console.error("Gagal mengambil data siswa:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    if (!name.trim() || !age) {
      setErrorMsg("Nama siswa dan usia harus diisi.");
      setSubmitting(false);
      return;
    }

    try {
      const studentPayload = {
        name: name.trim(),
        age: parseInt(age),
        program,
        parent_id: parentId || null,
      };

      const { error } = await supabase
        .from("students")
        .insert(studentPayload);

      if (error) throw error;

      // Reset form & reload
      setName("");
      setAge("");
      setProgram("Kids Program");
      setParentId("");
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.message || "Gagal menambahkan data siswa.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async (id, sName) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data siswa "${sName}"? Semua data absensi dan rapor yang terhubung juga akan dihapus permanen.`)) {
      try {
        const { error } = await supabase
          .from("students")
          .delete()
          .eq("id", id);

        if (error) throw error;
        fetchData();
      } catch (err) {
        alert("Gagal menghapus siswa: " + err.message);
      }
    }
  };

  return (
    <div>
      <div className="dashboard-topbar">
        <div className="topbar-title">
          <h1>Kelola Siswa</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Database utama bimbingan belajar Ibra Global English Bobong
          </p>
        </div>
        <div className="topbar-user">
          <button className="btn-portal-primary" onClick={() => setModalOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--color-gray-500)" }}>
          <svg style={{ animation: "spin 1s linear infinite", width: "32px", height: "32px", marginBottom: "1rem" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <p>Memuat database siswa...</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Siswa</th>
                <th>Usia</th>
                <th>Program Kursus</th>
                <th>Orang Tua Terhubung</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-500)" }}>
                    Belum ada data siswa terdaftar. Klik "Tambah Siswa" untuk memulai!
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => (
                  <tr key={student.id}>
                    <td style={{ fontWeight: "700" }}>{idx + 1}</td>
                    <td style={{ fontWeight: "600", color: "var(--color-gray-900)" }}>{student.name}</td>
                    <td>{student.age} Tahun</td>
                    <td>
                      <span className="user-badge" style={{ backgroundColor: "var(--color-primary-light)", color: "var(--color-primary-dark)", padding: "0.25rem 0.65rem", fontWeight: "700" }}>
                        {student.program}
                      </span>
                    </td>
                    <td>
                      {student.profiles ? (
                        <span style={{ color: "var(--color-green)", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          {student.profiles.full_name}
                        </span>
                      ) : (
                        <span style={{ color: "var(--color-gray-500)", fontStyle: "italic" }}>
                          Belum dipasangkan
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn-portal-danger"
                        onClick={() => handleDeleteStudent(student.id, student.name)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form Tambah Siswa */}
      {modalOpen && (
        <div className="portal-modal-overlay">
          <div className="portal-modal">
            <div className="portal-modal-header">
              <h2 className="portal-modal-title">Tambah Siswa Baru</h2>
              <button className="btn-close-modal" onClick={() => setModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {errorMsg && (
              <div className="auth-error-banner" style={{ marginBottom: "1.5rem" }}>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddStudent}>
              <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                <label className="form-label">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Masukkan nama lengkap siswa"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Usia Siswa</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Contoh: 8"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Program Kursus</label>
                  <select
                    className="form-input"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="Kids Program">Kids Program</option>
                    <option value="Teens Program">Teens Program</option>
                    <option value="Fun Calistung">Fun Calistung</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "2rem" }}>
                <label className="form-label">Hubungkan dengan Orang Tua (Opsional)</label>
                <select
                  className="form-input"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  disabled={submitting}
                >
                  <option value="">-- Hubungkan di sini jika akun orang tua sudah terdaftar --</option>
                  {parents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.full_name}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", marginTop: "0.5rem", fontStyle: "italic" }}>
                  Catatan: Pasangan akun ini bertujuan agar orang tua dapat memantau rapor & absensi harian anak secara real-time dari portal mereka.
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                <button
                  type="button"
                  className="btn-portal-outline"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-portal-primary"
                  disabled={submitting}
                >
                  <span>{submitting ? "Menyimpan..." : "Simpan Data Siswa"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
