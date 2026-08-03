"use client";

export const dynamic = "force-dynamic";

import React from "react";
import AICopilotWidget from "@/components/AICopilotWidget";
import "@/app/dashboard.css";
import "@/app/dashboard-print.css";
import TutorAttendance from "./components/TutorAttendance";
import TutorReports from "./components/TutorReports";
import TutorLMS from "./components/TutorLMS";
import { formatRupiah } from "../admin/utils";
import { useTutorPortal } from "./hooks/useTutorPortal";

export default function TutorPortal() {
  const {
    loading, tutorName, mobileOpen, setMobileOpen, activeTab, setActiveTab,
    students, attendanceDate, setAttendanceDate, attendanceLoading, attendanceData, toast,
    lmsMaterials, lmsSubmissions, activeLmsGrading, selectedSubmission,
    studentGrade, studentFeedback, gradingLoading, lmsUploading, lmsTitle, setLmsTitle,
    lmsDesc, setLmsDesc, lmsProgram, setLmsProgram, lmsType, setLmsType,
    lmsDueDate, setLmsDueDate, lmsFile, setLmsFile, handleStatusChange, handleNotesChange,
    handleSaveAttendance, handleSaveLmsMaterial, handleViewSubmissions, handleDeleteLmsMaterial,
    handleSaveGrade, setSelectedSubmission, setStudentGrade, setStudentFeedback,
    handleLogout, handlePrintReport, handleExportCSV,
  } = useTutorPortal();

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div style={{ textAlign: "center", color: "var(--color-gray-500)" }}>
          <svg style={{ animation: "spin 1s linear infinite", width: "40px", height: "40px", marginBottom: "1rem", color: "var(--color-primary)" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <p style={{ fontWeight: "600" }}>Memuat Portal Tutor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 100, width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "var(--color-primary)", color: "white", border: "none", boxShadow: "var(--shadow-lg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        className="mobile-toggle-btn"
        aria-label="Toggle Sidebar"
      >
        {mobileOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        )}
      </button>

      {/* Toast notifications */}
      {toast.show && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1000, padding: "1rem 1.5rem", borderRadius: "8px", backgroundColor: toast.type === "success" ? "#10b981" : "#ef4444", color: "white", fontWeight: "600", boxShadow: "var(--shadow-lg)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {toast.type === "success" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <img src="/assets/logo.png" alt="Ibra Logo" className="sidebar-brand-img" />
          <div className="sidebar-brand-text">
            <h2>Ibra Global English</h2>
            <p>Portal Pengajar / Tutor</p>
          </div>
        </div>

        <div className="sidebar-nav">
          <button onClick={() => { setActiveTab("attendance"); setMobileOpen(false); }} className={`sidebar-nav-link ${activeTab === "attendance" ? "active" : ""}`} style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <span>Input Presensi</span>
          </button>
          <button onClick={() => { setActiveTab("reports"); setMobileOpen(false); }} className={`sidebar-nav-link ${activeTab === "reports" ? "active" : ""}`} style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
            <span>Input Nilai Rapor</span>
          </button>
          <button onClick={() => { setActiveTab("lms"); setMobileOpen(false); }} className={`sidebar-nav-link ${activeTab === "lms" ? "active" : ""}`} style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <span>LMS - Kelas Digital</span>
          </button>
        </div>

        <div className="sidebar-footer" style={{ padding: "1rem", textAlign: "center" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--color-gray-400)" }}>Tutor Dashboard v1.0</span>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div className="topbar-title">
            <h1>Halo Coach, {tutorName}</h1>
            <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>Silakan kelola absensi harian dan input rekap rapor akademik modul siswa Anda.</p>
          </div>
          <div className="topbar-user">
            <button onClick={handleLogout} className="btn-logout" style={{ width: "auto", padding: "0.4rem 0.85rem", fontSize: "0.8rem", display: "inline-flex" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {activeTab === "attendance" && (
          <TutorAttendance
            students={students} attendanceDate={attendanceDate} setAttendanceDate={setAttendanceDate}
            attendanceLoading={attendanceLoading} attendanceData={attendanceData}
            handleStatusChange={handleStatusChange} handleNotesChange={handleNotesChange}
            handleSaveAttendance={handleSaveAttendance}
          />
        )}

        {activeTab === "reports" && (
          <TutorReports
            students={students} attendanceData={attendanceData} attendanceDate={attendanceDate}
            formatRupiah={formatRupiah} onPrintReport={handlePrintReport} onExportCSV={handleExportCSV}
          />
        )}

        {activeTab === "lms" && (
          <TutorLMS
            students={students} lmsMaterials={lmsMaterials} lmsSubmissions={lmsSubmissions}
            activeLmsGrading={activeLmsGrading} selectedSubmission={selectedSubmission}
            studentGrade={studentGrade} studentFeedback={studentFeedback} gradingLoading={gradingLoading}
            lmsUploading={lmsUploading} lmsTitle={lmsTitle} setLmsTitle={setLmsTitle}
            lmsDesc={lmsDesc} setLmsDesc={setLmsDesc} lmsProgram={lmsProgram} setLmsProgram={setLmsProgram}
            lmsType={lmsType} setLmsType={setLmsType} lmsDueDate={lmsDueDate} setLmsDueDate={setLmsDueDate}
            lmsFile={lmsFile} setLmsFile={setLmsFile} handleSaveLmsMaterial={handleSaveLmsMaterial}
            handleViewSubmissions={handleViewSubmissions} handleDeleteLmsMaterial={handleDeleteLmsMaterial}
            handleSaveGrade={handleSaveGrade} setSelectedSubmission={setSelectedSubmission}
            setStudentGrade={setStudentGrade} setStudentFeedback={setStudentFeedback}
          />
        )}
      </main>
      <AICopilotWidget />
    </div>
  );
}
