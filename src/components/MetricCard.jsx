"use client";

/**
 * Komponen MetricCard Reusable
 * Menampilkan ringkasan statistik/metrik dengan border kiri berwarna kustom
 */
export default function MetricCard({
  title,
  value,
  description,
  color = "primary", // primary, yellow, green, red, accent
  style = {}
}) {
  // Pemetaan warna border dan teks berdasarkan tema Ibra Global English
  const colorMap = {
    primary: {
      border: "var(--color-primary)",
      text: "var(--color-primary-dark)",
    },
    yellow: {
      border: "var(--color-yellow)",
      text: "var(--color-yellow)",
    },
    green: {
      border: "var(--color-green)",
      text: "var(--color-green)",
    },
    red: {
      border: "var(--color-red)",
      text: "var(--color-red)",
    },
    accent: {
      border: "var(--color-accent)",
      text: "var(--color-accent)",
    }
  };

  const selectedColor = colorMap[color] || colorMap.primary;

  return (
    <div 
      className="portal-card" 
      style={{ 
        padding: "1.5rem", 
        borderLeft: `5px solid ${selectedColor.border}`,
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        ...style 
      }}
    >
      <p style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)", margin: 0 }}>
        {title}
      </p>
      <h2 style={{ fontSize: "2rem", fontWeight: "900", color: selectedColor.text, margin: "4px 0 0" }}>
        {value}
      </h2>
      {description && (
        <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", margin: "4px 0 0" }}>
          {description}
        </p>
      )}
    </div>
  );
}
