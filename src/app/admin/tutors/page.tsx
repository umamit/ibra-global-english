"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import AdminTutorsForm from "./AdminTutorsForm";

interface Tutor {
  id: string; name: string; role: string; bio?: string; image_url?: string; display_order?: number; is_active?: boolean;
}

export default function AdminTutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<string>("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const fetchTutors = async (): Promise<void> => {
    try {
      const res = await fetch("/api/admin/tutors?all=true");
      const result = await res.json();
      if (res.ok) setTutors(result.data || []);
      else showToast(`Gagal memuat: ${result.error}`);
    } catch { showToast("Gagal mengambil data tutor dari database."); } finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchTutors(); }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) { showToast("Nama dan Peran wajib diisi."); return; }
    setSaving(true);
    try {
      const payload = { name: name.trim(), role: role.trim(), bio: bio.trim(), image_url: imageUrl.trim(), display_order: Number(displayOrder) || 0, is_active: isActive };
      const res = editingId
        ? await fetch("/api/admin/tutors", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingId, ...payload }) })
        : await fetch("/api/admin/tutors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (res.ok) {
        handleCancelEdit(); fetchTutors(); showToast(editingId ? "Tutor berhasil disunting!" : "Tutor baru berhasil ditambahkan!");
      } else showToast(`Error: ${result.error}`);
    } catch { showToast("Gagal menyimpan data."); } finally { setSaving(false); }
  };

  const handleEditClick = (t: Tutor) => {
    setEditingId(t.id); setName(t.name); setRole(t.role); setBio(t.bio || ""); setImageUrl(t.image_url || ""); setDisplayOrder(t.display_order || 0); setIsActive(t.is_active !== false);
  };

  const handleCancelEdit = () => {
    setEditingId(null); setName(""); setRole(""); setBio(""); setImageUrl(""); setDisplayOrder(0); setIsActive(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Apakah Anda yakin ingin menghapus tutor ini?")) return;
    try {
      const res = await fetch(`/api/admin/tutors?id=${id}`, { method: "DELETE" });
      if (res.ok) { fetchTutors(); showToast("Tutor berhasil dihapus."); if (editingId === id) handleCancelEdit(); }
      else { const result = await res.json(); showToast(`Error: ${result.error}`); }
    } catch { showToast("Gagal menghapus tutor."); }
  };

  return (
    <div className="dashboard-main" style={{ padding: "2rem" }}>
      {toast && <div className="auth-success-banner" style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 9999, maxWidth: "380px" }}>{toast}</div>}

      <div className="dashboard-topbar" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary-dark)", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Kelola Tutor &amp; Staf</span>
          </h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>Kelola profil tim pengajar dan staf pendidikan Ibra Global English Bobong.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "2rem", alignItems: "start" }} className="report-detail-layout">
        <AdminTutorsForm editingId={editingId} name={name} setName={setName} role={role} setRole={setRole} imageUrl={imageUrl} setImageUrl={setImageUrl} displayOrder={displayOrder} setDisplayOrder={setDisplayOrder} isActive={isActive} setIsActive={setIsActive} bio={bio} setBio={setBio} saving={saving} handleSubmit={handleSubmit} handleCancelEdit={handleCancelEdit} />

        <div className="portal-card" style={{ padding: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem", color: "var(--color-gray-900)" }}>Daftar Tutor Aktif (Database Supabase)</h3>
          {loading ? <p style={{ color: "var(--color-gray-400)", textAlign: "center", padding: "2rem" }}>Memuat daftar tutor...</p>
            : tutors.length === 0 ? <p style={{ color: "var(--color-gray-400)", textAlign: "center", padding: "2rem" }}>Belum ada data tutor di Supabase.</p>
            : (
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
                          {t.image_url ? <img src={t.image_url} alt={t.name} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                            : <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.85rem" }}>{t.name.substring(0, 2).toUpperCase()}</div>}
                        </td>
                        <td style={{ padding: "10px" }}>
                          <div style={{ fontWeight: "700", color: "var(--color-gray-900)" }}>{t.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>{t.role}</div>
                        </td>
                        <td style={{ padding: "10px", textAlign: "center" }}>#{t.display_order ?? 0}</td>
                        <td style={{ padding: "10px", textAlign: "center" }}><span className={`badge-${t.is_active ? "success" : "danger"}`} style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>{t.is_active ? "Aktif" : "Nonaktif"}</span></td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          <button onClick={() => handleEditClick(t)} className="btn-portal-outline" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem", marginRight: "0.5rem" }}>Edit</button>
                          <button onClick={() => handleDelete(t.id)} className="btn-portal-outline" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem", color: "var(--color-red)", borderColor: "rgba(239, 68, 68, 0.2)" }}>Hapus</button>
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
