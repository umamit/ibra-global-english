"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PartnershipSubmission } from "@/app/api/admin/kemitraan/route";
import { cleanPhoneNumber } from "@/utils/formatters";
import { SITE_CONFIG } from "@/config/siteConfig";
import KemitraanSubmissionTable from "./KemitraanSubmissionTable";

export default function KemitraanAdminClient() {
  const [submissions, setSubmissions] = useState<PartnershipSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [proposalPdfUrl, setProposalPdfUrl] = useState<string>("/docs/Proposal_Kemitraan_Ibra_Global_English.pdf");
  const [editingPdfUrl, setEditingPdfUrl] = useState<string>("");
  const [isEditingPdf, setIsEditingPdf] = useState<boolean>(false);
  const [selectedSub, setSelectedSub] = useState<PartnershipSubmission | null>(null);
  const [printLetterNo, setPrintLetterNo] = useState<string>(`012/SK/IGE-BBG/${new Date().getFullYear()}`);

  const fetchSubmissions = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/kemitraan", { cache: "no-store" });
      const result = await res.json();
      if (result.data) setSubmissions(result.data);
    } catch { setError("Gagal menghubungkan ke server."); } finally { setLoading(false); }
  };

  useEffect(() => { fetchSubmissions(); const saved = localStorage.getItem("proposal_pdf_url"); if (saved) setProposalPdfUrl(saved); }, []);

  const handleUpdateStatus = async (id: string, newStatus: PartnershipSubmission["status"]) => {
    try {
      const res = await fetch("/api/admin/kemitraan", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: newStatus }) });
      const result = await res.json();
      if (res.ok) { setSuccessMsg(`Status berhasil diubah ke ${newStatus.toUpperCase()}`); setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))); setTimeout(() => setSuccessMsg(""), 3000); }
      else alert(result.error || "Gagal mengubah status.");
    } catch { alert("Terjadi kesalahan koneksi."); }
  };

  const handleSavePdfUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPdfUrl) return;
    setProposalPdfUrl(editingPdfUrl); localStorage.setItem("proposal_pdf_url", editingPdfUrl); setIsEditingPdf(false); setSuccessMsg("Tautan PDF berhasil diperbarui."); setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleOpenWhatsApp = (phone: string, name: string, inst: string) => {
    const raw = cleanPhoneNumber(phone);
    window.open(`https://wa.me/${raw}?text=${encodeURIComponent(`Halo ${name} (${inst}), kami dari Direksi Ibra Global English Bobong menindaklanjuti pengajuan Kemitraan Rekomendasi Resmi sekolah Bapak/Ibu.`)}`, "_blank");
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-primary-dark, #164d57)" }}>Manajemen Kemitraan &amp; Proposal PDF</h1>
          <p style={{ fontSize: "0.88rem", color: "#666" }}>Kelola pengajuan mitra sekolah/instansi masuk dan perbarui berkas Proposal Kemitraan resmi.</p>
        </div>
        <Link href="/kemitraan" target="_blank" className="admin-btn-secondary" style={{ padding: "0.55rem 1.1rem", borderRadius: "10px", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600, background: "#eef6f8", color: "#216c7e" }}>Buka Halaman Kemitraan Publik</Link>
      </div>

      {successMsg && <div style={{ padding: "0.85rem 1.25rem", borderRadius: "10px", background: "#d1e7dd", color: "#0f5132", marginBottom: "1.25rem", fontSize: "0.9rem" }}>{successMsg}</div>}
      {error && <div style={{ padding: "0.85rem 1.25rem", borderRadius: "10px", background: "#f8d7da", color: "#842029", marginBottom: "1.25rem", fontSize: "0.9rem" }}>{error}</div>}

      <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.08)", padding: "1.5rem", marginBottom: "2rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div><h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Berkas Proposal Kemitraan PDF Aktif</h3><p style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.25rem", marginBottom: 0 }}>Berkas proposal resmi yang diakses publik dan dilampirkan ke pihak sekolah/dinas.</p></div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <a href={proposalPdfUrl} target="_blank" rel="noreferrer" style={{ padding: "0.5rem 1rem", borderRadius: "8px", background: "#216c7e", color: "#fff", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>⬇ Pratinjau / Unduh PDF</a>
            <button type="button" onClick={() => { setEditingPdfUrl(proposalPdfUrl); setIsEditingPdf(!isEditingPdf); }} style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #ccc", background: "#f8f9fa", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>{isEditingPdf ? "Batal Edit" : "Edit Tautan PDF"}</button>
          </div>
        </div>
        {isEditingPdf && (
          <form onSubmit={handleSavePdfUrl} style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px dashed #eee" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Tautan URL / Path File Proposal PDF Baru:</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input type="text" value={editingPdfUrl} onChange={(e) => setEditingPdfUrl(e.target.value)} placeholder="/docs/Proposal_Kemitraan_Ibra_Global_English.pdf" style={{ flex: 1, padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #ccc", fontSize: "0.9rem" }} />
              <button type="submit" style={{ padding: "0.6rem 1.25rem", borderRadius: "8px", background: "#164d57", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>Simpan</button>
            </div>
          </form>
        )}
      </div>

      <KemitraanSubmissionTable submissions={submissions} loading={loading} onRefresh={fetchSubmissions} onWhatsApp={handleOpenWhatsApp} onUpdateStatus={handleUpdateStatus} onSelectSub={setSelectedSub} />

      {selectedSub && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: "650px", borderRadius: "14px", padding: "2rem", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid #eee", paddingBottom: "0.75rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Pratinjau Surat Pengantar Kemitraan</h3>
              <button type="button" onClick={() => setSelectedSub(null)} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
            </div>
            <div id="print-area" style={{ border: "1px solid #ddd", padding: "1.75rem", borderRadius: "8px", background: "#fff", fontFamily: "serif", lineHeight: 1.6, color: "#111" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.25rem", borderBottom: "2px solid #164d57", paddingBottom: "0.75rem", marginBottom: "1.25rem" }}>
                <img src="/assets/logo.png" alt="Logo Ibra Global English" style={{ width: "60px", height: "auto", objectFit: "contain" }} />
                <div style={{ textAlign: "center" }}>
                  <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: "800", color: "#164d57", letterSpacing: "0.5px" }}>IBRA GLOBAL ENGLISH</h2>
                  <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "#555" }}>Bobong, Kabupaten Pulau Taliabu, Maluku Utara | WhatsApp: {SITE_CONFIG.contact.phone}</p>
                </div>
              </div>
              <div style={{ fontSize: "0.9rem" }}>
                <p><strong>Nomor Surat:</strong> {printLetterNo}</p>
                <p><strong>Hal:</strong> Permohonan Kemitraan Rekomendasi Resmi &amp; Diagnostic Test Gratis</p>
                <p><strong>Kepada Yth.</strong><br />{selectedSub.rep_name} ({selectedSub.rep_role || "Pimpinan"})<br /><strong>{selectedSub.institution_name}</strong><br />Di Tempat</p>
                <p style={{ marginTop: "1rem" }}>Dengan hormat,</p>
                <p>Sehubungan dengan komitmen Ibra Global English dalam meningkatkan mutu kemampuan bahasa Inggris generasi muda di Kabupaten Pulau Taliabu, melalui surat ini kami bermaksud mengundang <strong>{selectedSub.institution_name}</strong> untuk bergabung sebagai Mitra Rekomendasi Resmi.</p>
                <p>Kerja sama ini bersifat <strong>100% Bebas Biaya (Tanpa Anggaran Sekolah)</strong>, di mana murid-murid dari sekolah Bapak/Ibu berhak mendapatkan sesi Diagnostic Test gratis serta Voucher Potongan Pendaftaran Khusus.</p>
                <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ textAlign: "center", minWidth: "220px" }}>
                    <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.88rem" }}>
                      Bobong, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.88rem" }}>Hormat kami,</p>
                    <p style={{ margin: 0, fontWeight: "bold", fontSize: "0.9rem" }}>Direksi Ibra Global English</p>
                    <div style={{ height: "60px" }} />
                    <p style={{ margin: 0, fontWeight: "bold", fontSize: "0.95rem", textDecoration: "underline" }}>Husnita Usman, M.Pd</p>
                    <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "#444" }}>Direktur Utama</p>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button type="button" onClick={() => setSelectedSub(null)} style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>Tutup</button>
              <button type="button" onClick={() => window.print()} style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", background: "#216c7e", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>Cetak Surat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
