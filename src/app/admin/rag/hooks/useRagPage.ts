"use client";

import { useState, useEffect } from "react";
import { useDynamicIsland } from "@/app/admin/context/DynamicIslandContext";

export interface RAGDocument { id: string; title: string; content: string; source?: string; }
export interface ToastState { title: string; message: string; type: "success" | "error" | "info"; }

export function useRagPage() {
  const island = useDynamicIsland();
  const [documents, setDocuments] = useState<RAGDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [tableMissing, setTableMissing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [source, setSource] = useState<string>("manual");

  const showToast = (title: string, message: string, type: "success" | "error" | "info" = "success") => {
    if (type === "success") {
      island.success(title, message);
    } else if (type === "error") {
      island.error(title, message);
    } else {
      island.info(title, message);
    }
  };

  const fetchDocuments = async (): Promise<void> => {
    try {
      const res = await fetch("/api/admin/rag-documents");
      const result = await res.json();
      if (res.ok) { setDocuments(result.data || []); setTableMissing(false); }
      else { if (result.isTableMissing) setTableMissing(true); else showToast("Gagal Memuat Data", result.error, "error"); }
    } catch { showToast("Koneksi Eror", "Gagal menghubungkan ke server basis pengetahuan.", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    setTimeout(() => { setMounted(true); fetchDocuments(); }, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { showToast("Data Tidak Lengkap", "Judul dan isi dokumen wajib diisi.", "error"); return; }
    setSaving(true);
    try {
      const payload = { title: title.trim(), content: content.trim(), source, metadata: { last_updated_by: "admin", updated_at: new Date().toISOString() } };
      const res = await fetch("/api/admin/rag-documents", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload) });
      const result = await res.json();
      if (res.ok) {
        setTitle(""); setContent(""); setSource("manual"); setEditingId(null);
        fetchDocuments();
        showToast(editingId ? "Perubahan Disimpan" : "Dokumen Ditambahkan", editingId ? "Dokumen pengetahuan berhasil diperbarui." : "Dokumen baru berhasil didaftarkan ke basis data AI.", "success");
      } else showToast("Gagal Menyimpan", result.error, "error");
    } catch { showToast("Kesalahan Sistem", "Terjadi kegagalan saat mengirim data ke server.", "error"); }
    finally { setSaving(false); }
  };

  const handleEditClick = (doc: RAGDocument) => {
    setEditingId(doc.id); setTitle(doc.title); setContent(doc.content); setSource(doc.source || "manual");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => { setEditingId(null); setTitle(""); setContent(""); setSource("manual"); };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Apakah Anda yakin ingin menghapus dokumen AI ini? Hal ini akan menghilangkan pengetahuan chatbot terkait informasi ini.")) return;
    try {
      const res = await fetch(`/api/admin/rag-documents?id=${id}`, { method: "DELETE" });
      if (res.ok) { fetchDocuments(); showToast("Dokumen Dihapus", "Informasi pengetahuan telah dihapus secara permanen.", "success"); if (editingId === id) handleCancelEdit(); }
      else { const result = await res.json(); showToast("Gagal Menghapus", result.error, "error"); }
    } catch { showToast("Kesalahan Sistem", "Gagal memproses permintaan penghapusan.", "error"); }
  };

  const handleCopySql = (sqlCode: string) => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    showToast("SQL Disalin", "Kueri setup tabel telah disalin ke clipboard.", "info");
    setTimeout(() => setCopied(false), 3000);
  };

  return {
    documents, loading, saving, tableMissing, copied, mounted,
    editingId, title, setTitle, content, setContent, source, setSource,
    handleSubmit, handleEditClick, handleCancelEdit, handleDelete, handleCopySql, fetchDocuments,
  };
}
