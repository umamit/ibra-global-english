"use client";

export const dynamic = "force-dynamic";

import React, { useMemo, useEffect } from "react";
import FinanceStatsCards from "./components/FinanceStatsCards";
import FinanceTable from "./components/FinanceTable";
import FinanceModal from "./components/FinanceModal";
import FinanceAnalytics from "./components/FinanceAnalytics";
import FinanceWaModal from "./components/FinanceWaModal";
import AnnualSPPCardModal from "./components/AnnualSPPCardModal";
import FinanceDueAlertBanner from "./components/FinanceDueAlertBanner";
import FinanceSearchToolbar from "./components/FinanceSearchToolbar";
import { getMonthName, terbilang, formatRupiah } from "../utils";
import ToastNotification from "../components/ToastNotification";
import { getStudentPayment, exportPaymentsCSV, printReceiptHTML, getStudentSPPDueInfo } from "./financeHelpers";
import { useFinanceModal } from "./hooks/useFinanceModal";
import { useAdminFinance } from "./hooks/useAdminFinance";
import { Student } from "@/types";

export default function AdminFinance() {
  const {
    students, payments, allPayments, activeTab, setActiveTab, loading, selectedMonth,
    setSelectedMonth, searchQuery, setSearchQuery, programFilter, setProgramFilter,
    toast, printDateStr, waModalOpen, setWaModalOpen, waStudent, waPayment, annualModalOpen,
    setAnnualModalOpen, annualStudent, sppPrices, currentPage, setCurrentPage, pageSize,
    setPageSize, showToast, handleOpenAnnualCardModal, handleOpenWaBillingModal, fetchData,
    printFinanceReport,
  } = useAdminFinance();

  const {
    isModalOpen, setIsModalOpen, modalStudent, modalAmount, setModalAmount,
    modalStatus, setModalStatus, modalMethod, setModalMethod, modalReceiptUrl, setModalReceiptUrl,
    modalPaymentDate, setModalPaymentDate, savingPayment, fileInputRef, handleUploadReceipt,
    handleOpenEditModal, handleSavePayment, handleQuickConfirmLunas, handleUpdatePaymentType,
  } = useFinanceModal(fetchData, selectedMonth, sppPrices, showToast, students, payments);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isModalOpen]);

  const filteredStudents = students.filter((student) => {
    if (student.created_at && student.created_at.substring(0, 7) > selectedMonth) return false;
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || (student.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProgram = programFilter === "All" || student.program === programFilter || (student.program && student.program.toLowerCase().includes(programFilter.toLowerCase()));
    return matchesSearch && matchesProgram;
  });

  useEffect(() => { setCurrentPage(1); }, [searchQuery, programFilter, selectedMonth, setCurrentPage]);

  const paginatedStudents = useMemo(() => {
    if (pageSize >= 9999) return filteredStudents;
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const stats = (() => {
    let expected = 0, collected = 0, pendingCount = 0, unpaidCount = 0, paidCount = 0;
    students.forEach((student) => {
      if (student.created_at && student.created_at.substring(0, 7) > selectedMonth) return;
      const pay = getStudentPayment(student.id, students, payments, selectedMonth, sppPrices);
      const baseAmount = sppPrices[student.program] || 300000;
      expected += pay.amount || baseAmount;
      if (pay.status === "lunas") { collected += pay.amount || baseAmount; paidCount++; }
      else if (pay.status === "menunggu_konfirmasi") pendingCount++;
      else unpaidCount++;
    });
    return { expected, collected, pendingCount, unpaidCount, paidCount };
  })();

  const dueAlertStats = (() => {
    let dueSoonCount = 0, dueTodayCount = 0, overdueCount = 0;
    students.forEach((student) => {
      const pay = getStudentPayment(student.id, students, payments, selectedMonth, sppPrices);
      const dueInfo = getStudentSPPDueInfo(student, pay.status, selectedMonth);
      if (dueInfo.dueStatus === "due_today") dueTodayCount++;
      if (dueInfo.dueStatus === "due_soon") dueSoonCount++;
      if (dueInfo.dueStatus === "overdue") overdueCount++;
    });
    return { dueSoonCount, dueTodayCount, overdueCount, totalAlerts: dueSoonCount + dueTodayCount + overdueCount };
  })();

  const handlePrintReceipt = (student: Student, pay: any) => printReceiptHTML(student, pay, selectedMonth, getMonthName, formatRupiah, terbilang);

  const tabBtnStyle = (key: string) => ({ padding: "0.6rem 1.5rem", fontSize: "0.95rem", fontWeight: "800" as const, border: "none", background: "none", color: activeTab === key ? "var(--color-primary-dark)" : "var(--color-gray-400)", borderBottom: activeTab === key ? "3px solid var(--color-primary)" : "3px solid transparent", cursor: "pointer", transition: "all 0.2s ease", marginBottom: "-0.65rem", display: "inline-flex" as const, alignItems: "center" as const, gap: "0.4rem" });

  return (
    <div style={{ padding: "1.5rem 1rem", maxWidth: "1200px", margin: "0 auto" }}>
      {toast.show && <ToastNotification toast={toast} />}
      <div className="finance-print-header">
        <h2>Ibra Global English — Laporan SPP Bulanan</h2>
        <p>Bulan Tagihan: <strong>{selectedMonth || "-"}</strong> &nbsp;|&nbsp; Dicetak: {printDateStr}</p>
        <p style={{ marginTop: "4px" }}>Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001, Bobong, Taliabu Barat, Kabupaten Pulau Taliabu, Maluku Utara 97794</p>
      </div>
      <div className="dashboard-topbar" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", borderBottom: "1px solid var(--color-gray-200)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>Kelola Keuangan / SPP</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>Atur biaya bimbingan belajar, konfirmasi bukti transfer wali murid, dan pantau tagihan SPP bulanan siswa.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <label style={{ fontWeight: "700", color: "var(--color-gray-700)" }}>Bulan Tagihan:</label>
          <input type="month" className="form-input" style={{ padding: "0.5rem 1rem", borderRadius: "6px", width: "180px" }} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
          {activeTab === "list" && students.length > 0 && (
            <>
              <button className="btn-portal-primary" onClick={() => exportPaymentsCSV(students, payments, selectedMonth, sppPrices, formatRupiah)} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.9rem", fontSize: "0.85rem" }}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span>Export CSV</span></button>
              <button className="btn-portal-primary" onClick={printFinanceReport} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.9rem", fontSize: "0.85rem" }}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg><span>Cetak PDF</span></button>
            </>
          )}
        </div>
      </div>

      <FinanceDueAlertBanner dueAlertStats={dueAlertStats} selectedMonth={selectedMonth} />

      <div style={{ display: "flex", gap: "1rem", borderBottom: "2px solid var(--color-gray-100)", marginBottom: "2rem", paddingBottom: "0.5rem" }}>
        <button onClick={() => setActiveTab("list")} style={tabBtnStyle("list")}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>Daftar Tagihan SPP</button>
        <button onClick={() => setActiveTab("analytics")} style={tabBtnStyle("analytics")}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Analitik &amp; Grafik Eksekutif</button>
      </div>

      {activeTab === "list" && (
        <>
          <FinanceStatsCards stats={stats} formatRupiah={formatRupiah} />
          <FinanceSearchToolbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} programFilter={programFilter} setProgramFilter={setProgramFilter} filteredCount={filteredStudents.length} totalCount={students.length} />
          <FinanceTable filteredStudents={paginatedStudents} getStudentPayment={getStudentPayment} formatRupiah={formatRupiah} loading={loading} searchQuery={searchQuery} students={students} payments={payments} selectedMonth={selectedMonth} sppPrices={sppPrices} onQuickConfirm={handleQuickConfirmLunas} onPrintReceipt={handlePrintReceipt} onEditPayment={handleOpenEditModal} onTriggerWaBilling={handleOpenWaBillingModal} onUpdatePaymentType={handleUpdatePaymentType} onViewAnnualCard={handleOpenAnnualCardModal} currentPage={currentPage} pageSize={pageSize} totalStudents={filteredStudents.length} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
        </>
      )}

      {activeTab === "analytics" && <FinanceAnalytics students={students} allPayments={allPayments} sppPrices={sppPrices} formatRupiah={formatRupiah} selectedMonth={selectedMonth} loading={loading} />}

      <FinanceModal isModalOpen={isModalOpen} modalStudent={modalStudent} selectedMonth={selectedMonth} modalAmount={modalAmount} setModalAmount={setModalAmount} modalStatus={modalStatus} setModalStatus={setModalStatus} modalMethod={modalMethod} setModalMethod={setModalMethod} modalReceiptUrl={modalReceiptUrl} setModalReceiptUrl={setModalReceiptUrl} modalPaymentDate={modalPaymentDate} setModalPaymentDate={setModalPaymentDate} savingPayment={savingPayment} getMonthName={getMonthName} getStudentPayment={getStudentPayment} fileInputRef={fileInputRef} handleUploadReceipt={handleUploadReceipt} handleSavePayment={handleSavePayment} handlePrintReceipt={handlePrintReceipt} onClose={() => setIsModalOpen(false)} />
      <FinanceWaModal isOpen={waModalOpen} onClose={() => setWaModalOpen(false)} student={waStudent} payment={waPayment} selectedMonth={selectedMonth} getMonthName={getMonthName} formatRupiah={formatRupiah} onSuccess={(msg) => { setWaModalOpen(false); showToast(msg); }} />
      <AnnualSPPCardModal isOpen={annualModalOpen} onClose={() => setAnnualModalOpen(false)} student={annualStudent} allPayments={allPayments} sppPrices={sppPrices} formatRupiah={formatRupiah} selectedYear={selectedMonth ? selectedMonth.substring(0, 4) : "2026"} />
    </div>
  );
}
