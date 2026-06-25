"use client";

export default function ParentSidebar({ mobileOpen, setMobileOpen, activeView, setActiveView, handleLogout, parentName }) {
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
          style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>Kemajuan Belajar</span>
        </button>

        <button
          onClick={() => { setActiveView("calendar"); setMobileOpen(false); }}
          className={`sidebar-nav-link ${activeView === "calendar" ? "active" : ""}`}
          style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>Jadwal & Kalender</span>
        </button>

        <button
          onClick={() => { setActiveView("finance"); setMobileOpen(false); }}
          className={`sidebar-nav-link ${activeView === "finance" ? "active" : ""}`}
          style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span>Administrasi SPP</span>
        </button>

        <button
          onClick={() => { setActiveView("lms"); setMobileOpen(false); }}
          className={`sidebar-nav-link ${activeView === "lms" ? "active" : ""}`}
          style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v21H6.5a2.5 2.5 0 0 1-2.5-2.5z"/></svg>
          <span>LMS & Tugas Anak</span>
        </button>
      </div>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="btn-logout">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span>Log Keluar</span>
        </button>
      </div>
    </aside>
  );
}