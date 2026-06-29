"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminTutorsPage() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const fetchTutors = async () => {
    try {
      const res = await fetch("/api/admin/tutors?all=true");
      const result = await res.json();
      if (res.ok) {
        setTutors(result.data || []);
      } else {
        showToast(`Gagal memuat: ${result.error}`);
      }
    } catch (err) {
      showToast("Gagal mengambil data tutor dari database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/tutors?all=true");
        const result = await res.json();
        if (res.ok) {
          setTutors(result.data || []);
        } else {
          setToast(`Gagal memuat: ${result.error}`);
          setTimeout(() => setToast(""), 3500);
        }
      } catch {
        setToast("Gagal mengambil data tutor dari database.");
        setTimeout(() => setToast(""), 3500);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      showToast("Nama dan Peran wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        role: role.trim(),
        bio: bio.trim(),
        image_url: imageUrl.trim(),
        display_order: Number(displayOrder) || 0,
        is_active: isActive,
      };

      let res;
      if (editingId) {
        res = await fetch("/api/admin/tutors", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
      } else {
        res = await fetch("/api/admin/tutors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const result = await res.json();
      if (res.ok) {
        setName("");
        setRole("");
        setBio("");
        setImageUrl("");
        setDisplayOrder(0);
        setIsActive(true);
        setEditingId(null);
        fetchTutors();
        showToast(editingId ? "Tutor berhasil disunting! ✅" : "Tutor baru berhasil ditambahkan! ✅");
      } else {
        showToast(`Error: ${result.error}`);
      }
    } catch (err) {
      showToast("Gagal menyimpan data.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (t) => {
    setEditingId(t.id);
    setName(t.name);
    setRole(t.role);
    setBio(t.bio || "");
    setImageUrl(t.image_url || "");
    setDisplayOrder(t.display_order || 0);
    setIsActive(t.is_active !== false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setRole("");
    setBio("");
    setImageUrl("");
    setDisplayOrder(0);
    setIsActive(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tutor ini?")) return;
    try {
      const res = await fetch(`/api/admin/tutors?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTutors();
        showToast("Tutor berhasil dihapus.");
        if (editingId === id) handleCancelEdit();
      } else {
        const result = await res.json();
        showToast(`Error: ${result.error}`);
      }
    } catch (err) {
      showToast("Gagal menghapus tutor.");
    }
  };

  return (
    <div className="dashboard-main" style={{ padding: "2rem" }}>
      {toast && (
        <div className="auth-success-banner" style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 9999, maxWidth: "380px" }}>
          {toast}
        </div>
      )}

      <div className="dashboard-topbar" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>👨‍🏫 Kelola Tutor &amp; Staf</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Kelola profil tim pengajar dan staf pendidikan Ibra Global English Bobong.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/studio" target="_blank" className="btn-portal-outline" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
            Buka di Sanity Studio ↗
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "2rem", alignItems: "start" }} className="report-detail-layout">
        
        {/* Form Panel */}
        <div className="portal-card" style={{ padding: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem", color: "var(--color-gray-900)" }}>
            {editingId ? "📝 Sunting Profil Tutor" : "➕ Tambah Tutor Baru"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Nama Lengkap Tutor</label>
              <input className="form-input" placeholder="Contoh: Ahmad, S.Pd." value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Peran / Spesialisasi</label>
              <input className="form-input" placeholder="Contoh: Kids Program Specialist" value={role} onChange={e => setRole(e.target.value)} required />
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">URL Foto Profil</label>
              <input className="form-input" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
            </div>

            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Urutan Tampilan</label>
                <input type="number" className="form-input" min="0" value={displayOrder} onChange={e => setDisplayOrder(parseInt(e.target.value) || 0)} />
              </div>
              <div className="form-group" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", marginTop: "1.5rem" }}>
                  <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: "18px", height: "18px" }} />
                  <span>Aktif (Tampil)</span>
                </label>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">Biografi Singkat</label>
              <textarea className="form-input" style={{ height: "100px", padding: "0.75rem" }} placeholder="Ceritakan latar belakang pendidikan atau motivasi mengajar..." value={bio} onChange={e => setBio(e.target.value)} />
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="submit" className="btn-portal-primary" style={{ padding: "0.6rem 1.2rem", fontWeight: "700" }} disabled={saving}>
                {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Tutor"}
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
            Daftar Tutor Aktif (Database Supabase)
          </h3>

          {loading ? (
            <p style={{ color: "var(--color-gray-400)", textAlign: "center", padding: "2rem" }}>Memuat daftar tutor...</p>
          ) : tutors.length === 0 ? (
            <p style={{ color: "var(--color-gray-400)", textAlign: "center", padding: "2rem" }}>Belum ada data tutor di Supabase.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="portal-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "10px", width: "60px" }}>Foto</th>
                    <th style={{ textAlign: "left", padding: "10px" }}>Nama &amp; Peran</th>
                    <th style={{ textAlign: "center", padding: "10px", width: "80px" }}>Urutan</th>
                    <th style={{ textAlign: "center", padding: "10px", width: "80px" }}>Status</th>
                    <th style={{ textAlign: "right", padding: "10px", width: "140px" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tutors.map((t) => (
                    <tr key={t.id} style={{ borderBottom: "1px solid var(--color-gray-100)" }}>
                      <td style={{ padding: "10px" }}>
                        {t.image_url ? (
                          <img src={t.image_url} alt={t.name} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.85rem" }}>
                            {t.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "10px" }}>
                        <div style={{ fontWeight: "700", color: "var(--color-gray-900)" }}>{t.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>{t.role}</div>
                      </td>
                      <td style={{ padding: "10px", textAlign: "center" }}>#{t.display_order ?? 0}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        <span className={`badge-${t.is_active ? "success" : "danger"}`} style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                          {t.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td style={{ padding: "10px", textAlign: "right" }}>
                        <button onClick={() => handleEditClick(t)} className="btn-portal-outline" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem", marginRight: "0.5rem" }}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="btn-portal-outline" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem", color: "var(--color-red)", borderColor: "rgba(239, 68, 68, 0.2)" }}>
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
