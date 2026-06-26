"use client";

export default function StudentFormModal({ open, editing, name, age, program, parentId, parents, errorMsg, submitting, onNameChange, onAgeChange, onProgramChange, onParentIdChange, onClose, onSubmit }) {
  if (!open) return null;

  return (
    <div className="portal-modal-overlay">
      <div className="portal-modal">
        <div className="portal-modal-header">
          <h2 className="portal-modal-title">{editing ? "Edit Data Siswa" : "Tambah Siswa Baru"}</h2>
          <button className="btn-close-modal" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {errorMsg && <div className="auth-error-banner" style={{ marginBottom: "1.5rem" }}><span>{errorMsg}</span></div>}
        <form onSubmit={onSubmit}>
          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label className="form-label">Nama Lengkap Siswa</label>
            <input type="text" className="form-input" placeholder="Masukkan nama lengkap siswa" required value={name} onChange={onNameChange} disabled={submitting} />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Usia Siswa</label>
              <input type="number" className="form-input" placeholder="Contoh: 8" required value={age} onChange={onAgeChange} disabled={submitting} />
            </div>
            <div className="form-group">
              <label className="form-label">Program Kursus</label>
              <select className="form-input" value={program} onChange={onProgramChange} disabled={submitting}>
                <option value="Kids Program">Kids Program</option>
                <option value="Teens Program">Teens Program</option>
                <option value="Fun Calistung">Fun Calistung</option>
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: "2rem" }}>
            <label className="form-label">Hubungkan dengan Akun Orang Tua / Akun Siswa (Opsional)</label>
            <select className="form-input" value={parentId} onChange={onParentIdChange} disabled={submitting}>
              <option value="">-- Hubungkan di sini jika akun orang tua / siswa sudah terdaftar --</option>
              {parents.filter(p => p.role === "parent" || p.role === "student").map(p => (
                <option key={p.id} value={p.id}>{p.full_name} ({p.role === "student" ? "Siswa" : "Orang Tua"}) - {p.email}</option>
              ))}
            </select>
            <p style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", marginTop: "0.5rem", fontStyle: "italic" }}>
              Catatan: Pasangan akun ini bertujuan agar orang tua dapat memantau rapor & absensi harian anak secara real-time dari portal mereka.
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
            <button type="button" className="btn-portal-outline" onClick={onClose} disabled={submitting}>Batal</button>
            <button type="submit" className="btn-portal-primary" disabled={submitting}>
              <span>{submitting ? "Menyimpan..." : (editing ? "Simpan Perubahan" : "Simpan Data Siswa")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
