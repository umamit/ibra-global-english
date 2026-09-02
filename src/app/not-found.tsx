import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Halaman Tidak Ditemukan | Ibra Global English Bobong",
  description: "Halaman yang Anda cari tidak dapat ditemukan di server Ibra Global English Bobong.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        background: "linear-gradient(180deg, var(--color-bg-teal-50, #eef6f8) 0%, #ffffff 100%)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          padding: "2.5rem 2rem",
          borderRadius: "24px",
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(33, 108, 126, 0.12)",
          borderTop: "1.5px solid rgba(255, 255, 255, 0.8)",
          boxShadow: "0 20px 40px rgba(33, 108, 126, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: "3.5rem",
            fontWeight: "900",
            letterSpacing: "-0.04em",
            color: "var(--color-primary, #216c7e)",
            marginBottom: "0.5rem",
            lineHeight: 1,
          }}
        >
          404
        </div>

        <h1
          style={{
            fontSize: "1.35rem",
            fontWeight: "800",
            color: "var(--color-primary-dark, #164d57)",
            marginBottom: "0.75rem",
          }}
        >
          Halaman Tidak Ditemukan
        </h1>

        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--color-gray-600, #475569)",
            lineHeight: 1.6,
            marginBottom: "2rem",
          }}
        >
          Maaf, halaman yang Anda tuju tidak ditemukan atau telah dipindahkan. Silakan kembali ke beranda atau hubungi tim admin kami.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "9999px",
              backgroundColor: "var(--color-primary, #216c7e)",
              color: "#ffffff",
              fontWeight: "700",
              fontSize: "0.9rem",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(33, 108, 126, 0.25)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            Kembali ke Beranda
          </Link>
          <a
            href="https://wa.me/6281357001357"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "9999px",
              backgroundColor: "transparent",
              color: "var(--color-primary, #216c7e)",
              fontWeight: "700",
              fontSize: "0.9rem",
              textDecoration: "none",
              border: "1.5px solid rgba(33, 108, 126, 0.35)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            Hubungi WhatsApp Admin
          </a>
        </div>
      </div>
    </div>
  );
}
