export default function LegalLayout({ title, subtitle, children, lastUpdated = "13 Juni 2026", publisher = "PT Ibra Global English" }) {
  return (
    <div style={{ backgroundColor: "var(--color-gray-50)", minHeight: "100vh", padding: "3rem 1.5rem", color: "var(--color-gray-800)", fontFamily: "var(--font-sans), sans-serif" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Navigation Back */}
        <div style={{ marginBottom: "2rem" }}>
          <a href="/" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            ← Kembali ke Beranda
          </a>
        </div>

        {/* Legal Card */}
        <div style={{ backgroundColor: "white", padding: "3rem 2.5rem", borderRadius: "12px", boxShadow: "var(--shadow-md)", border: "1px solid var(--color-gray-150)" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--color-primary-dark)", marginBottom: "0.5rem" }}>
            {title}
          </h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.85rem", borderBottom: "1px solid var(--color-gray-200)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
            Terakhir Diperbarui: {lastUpdated} | {publisher}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", lineHeight: "1.7", fontSize: "0.95rem" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}