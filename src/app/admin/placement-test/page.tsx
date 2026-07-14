"use client";

export const dynamic = 'force-dynamic';

import React from 'react';
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import MetricCard from "@/components/MetricCard";
import AlertBanner from "@/components/AlertBanner";
import PortalTable from "@/components/PortalTable";

interface Submission {
  id: string;
  full_name: string;
  email: string;
  whatsapp_number: string;
  score: number;
  level: string;
  status: string;
  created_at: string;
}

interface Metrics {
  total: number;
  pending: number;
  contacted: number;
  enrolled: number;
}

interface StatusMsg {
  type: string;
  text: string;
}

interface PreviewResult {
  id: string;
  status: string;
  message?: string;
  preview?: {
    category: string;
    question: string;
    options: { text: string; score: number | string }[];
  };
}

interface HistoryEntry {
  id: string;
  created_at: string;
  admin_email?: string;
  category: string;
  action: string;
  status: string;
  old_question?: string;
  new_question?: string;
}

export default function AdminPlacementTest() {
  const supabase = createClient();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMsg, setStatusMsg] = useState<StatusMsg>({ type: "", text: "" });
  // Filters State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  // AI Follow-up states
  const [followUpStudent, setFollowUpStudent] = useState<Submission | null>(null);
  const [followUpMessage, setFollowUpMessage] = useState<string>("");
  const [followUpAiLoading, setFollowUpAiLoading] = useState<boolean>(false);

  // AI Diagnostics State
  const [aiConnectionStatus, setAiConnectionStatus] = useState<"idle" | "testing" | "success" | "failed">("idle");
  const [aiDiagnosticMessage, setAiDiagnosticMessage] = useState<string>("");

  // Metrics
  const [metrics, setMetrics] = useState<Metrics>({
    total: 0,
    pending: 0,
    contacted: 0,
    enrolled: 0
  });

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("placement_test_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
      calculateMetrics(data || []);
    } catch (err) {
      console.error("Gagal memuat data tes penempatan:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMsg({ type: "error", text: "Gagal memuat data: " + msg });
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (data: Submission[]): void => {
    const total = data.length;
    const pending = data.filter((s) => s.status === "pending").length;
    const contacted = data.filter((s) => s.status === "contacted").length;
    const enrolled = data.filter((s) => s.status === "enrolled").length;

    setMetrics({ total, pending, contacted, enrolled });
  };

  const testAiConnection = async () => {
    setAiConnectionStatus("testing");
    setAiDiagnosticMessage("");
    try {
      const res = await fetch("/api/admin/placement-test/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "ping" })
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setAiConnectionStatus("success");
        setAiDiagnosticMessage(data.message || "Groq AI sukses terhubung.");
      } else {
        setAiConnectionStatus("failed");
        setAiDiagnosticMessage(data.message || "Gagal menghubungi AI (Kunci tidak valid/Limit habis).");
      }
    } catch (err: any) {
      setAiConnectionStatus("failed");
      setAiDiagnosticMessage("Koneksi gagal: " + err.message);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (cancelled) return;
      await fetchData();
      await testAiConnection();
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("realtime-submissions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "placement_test_submissions" },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleUpdateStatus = async (id: string, newStatus: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from("placement_test_submissions")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setStatusMsg({ type: "success", text: `Status calon siswa berhasil diperbarui ke "${newStatus}"!` });
      setTimeout(() => setStatusMsg({ type: "", text: "" }), 3000);
      fetchData();
    } catch (err) {
      console.error("Gagal memperbarui status:", err);
      const msg = err instanceof Error ? err.message : String(err);
      alert("Gagal memperbarui status: " + msg);
    }
  };

  const handleDelete = async (id: string, name: string): Promise<void> => {
    if (confirm(`Apakah Anda yakin ingin menghapus data kuis milik "${name}"?`)) {
      try {
        const { error } = await supabase
          .from("placement_test_submissions")
          .delete()
          .eq("id", id);

        if (error) throw error;

        setStatusMsg({ type: "success", text: "Data hasil kuis berhasil dihapus." });
        setTimeout(() => setStatusMsg({ type: "", text: "" }), 3000);
        fetchData();
      } catch (err) {
        console.error("Gagal menghapus data:", err);
        const msg = err instanceof Error ? err.message : String(err);
        alert("Gagal menghapus data: " + msg);
      }
    }
  };

  // WhatsApp follow-up link generation
  const triggerWhatsAppFollowUp = (sub: Submission) => {
    const courseRecommendation = ["Beginner", "A1", "A2"].includes(sub.level)
      ? "Kids Program atau Fun Calistung"
      : ["Intermediate", "B1", "B2"].includes(sub.level)
        ? "Teens Program (Intermediate Class)"
        : "Teens Program (Advanced Class / TOEFL Prep)";

    const message = `Halo Kak ${sub.full_name}!\n\nKami dari *Ibra Global English Bobong* ingin mengucapkan selamat atas penyelesaian *Tes Penempatan Bahasa Inggris Online* Anda.\n\nBerikut hasil ringkasan tes Anda:\n📌 *Rekomendasi Level:* ${sub.level}\n📌 *Skor Tes:* ${sub.score} / 20\n📌 *Program Belajar:* ${courseRecommendation}\n\nTutor kami sangat merekomendasikan Anda untuk bergabung bersama kami di tingkat ini guna mengembangkan kompetensi secara optimal. Apakah Kak ${sub.full_name} berminat berkonsultasi mengenai jadwal kelas dan penawaran biaya khusus? \n\nKami tunggu kehadirannya! 😊`;

    setFollowUpStudent(sub);
    setFollowUpMessage(message);
  };

  const handleGenerateAiFollowUp = async () => {
    if (!followUpStudent) return;
    setFollowUpAiLoading(true);
    try {
      const courseRecommendation = ["Beginner", "A1", "A2"].includes(followUpStudent.level)
        ? "Kids Program atau Fun Calistung"
        : ["Intermediate", "B1", "B2"].includes(followUpStudent.level)
          ? "Teens Program (Intermediate Class)"
          : "Teens Program (Advanced Class / TOEFL Prep)";

      const res = await fetch("/api/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "placement-test-evaluation",
          payload: {
            name: followUpStudent.full_name,
            score: followUpStudent.score,
            level: followUpStudent.level,
            course: courseRecommendation
          }
        })
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setFollowUpMessage(data.reply);
      } else {
        alert("Gagal membuat draf AI: " + (data.error || "Error tidak dikenal"));
      }
    } catch (err) {
      alert("Gagal menghubungi server AI.");
    } finally {
      setFollowUpAiLoading(false);
    }
  };

  // Filter & Search Logic
  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.whatsapp_number.includes(searchTerm);
    const matchesStatus = statusFilter === "all" ? true : s.status === statusFilter;
    const matchesLevel = levelFilter === "all" ? true : s.level === levelFilter;

    return matchesSearch && matchesStatus && matchesLevel;
  });

  return (
    <div>
      <div className="dashboard-topbar">
        <div className="topbar-title">
          <h1>Hasil Tes Penempatan Publik</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Kelola data calon siswa baru hasil pengujian kuis interaktif publik
          </p>
        </div>
      </div>

      <AlertBanner message={statusMsg.text} type={statusMsg.type} />



      {/* Metrics Summary Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <MetricCard
          title="Total Pendaftar Kuis"
          value={metrics.total}
          description="Semua hasil pengerjaan kuis"
          color="primary"
        />

        <MetricCard
          title="Belum Dihubungi (Pending)"
          value={metrics.pending}
          description="Butuh tindak lanjut segera"
          color="yellow"
        />

        <MetricCard
          title="Sudah Dihubungi"
          value={metrics.contacted}
          description="Tahap penawaran / konsultasi"
          color="accent"
        />

        <MetricCard
          title="Terdaftar (Enrolled)"
          value={metrics.enrolled}
          description="Sukses menjadi siswa Ibra"
          color="green"
        />
      </div>

      {/* Diagnostik & Analisis Visual Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2.5rem" }} className="report-detail-layout">
        
        {/* Panel Diagnostik AI */}
        <div className="portal-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
              🤖 Status Koneksi & Diagnostik Groq AI
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", marginBottom: "1.5rem" }}>
              Verifikasi integrasi generator AI untuk tes penempatan secara real-time.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", backgroundColor: "var(--color-gray-50)", borderRadius: "8px", border: "1px solid var(--color-gray-150)" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Status API</span>
                <span style={{ 
                  padding: "0.25rem 0.75rem", 
                  borderRadius: "50px", 
                  fontSize: "0.75rem", 
                  fontWeight: "800",
                  backgroundColor: aiConnectionStatus === "success" ? "rgba(33, 108, 126, 0.1)" : aiConnectionStatus === "failed" ? "rgba(239, 68, 68, 0.1)" : "var(--color-gray-100)",
                  color: aiConnectionStatus === "success" ? "var(--color-primary)" : aiConnectionStatus === "failed" ? "#ef4444" : "var(--color-gray-500)"
                }}>
                  {aiConnectionStatus === "success" ? "CONNECTED" : aiConnectionStatus === "failed" ? "DISCONNECTED" : aiConnectionStatus === "testing" ? "TESTING..." : "IDLE"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", backgroundColor: "var(--color-gray-50)", borderRadius: "8px", border: "1px solid var(--color-gray-150)" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Model AI Aktif</span>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-gray-600)", fontFamily: "monospace" }}>llama-3.3-70b-versatile</span>
              </div>
            </div>

            {aiDiagnosticMessage && (
              <div style={{ 
                padding: "0.75rem 1rem", 
                borderRadius: "8px", 
                fontSize: "0.85rem", 
                fontWeight: "600",
                lineHeight: "1.5",
                marginBottom: "1.5rem",
                backgroundColor: aiConnectionStatus === "success" ? "rgba(33, 108, 126, 0.05)" : "rgba(239, 68, 68, 0.05)",
                color: aiConnectionStatus === "success" ? "var(--color-primary-dark)" : "#991b1b",
                border: aiConnectionStatus === "success" ? "1px solid rgba(33, 108, 126, 0.1)" : "1px solid rgba(239, 68, 68, 0.1)"
              }}>
                {aiDiagnosticMessage}
              </div>
            )}
          </div>

          <button 
            className="btn-portal-outline" 
            style={{ width: "100%", padding: "0.85rem", fontWeight: "800", borderRadius: "8px" }} 
            onClick={testAiConnection}
            disabled={aiConnectionStatus === "testing"}
          >
            {aiConnectionStatus === "testing" ? "Menguji Koneksi..." : "🔄 Cek Koneksi Groq AI"}
          </button>
        </div>

        {/* SVG Donut Chart Distribusi CEFR */}
        <div className="portal-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--color-gray-900)", alignSelf: "flex-start", width: "100%", marginBottom: "0.25rem" }}>
            🍩 Distribusi Level CEFR Siswa
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", alignSelf: "flex-start", width: "100%" }}>
            Sebaran tingkat penguasaan bahasa Inggris pendaftar tes penempatan.
          </p>

          {submissions.length === 0 ? (
            <div style={{ margin: "auto", padding: "2rem", color: "var(--color-gray-400)", fontWeight: "600", fontSize: "0.9rem" }}>
              Belum ada data hasil tes penempatan.
            </div>
          ) : (() => {
            const total = submissions.length || 1;
            const countA1 = submissions.filter(s => s.level === 'A1').length;
            const countA2 = submissions.filter(s => s.level === 'A2').length;
            const countB1 = submissions.filter(s => s.level === 'B1').length;
            const countB2 = submissions.filter(s => s.level === 'B2').length;
            const countC1 = submissions.filter(s => s.level === 'C1').length;

            const pA1 = Math.round((countA1 / total) * 100);
            const pA2 = Math.round((countA2 / total) * 100);
            const pB1 = Math.round((countB1 / total) * 100);
            const pB2 = Math.round((countB2 / total) * 100);
            const pC1 = Math.max(0, 100 - pA1 - pA2 - pB1 - pB2);

            const strokeDashA1 = `${(pA1 / 100) * 314} 314`;
            const strokeDashA2 = `${(pA2 / 100) * 314} 314`;
            const strokeDashB1 = `${(pB1 / 100) * 314} 314`;
            const strokeDashB2 = `${(pB2 / 100) * 314} 314`;
            const strokeDashC1 = `${(pC1 / 100) * 314} 314`;

            const offsetA2 = -((pA1 / 100) * 314);
            const offsetB1 = -(((pA1 + pA2) / 100) * 314);
            const offsetB2 = -(((pA1 + pA2 + pB1) / 100) * 314);
            const offsetC1 = -(((pA1 + pA2 + pB1 + pB2) / 100) * 314);

            return (
              <>
                <div style={{ position: "relative", width: "160px", height: "160px", margin: "1.5rem 0" }}>
                  <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="80" cy="80" r="50" fill="none" stroke="#f1f5f9" strokeWidth="16" />

                    {pA1 > 0 && (
                      <circle cx="80" cy="80" r="50" fill="none" stroke="#216c7e" strokeWidth="16" strokeDasharray={strokeDashA1} strokeDashoffset="0" />
                    )}
                    {pA2 > 0 && (
                      <circle cx="80" cy="80" r="50" fill="none" stroke="#164d57" strokeWidth="16" strokeDasharray={strokeDashA2} strokeDashoffset={offsetA2} />
                    )}
                    {pB1 > 0 && (
                      <circle cx="80" cy="80" r="50" fill="none" stroke="#A68849" strokeWidth="16" strokeDasharray={strokeDashB1} strokeDashoffset={offsetB1} />
                    )}
                    {pB2 > 0 && (
                      <circle cx="80" cy="80" r="50" fill="none" stroke="#8bb2bd" strokeWidth="16" strokeDasharray={strokeDashB2} strokeDashoffset={offsetB2} />
                    )}
                    {pC1 > 0 && (
                      <circle cx="80" cy="80" r="50" fill="none" stroke="#C5A86B" strokeWidth="16" strokeDasharray={strokeDashC1} strokeDashoffset={offsetC1} />
                    )}
                  </svg>

                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column"
                  }}>
                    <span style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-primary-dark)", lineHeight: 1 }}>{total}</span>
                    <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--color-gray-400)", textTransform: "uppercase", marginTop: "2px" }}>Siswa</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1rem", width: "100%", fontSize: "0.8rem", fontWeight: "700", borderTop: "1px solid var(--color-gray-100)", paddingTop: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#216c7e" }} />
                      <span style={{ color: "var(--color-gray-600)" }}>A1 (Beginner)</span>
                    </div>
                    <span style={{ color: "var(--color-gray-800)" }}>{countA1} ({pA1}%)</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#164d57" }} />
                      <span style={{ color: "var(--color-gray-600)" }}>A2 (Elementary)</span>
                    </div>
                    <span style={{ color: "var(--color-gray-800)" }}>{countA2} ({pA2}%)</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#A68849" }} />
                      <span style={{ color: "var(--color-gray-600)" }}>B1 (Intermediate)</span>
                    </div>
                    <span style={{ color: "var(--color-gray-800)" }}>{countB1} ({pB1}%)</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#8bb2bd" }} />
                      <span style={{ color: "var(--color-gray-600)" }}>B2 (Upper-Int)</span>
                    </div>
                    <span style={{ color: "var(--color-gray-800)" }}>{countB2} ({pB2}%)</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gridColumn: "span 2" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#C5A86B" }} />
                      <span style={{ color: "var(--color-gray-600)" }}>C1 (Advanced)</span>
                    </div>
                    <span style={{ color: "var(--color-gray-800)" }}>{countC1} ({pC1}%)</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="portal-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>

          {/* Search */}
          <div style={{ flex: "1 1 300px" }}>
            <input
              type="text"
              placeholder="Cari berdasarkan nama, email, atau nomor WhatsApp..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: "150px" }}>
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="pending">Belum Dihubungi</option>
              <option value="contacted">Sudah Dihubungi</option>
              <option value="enrolled">Terdaftar (Enrolled)</option>
            </select>
          </div>

          {/* Level Filter */}
          <div style={{ minWidth: "150px" }}>
            <select
              className="form-input"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <option value="all">Semua Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gray-500)" }}>
          <p>Memuat hasil tes penempatan...</p>
        </div>
      ) : (
        <PortalTable
          headers={[
            "No",
            "Calon Siswa",
            "WhatsApp",
            "Skor Kuis",
            "Rekomendasi Level",
            "Tanggal Tes",
            "Status Tindak Lanjut",
            { label: "Aksi Follow-Up", style: { textAlign: "right" } }
          ]}
          rows={filteredSubmissions}
          emptyMessage="Tidak ada data pendaftar kuis yang sesuai dengan kriteria filter."
          renderRow={(sub: Submission, idx: number) => (
            <tr key={sub.id}>
              <td style={{ fontWeight: "700" }}>{idx + 1}</td>
              <td>
                <strong style={{ color: "var(--color-gray-900)" }}>{sub.full_name}</strong>
                <p style={{ fontSize: "0.75rem", color: "var(--color-gray-500)" }}>{sub.email}</p>
              </td>
              <td style={{ fontWeight: "600" }}>{sub.whatsapp_number}</td>
              <td style={{ fontWeight: "800", color: "var(--color-primary-dark)", fontSize: "1.1rem" }}>
                {sub.score} <span style={{ fontSize: "0.8rem", color: "var(--color-gray-400)" }}>/ 20</span>
              </td>
              <td>
                <span className="user-badge" style={{
                  backgroundColor: ["Advanced", "C1"].includes(sub.level) ? "var(--color-green-light)" : ["Intermediate", "B1", "B2"].includes(sub.level) ? "var(--color-primary-light)" : "var(--color-accent-light)",
                  color: ["Advanced", "C1"].includes(sub.level) ? "var(--color-green-dark)" : ["Intermediate", "B1", "B2"].includes(sub.level) ? "var(--color-primary-dark)" : "var(--color-accent)",
                  fontWeight: "800",
                  fontSize: "0.8rem",
                  padding: "0.3rem 0.75rem"
                }}>
                  {sub.level}
                </span>
              </td>
              <td style={{ fontSize: "0.85rem" }}>
                {new Date(sub.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </td>
              <td>
                <select
                  className="form-input"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", height: "auto", fontWeight: "600", width: "150px" }}
                  value={sub.status}
                  onChange={(e) => handleUpdateStatus(sub.id, e.target.value)}
                >
                  <option value="pending">🔴 Pending</option>
                  <option value="contacted">🟡 Contacted</option>
                  <option value="enrolled">🟢 Enrolled</option>
                </select>
              </td>
              <td style={{ textAlign: "right" }}>
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                  <button
                    className="btn-portal-primary"
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", display: "inline-flex", gap: "0.25rem", alignItems: "center" }}
                    onClick={() => triggerWhatsAppFollowUp(sub)}
                    title="Kirim pesan penawaran otomatis via WhatsApp"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    <span>Hubungi</span>
                  </button>
                  <button
                    className="btn-portal-danger"
                    style={{ padding: "0.4rem 0.6rem", fontSize: "0.8rem" }}
                    onClick={() => handleDelete(sub.id, sub.full_name)}
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {/* AI Follow-Up Modal */}
      {followUpStudent && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          backdropFilter: "blur(4px)",
          padding: "1rem"
        }}>
          <div className="portal-card" style={{
            width: "100%",
            maxWidth: "600px",
            padding: "2rem",
            backgroundColor: "white",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)" }}>
                💬 Follow-Up Calon Siswa (AI Assistant)
              </h3>
              <button
                onClick={() => setFollowUpStudent(null)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--color-gray-400)" }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ fontSize: "0.85rem", backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "6px", border: "1px solid var(--color-gray-200)" }}>
                <div><strong>Nama:</strong> {followUpStudent.full_name}</div>
                <div><strong>WhatsApp:</strong> {followUpStudent.whatsapp_number}</div>
                <div><strong>Hasil Tes:</strong> Level {followUpStudent.level} (Skor {followUpStudent.score} / 20)</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-gray-700)" }}>Draf Pesan WhatsApp:</label>
                <textarea
                  className="form-input"
                  style={{ width: "100%", height: "200px", resize: "vertical", fontFamily: "inherit", fontSize: "0.9rem", padding: "0.75rem", lineHeight: "1.4" }}
                  value={followUpMessage}
                  onChange={(e) => setFollowUpMessage(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={handleGenerateAiFollowUp}
                  disabled={followUpAiLoading}
                  className="btn-portal-outline"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1.25rem" }}
                >
                  {followUpAiLoading ? (
                    <>
                      <svg style={{ animation: "spin 1s linear infinite", width: "12px", height: "12px", color: "currentColor" }} fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      <span>Mendraf...</span>
                    </>
                  ) : (
                    <span>🤖 Draf dengan AI</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const targetPhone = followUpStudent.whatsapp_number.startsWith("0")
                      ? "62" + followUpStudent.whatsapp_number.slice(1)
                      : followUpStudent.whatsapp_number.replace("+", "");
                    const encodedMessage = encodeURIComponent(followUpMessage);
                    window.open(`https://wa.me/${targetPhone}?text=${encodedMessage}`, "_blank");
                    setFollowUpStudent(null);
                  }}
                  className="btn-portal-primary"
                  style={{ padding: "0.6rem 1.25rem" }}
                >
                  🚀 Kirim WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
