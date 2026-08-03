"use client";

export const dynamic = "force-dynamic";

import React from "react";
import SpeakingPractice from "@/components/SpeakingPractice";
import "@/app/dashboard.css";
import "@/app/dashboard-print.css";
import StudentDashboard from "./components/StudentDashboard";
import StudentModules from "./components/StudentModules";
import StudentAchievements from "./components/StudentAchievements";
import StudentLMS from "./components/StudentLMS";
import { useStudentPortal } from "./hooks/useStudentPortal";

export default function StudentPortal() {
  const {
    loading, student, mobileOpen, setMobileOpen, activeTab, setActiveTab,
    reports, certificates, rewards, totalCoins, lmsMaterials, mySubmissions,
    submissionFile, setSubmissionFile, submittingMaterialId, submissionUploading,
    lmsSubTab, setLmsSubTab, announcements, onlineSchedules, getModulesList,
    handleSaveSubmission, handleLogout,
  } = useStudentPortal();

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div style={{ textAlign: "center", color: "var(--color-gray-500)" }}>
          <svg style={{ animation: "spin 1s linear infinite", width: "40px", height: "40px", marginBottom: "1rem", color: "var(--color-primary)" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <p style={{ fontWeight: "600" }}>Memuat Dasbor Siswa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Mobile Menu Toggle */}
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

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <img src="/assets/logo.png" alt="Ibra Logo" className="sidebar-brand-img" />
          <div className="sidebar-brand-text">
            <h2>Ibra Global English</h2>
            <p>Portal Siswa / LMS</p>
          </div>
        </div>

        <div className="sidebar-nav">
          <button onClick={() => { setActiveTab("dashboard"); setMobileOpen(false); }} className={`sidebar-nav-link ${activeTab === "dashboard" ? "active" : ""}`} style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Dasbor Siswa</span>
          </button>
          <button onClick={() => { setActiveTab("modules"); setMobileOpen(false); }} className={`sidebar-nav-link ${activeTab === "modules" ? "active" : ""}`} style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>Tugas &amp; Modul</span>
          </button>
          <button onClick={() => { setActiveTab("lms"); setMobileOpen(false); }} className={`sidebar-nav-link ${activeTab === "lms" ? "active" : ""}`} style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v21H6.5a2.5 2.5 0 0 1-2.5-2.5z"/></svg>
            <span>LMS - Pembelajaran</span>
          </button>
          <button onClick={() => { setActiveTab("achievements"); setMobileOpen(false); }} className={`sidebar-nav-link ${activeTab === "achievements" ? "active" : ""}`} style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
            <span>Pencapaian Koin</span>
          </button>
          <button onClick={() => { setActiveTab("speaking"); setMobileOpen(false); }} className={`sidebar-nav-link ${activeTab === "speaking" ? "active" : ""}`} style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
            <span>Latihan AI Speaking</span>
          </button>
        </div>

        <div className="sidebar-footer" style={{ padding: "1rem", textAlign: "center" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--color-gray-400)" }}>Siswa Dashboard v1.0</span>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div className="topbar-title">
            <h1>Selamat Belajar, {student?.name}!</h1>
            <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
              Program: <strong>{student?.program}</strong> (Usia {student?.age} tahun)
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", backgroundColor: "rgba(250, 204, 21, 0.15)", color: "#a16207", padding: "0.45rem 1rem", borderRadius: "20px", fontWeight: "900", fontSize: "0.9rem", border: "1px solid rgba(250, 204, 21, 0.3)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#a16207" className="spinning-coin" style={{ display: "inline-block", animation: "spin 3s linear infinite" }} aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M15 9.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5" stroke="#fff" strokeWidth="2" fill="none"/></svg>
              <span>{totalCoins} Koin Ibra</span>
            </div>
            <button onClick={handleLogout} className="btn-logout" style={{ width: "auto", padding: "0.4rem 0.85rem", fontSize: "0.8rem", display: "inline-flex" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {activeTab === "dashboard" && (
          <StudentDashboard
            student={student} announcements={announcements} onlineSchedules={onlineSchedules}
            reports={reports} certificates={certificates} totalCoins={totalCoins}
          />
        )}

        {activeTab === "modules" && (
          <StudentModules student={student} getModulesList={getModulesList} />
        )}

        {activeTab === "achievements" && (
          <StudentAchievements rewards={rewards} />
        )}

        {activeTab === "lms" && (
          <StudentLMS
            student={student} lmsMaterials={lmsMaterials} mySubmissions={mySubmissions}
            submissionFile={submissionFile} setSubmissionFile={setSubmissionFile}
            submittingMaterialId={submittingMaterialId} submissionUploading={submissionUploading}
            lmsSubTab={lmsSubTab} setLmsSubTab={setLmsSubTab} handleSaveSubmission={handleSaveSubmission}
          />
        )}

        {activeTab === "speaking" && (
          <SpeakingPractice student={student} />
        )}
      </main>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}
