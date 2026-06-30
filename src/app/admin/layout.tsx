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
    fetchPendingCount();

    // 🔴 Realtime: Supabase WebSocket Channel untuk notifikasi instan
    const channel = supabase
      .channel("admin-registrations-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "registrations" },
        (payload) => {
          // Ada pendaftaran baru masuk!
          const name = payload.new?.student_name || "Seseorang";
          const program = payload.new?.program || "Program";
          setNewRegToast(`📩 Pendaftaran baru: ${name} (${program})`);
          setTimeout(() => setNewRegToast(""), 6000);
          // Refresh badge count
          fetchPendingCount();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "registrations" },
        () => {
          // Status pendaftaran berubah (approve/reject) - refresh badge
          fetchPendingCount();
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
          <Link
            href="/admin"
            className={`sidebar-nav-link ${isActive("/admin") ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
            <span>Ringkasan</span>
          </Link>

          <Link
            href="/admin/students"
            className={`sidebar-nav-link ${isActive("/admin/students") ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
            style={{ position: "relative" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
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

          <Link
            href="/admin/whatsapp"
            className={`sidebar-nav-link ${isActive("/admin/whatsapp") ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>WhatsApp Gateway</span>
          </Link>

          <Link
            href="/admin/attendance"
            className={`sidebar-nav-link ${isActive("/admin/attendance") ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span>Absensi Harian</span>
          </Link>

          <Link
            href="/admin/reports"
            className={`sidebar-nav-link ${isActive("/admin/reports") ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="12 8 12 12 16 14"/></svg>
            <span>Input Rapor</span>
          </Link>

          <Link
            href="/admin/finance"
            className={`sidebar-nav-link ${isActive("/admin/finance") ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span>Kelola Keuangan / SPP</span>
          </Link>

          <Link
            href="/admin/tax"
            className={`sidebar-nav-link ${isActive("/admin/tax") ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
            <span>SPT Pajak PT Perseorangan</span>
          </Link>

          <Link
            href="/admin/placement-test"
            className={`sidebar-nav-link ${isActive("/admin/placement-test") ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            <span>Hasil Tes Penempatan</span>
          </Link>

          <Link
            href="/admin/calendar"
            className={`sidebar-nav-link ${isActive("/admin/calendar") ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>Jadwal & Kalender</span>
          </Link>

          <Link
            href="/admin/announcements"
            className={`sidebar-nav-link ${isActive("/admin/announcements") ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/></svg>
            <span>Pengumuman</span>
          </Link>

          <Link
            href="/admin/online-schedule"
            className={`sidebar-nav-link ${isActive("/admin/online-schedule") ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10l4.553-2.277A1 1 0 0 1 21 8.623v6.754a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/></svg>
            <span>Jadwal Kelas Online</span>
          </Link>

          <Link
            href="/admin/tutors"
            className={`sidebar-nav-link ${isActive("/admin/tutors") ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Kelola Tutor & Staf</span>
          </Link>

          <Link
            href="/admin/curriculum"
            className={`sidebar-nav-link ${isActive("/admin/curriculum") ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <span>Kelola Kurikulum</span>
          </Link>
          <Link
            href="/admin/rag"
            className={`sidebar-nav-link ${isActive("/admin/rag") ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M12 2v2"/><path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
            <span>Basis Pengetahuan AI</span>
          </Link>

          <Link
            href="/admin/landing-page"
            className={`sidebar-nav-link ${isActive("/admin/landing-page") ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            <span>Kelola Landing Page</span>
          </Link>


        </nav>

        <div className="sidebar-footer" style={{ padding: "1rem", textAlign: "center" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--color-gray-400)" }}>Admin Dashboard v1.0</span>
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
