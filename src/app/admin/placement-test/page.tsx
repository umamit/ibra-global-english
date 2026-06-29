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
  const [regenerating, setRegenerating] = useState<boolean>(false);

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewResult, setPreviewResult] = useState<PreviewResult[] | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");

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

  const fetchCategories = async (): Promise<void> => {
    const { data, error } = await supabase.from("placement_test_questions").select("category").order("category");
    if (error) return;
    const unique = Array.from(new Set((data || []).map((r: { category: string }) => r.category).filter(Boolean)));
    setCategories(unique);
  };

  const fetchHistory = async (): Promise<void> => {
    setLoadingHistory(true);
    const { data, error } = await supabase.from("placement_test_regenerate_logs").select("*").order("created_at", { ascending: false }).limit(20);
    if (error) setStatusMsg({ type: "error", text: "Gagal memuat history regenerate." });
    else setHistory(data || []);
    setLoadingHistory(false);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (cancelled) return;
      await fetchData();
      await fetchCategories();
      await fetchHistory();
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
    const targetPhone = sub.whatsapp_number.startsWith("0")
      ? "62" + sub.whatsapp_number.slice(1)
      : sub.whatsapp_number.replace("+", "");

    const courseRecommendation = sub.level === "Beginner"
      ? "Kids Program atau Basic Teens"
      : sub.level === "Intermediate"
        ? "Teens Program (Intermediate)"
        : "Teens Program (Advanced / TOEFL Prep)";

    const message = `Halo Kak ${sub.full_name}!\n\nKami dari *Ibra Global English Bobong* ingin mengucapkan selamat atas penyelesaian *Tes Penempatan Bahasa Inggris Online* Anda.\n\nBerikut hasil ringkasan tes Anda:\n📌 *Rekomendasi Level:* ${sub.level}\n📌 *Skor Tes:* ${sub.score} / 15\n📌 *Program Belajar:* ${courseRecommendation}\n\nTutor kami sangat merekomendasikan Anda untuk bergabung bersama kami di tingkat ini guna mengembangkan kompetensi secara optimal. Apakah Kak ${sub.full_name} berminat berkonsultasi mengenai jadwal kelas dan penawaran biaya khusus? \n\nKami tunggu kehadirannya! 😊`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${targetPhone}?text=${encodedMessage}`, "_blank");
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

      {/* Admin tabs / AI actions placeholder */}
      <div className="portal-card" style={{ padding: "1.25rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <select className="form-input" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ minWidth: "220px" }}>
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
          <button className="btn-portal-outline" disabled={regenerating} onClick={async () => {
            setRegenerating(true);
            setStatusMsg({ type: "", text: "" });
            setPreviewResult(null);
            try {
              const res = await fetch("/api/admin/placement-test/regenerate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ replaceAll: selectedCategory === "all", category: selectedCategory !== "all" ? selectedCategory : undefined, mode: "preview" })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Gagal preview");
              setPreviewResult(data.results);
              setStatusMsg({ type: "success", text: "Preview soalAI berhasil dimuat." });
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              setStatusMsg({ type: "error", text: msg });
            } finally {
              setRegenerating(false);
            }
          }}>{regenerating ? "Memproses..." : "Preview Soal AI"}</button>
          <button className="btn-portal-primary" disabled={regenerating} onClick={async () => {
            setRegenerating(true);
            setStatusMsg({ type: "", text: "" });
            try {
              const res = await fetch("/api/admin/placement-test/regenerate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ replaceAll: selectedCategory === "all", category: selectedCategory !== "all" ? selectedCategory : undefined, mode: "apply" })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Gagal regenerate");
              const successCount = data.results?.filter((r: { status: string }) => r.status === "success").length || 0;
              setStatusMsg({ type: "success", text: `Regenerate selesai. ${successCount} soal berhasil diperbarui.` });
              fetchHistory();
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              setStatusMsg({ type: "error", text: msg });
            } finally {
              setRegenerating(false);
            }
          }}>{regenerating ? "Memproses..." : "Regenerate Soal dengan AI"}</button>
          <span style={{ fontSize: "0.85rem", color: "var(--color-gray-500)" }}>Soal mengikuti standar CEFR A1-C2 dan bisa diganti kapan saja.</span>
        </div>
      </div>

      {/* Preview Modal */}
      {previewResult && (
        <div className="portal-card" style={{ padding: "1.5rem", marginBottom: "2rem", border: "2px dashed var(--color-accent)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0 }}>Preview Soal Hasil Generate AI</h3>
            <button className="btn-portal-outline" onClick={() => setPreviewResult(null)}>Tutup</button>
          </div>
          <div style={{ display: "grid", gap: "1rem" }}>
            {previewResult.map((r) => (
              <div key={r.id} style={{ padding: "1rem", border: "1px solid #eee", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", marginBottom: "0.5rem" }}>
                  Status: <strong>{r.status}</strong> | ID: {r.id}
                </div>
                {r.message && <div>{r.message}</div>}
                {r.preview && (
                  <div>
                    <div><strong>Kategori:</strong> {r.preview.category}</div>
                    <div style={{ margin: "0.5rem 0" }}><strong>Soal:</strong> {r.preview.question}</div>
                    <ul style={{ paddingLeft: "1.25rem" }}>
                      {r.preview.options.map((opt, i) => (
                        <li key={i}>{opt.text} {Number(opt.score) === 1 ? "✅ (jawaban benar)" : ""}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
                {sub.score} <span style={{ fontSize: "0.8rem", color: "var(--color-gray-400)" }}>/ 15</span>
              </td>
              <td>
                <span className="user-badge" style={{
                  backgroundColor: sub.level === "Advanced" ? "var(--color-green-light)" : sub.level === "Intermediate" ? "var(--color-primary-light)" : "var(--color-accent-light)",
                  color: sub.level === "Advanced" ? "var(--color-green-dark)" : sub.level === "Intermediate" ? "var(--color-primary-dark)" : "var(--color-accent)",
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
      {/* History regenerate */}
      <div className="portal-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>History Regenerate Soal</h3>
          <button className="btn-portal-outline" onClick={fetchHistory} disabled={loadingHistory}>{loadingHistory ? "Memuat..." : "Refresh"}</button>
        </div>
        {history.length === 0 ? (
          <p style={{ color: "var(--color-gray-500)" }}>Belum ada riwayat regenerate soal.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
                  <th style={{ padding: "0.5rem" }}>Waktu</th>
                  <th style={{ padding: "0.5rem" }}>Admin</th>
                  <th style={{ padding: "0.5rem" }}>Kategori</th>
                  <th style={{ padding: "0.5rem" }}>Aksi</th>
                  <th style={{ padding: "0.5rem" }}>Status</th>
                  <th style={{ padding: "0.5rem" }}>Soal Lama</th>
                  <th style={{ padding: "0.5rem" }}>Soal Baru</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "0.5rem", fontSize: "0.85rem" }}>{new Date(h.created_at).toLocaleString("id-ID")}</td>
                    <td style={{ padding: "0.5rem", fontSize: "0.85rem" }}>{h.admin_email || "-"}</td>
                    <td style={{ padding: "0.5rem", fontSize: "0.85rem" }}>{h.category}</td>
                    <td style={{ padding: "0.5rem", fontSize: "0.85rem" }}>{h.action}</td>
                    <td style={{ padding: "0.5rem", fontSize: "0.85rem" }}>{h.status}</td>
                    <td style={{ padding: "0.5rem", fontSize: "0.85rem", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.old_question}</td>
                    <td style={{ padding: "0.5rem", fontSize: "0.85rem", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.new_question || "-"}</td>
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
