"use client";

import { PortableText } from "next-sanity";
import { urlFor } from "@/lib/sanity/image";

export default function StudentDashboard({
  student,
  announcements,
  onlineSchedules,
  reports,
  certificates,
  totalCoins
}) {
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
          <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--color-gray-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
            📢 Pengumuman
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {announcements.slice(0, 3).map(ann => {
              const priColor = ann.priority === "urgent" ? "#ef4444" : ann.priority === "penting" ? "#f59e0b" : "var(--color-primary)";
              return (
                <div key={ann.id} style={{ borderRadius: "12px", border: `1.5px solid ${priColor}22`, background: `${priColor}08`, padding: "0.9rem 1.1rem", borderLeft: `4px solid ${priColor}` }}>
                  <p style={{ fontWeight: "800", fontSize: "0.9rem", color: "var(--color-gray-900)", marginBottom: "0.25rem" }}>{ann.title}</p>
                  
                  {ann.is_sanity ? (
                    <div style={{ fontSize: "0.82rem", color: "var(--color-gray-600)", lineHeight: 1.5 }}>
                      <PortableText value={ann.content} />
                    </div>
                  ) : (
                    <p style={{ fontSize: "0.82rem", color: "var(--color-gray-600)", lineHeight: 1.5 }}>{ann.content}</p>
                  )}

                  {ann.image_url && (
                    <div style={{ marginTop: "0.6rem" }}>
                      <img
                        src={ann.is_sanity ? urlFor(ann.image_url).width(500).url() : ann.image_url}
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
          <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--color-gray-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
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
        padding: "2rem 2.5rem",
        background: "linear-gradient(135deg, rgba(33, 108, 126, 0.08) 0%, rgba(166, 136, 73, 0.08) 100%)",
        borderLeft: "6px solid var(--color-accent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "2rem"
      }}>
        <div>
          <h3 style={{ fontSize: "1.4rem", fontWeight: "900", color: "var(--color-gray-900)" }}>
            Kumpulkan Koin Ibra Prestasi!
          </h3>
          <p style={{ color: "var(--color-gray-600)", fontSize: "0.95rem", marginTop: "4px", maxWidth: "500px" }}>
            Terus aktif di kelas, kerjakan modul latihan tepat waktu, dan peroleh bintang emas dari Coach bimbinganmu untuk mengumpulkan koin virtual!
          </p>
        </div>
        <div style={{ textAlign: "center", minWidth: "150px" }}>
          <p style={{ fontSize: "3rem", fontWeight: "900", color: "var(--color-accent)", margin: "0", lineHeight: "1" }}>
            {totalCoins}
          </p>
          <p style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--color-gray-500)", textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px" }}>
            Akumulasi Koin
          </p>
        </div>
      </div>

      {/* Rapor Belajar Modul Terbaru */}
      <div>
        <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.25rem" }}>
          Hasil Evaluasi Modul Belajar
        </h3>

        {reports.length === 0 ? (
          <div className="portal-card" style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ color: "var(--color-gray-400)" }}>Belum ada laporan nilai modul terbit untuk saat ini.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {reports.slice(0, 3).map((report) => {
              const isCalistung = student?.program?.toLowerCase()?.includes("calistung");
              return (
                <div key={report.id} className="portal-card" style={{ padding: "2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--color-gray-100)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                    <div>
                      <h4 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--color-gray-900)" }}>{report.module_name}</h4>
                      <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>
                        Diterbitkan pada {new Date(report.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    {(() => {
                      const existingCert = certificates.find(
                        (c) => c.report_id === report.id || (c.student_id === student.id && c.module_name?.toLowerCase() === report.module_name?.toLowerCase())
                      );
                      if (existingCert) {
                        return (
                          <a
                            href={`/verify/${existingCert.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-portal-outline"
                            style={{ 
                              padding: "0.4rem 1rem", 
                              fontSize: "0.8rem", 
                              display: "flex", 
                              gap: "0.5rem", 
                              alignItems: "center", 
                              borderColor: "var(--color-accent)", 
                              color: "var(--color-accent)",
                              fontWeight: "bold",
                              textDecoration: "none",
                              borderRadius: "var(--radius-md)"
                            }}
                          >
                            <span>Lihat Sertifikat</span>
                          </a>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem", alignItems: "center" }} className="report-detail-layout">
                    
                    {/* Scores grid */}
                    <div className="form-grid" style={{ gap: "1rem", marginBottom: 0 }}>
                      <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--color-gray-150)" }}>
                        <p style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.speaking_score}</p>
                        <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "2px" }}>
                          {isCalistung ? "Membaca" : "Speaking"}
                        </p>
                      </div>
                      <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--color-gray-150)" }}>
                        <p style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.grammar_score}</p>
                        <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "2px" }}>
                          {isCalistung ? "Menulis" : "Grammar"}
                        </p>
                      </div>
                      <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--color-gray-150)" }}>
                        <p style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.vocabulary_score}</p>
                        <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "2px" }}>
                          {isCalistung ? "Berhitung" : "Vocabulary"}
                        </p>
                      </div>
                      <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--color-gray-150)" }}>
                        <p style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.active_score}</p>
                        <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "2px" }}>
                          {isCalistung ? "Keaktifan" : "Active"}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <MiniRadarChart
                        speaking={report.speaking_score}
                        grammar={report.grammar_score}
                        vocabulary={report.vocabulary_score}
                        active={report.active_score}
                        isCalistung={isCalistung}
                      />
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

// Mini Radar Chart Component
function MiniRadarChart({ speaking, grammar, vocabulary, active, isCalistung }) {
  const cx = 80;
  const cy = 80;
  const r = 50;

  const pSpeaking = { x: cx, y: cy - r * (speaking / 100) };
  const pGrammar = { x: cx + r * (grammar / 100), y: cy };
  const pVocabulary = { x: cx, y: cy + r * (vocabulary / 100) };
  const pActive = { x: cx - r * (active / 100), y: cy };

  const polygonPoints = `${pSpeaking.x},${pSpeaking.y} ${pGrammar.x},${pGrammar.y} ${pVocabulary.x},${pVocabulary.y} ${pActive.x},${pActive.y}`;

  return (
    <svg width="160" height="160" viewBox="0 0 160 160" style={{ overflow: "visible" }}>
      {[25, 50, 75, 100].map((percent) => {
        const gridR = r * (percent / 100);
        return (
          <polygon
            key={percent}
            points={`${cx},${cy - gridR} ${cx + gridR},${cy} ${cx},${cy + gridR} ${cx - gridR},${cy}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="0.8"
            strokeDasharray="2,2"
          />
        );
      })}
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#cbd5e1" strokeWidth="1" />
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#cbd5e1" strokeWidth="1" />
      
      <polygon
        points={polygonPoints}
        fill="rgba(166, 136, 73, 0.2)"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
      />
      
      <circle cx={pSpeaking.x} cy={pSpeaking.y} r="2.5" fill="var(--color-accent)" />
      <circle cx={pGrammar.x} cy={pGrammar.y} r="2.5" fill="var(--color-accent)" />
      <circle cx={pVocabulary.x} cy={pVocabulary.y} r="2.5" fill="var(--color-accent)" />
      <circle cx={pActive.x} cy={pActive.y} r="2.5" fill="var(--color-accent)" />
    </svg>
  );
}