"use client";

import React from "react";
import Link from "next/link";

interface AdminSidebarNavProps {
  pathname: string;
  pendingCount: number;
  mobileOpen: boolean;
  openGroups: Record<string, boolean>;
  toggleGroup: (group: string) => void;
  isActive: (path: string) => boolean;
  onLinkClick: () => void;
}

const ChevronIcon = ({ rotated }: { rotated: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`chevron-icon ${rotated ? "rotated" : ""}`}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function AdminSidebarNav({ pathname, pendingCount, mobileOpen, openGroups, toggleGroup, isActive, onLinkClick }: AdminSidebarNavProps) {
  return (
    <aside id="admin-sidebar" className={`dashboard-sidebar ${mobileOpen ? "open" : ""}`} aria-hidden={!mobileOpen}>
      <div className="sidebar-brand">
        <img src="/assets/logo.png" alt="Ibra Logo" className="sidebar-brand-img" />
        <div className="sidebar-brand-text">
          <h2>Ibra Global English</h2>
          <p>Portal Admin</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Ringkasan */}
        <Link href="/admin" className={`sidebar-nav-link ${isActive("/admin") ? "active" : ""}`} onClick={onLinkClick}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
          <span>Ringkasan</span>
        </Link>

        {/* Akademik & Kelas */}
        <div className="sidebar-group">
          <button type="button" onClick={() => toggleGroup("akademik")} className={`sidebar-group-toggle ${["/admin/calendar", "/admin/online-schedule", "/admin/attendance", "/admin/reports", "/admin/certificates", "/admin/placement-test", "/admin/curriculum", "/admin/feedback"].includes(pathname) ? "active-parent" : ""}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <span>Akademik &amp; Kelas</span>
            <ChevronIcon rotated={openGroups.akademik} />
          </button>
          <div className={`sidebar-group-items ${openGroups.akademik ? "expanded" : ""}`}>
            {[
              { href: "/admin/calendar", label: "Jadwal & Kalender" },
              { href: "/admin/online-schedule", label: "Jadwal Kelas Online" },
              { href: "/admin/attendance", label: "Absensi Harian" },
              { href: "/admin/attendance?scan=true", label: "Pemindai QR Presensi" },
              { href: "/admin/reports", label: "Input Rapor" },
              { href: "/admin/certificates", label: "Kelola Sertifikat" },
              { href: "/admin/placement-test", label: "Hasil Tes Penempatan" },
              { href: "/admin/curriculum", label: "Kelola Kurikulum" },
              { href: "/admin/feedback", label: "Umpan Balik Tutor" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className={`sidebar-sub-link ${isActive(item.href) ? "active" : ""}`} onClick={onLinkClick}>
                <span className="bullet" /><span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Keuangan & Pajak */}
        <div className="sidebar-group">
          <button type="button" onClick={() => toggleGroup("keuangan")} className={`sidebar-group-toggle ${["/admin/finance", "/admin/tax"].includes(pathname) ? "active-parent" : ""}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span>Keuangan &amp; Pajak</span>
            <ChevronIcon rotated={openGroups.keuangan} />
          </button>
          <div className={`sidebar-group-items ${openGroups.keuangan ? "expanded" : ""}`}>
            <Link href="/admin/finance" className={`sidebar-sub-link ${isActive("/admin/finance") ? "active" : ""}`} onClick={onLinkClick}><span className="bullet" /><span>Kelola Keuangan / SPP</span></Link>
            <Link href="/admin/tax" className={`sidebar-sub-link ${isActive("/admin/tax") ? "active" : ""}`} onClick={onLinkClick}><span className="bullet" /><span>SPT Pajak PT Perseorangan</span></Link>
          </div>
        </div>

        {/* Komunikasi & Konten */}
        <div className="sidebar-group">
          <button type="button" onClick={() => toggleGroup("komunikasi")} className={`sidebar-group-toggle ${["/admin/whatsapp", "/admin/announcements", "/admin/rag", "/admin/landing-page", "/admin/letters", "/admin/kemitraan"].includes(pathname) ? "active-parent" : ""}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>Komunikasi &amp; Konten</span>
            <ChevronIcon rotated={openGroups.komunikasi} />
          </button>
          <div className={`sidebar-group-items ${openGroups.komunikasi ? "expanded" : ""}`}>
            {[
              { href: "/admin/whatsapp", label: "WhatsApp Gateway" },
              { href: "/admin/announcements", label: "Pengumuman" },
              { href: "/admin/letters", label: "Kelola Surat & AI" },
              { href: "/admin/kemitraan", label: "Kemitraan & Proposal" },
              { href: "/admin/promo", label: "Promo Popup" },
              { href: "/admin/rag", label: "Basis Pengetahuan AI" },
              { href: "/admin/landing-page", label: "Kelola Landing Page" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className={`sidebar-sub-link ${isActive(item.href) ? "active" : ""}`} onClick={onLinkClick}>
                <span className="bullet" /><span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Manajemen Pengguna */}
        <div className="sidebar-group">
          <button type="button" onClick={() => toggleGroup("pengguna")} className={`sidebar-group-toggle ${["/admin/students", "/admin/tutors", "/admin/audit-logs"].includes(pathname) ? "active-parent" : ""}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Manajemen Pengguna</span>
            <ChevronIcon rotated={openGroups.pengguna} />
          </button>
          <div className={`sidebar-group-items ${openGroups.pengguna ? "expanded" : ""}`}>
            <Link href="/admin/students" className={`sidebar-sub-link ${isActive("/admin/students") ? "active" : ""}`} onClick={onLinkClick} style={{ position: "relative" }}>
              <span className="bullet" /><span>Kelola Siswa</span>
              {pendingCount > 0 && (
                <span style={{ position: "absolute", top: "50%", right: "0.75rem", transform: "translateY(-50%)", backgroundColor: "var(--color-red)", color: "white", borderRadius: "10px", fontSize: "0.65rem", fontWeight: "800", padding: "0.1rem 0.4rem", minWidth: "18px", textAlign: "center", animation: "pulse 2s infinite" }}>
                  {pendingCount}
                </span>
              )}
            </Link>
            <Link href="/admin/tutors" className={`sidebar-sub-link ${isActive("/admin/tutors") ? "active" : ""}`} onClick={onLinkClick}><span className="bullet" /><span>Kelola Tutor &amp; Staf</span></Link>
            <Link href="/admin/audit-logs" className={`sidebar-sub-link ${isActive("/admin/audit-logs") ? "active" : ""}`} onClick={onLinkClick}><span className="bullet" /><span>Log Aktivitas Sistem</span></Link>
          </div>
        </div>
      </nav>

      <div className="sidebar-footer" style={{ padding: "1rem", textAlign: "center" }}>
        <span style={{ fontSize: "0.7rem", color: "var(--color-gray-400)" }}>Admin Dashboard v3.51.0</span>
      </div>
    </aside>
  );
}
