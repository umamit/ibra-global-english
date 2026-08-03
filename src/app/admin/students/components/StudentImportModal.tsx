"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { parseStudentCsv } from "./studentImportHelpers";

interface StudentImportModalProps { isOpen: boolean; onClose: () => void; onSuccess: () => void; }

export default function StudentImportModal({ isOpen, onClose, onSuccess }: StudentImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const csv = "nama_siswa,usia,program,status,nama_orang_tua,whatsapp\nMuhammad Rizky,8,Kids Program,aktif,Budi,081234567890\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Template_Impor_Siswa.csv");
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile); setLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = parseStudentCsv(event.target?.result as string || "");
      if (res.error) setErrorMsg(res.error); else setParsedRows(res.rows || []);
      setLoading(false);
    };
    reader.readAsText(selectedFile);
  };

  const handleImportSubmit = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return setErrorMsg("Tidak ada baris data valid.");
    setImporting(true);
    try {
      const supabase = createClient();
      const payload = validRows.map((r) => ({ name: r.name, age: r.age || 7, program: r.program, status: r.status }));
      const { error } = await supabase.from("students").insert(payload);
      if (error) throw error;
      onSuccess(); onClose();
    } catch (err: any) { setErrorMsg("Gagal mengimpor: " + err.message); } finally { setImporting(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "16px", maxWidth: "600px", width: "100%" }}>
        <h3>Impor Data Siswa CSV</h3>
        <p style={{ fontSize: "0.85rem", color: "#666" }}>Unggah berkas CSV untuk menambahkan siswa secara massal.</p>
        <div style={{ margin: "1rem 0", display: "flex", gap: "1rem" }}>
          <button onClick={handleDownloadTemplate} className="btn-portal-outline">Unduh Template CSV</button>
          <input type="file" accept=".csv,.txt" onChange={handleFileChange} />
        </div>
        {errorMsg && <p style={{ color: "#ef4444", fontSize: "0.85rem" }}>{errorMsg}</p>}
        {loading ? <p>Memproses...</p> : parsedRows.length > 0 && <p>Terbaca {parsedRows.length} siswa ({parsedRows.filter(r => r.isValid).length} valid)</p>}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
          <button onClick={handleImportSubmit} className="btn-portal-primary" disabled={importing || parsedRows.filter(r => r.isValid).length === 0}>{importing ? "Mengimpor..." : "Proses Impor"}</button>
          <button onClick={onClose} className="btn-portal-outline">Batal</button>
        </div>
      </div>
    </div>
  );
}
