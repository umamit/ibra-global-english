"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import "./login.css";

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
  const [role, setRole] = useState("parent");

  // Deteksi dan inisialisasi tema otomatis saat halaman dimuat
  useEffect(() => {

    let cancelled = false;

    const load = async () => {

      if (cancelled) return;

      const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);

    };

    load();

    return () => {

      cancelled = true;

    };

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
      
      // Ambil role riil dari public.profiles karena user_metadata bisa out-of-sync
      let role = "parent";
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile?.role) {
          role = profile.role;
        } else {
          role = user?.app_metadata?.role || user?.user_metadata?.role || "parent";
        }
      } catch (_) {
        role = user?.app_metadata?.role || user?.user_metadata?.role || "parent";
      }

      // Jika bukan admin, cek mode maintenance sebelum melanjutkan
      if (role !== "admin") {
        try {
          const { data: maintData } = await supabase
            .from("landing_settings")
            .select("value")
            .eq("key", "maintenance_mode")
            .single();

          if (maintData?.value === "true") {
            // Keluarkan sesi yang baru dibuat agar tidak tersimpan
            await supabase.auth.signOut();
            setErrorBanner("Website sedang dalam pemeliharaan. Portal orang tua sementara tidak dapat diakses. Silakan coba lagi nanti atau hubungi admin.");
            setLoading(false);
            return;
          }
        } catch (_) {
          // Jika gagal query, lanjutkan login (fail open)
        }
      }

      // Catat waktu login untuk durasi 1 jam dan tab close detection
      if (typeof window !== "undefined") {
        sessionStorage.setItem("login_time", Date.now().toString());
        document.cookie = `login_time=active; path=/; max-age=3600; SameSite=Lax`;
      }

      setSuccessBanner("Masuk berhasil! Mengalihkan ke halaman dashboard...");

      setTimeout(() => {
        if (role === "admin") {
          router.push("/admin");
        } else if (role === "tutor") {
          router.push("/tutor");
        } else if (role === "student") {
          router.push("/student");
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
            role: role, // Role dari pilihan dropdown pendaftaran
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
      {/* Background blobs for premium fluid design */}
      <div className="auth-bg-blob blob-1"></div>
      <div className="auth-bg-blob blob-2"></div>
      <div className="auth-bg-blob blob-3"></div>

      <button onClick={toggleTheme} className="auth-theme-toggle" aria-label="Toggle theme">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{
            transform: theme === "dark" ? "rotate(40deg)" : "rotate(0deg)",
            transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            overflow: "visible"
          }}
          className="theme-toggle-icon"
        >
          <mask id="login-moon-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <circle 
              cx={theme === "dark" ? "12" : "30"} 
              cy={theme === "dark" ? "4" : "0"} 
              r="8" 
              fill="black" 
              style={{
                transition: "cx 0.5s cubic-bezier(0.4, 0, 0.2, 1), cy 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            />
          </mask>
          
          <circle 
            cx="12" 
            cy="12" 
            r={theme === "dark" ? "9" : "5"} 
            fill="currentColor"
            mask="url(#login-moon-mask)"
            style={{
              transition: "r 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          />
          
          <g 
            stroke="currentColor"
            style={{
              opacity: theme === "dark" ? 0 : 1,
              transform: theme === "dark" ? "scale(0.5)" : "scale(1)",
              transformOrigin: "center",
              transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </g>
        </svg>
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
            Portal Login
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorBanner(""); setSuccessBanner(""); }}
            className={`auth-tab ${isRegister ? "active" : ""}`}
          >
            Daftar Sekarang
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
            <>
              <div className="form-group">
                <label htmlFor="name-input" className="form-label">Nama Lengkap</label>
                <div className="input-with-icon">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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
              </div>

              <div className="form-group">
                <label htmlFor="role-input" className="form-label">Daftar Sebagai (Peran)</label>
                <div className="input-with-icon">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <select
                    id="role-input"
                    className="form-input"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={loading}
                    style={{ cursor: "pointer" }}
                  >
                    <option value="parent">Wali Murid / Orang Tua</option>
                    <option value="student">Siswa / Pelajar</option>
                    <option value="tutor">Pengajar / Tutor</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email-input" className="form-label">Alamat Email</label>
            <div className="input-with-icon">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
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
          </div>

          <div className="form-group">
            <label htmlFor="password-input" className="form-label">Kata Sandi</label>
            <div className="input-with-icon">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
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
          </div>

          <button type="submit" className="form-btn" disabled={loading}>
            <span>
              {loading 
                ? "Menghubungkan..." 
                : isRegister 
                  ? "Daftar Sekarang" 
                  : "Portal Login"
              }
            </span>
          </button>
        </form>

        <div className="auth-back-link">
          <Link href="/">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="back-arrow-icon"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Kembali ke Beranda Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
