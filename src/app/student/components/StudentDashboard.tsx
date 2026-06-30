"use client";

import { Student } from "@/types";

interface Announcement {
  id: string;
  title: string;
  content: any;
  priority: string;
  is_sanity?: boolean;
  image_url?: string;
  published_at: string;
  program: string;
}

interface OnlineSchedule {
  id: string;
  title: string;
  scheduled_at: string;
  meeting_platform: string;
  duration_minutes: number;
  meeting_link: string;
  tutor_name?: string;
}

interface StudentDashboardProps {
  student: Student | null;
  announcements: Announcement[];
  onlineSchedules: OnlineSchedule[];
  reports: any[];
  certificates: any[];
  totalCoins: number;
}

export default function StudentDashboard({
  student,
  announcements,
  onlineSchedules,
  reports,
  certificates,
  totalCoins
}: StudentDashboardProps) {
  if (!student) {
    return (
      <div className="portal-card" style={{ padding: "3rem", textAlign: "center" }}>
        <p style={{ color: "var(--color-gray-400)" }}>Memuat data siswa...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      
      {/* B1: Pengumuman Aktif */}
      {announcements.length > 0 && (
        <div>
          <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--color-gray-50)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
            📢 Pengumuman
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {announcements.slice(0, 3).map(ann => {
              const priColor = ann.priority === "urgent" ? "#ef4444" : ann.priority === "penting" ? "#f59e0b" : "var(--color-primary)";
              return (
                <div key={ann.id} style={{ borderRadius: "12px", border: `1.5px solid ${priColor}22`, background: `${priColor}08`, padding: "0.9rem 1.1rem", borderLeft: `4px solid ${priColor}` }}>
                  <p style={{ fontWeight: "800", fontSize: "0.9rem", color: "var(--color-gray-900)", marginBottom: "0.25rem" }}>{ann.title}</p>
                  
                  <p style={{ fontSize: "0.82rem", color: "var(--color-gray-600)", lineHeight: 1.5 }}>{ann.content}</p>

                  {ann.image_url && (
                    <div style={{ marginTop: "0.6rem" }}>
                      <img
                        src={ann.image_url}
                        alt={ann.title}
                        style={{ maxWidth: "100%", height: "auto", borderRadius: "8px", border: "1px solid var(--color-gray-200)" }}
                        loading="lazy"
                      />
                    </div>
                  )}

                  <p style={{ fontSize: "0.72rem", color: "var(--color-gray-400)", marginTop: "0.5rem" }}>
                    {new Date(ann.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} · {ann.program}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* B2: Jadwal Kelas Online Berikutnya */}
      {onlineSchedules.length > 0 && (
        <div>
          <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--color-gray-50)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
            🎥 Jadwal Kelas Online Berikutnya
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {onlineSchedules.slice(0, 2).map(s => {
              const dt = new Date(s.scheduled_at);
              return (
                <div key={s.id} style={{ borderRadius: "12px", border: "1.5px solid var(--color-primary-light)", background: "linear-gradient(135deg, var(--color-primary-light) 0%, white 100%)", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.3rem" }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", background: "var(--color-primary)", color: "white" }}>{s.meeting_platform}</span>
                      <span style={{ fontSize: "0.7rem", fontWeight: "600", padding: "2px 8px", borderRadius: "20px", background: "var(--color-gray-100)", color: "var(--color-gray-600)" }}>{s.duration_minutes} menit</span>
                    </div>
                    <p style={{ fontWeight: "800", fontSize: "0.9rem", color: "var(--color-gray-900)" }}>{s.title}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-gray-600)" }}>
                      📅 {dt.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })} · ⏰ {dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {s.tutor_name && <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)" }}>👤 {s.tutor_name}</p>}
                  </div>
                  <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" className="btn-portal-primary" style={{ textDecoration: "none", padding: "0.6rem 1.25rem", fontSize: "0.875rem", whiteSpace: "nowrap" }}>
                    🚀 Masuk Kelas
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gamification Welcome Block */}
      <div className="portal-card glowing-card" style={{
        padding: "2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1.5rem"
      }}>
        <div style={{ flex: "1 1 350px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: "800", background: "rgba(255,255,255,0.25)", color: "white", padding: "3px 10px", borderRadius: "30px", textTransform: "uppercase" }}>
              Level Belajar
            </span>
            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "rgba(255,255,255,0.85)" }}>
              {student.program}
            </span>
          </div>
          <h3 style={{ fontSize: "1.6rem", fontWeight: "900", color: "white", marginBottom: "0.4rem" }}>
            Halo, {student.name}! 👋
          </h3>
          <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "0.92rem", lineHeight: "1.5" }}>
            Senang melihatmu kembali! Terus kumpulkan koin prestasi dengan menghadiri kelas tepat waktu, aktif bertanya, dan menyelesaikan tugas harianmu!
          </p>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
          background: "rgba(255,255,255,0.15)",
          padding: "1rem 1.75rem",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)"
        }}>
          <div style={{ fontSize: "2.75rem" }}>🪙</div>
          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "rgba(255,255,255,0.75)", textTransform: "uppercase" }}>Koin Prestasimu</p>
            <p style={{ fontSize: "2.25rem", fontWeight: "900", color: "white", lineHeight: "1.1" }}>{totalCoins} <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "rgba(255,255,255,0.85)" }}>Koin</span></p>
          </div>
        </div>
      </div>

      {/* Grid: Hasil Belajar / Rapor & Sertifikat Terakhir */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.75rem" }}>
        
        {/* Rapor Belajar */}
        <div className="portal-card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--color-gray-100)", paddingBottom: "0.75rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--color-gray-900)" }}>✍️ Rapor Belajar Terakhir</h3>
            <span style={{ fontSize: "0.72rem", padding: "2px 8px", background: "var(--color-primary-light)", color: "var(--color-primary)", borderRadius: "4px", fontWeight: "700" }}>Resmi</span>
          </div>

          {reports.length > 0 ? (
            <div>
              {reports.slice(0, 1).map(rep => (
                <div key={rep.id}>
                  <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)" }}>Modul/Level</p>
                  <h4 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1rem" }}>{rep.module_name}</h4>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
                    <div style={{ background: "var(--color-gray-50)", padding: "0.6rem 0.8rem", borderRadius: "8px" }}>
                      <p style={{ fontSize: "0.7rem", color: "var(--color-gray-500)", fontWeight: "600" }}>Speaking</p>
                      <p style={{ fontSize: "1.3rem", fontWeight: "900", color: "var(--color-primary)" }}>{rep.speaking_score}</p>
                    </div>
                    <div style={{ background: "var(--color-gray-50)", padding: "0.6rem 0.8rem", borderRadius: "8px" }}>
                      <p style={{ fontSize: "0.7rem", color: "var(--color-gray-500)", fontWeight: "600" }}>Listening</p>
                      <p style={{ fontSize: "1.3rem", fontWeight: "900", color: "var(--color-primary)" }}>{rep.listening_score}</p>
                    </div>
                  </div>
                  
                  <p style={{ fontSize: "0.8rem", color: "var(--color-gray-600)", borderTop: "1px dashed var(--color-gray-200)", paddingTop: "0.75rem", lineHeight: "1.4" }}>
                    📝 <strong>Catatan Tutor:</strong> {rep.tutor_notes || "Pertahankan prestasi belajar aktifmu!"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
              <p style={{ color: "var(--color-gray-400)", fontSize: "0.85rem" }}>Belum ada rapor belajar diterbitkan.</p>
            </div>
          )}
        </div>

        {/* Sertifikat Kelulusan */}
        <div className="portal-card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--color-gray-100)", paddingBottom: "0.75rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--color-gray-900)" }}>🏅 Sertifikat Kelulusan</h3>
            <span style={{ fontSize: "0.72rem", padding: "2px 8px", background: "var(--color-accent-light)", color: "var(--color-accent)", borderRadius: "4px", fontWeight: "700" }}>Terverifikasi</span>
          </div>

          {certificates.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {certificates.slice(0, 2).map(cert => (
                <div key={cert.id} style={{ border: "1px solid var(--color-gray-150)", padding: "0.85rem", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ fontSize: "0.875rem", fontWeight: "800", color: "var(--color-gray-900)" }}>{cert.title}</h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", marginTop: "2px" }}>Nomor: {cert.certificate_number || "IBRA/CERT/..."}</p>
                  </div>
                  <a
                    href={`/verify/${cert.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-portal-outline"
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem", whiteSpace: "nowrap" }}
                  >
                    🔍 Lihat Sertifikat
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
              <p style={{ color: "var(--color-gray-400)", fontSize: "0.85rem" }}>Belum ada sertifikat kelulusan yang diterbitkan.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
