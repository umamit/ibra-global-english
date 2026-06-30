"use client";

export const dynamic = 'force-dynamic';

import React from 'react';
import { useState, useEffect } from "react";
import Link from "next/link";

interface RAGDocument {
  id: string;
  title: string;
  content: string;
  source?: string;
}

interface Source {
  value: string;
  label: string;
}

const SOURCES: Source[] = [
  { value: "manual", label: "Manual (Umum)" },
  { value: "faq", label: "FAQ (Tanya Jawab)" },
  { value: "course_material", label: "Materi Kelas" },
  { value: "website", label: "Website Resmi" },
  { value: "other", label: "Lain-lain" }
];

export default function AdminRAGPage() {
  const [documents, setDocuments] = useState<RAGDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<string>("");
  const [tableMissing, setTableMissing] = useState<boolean>(false);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [source, setSource] = useState<string>("manual");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const fetchDocuments = async (): Promise<void> => {
    try {
      const res = await fetch("/api/admin/rag-documents");
      const result = await res.json();
      if (res.ok) {
        setDocuments(result.data || []);
        setTableMissing(false);
      } else {
        if (result.isTableMissing) {
          setTableMissing(true);
        } else {
          showToast(`Gagal memuat: ${result.error}`);
        }
      }
    } catch (err) {
      showToast("Gagal mengambil basis pengetahuan AI.");
    } finally {
      setLoading(false);
    }
  };

  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    fetchDocuments();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast("Judul dan Isi Dokumen wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        source,
        metadata: {
          last_updated_by: "admin",
          updated_at: new Date().toISOString()
        }
      };

      let res: Response;
      if (editingId) {
        res = await fetch("/api/admin/rag-documents", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
      } else {
        res = await fetch("/api/admin/rag-documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const result = await res.json();
      if (res.ok) {
        setTitle("");
        setContent("");
        setSource("manual");
        setEditingId(null);
        fetchDocuments();
        showToast(editingId ? "Dokumen AI berhasil disunting! ✅" : "Dokumen AI baru berhasil ditambahkan! ✅");
      } else {
        showToast(`Error: ${result.error}`);
      }
    } catch (err) {
      showToast("Gagal menyimpan dokumen AI.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (doc: RAGDocument) => {
    setEditingId(doc.id);
    setTitle(doc.title);
    setContent(doc.content);
    setSource(doc.source || "manual");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setSource("manual");
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Apakah Anda yakin ingin menghapus dokumen AI ini? Hal ini akan menghilangkan pengetahuan chatbot terkait informasi ini.")) return;
    try {
      const res = await fetch(`/api/admin/rag-documents?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchDocuments();
        showToast("Dokumen AI berhasil dihapus.");
        if (editingId === id) handleCancelEdit();
      } else {
        const result = await res.json();
        showToast(`Error: ${result.error}`);
      }
    } catch (err) {
      showToast("Gagal menghapus dokumen AI.");
    }
  };

  if (!mounted) {
    return (
      <div className="dashboard-main" style={{ padding: "2rem", color: "var(--color-gray-500)", textAlign: "center" }}>
        <p>Memuat basis pengetahuan AI...</p>
      </div>
    );
  }

  if (tableMissing) {
    return (
      <div className="dashboard-main" style={{ padding: "2rem" }}>
        <div className="portal-card" style={{ padding: "2.5rem", borderLeft: "5px solid var(--color-red, #ef4444)", maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "#b91c1c", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>⚠️</span> Database RAG Belum Siap
          </h2>
          <p style={{ color: "var(--color-gray-700)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
            Tabel database <code>rag_documents</code> atau fungsi pencarian vector belum terpasang di database Supabase Anda. Ikuti petunjuk di bawah ini untuk mengaktifkannya secara gratis:
          </p>

          <div style={{ background: "var(--color-gray-50, #f9fafb)", padding: "1.25rem", borderRadius: "8px", border: "1px solid var(--color-gray-200)", marginBottom: "1.5rem" }}>
            <h3 style={{ fontWeight: "800", fontSize: "0.9rem", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>💡 Solusi Cepat (Supabase Dashboard):</h3>
            <ol style={{ paddingLeft: "1.25rem", margin: 0, fontSize: "0.875rem", color: "var(--color-gray-600)", lineHeight: "1.7" }}>
              <li>Buka proyek Supabase Anda di web browser.</li>
              <li>Pilih menu <strong>SQL Editor</strong> di panel bilah kiri.</li>
              <li>Klik <strong>New Query</strong> (Kueri Baru).</li>
              <li>Salin dan tempel isi berkas SQL <code>supabase_rag_documents.sql</code> yang ada di folder root proyek ini.</li>
              <li>Klik tombol <strong>Run</strong> di kanan bawah untuk membuat tabel dan fungsi pencariannya secara gratis.</li>
            </ol>
          </div>

          <p style={{ color: "var(--color-gray-500)", fontSize: "0.85rem", margin: 0 }}>
            *Setelah Anda menjalankan SQL tersebut di Supabase, silakan muat ulang halaman ini untuk mulai mengelola basis pengetahuan AI.*
          </p>
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
            <button onClick={fetchDocuments} className="btn-portal-primary" style={{ padding: "0.6rem 1.2rem", fontWeight: "700" }}>
              🔄 Muat Ulang Halaman
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main" style={{ padding: "2rem" }}>
      {toast && (
        <div className="auth-success-banner" style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 9999, maxWidth: "380px" }}>
          {toast}
        </div>
      )}

      <div className="dashboard-topbar" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>🤖 Basis Pengetahuan Chatbot AI</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Kelola artikel, informasi, dan dokumen pengetahuan yang dipelajari dan dijawab oleh Chatbot AI.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "2rem", alignItems: "start" }} className="report-detail-layout">

        {/* Form Panel */}
        <div className="portal-card" style={{ padding: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem", color: "var(--color-gray-900)" }}>
            {editingId ? "📝 Sunting Pengetahuan AI" : "➕ Tambah Informasi Pengetahuan AI"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Judul Topik Pengetahuan</label>
              <input className="form-input" placeholder="Contoh: Lokasi & Jam Operasional Ibra" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Sumber Kategori</label>
              <select className="form-input" value={source} onChange={e => setSource(e.target.value)}>
                {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">Isi Konten Informasi (Penjelasan Detail untuk AI)</label>
              <textarea className="form-input" style={{ height: "200px", padding: "0.75rem", fontFamily: "inherit", lineHeight: "1.6" }} placeholder="Contoh:&#10;Kantor Ibra Global English Bobong berlokasi di Jl. TPU Bobong Komp. Fangahu, Lantai 1 Kost Fitrah. Buka setiap hari Senin hingga Sabtu pukul 14:00 - 18:00 WIT. Hari Minggu libur." value={content} onChange={e => setContent(e.target.value)} required />
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="submit" className="btn-portal-primary" style={{ padding: "0.6rem 1.2rem", fontWeight: "700" }} disabled={saving}>
                {saving ? "Memproses Embedding & Simpan..." : editingId ? "Simpan Perubahan" : "Simpan & Generate Embedding"}
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
            Artikel Pengetahuan AI Aktif (pgvector Database)
          </h3>

          {loading ? (
            <p style={{ color: "var(--color-gray-400)", textAlign: "center", padding: "2rem" }}>Memuat basis pengetahuan AI...</p>
          ) : documents.length === 0 ? (
            <p style={{ color: "var(--color-gray-400)", textAlign: "center", padding: "2rem" }}>Belum ada data dokumen AI di database.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="portal-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "10px" }}>Judul Topik</th>
                    <th style={{ textAlign: "left", padding: "10px", width: "120px" }}>Sumber</th>
                    <th style={{ textAlign: "right", padding: "10px", width: "140px" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((d) => (
                    <tr key={d.id} style={{ borderBottom: "1px solid var(--color-gray-100)" }}>
                      <td style={{ padding: "10px" }}>
                        <div style={{ fontWeight: "700", color: "var(--color-gray-900)" }}>{d.title}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{d.content}</div>
                      </td>
                      <td style={{ padding: "10px" }}>
                        <span className="badge-primary" style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px", backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)", fontWeight: "600" }}>
                          {SOURCES.find(s => s.value === d.source)?.label || d.source}
                        </span>
                      </td>
                      <td style={{ padding: "10px", textAlign: "right" }}>
                        <button onClick={() => handleEditClick(d)} className="btn-portal-outline" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem", marginRight: "0.5rem" }}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(d.id)} className="btn-portal-outline" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem", color: "var(--color-red)", borderColor: "rgba(239, 68, 68, 0.2)" }}>
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
