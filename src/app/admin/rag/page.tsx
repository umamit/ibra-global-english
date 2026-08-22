"use client";

export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import { useRagPage } from "./hooks/useRagPage";

const SOURCES = [
  { value: "manual", label: "Manual (Umum)" },
  { value: "faq", label: "FAQ (Tanya Jawab)" },
  { value: "course_material", label: "Materi Kelas" },
  { value: "website", label: "Website Resmi" },
  { value: "other", label: "Lain-lain" },
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
RETURNS TABLE (id UUID, title TEXT, content TEXT, source TEXT, metadata JSONB, similarity float)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT rag_documents.id, rag_documents.title, rag_documents.content,
    rag_documents.source, rag_documents.metadata,
    1 - (rag_documents.embedding <=> query_embedding) AS similarity
  FROM rag_documents
  WHERE 1 - (rag_documents.embedding <=> query_embedding) > match_threshold
  ORDER BY rag_documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;`;

export default function AdminRAGPage() {
  const {
    documents, loading, saving, tableMissing, copied, mounted,
    editingId, title, setTitle, content, setContent, source, setSource,
    handleSubmit, handleEditClick, handleCancelEdit, handleDelete, handleCopySql, fetchDocuments,
  } = useRagPage();

  if (!mounted) {
    return <div className="dashboard-main" style={{ padding: "2rem", color: "var(--color-gray-500)", textAlign: "center" }}><p>Memuat basis pengetahuan AI...</p></div>;
  }

  return (
    <div className="dashboard-main" style={{ padding: "2rem", position: "relative" }}>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes slideIn{from{transform:translateY(-1rem) scale(.95);opacity:0}to{transform:none;opacity:1}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes pulseBorder{0%,100%{border-color:rgba(239,68,68,.4);box-shadow:none}50%{border-color:rgba(239,68,68,.8);box-shadow:0 0 12px 3px rgba(239,68,68,.15)}}.animate-slide-in{animation:slideIn .35s cubic-bezier(.16,1,.3,1) forwards}.pulse-error-box{animation:pulseBorder 2.5s infinite ease-in-out}` }} />

      {/* Setup Required Screen */}
      {tableMissing ? (
        <div style={{ maxWidth: "900px", margin: "1.5rem auto", animation: "fadeIn 0.4s ease-out" }}>
          <div className="pulse-error-box" style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "2.5rem", border: "1px solid rgba(239,68,68,.4)", boxShadow: "0 10px 30px rgba(0,0,0,.04)" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#111827", margin: "0 0 0.5rem 0" }}>Tabel Database RAG Belum Aktif</h2>
            <p style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: "1.6" }}>Tabel <code>rag_documents</code> atau fungsi pgvector belum terpasang di Supabase Anda.</p>
            <ol style={{ paddingLeft: "1.25rem", fontSize: "0.9rem", color: "#4b5563", lineHeight: "1.7" }}>
              <li>Buka dashboard <strong>Supabase</strong> Anda.</li>
              <li>Pilih <strong>SQL Editor</strong> → <strong>New Query</strong>.</li>
              <li>Salin skrip SQL di bawah, tempel, lalu klik <strong>Run</strong>.</li>
            </ol>
            <div style={{ position: "relative", marginBottom: "2rem" }}>
              <button type="button" onClick={() => handleCopySql(SQL_SETUP_CODE)} style={{ position: "absolute", top: "0.75rem", right: "0.75rem", zIndex: 5, backgroundColor: copied ? "#16a34a" : "#1f2937", color: "#fff", border: "none", padding: "0.45rem 0.9rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "750" }}>
                {copied ? "Disalin!" : "Salin SQL"}
              </button>
              <pre style={{ backgroundColor: "#0f172a", color: "#cbd5e1", padding: "1.25rem", borderRadius: "10px", fontSize: "0.8rem", overflowX: "auto", maxHeight: "220px", margin: 0, border: "1px solid #334155" }}>
                <code>{SQL_SETUP_CODE}</code>
              </pre>
            </div>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <button onClick={fetchDocuments} className="btn-portal-primary" style={{ padding: "0.75rem 1.5rem", fontWeight: "800", borderRadius: "10px" }}>Konfirmasi &amp; Muat Ulang</button>
              <Link href="/admin" className="btn-portal-outline" style={{ color: "#4b5563", fontSize: "0.875rem", fontWeight: "600", textDecoration: "none" }}>Kembali ke Dashboard</Link>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ animation: "fadeIn 0.3s ease-out" }}>
          <div className="dashboard-topbar" style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>Basis Pengetahuan Chatbot AI</h1>
            <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>Kelola dokumen, jadwal, artikel penting, dan pengetahuan penunjang yang dipelajari dan dijawab oleh Chatbot AI.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "2rem", alignItems: "start" }} className="report-detail-layout">
            {/* Form */}
            <div className="portal-card" style={{ padding: "2rem", borderRadius: "12px", border: "1px solid var(--color-gray-100)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem", color: "var(--color-gray-900)" }}>
                {editingId ? "Sunting Pengetahuan AI" : "Tambah Informasi Pengetahuan AI"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: "1.1rem" }}>
                  <label className="form-label">Judul Topik Pengetahuan</label>
                  <input className="form-input" placeholder="Contoh: Lokasi & Jam Operasional Ibra" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ borderRadius: "8px" }} />
                </div>
                <div className="form-group" style={{ marginBottom: "1.1rem" }}>
                  <label className="form-label">Sumber Kategori</label>
                  <select className="form-input" value={source} onChange={(e) => setSource(e.target.value)} style={{ borderRadius: "8px" }}>
                    {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                  <label className="form-label">Isi Konten Informasi</label>
                  <textarea className="form-input" style={{ height: "200px", padding: "0.75rem", fontFamily: "inherit", lineHeight: "1.6", borderRadius: "8px" }} placeholder="Jelaskan informasi secara detail untuk AI..." value={content} onChange={(e) => setContent(e.target.value)} required />
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button type="submit" className="btn-portal-primary" style={{ padding: "0.7rem 1.4rem", fontWeight: "750", borderRadius: "8px" }} disabled={saving}>
                    {saving ? "Menyimpan data..." : editingId ? "Simpan Perubahan" : "Simpan Dokumen"}
                  </button>
                  {editingId && <button type="button" onClick={handleCancelEdit} className="btn-portal-outline" style={{ padding: "0.7rem 1.4rem", borderRadius: "8px" }}>Batal</button>}
                </div>
              </form>
            </div>

            {/* List */}
            <div className="portal-card" style={{ padding: "2rem", borderRadius: "12px", border: "1px solid var(--color-gray-100)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem", color: "var(--color-gray-900)" }}>Artikel Pengetahuan AI Aktif</h3>
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
                        <tr key={d.id} style={{ borderBottom: "1px solid var(--color-gray-100)" }} className="table-row-hover">
                          <td style={{ padding: "12px 10px" }}>
                            <div style={{ fontWeight: "700", color: "var(--color-gray-900)", marginBottom: "0.25rem" }}>{d.title}</div>
                            <div style={{ fontSize: "0.825rem", color: "var(--color-gray-500)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: "1.5" }}>{d.content}</div>
                          </td>
                          <td style={{ padding: "12px 10px", verticalAlign: "middle" }}>
                            <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", borderRadius: "6px", backgroundColor: "var(--color-primary-light, #f0f7ff)", color: "var(--color-primary, #0284c7)", fontWeight: "700" }}>
                              {SOURCES.find((s) => s.value === d.source)?.label || d.source}
                            </span>
                          </td>
                          <td style={{ padding: "12px 10px", textAlign: "right", verticalAlign: "middle" }}>
                            <button onClick={() => handleEditClick(d)} className="btn-portal-outline" style={{ fontSize: "0.775rem", padding: "0.35rem 0.65rem", marginRight: "0.4rem", borderRadius: "6px" }}>Edit</button>
                            <button onClick={() => handleDelete(d.id)} className="btn-portal-outline" style={{ fontSize: "0.775rem", padding: "0.35rem 0.65rem", color: "var(--color-red,#ef4444)", borderColor: "rgba(239,68,68,.2)", borderRadius: "6px" }}>Hapus</button>
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
