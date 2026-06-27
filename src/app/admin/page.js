"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import posthog from "posthog-js";

export default function AdminDashboard() {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari portal Admin?")) {
      posthog.capture("admin_logged_out");
      posthog.reset();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    }
  };

  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalParents: 0,
    presentToday: 0,
    totalReports: 0,
  });

  // AI Insights States
  const [aiInsights, setAiInsights] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const fetchAiInsights = async (force = false) => {
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "insights", forceRefresh: force })
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setAiInsights(data.reply);
      } else {
        setAiError(data.error || "Gagal mengambil ulasan AI.");
      }
    } catch (err) {
      setAiError("Gagal terhubung dengan server AI.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 1. Dapatkan nama admin
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setAdminName(user.user_metadata?.full_name || user.email.split("@")[0]);
        }

        // 2. Fetch total siswa
        const { count: studentCount, error: errS } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true });

        // 3. Fetch total akun orang tua
        const { count: parentCount, error: errP } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "parent");

        // 4. Fetch absensi hadir hari ini
        const todayObj = new Date();
        const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, "0")}-${String(todayObj.getDate()).padStart(2, "0")}`;
        const { count: attendanceCount, error: errA } = await supabase
          .from("attendance")
          .select("*", { count: "exact", head: true })
          .eq("date", todayStr)
          .eq("status", "hadir");

        // 5. Fetch total rapor modul
        const { count: reportCount, error: errR } = await supabase
          .from("reports")
          .select("*", { count: "exact", head: true });

        setStats({
          totalStudents: studentCount || 0,
          totalParents: parentCount || 0,
          presentToday: attendanceCount || 0,
          totalReports: reportCount || 0,
        });
      } catch (err) {
        console.error("Gagal memuat statistik dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (cancelled) return;
      if (!loading) {
        await fetchAiInsights();
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [loading]);

  /**
   * Render AI insights text safely as plain text with basic line breaks
   */
  const renderSafeInsights = (text) => {
    if (!text) return null;
    // Strip HTML tags for safety, preserve line breaks
    const safeText = text
      .replace(/<[^>]*>/g, "")
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, '"')
      .replace(/&#039;/g, "'");
    
    return safeText.split("\n").map((line, i) => (
      <p key={i} style={{ margin: "0.25rem 0" }}>
        {line || "\u00A0"}
      </p>
    ));
  };

  return (
    <div>
      <div className="dashboard-topbar">
        <div className="topbar-title">
          <h1>Ringkasan</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Selamat datang kembali, <strong style={{ color: "var(--color-primary-dark)" }}>{adminName}</strong>!
          </p>
        </div>
        <div className="topbar-user">
          <span className="user-badge">Administrator</span>
          <button onClick={handleLogout} className="btn-logout" style={{ width: "auto", padding: "0.4rem 0.85rem", fontSize: "0.8rem", display: "inline-flex", marginLeft: "0.5rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--color-gray-500)" }}>
          <svg style={{ animation: "spin 1s linear infinite", width: "32px", height: "32px", marginBottom: "1rem" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <p>Memuat ringkasan data...</p>
        </div>
      ) : (
        <>
          {/* Grid Statistik */}
          <div className="stat-grid">
            <div className="portal-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Total Siswa</span>
                <div className="stat-card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
              </div>
              <p className="stat-card-value">{stats.totalStudents}</p>
            </div>

            <div className="portal-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Akun Orang Tua</span>
                <div className="stat-card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
              </div>
              <p className="stat-card-value">{stats.totalParents}</p>
            </div>

            <div className="portal-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Hadir Hari Ini</span>
                <div className="stat-card-icon" style={{ backgroundColor: "var(--color-green-light)", color: "var(--color-green)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
              <p className="stat-card-value">{stats.presentToday}</p>
            </div>

            <div className="portal-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Rapor Terbit</span>
                <div className="stat-card-icon" style={{ backgroundColor: "#fef9c3", color: "#a16207" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
              </div>
              <p className="stat-card-value">{stats.totalReports}</p>
            </div>
          </div>

          {/* AI Insights Section */}
          <div className="portal-card" style={{ padding: "2rem", marginBottom: "1.5rem", borderLeft: "5px solid var(--color-accent)", background: "linear-gradient(135deg, rgba(166, 136, 73, 0.05) 0%, rgba(255,255,255,0) 100%)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.25rem" }}>🧠</span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--color-gray-900)", margin: 0 }}>Analisis AI Insights & Rekomendasi</h3>
              </div>
              <button 
                onClick={() => fetchAiInsights(true)} 
                style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: "4px", backgroundColor: "rgba(166, 136, 73, 0.1)", color: "var(--color-accent)", border: "1px solid rgba(166, 136, 73, 0.2)", cursor: "pointer", fontWeight: "bold" }}
                disabled={aiLoading}
              >
                {aiLoading ? "⏳ Memproses..." : "🔄 Refresh Analisis"}
              </button>
            </div>
            {aiLoading ? (
              <div className="skeleton-pulse" style={{ height: "90px", borderRadius: "8px" }} />
            ) : aiError ? (
              <p style={{ color: "var(--color-red)", fontSize: "0.85rem", margin: 0 }}>⚠️ Gagal memuat analisis: {aiError}</p>
            ) : (
              <div style={{ fontSize: "0.875rem", color: "var(--color-gray-700)", lineHeight: 1.6 }}>
                {renderSafeInsights(aiInsights)}
              </div>
            )}
          </div>

          {/* Banner Menu Pintasan */}
          <div className="portal-card" style={{ padding: "2.5rem", background: "linear-gradient(135deg, var(--color-primary-light) 0%, rgba(255,255,255,0) 100%)", borderLeft: "5px solid var(--color-primary)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>Pintasan Cepat Tutor</h3>
            <p style={{ color: "var(--color-gray-600)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>Gunakan tombol di bawah ini untuk mengelola siswa baru, mencatat absensi harian kelas, atau memasukkan nilai laporan evaluasi belajar.</p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/admin/students" className="btn-portal-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>Siswa Baru</span>
              </Link>
              <Link href="/admin/attendance" className="btn-portal-outline">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                <span>Catat Absensi</span>
              </Link>
              <Link href="/admin/reports" className="btn-portal-outline">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="12 8 12 12 16 14"/></svg>
                <span>Input Nilai Rapor</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}