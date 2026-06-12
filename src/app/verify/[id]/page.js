"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function VerifyCertificate() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState(null);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Theme sync
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    if (!id) return;

    async function fetchCertificate() {
      try {
        const { data, error } = await supabase
          .from("certificates")
          .select("*, students(name, program)")
          .eq("id", id)
          .single();

        if (error) throw error;
        setCert(data);
      } catch (err) {
        console.error("Gagal memvalidasi sertifikat:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCertificate();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div style={{ textAlign: "center", color: "var(--color-gray-500)" }}>
          <svg style={{ animation: "spin 1s linear infinite", width: "40px", height: "40px", marginBottom: "1rem", color: "var(--color-primary)" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <p style={{ fontWeight: "700" }}>Memverifikasi Tanda Tangan Digital...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper" style={{ padding: "2rem 1rem", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: "800px", width: "100%", position: "relative" }}>
        
        {/* Verification Status Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--color-primary)", fontWeight: "800", textDecoration: "none", marginBottom: "1rem" }}>
            ← Beranda Utama Ibra
          </a>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "900", color: cert ? "var(--color-green)" : "var(--color-red)" }}>
            {cert ? "✓ Sertifikat Terverifikasi Asli" : "✗ Sertifikat Tidak Valid"}
          </h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Sistem Verifikasi Kelulusan Digital Ibra Global English Bobong
          </p>
        </div>

        {cert ? (
          /* CERTIFICATE CARD LAYOUT */
          <div className="glowing-card" style={{
            backgroundColor: "var(--color-white)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-xl)",
            padding: "3rem 2.5rem",
            border: "2px solid rgba(166, 136, 73, 0.25)",
            background: "radial-gradient(circle at center, rgba(166, 136, 73, 0.03) 0%, var(--color-white) 100%)",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Elegant Golden Corner Ornaments */}
            <div style={{ position: "absolute", top: "0", left: "0", width: "80px", height: "80px", borderTop: "4px solid var(--color-accent)", borderLeft: "4px solid var(--color-accent)" }} />
            <div style={{ position: "absolute", top: "0", right: "0", width: "80px", height: "80px", borderTop: "4px solid var(--color-accent)", borderRight: "4px solid var(--color-accent)" }} />
            <div style={{ position: "absolute", bottom: "0", left: "0", width: "80px", height: "80px", borderBottom: "4px solid var(--color-accent)", borderLeft: "4px solid var(--color-accent)" }} />
            <div style={{ position: "absolute", bottom: "0", right: "0", width: "80px", height: "80px", borderBottom: "4px solid var(--color-accent)", borderRight: "4px solid var(--color-accent)" }} />

            {/* Certificate Content */}
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <img src="/assets/logo.png" alt="Ibra Logo" style={{ width: "80px", height: "80px", marginBottom: "1.5rem" }} />
              
              <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--color-accent)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Certificate of Achievement
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", fontStyle: "italic", marginBottom: "2rem" }}>
                Sertifikat Penghargaan dan Kelulusan Akademik
              </p>

              <p style={{ fontSize: "0.95rem", color: "var(--color-gray-600)", margin: "0" }}>Dengan ini menyatakan bahwa siswa:</p>
              <h3 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0.5rem 0 1rem", borderBottom: "2px solid var(--color-accent)", display: "inline-block", paddingBottom: "0.25rem", paddingHorizontal: "2rem" }}>
                {cert.students?.name}
              </h3>
              
              <p style={{ fontSize: "0.95rem", color: "var(--color-gray-600)", maxWidth: "550px", lineHeight: "1.6" }}>
                Telah menyelesaikan seluruh rangkaian modul evaluasi pembelajaran dengan predikat kelulusan memuaskan pada program belajar:
              </p>
              
              <h4 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-800)", margin: "0.75rem 0 0.25rem" }}>
                {cert.students?.program} - MODUL {cert.module_name.toUpperCase()}
              </h4>
              <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)" }}>
                Predikat Evaluasi Akhir: <strong style={{ color: "var(--color-accent)", fontSize: "1rem" }}>{cert.grade}</strong>
              </p>

              {/* Bottom Details Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: "2rem", width: "100%", marginTop: "3rem", alignItems: "center" }} className="certificate-footer-grid">
                
                {/* ID/QR column */}
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: "0.7rem", color: "var(--color-gray-400)", textTransform: "uppercase", fontWeight: "700" }}>ID Verifikasi</p>
                  <p style={{ fontSize: "0.75rem", fontFamily: "monospace", fontWeight: "bold", color: "var(--color-gray-700)" }}>
                    IBRA-CERT-{cert.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p style={{ fontSize: "0.7rem", color: "var(--color-gray-400)", textTransform: "uppercase", fontWeight: "700", marginTop: "1rem" }}>Tanggal Terbit</p>
                  <p style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--color-gray-700)" }}>
                    {new Date(cert.issue_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>

                {/* Badge Column */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    border: "3px double var(--color-accent)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(166, 136, 73, 0.05)",
                    color: "var(--color-accent)",
                    fontWeight: "800",
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    <span>Official</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: "900", margin: "2px 0" }}>✓ IBRA</span>
                    <span>Verified</span>
                  </div>
                </div>

                {/* Signature Column */}
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-gray-500)" }}>Tutor Pendamping,</p>
                  <div style={{ height: "40px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                    {/* Simulated elegant cursive signature */}
                    <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "1.1rem", fontWeight: "bold", color: "var(--color-primary)" }}>
                      {cert.tutor_name}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--color-gray-800)", borderTop: "1px solid var(--color-gray-300)", display: "inline-block", paddingLeft: "1.5rem", marginTop: "4px" }}>
                    {cert.tutor_name}
                  </p>
                </div>

              </div>

            </div>
          </div>
        ) : (
          /* INVALID CERTIFICATE ERROR CARD */
          <div className="portal-card" style={{ padding: "3.5rem", textAlign: "center", borderLeft: "5px solid var(--color-red)" }}>
            <svg style={{ color: "var(--color-red)", width: "56px", height: "56px", marginBottom: "1.5rem" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>Sertifikat Tidak Ditemukan</h3>
            <p style={{ color: "var(--color-gray-600)", fontSize: "0.95rem", maxWidth: "550px", margin: "0 auto", lineHeight: "1.6" }}>
              Maaf, tanda pengenal sertifikat digital ini tidak terdaftar di pangkalan data Ibra Global English Bobong atau telah ditarik kembali oleh administrator. Silakan periksa kembali tautan verifikasi Anda.
            </p>
            <button className="btn-portal-outline" onClick={() => router.push("/")} style={{ marginTop: "2rem" }}>
              Kembali ke Beranda Utama
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
