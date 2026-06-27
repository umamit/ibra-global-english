"use client";

export default function ParentHeader({ parentName, notifications, showNotificationDropdown, setShowNotificationDropdown, onLogout }) {
  // Ambil inisial nama untuk avatar
  const getInitials = (name) => {
    if (!name) return "OT";
    return name
      .split(" ")
      .slice(0, 2)
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="dashboard-topbar">
      <div className="topbar-title">
        <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--color-gray-900)" }}>
          Selamat Datang, Bapak/Ibu
        </h1>
        <p style={{ color: "var(--color-gray-500)", fontSize: "0.875rem", marginTop: "4px" }}>
          Pantau absensi harian, agenda jadwal, dan hasil belajar anak Anda secara real-time.
        </p>
      </div>

      <div className="topbar-user" style={{ position: "relative" }}>
        {/* Lonceng Notifikasi */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-gray-600)",
              position: "relative",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              backgroundColor: showNotificationDropdown ? "var(--color-gray-100)" : "transparent",
              transition: "background-color 0.2s"
            }}
            type="button"
            aria-label="Notifikasi"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            {notifications.length > 0 && (
              <span style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                width: "9px",
                height: "9px",
                backgroundColor: "#ef4444",
                borderRadius: "50%",
                border: "2px solid white"
              }} />
            )}
          </button>

          {/* Dropdown Notifikasi */}
          {showNotificationDropdown && (
            <div className="notification-dropdown" style={{
              position: "absolute",
              right: "0",
              top: "45px",
              width: "320px",
              backgroundColor: "white",
              zIndex: 100,
              overflow: "hidden"
            }}>
              <div style={{ padding: "0.85rem 1.15rem", borderBottom: "1px solid var(--color-gray-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "800", fontSize: "0.85rem", color: "var(--color-gray-900)" }}>Notifikasi ({notifications.length})</span>
              </div>
              <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--color-gray-400)", fontSize: "0.8rem" }}>
                    Tidak ada notifikasi baru saat ini.
                  </div>
                ) : (
                  notifications.map((n, idx) => (
                    <div
                      key={n.id || idx}
                      onClick={() => {
                        n.action();
                        setShowNotificationDropdown(false);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-gray-50)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      style={{
                        padding: "0.85rem 1.15rem",
                        borderBottom: idx < notifications.length - 1 ? "1px solid var(--color-gray-50)" : "none",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        textAlign: "left"
                      }}
                    >
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                        <span style={{ fontSize: "1rem" }}>{n.type === "warning" ? "⚠️" : "🔔"}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "0.8rem", fontWeight: "800", color: n.type === "warning" ? "#dc2626" : "var(--color-gray-900)", marginBottom: "2px" }}>
                            {n.title}
                          </p>
                          <p style={{ fontSize: "0.75rem", color: "var(--color-gray-600)", lineHeight: "1.4" }}>
                            {n.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Profile Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginLeft: "0.5rem" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "var(--color-primary-light)",
            color: "var(--color-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "700",
            fontSize: "0.85rem",
            border: "1.5px solid var(--color-primary)"
          }}>
            {getInitials(parentName)}
          </div>
          <span className="user-badge" style={{ margin: 0 }}>{parentName}</span>
        </div>

        {onLogout && (
          <button onClick={onLogout} className="btn-logout" style={{ width: "auto", padding: "0.5rem 1rem", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.35rem", marginLeft: "0.5rem" }} type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Keluar</span>
          </button>
        )}
      </div>
    </div>
  );
}