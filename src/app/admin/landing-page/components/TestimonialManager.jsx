"use client";

export default function TestimonialManager({
  editingTestimonialId, setEditingTestimonialId,
  author, setAuthor,
  role, setRole,
  rating, setRating,
  testimonialText, setTestimonialText,
  savingTestimonial, setSavingTestimonial,
  testimonialsList, setTestimonialsList,
  testimonialsLoading,
  handleSaveTestimonial,
  handleCancelEditTestimonial,
  handleEditTestimonialClick,
  handleDeleteTestimonial
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* Form Testimoni */}
      <div className="portal-card" style={{ padding: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>
          {editingTestimonialId ? "Sunting Ulasan Testimoni" : "Tambah Ulasan Testimoni Baru"}
        </h2>
        
        <form onSubmit={handleSaveTestimonial} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            
            {/* Nama Penulis */}
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Nama Penulis</label>
              <input
                type="text"
                className="form-input"
                style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                placeholder="Contoh: Bapak Andi / Rania"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>

            {/* Peran / Identitas */}
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Peran / Identitas</label>
              <input
                type="text"
                className="form-input"
                style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                placeholder="Contoh: Orang Tua Siswa / Siswa SMP"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </div>

            {/* Rating Bintang */}
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Rating Bintang</label>
              <select
                className="form-input"
                style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
              >
                <option value={5}>5 Bintang (Sangat Puas)</option>
                <option value={4}>4 Bintang (Puas)</option>
                <option value={3}>3 Bintang (Cukup)</option>
                <option value={2}>2 Bintang (Kurang)</option>
                <option value={1}>1 Bintang (Buruk)</option>
              </select>
            </div>
          </div>

          {/* Teks Ulasan */}
          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Teks Isi Ulasan</label>
            <textarea
              className="form-input"
              style={{ width: "100%", height: "100px", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
              placeholder="Ketik komentar, ulasan positif, atau saran wali murid di sini..."
              value={testimonialText}
              onChange={(e) => setTestimonialText(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="submit"
              className="btn-portal-primary"
              style={{ padding: "0.6rem 1.2rem", fontWeight: "700" }}
              disabled={savingTestimonial}
            >
              {savingTestimonial ? "Menyimpan..." : editingTestimonialId ? "Simpan Perubahan" : "Tambah Testimoni"}
            </button>
            {editingTestimonialId && (
              <button
                type="button"
                onClick={handleCancelEditTestimonial}
                className="btn-portal-outline"
                style={{ padding: "0.6rem 1.2rem", fontWeight: "600" }}
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List Testimoni */}
      <div className="portal-card" style={{ padding: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>Daftar Testimoni Aktif</h2>
        
        {testimonialsLoading ? (
          <p style={{ color: "var(--color-gray-400)" }}>Memuat ulasan testimoni...</p>
        ) : testimonialsList.length === 0 ? (
          <p style={{ color: "var(--color-gray-400)" }}>Tidak ada testimoni tambahan di database. Landing page akan menggunakan testimoni default aslinya (statis).</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="portal-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px", width: "100px" }}>Bintang</th>
                  <th style={{ textAlign: "left", padding: "10px", width: "180px" }}>Penulis</th>
                  <th style={{ textAlign: "left", padding: "10px" }}>Teks Isi Ulasan</th>
                  <th style={{ textAlign: "right", padding: "10px", width: "150px" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {testimonialsList.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid var(--color-gray-100)" }}>
                    <td style={{ padding: "10px" }}>
                      <span style={{ color: "#fbbf24", fontWeight: "bold" }}>{"★".repeat(t.rating)}</span>
                    </td>
                    <td style={{ padding: "10px" }}>
                      <div style={{ fontWeight: "700", color: "var(--color-gray-800)" }}>{t.author}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--color-gray-500)" }}>{t.role}</div>
                    </td>
                    <td style={{ padding: "10px", fontSize: "0.9rem", color: "var(--color-gray-600)" }}>
                      "{t.text}"
                    </td>
                    <td style={{ padding: "10px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => handleEditTestimonialClick(t)}
                          className="btn-portal-outline"
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTestimonial(t.id)}
                          className="btn-portal-danger"
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}