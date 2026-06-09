"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
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
  const [theme, setTheme] = useState("light");

  // Deteksi dan inisialisasi tema otomatis saat halaman dimuat
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  // Fungsi toggle tema mandiri
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

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
      {/* Floating Theme Toggle Button */}
      <button onClick={toggleTheme} className="auth-theme-toggle" aria-label="Toggle theme">
        {theme === "light" ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="theme-toggle-icon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="theme-toggle-icon"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        )}
      </button>

      <div className="auth-card">
        <div className="auth-header">
          <img src="/assets/logo.png" alt="Ibra Global English Logo" className="auth-logo-img" />
          <h1 className="auth-title">Portal Akademik</h1>
          <p className="auth-subtitle">Ibra Global English Bobong</p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorBanner(""); setSuccessBanner(""); }}
            className={`auth-tab ${!isRegister ? "active" : ""}`}
          >
            Masuk Akun
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorBanner(""); setSuccessBanner(""); }}
            className={`auth-tab ${isRegister ? "active" : ""}`}
          >
            Daftar Baru
          </button>
        </div>

        {errorMsg && (
          <div className="auth-error-banner" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-success-banner" role="status">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
          {isRegister && (
            <div className="form-group">
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

          <div className="form-group">
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

          <div className="form-group">
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

        <div className="auth-back-link">
          <a href="/">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="back-arrow-icon"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Kembali ke Beranda Utama
          </a>
        </div>
      </div>
    </div>
  );
}
