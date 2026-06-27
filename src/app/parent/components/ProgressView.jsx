"use client";

import { useState } from "react";
import RadarChart from "@/components/RadarChart";
import LineChart from "@/components/LineChart";

export default function ProgressView({
  selectedChild,
  announcements,
  onlineSchedules,
  attendance,
  attendanceStats,
  reports,
  certificates,
  detailsLoading,
  getIndonesianDay,
  getIndonesianDate,
  triggerPrint
}) {
  const [printReport, setPrintReport] = useState(null);

  if (printReport) {
    const isCalistung = selectedChild?.program?.toLowerCase()?.includes("calistung");
    return (
      <div style={{ padding: "1.5rem", backgroundColor: "white", minHeight: "100vh" }}>
        <div className="no-print" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)" }}>
            * Anda sedang melihat pratinjau cetak. Tekan Ctrl+P atau Cmd+P jika dialog print tidak terbuka otomatis.
          </p>
          <button className="btn-portal-outline" onClick={() => setPrintReport(null)}>
            ← Kembali ke Portal
          </button>
        </div>

        {/* PRINT-OPTIMIZED REPORT LAYOUT */}
        <div className="printable-report" style={{ border: "2px solid #ddd", padding: "2.5rem", borderRadius: "12px", maxWidth: "800px", margin: "0 auto" }}>
          
          {/* Official Header Kop Surat */}
          <div className="report-header-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "3px double var(--color-primary)", paddingBottom: "1rem", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <img src="/assets/logo.png" alt="Ibra Logo" style={{ width: "64px", height: "64px" }} />
              <div style={{ textAlign: "left" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "900", margin: "0", color: "var(--color-primary)" }}>IBRA GLOBAL ENGLISH</h1>
                <p style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--color-accent)", margin: "0" }}>Belajar Seru, Lancar Bicara</p>
                <p style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", margin: "2px 0 0" }}>Jl. TPU Bobong Komp. Fangahu, Lantai 1 Kost Fitrah</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0" }}>E-RAPOR DIGITAL</h2>
              <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", margin: "0" }}>REKAP HASIL EVALUASI MODUL</p>
            </div>
          </div>

          <div className="student-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem", backgroundColor: "var(--color-gray-50)", padding: "1.25rem", borderRadius: "8px" }}>
            <div>
              <p style={{ margin: "0 0 6px" }}><strong>Nama Siswa:</strong> {selectedChild?.name}</p>
              <p style={{ margin: "0" }}><strong>Program Belajar:</strong> {selectedChild?.program} (Usia {selectedChild?.age} tahun)</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: "0 0 6px" }}><strong>ID Evaluasi:</strong> IBRA-REP-{printReport.id.slice(0, 8).toUpperCase()}</p>
              <p style={{ margin: "0" }}><strong>Tanggal Terbit:</strong> {new Date(printReport.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </div>

          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", borderBottom: "1.5px solid var(--color-gray-300)", paddingBottom: "0.5rem", marginBottom: "1.5rem", color: "var(--color-gray-800)" }}>
            A. DETAIL EVALUASI KOMPETENSI MODUL: {printReport.module_name.toUpperCase()}
          </h3>

          {/* Grid Layout containing Score Cards on Left and visual SVG Radar Chart on Right */}
          <div className="report-scores-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem", alignItems: "center", marginBottom: "2.5rem" }}>
            
            {/* Scores List */}
            <div className="form-grid" style={{ gap: "1rem", marginBottom: 0 }}>
              <div style={{ border: "1px solid var(--color-gray-200)", padding: "1.25rem", borderRadius: "8px", textAlign: "center", backgroundColor: "white" }}>
                <p style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0" }}>{printReport.speaking_score}</p>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>
                  {isCalistung ? "Membaca" : "Speaking"}
                </p>
              </div>
              <div style={{ border: "1px solid var(--color-gray-200)", padding: "1.25rem", borderRadius: "8px", textAlign: "center", backgroundColor: "white" }}>
                <p style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0" }}>{printReport.grammar_score}</p>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>
                  {isCalistung ? "Menulis" : "Grammar"}
                </p>
              </div>
              <div style={{ border: "1px solid var(--color-gray-200)", padding: "1.25rem", borderRadius: "8px", textAlign: "center", backgroundColor: "white" }}>
                <p style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0" }}>{printReport.vocabulary_score}</p>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>
                  {isCalistung ? "Berhitung" : "Vocabulary"}
                </p>
              </div>
              <div style={{ border: "1px solid var(--color-gray-200)", padding: "1.25rem", borderRadius: "8px", textAlign: "center", backgroundColor: "white" }}>
                <p style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0" }}>{printReport.active_score}</p>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>
                  {isCalistung ? "Keaktifan" : "Active"}
                </p>
              </div>
            </div>

            {/* Visual SVG Radar Chart */}
            <div>
              <RadarChart 
                speaking={printReport.speaking_score} 
                grammar={printReport.grammar_score} 
                vocabulary={printReport.vocabulary_score} 
                active={printReport.active_score} 
                isCalistung={isCalistung}
              />
            </div>

          </div>

          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", borderBottom: "1.5px solid var(--color-gray-300)", paddingBottom: "0.5rem", marginBottom: "1rem", color: "var(--color-gray-800)" }}>
            B. ULASAN & CATATAN MASUKAN TUTOR
          </h3>

          <div className="report-notes-container" style={{ borderLeft: "4px solid var(--color-accent)", paddingLeft: "1.25rem", margin: "1.5rem 0 3rem", backgroundColor: "var(--color-gray-50)", padding: "1.25rem", borderRadius: "0 8px 8px 0" }}>
            <p style={{ fontSize: "0.95rem", color: "var(--color-gray-700)", fontStyle: "italic", lineHeight: "1.6", margin: "0" }}>
              &ldquo;{printReport.tutor_notes || "Siswa menunjukkan pemahaman yang luar biasa serta keaktifan tinggi selama pengerjaan modul bimbingan ini. Terus latih kemampuan bercakapnya."}&rdquo;
            </p>
          </div>

          {/* Signature Block */}
          <div className="signature-block" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", marginTop: "4rem" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: "0 0 4.5rem" }}>Mengetahui,<br /><strong>Orang Tua / Wali Siswa</strong></p>
              <p style={{ margin: "0", fontWeight: "bold" }}>___________________________</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: "0 0 4.5rem" }}>Bobong, Pulau Taliabu<br /><strong>Tutor Pendamping</strong></p>
              <p style={{ margin: "0", fontWeight: "bold" }}>___________________________</p>
              <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", margin: "4px 0 0" }}>Ibra Global English</p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      
      {/* B1: Pengumuman Aktif */}
      {announcements.length > 0 && (
        <div>
          <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--color-gray-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
            📢 Pengumuman untuk {selectedChild?.name || "Anak Anda"}
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {announcements.slice(0, 3).map(ann => {
              const priColor = ann.priority === "urgent" ? "#ef4444" : ann.priority === "penting" ? "#f59e0b" : "var(--color-primary)";
              return (
                <div key={ann.id} style={{ borderRadius: "12px", border: `1.5px solid ${priColor}22`, background: `${priColor}07`, padding: "0.9rem 1.1rem", borderLeft: `4px solid ${priColor}` }}>
                  <p style={{ fontWeight: "800", fontSize: "0.9rem", color: "var(--color-gray-900)", marginBottom: "0.2rem" }}>{ann.title}</p>
                  <p style={{ fontSize: "0.82rem", color: "var(--color-gray-600)", lineHeight: 1.5 }}>{ann.content}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--color-gray-400)", marginTop: "0.35rem" }}>
                    {new Date(ann.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} · {ann.program}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* B2: Jadwal Kelas Online */}
      {onlineSchedules.length > 0 && (
        <div>
          <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--color-gray-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
            🎥 Jadwal Kelas Online Mendatang
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {onlineSchedules.slice(0, 2).map(s => {
              const dt = new Date(s.scheduled_at);
              return (
                <div key={s.id} style={{ borderRadius: "12px", border: "1.5px solid var(--color-primary-light)", background: "linear-gradient(135deg, var(--color-primary-light) 0%, white 100%)", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.3rem" }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", background: "var(--color-primary)", color: "white" }}>{s.meeting_platform}</span>
                      <span style={{ fontSize: "0.7rem", fontWeight: "600", padding: "2px 8px", borderRadius: "20px", background: "var(--color-gray-100)", color: "var(--color-gray-600)" }}>{s.duration_minutes} menit</span>
                    </div>
                    <p style={{ fontWeight: "800", fontSize: "0.875rem", color: "var(--color-gray-900)" }}>{s.title}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-gray-600)" }}>
                      📅 {dt.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })} · ⏰ {dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" className="btn-portal-primary" style={{ textDecoration: "none", padding: "0.5rem 1rem", fontSize: "0.825rem", whiteSpace: "nowrap" }}>
                    🚀 Masuk Kelas
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Riwayat Kehadiran */}
      <div className="portal-card" style={{ padding: "2rem" }}>
        <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.5rem" }}>
          Riwayat Kehadiran Siswa
        </h3>
        
        {detailsLoading ? (
          <>
            {/* Attendance Stats Cards Skeleton */}
            <div className="four-column-grid" style={{ gap: "1rem", marginBottom: "2rem" }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ textAlign: "center", padding: "1.25rem 1rem", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-white)", boxShadow: "var(--shadow-sm)" }}>
                  <div className="skeleton-pulse skeleton-title" style={{ width: "30px", marginBottom: "0.5rem", display: "block", marginInline: "auto" }} />
                  <div className="skeleton-pulse skeleton-text" style={{ width: "50px", display: "block", marginInline: "auto" }} />
                </div>
              ))}
            </div>
            
            {/* Attendance Table Skeleton */}
            <div className="table-wrapper">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Hari</th>
                    <th>Tanggal</th>
                    <th>Status Kehadiran</th>
                    <th>Keterangan / Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td><div className="skeleton-pulse skeleton-text" style={{ width: "20px" }} /></td>
                      <td><div className="skeleton-pulse skeleton-text" style={{ width: "60px" }} /></td>
                      <td><div className="skeleton-pulse skeleton-text" style={{ width: "100px" }} /></td>
                      <td><div className="skeleton-pulse skeleton-text" style={{ width: "80px" }} /></td>
                      <td><div className="skeleton-pulse skeleton-text" style={{ width: "150px" }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            {/* Attendance Stats Cards */}
            <div className="four-column-grid" style={{ gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ textAlign: "center", padding: "1rem", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-white)", boxShadow: "var(--shadow-sm)" }}>
                <p style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-green)" }}>{attendanceStats.hadir}</p>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)", marginTop: "0.25rem" }}>Hadir</p>
              </div>
              <div style={{ textAlign: "center", padding: "1rem", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-white)", boxShadow: "var(--shadow-sm)" }}>
                <p style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-yellow)" }}>{attendanceStats.sakit}</p>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)", marginTop: "0.25rem" }}>Sakit</p>
              </div>
              <div style={{ textAlign: "center", padding: "1rem", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-white)", boxShadow: "var(--shadow-sm)" }}>
                <p style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-primary)" }}>{attendanceStats.izin}</p>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)", marginTop: "0.25rem" }}>Izin</p>
              </div>
              <div style={{ textAlign: "center", padding: "1rem", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-white)", boxShadow: "var(--shadow-sm)" }}>
                <p style={{ fontSize: "1.5rem", fontWeight: "900", color: "#ef4444" }}>{attendanceStats.alfa}</p>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)", marginTop: "0.25rem" }}>Alfa</p>
              </div>
            </div>

            {/* Attendance log table */}
            <div className="table-wrapper" style={{ maxHeight: "350px", overflowY: "auto" }}>
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Hari</th>
                    <th>Tanggal</th>
                    <th>Status Kehadiran</th>
                    <th>Keterangan / Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-500)" }}>
                        Belum ada riwayat absensi untuk siswa ini.
                      </td>
                    </tr>
                  ) : (
                    attendance.map((log, idx) => (
                      <tr key={log.id}>
                        <td style={{ fontWeight: "700" }}>{idx + 1}</td>
                        <td style={{ fontWeight: "600", color: "var(--color-primary-dark)" }}>{getIndonesianDay(log.date)}</td>
                        <td>{getIndonesianDate(log.date)}</td>
                        <td>
                          <span className={`badge-${log.status}`}>{log.status}</span>
                        </td>
                        <td style={{ fontSize: "0.85rem", fontStyle: log.notes ? "normal" : "italic", color: log.notes ? "var(--color-gray-800)" : "var(--color-gray-400)" }}>
                          {log.notes || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Rapor Belajar Digital (Report Cards list) */}
      <div>
        <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.25rem" }}>
          Rapor Belajar Digital & Grafik Pencapaian
        </h3>
        
        {reports.length > 0 && !detailsLoading && (
          <div style={{ marginBottom: "2rem" }}>
            <LineChart reports={reports} isCalistung={selectedChild?.program?.toLowerCase()?.includes("calistung")} />
          </div>
        )}

        {detailsLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="portal-card" style={{ padding: "2rem" }}>
                <div style={{ borderBottom: "1px solid var(--color-gray-100)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                  <div className="skeleton-pulse skeleton-title" style={{ width: "200px", marginBottom: "0.5rem" }} />
                  <div className="skeleton-pulse skeleton-text" style={{ width: "150px" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem", alignItems: "center" }} className="report-detail-layout">
                  <div className="form-grid" style={{ gap: "1rem", marginBottom: 0 }}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-gray-100)" }}>
                        <div className="skeleton-pulse skeleton-title" style={{ width: "45px", margin: "0 auto 0.5rem" }} />
                        <div className="skeleton-pulse skeleton-text" style={{ width: "65px", margin: "0 auto" }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div className="skeleton-pulse skeleton-circle" style={{ width: "180px", height: "180px" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="portal-card" style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ color: "var(--color-gray-500)" }}>Belum ada rapor digital yang diterbitkan untuk saat ini.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {reports.map((report) => {
              const isCalistung = selectedChild?.program?.toLowerCase()?.includes("calistung");
              return (
                <div key={report.id} className="portal-card" style={{ padding: "2rem" }}>
                  
                  {/* Card Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", borderBottom: "1px solid var(--color-gray-100)", paddingBottom: "1rem" }}>
                    <div>
                      <h4 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--color-gray-900)" }}>{report.module_name}</h4>
                      <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>
                        Diterbitkan pada {new Date(report.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="btn-portal-outline" style={{ padding: "0.5rem 1.15rem", fontSize: "0.8rem", display: "flex", gap: "0.5rem", alignItems: "center" }} onClick={() => triggerPrint(report)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        <span>Cetak Rapor PDF</span>
                      </button>
                      {(() => {
                        const existingCert = certificates.find(
                          (c) => c.report_id === report.id || (c.student_id === selectedChild.id && c.module_name?.toLowerCase() === report.module_name?.toLowerCase())
                        );
                        if (existingCert) {
                          return (
                            <a
                              href={`/verify/${existingCert.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-portal-outline"
                              style={{ 
                                padding: "0.5rem 1.15rem", 
                                fontSize: "0.8rem", 
                                display: "inline-flex", 
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

                  </div>

                  {/* Grid with Scores Cards and visual SVG Radar Chart */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem", alignItems: "center" }} className="report-detail-layout">
                    
                    {/* Score Metrics Grid */}
                    <div className="form-grid" style={{ gap: "1rem", marginBottom: 0 }}>
                      <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-gray-100)" }}>
                        <p style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.speaking_score}</p>
                        <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>
                          {isCalistung ? "Membaca" : "Speaking"}
                        </p>
                      </div>
                      <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-gray-100)" }}>
                        <p style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.grammar_score}</p>
                        <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>
                          {isCalistung ? "Menulis" : "Grammar"}
                        </p>
                      </div>
                      <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-gray-100)" }}>
                        <p style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.vocabulary_score}</p>
                        <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>
                          {isCalistung ? "Berhitung" : "Vocabulary"}
                        </p>
                      </div>
                      <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-gray-100)" }}>
                        <p style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.active_score}</p>
                        <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>
                          {isCalistung ? "Keaktifan" : "Active"}
                        </p>
                      </div>
                    </div>

                    {/* SVG Chart visualization */}
                    <div>
                      <RadarChart
                        speaking={report.speaking_score}
                        grammar={report.grammar_score}
                        vocabulary={report.vocabulary_score}
                        active={report.active_score}
                        isCalistung={isCalistung}
                      />
                    </div>

                  </div>

                  {/* Tutor Notes review block */}
                  {report.tutor_notes && (
                    <div style={{ borderLeft: "4px solid var(--color-accent)", paddingLeft: "1.25rem", marginTop: "2rem", backgroundColor: "rgba(166, 136, 73, 0.03)", padding: "1rem 1.25rem", borderRadius: "0 8px 8px 0" }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--color-accent)", textTransform: "uppercase", marginBottom: "4px" }}>Catatan Tutor Pendamping</p>
                      <p style={{ fontSize: "0.9rem", color: "var(--color-gray-700)", fontStyle: "italic", lineHeight: "1.6", margin: "0" }}>
                        &ldquo;{report.tutor_notes}&rdquo;
                      </p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}