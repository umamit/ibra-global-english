"use client";

export const dynamic = 'force-dynamic';

import React from 'react';
import { useState, useEffect } from "react";
import Link from "next/link";
import ToastNotification from "../components/ToastNotification";

interface Curriculum {
  id: string;
  program: string;
  level_name: string;
  duration?: string;
  topics?: string[];
  syllabus_pdf_url?: string;
  is_active: boolean;
}

const PROGRAMS = ["Kids Program", "Teens Program", "Fun Calistung"];

export default function AdminCurriculumPage() {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error"; message: string }>({ show: false, type: "success", message: "" });

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [program, setProgram] = useState<string>("Kids Program");
  const [levelName, setLevelName] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [topicsInput, setTopicsInput] = useState<string>(""); // Comma-separated string in UI
  const [syllabusPdfUrl, setSyllabusPdfUrl] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type }), 3500);
  };

  const fetchCurriculums = async (): Promise<void> => {
    try {
      const res = await fetch("/api/admin/curriculums?all=true");
      const result = await res.json();
      if (res.ok) {
        setCurriculums(result.data || []);
      } else {
        showToast(`Gagal memuat: ${result.error}`, "error");
      }
    } catch (err) {
      showToast("Gagal mengambil data silabus.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/curriculums?all=true");
        const result = await res.json();
        if (res.ok) {
          setCurriculums(result.data || []);
        } else {
          showToast(`Gagal memuat: ${result.error}`, "error");
        }
      } catch {
        showToast("Gagal mengambil data silabus.", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!levelName.trim()) {
      showToast("Nama Level wajib diisi.", "error");
      return;
    }

    setSaving(true);
    try {
      // Parse comma-separated topics into array
      const topicsArray = topicsInput
        .split("\n")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const payload = {
        program,
        level_name: levelName.trim(),
        duration: duration.trim(),
        topics: topicsArray,
        syllabus_pdf_url: syllabusPdfUrl.trim(),
        is_active: isActive,
      };

      let res: Response;
      if (editingId) {
        res = await fetch("/api/admin/curriculums", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
      } else {
        res = await fetch("/api/admin/curriculums", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const result = await res.json();
      if (res.ok) {
        showToast(editingId ? "Silabus berhasil disunting! ✅" : "Silabus baru berhasil ditambahkan! ✅", "success");
        setEditingId(null);
        setLevelName("");
        setDuration("");
        setTopicsInput("");
        setSyllabusPdfUrl("");
        setIsActive(true);
        fetchCurriculums();
      } else {
        showToast(`Error: ${result.error}`, "error");
      }
    } catch (err) {
      showToast("Gagal menyimpan data silabus.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (c: Curriculum) => {
    setEditingId(c.id);
    setProgram(c.program);
    setLevelName(c.level_name);
    setDuration(c.duration || "");
    setTopicsInput(Array.isArray(c.topics) ? c.topics.join("\n") : "");
    setSyllabusPdfUrl(c.syllabus_pdf_url || "");
    setIsActive(c.is_active !== false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setProgram("Kids Program");
    setLevelName("");
    setDuration("");
    setTopicsInput("");
    setSyllabusPdfUrl("");
    setIsActive(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Apakah Anda yakin ingin menghapus silabus ini?")) return;
    try {
      const res = await fetch(`/api/admin/curriculums?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok) {
        showToast("Silabus berhasil dihapus.", "success");
        fetchCurriculums();
        if (editingId === id) handleCancelEdit();
      } else {
        showToast(`Error: ${result.error}`, "error");
      }
    } catch (err) {
      showToast("Gagal menghapus silabus.", "error");
    }
  };

  return (
    <div className="dashboard-main" style={{ padding: "2rem" }}>
      {toast.show && <ToastNotification toast={toast} />}

      <div className="dashboard-topbar" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>📖 Kelola Kurikulum & Silabus</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Kelola detail silabus, tingkatan level, dan materi pembelajaran program Ibra Global English.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "2rem", alignItems: "start" }} className="report-detail-layout">

        {/* Form Panel */}
        <div className="portal-card" style={{ padding: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem", color: "var(--color-gray-900)" }}>
            {editingId ? "📝 Sunting Detail Silabus" : "➕ Tambah Silabus Baru"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Program Kelas</label>
              <select className="form-input" value={program} onChange={e => setProgram(e.target.value)}>
                {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Nama Level / Tingkatan</label>
              <input className="form-input" placeholder="Contoh: Phonics & Vocab 1" value={levelName} onChange={e => setLevelName(e.target.value)} required />
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Estimasi Durasi / Pertemuan</label>
              <input className="form-input" placeholder="Contoh: 3 Bulan / 24 Sesi" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">URL File PDF Silabus (Opsional)</label>
              <input className="form-input" placeholder="https://..." value={syllabusPdfUrl} onChange={e => setSyllabusPdfUrl(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Topik Pembelajaran (Satu topik per baris)</label>
              <textarea className="form-input" style={{ height: "120px", padding: "0.75rem", fontFamily: "inherit" }} placeholder="Contoh:&#10;Introduction & Greetings&#10;Alphabet & Phonics Sounds&#10;Numbers 1-100" value={topicsInput} onChange={e => setTopicsInput(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: "18px", height: "18px" }} />
                <span>Aktif (Tampilkan di Kurikulum)</span>
              </label>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="submit" className="btn-portal-primary" style={{ padding: "0.6rem 1.2rem", fontWeight: "700" }} disabled={saving}>
                {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Silabus"}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="btn-portal-outline" style={{ padding: "0.6rem 1.2rem" }}>
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Panel */}
        <div className="portal-card" style={{ padding: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem", color: "var(--color-gray-900)" }}>
            Daftar Kurikulum & Silabus (Database Supabase)
          </h3>

          {loading ? (
            <p style={{ color: "var(--color-gray-400)", textAlign: "center", padding: "2rem" }}>Memuat daftar silabus...</p>
          ) : curriculums.length === 0 ? (
            <p style={{ color: "var(--color-gray-400)", textAlign: "center", padding: "2rem" }}>Belum ada data silabus di Supabase.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="portal-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "10px" }}>Program & Level</th>
                    <th style={{ textAlign: "left", padding: "10px", width: "120px" }}>Durasi</th>
                    <th style={{ textAlign: "center", padding: "10px", width: "80px" }}>Topik</th>
                    <th style={{ textAlign: "center", padding: "10px", width: "80px" }}>Status</th>
                    <th style={{ textAlign: "right", padding: "10px", width: "140px" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {curriculums.map((c) => (
                    <tr key={c.id} style={{ borderBottom: "1px solid var(--color-gray-100)" }}>
                      <td style={{ padding: "10px" }}>
                        <div style={{ fontWeight: "700", color: "var(--color-gray-900)" }}>{c.level_name}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: "600" }}>{c.program}</div>
                      </td>
                      <td style={{ padding: "10px" }}>{c.duration || "-"}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        {Array.isArray(c.topics) ? c.topics.length : 0} topik
                      </td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        <span className={`badge-${c.is_active ? "success" : "danger"}`} style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                          {c.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td style={{ padding: "10px", textAlign: "right" }}>
                        <button onClick={() => handleEditClick(c)} className="btn-portal-outline" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem", marginRight: "0.5rem" }}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="btn-portal-outline" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem", color: "var(--color-red)", borderColor: "rgba(239, 68, 68, 0.2)" }}>
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
