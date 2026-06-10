"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from "react";
import { createAdminClient as createClient } from "@/utils/supabase/client";

export default function AdminFinance() {
  const supabase = createClient();

  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
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

      setStudents(studentsData || []);
      setPayments(paymentsData || []);
    } catch (err) {
      console.error("Gagal mengambil data keuangan:", err);
      showToast("Gagal memuat beberapa data dari database.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      const payload = {
        student_id: modalStudent.id,
        month: selectedMonth,
        amount: parseInt(modalAmount),
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

  const getMonthName = (ym) => {
    if (!ym) return "";
    const [y, m] = ym.split("-");
    const date = new Date(parseInt(y), parseInt(m) - 1, 1);
    return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
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

      {/* Top Header Section */}
      <div className="dashboard-topbar" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", borderBottom: "1px solid var(--color-gray-200)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>Kelola Keuangan / SPP</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Atur biaya bimbingan belajar, konfirmasi bukti transfer wali murid, dan pantau tagihan SPP bulanan siswa.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label style={{ fontWeight: "700", color: "var(--color-gray-700)" }}>Bulan Tagihan:</label>
          <input
            type="month"
            className="form-input"
            style={{ padding: "0.5rem 1rem", borderRadius: "6px", width: "180px" }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        
        {/* Total Terkumpul */}
        <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid #10b981", background: "rgba(16, 185, 129, 0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Total Dana Masuk</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#065f46" }}>{formatRupiah(stats.collected)}</h2>
          <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>Dari total {stats.paidCount} pembayaran lunas.</p>
        </div>

        {/* Menunggu Konfirmasi */}
        <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid #f59e0b", background: "rgba(245, 158, 11, 0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Menunggu Konfirmasi</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#92400e" }}>{stats.pendingCount} <span style={{ fontSize: "1rem", fontWeight: "500" }}>Siswa</span></h2>
          <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>Wali murid sudah mengunggah bukti transfer.</p>
        </div>

        {/* Belum Membayar */}
        <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid #ef4444", background: "rgba(239, 68, 68, 0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Belum Bayar / Menunggak</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#991b1b" }}>{stats.unpaidCount} <span style={{ fontSize: "1rem", fontWeight: "500" }}>Siswa</span></h2>
          <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>Belum melunasi tagihan bulan ini.</p>
        </div>

        {/* Estimasi Potensial */}
        <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--color-primary)", background: "rgba(33, 108, 126, 0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Proyeksi Pendapatan</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>{formatRupiah(stats.expected)}</h2>
          <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>Estimasi jika semua siswa membayar lunas.</p>
        </div>

      </div>

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

      {/* Student Payments Table */}
      <div className="portal-card" style={{ padding: "1.5rem", overflowX: "auto" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "var(--color-gray-400)", padding: "2rem 0" }}>Memproses pemuatan data keuangan...</p>
        ) : filteredStudents.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--color-gray-400)", padding: "2rem 0" }}>Tidak ada data siswa yang cocok dengan filter pencarian.</p>
        ) : (
          <table className="portal-table student-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(33, 108, 126, 0.05)" }}>
                <th style={{ textAlign: "left", padding: "12px" }}>Nama Siswa</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Program</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Wali Murid (Ortu)</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Nominal Biaya</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Metode</th>
                <th style={{ textAlign: "center", padding: "12px" }}>Status SPP</th>
                <th style={{ textAlign: "right", padding: "12px" }}>Tindakan Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const pay = getStudentPayment(student.id);
                return (
                  <tr key={student.id} style={{ borderBottom: "1px solid var(--color-gray-100)" }} className="table-row-hover">
                    <td style={{ padding: "12px", fontWeight: "700", color: "var(--color-gray-800)" }} data-label="Nama Siswa">
                      {student.name}
                    </td>
                    <td style={{ padding: "12px" }} data-label="Program">
                      <span className="badge-program">{student.program}</span>
                    </td>
                    <td style={{ padding: "12px", color: "var(--color-gray-600)" }} data-label="Orang Tua">
                      {student.profiles?.full_name || <em style={{ color: "var(--color-red)" }}>Belum terhubung</em>}
                    </td>
                    <td style={{ padding: "12px", fontWeight: "600", color: "var(--color-gray-700)" }} data-label="Biaya">
                      {formatRupiah(pay.amount)}
                    </td>
                    <td style={{ padding: "12px", color: "var(--color-gray-500)", fontSize: "0.9rem" }} data-label="Metode">
                      {pay.status !== "belum_bayar" ? (pay.payment_method || "Transfer Bank") : "-"}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }} data-label="Status">
                      {pay.status === "lunas" ? (
                        <span className="badge-status-present" style={{ display: "inline-block", width: "120px" }}>LUNAS</span>
                      ) : pay.status === "menunggu_konfirmasi" ? (
                        <span className="badge-status-sick" style={{ display: "inline-block", width: "120px", color: "#b45309", borderColor: "#fef3c7", background: "#fef3c7" }}>KONFIRMASI</span>
                      ) : (
                        <span className="badge-status-absent" style={{ display: "inline-block", width: "120px" }}>BELUM BAYAR</span>
                      )}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }} data-label="Aksi">
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        {pay.status === "menunggu_konfirmasi" && (
                          <button
                            onClick={() => handleQuickConfirmLunas(student.id)}
                            className="btn-portal-outline"
                            style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", borderColor: "#10b981", color: "#10b981", fontWeight: "600" }}
                          >
                            Setujui Lunas
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(student)}
                          className="btn-portal-outline"
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                        >
                          Kelola SPP
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* EDIT/MANAGE PAYMENT MODAL */}
      {isModalOpen && modalStudent && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(11, 15, 23, 0.6)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            className="portal-modal"
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "var(--shadow-2xl)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--color-gray-100)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "var(--color-primary-light)",
              }}
            >
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>Kelola Pembayaran SPP</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginTop: "2px" }}>{modalStudent.name} ({modalStudent.program})</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--color-gray-500)", cursor: "pointer" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSavePayment} style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                
                {/* Periode Tagihan */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "var(--color-gray-700)" }}>Bulan Tagihan</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: "100%", padding: "0.6rem", background: "var(--color-gray-50)", opacity: 0.8 }}
                      value={getMonthName(selectedMonth)}
                      disabled
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "var(--color-gray-700)" }}>Nominal Pembayaran (Rp)</label>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: "100%", padding: "0.6rem" }}
                      value={modalAmount}
                      onChange={(e) => setModalAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Metode Pembayaran & Status */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "var(--color-gray-700)" }}>Metode Pembayaran</label>
                    <select
                      className="form-input"
                      style={{ width: "100%", padding: "0.6rem" }}
                      value={modalMethod}
                      onChange={(e) => setModalMethod(e.target.value)}
                    >
                      <option value="Transfer Bank">Transfer Bank</option>
                      <option value="Tunai">Tunai / Cash</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "var(--color-gray-700)" }}>Status Pembayaran</label>
                    <select
                      className="form-input"
                      style={{ width: "100%", padding: "0.6rem" }}
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value)}
                    >
                      <option value="belum_bayar">Belum Membayar</option>
                      <option value="menunggu_konfirmasi">Menunggu Konfirmasi</option>
                      <option value="lunas">Lunas</option>
                    </select>
                  </div>
                </div>

                {/* Bukti Transfer */}
                <div style={{ borderTop: "1px solid var(--color-gray-100)", paddingTop: "1rem" }}>
                  <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "var(--color-gray-700)", display: "block", marginBottom: "0.5rem" }}>
                    Berkas Bukti Transfer (Receipt)
                  </label>
                  
                  {modalReceiptUrl ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div style={{ width: "100%", maxHeight: "160px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--color-gray-200)", display: "flex", justifyContent: "center", background: "#f8fafc" }}>
                        <img src={modalReceiptUrl} alt="Bukti Transfer" style={{ maxHeight: "160px", objectFit: "contain" }} />
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <a
                          href={modalReceiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-portal-outline"
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", textAlign: "center", flex: 1 }}
                        >
                          Buka Gambar Penuh ↗
                        </a>
                        <button
                          type="button"
                          onClick={() => setModalReceiptUrl("")}
                          className="btn-portal-danger"
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                        >
                          Hapus Berkas
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "1.5rem", border: "2px dashed var(--color-gray-200)", borderRadius: "8px", background: "var(--color-gray-50)", cursor: "pointer" }} onClick={() => fileInputRef.current?.click()}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "0.5rem" }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <span style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", fontWeight: "600" }}>Pilih berkas foto bukti pembayaran</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--color-gray-400)", marginTop: "2px" }}>Format PNG/JPG/JPEG maks. 5MB</span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUploadReceipt}
                        accept="image/*"
                        style={{ display: "none" }}
                      />
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Actions */}
              <div
                style={{
                  marginTop: "1.5rem",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  borderTop: "1px solid var(--color-gray-100)",
                  paddingTop: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-portal-outline"
                  style={{ padding: "0.5rem 1.2rem", fontWeight: "600" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-portal-primary"
                  style={{ padding: "0.5rem 1.5rem", fontWeight: "700" }}
                  disabled={savingPayment}
                >
                  {savingPayment ? "Menyimpan..." : "Simpan Status SPP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
