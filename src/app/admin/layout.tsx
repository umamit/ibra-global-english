"use client";

import React, { useState } from "react";
import { Toaster } from "sonner";
import { Search } from "lucide-react";
import AICopilotWidget from "@/components/AICopilotWidget";
import AdminSidebarNav from "./components/AdminSidebarNav";
import AdminRealtimeToasts from "./components/AdminRealtimeToasts";
import AdminCommandPalette from "./components/AdminCommandPalette";
import { DynamicIslandProvider } from "./context/DynamicIslandContext";
import { DynamicIsland } from "./components/DynamicIsland";
import { useAdminLayout } from "./hooks/useAdminLayout";
import "@/app/dashboard.css";
import "@/app/dashboard-print.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const {
    pathname, mobileOpen, setMobileOpen, pendingCount, openGroups, toggleGroup, isActive,
    newRegToast, setNewRegToast, newTestToast, setNewTestToast, adminName, handleLogout,
  } = useAdminLayout();

  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <DynamicIslandProvider>
      <div className={`dashboard-container ${mobileOpen ? "sidebar-open" : ""}`}>
        <DynamicIsland />
        <Toaster richColors position="top-right" closeButton duration={3500} />
        <AdminCommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

        <AdminRealtimeToasts
          newRegToast={newRegToast} setNewRegToast={setNewRegToast}
          newTestToast={newTestToast} setNewTestToast={setNewTestToast}
        />

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{ position: "fixed", bottom: "max(20px, env(safe-area-inset-bottom, 20px))", right: "max(20px, env(safe-area-inset-right, 20px))", zIndex: 100, width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "var(--color-primary)", color: "white", border: "none", boxShadow: "var(--shadow-lg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
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

      <AdminSidebarNav
        pathname={pathname} pendingCount={pendingCount} mobileOpen={mobileOpen}
        openGroups={openGroups} toggleGroup={toggleGroup} isActive={isActive}
        onLinkClick={() => setMobileOpen(false)}
      />

      <main className="dashboard-main">
        {/* Global Topbar */}
        <div className="global-topbar no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", paddingBottom: "1.25rem", borderBottom: "1px solid var(--color-gray-200)", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ backgroundColor: "var(--color-primary-light)", color: "var(--color-primary-dark)", fontWeight: "800", fontSize: "0.75rem", padding: "0.3rem 0.75rem", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Portal Admin
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", fontWeight: "500" }}>• Ibra Global English</span>
            </div>

            {/* Quick Search Trigger Button */}
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.35rem 0.75rem",
                borderRadius: "10px",
                border: "1px solid var(--color-gray-200, #e2e8f0)",
                backgroundColor: "var(--color-bg-surface, #ffffff)",
                color: "var(--color-gray-500, #64748b)",
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <Search size={14} color="var(--color-primary, #216c7e)" />
              <span>Cari cepat...</span>
              <kbd style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem", backgroundColor: "var(--color-gray-100, #f1f5f9)", borderRadius: "4px", border: "1px solid var(--color-gray-300)" }}>Ctrl+K</kbd>
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--color-gray-700)" }}>
              Halo, <strong style={{ color: "var(--color-primary-dark)" }}>{adminName}</strong>
            </span>
            <span className="user-badge" style={{ margin: 0 }}>Administrator</span>
            <button onClick={handleLogout} className="btn-logout" style={{ width: "auto", padding: "0.4rem 0.85rem", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.25rem", marginLeft: "0.5rem" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {children}
      </main>
      <AICopilotWidget />
    </div>
    </DynamicIslandProvider>
  );
}
