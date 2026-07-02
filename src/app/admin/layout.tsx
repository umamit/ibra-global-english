"use client";

import React from 'react';
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import AICopilotWidget from "@/components/AICopilotWidget";
import posthog from "posthog-js";
import "@/app/dashboard.css";
import "@/app/dashboard-print.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  // State untuk dropdown accordion di sidebar
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    akademik: false,
    keuangan: false,
    komunikasi: false,
    pengguna: false,
  });

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  // Auto-expand kelompok menu aktif berdasarkan pathname saat ini
  useEffect(() => {
    const isAkademik = ["/admin/calendar", "/admin/online-schedule", "/admin/attendance", "/admin/reports", "/admin/placement-test", "/admin/curriculum"].includes(pathname);
    const isKeuangan = ["/admin/finance", "/admin/tax"].includes(pathname);
    const isKomunikasi = ["/admin/whatsapp", "/admin/announcements", "/admin/rag", "/admin/landing-page"].includes(pathname);
    const isPengguna = ["/admin/students", "/admin/tutors"].includes(pathname);

    const timer = setTimeout(() => {
      setOpenGroups({
        akademik: isAkademik,
        keuangan: isKeuangan,
        komunikasi: isKomunikasi,
        pengguna: isPengguna,
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Escape key handler untuk menutup sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileOpen]);

  const [newRegToast, setNewRegToast] = useState<string>("");
  const [newTestToast, setNewTestToast] = useState<string>("");

  // Fetch jumlah pendaftaran pending untuk badge notifikasi
  const fetchPendingCount = async (): Promise<void> => {
    try {
      const res = await fetch("/api/register", {
        credentials: "include",
        cache: "no-store",
      });
      const result = await res.json().catch(() => null);
      if (result && result.data) {
        setPendingCount(result.data.filter((r: { status: string }) => r.status === "pending").length);
      }
    } catch {
      // Silent fail untuk badge notifikasi agar tidak mengganggu UI
    }
  };

  useEffect(() => {
    // Ambil data awal
    setTimeout(() => {
      fetchPendingCount();
    }, 0);

    // 🔴 Realtime: Supabase WebSocket Channel untuk notifikasi instan
    const channel = supabase
      .channel("admin-realtime-all")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "registrations" },
        (payload) => {
          // Ada pendaftaran baru masuk!
          const name = payload.new?.student_name || "Seseorang";
          const program = payload.new?.program || "Program";
          setNewRegToast(`📩 Pendaftaran baru: ${name} (${program})`);
          setTimeout(() => setNewRegToast(""), 6000);
          fetchPendingCount();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "registrations" },
        () => {
          fetchPendingCount();
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "placement_test_submissions" },
        (payload) => {
          // Ada peserta placement test baru!
          const name = payload.new?.name || "Seseorang";
          const level = payload.new?.level || payload.new?.result_level || "";
          const levelText = level ? ` — Level: ${level}` : "";
          setNewTestToast(`📝 Placement test selesai: ${name}${levelText}`);
          setTimeout(() => setNewTestToast(""), 6000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Session checker using Supabase's built-in session management only
  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const checkSession = async (): Promise<void> => {
      if (typeof window === "undefined" || !isMounted) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // No session - redirect to login
          window.location.href = "/login";
          return;
        }

        // Check session expiry (default Supabase session is 1 hour)
        const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
        if (expiresAt > 0 && Date.now() > expiresAt) {
          await supabase.auth.signOut();
          window.location.href = "/login";
          return;
        }
      } catch (err) {
        console.error("Session check error:", err);
      }
    };

    checkSession();
    intervalId = setInterval(checkSession, 30000); // Cek setiap 30 detik

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [supabase]);

  const [adminName, setAdminName] = useState<string>("Admin");

  useEffect(() => {
    async function fetchAdminName(): Promise<void> {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setAdminName(user.user_metadata?.full_name || user.email!.split("@")[0]);
        }
      } catch (err) {
        console.warn("Gagal mengambil nama admin:", err);
      }
    }
    fetchAdminName();
  }, [supabase]);

  const handleLogout = async (): Promise<void> => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari portal Admin?")) {
      posthog.capture("admin_logged_out");
      posthog.reset();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    }
  };

  const isActive = (path: string): boolean => pathname === path;

  return (
    <div className={`dashboard-container ${mobileOpen ? "sidebar-open" : ""}`}>
      {/* 🔔 Realtime Toast Notifikasi Pendaftaran Baru */}
      {newRegToast && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 9999,
            background: "linear-gradient(135deg, #1a2a3a 0%, #0f1f2d 100%)",
            color: "#fff",
            borderRadius: "12px",
            padding: "14px 20px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(99,202,183,0.25)",
            fontSize: "0.9rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            maxWidth: "360px",
            animation: "slideInRight 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            borderLeft: "4px solid #63cab7",
          }}
        >
          <span style={{ fontSize: "1.3rem" }}>🔔</span>
          <span>{newRegToast}</span>
          <button
            onClick={() => setNewRegToast("")}
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
              fontSize: "1rem",
              lineHeight: 1,
              padding: "0 2px",
            }}
            aria-label="Tutup notifikasi"
          >
            ✕
          </button>
        </div>
      )}
      {/* 🔔 Realtime Toast Notifikasi Placement Test Selesai */}
      {newTestToast && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            position: "fixed",
            top: newRegToast ? "110px" : "24px",
            right: "24px",
            zIndex: 9999,
            background: "linear-gradient(135deg, #1a2d1a 0%, #0f1f0f 100%)",
            color: "#fff",
            borderRadius: "12px",
            padding: "14px 20px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(99,183,99,0.25)",
            fontSize: "0.9rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            maxWidth: "360px",
            animation: "slideInRight 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            borderLeft: "4px solid #63b763",
            transition: "top 0.3s ease",
          }}
        >
          <span style={{ fontSize: "1.3rem" }}>📝</span>
          <span>{newTestToast}</span>
          <button
            onClick={() => setNewTestToast("")}
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
              fontSize: "1rem",
              lineHeight: 1,
              padding: "0 2px",
            }}
            aria-label="Tutup notifikasi placement test"
          >
            ✕
          </button>
        </div>
      )}
      {/* Tombol Toggle Menu Mobile */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: "fixed",
          bottom: "max(20px, env(safe-area-inset-bottom, 20px))",
          right: "max(20px, env(safe-area-inset-right, 20px))",
          zIndex: 100,
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          backgroundColor: "var(--color-primary)",
          color: "white",
          border: "none",
          boxShadow: "var(--shadow-lg)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        className="mobile-toggle-btn"
        aria-expanded={mobileOpen}
        aria-controls="admin-sidebar"
        aria-label={mobileOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
      >
        {mobileOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        )}
      </button>

      {/* Sidebar Navigasi */}
      <aside
        id="admin-sidebar"
        className={`dashboard-sidebar ${mobileOpen ? "open" : ""}`}
        aria-hidden={!mobileOpen}
      >
        <div className="sidebar-brand">
          <img src="/assets/logo.png" alt="Ibra Logo" className="sidebar-brand-img" />
          <div className="sidebar-brand-text">
            <h2>Ibra Global English</h2>
            <p>Portal Admin</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {/* Ringkasan */}
          <Link
            href="/admin"
            className={`sidebar-nav-link ${isActive("/admin") ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
            <span>Ringkasan</span>
          </Link>

          {/* Akademik & Kelas */}
          <div className="sidebar-group">
            <button
              type="button"
              onClick={() => toggleGroup("akademik")}
              className={`sidebar-group-toggle ${["/admin/calendar", "/admin/online-schedule", "/admin/attendance", "/admin/reports", "/admin/placement-test", "/admin/curriculum"].includes(pathname) ? "active-parent" : ""}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              <span>Akademik & Kelas</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={`chevron-icon ${openGroups.akademik ? "rotated" : ""}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div className={`sidebar-group-items ${openGroups.akademik ? "expanded" : ""}`}>
              <Link href="/admin/calendar" className={`sidebar-sub-link ${isActive("/admin/calendar") ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
                <span className="bullet"></span>
                <span>Jadwal & Kalender</span>
              </Link>
              <Link href="/admin/online-schedule" className={`sidebar-sub-link ${isActive("/admin/online-schedule") ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
                <span className="bullet"></span>
                <span>Jadwal Kelas Online</span>
              </Link>
              <Link href="/admin/attendance" className={`sidebar-sub-link ${isActive("/admin/attendance") ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
                <span className="bullet"></span>
                <span>Absensi Harian</span>
              </Link>
              <Link href="/admin/reports" className={`sidebar-sub-link ${isActive("/admin/reports") ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
                <span className="bullet"></span>
                <span>Input Rapor</span>
              </Link>
              <Link href="/admin/placement-test" className={`sidebar-sub-link ${isActive("/admin/placement-test") ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
                <span className="bullet"></span>
                <span>Hasil Tes Penempatan</span>
              </Link>
              <Link href="/admin/curriculum" className={`sidebar-sub-link ${isActive("/admin/curriculum") ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
                <span className="bullet"></span>
                <span>Kelola Kurikulum</span>
              </Link>
            </div>
          </div>

          {/* Keuangan & Pajak */}
          <div className="sidebar-group">
            <button
              type="button"
              onClick={() => toggleGroup("keuangan")}
              className={`sidebar-group-toggle ${["/admin/finance", "/admin/tax"].includes(pathname) ? "active-parent" : ""}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span>Keuangan & Pajak</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={`chevron-icon ${openGroups.keuangan ? "rotated" : ""}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div className={`sidebar-group-items ${openGroups.keuangan ? "expanded" : ""}`}>
              <Link href="/admin/finance" className={`sidebar-sub-link ${isActive("/admin/finance") ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
                <span className="bullet"></span>
                <span>Kelola Keuangan / SPP</span>
              </Link>
              <Link href="/admin/tax" className={`sidebar-sub-link ${isActive("/admin/tax") ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
                <span className="bullet"></span>
                <span>SPT Pajak PT Perseorangan</span>
              </Link>
            </div>
          </div>

          {/* Komunikasi & Konten */}
          <div className="sidebar-group">
            <button
              type="button"
              onClick={() => toggleGroup("komunikasi")}
              className={`sidebar-group-toggle ${["/admin/whatsapp", "/admin/announcements", "/admin/rag", "/admin/landing-page"].includes(pathname) ? "active-parent" : ""}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              <span>Komunikasi & Konten</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={`chevron-icon ${openGroups.komunikasi ? "rotated" : ""}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div className={`sidebar-group-items ${openGroups.komunikasi ? "expanded" : ""}`}>
              <Link href="/admin/whatsapp" className={`sidebar-sub-link ${isActive("/admin/whatsapp") ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
                <span className="bullet"></span>
                <span>WhatsApp Gateway</span>
              </Link>
              <Link href="/admin/announcements" className={`sidebar-sub-link ${isActive("/admin/announcements") ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
                <span className="bullet"></span>
                <span>Pengumuman</span>
              </Link>
              <Link href="/admin/rag" className={`sidebar-sub-link ${isActive("/admin/rag") ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
                <span className="bullet"></span>
                <span>Basis Pengetahuan AI</span>
              </Link>
              <Link href="/admin/landing-page" className={`sidebar-sub-link ${isActive("/admin/landing-page") ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
                <span className="bullet"></span>
                <span>Kelola Landing Page</span>
              </Link>
            </div>
          </div>

          {/* Manajemen Pengguna */}
          <div className="sidebar-group">
            <button
              type="button"
              onClick={() => toggleGroup("pengguna")}
              className={`sidebar-group-toggle ${["/admin/students", "/admin/tutors"].includes(pathname) ? "active-parent" : ""}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>Manajemen Pengguna</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={`chevron-icon ${openGroups.pengguna ? "rotated" : ""}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div className={`sidebar-group-items ${openGroups.pengguna ? "expanded" : ""}`}>
              <Link href="/admin/students" className={`sidebar-sub-link ${isActive("/admin/students") ? "active" : ""}`} onClick={() => setMobileOpen(false)} style={{ position: "relative" }}>
                <span className="bullet"></span>
                <span>Kelola Siswa</span>
                {pendingCount > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "50%",
                    right: "0.75rem",
                    transform: "translateY(-50%)",
                    backgroundColor: "var(--color-red)",
                    color: "white",
                    borderRadius: "10px",
                    fontSize: "0.65rem",
                    fontWeight: "800",
                    padding: "0.1rem 0.4rem",
                    minWidth: "18px",
                    textAlign: "center",
                    animation: "pulse 2s infinite"
                  }}>
                    {pendingCount}
                  </span>
                )}
              </Link>
              <Link href="/admin/tutors" className={`sidebar-sub-link ${isActive("/admin/tutors") ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
                <span className="bullet"></span>
                <span>Kelola Tutor & Staf</span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="sidebar-footer" style={{ padding: "1rem", textAlign: "center" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--color-gray-400)" }}>Admin Dashboard v3.3.20</span>
        </div>
      </aside>

      <main className="dashboard-main">
        {/* Global Topbar */}
        <div className="global-topbar" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          paddingBottom: "1.25rem",
          borderBottom: "1px solid var(--color-gray-200)",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{
              backgroundColor: "var(--color-primary-light)",
              color: "var(--color-primary-dark)",
              fontWeight: "800",
              fontSize: "0.75rem",
              padding: "0.3rem 0.75rem",
              borderRadius: "20px",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Portal Admin
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", fontWeight: "500" }}>
              • Ibra Global English
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--color-gray-700)" }}>
              Halo, <strong style={{ color: "var(--color-primary-dark)" }}>{adminName}</strong>
            </span>
            <span className="user-badge" style={{ margin: 0 }}>Administrator</span>
            <button
              onClick={handleLogout}
              className="btn-logout"
              style={{
                width: "auto",
                padding: "0.4rem 0.85rem",
                fontSize: "0.8rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                marginLeft: "0.5rem"
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {children}
      </main>
      <AICopilotWidget />
    </div>
  );
}
