"use client";

interface LandingTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  maintenanceMode: boolean;
}

export default function LandingTabs({ activeTab, setActiveTab, maintenanceMode }: LandingTabsProps) {
  const tabs = [
    { key: "hero", label: "Profil & Hero Utama" },
    { key: "navigation", label: "Menu Navigasi" },
    { key: "gallery", label: "Galeri Kegiatan" },
    { key: "videos", label: "Galeri Video" },
    { key: "testimonials", label: "Ulasan & Testimoni" },
    { key: "programs", label: "Program Kursus" },
    { key: "benefits", label: "Keunggulan" },
    { key: "faq", label: "Tanya Jawab (FAQ)" },
    { key: "maintenance", label: maintenanceMode ? "🔴 Sistem & Keamanan" : "⚙️ Sistem & Keamanan" },
  ];

  return (
    <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`btn-portal-outline ${activeTab === tab.key ? "active" : ""}`}
          style={{
            padding: "0.6rem 1.25rem",
            fontWeight: "600",
            whiteSpace: "nowrap",
            borderRadius: "var(--radius-full)",
            ...(tab.key === "maintenance" && maintenanceMode ? { borderColor: "#ef4444", color: "#ef4444" } : {}),
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
