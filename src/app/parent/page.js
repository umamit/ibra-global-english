"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ParentPortal() {
  const router = useRouter();
  const supabase = createClient();

  const [parentName, setParentName] = useState("Orang Tua");
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Print Mode State
  const [printReport, setPrintReport] = useState(null);

  // Aggregated Attendance Counts
  const [attendanceStats, setAttendanceStats] = useState({
    hadir: 0,
    sakit: 0,
    izin: 0,
    alfa: 0,
  });

  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar dari portal Orang Tua?")) {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    }
  };

  useEffect(() => {
    async function loadPortalData() {
      try {
        // 1. Get user profile
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        setParentName(user.user_metadata?.full_name || "Orang Tua Siswa");

        // 2. Fetch linked children (students)
        const { data: kids, error: errK } = await supabase
          .from("students")
          .select("id, name, age, program")
          .eq("parent_id", user.id);

        if (errK) throw errK;
        setChildren(kids || []);

        if (kids && kids.length > 0) {
          setSelectedChild(kids[0]);
        }
      } catch (err) {
        console.error("Gagal memuat portal orang tua:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPortalData();
  }, []);

  // Fetch details when child changes
  useEffect(() => {
    if (!selectedChild) return;

    async function loadChildDetails() {
      try {
        // Fetch Attendance
        const { data: attList, error: errA } = await supabase
          .from("attendance")
          .select("id, date, status, notes")
          .eq("student_id", selectedChild.id)
          .order("date", { ascending: false });

        if (errA) throw errA;
        setAttendance(attList || []);

        // Aggregate stats
        const counts = { hadir: 0, sakit: 0, izin: 0, alfa: 0 };
        attList?.forEach((a) => {
          if (counts[a.status] !== undefined) {
            counts[a.status]++;
          }
        });
        setAttendanceStats(counts);

        // Fetch Reports
        const { data: repList, error: errR } = await supabase
          .from("reports")
          .select("id, module_name, speaking_score, grammar_score, vocabulary_score, active_score, tutor_notes, created_at")
          .eq("student_id", selectedChild.id)
          .order("created_at", { ascending: false });

        if (errR) throw errR;
        setReports(repList || []);
      } catch (err) {
        console.error("Gagal memuat detail siswa:", err);
      }
    }

    loadChildDetails();
  }, [selectedChild]);

  // Dynamic printing
  const triggerPrint = (report) => {
    setPrintReport(report);
    // Jalankan window.print setelah render layout cetak
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div style={{ textAlign: "center", color: "var(--color-gray-500)" }}>
          <svg style={{ animation: "spin 1s linear infinite", width: "40px", height: "40px", marginBottom: "1rem", color: "var(--color-primary)" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <p style={{ fontWeight: "600" }}>Menghubungkan ke Portal...</p>
        </div>
      </div>
    );
  }

  // JIKA SEDANG MENCETAK RAPOR, SEMBUNYIKAN INTERFACE LAIN UNTUK CETAK PDF MURNI
  if (printReport) {
    return (
      <div style={{ padding: "1.5rem", backgroundColor: "white", minHeight: "100vh" }}>
        {/* Tombol kembali dari cetak (Hanya terlihat di layar komputer, akan disembunyikan otomatis oleh @media print) */}
        <div className="no-print" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)" }}>
            * Anda sedang melihat pratinjau cetak. Tekan Ctrl+P atau Cmd+P jika dialog print tidak terbuka otomatis.
          </p>
          <button className="btn-portal-outline" onClick={() => setPrintReport(null)}>
            ← Kembali ke Portal
          </button>
        </div>

        {/* Template Rapor yang Optimal untuk Dicetak */}
        <div className="printable-report">
          <div className="report-header-section">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <img src="/assets/logo.png" alt="Ibra Logo" style={{ width: "64px", height: "64px" }} />
              <div style={{ textAlign: "left" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "900", margin: "0" }}>IBRA GLOBAL ENGLISH</h1>
                <p style={{ fontSize: "0.8rem", fontWeight: "700" }}>LEARNING CENTRE BOBONG</p>
              </div>
            </div>
            <div className="report-logo-text">
              <h2>DIGITAL REPORT CARD</h2>
              <p>PROGRESS EVALUATION REPORT</p>
            </div>
          </div>

          <div className="student-info-grid">
            <div>
              <p><strong>Nama Siswa:</strong> {selectedChild?.name}</p>
              <p><strong>Program Belajar:</strong> {selectedChild?.program}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p><strong>Tanggal Terbit:</strong> {new Date(printReport.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
              <p><strong>ID Evaluasi:</strong> {printReport.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", borderBottom: "1px solid black", paddingBottom: "0.35rem", marginBottom: "1.25rem" }}>
            EVALUASI KOMPETENSI MODUL: {printReport.module_name.toUpperCase()}
          </h3>

          <div className="score-card-grid">
            <div className="score-display-card">
              <p className="score-num">{printReport.speaking_score}</p>
              <p className="score-label">Speaking</p>
            </div>
            <div className="score-display-card">
              <p className="score-num">{printReport.grammar_score}</p>
              <p className="score-label">Grammar</p>
            </div>
            <div className="score-display-card">
              <p className="score-num">{printReport.vocabulary_score}</p>
              <p className="score-label">Vocabulary</p>
            </div>
            <div className="score-display-card">
              <p className="score-num">{printReport.active_score}</p>
              <p className="score-label">Keaktifan</p>
            </div>
          </div>

          <div className="notes-block">
            <h4>Catatan & Ulasan Tutor:</h4>
            <p style={{ fontStyle: "italic", lineHeight: "1.6" }}>
              "{printReport.tutor_notes || "Siswa menunjukkan antusiasme yang baik selama pengerjaan modul belajar ini. Pertahankan konsistensi latihan bicaranya."}"
            </p>
          </div>

          <div className="signature-block">
            <div className="sig-col">
              <p>Mengetahui,</p>
              <p><strong>Orang Tua Siswa</strong></p>
              <div className="sig-space"></div>
              <p>____________________</p>
            </div>
            <div className="sig-col">
              <p>Bobong, Taliabu</p>
              <p><strong>Tutor Pendamping</strong></p>
              <div className="sig-space"></div>
              <p><strong>Ibra Global English</strong></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar Ringkas untuk Orang Tua */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <img src="/assets/logo.png" alt="Ibra Logo" className="sidebar-brand-img" />
          <div className="sidebar-brand-text">
            <h2>Ibra English</h2>
            <p>Portal Orang Tua</p>
          </div>
        </div>

        <div className="sidebar-nav">
          <div className="sidebar-nav-link active">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Kemajuan Belajar</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Log Keluar</span>
          </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div className="topbar-title">
            <h1>Selamat Datang, Bapak/Ibu</h1>
            <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
              Silakan pantau absensi harian dan hasil evaluasi belajar anak secara real-time.
            </p>
          </div>
          <div className="topbar-user" style={{ gap: "1rem" }}>
            <span className="user-badge">{parentName}</span>
          </div>
        </div>

        {children.length === 0 ? (
          <div className="portal-card" style={{ padding: "3rem", textAlign: "center", borderLeft: "5px solid var(--color-accent)" }}>
            <svg style={{ color: "var(--color-accent)", width: "48px", height: "48px", marginBottom: "1rem" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>Siswa Belum Dipasangkan</h3>
            <p style={{ color: "var(--color-gray-600)", fontSize: "0.95rem", maxWidth: "550px", margin: "0 auto", lineHeight: "1.6" }}>
              Akun orang tua Anda belum dihubungkan dengan data profil siswa. Silakan hubungi <strong>Tutor Pendamping</strong> di kelas atau hubungi Admin Ibra Global English Bobong agar nama anak Anda segera dikaitkan ke akun portal ini.
            </p>
          </div>
        ) : (
          <>
            {/* Navigasi Tab Siswa (Jika ada lebih dari 1 anak) */}
            {children.length > 1 && (
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
                {children.map((child) => (
                  <button
                    key={child.id}
                    className={`btn-portal-outline ${selectedChild?.id === child.id ? "active" : ""}`}
                    onClick={() => setSelectedChild(child)}
                    style={{
                      backgroundColor: selectedChild?.id === child.id ? "var(--color-primary-light)" : "transparent",
                      color: selectedChild?.id === child.id ? "var(--color-primary-dark)" : "var(--color-gray-600)",
                    }}
                  >
                    {child.name} ({child.program})
                  </button>
                ))}
              </div>
            )}

            {/* Informasi Ringkas Anak Aktif */}
            <div className="portal-card" style={{ marginBottom: "2.5rem", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg, var(--color-primary-light) 0%, rgba(255,255,255,0) 100%)", borderLeft: "5px solid var(--color-primary)" }}>
              <div>
                <p style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase" }}>Siswa yang Dipantau</p>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-gray-900)" }}>{selectedChild?.name}</h2>
                <p style={{ fontSize: "0.9rem", color: "var(--color-gray-600)", fontWeight: "600" }}>{selectedChild?.program} (Usia {selectedChild?.age} tahun)</p>
              </div>
              <div className="user-badge" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
                Siswa Aktif
              </div>
            </div>

            {/* Grid Informasi Utama */}
            <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "2rem" }}>
              
              {/* Kolom Kiri: Riwayat Kehadiran */}
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1rem" }}>Riwayat Kehadiran</h3>
                
                {/* Ringkasan Statistik */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginBottom: "1.5rem" }}>
                  <div style={{ textAlign: "center", padding: "0.5rem", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-white)" }}>
                    <p style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--color-green)" }}>{attendanceStats.hadir}</p>
                    <p style={{ fontSize: "0.65rem", fontWeight: "700", textTransform: "uppercase" }}>Hadir</p>
                  </div>
                  <div style={{ textAlign: "center", padding: "0.5rem", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-white)" }}>
                    <p style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--color-yellow)" }}>{attendanceStats.sakit}</p>
                    <p style={{ fontSize: "0.65rem", fontWeight: "700", textTransform: "uppercase" }}>Sakit</p>
                  </div>
                  <div style={{ textAlign: "center", padding: "0.5rem", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-white)" }}>
                    <p style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--color-primary)" }}>{attendanceStats.izin}</p>
                    <p style={{ fontSize: "0.65rem", fontWeight: "700", textTransform: "uppercase" }}>Izin</p>
                  </div>
                  <div style={{ textAlign: "center", padding: "0.5rem", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-white)" }}>
                    <p style={{ fontSize: "1.1rem", fontWeight: "900", color: "#ef4444" }}>{attendanceStats.alfa}</p>
                    <p style={{ fontSize: "0.65rem", fontWeight: "700", textTransform: "uppercase" }}>Alfa</p>
                  </div>
                </div>

                {/* List Kehadiran */}
                <div className="table-wrapper" style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <table className="portal-table">
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.length === 0 ? (
                        <tr>
                          <td colSpan="2" style={{ textAlign: "center", padding: "2rem 0", color: "var(--color-gray-500)" }}>
                            Belum ada riwayat absensi.
                          </td>
                        </tr>
                      ) : (
                        attendance.map((log) => (
                          <tr key={log.id}>
                            <td style={{ fontSize: "0.85rem", fontWeight: "600" }}>
                              {new Date(log.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td>
                              <span className={`badge-${log.status}`}>{log.status}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Kolom Kanan: Rapor Evaluasi Modul */}
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1rem" }}>Rapor Belajar Digital</h3>
                
                {reports.length === 0 ? (
                  <div className="portal-card" style={{ padding: "3rem", textAlign: "center" }}>
                    <p style={{ color: "var(--color-gray-500)" }}>Belum ada evaluasi nilai / rapor digital yang diterbitkan untuk saat ini.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {reports.map((report) => (
                      <div key={report.id} className="portal-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", borderBottom: "1px solid var(--color-gray-100)", paddingBottom: "0.75rem" }}>
                          <div>
                            <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--color-gray-900)" }}>{report.module_name}</h4>
                            <p style={{ fontSize: "0.75rem", color: "var(--color-gray-500)" }}>
                              Diterbitkan pada {new Date(report.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                          </div>
                          <button className="btn-portal-outline" style={{ padding: "0.45rem 1rem", fontSize: "0.8rem" }} onClick={() => triggerPrint(report)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                            <span>Cetak Rapor</span>
                          </button>
                        </div>

                        {/* Nilai-nilai */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.25rem" }}>
                          <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
                            <p style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.speaking_score}</p>
                            <p style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase" }}>Speaking</p>
                          </div>
                          <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
                            <p style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.grammar_score}</p>
                            <p style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase" }}>Grammar</p>
                          </div>
                          <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
                            <p style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.vocabulary_score}</p>
                            <p style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase" }}>Vocabulary</p>
                          </div>
                          <div style={{ textAlign: "center", backgroundColor: "var(--color-gray-50)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
                            <p style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>{report.active_score}</p>
                            <p style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase" }}>Keaktifan</p>
                          </div>
                        </div>

                        {/* Catatan Tutor */}
                        {report.tutor_notes && (
                          <div style={{ borderLeft: "3px solid var(--color-accent)", paddingLeft: "1rem", marginTop: "1rem" }}>
                            <p style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--color-accent)", textTransform: "uppercase", marginBottom: "0.25rem" }}>Ulasan Tutor Pendamping</p>
                            <p style={{ fontSize: "0.85rem", color: "var(--color-gray-600)", fontStyle: "italic", lineHeight: "1.5" }}>
                              "{report.tutor_notes}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  );
}
