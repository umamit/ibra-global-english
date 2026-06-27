"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useStudentData, useRegistrations, formatIndonesianDate } from "./studentsHelpers";
import TabSwitcher from "./components/TabSwitcher";
import RejectModal from "./components/RejectModal";
import StudentFormModal from "./components/StudentFormModal";

export default function StudentManagement() {
  const supabase = createClient();

  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regLoading, setRegLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("students");

  // Reject modal state
  const [rejectModalId, setRejectModalId] = useState(null);
  const [rejectNotes, setRejectNotes] = useState("");

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

  // Fetch pendaftaran masuk
  const fetchRegistrations = async () => {
    setRegLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/register", {
        credentials: "include",
        cache: "no-store",
      });
      const result = await res.json().catch(() => null);

      if (!res.ok) {
        const serverError =
          (result && result.error) ||
          `Gagal memuat data pendaftaran (HTTP ${res.status})`;
        const serverDetails = result && result.details ? `\n\nDetail: ${result.details}` : "";
        const fullError = `${serverError}${serverDetails}`;
        console.error("Gagal memuat data pendaftaran:", fullError, result);
        setErrorMsg(fullError);
        setRegistrations([]);
        return;
      }

      if (result && result.data) {
        setRegistrations(result.data);
      } else {
        setRegistrations([]);
      }
    } catch (err) {
      console.error("Gagal memuat data pendaftaran:", err);
      setErrorMsg(
        "Terjadi kesalahan jaringan saat memuat data pendaftaran. Pastikan Anda terhubung ke internet."
      );
      setRegistrations([]);
    } finally {
      setRegLoading(false);
    }
  };

  // State untuk feedback pengiriman WA
  const [waSendingId, setWaSendingId] = useState(null);
  const [waFeedback, setWaFeedback] = useState({ id: null, success: null, msg: "" });

  // Approve: update status + auto-insert ke students + kirim WA via Fonnte
  const handleApprove = async (reg) => {
    if (!confirm(`Setujui pendaftaran "${reg.student_name}"? Data siswa akan otomatis ditambahkan ke daftar siswa dan notifikasi WhatsApp akan dikirim ke orang tua.`)) return;
    try {
      // 1. Update status di database
      const res = await fetch("/api/register", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reg.id, status: "approved" }),
      });
      const result = await res.json();

      if (!res.ok || result.success === false) {
        const errorMsg = result.error || "Gagal menyetujui pendaftaran.";
        const details = result.details ? `\n\nDetail: ${result.details}` : "";
        const hint = result.hint ? `\n\nSaran: ${result.hint}` : "";
        alert(`❌ ${errorMsg}${details}${hint}`);
        return;
      }

      // Tampilkan pesan sukses jika ada
      if (result.message) {
        setWaFeedback({ id: reg.id, success: true, msg: `✅ ${result.message}` });
        setTimeout(() => setWaFeedback({ id: null, success: null, msg: "" }), 5000);
      }

      fetchRegistrations();
      fetchData();

      // 2. Kirim notifikasi WA otomatis via Fonnte API
      const waNumber = reg.whatsapp.replace(/[^0-9]/g, "");
      const msg = `Assalamu'alaikum, Bapak/Ibu ${reg.parent_name || "Wali"}! 🎉\n\nPendaftaran *${reg.student_name}* ke program *${reg.program}* di *Ibra Global English Bobong* telah kami *SETUJUI* ✅.\n\nKami akan segera menghubungi Anda untuk informasi jadwal belajar perdana. Terima kasih telah mempercayakan pendidikan anak kepada kami! 🌟\n\n_Tim Ibra Global English_`;

      setWaSendingId(reg.id);
      const waRes = await fetch("/api/whatsapp-simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: waNumber, message: msg, type: "approval" }),
      });
      const waData = await waRes.json();
      setWaSendingId(null);

      if (waData.sentReal) {
        setWaFeedback({ id: reg.id, success: true, msg: "✅ Notifikasi WA berhasil terkirim via Fonnte!" });
      } else if (waData.status === "SIMULATED") {
        setWaFeedback({ id: reg.id, success: null, msg: "⚠️ WA disimulasikan (token Fonnte belum aktif). Cek log di /admin/whatsapp." });
      } else {
        setWaFeedback({ id: reg.id, success: false, msg: "❌ Gagal kirim WA via Fonnte. Cek konfigurasi token." });
      }
      setTimeout(() => setWaFeedback({ id: null, success: null, msg: "" }), 5000);
    } catch (err) {
      alert(`❌ Terjadi kesalahan: ${err.message}`);
    }
  };

  // Reject: tampilkan modal input alasan + kirim WA notifikasi penolakan
  const handleReject = async () => {
    if (!rejectModalId) return;
    const reg = registrations.find(r => r.id === rejectModalId);
    try {
      const res = await fetch("/api/register", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rejectModalId, status: "rejected", notes: rejectNotes }),
      });
      if (!res.ok) throw new Error("Gagal menolak pendaftaran.");

      // Kirim notifikasi WA penolakan
      if (reg?.whatsapp) {
        const waNumber = reg.whatsapp.replace(/[^0-9]/g, "");
        const alasan = rejectNotes?.trim() ? `\n\nAlasan: _${rejectNotes.trim()}_` : "";
        const msg = `Assalamu'alaikum, Bapak/Ibu ${reg.parent_name || "Wali"}.\n\nMohon maaf, pendaftaran *${reg.student_name}* ke program *${reg.program}* di *Ibra Global English Bobong* belum dapat kami proses saat ini.${alasan}\n\nJika ada pertanyaan, silakan hubungi kami kembali. Terima kasih atas perhatian Anda.\n\n_Tim Ibra Global English_`;
        fetch("/api/whatsapp-simulator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: waNumber, message: msg, type: "rejection" }),
        }).catch(console.error);
      }

      setRejectModalId(null);
      setRejectNotes("");
      fetchRegistrations();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (cancelled) return;
      await fetchData();
      await fetchRegistrations();
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("realtime-students-mgmt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        () => {
          fetchData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          fetchData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registrations" },
        () => {
          fetchRegistrations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Lock body scroll when modal is open
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
        // Edit mode
        const { error } = await supabase
          .from("students")
          .update(studentPayload)
          .eq("id", editingStudentId);
        if (error) throw error;
      } else {
        // Add mode
        const { error } = await supabase
          .from("students")
          .insert(studentPayload);
        if (error) throw error;
      }

      // Reset form
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
    if (confirm(`Apakah Anda yakin ingin menghapus data siswa "${sName}"? Semua data absensi dan rapor yang terhubung juga akan dihapus secara permanen.`)) {
      try {
        const { data: student, error: errGet } = await supabase
          .from("students")
          .select("parent_id")
          .eq("id", id)
          .single();
        if (errGet && errGet.code !== "PGRST116") throw errGet;
        const linkedUserId = student?.parent_id;
        const { error: errDel } = await supabase
          .from("students")
          .delete()
          .eq("id", id);
        if (errDel) throw errDel;
        if (linkedUserId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", linkedUserId)
            .single();
          if (profile?.role === "student") {
            const resAuth = await fetch("/api/admin/delete-user", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: linkedUserId }),
            });
            if (!resAuth.ok) {
              const errData = await resAuth.json();
              console.warn("Gagal menghapus akun login:", errData.error);
            }
          }
        }
        fetchData();
      } catch (err) {
        alert("Gagal menghapus siswa: " + err.message);
      }
    }
  };

  const handleDeleteParent = async (userId, userName) => {
    const connectedCount = students.filter(s => s.parent_id === userId).length;
    const extraWarning = connectedCount > 0
      ? `\n\nPeringatan: Akun ini terhubung ke ${connectedCount} siswa.`
      : "";
    if (confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${userName}" secara permanen?${extraWarning}`)) {
      try {
        const res = await fetch("/api/admin/delete-user", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Gagal menghapus akun.");
        fetchData();
      } catch (err) {
        alert("Gagal menghapus akun pengguna: " + err.message);
      }
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    if (confirm(`Apakah Anda yakin ingin mengubah peran pengguna ini menjadi '${newRole}'?`)) {
      try {
        const res = await fetch("/api/admin/update-role", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, role: newRole }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Gagal mengubah peran.");
        alert("Peran berhasil diperbarui!");
        fetchData();
      } catch (err) {
        console.error("Gagal mengubah peran:", err);
        alert("Gagal mengubah peran: " + err.message);
      }
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

      <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} students={students} parents={parents} registrations={registrations} fetchRegistrations={fetchRegistrations} />

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
                    Belum ada data siswa terdaftar. Klik &ldquo;Tambah Siswa&rdquo; untuk memulai!
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
                <th>Ubah Peran</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {parents.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-500)" }}>
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
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="btn-portal-danger"
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", height: "auto" }}
                          onClick={() => handleDeleteParent(parent.id, parent.full_name)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.25rem" }}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                          <span>Hapus</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "registrations" && (
        <div>
          {errorMsg && activeTab === "registrations" && (
            <div style={{
              backgroundColor: "rgba(239,68,68,0.1)",
              color: "var(--color-red)",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              fontWeight: "600"
            }}>
              {errorMsg}
            </div>
          )}
          {regLoading ? (
            <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-500)" }}>
              <svg style={{ animation: "spin 1s linear infinite", width: "28px", height: "28px" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="portal-table registration-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Siswa</th>
                    <th>Usia</th>
                    <th>Program</th>
                    <th>Orang Tua</th>
                    <th>WhatsApp</th>
                    <th>Waktu Daftar</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.filter(r => r.status !== "approved").length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-500)" }}>
                        Tidak ada pendaftaran yang perlu ditindaklanjuti.
                      </td>
                    </tr>
                  ) : (
                    registrations.filter(r => r.status !== "approved").map((reg, idx) => {
                      const statusColor = reg.status === "approved"
                        ? { bg: "var(--color-green-light)", text: "var(--color-green)", label: "✓ Disetujui" }
                        : reg.status === "rejected"
                        ? { bg: "rgba(239,68,68,0.1)", text: "var(--color-red)", label: "✗ Ditolak" }
                        : { bg: "rgba(234,179,8,0.1)", text: "#b45309", label: "⏳ Menunggu" };

                      return (
                        <tr key={reg.id}>
                          <td style={{ fontWeight: "700" }}>{idx + 1}</td>
                          <td style={{ fontWeight: "600" }}>{reg.student_name}</td>
                          <td>{reg.student_age ? `${reg.student_age} thn` : "-"}</td>
                          <td>
                            <span className="user-badge" style={{ backgroundColor: "var(--color-primary-light)", color: "var(--color-primary-dark)", padding: "0.2rem 0.55rem", fontWeight: "700", fontSize: "0.78rem" }}>
                              {reg.program?.split(" ")[0]}
                            </span>
                          </td>
                          <td>
                            <div>{reg.parent_name || <span style={{ color: "var(--color-gray-400)", fontStyle: "italic" }}>-</span>}</div>
                            {reg.parent_email && (
                              <div style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", marginTop: "0.1rem" }}>
                                {reg.parent_email}
                              </div>
                            )}
                          </td>
                          <td>
                            <a href={`https://wa.me/${reg.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: "600", textDecoration: "none" }}>
                              {reg.whatsapp}
                            </a>
                          </td>
                          <td style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>
                            {new Date(reg.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td>
                            <span style={{ backgroundColor: statusColor.bg, color: statusColor.text, padding: "0.2rem 0.6rem", borderRadius: "8px", fontWeight: "700", fontSize: "0.78rem" }}>
                              {statusColor.label}
                            </span>
                            {reg.status === "rejected" && reg.notes && (
                              <p style={{ fontSize: "0.72rem", color: "var(--color-gray-400)", marginTop: "0.2rem", fontStyle: "italic" }}>{reg.notes}</p>
                            )}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {reg.status === "pending" && (
                              <div style={{ display: "inline-flex", flexDirection: "column", gap: "0.35rem", alignItems: "flex-end" }}>
                                <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                                  <button
                                    className="btn-portal-primary"
                                    style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", height: "auto" }}
                                    onClick={() => handleApprove(reg)}
                                    disabled={waSendingId === reg.id}
                                  >
                                    {waSendingId === reg.id ? "⏳ Mengirim WA..." : "Setujui"}
                                  </button>
                                  <button
                                    className="btn-portal-danger"
                                    style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", height: "auto" }}
                                    onClick={() => { setRejectModalId(reg.id); setRejectNotes(""); }}
                                    disabled={waSendingId === reg.id}
                                  >
                                    Tolak
                                  </button>
                                </div>
                                {waFeedback.id === reg.id && waFeedback.msg && (
                                  <span style={{
                                    fontSize: "0.72rem",
                                    color: waFeedback.success === true ? "var(--color-green)" : waFeedback.success === false ? "var(--color-red)" : "#b45309",
                                    fontWeight: "600",
                                    maxWidth: "200px",
                                    textAlign: "right"
                                  }}>
                                    {waFeedback.msg}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <RejectModal rejectModalId={rejectModalId} rejectNotes={rejectNotes} setRejectNotes={setRejectNotes} onClose={() => setRejectModalId(null)} onConfirm={handleReject} />
      <StudentFormModal open={modalOpen} editing={editingStudentId} name={name} age={age} program={program} parentId={parentId} parents={parents} errorMsg={errorMsg} submitting={submitting} onNameChange={(e) => setName(e.target.value)} onAgeChange={(e) => setAge(e.target.value)} onProgramChange={(e) => setProgram(e.target.value)} onParentIdChange={(e) => setParentId(e.target.value)} onClose={() => setModalOpen(false)} onSubmit={handleSaveStudent} />
    </div>
  );
}