"use client";

export const dynamic = 'force-dynamic';

import React from 'react';
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import FinanceStatsCards from "./components/FinanceStatsCards";
import FinanceTable from "./components/FinanceTable";
import FinanceModal from "./components/FinanceModal";
import FinanceAnalytics from "./components/FinanceAnalytics";
import FinanceWaModal from "./components/FinanceWaModal";
import { getMonthName, terbilang, formatRupiah, getCurrentMonth } from "../utils";
import ToastNotification from "../components/ToastNotification";
import { getStudentPayment, exportPaymentsCSV, printReceiptHTML } from "./financeHelpers";
import { useFinanceModal } from "./hooks/useFinanceModal";

import { Student, Payment } from "@/types";

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export default function AdminFinance() {
  const supabase = createClient();

  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<string>("list"); // "list" or "analytics"
  const [loading, setLoading] = useState<boolean>(false);
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [programFilter, setProgramFilter] = useState<string>("All");
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" });
  const [printDateStr, setPrintDateStr] = useState<string>("");

  // WhatsApp Billing States
  const [waModalOpen, setWaModalOpen] = useState<boolean>(false);
  const [waStudent, setWaStudent] = useState<Student | null>(null);
  const [waPayment, setWaPayment] = useState<any | null>(null);
  const [sppPrices, setSppPrices] = useState<Record<string, number>>({
    "Kids Program": 300000,
    "Teens Program": 300000,
    "Fun Calistung": 350000
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type }), 3000);
  };

  const fetchData = async (): Promise<void> => {
    if (!selectedMonth) return;
    setLoading(true);
    try {
      // 1. Fetch Students
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select(`
          id,
          name,
          program,
          parent_id,
          profiles:parent_id (
            full_name
          )
        `)
        .order("name", { ascending: true });

      if (studentsError) throw studentsError;

      // 2. Fetch Payments for selected month
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("tuition_payments")
        .select("*")
        .eq("month", selectedMonth);

      if (paymentsError) throw paymentsError;

      // 3. Fetch All Payments for Analytics
      const { data: allPaymentsData, error: allPaymentsError } = await supabase
        .from("tuition_payments")
        .select("*")
        .order("month", { ascending: true });

      if (allPaymentsError) throw allPaymentsError;

      const formattedStudents = (studentsData || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        program: s.program,
        parent_id: s.parent_id,
        profiles: Array.isArray(s.profiles) ? s.profiles[0] : s.profiles,
      }));

      setStudents(formattedStudents);
      setPayments(paymentsData || []);
      setAllPayments(allPaymentsData || []);
    } catch (err) {
      console.error("Gagal mengambil data keuangan:", err);
      showToast("Gagal memuat beberapa data dari database.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWaBillingModal = (student: Student, pay: any) => {
    setWaStudent(student);
    setWaPayment(pay);
    setWaModalOpen(true);
  };

  // Use custom hook for modal logic
  const {
    isModalOpen,
    setIsModalOpen,
    modalStudent,
    modalAmount,
    setModalAmount,
    modalStatus,
    setModalStatus,
    modalMethod,
    setModalMethod,
    modalReceiptUrl,
    setModalReceiptUrl,
    modalPaymentDate,
    setModalPaymentDate,
    savingPayment,
    fileInputRef,
    handleUploadReceipt,
    handleOpenEditModal,
    handleSavePayment,
    handleQuickConfirmLunas
  } = useFinanceModal(fetchData, selectedMonth, sppPrices, showToast);
  // Fetch configured SPP fee amounts on mount
  useEffect(() => {
    async function fetchSppPrices(): Promise<void> {
      try {
        const { data, error } = await supabase
          .from("landing_settings")
          .select("*");
        if (data && data.length > 0) {
          const settings: Record<string, string> = {};
          data.forEach((item: { key: string; value: string }) => {
            settings[item.key] = item.value;
          });
          setSppPrices({
            "Kids Program": parseInt(settings.payment_spp_kids || "300000"),
            "Teens Program": parseInt(settings.payment_spp_teens || "300000"),
            "Fun Calistung": parseInt(settings.payment_spp_calistung || "350000")
          });
        }
      } catch (err) {
        console.error("Gagal memuat nominal SPP program:", err);
      }
    }
    fetchSppPrices();
  }, []);

  // Lock body scroll when modal is open to prevent page scrolling behind it
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // Set print date once on mount (prevents hydration mismatch)
  useEffect(() => {
    setTimeout(() => {
      setPrintDateStr(new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }));
    }, 0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);

    // Subscribe to real-time changes
    const channel = supabase
      .channel("realtime-finance")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tuition_payments" },
        () => {
          fetchData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [selectedMonth]);

  // A1: Cetak laporan keuangan ke PDF
  const printFinanceReport = () => {
    document.body.classList.add("print-finance");
    window.print();
    const cleanup = () => {
      document.body.classList.remove("print-finance");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
  };

  // Filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProgram = programFilter === "All" || student.program === programFilter;
    return matchesSearch && matchesProgram;
  });

  // Financial Stats Calculations
  const stats = (() => {
    let expected = 0;
    let collected = 0;
    let pendingCount = 0;
    let unpaidCount = 0;
    let paidCount = 0;

    students.forEach(student => {
      const pay = getStudentPayment(student.id, students, payments, selectedMonth, sppPrices);
      const baseAmount = sppPrices[student.program] || 300000;
      expected += pay.amount || baseAmount;
      if (pay.status === "lunas") {
        collected += pay.amount || baseAmount;
        paidCount++;
      } else if (pay.status === "menunggu_konfirmasi") {
        pendingCount++;
      } else {
        unpaidCount++;
      }
    });

    return { expected, collected, pendingCount, unpaidCount, paidCount };
  })();

  const handlePrintReceipt = (student: Student, pay: any) => {
    printReceiptHTML(student, pay, selectedMonth, getMonthName, formatRupiah, terbilang);
  };

  return (
    <div style={{ padding: "1.5rem 1rem", maxWidth: "1200px", margin: "0 auto" }}>
      {toast.show && <ToastNotification toast={toast} />}

      {/* A1: Print Header — hanya tampil saat @media print */}
      <div className="finance-print-header">
        <h2>Ibra Global English — Laporan SPP Bulanan</h2>
        <p>Bulan Tagihan: <strong>{selectedMonth || "-"}</strong> &nbsp;|&nbsp; Dicetak: {printDateStr}</p>
        <p style={{ marginTop: "4px" }}>Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001, Bobong, Taliabu Barat, Kabupaten Pulau Taliabu, Maluku Utara 97794</p>
      </div>

      {/* Top Header Section */}
      <div className="dashboard-topbar" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", borderBottom: "1px solid var(--color-gray-200)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>Kelola Keuangan / SPP</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Atur biaya bimbingan belajar, konfirmasi bukti transfer wali murid, dan pantau tagihan SPP bulanan siswa.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <label style={{ fontWeight: "700", color: "var(--color-gray-700)" }}>Bulan Tagihan:</label>
          <input
            type="month"
            className="form-input"
            style={{ padding: "0.5rem 1rem", borderRadius: "6px", width: "180px" }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          {activeTab === "list" && students.length > 0 && (
            <>
               <button
                 className="btn-portal-primary"
                 onClick={() => exportPaymentsCSV(students, payments, selectedMonth, sppPrices, formatRupiah)}
                 style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.9rem", fontSize: "0.85rem" }}
               >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Export CSV</span>
              </button>
              <button
                className="btn-portal-primary"
                onClick={printFinanceReport}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.9rem", fontSize: "0.85rem" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                <span>Cetak PDF</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: "flex", gap: "1rem", borderBottom: "2px solid var(--color-gray-100)", marginBottom: "2rem", paddingBottom: "0.5rem" }}>
        <button
          onClick={() => setActiveTab("list")}
          style={{
            padding: "0.6rem 1.5rem",
            fontSize: "0.95rem",
            fontWeight: "800",
            border: "none",
            background: "none",
            color: activeTab === "list" ? "var(--color-primary-dark)" : "var(--color-gray-400)",
            borderBottom: activeTab === "list" ? "3px solid var(--color-primary)" : "3px solid transparent",
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginBottom: "-0.65rem"
          }}
        >
          📋 Daftar Tagihan SPP
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          style={{
            padding: "0.6rem 1.5rem",
            fontSize: "0.95rem",
            fontWeight: "800",
            border: "none",
            background: "none",
            color: activeTab === "analytics" ? "var(--color-primary-dark)" : "var(--color-gray-400)",
            borderBottom: activeTab === "analytics" ? "3px solid var(--color-primary)" : "3px solid transparent",
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginBottom: "-0.65rem"
          }}
        >
          📊 Analitik & Grafik Eksekutif
        </button>
      </div>

      {activeTab === "list" && (
        <>
          <FinanceStatsCards stats={stats} formatRupiah={formatRupiah} />

          {/* Control Filters */}
          <div className="portal-card" style={{ padding: "1.25rem", marginBottom: "1.5rem", display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", flex: 1, maxWidth: "600px" }}>
              {/* Pencarian */}
              <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: "100%", padding: "0.6rem 0.6rem 0.6rem 2.2rem" }}
                  placeholder="Cari siswa atau nama orang tua..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-400)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>

              {/* Filter Program */}
              <select
                className="form-input"
                style={{ width: "180px", padding: "0.6rem" }}
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
              >
                <option value="All">Semua Program</option>
                <option value="Kids Program">Kids Program</option>
                <option value="Teens Program">Teens Program</option>
                <option value="Fun Calistung">Fun Calistung</option>
              </select>
            </div>

            <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--color-gray-500)" }}>
              Menampilkan {filteredStudents.length} dari {students.length} siswa
            </div>
          </div>

          <FinanceTable
            filteredStudents={filteredStudents}
            getStudentPayment={getStudentPayment}
            formatRupiah={formatRupiah}
            loading={loading}
            searchQuery={searchQuery}
            students={students}
            payments={payments}
            selectedMonth={selectedMonth}
            sppPrices={sppPrices}
            onQuickConfirm={handleQuickConfirmLunas}
            onPrintReceipt={handlePrintReceipt}
            onEditPayment={handleOpenEditModal}
            onTriggerWaBilling={handleOpenWaBillingModal}
          />
        </>
    )}

    {activeTab === "analytics" && (
      <FinanceAnalytics
        students={students}
        allPayments={allPayments}
        sppPrices={sppPrices}
        formatRupiah={formatRupiah}
        selectedMonth={selectedMonth}
        loading={loading}
      />
    )}

    {/* EDIT/MANAGE PAYMENT MODAL */}
    <FinanceModal
      isModalOpen={isModalOpen}
      modalStudent={modalStudent}
      selectedMonth={selectedMonth}
      modalAmount={modalAmount}
      setModalAmount={setModalAmount}
      modalStatus={modalStatus}
      setModalStatus={setModalStatus}
      modalMethod={modalMethod}
      setModalMethod={setModalMethod}
      modalReceiptUrl={modalReceiptUrl}
      setModalReceiptUrl={setModalReceiptUrl}
      modalPaymentDate={modalPaymentDate}
      setModalPaymentDate={setModalPaymentDate}
      savingPayment={savingPayment}
      getMonthName={getMonthName}
      getStudentPayment={getStudentPayment}
      fileInputRef={fileInputRef}
      handleUploadReceipt={handleUploadReceipt}
      handleSavePayment={handleSavePayment}
      handlePrintReceipt={handlePrintReceipt}
      onClose={() => setIsModalOpen(false)}
    />

    {/* WHATSAPP BILLING MODAL */}
    <FinanceWaModal
      isOpen={waModalOpen}
      onClose={() => setWaModalOpen(false)}
      student={waStudent}
      payment={waPayment}
      selectedMonth={selectedMonth}
      getMonthName={getMonthName}
      formatRupiah={formatRupiah}
      onSuccess={(msg) => {
        setWaModalOpen(false);
        showToast(msg);
      }}
    />

  </div>
);
}
