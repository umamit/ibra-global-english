"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import FinanceStatsCards from "./components/FinanceStatsCards";
import FinanceTable from "./components/FinanceTable";
import FinanceModal from "./components/FinanceModal";
import FinanceAnalytics from "./components/FinanceAnalytics";

const getMonthName = (ym) => {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  const date = new Date(parseInt(y), parseInt(m) - 1, 1);
  return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
};

const terbilang = (n) => {
  const bilangan = [
    "", "Satu", "Dua", "Tiga", "Empat", "Lima",
    "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"
  ];
  const num = parseInt(n);
  if (num < 12) {
    return bilangan[num];
  } else if (num < 20) {
    return terbilang(num - 10) + " Belas";
  } else if (num < 100) {
    return terbilang(Math.floor(num / 10)) + " Puluh " + terbilang(num % 10);
  } else if (num < 200) {
    return "Seratus " + terbilang(num - 100);
  } else if (num < 1000) {
    return terbilang(Math.floor(num / 100)) + " Ratus " + terbilang(num % 100);
  } else if (num < 2000) {
    return "Seribu " + terbilang(num - 1000);
  } else if (num < 1000000) {
    return terbilang(Math.floor(num / 1000)) + " Ribu " + terbilang(num % 1000);
  } else if (num < 1000000000) {
    return terbilang(Math.floor(num / 1000000)) + " Juta " + terbilang(num % 1000000);
  }
  return "";
};

export default function AdminFinance() {
  const supabase = createClient();

  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [activeTab, setActiveTab] = useState("list"); // "list" or "analytics"
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [programFilter, setProgramFilter] = useState("All");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStudent, setSelectedStudent] = useState(null);
  const [sppPrices, setSppPrices] = useState({
    "Kids Program": 300000,
    "Teens Program": 300000,
    "Fun Calistung": 350000
  });
  const [modalAmount, setModalAmount] = useState(300000);
  const [modalStatus, setModalStatus] = useState("belum_bayar");
  const [modalMethod, setModalMethod] = useState("Transfer Bank");
  const [modalReceiptUrl, setModalReceiptUrl] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch configured SPP fee amounts on mount
  useEffect(() => {
    async function fetchSppPrices() {
      try {
        const { data, error } = await supabase
          .from("landing_settings")
          .select("*");
        if (data && data.length > 0) {
          const settings = {};
          data.forEach(item => {
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

  // Initialize selected month to current month (YYYY-MM)
  useEffect(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    setSelectedMonth(`${yyyy}-${mm}`);
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

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const fetchData = async () => {
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

      setStudents(studentsData || []);
      setPayments(paymentsData || []);
      setAllPayments(allPaymentsData || []);
    } catch (err) {
      console.error("Gagal mengambil data keuangan:", err);
      showToast("Gagal memuat beberapa data dari database.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

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
      supabase.removeChannel(channel);
    };
  }, [selectedMonth]);

  // Map student with their payment record if it exists
  const getStudentPayment = (studentId) => {
    const student = students.find(s => s.id === studentId);
    const program = student?.program || "Kids Program";
    const baseAmount = sppPrices[program] || 300000;

    const pay = payments.find(p => p.student_id === studentId);
    if (pay) {
      return {
        ...pay,
        amount: pay.status === "belum_bayar" ? baseAmount : pay.amount
      };
    }
    return {
      student_id: studentId,
      month: selectedMonth,
      amount: baseAmount,
      status: "belum_bayar",
      payment_method: "Transfer Bank",
      receipt_url: ""
    };
  };

  // Export daftar pembayaran ke CSV
  const exportPaymentsCSV = () => {
    const formatRupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
    const statusLabel = (s) => s === "lunas" ? "Lunas" : s === "menunggu_konfirmasi" ? "Menunggu Konfirmasi" : "Belum Bayar";

    const headers = ["No", "Nama Siswa", "Program", "Bulan", "Nominal SPP", "Status", "Metode Bayar", "Tanggal Bayar"];
    const rows = students.map((student, idx) => {
      const pay = getStudentPayment(student.id);
      return [
        idx + 1,
        student.name,
        student.program,
        selectedMonth || "-",
        formatRupiah(pay.amount),
        statusLabel(pay.status),
        pay.payment_method || "-",
        pay.paid_at ? new Date(pay.paid_at).toLocaleDateString("id-ID") : "-"
      ];
    });

    const csvContent = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan_spp_${selectedMonth || "semua"}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // A1: Cetak laporan keuangan ke PDF
  const printFinanceReport = () => {
    window.print();
  };

  // Upload receipt helper
  const handleUploadReceipt = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${modalStudent.id}_${selectedMonth}_${Date.now()}.${fileExt}`;
      const filePath = `${selectedMonth}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("spp-receipts")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) {
        // Auto create bucket if not found
        if (uploadError.message.includes("bucket not found") || uploadError.message.includes("does not exist")) {
          const { error: bucketError } = await supabase.storage.createBucket("spp-receipts", {
            public: true,
            fileSizeLimit: 5242880, // 5MB
          });
          if (bucketError) throw bucketError;

          const { error: retryError } = await supabase.storage
            .from("spp-receipts")
            .upload(filePath, file, { cacheControl: "3600", upsert: true });
          if (retryError) throw retryError;
        } else {
          throw uploadError;
        }
      }

      const { data } = supabase.storage
        .from("spp-receipts")
        .getPublicUrl(filePath);

      setModalReceiptUrl(data.publicUrl);
      showToast("Bukti pembayaran berhasil diunggah.");
    } catch (err) {
      console.error("Upload error:", err);
      showToast("Gagal mengunggah bukti pembayaran. Detail: " + (err.message || err), "error");
    }
  };

  const handleOpenEditModal = (student) => {
    const pay = getStudentPayment(student.id);
    const program = student?.program || "Kids Program";
    const baseAmount = sppPrices[program] || 300000;

    setSelectedStudent(student);
    setModalAmount(pay.amount || baseAmount);
    setModalStatus(pay.status || "belum_bayar");
    setModalMethod(pay.payment_method || "Transfer Bank");
    setModalReceiptUrl(pay.receipt_url || "");
    setIsModalOpen(true);
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!modalStudent) return;

    setSavingPayment(true);
    try {
      const parsedAmount = parseInt(modalAmount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        showToast("Nominal pembayaran tidak valid.", "error");
        setSavingPayment(false);
        return;
      }
      const payload = {
        student_id: modalStudent.id,
        month: selectedMonth,
        amount: parsedAmount,
        status: modalStatus,
        payment_method: modalMethod,
        receipt_url: modalReceiptUrl || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("tuition_payments")
        .upsert(payload, { onConflict: "student_id,month" });

      if (error) throw error;

      showToast("Status pembayaran SPP berhasil disimpan!");
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Gagal menyimpan pembayaran:", err);
      showToast("Gagal menyimpan data pembayaran SPP.", "error");
    } finally {
      setSavingPayment(false);
    }
  };

  const handleQuickConfirmLunas = async (studentId) => {
    try {
      const pay = getStudentPayment(studentId);
      const payload = {
        student_id: studentId,
        month: selectedMonth,
        amount: pay.amount,
        status: "lunas",
        payment_method: pay.payment_method || "Transfer Bank",
        receipt_url: pay.receipt_url || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("tuition_payments")
        .upsert(payload, { onConflict: "student_id,month" });

      if (error) throw error;

      showToast("Pembayaran dikonfirmasi LUNAS!");
      fetchData();
    } catch (err) {
      console.error("Gagal melakukan konfirmasi cepat:", err);
      showToast("Gagal mengonfirmasi lunas.", "error");
    }
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
      const pay = getStudentPayment(student.id);
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

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  const handlePrintReceipt = (student, pay) => {
    const formattedAmount = formatRupiah(pay.amount);
    const amountInWords = (terbilang(pay.amount) || "Nol").trim() + " Rupiah";
    const receiptNo = `INV/${pay.month.replace("-", "")}/${student.id.substring(0, 6).toUpperCase()}`;
    const paymentDateStr = pay.payment_date 
      ? new Date(pay.payment_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
      : new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const monthName = getMonthName(pay.month);

    const printWindow = window.open("", "_blank", "width=850,height=650");
    printWindow.document.write(`
      <html>
        <head>
          <title>Kuitansi Pembayaran SPP - ${student.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');
            body {
              font-family: 'Outfit', sans-serif;
              color: #1e293b;
              background-color: #fff;
              margin: 0;
              padding: 40px;
            }
            .receipt-container {
              border: 2px solid #216c7e;
              padding: 30px;
              position: relative;
              max-width: 700px;
              margin: 0 auto;
              background-color: #fff;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #216c7e;
              padding-bottom: 15px;
              margin-bottom: 25px;
            }
            .logo-text h1 {
              font-size: 1.5rem;
              font-weight: 800;
              color: #216c7e;
              margin: 0;
              letter-spacing: 0.03em;
            }
            .logo-text p {
              font-size: 0.8rem;
              color: #64748b;
              margin: 3px 0 0 0;
              font-weight: 500;
            }
            .receipt-title {
              text-align: right;
            }
            .receipt-title h2 {
              font-size: 2rem;
              font-weight: 800;
              color: #216c7e;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 0.1em;
            }
            .receipt-title p {
              font-size: 0.85rem;
              color: #475569;
              margin: 5px 0 0 0;
              font-weight: 700;
              font-family: monospace;
            }
            .content-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .content-table td {
              padding: 12px 0;
              vertical-align: middle;
              font-size: 0.95rem;
            }
            .content-table td.label {
              width: 170px;
              font-weight: 600;
              color: #475569;
              text-transform: uppercase;
              font-size: 0.8rem;
              letter-spacing: 0.05em;
            }
            .content-table td.value {
              color: #0f172a;
            }
            .dotted-underline {
              border-bottom: 1.5px dotted #cbd5e1;
              display: block;
              padding-bottom: 3px;
            }
            .amount-box {
              background-color: #f8fafc;
              border: 2.5px solid #216c7e;
              padding: 12px 25px;
              font-size: 1.4rem;
              font-weight: 800;
              color: #216c7e;
              display: inline-block;
              margin-top: 5px;
              border-radius: 4px;
              letter-spacing: 0.02em;
            }
            .footer-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 40px;
            }
            .note {
              font-size: 0.75rem;
              color: #64748b;
              max-width: 320px;
              line-height: 1.4;
            }
            .signature {
              text-align: center;
              width: 220px;
            }
            .signature p {
              margin: 0;
              font-size: 0.85rem;
              color: #475569;
            }
            .signature .name {
              font-weight: 700;
              color: #0f172a;
              margin-top: 75px;
              border-bottom: 1.5px solid #0f172a;
              padding-bottom: 4px;
              display: inline-block;
              width: 100%;
              text-transform: uppercase;
              font-size: 0.9rem;
              letter-spacing: 0.03em;
            }
            .watermark {
              position: absolute;
              top: 55%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-15deg);
              font-size: 4.5rem;
              font-weight: 900;
              color: rgba(33, 108, 126, 0.04);
              text-transform: uppercase;
              letter-spacing: 0.15em;
              white-space: nowrap;
              pointer-events: none;
              user-select: none;
            }
            @media print {
              body {
                padding: 0;
              }
              .receipt-container {
                border: 2px solid #000;
              }
              .amount-box {
                background-color: #fff !important;
                border: 2px solid #000;
              }
              .watermark {
                color: rgba(0, 0, 0, 0.02);
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="watermark">IBRA GLOBAL</div>
            
            <div class="header">
              <div class="logo-text">
                <h1>IBRA GLOBAL ENGLISH</h1>
                <p>Jl. TPU Bobong, Pulau Taliabu, Maluku Utara</p>
                <p>HP/WA: +62 813-5700-1357 | Email: admin@ibraglobalenglish.uk</p>
              </div>
              <div class="receipt-title">
                <h2>Kuitansi</h2>
                <p>No: ${receiptNo}</p>
              </div>
            </div>
            
            <table class="content-table">
              <tr>
                <td class="label">Diterima Dari</td>
                <td class="value">
                  <span class="dotted-underline"><strong>${student.profiles?.full_name || "-"}</strong> (Orang Tua/Wali dari <strong>${student.name}</strong>)</span>
                </td>
              </tr>
              <tr>
                <td class="label">Untuk Pembayaran</td>
                <td class="value">
                  <span class="dotted-underline">SPP Bimbingan Belajar Program <strong>${student.program}</strong> - Bulan <strong>${monthName}</strong></span>
                </td>
              </tr>
              <tr>
                <td class="label">Sejumlah Uang</td>
                <td class="value">
                  <span class="dotted-underline" style="font-style: italic; font-weight: 600;"># ${amountInWords} #</span>
                </td>
              </tr>
              <tr>
                <td class="label">Metode Bayar</td>
                <td class="value">
                  <span class="dotted-underline">${pay.payment_method || "Transfer Bank"}</span>
                </td>
              </tr>
            </table>
            
            <div class="footer-section">
              <div>
                <p style="margin: 0; font-size: 0.85rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">Jumlah Nominal:</p>
                <div class="amount-box">${formattedAmount}</div>
                <div class="note" style="margin-top: 15px;">
                  * Bukti pembayaran ini diterbitkan secara sah dan elektronik.<br/>
                  * Pembayaran yang telah lunas tidak dapat ditarik kembali.
                </div>
              </div>
              
              <div class="signature">
                <p>Bobong, ${paymentDateStr}</p>
                <p style="margin-top: 5px; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em;">Penerima / Admin,</p>
                <span class="name">Husnita Usman, M.Pd.</span>
                <p style="margin-top: 5px; font-size: 0.75rem; font-weight: 600; color: #64748b;">Ibra Global English</p>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ padding: "1.5rem 1rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Toast Alert */}
      {toast.show && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 1000,
            padding: "1rem 1.5rem",
            borderRadius: "8px",
            backgroundColor: toast.type === "success" ? "#10b981" : "#ef4444",
            color: "white",
            fontWeight: "600",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            animation: "slideIn 0.3s ease",
          }}
        >
          {toast.type === "success" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* A1: Print Header — hanya tampil saat @media print */}
      <div className="finance-print-header">
        <h2>Ibra Global English — Laporan SPP Bulanan</h2>
        <p>Bulan Tagihan: <strong>{selectedMonth || "-"}</strong> &nbsp;|&nbsp; Dicetak: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
        <p style={{ marginTop: "4px" }}>Jl. TPU Bobong Komp. Fangahu, Lantai 1 Kost Fitrah, Pulau Taliabu</p>
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
                className="btn-portal-outline"
                onClick={exportPaymentsCSV}
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
            onQuickConfirm={handleQuickConfirmLunas}
            onPrintReceipt={handlePrintReceipt}
            onEditPayment={handleOpenEditModal}
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
      savingPayment={savingPayment}
      getMonthName={getMonthName}
      getStudentPayment={getStudentPayment}
      fileInputRef={fileInputRef}
      handleUploadReceipt={handleUploadReceipt}
      handleSavePayment={handleSavePayment}
      handlePrintReceipt={handlePrintReceipt}
      onClose={() => setIsModalOpen(false)}
    />

  </div>
);
}