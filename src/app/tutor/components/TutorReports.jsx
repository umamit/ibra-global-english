"use client";

export default function TutorReports({
  students,
  attendanceData,
  attendanceDate,
  formatRupiah,
  onPrintReport,
  onExportCSV
}) {
  if (students.length === 0) {
    return (
      <div className="portal-card" style={{ padding: "2rem" }}>
        <p style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-400)" }}>Belum ada siswa untuk ditampilkan.</p>
      </div>
    );
  }

  const getStatusLabel = (status) => {
    const map = {
      hadir: "Hadir",
      sakit: "Sakit",
      izin: "Izin",
      alfa: "Alfa",
      tidak_ada_kelas: "Tidak ada Kelas"
    };
    return map[status] || status;
  };

  const getStatusColor = (status) => {
    const map = {
      hadir: "#10b981",
      sakit: "#f59e0b",
      izin: "#3b82f6",
      alfa: "#ef4444",
      tidak_ada_kelas: "#6b7280"
    };
    return map[status] || "#6b7280";
  };

  const getStatusBg = (status) => {
    const map = {
      hadir: "rgba(16, 185, 129, 0.15)",
      sakit: "rgba(245, 158, 11, 0.15)",
      izin: "rgba(59, 130, 246, 0.15)",
      alfa: "rgba(239, 68, 68, 0.15)",
      tidak_ada_kelas: "rgba(107, 114, 128, 0.15)"
    };
    return map[status] || "rgba(107, 114, 128, 0.15)";
  };

  const calculateStats = () => {
    let hadir = 0, sakit = 0, izin = 0, alfa = 0, tidakAdaKelas = 0;
    students.forEach(s => {
      const data = attendanceData[s.id] || { status: "hadir" };
      if (data.status === "hadir") hadir++;
      else if (data.status === "sakit") sakit++;
      else if (data.status === "izin") izin++;
      else if (data.status === "alfa") alfa++;
      else if (data.status === "tidak_ada_kelas") tidakAdaKelas++;
    });
    const total = students.length;
    const attendanceRate = total > 0 ? Math.round((hadir / total) * 100) : 0;
    return { hadir, sakit, izin, alfa, tidakAdaKelas, total, attendanceRate };
  };

  const stats = calculateStats();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid #10b981", background: "rgba(16, 185, 129, 0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Hadir</span>
            <span style={{ fontSize: "1.5rem" }}>✓</span>
          </div>
          <h3 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#10b981", margin: 0 }}>{stats.hadir}</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>dari {stats.total} siswa</p>
        </div>

        <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid #f59e0b", background: "rgba(245, 158, 11, 0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Sakit</span>
            <span style={{ fontSize: "1.5rem" }}>🤒</span>
          </div>
          <h3 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#f59e0b", margin: 0 }}>{stats.sakit}</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>siswa</p>
        </div>

        <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid #3b82f6", background: "rgba(59, 130, 246, 0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Izin</span>
            <span style={{ fontSize: "1.5rem" }}>📋</span>
          </div>
          <h3 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#3b82f6", margin: 0 }}>{stats.izin}</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>siswa</p>
        </div>

        <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid #ef4444", background: "rgba(239, 68, 68, 0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Alfa</span>
            <span style={{ fontSize: "1.5rem" }}>⚠️</span>
          </div>
          <h3 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#ef4444", margin: 0 }}>{stats.alfa}</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>siswa</p>
        </div>

        <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid #6b7280", background: "rgba(107, 114, 128, 0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Tidak ada Kelas</span>
            <span style={{ fontSize: "1.5rem" }}>—</span>
          </div>
          <h3 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#6b7280", margin: 0 }}>{stats.tidakAdaKelas}</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>siswa</p>
        </div>

        <div className="portal-card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--color-primary)", background: "rgba(33, 108, 126, 0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Tingkat Kehadiran</span>
            <span style={{ fontSize: "1.5rem" }}>📊</span>
          </div>
          <h3 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary-dark)", margin: 0 }}>{stats.attendanceRate}%</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>rata-rata hadir</p>
        </div>
      </div>

      {/* Detailed Report Table */}
      <div className="portal-card print-card" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", margin: "0 0 0.25rem" }}>
              Detail Laporan Presensi
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", margin: 0 }}>
              Tanggal: {attendanceDate ? new Date(attendanceDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={onExportCSV}
              className="btn-portal-outline no-print"
              style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", fontWeight: "700" }}
            >
              📥 Export CSV
            </button>
            <button
              onClick={onPrintReport}
              className="btn-portal-primary no-print"
              style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", fontWeight: "700" }}
            >
              🖨️ Cetak Laporan
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Siswa</th>
                <th>Program</th>
                <th>Status Kehadiran</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => {
                const data = attendanceData[s.id] || { status: "hadir", notes: "" };
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: "700" }}>{idx + 1}</td>
                    <td style={{ fontWeight: "700" }}>{s.name}</td>
                    <td>
                      <span className="user-badge" style={{ fontSize: "0.75rem" }}>{s.program}</span>
                    </td>
                    <td>
                      <span style={{
                        padding: "0.35rem 0.75rem",
                        borderRadius: "50px",
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        backgroundColor: getStatusBg(data.status),
                        color: getStatusColor(data.status),
                        display: "inline-block"
                      }}>
                        {getStatusLabel(data.status)}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "var(--color-gray-600)" }}>
                      {data.notes || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "2px solid var(--color-gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--color-gray-600)" }}>
            Total Siswa: <strong>{students.length}</strong> | 
            Hadir: <strong style={{ color: "#10b981" }}>{stats.hadir}</strong> | 
            Sakit: <strong style={{ color: "#f59e0b" }}>{stats.sakit}</strong> | 
            Izin: <strong style={{ color: "#3b82f6" }}>{stats.izin}</strong> | 
            Alfa: <strong style={{ color: "#ef4444" }}>{stats.alfa}</strong>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--color-gray-600)", fontWeight: "600" }}>
            Tingkat Kehadiran: <span style={{ color: "var(--color-primary-dark)" }}>{stats.attendanceRate}%</span>
          </div>
        </div>
      </div>

    </div>
  );
}