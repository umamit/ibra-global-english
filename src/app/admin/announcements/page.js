"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";

const PROGRAMS = ["Semua Program", "Kids Program", "Teens Program", "Fun Calistung"];
const PRIORITIES = [
  { value: "normal", label: "ℹ️ Normal", color: "var(--color-primary)" },
  { value: "penting", label: "⚠️ Penting", color: "#f59e0b" },
  { value: "urgent", label: "🚨 Urgent", color: "#ef4444" },
];

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [program, setProgram] = useState("Semua Program");
  const [priority, setPriority] = useState("normal");
  const [expiresAt, setExpiresAt] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchAnnouncements = async () => {
    setLoading(true);
    const res = await fetch("/api/announcements?all=true");
    const { data } = await res.json();
    setAnnouncements(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, program, priority, expires_at: expiresAt || null }),
    });
    if (res.ok) {
      setTitle(""); setContent(""); setProgram("Semua Program"); setPriority("normal"); setExpiresAt("");
      fetchAnnouncements();
      showToast("Pengumuman berhasil diterbitkan! ✅");
    }
    setSaving(false);
  };

  const handleToggle = async (id, isActive) => {
    await fetch("/api/announcements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !isActive }),
    });
    fetchAnnouncements();
    showToast(isActive ? "Pengumuman dinonaktifkan." : "Pengumuman diaktifkan kembali.");
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus pengumuman ini secara permanen?")) return;
    await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
    fetchAnnouncements();
    showToast("Pengumuman dihapus.");
  };

  const priorityInfo = (p) => PRIORITIES.find(x => x.value === p) || PRIORITIES[0];

  return (
    <div className="dashboard-main" style={{ padding: "2rem" }}>
      {toast && (
        <div className="auth-success-banner" style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 9999, maxWidth: "360px" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="dashboard-topbar" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>📢 Kelola Pengumuman</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Kirim pengumuman ke semua siswa dan orang tua berdasarkan program.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "2rem", alignItems: "start" }} className="report-detail-layout">

        {/* Form Buat Pengumuman */}
        <div className="portal-card" style={{ padding: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem", color: "var(--color-gray-900)" }}>
            ✏️ Buat Pengumuman Baru
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Judul Pengumuman</label>
              <input className="form-input" placeholder="Contoh: Libur Idul Adha 2026" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Isi Pengumuman</label>
              <textarea
                className="form-input"
                style={{ minHeight: "110px", fontFamily: "inherit", resize: "vertical" }}
                placeholder="Tulis isi pengumuman lengkap di sini..."
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Target Program</label>
                <select className="form-input" value={program} onChange={e => setProgram(e.target.value)}>
                  {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Prioritas</label>
                <select className="form-input" value={priority} onChange={e => setPriority(e.target.value)}>
                  {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">Kadaluarsa (Opsional)</label>
              <input type="datetime-local" className="form-input" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
              <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "4px" }}>Kosongkan jika tidak ada batas waktu.</p>
            </div>

            <button type="submit" className="btn-portal-primary" style={{ width: "100%", padding: "0.85rem" }} disabled={saving}>
              {saving ? "Menerbitkan..." : "📢 Terbitkan Pengumuman"}
            </button>
          </form>
        </div>

        {/* Daftar Pengumuman */}
        <div className="portal-card" style={{ padding: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem", color: "var(--color-gray-900)" }}>
            📋 Semua Pengumuman ({announcements.length})
          </h3>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[1, 2].map(i => <div key={i} className="skeleton-pulse" style={{ height: "80px", borderRadius: "10px" }} />)}
            </div>
          ) : announcements.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-400)" }}>
              <p style={{ fontWeight: "600" }}>Belum ada pengumuman.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "600px", overflowY: "auto" }}>
              {announcements.map(ann => {
                const pri = priorityInfo(ann.priority);
                return (
                  <div key={ann.id} style={{
                    borderRadius: "12px",
                    border: `1.5px solid ${ann.is_active ? "var(--color-gray-150)" : "var(--color-gray-100)"}`,
                    padding: "1rem 1.25rem",
                    opacity: ann.is_active ? 1 : 0.55,
                    background: ann.is_active ? "white" : "var(--color-gray-50)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "4px" }}>
                          <span style={{ fontSize: "0.7rem", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", background: pri.color + "18", color: pri.color }}>{pri.label}</span>
                          <span style={{ fontSize: "0.7rem", fontWeight: "600", padding: "2px 8px", borderRadius: "20px", background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}>{ann.program}</span>
                          {!ann.is_active && <span style={{ fontSize: "0.7rem", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", background: "#f3f4f6", color: "#9ca3af" }}>Nonaktif</span>}
                        </div>
                        <p style={{ fontWeight: "800", fontSize: "0.9rem", color: "var(--color-gray-900)" }}>{ann.title}</p>
                      </div>
                      <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                        <button
                          onClick={() => handleToggle(ann.id, ann.is_active)}
                          style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem", borderRadius: "6px", border: "1px solid var(--color-gray-200)", background: "none", cursor: "pointer", color: ann.is_active ? "#f59e0b" : "#22c55e", fontWeight: "700" }}
                        >
                          {ann.is_active ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                        <button onClick={() => handleDelete(ann.id)} className="btn-portal-danger" style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}>
                          Hapus
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "var(--color-gray-600)", lineHeight: 1.5 }}>
                      {ann.content.length > 120 ? ann.content.slice(0, 120) + "..." : ann.content}
                    </p>
                    <p style={{ fontSize: "0.72rem", color: "var(--color-gray-400)", marginTop: "0.5rem" }}>
                      Diterbitkan: {new Date(ann.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      {ann.expires_at && ` · Kadaluarsa: ${new Date(ann.expires_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
