import React from "react";

export function TestimonialForm({ author, setAuthor, role, setRole, rating, setRating, testimonialText, setTestimonialText, handleSaveTestimonial, editingTestimonialId, resetForm, savingTestimonial }: any) {
  return (
    <div className="portal-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
      <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700 }}>
        {editingTestimonialId ? "Sunting Testimoni" : "Tambah Testimoni Manual"}
      </h3>
      <form onSubmit={handleSaveTestimonial} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          <div><label className="form-label">Nama Orang Tua / Siswa</label><input type="text" className="form-input" value={author} onChange={(e) => setAuthor(e.target.value)} required /></div>
          <div><label className="form-label">Peran / Status</label><input type="text" className="form-input" value={role} onChange={(e) => setRole(e.target.value)} required /></div>
          <div>
            <label className="form-label">Rating (1-5)</label>
            <select className="form-input" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Bintang</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="form-label">Ulasan / Kesaksian</label>
          <textarea className="form-input" rows={3} value={testimonialText} onChange={(e) => setTestimonialText(e.target.value)} required />
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="submit" className="btn-portal-primary" disabled={savingTestimonial}>{savingTestimonial ? "Menyimpan..." : editingTestimonialId ? "Perbarui" : "Tambah Testimoni"}</button>
          {editingTestimonialId && <button type="button" onClick={resetForm} className="btn-portal-outline">Batal</button>}
        </div>
      </form>
    </div>
  );
}

export function TestimonialItemCard({ item, startEdit, handleToggleStatus, handleDeleteTestimonial }: any) {
  return (
    <div style={{ border: "1px solid var(--color-gray-200)", padding: "1rem", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>{item.author} <span style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", fontWeight: 400 }}>({item.role})</span></h4>
        <p style={{ margin: "4px 0", fontSize: "0.85rem", color: "var(--color-gray-700)" }}>&ldquo;{item.text}&rdquo;</p>
        <span style={{ fontSize: "0.75rem", color: item.is_active ? "#10b981" : "#ef4444", fontWeight: 700 }}>{item.is_active ? "Aktif di Website" : "Nonaktif"}</span>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button onClick={() => startEdit(item)} className="btn-portal-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>Edit</button>
        <button onClick={() => handleToggleStatus(item.id, !item.is_active)} className="btn-portal-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>{item.is_active ? "Sembunyikan" : "Tampilkan"}</button>
        <button onClick={() => handleDeleteTestimonial(item.id)} className="btn-portal-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", color: "#ef4444", borderColor: "#ef4444" }}>Hapus</button>
      </div>
    </div>
  );
}
