"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAttendanceData, getIndonesianDay, getIndonesianDate } from "./hooks/useAttendanceData";
import AttendanceBanner from "./components/AttendanceBanner";
import AttendanceInputTable from "./components/AttendanceInputTable";
import AttendanceRecapTable from "./components/AttendanceRecapTable";
import QrAttendanceScannerModal from "./components/QrAttendanceScannerModal";

function AttendanceContent() {
  const searchParams = useSearchParams();
  const {
    students, selectedDate, setSelectedDate,
    loading, submitting, statusMsg,
    attendanceMap, handleStatusChange, handleNotesChange, handleSaveAttendance, handleSingleStudentQrScan,
    activeTab, setActiveTab,
    recapLoading, filteredRecap,
    searchTerm, setSearchTerm,
    programFilter, setProgramFilter,
    selectedMonth, setSelectedMonth,
    exportRecapCSV,
  } = useAttendanceData();

  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);

  useEffect(() => {
    if (searchParams.get("scan") === "true") {
      setIsQrScannerOpen(true);
    }
  }, [searchParams]);

  return (
    <div>
      {/* Topbar */}
      <div className="dashboard-topbar">
        <div className="topbar-title">
          {activeTab === "input" ? (
            <>
              <h1>Absensi Harian</h1>
              <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
                Pencatatan kehadiran kelas tutor harian untuk{" "}
                <strong style={{ color: "var(--color-primary-dark)" }}>
                  {selectedDate ? `${getIndonesianDay(selectedDate)}, ${getIndonesianDate(selectedDate)}` : "-"}
                </strong>
              </p>
            </>
          ) : (
            <>
              <h1>Rekapitulasi Absensi</h1>
              <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
                Akumulasi dan persentase kehadiran seluruh siswa selama bimbingan belajar
              </p>
            </>
          )}
        </div>

        {activeTab === "input" && (
          <div className="topbar-user" style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setIsQrScannerOpen(true)}
              className="btn-portal-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.45rem 1rem", fontSize: "0.85rem", height: "auto" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
              <span>Scan QR Absensi</span>
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label htmlFor="attendance-date" style={{ fontWeight: "700", fontSize: "0.85rem", color: "var(--color-gray-700)", margin: 0 }}>
                Tanggal:
              </label>
              <input
                type="date"
                id="attendance-date"
                className="form-input"
                style={{ width: "160px", padding: "0.45rem 0.75rem", fontSize: "0.85rem", marginBottom: 0 }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>
        )}

        {activeTab === "rekap" && (
          <div className="topbar-user" style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} className="no-print">
              <label htmlFor="recap-month" style={{ fontWeight: "700", fontSize: "0.85rem", color: "var(--color-gray-700)", margin: 0 }}>
                Bulan:
              </label>
              <input
                type="month"
                id="recap-month"
                className="form-input"
                style={{ width: "160px", padding: "0.45rem 1rem", fontSize: "0.85rem", marginBottom: 0 }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                disabled={recapLoading}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="no-print" style={{ display: "flex", borderBottom: "2px solid var(--color-gray-100)", marginBottom: "1.75rem", gap: "0.5rem" }}>
        {[
          { id: "input", label: "Input Absensi Harian", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
          { id: "rekap", label: "Rekapitulasi Kehadiran", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: "none", border: "none", padding: "0.75rem 1.25rem",
              fontWeight: activeTab === tab.id ? "800" : "500",
              color: activeTab === tab.id ? "var(--color-primary-dark)" : "var(--color-gray-500)",
              borderBottom: activeTab === tab.id ? "3px solid var(--color-primary)" : "3px solid transparent",
              marginBottom: "-2px", cursor: "pointer", fontSize: "1rem",
              display: "inline-flex", alignItems: "center", gap: "0.5rem", transition: "all 0.2s ease",
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Reminder banner (only when on input tab) */}
      {activeTab === "input" && !loading && (
        <AttendanceBanner selectedDate={selectedDate} students={students} attendanceMap={attendanceMap} />
      )}

      {/* Status message */}
      {statusMsg.text && (
        <div className={statusMsg.type === "success" ? "auth-success-banner" : "auth-error-banner"} style={{ marginBottom: "1.5rem" }}>
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Tab content */}
      {activeTab === "input" ? (
        loading ? (
          <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--color-gray-500)" }}>
            <svg style={{ animation: "spin 1s linear infinite", width: "32px", height: "32px", marginBottom: "1rem" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p>Memuat lembar kehadiran siswa...</p>
          </div>
        ) : students.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--color-gray-500)" }}>
            Belum ada siswa terdaftar. Daftarkan siswa terlebih dahulu di menu &ldquo;Kelola Siswa&rdquo;.
          </div>
        ) : (
          <AttendanceInputTable
            students={students}
            attendanceMap={attendanceMap}
            selectedDate={selectedDate}
            submitting={submitting}
            onStatusChange={handleStatusChange}
            onNotesChange={handleNotesChange}
            onSave={handleSaveAttendance}
          />
        )
      ) : (
        <AttendanceRecapTable
          filteredRecap={filteredRecap}
          recapLoading={recapLoading}
          searchTerm={searchTerm}
          programFilter={programFilter}
          selectedMonth={selectedMonth}
          onSearchChange={setSearchTerm}
          onProgramFilterChange={setProgramFilter}
          onExportCSV={() => exportRecapCSV(filteredRecap)}
        />
      )}

      {/* Modal QR Code Scanner */}
      <QrAttendanceScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        students={students}
        onScanSuccess={handleSingleStudentQrScan}
      />
    </div>
  );
}

export default function DailyAttendance() {
  return (
    <Suspense fallback={<div style={{ padding: "3rem", textAlign: "center" }}>Memuat Pemindai QR...</div>}>
      <AttendanceContent />
    </Suspense>
  );
}
