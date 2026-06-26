"use client";

export default function TabSwitcher({ activeTab, setActiveTab, students, parents, registrations, fetchRegistrations }) {
  const pendingCount = registrations.filter(r => r.status === "pending").length;
  const nonApprovedCount = registrations.filter(r => r.status !== "approved").length;

  const tabStyle = (tab) => ({
    background: "none",
    border: "none",
    padding: "0.75rem 1.25rem",
    fontWeight: activeTab === tab ? "800" : "500",
    color: activeTab === tab ? "var(--color-primary-dark)" : "var(--color-gray-500)",
    borderBottom: activeTab === tab ? "3px solid var(--color-primary)" : "3px solid transparent",
    marginBottom: "-2px",
    cursor: "pointer",
    fontSize: "1rem",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.2s ease",
    flexShrink: 0
  });

  const badgeStyle = (tab, bgActive, bgInactive, colorActive, colorInactive) => ({
    fontSize: "0.75rem",
    backgroundColor: activeTab === tab ? bgActive : bgInactive,
    color: activeTab === tab ? colorActive : colorInactive,
    padding: "0.15rem 0.5rem",
    borderRadius: "10px",
    fontWeight: "700"
  });

  return (
    <div style={{ display: "flex", borderBottom: "2px solid var(--color-gray-100)", marginBottom: "1.75rem", gap: "0.5rem", overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}>
      <button onClick={() => setActiveTab("students")} style={tabStyle("students")}>
        <span>Daftar Siswa</span>
        <span style={badgeStyle("students", "var(--color-primary-light)", "var(--color-gray-100)", "var(--color-primary-dark)", "var(--color-gray-600)")}>{students.length}</span>
      </button>
      <button onClick={() => setActiveTab("parents")} style={tabStyle("parents")}>
        <span>Kelola Peran & Pengguna</span>
        <span style={badgeStyle("parents", "var(--color-primary-light)", "var(--color-gray-100)", "var(--color-primary-dark)", "var(--color-gray-600)")}>{parents.length}</span>
      </button>
      <button onClick={() => { setActiveTab("registrations"); fetchRegistrations(); }} style={{ ...tabStyle("registrations"), position: "relative" }}>
        <span>Pendaftaran Masuk</span>
        {pendingCount > 0 ? (
          <span style={{ fontSize: "0.75rem", backgroundColor: "var(--color-red)", color: "white", padding: "0.15rem 0.5rem", borderRadius: "10px", fontWeight: "700", animation: "pulse 2s infinite" }}>{pendingCount} baru</span>
        ) : (
          <span style={badgeStyle("registrations", "var(--color-primary-light)", "var(--color-gray-100)", "var(--color-primary-dark)", "var(--color-gray-600)")}>{nonApprovedCount}</span>
        )}
      </button>
    </div>
  );
}
