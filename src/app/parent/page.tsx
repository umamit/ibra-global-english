"use client";

export const dynamic = "force-dynamic";

import React from "react";
import ParentSessionManager from "./components/ParentSessionManager";
import ParentSidebar from "./components/ParentSidebar";
import ParentHeader from "./components/ParentHeader";
import ProgressView from "./components/ProgressView";
import CalendarView from "./components/CalendarView";
import FinanceView from "./components/FinanceView";
import LMSView from "./components/LMSView";
import FeedbackView from "./components/FeedbackView";
import ReceiptPrint from "./components/ReceiptPrint";
import "@/app/dashboard.css";
import "@/app/dashboard-print.css";
import "./parent.css";
import { useParentPortal } from "./hooks/useParentPortal";

export default function ParentPortal() {
  const {
    supabase, router, parentName, children, selectedChild, setSelectedChild,
    activeView, setActiveView, mobileOpen, setMobileOpen, notifications,
    showNotificationDropdown, setShowNotificationDropdown, announcements,
    onlineSchedules, academicSchedules, attendance, attendanceStats, reports,
    certificates, lmsMaterials, lmsSubmissions, parentPayments, paymentSettings,
    detailsLoading, printReport, printReceipt, setPrintReceipt, uploadingReceipt,
    getIndonesianDay, getIndonesianDate, getTerbilang, getMonthName,
    getChildProgramPrice, handleLogout, handleUploadReceipt, triggerPrint, triggerPrintReceipt,
  } = useParentPortal();

  if (printReport) {
    return (
      <ProgressView
        selectedChild={selectedChild}
        announcements={announcements}
        onlineSchedules={onlineSchedules}
        attendance={attendance}
        attendanceStats={attendanceStats}
        reports={reports}
        certificates={certificates}
        detailsLoading={detailsLoading}
        getIndonesianDay={getIndonesianDay}
        getIndonesianDate={getIndonesianDate}
        triggerPrint={triggerPrint}
      />
    );
  }

  if (printReceipt) {
    return (
      <ReceiptPrint
        printReceipt={printReceipt}
        selectedChild={selectedChild}
        parentName={parentName}
        paymentSettings={paymentSettings}
        getTerbilang={getTerbilang}
        getMonthName={getMonthName}
        getIndonesianDate={getIndonesianDate}
        onBack={() => setPrintReceipt(null)}
      />
    );
  }

  return (
    <div className="dashboard-container">
      <ParentSessionManager supabase={supabase} router={router} />

      {/* Mobile Toggle Button */}
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

      <ParentSidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        handleLogout={handleLogout}
        parentName={parentName}
      />

      <main className="dashboard-main">
        <ParentHeader
          parentName={parentName}
          notifications={notifications}
          showNotificationDropdown={showNotificationDropdown}
          setShowNotificationDropdown={setShowNotificationDropdown}
          onLogout={handleLogout}
        />

        {children.length === 0 ? (
          <div className="portal-card text-center" style={{ padding: "3rem 2rem", borderTop: "4px solid var(--color-accent)" }}>
            <svg style={{ color: "var(--color-accent)", width: "48px", height: "48px", marginBottom: "1rem", display: "inline-block" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>Siswa Belum Dipasangkan</h3>
            <p style={{ color: "var(--color-gray-600)", fontSize: "0.95rem", maxWidth: "550px", margin: "0 auto", lineHeight: "1.6" }}>
              Akun orang tua Anda belum dihubungkan dengan data profil siswa. Silakan hubungi <strong>Tutor Pendamping</strong> di kelas atau hubungi Admin Ibra Global English Bobong agar nama anak Anda segera dikaitkan ke akun portal ini.
            </p>
          </div>
        ) : (
          <>
            {/* Multiple children tab navigation if applicable */}
            {children.length > 1 && (
              <div className="child-nav-tabs">
                {children.map((child) => (
                  <button
                    key={child.id}
                    className={`child-tab-btn ${selectedChild?.id === child.id ? "active" : ""}`}
                    onClick={() => setSelectedChild(child)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>{child.name} ({child.program})</span>
                  </button>
                ))}
              </div>
            )}

            {/* Currently Monitored Student Card */}
            <div className="monitored-student-banner">
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Siswa yang Dipantau</p>
                <h2>{selectedChild?.name}</h2>
                <p style={{ fontSize: "0.9rem", color: "var(--color-gray-600)", fontWeight: "600", marginTop: "2px" }}>
                  Program: <strong>{selectedChild?.program}</strong> · Usia {selectedChild?.age} tahun
                </p>
              </div>
              <div className="user-badge">
                Siswa Aktif
              </div>
            </div>

            {/* Tab Views */}
            {activeView === "progress" && (
              <div className="view-fade-in">
                <ProgressView
                  selectedChild={selectedChild}
                  announcements={announcements}
                  onlineSchedules={onlineSchedules}
                  attendance={attendance}
                  attendanceStats={attendanceStats}
                  reports={reports}
                  certificates={certificates}
                  detailsLoading={detailsLoading}
                  getIndonesianDay={getIndonesianDay}
                  getIndonesianDate={getIndonesianDate}
                  triggerPrint={triggerPrint}
                />
              </div>
            )}

            {activeView === "calendar" && (
              <div className="view-fade-in">
                <CalendarView
                  parentSchedules={academicSchedules}
                  detailsLoading={detailsLoading}
                  selectedChild={selectedChild}
                />
              </div>
            )}

            {activeView === "finance" && (
              <div className="view-fade-in">
                <FinanceView
                  selectedChild={selectedChild}
                  paymentSettings={paymentSettings}
                  parentPayments={parentPayments}
                  uploadingReceipt={uploadingReceipt}
                  getChildProgramPrice={getChildProgramPrice}
                  getMonthName={getMonthName}
                  handleUploadReceipt={handleUploadReceipt}
                  triggerPrintReceipt={triggerPrintReceipt}
                  detailsLoading={detailsLoading}
                />
              </div>
            )}

            {activeView === "lms" && (
              <div className="view-fade-in">
                <LMSView
                  selectedChild={selectedChild}
                  lmsMaterials={lmsMaterials}
                  lmsSubmissions={lmsSubmissions}
                  detailsLoading={detailsLoading}
                />
              </div>
            )}

            {activeView === "feedback" && (
              <div className="view-fade-in">
                <FeedbackView
                  selectedChild={selectedChild}
                  detailsLoading={detailsLoading}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
