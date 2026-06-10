"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { createAdminClient as createClient } from "@/utils/supabase/client";

export default function AdminPlacementTest() {
  const supabase = createClient();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  // Metrics
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    contacted: 0,
    enrolled: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("placement_test_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
      calculateMetrics(data || []);
    } catch (err) {
      console.error("Gagal memuat data tes penempatan:", err);
      setStatusMsg({ type: "error", text: "Gagal memuat data: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (data) => {
    const total = data.length;
    const pending = data.filter((s) => s.status === "pending").length;
    const contacted = data.filter((s) => s.status === "contacted").length;
    const enrolled = data.filter((s) => s.status === "enrolled").length;

    setMetrics({ total, pending, contacted, enrolled });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from("placement_test_submissions")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setStatusMsg({ type: "success", text: `Status calon siswa berhasil diperbarui ke "${newStatus}"!` });
      setTimeout(() => setStatusMsg({ type: "", text: "" }), 3000);
      fetchData();
    } catch (err) {
      console.error("Gagal memperbarui status:", err);
      alert("Gagal memperbarui status: " + err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data kuis milik "${name}"?`)) {
      try {
        const { error } = await supabase
          .from("placement_test_submissions")
          .delete()
          .eq("id", id);

        if (error) throw error;

        setStatusMsg({ type: "success", text: "Data hasil kuis berhasil dihapus." });
        setTimeout(() => setStatusMsg({ type: "", text: "" }), 3000);
        fetchData();
      } catch (err) {
        console.error("Gagal menghapus data:", err);
        alert("Gagal menghapus data: " + err.message);
      }
    }
  };

  // WhatsApp follow-up link generation
  const triggerWhatsAppFollowUp = (sub) => {
    const targetPhone = sub.whatsapp_number.startsWith("0") 
      ? "62" + sub.whatsapp_number.slice(1) 
      : sub.whatsapp_number.replace("+", "");

    const courseRecommendation = sub.level === "Beginner" 
      ? "Kids Program atau Basic Teens" 
      : sub.level === "Intermediate" 
        ? "Teens Program (Intermediate)" 
        : "Teens Program (Advanced / TOEFL Prep)";

    const message = `Halo Kak ${sub.full_name}!\n\nKami dari *Ibra Global English Bobong* ingin mengucapkan selamat atas penyelesaian *Tes Penempatan Bahasa Inggris Online* Anda.\n\nBerikut hasil ringkasan tes Anda:\n📌 *Rekomendasi Level:* ${sub.level}\n📌 *Skor Tes:* ${sub.score} / 15\n📌 *Program Belajar:* ${courseRecommendation}\n\nTutor kami sangat merekomendasikan Anda untuk bergabung bersama kami di tingkat ini guna mengembangkan kompetensi secara optimal. Apakah Kak ${sub.full_name} berminat berkonsultasi mengenai jadwal kelas dan penawaran biaya khusus? \n\nKami tunggu kehadirannya! 😊`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${targetPhone}?text=${encodedMessage}`, "_blank");
  };

  // Filter & Search Logic
  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.whatsapp_number.includes(searchTerm);
    const matchesStatus = statusFilter === "all" ? true : s.status === statusFilter;
    const matchesLevel = levelFilter === "all" ? true : s.level === levelFilter;

    return matchesSearch && matchesStatus && matchesLevel;
  });

  return (
    <div>
      <div className="dashboard-topbar">
        <div className="topbar-title">
          <h1>Hasil Tes Penempatan Publik</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Kelola data calon siswa baru hasil pengujian kuis interaktif publik
          </p>
        </div>
      </div>

      {statusMsg.text && (
        <div
          className={statusMsg.type === "success" ? "auth-success-banner" : "auth-error-banner"}
          style={{ marginBottom: "2rem" }}
        >
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Metrics Summary Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <div className="portal-card" style={{ padding: "1.5rem", borderLeft: "5px solid var(--color-primary)" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)" }}>Total Pendaftar Kuis</p>
          <h2 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--color-primary-dark)", marginTop: "4px" }}>{metrics.total}</h2>
          <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "4px" }}>Semua hasil pengerjaan kuis</p>
        </div>

        <div className="portal-card" style={{ padding: "1.5rem", borderLeft: "5px solid var(--color-yellow)" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)" }}>Belum Dihubungi (Pending)</p>
          <h2 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--color-yellow)", marginTop: "4px" }}>{metrics.pending}</h2>
          <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "4px" }}>Butuh tindak lanjut segera</p>
        </div>

        <div className="portal-card" style={{ padding: "1.5rem", borderLeft: "5px solid var(--color-accent)" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)" }}>Sudah Dihubungi</p>
          <h2 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--color-accent)", marginTop: "4px" }}>{metrics.contacted}</h2>
          <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "4px" }}>Tahap penawaran / konsultasi</p>
        </div>

        <div className="portal-card" style={{ padding: "1.5rem", borderLeft: "5px solid var(--color-green)" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)" }}>Terdaftar (Enrolled)</p>
          <h2 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--color-green)", marginTop: "4px" }}>{metrics.enrolled}</h2>
          <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "4px" }}>Sukses menjadi siswa Ibra</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="portal-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
          
          {/* Search */}
          <div style={{ flex: "1 1 300px" }}>
            <input
              type="text"
              placeholder="Cari berdasarkan nama, email, atau nomor WhatsApp..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: "150px" }}>
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="pending">Belum Dihubungi</option>
              <option value="contacted">Sudah Dihubungi</option>
              <option value="enrolled">Terdaftar (Enrolled)</option>
            </select>
          </div>

          {/* Level Filter */}
          <div style={{ minWidth: "150px" }}>
            <select
              className="form-input"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <option value="all">Semua Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gray-500)" }}>
          <p>Memuat hasil tes penempatan...</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Calon Siswa</th>
                <th>WhatsApp</th>
                <th>Skor Kuis</th>
                <th>Rekomendasi Level</th>
                <th>Tanggal Tes</th>
                <th>Status Tindak Lanjut</th>
                <th style={{ textAlign: "right" }}>Aksi Follow-Up</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-500)" }}>
                    Tidak ada data pendaftar kuis yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub, idx) => (
                  <tr key={sub.id}>
                    <td style={{ fontWeight: "700" }}>{idx + 1}</td>
                    <td>
                      <strong style={{ color: "var(--color-gray-900)" }}>{sub.full_name}</strong>
                      <p style={{ fontSize: "0.75rem", color: "var(--color-gray-500)" }}>{sub.email}</p>
                    </td>
                    <td style={{ fontWeight: "600" }}>{sub.whatsapp_number}</td>
                    <td style={{ fontWeight: "800", color: "var(--color-primary-dark)", fontSize: "1.1rem" }}>
                      {sub.score} <span style={{ fontSize: "0.8rem", color: "var(--color-gray-400)" }}>/ 15</span>
                    </td>
                    <td>
                      <span className={`user-badge`} style={{
                        backgroundColor: sub.level === "Advanced" ? "var(--color-green-light)" : sub.level === "Intermediate" ? "var(--color-primary-light)" : "var(--color-accent-light)",
                        color: sub.level === "Advanced" ? "var(--color-green-dark)" : sub.level === "Intermediate" ? "var(--color-primary-dark)" : "var(--color-accent)",
                        fontWeight: "800",
                        fontSize: "0.8rem",
                        padding: "0.3rem 0.75rem"
                      }}>
                        {sub.level}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>
                      {new Date(sub.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td>
                      <select
                        className="form-input"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", height: "auto", fontWeight: "600", width: "150px" }}
                        value={sub.status}
                        onChange={(e) => handleUpdateStatus(sub.id, e.target.value)}
                      >
                        <option value="pending">🔴 Pending</option>
                        <option value="contacted">🟡 Contacted</option>
                        <option value="enrolled">🟢 Enrolled</option>
                      </select>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button
                          className="btn-portal-primary"
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", display: "inline-flex", gap: "0.25rem", alignItems: "center" }}
                          onClick={() => triggerWhatsAppFollowUp(sub)}
                          title="Kirim pesan penawaran otomatis via WhatsApp"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                          <span>Hubungi</span>
                        </button>
                        <button
                          className="btn-portal-danger"
                          style={{ padding: "0.4rem 0.6rem", fontSize: "0.8rem" }}
                          onClick={() => handleDelete(sub.id, sub.full_name)}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
