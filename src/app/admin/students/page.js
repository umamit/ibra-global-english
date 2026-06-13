"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { createAdminClient as createClient } from "@/utils/supabase/client";

export default function StudentManagement() {
  const supabase = createClient();

  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("students"); // 'students' or 'parents'

  // Form State
  const [editingStudentId, setEditingStudentId] = useState(null);
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

      // Fetch all user profiles for role management and parent linking
      const { data: parentData, error: errP } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at")
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

  // Lock body scroll when modal is open to prevent page scrolling behind it
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  const handleOpenAddModal = () => {
    setEditingStudentId(null);
    setName("");
    setAge("");
    setProgram("Kids Program");
    setParentId("");
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudentId(student.id);
    setName(student.name);
    setAge(student.age.toString());
    setProgram(student.program);
    setParentId(student.parent_id || "");
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleSaveStudent = async (e) => {
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

      if (editingStudentId) {
        // Edit mode (Update)
        const { error } = await supabase
          .from("students")
          .update(studentPayload)
          .eq("id", editingStudentId);

        if (error) throw error;
      } else {
        // Add mode (Insert)
        const { error } = await supabase
          .from("students")
          .insert(studentPayload);

        if (error) throw error;
      }

      // Reset form & reload
      setName("");
      setAge("");
      setProgram("Kids Program");
      setParentId("");
      setEditingStudentId(null);
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.message || "Gagal menyimpan data siswa.");
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

  const handleUpdateRole = async (userId, newRole) => {
    if (confirm(`Apakah Anda yakin ingin mengubah peran pengguna ini menjadi '${newRole}'?`)) {
      try {
        // 1. Update profiles table
        const { error } = await supabase
          .from("profiles")
          .update({ role: newRole })
          .eq("id", userId);
        
        if (error) throw error;

        // 2. Update auth.users metadata and auto-confirm email since admin has verified this role change
        const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
          user_metadata: { role: newRole },
          email_confirm: true
        });

        if (authError) {
          console.warn("Gagal memperbarui metadata auth.users, namun profil berhasil diperbarui:", authError);
        }
        
        alert("Peran berhasil diperbarui!");
        fetchData();
      } catch (err) {
        console.error("Gagal mengubah peran:", err);
        alert("Gagal mengubah peran: " + err.message);
      }
    }
  };

  // Format date to localized Indonesian style
  const formatIndonesianDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "-";
      const day = d.getDate();
      const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div>
      <div className="dashboard-topbar">
        <div className="topbar-title">
          <h1>Kelola Akademik</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Database utama bimbingan belajar Ibra Global English Bobong
          </p>
        </div>
        <div className="topbar-user">
          {activeTab === "students" && (
            <button className="btn-portal-primary" onClick={handleOpenAddModal}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Tambah Siswa</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ 
        display: "flex", 
        borderBottom: "2px solid var(--color-gray-100)", 
        marginBottom: "1.75rem",
        gap: "0.5rem"
      }}>
        <button
          onClick={() => setActiveTab("students")}
          style={{
            background: "none",
            border: "none",
            padding: "0.75rem 1.25rem",
            fontWeight: activeTab === "students" ? "800" : "500",
            color: activeTab === "students" ? "var(--color-primary-dark)" : "var(--color-gray-500)",
            borderBottom: activeTab === "students" ? "3px solid var(--color-primary)" : "3px solid transparent",
            marginBottom: "-2px",
            cursor: "pointer",
            fontSize: "1rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "all 0.2s ease"
          }}
        >
          <span>Daftar Siswa</span>
          <span style={{ 
            fontSize: "0.75rem", 
            backgroundColor: activeTab === "students" ? "var(--color-primary-light)" : "var(--color-gray-100)",
            color: activeTab === "students" ? "var(--color-primary-dark)" : "var(--color-gray-600)",
            padding: "0.15rem 0.5rem",
            borderRadius: "10px",
            fontWeight: "700"
          }}>
            {students.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("parents")}
          style={{
            background: "none",
            border: "none",
            padding: "0.75rem 1.25rem",
            fontWeight: activeTab === "parents" ? "800" : "500",
            color: activeTab === "parents" ? "var(--color-primary-dark)" : "var(--color-gray-500)",
            borderBottom: activeTab === "parents" ? "3px solid var(--color-primary)" : "3px solid transparent",
            marginBottom: "-2px",
            cursor: "pointer",
            fontSize: "1rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "all 0.2s ease"
          }}
        >
          <span>Kelola Peran & Pengguna</span>
          <span style={{ 
            fontSize: "0.75rem", 
            backgroundColor: activeTab === "parents" ? "var(--color-primary-light)" : "var(--color-gray-100)",
            color: activeTab === "parents" ? "var(--color-primary-dark)" : "var(--color-gray-600)",
            padding: "0.15rem 0.5rem",
            borderRadius: "10px",
            fontWeight: "700"
          }}>
            {parents.length}
          </span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--color-gray-500)" }}>
          <svg style={{ animation: "spin 1s linear infinite", width: "32px", height: "32px", marginBottom: "1rem" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <p>Memuat database...</p>
        </div>
      ) : activeTab === "students" ? (
        <div className="table-wrapper">
          <table className="portal-table student-table">
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
                      <div style={{ display: "inline-flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button
                          className="btn-portal-outline"
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", height: "auto" }}
                          onClick={() => handleOpenEditModal(student)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.25rem" }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          <span>Edit</span>
                        </button>
                        <button
                          className="btn-portal-danger"
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", height: "auto" }}
                          onClick={() => handleDeleteStudent(student.id, student.name)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.25rem" }}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="portal-table parent-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Lengkap</th>
                <th>Alamat Email</th>
                <th>Peran Aktif</th>
                <th>Siswa Terhubung</th>
                <th>Ubah Peran (Aksi)</th>
              </tr>
            </thead>
            <tbody>
              {parents.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-500)" }}>
                    Belum ada akun pengguna terdaftar.
                  </td>
                </tr>
              ) : (
                parents.map((parent, idx) => {
                  const connectedChildren = students.filter(s => s.parent_id === parent.id);
                  return (
                    <tr key={parent.id}>
                      <td style={{ fontWeight: "700" }}>{idx + 1}</td>
                      <td style={{ fontWeight: "600", color: "var(--color-gray-900)" }}>{parent.full_name}</td>
                      <td>{parent.email || <span style={{ color: "var(--color-gray-400)", fontStyle: "italic" }}>Tidak tersedia</span>}</td>
                      <td>
                        <span className="user-badge" style={{
                          backgroundColor: parent.role === "admin" ? "rgba(239, 68, 68, 0.1)" : parent.role === "tutor" ? "rgba(166, 136, 73, 0.1)" : parent.role === "student" ? "var(--color-primary-light)" : "var(--color-green-light)",
                          color: parent.role === "admin" ? "var(--color-red)" : parent.role === "tutor" ? "var(--color-accent)" : parent.role === "student" ? "var(--color-primary-dark)" : "var(--color-green)",
                          padding: "0.25rem 0.65rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          fontSize: "0.75rem"
                        }}>
                          {parent.role || "parent"}
                        </span>
                      </td>
                      <td>
                        {connectedChildren.length > 0 ? (
                          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                            {connectedChildren.map(child => (
                              <span key={child.id} className="user-badge" style={{ backgroundColor: "var(--color-primary-light)", color: "var(--color-primary-dark)", padding: "0.15rem 0.5rem", fontSize: "0.8rem", fontWeight: "700" }}>
                                {child.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: "var(--color-gray-400)", fontStyle: "italic", fontSize: "0.85rem" }}>
                            -
                          </span>
                        )}
                      </td>
                      <td>
                        <select
                          value={parent.role || "parent"}
                          onChange={(e) => handleUpdateRole(parent.id, e.target.value)}
                          className="form-input"
                          style={{
                            padding: "0.35rem 0.75rem",
                            fontSize: "0.85rem",
                            width: "auto",
                            borderRadius: "6px",
                            border: "1px solid var(--color-gray-200)",
                            cursor: "pointer",
                            backgroundColor: "white",
                            fontWeight: "600"
                          }}
                        >
                          <option value="parent">Orang Tua (Parent)</option>
                          <option value="tutor">Pengajar (Tutor)</option>
                          <option value="student">Siswa (Student)</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form Tambah/Edit Siswa */}
      {modalOpen && (
        <div className="portal-modal-overlay">
          <div className="portal-modal">
            <div className="portal-modal-header">
              <h2 className="portal-modal-title">{editingStudentId ? "Edit Data Siswa" : "Tambah Siswa Baru"}</h2>
              <button className="btn-close-modal" onClick={() => setModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {errorMsg && (
              <div className="auth-error-banner" style={{ marginBottom: "1.5rem" }}>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveStudent}>
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
                  {parents.filter(p => p.role === "parent").map((parent) => (
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
                  <span>{submitting ? "Menyimpan..." : (editingStudentId ? "Simpan Perubahan" : "Simpan Data Siswa")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
