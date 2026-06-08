"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorBanner] = useState("");
  const [successMsg, setSuccessBanner] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorBanner("");
    setSuccessBanner("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorBanner("Email atau kata sandi yang Anda masukkan salah.");
        } else {
          setErrorBanner(error.message);
        }
        setLoading(false);
        return;
      }

      const user = data.user;
      const role = user?.user_metadata?.role || "parent";

      setSuccessBanner("Masuk berhasil! Mengalihkan ke halaman dashboard...");

      setTimeout(() => {
        if (role === "admin") {
          router.push("/admin");
        } else {
          router.push("/parent");
        }
        router.refresh();
      }, 1000);
    } catch (err) {
      setErrorBanner("Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.");
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorBanner("");
    setSuccessBanner("");

    if (!fullName.trim()) {
      setErrorBanner("Nama lengkap harus diisi.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: "parent", // Default role
          },
        },
      });

      if (error) {
        setErrorBanner(error.message);
        setLoading(false);
        return;
      }

      setSuccessBanner("Pendaftaran berhasil! Akun Anda telah aktif, silakan masuk.");
      setFullName("");
      
      // Auto switch to login tab after success
      setTimeout(() => {
        setIsRegister(false);
        setSuccessBanner("");
      }, 2000);
    } catch (err) {
      setErrorBanner("Gagal mendaftar: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header" style={{ marginBottom: "1.5rem" }}>
          <div className="auth-logo-box">
            <img src="/assets/logo.png" alt="Ibra Global English Logo" className="auth-logo-img" />
          </div>
          <h2 className="auth-title">Portal Akademik</h2>
          <p className="auth-subtitle">Ibra Global English Bobong</p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--color-gray-200)", marginBottom: "1.5rem" }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorBanner(""); setSuccessBanner(""); }}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: "none",
              border: "none",
              borderBottom: !isRegister ? "3px solid var(--color-primary)" : "none",
              fontWeight: !isRegister ? "700" : "500",
              color: !isRegister ? "var(--color-primary-dark)" : "var(--color-gray-500)",
              cursor: "pointer",
              fontSize: "0.95rem",
              transition: "all 0.2s ease"
            }}
          >
            Masuk Akun
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorBanner(""); setSuccessBanner(""); }}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: "none",
              border: "none",
              borderBottom: isRegister ? "3px solid var(--color-primary)" : "none",
              fontWeight: isRegister ? "700" : "500",
              color: isRegister ? "var(--color-primary-dark)" : "var(--color-gray-500)",
              cursor: "pointer",
              fontSize: "0.95rem",
              transition: "all 0.2s ease"
            }}
          >
            Daftar Baru
          </button>
        </div>

        {errorMsg && (
          <div className="auth-error-banner" role="alert" style={{ marginBottom: "1.25rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-success-banner" role="status" style={{ marginBottom: "1.25rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
          {isRegister && (
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label htmlFor="name-input" className="form-label">Nama Lengkap</label>
              <input
                type="text"
                id="name-input"
                className="form-input"
                placeholder="Masukkan Nama Lengkap Anda"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label htmlFor="email-input" className="form-label">Alamat Email</label>
            <input
              type="email"
              id="email-input"
              className="form-input"
              placeholder="nama@email.com"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="password-input" className="form-label">Kata Sandi</label>
            <input
              type="password"
              id="password-input"
              className="form-input"
              placeholder="••••••••"
              required
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="form-btn" disabled={loading}>
            <span>
              {loading 
                ? "Menghubungkan..." 
                : isRegister 
                  ? "Daftar Akun Baru" 
                  : "Masuk ke Portal"
              }
            </span>
          </button>
        </form>

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <a href="/" style={{ color: "var(--color-primary-dark)", fontSize: "0.85rem", fontWeight: "600", textDecoration: "none" }}>
            ← Kembali ke Beranda Utama
          </a>
        </div>
      </div>
    </div>
  );
}
