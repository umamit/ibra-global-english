// AdminTutorsForm.tsx - Form Tambah/Edit Tutor
import React from "react";

interface Props {
  editingId: string | null; name: string; setName: (v: string) => void;
  role: string; setRole: (v: string) => void;
  imageUrl: string; setImageUrl: (v: string) => void;
  displayOrder: number; setDisplayOrder: (v: number) => void;
  isActive: boolean; setIsActive: (v: boolean) => void;
  bio: string; setBio: (v: string) => void;
  saving: boolean; handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleCancelEdit: () => void;
}

export default function AdminTutorsForm({ editingId, name, setName, role, setRole, imageUrl, setImageUrl, displayOrder, setDisplayOrder, isActive, setIsActive, bio, setBio, saving, handleSubmit, handleCancelEdit }: Props) {
  return (
    <div className="portal-card" style={{ padding: "2rem" }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem", color: "var(--color-gray-900)", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
        {editingId ? (
          <><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><span>Sunting Profil Tutor</span></>
        ) : (
          <><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span>Tambah Tutor Baru</span></>
        )}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: "1rem" }}><label className="form-label">Nama Lengkap Tutor</label><input className="form-input" placeholder="Contoh: Ahmad, S.Pd." value={name} onChange={e => setName(e.target.value)} required /></div>
        <div className="form-group" style={{ marginBottom: "1rem" }}><label className="form-label">Peran / Spesialisasi</label><input className="form-input" placeholder="Contoh: Kids Program Specialist" value={role} onChange={e => setRole(e.target.value)} required /></div>
        <div className="form-group" style={{ marginBottom: "1rem" }}><label className="form-label">URL Foto Profil</label><input className="form-input" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} /></div>
        <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div className="form-group"><label className="form-label">Urutan Tampilan</label><input type="number" className="form-input" min="0" value={displayOrder} onChange={e => setDisplayOrder(parseInt(e.target.value) || 0)} /></div>
          <div className="form-group" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}><label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", marginTop: "1.5rem" }}><input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: "18px", height: "18px" }} /><span>Aktif (Tampil)</span></label></div>
        </div>
        <div className="form-group" style={{ marginBottom: "1.5rem" }}><label className="form-label">Biografi Singkat</label><textarea className="form-input" style={{ height: "100px", padding: "0.75rem" }} placeholder="Ceritakan latar belakang pendidikan..." value={bio} onChange={e => setBio(e.target.value)} /></div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button type="submit" className="btn-portal-primary" style={{ padding: "0.6rem 1.2rem", fontWeight: "700" }} disabled={saving}>{saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Tutor"}</button>
          {editingId && <button type="button" onClick={handleCancelEdit} className="btn-portal-outline" style={{ padding: "0.6rem 1.2rem" }}>Batal</button>}
        </div>
      </form>
    </div>
  );
}
