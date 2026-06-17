"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch jumlah pendaftaran pending untuk badge notifikasi
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await fetch("/api/register");
        const result = await res.json();
        if (result.data) {
          setPendingCount(result.data.filter(r => r.status === "pending").length);
        }
      } catch {}
    };
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 60000); // refresh tiap 1 menit
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      if (typeof window === "undefined") return;

      let loginTimeStr = sessionStorage.getItem("login_time");
      if (!loginTimeStr && document.cookie.includes("login_time=active")) {
        loginTimeStr = Date.now().toString();
        sessionStorage.setItem("login_time", loginTimeStr);
      }

      if (!loginTimeStr) {
        // Tab baru dibuka, sessionStorage kosong! Log out otomatis.
        await supabase.auth.signOut();
        document.cookie = "login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/login";
        return;
      }

      // Check max-age 1 jam (3600000 ms)
      const loginTime = parseInt(loginTimeStr);
      const oneHour = 3600 * 1000;
      if (Date.now() - loginTime > oneHour) {
        await supabase.auth.signOut();
        sessionStorage.removeItem("login_time");
        document.cookie = "login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        alert("Sesi login Admin Anda telah berakhir (maksimal 1 jam). Silakan masuk kembali.");
        window.location.href = "/login";
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 15000); // Cek setiap 15 detik

    // Cleanup: jika pengguna berpindah rute keluar dari rute /admin (tombol back atau link)
    return () => {
      clearInterval(interval);
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/admin")) {
        supabase.auth.signOut();
        sessionStorage.clear();
        document.cookie = "login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    };
  }, [supabase]);

  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar dari portal Admin?")) {
      await supabase.auth.signOut();
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        document.cookie = "login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      router.push("/login");
      router.refresh();
    }
  };

  const isActive = (path) => pathname === path;

  return (
    <div className="dashboard-container">
      {/* Tombol Toggle Menu Mobile */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
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
        aria-label="Toggle Sidebar"
      >
        {mobileOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        )}
      </button>

      {/* Sidebar Navigasi */}
      <aside className={`dashboard-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <img src="/assets/logo.png" alt="Ibra Logo" className="sidebar-brand-img" />
          <div className="sidebar-brand-text">
            <h2>Ibra English</h2>
            <p>Portal Admin / Tutor</p>
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
            href="/admin/landing-page"
            className={`sidebar-nav-link ${isActive("/admin/landing-page") ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            <span>Kelola Landing Page</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Keluar Portal</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}
