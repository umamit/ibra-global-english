"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";

const PROGRAMS = ["Kids Program", "Teens Program", "Fun Calistung"];
const PLATFORMS = ["Google Meet", "Zoom", "Webex", "Microsoft Teams"];

export default function AdminOnlineSchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const [title, setTitle] = useState("");
  const [program, setProgram] = useState("Kids Program");
  const [meetingLink, setMeetingLink] = useState("");
  const [platform, setPlatform] = useState("Google Meet");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState(60);
  const [tutorName, setTutorName] = useState("");
  const [notes, setNotes] = useState("");
  const [showAll, setShowAll] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const fetchSchedules = async () => {
    setLoading(true);
    const res = await fetch(`/api/online-schedule?upcoming=${!showAll}`);
    const { data } = await res.json();
    setSchedules(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSchedules(); }, [showAll]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/online-schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, program, meeting_link: meetingLink, meeting_platform: platform, scheduled_at: scheduledAt, duration_minutes: Number(duration), tutor_name: tutorName, notes }),
    });
    if (res.ok) {
      setTitle(""); setMeetingLink(""); setScheduledAt(""); setNotes(""); setTutorName("");
      fetchSchedules();
      showToast("Jadwal kelas online berhasil ditambahkan! ✅");
    } else {
      const { error } = await res.json();
      showToast(`Error: ${error}`);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus jadwal kelas ini?")) return;
    await fetch(`/api/online-schedule?id=${id}`, { method: "DELETE" });
    fetchSchedules();
    showToast("Jadwal dihapus.");
  };

  const platformIcon = (p) => {
    if (p === "Zoom") return "📹";
    if (p === "Webex") return "💼";
    if (p === "Microsoft Teams") return "🟣";
    return "🎥";
  };

  const isUpcoming = (dt) => new Date(dt) > new Date();
  const isPast = (dt) => new Date(dt) < new Date();

  return (
    <div className="dashboard-main" style={{ padding: "2rem" }}>
      {toast && (
        <div className="auth-success-banner" style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 9999, maxWidth: "380px" }}>
          {toast}
        </div>
      )}

      <div className="dashboard-topbar" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>🎥 Jadwal Kelas Online</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Kelola sesi kelas online via Google Meet, Zoom, atau platform lainnya.
          </p>
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="btn-portal-outline"
          style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
        >
          {showAll ? "🔮 Tampilkan Mendatang Saja" : "📅 Tampilkan Semua"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "2rem", alignItems: "start" }} className="report-detail-layout">

        {/* Form */}
        <div className="portal-card" style={{ padding: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem", color: "var(--color-gray-900)" }}>
            ➕ Jadwalkan Kelas Baru
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Judul Sesi</label>
              <input className="form-input" placeholder="Contoh: Speaking Practice — Sesi 3" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            <div className="form-grid" style={{ gap: "1rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Program</label>
                <select className="form-input" value={program} onChange={e => setProgram(e.target.value)}>
                  {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Platform</label>
                <select className="form-input" value={platform} onChange={e => setPlatform(e.target.value)}>
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Link Meeting</label>
              <input className="form-input" type="url" placeholder="https://meet.google.com/xxx-xxxx-xxx" value={meetingLink} onChange={e => setMeetingLink(e.target.value)} required />
            </div>

            <div className="form-grid" style={{ gap: "1rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Tanggal &amp; Jam</label>
                <input type="datetime-local" className="form-input" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Durasi (menit)</label>
                <input type="number" className="form-input" min="15" max="240" step="15" value={duration} onChange={e => setDuration(e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Nama Tutor</label>
              <input className="form-input" placeholder="Nama tutor yang mengajar" value={tutorName} onChange={e => setTutorName(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">Catatan (Opsional)</label>
              <textarea className="form-input" style={{ minHeight: "60px", fontFamily: "inherit" }} placeholder="Persiapan, materi yang dibawa, dll." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <button type="submit" className="btn-portal-primary" style={{ width: "100%", padding: "0.85rem" }} disabled={saving}>
              {saving ? "Menyimpan..." : "🎥 Tambah Jadwal Kelas"}
            </button>
          </form>
        </div>

        {/* Daftar Jadwal */}
        <div className="portal-card" style={{ padding: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem", color: "var(--color-gray-900)" }}>
            {showAll ? "📅 Semua Jadwal" : "🔮 Jadwal Mendatang"} ({schedules.length})
          </h3>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton-pulse" style={{ height: "90px", borderRadius: "12px" }} />)}
            </div>
          ) : schedules.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-400)" }}>
              <p style={{ fontWeight: "600" }}>Tidak ada jadwal {showAll ? "" : "mendatang"}.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "600px", overflowY: "auto" }}>
              {schedules.map(s => {
                const past = isPast(s.scheduled_at);
                const scheduledDate = new Date(s.scheduled_at);
                return (
                  <div key={s.id} style={{
                    borderRadius: "12px",
                    border: `1.5px solid ${past ? "var(--color-gray-100)" : "var(--color-primary-light)"}`,
                    padding: "1rem 1.25rem",
                    opacity: past ? 0.65 : 1,
                    background: past ? "var(--color-gray-50)" : "white",
                    position: "relative",
                  }}>
                    {!past && (
                      <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
                          <span style={{ fontSize: "0.7rem", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}>{s.program}</span>
                          <span style={{ fontSize: "0.7rem", fontWeight: "600", padding: "2px 8px", borderRadius: "20px", background: "var(--color-gray-100)", color: "var(--color-gray-600)" }}>{platformIcon(s.meeting_platform)} {s.meeting_platform}</span>
                          {past && <span style={{ fontSize: "0.7rem", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", background: "#f3f4f6", color: "#9ca3af" }}>Selesai</span>}
                        </div>
                        <p style={{ fontWeight: "800", fontSize: "0.9rem", color: "var(--color-gray-900)", marginBottom: "2px" }}>{s.title}</p>
                        <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>
                          📅 {scheduledDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · ⏰ {scheduledDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} · ⏱ {s.duration_minutes} menit
                        </p>
                        {s.tutor_name && <p style={{ fontSize: "0.78rem", color: "var(--color-gray-400)", marginTop: "2px" }}>👤 {s.tutor_name}</p>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flexShrink: 0 }}>
                        {!past && (
                          <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" className="btn-portal-primary" style={{ fontSize: "0.75rem", padding: "0.35rem 0.7rem", textDecoration: "none", textAlign: "center" }}>
                            Masuk
                          </a>
                        )}
                        <button onClick={() => handleDelete(s.id)} className="btn-portal-danger" style={{ fontSize: "0.75rem", padding: "0.35rem 0.6rem" }}>
                          Hapus
                        </button>
                      </div>
                    </div>
                    {s.notes && <p style={{ fontSize: "0.78rem", color: "var(--color-gray-500)", marginTop: "0.5rem", fontStyle: "italic" }}>📝 {s.notes}</p>}
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
