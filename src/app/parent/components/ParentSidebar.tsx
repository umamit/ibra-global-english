"use client";

interface ParentSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  handleLogout: () => void;
  parentName: string;
}

export default function ParentSidebar({ mobileOpen, setMobileOpen, activeView, setActiveView, handleLogout, parentName }: ParentSidebarProps) {
  return (
    <aside className={`dashboard-sidebar ${mobileOpen ? "open" : ""}`}>
      <div className="sidebar-brand">
        <img src="/assets/logo.png" alt="Ibra Logo" className="sidebar-brand-img" />
        <div className="sidebar-brand-text">
          <h2>Ibra Global English</h2>
          <p>Portal Orang Tua</p>
        </div>
      </div>

      <div className="sidebar-nav">
        <button
          onClick={() => { setActiveView("progress"); setMobileOpen(false); }}
          className={`sidebar-nav-link ${activeView === "progress" ? "active" : ""}`}
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>Kemajuan Belajar</span>
        </button>

        <button
          onClick={() => { setActiveView("calendar"); setMobileOpen(false); }}
          className={`sidebar-nav-link ${activeView === "calendar" ? "active" : ""}`}
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>Jadwal & Kalender</span>
        </button>

        <button
          onClick={() => { setActiveView("finance"); setMobileOpen(false); }}
          className={`sidebar-nav-link ${activeView === "finance" ? "active" : ""}`}
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span>Administrasi SPP</span>
        </button>

        <button
          onClick={() => { setActiveView("lms"); setMobileOpen(false); }}
          className={`sidebar-nav-link ${activeView === "lms" ? "active" : ""}`}
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v21H6.5a2.5 2.5 0 0 1-2.5-2.5z"/></svg>
          <span>LMS & Tugas Anak</span>
        </button>

        <button
          onClick={() => { setActiveView("feedback"); setMobileOpen(false); }}
          className={`sidebar-nav-link ${activeView === "feedback" ? "active" : ""}`}
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          <span>Umpan Balik Kelas</span>
        </button>
      </div>

      <div className="sidebar-footer" style={{ padding: "1rem", textAlign: "center" }}>
        <span style={{ fontSize: "0.7rem", color: "var(--color-gray-400)" }}>Orang Tua Dashboard v3.5.21</span>
      </div>
    </aside>
  );
}
