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

interface ToastState {
  title: string;
  message: string;
  type: "success" | "error" | "info";
}

const SOURCES: Source[] = [
  { value: "manual", label: "Manual (Umum)" },
  { value: "faq", label: "FAQ (Tanya Jawab)" },
  { value: "course_material", label: "Materi Kelas" },
  { value: "website", label: "Website Resmi" },
  { value: "other", label: "Lain-lain" }
];

const SQL_SETUP_CODE = `-- 1. Aktifkan ekstensi pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Tabel dokumen untuk RAG
CREATE TABLE IF NOT EXISTS public.rag_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'faq', 'course_material', 'website', 'other')),
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding vector(384),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Fungsi similarity search (cosine distance)
CREATE OR REPLACE FUNCTION public.search_rag_documents(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  source TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rag_documents.id,
    rag_documents.title,
    rag_documents.content,
    rag_documents.source,
    rag_documents.metadata,
    1 - (rag_documents.embedding <=> query_embedding) AS similarity
  FROM rag_documents
  WHERE 1 - (rag_documents.embedding <=> query_embedding) > match_threshold
  ORDER BY rag_documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;`;

export default function AdminRAGPage() {
  const [documents, setDocuments] = useState<RAGDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [tableMissing, setTableMissing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [source, setSource] = useState<string>("manual");

  const showToast = (title: string, message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4000);
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
          showToast("Gagal Memuat Data", result.error, "error");
        }
      }
    } catch (err) {
      showToast("Koneksi Eror", "Gagal menghubungkan ke server basis pengetahuan.", "error");
    } finally {
      setLoading(false);
    }
  };

  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      fetchDocuments();
    }, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast("Data Tidak Lengkap", "Judul dan isi dokumen wajib diisi.", "error");
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
        showToast(
          editingId ? "Perubahan Disimpan" : "Dokumen Ditambahkan",
          editingId ? "Dokumen pengetahuan berhasil diperbarui." : "Dokumen baru berhasil didaftarkan ke basis data AI.",
          "success"
        );
      } else {
        showToast("Gagal Menyimpan", result.error, "error");
      }
    } catch (err) {
      showToast("Kesalahan Sistem", "Terjadi kegagalan saat mengirim data ke server.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (doc: RAGDocument) => {
    setEditingId(doc.id);
    setTitle(doc.title);
    setContent(doc.content);
    setSource(doc.source || "manual");
    // Scroll smoothly to form on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        showToast("Dokumen Dihapus", "Informasi pengetahuan telah dihapus secara permanen.", "success");
        if (editingId === id) handleCancelEdit();
      } else {
        const result = await res.json();
        showToast("Gagal Menghapus", result.error, "error");
      }
    } catch (err) {
      showToast("Kesalahan Sistem", "Gagal memproses permintaan penghapusan.", "error");
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SETUP_CODE);
    setCopied(true);
    showToast("SQL Disalin", "Kueri setup tabel telah disalin ke clipboard.", "info");
    setTimeout(() => setCopied(false), 3000);
  };

  if (!mounted) {
    return (
      <div className="dashboard-main" style={{ padding: "2rem", color: "var(--color-gray-500)", textAlign: "center" }}>
        <p>Memuat basis pengetahuan AI...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-main" style={{ padding: "2rem", position: "relative" }}>
      {/* Dynamic Keyframes Styles injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideIn {
          from { transform: translateY(-1rem) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulseBorder {
          0% { border-color: rgba(239, 68, 68, 0.4); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.1); }
          50% { border-color: rgba(239, 68, 68, 0.8); box-shadow: 0 0 12px 3px rgba(239, 68, 68, 0.15); }
          100% { border-color: rgba(239, 68, 68, 0.4); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.1); }
        }
        .animate-slide-in {
          animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .pulse-error-box {
          animation: pulseBorder 2.5s infinite ease-in-out;
        }
      `}} />

      {/* Premium Toast Notification System */}
      {toast && (
        <div 
          className="animate-slide-in"
          style={{
            position: "fixed",
            top: "2rem",
            right: "2rem",
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-start",
            gap: "0.875rem",
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            backgroundColor: toast.type === "success" ? "rgba(240, 253, 244, 0.95)" : toast.type === "error" ? "rgba(254, 242, 242, 0.95)" : "rgba(240, 249, 255, 0.95)",
            border: `1px solid ${toast.type === "success" ? "#bbf7d0" : toast.type === "error" ? "#fecaca" : "#bae6fd"}`,
            boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 8px 12px -6px rgba(0, 0, 0, 0.08)",
            backdropFilter: "blur(12px)",
            maxWidth: "400px",
          }}
        >
          <div style={{ flexShrink: 0, marginTop: "0.15rem" }}>
            {toast.type === "success" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            ) : toast.type === "error" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            )}
          </div>
          <div style={{ flexGrow: 1 }}>
            <h4 style={{ margin: 0, fontSize: "0.875rem", fontWeight: "800", color: toast.type === "success" ? "#14532d" : toast.type === "error" ? "#7f1d1d" : "#0c4a6e" }}>
              {toast.title}
            </h4>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: toast.type === "success" ? "#166534" : toast.type === "error" ? "#991b1b" : "#0369a1", lineHeight: "1.4" }}>
              {toast.message}
            </p>
          </div>
          <button 
            onClick={() => setToast(null)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.125rem",
              color: "var(--color-gray-400)",
              marginLeft: "0.5rem"
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {/* RAG DB SETUP REQUIRED SCREEN (Styled with premium alerts & copying workflow) */}
      {tableMissing ? (
        <div style={{ maxWidth: "900px", margin: "1.5rem auto", animation: "fadeIn 0.4s ease-out" }}>
          <div 
            className="pulse-error-box"
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              padding: "2.5rem",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)"
            }}
          >
            <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div style={{
                backgroundColor: "#fee2e2",
                borderRadius: "50%",
                padding: "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#dc2626",
                flexShrink: 0
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#111827", margin: "0 0 0.5rem 0" }}>
                  Tabel Database RAG Belum Aktif
                </h2>
                <p style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
                  Aplikasi mendeteksi bahwa tabel <code>rag_documents</code> atau fungsi pendukung kemiripan vector (pgvector) belum terpasang di database Supabase Anda. Ikuti panduan pemasangan cepat di bawah ini.
                </p>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#1f2937", marginBottom: "0.75rem" }}>
                🛠️ Langkah Aktivasi (Gratis & Instan):
              </h3>
              <ol style={{ paddingLeft: "1.25rem", margin: 0, fontSize: "0.9rem", color: "#4b5563", lineHeight: "1.7" }}>
                <li>Buka dashboard proyek <strong>Supabase</strong> Anda di browser.</li>
                <li>Pilih tab <strong>SQL Editor</strong> di bilah menu navigasi sebelah kiri.</li>
                <li>Klik tombol <strong>New Query</strong> untuk membuka lembar editor kueri baru.</li>
                <li>Salin skrip SQL di bawah ini, tempelkan ke editor Supabase, lalu klik tombol <strong>Run</strong>.</li>
              </ol>
            </div>

            {/* Premium SQL Code Viewer Panel */}
            <div style={{ position: "relative", marginBottom: "2rem" }}>
              <div style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                zIndex: 5
              }}>
                <button
                  type="button"
                  onClick={handleCopySql}
                  style={{
                    backgroundColor: copied ? "#16a34a" : "#1f2937",
                    color: "#fff",
                    border: "none",
                    padding: "0.45rem 0.9rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: "750",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    transition: "all 0.2s"
                  }}
                >
                  {copied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      Disalin!
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      Salin SQL
                    </>
                  )}
                </button>
              </div>
              <pre style={{
                backgroundColor: "#0f172a",
                color: "#cbd5e1",
                padding: "1.25rem",
                borderRadius: "10px",
                fontSize: "0.8rem",
                lineHeight: "1.5",
                overflowX: "auto",
                fontFamily: "var(--font-mono, 'Courier New', Courier, monospace)",
                maxHeight: "220px",
                margin: 0,
                border: "1px solid #334155"
              }}>
                <code>{SQL_SETUP_CODE}</code>
              </pre>
            </div>

            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <button 
                onClick={fetchDocuments}
                className="btn-portal-primary"
                style={{
                  padding: "0.75rem 1.5rem",
                  fontWeight: "800",
                  borderRadius: "10px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
                }}
              >
                🔄 Konfirmasi & Muat Ulang Halaman
              </button>
              <Link 
                href="/admin" 
                style={{ color: "#4b5563", fontSize: "0.875rem", fontWeight: "600", textDecoration: "none" }}
                className="btn-portal-outline"
              >
                Kembali ke Dashboard
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ animation: "fadeIn 0.3s ease-out" }}>
          {/* Header block */}
          <div className="dashboard-topbar" style={{ marginBottom: "2rem" }}>
            <div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>🤖 Basis Pengetahuan Chatbot AI</h1>
              <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
                Kelola dokumen, jadwal, artikel penting, dan pengetahuan penunjang yang dipelajari dan dijawab oleh Chatbot AI.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "2rem", alignItems: "start" }} className="report-detail-layout">
            
            {/* Form Panel */}
            <div className="portal-card" style={{ padding: "2rem", borderRadius: "12px", border: "1px solid var(--color-gray-100)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem", color: "var(--color-gray-900)" }}>
                {editingId ? "📝 Sunting Pengetahuan AI" : "➕ Tambah Informasi Pengetahuan AI"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: "1.1rem" }}>
                  <label className="form-label">Judul Topik Pengetahuan</label>
                  <input 
                    className="form-input" 
                    placeholder="Contoh: Lokasi & Jam Operasional Ibra" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required 
                    style={{ borderRadius: "8px" }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "1.1rem" }}>
                  <label className="form-label">Sumber Kategori</label>
                  <select 
                    className="form-input" 
                    value={source} 
                    onChange={e => setSource(e.target.value)}
                    style={{ borderRadius: "8px" }}
                  >
                    {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                  <label className="form-label">Isi Konten Informasi (Penjelasan Detail untuk AI)</label>
                  <textarea 
                    className="form-input" 
                    style={{ height: "200px", padding: "0.75rem", fontFamily: "inherit", lineHeight: "1.6", borderRadius: "8px" }} 
                    placeholder="Contoh:&#10;Kantor Ibra Global English Bobong berlokasi di Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001, Bobong, Taliabu Barat, Kabupaten Pulau Taliabu, Maluku Utara 97794. Buka setiap hari Senin hingga Sabtu pukul 14:00 - 18:00 WIT. Hari Minggu libur." 
                    value={content} 
                    onChange={e => setContent(e.target.value)} 
                    required 
                  />
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button 
                    type="submit" 
                    className="btn-portal-primary" 
                    style={{ padding: "0.7rem 1.4rem", fontWeight: "750", borderRadius: "8px" }} 
                    disabled={saving}
                  >
                    {saving ? "Menyimpan data..." : editingId ? "Simpan Perubahan" : "Simpan Dokumen"}
                  </button>
                  {editingId && (
                    <button 
                      type="button" 
                      onClick={handleCancelEdit} 
                      className="btn-portal-outline" 
                      style={{ padding: "0.7rem 1.4rem", borderRadius: "8px" }}
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List Panel */}
            <div className="portal-card" style={{ padding: "2rem", borderRadius: "12px", border: "1px solid var(--color-gray-100)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem", color: "var(--color-gray-900)" }}>
                Artikel Pengetahuan AI Aktif (Database Supabase)
              </h3>

              {loading ? (
                <p style={{ color: "var(--color-gray-400)", textAlign: "center", padding: "3rem" }}>Memuat basis pengetahuan AI...</p>
              ) : documents.length === 0 ? (
                <p style={{ color: "var(--color-gray-400)", textAlign: "center", padding: "3rem", fontSize: "0.9rem" }}>Belum ada data dokumen AI di database.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="portal-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--color-gray-100)" }}>
                        <th style={{ textAlign: "left", padding: "12px 10px", color: "var(--color-gray-600)", fontWeight: "800" }}>Judul Topik</th>
                        <th style={{ textAlign: "left", padding: "12px 10px", width: "130px", color: "var(--color-gray-600)", fontWeight: "800" }}>Sumber</th>
                        <th style={{ textAlign: "right", padding: "12px 10px", width: "135px", color: "var(--color-gray-600)", fontWeight: "800" }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((d) => (
                        <tr key={d.id} style={{ borderBottom: "1px solid var(--color-gray-100)", transition: "background 0.2s" }} className="table-row-hover">
                          <td style={{ padding: "12px 10px" }}>
                            <div style={{ fontWeight: "700", color: "var(--color-gray-900)", marginBottom: "0.25rem" }}>{d.title}</div>
                            <div style={{ fontSize: "0.825rem", color: "var(--color-gray-500)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: "1.5" }}>{d.content}</div>
                          </td>
                          <td style={{ padding: "12px 10px", verticalAlign: "middle" }}>
                            <span style={{ 
                              fontSize: "0.75rem", 
                              padding: "0.25rem 0.5rem", 
                              borderRadius: "6px", 
                              backgroundColor: "var(--color-primary-light, #f0f7ff)", 
                              color: "var(--color-primary, #0284c7)", 
                              fontWeight: "700" 
                            }}>
                              {SOURCES.find(s => s.value === d.source)?.label || d.source}
                            </span>
                          </td>
                          <td style={{ padding: "12px 10px", textAlign: "right", verticalAlign: "middle" }}>
                            <button 
                              onClick={() => handleEditClick(d)} 
                              className="btn-portal-outline" 
                              style={{ fontSize: "0.775rem", padding: "0.35rem 0.65rem", marginRight: "0.4rem", borderRadius: "6px" }}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(d.id)} 
                              className="btn-portal-outline" 
                              style={{ 
                                fontSize: "0.775rem", 
                                padding: "0.35rem 0.65rem", 
                                color: "var(--color-red, #ef4444)", 
                                borderColor: "rgba(239, 68, 68, 0.2)",
                                borderRadius: "6px"
                              }}
                            >
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
      )}
    </div>
  );
}
