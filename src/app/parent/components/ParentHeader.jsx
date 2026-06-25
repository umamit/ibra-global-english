"use client";

export default function ParentHeader({ parentName, notifications, showNotificationDropdown, setShowNotificationDropdown }) {
  return (
    <div className="dashboard-topbar">
      <div className="topbar-title">
        <h1>Selamat Datang, Bapak/Ibu</h1>
        <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
          Silakan pantau absensi harian, agenda jadwal, dan hasil evaluasi belajar anak secara real-time.
        </p>
      </div>
      <div className="topbar-user" style={{ gap: "1rem", position: "relative", display: "flex", alignItems: "center" }}>
        
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
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              backgroundColor: showNotificationDropdown ? "var(--color-gray-100)" : "transparent",
              transition: "background-color 0.2s"
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            {notifications.length > 0 && (
              <span style={{
                position: "absolute",
                top: "2px",
                right: "2px",
                width: "8px",
                height: "8px",
                backgroundColor: "#ef4444",
                borderRadius: "50%",
                border: "1.5px solid white"
              }} />
            )}
          </button>

          {/* Dropdown Notifikasi */}
          {showNotificationDropdown && (
            <div style={{
              position: "absolute",
              right: "0",
              top: "35px",
              width: "320px",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "var(--shadow-xl)",
              border: "1px solid var(--color-gray-200)",
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

        <span className="user-badge">{parentName}</span>
      </div>
    </div>
  );
}