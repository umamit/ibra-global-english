"use client";

import React from "react";
import Link from "next/link";
import { useLoginLogic } from "./hooks/useLoginLogic";
import "./login.css";

declare global {
  interface Window {
    FB?: {
      getLoginStatus: (callback: (response: { status: string }) => void) => void;
    };
    checkLoginState?: () => void;
  }
}

export default function LoginPage() {
  const {
    isRegister, setIsRegister, fullName, setFullName, email, setEmail, password, setPassword,
    loading, errorMsg, setErrorBanner, successMsg, setSuccessBanner, theme, role, setRole, homeUrl,
    toggleTheme, handleLogin, handleRegister, handleGoogleLogin, handleFacebookLogin,
  } = useLoginLogic();

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
            overflow: "visible",
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
                transition: "cx 0.5s cubic-bezier(0.4, 0, 0.2, 1), cy 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
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
              transition: "r 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />

          <g
            stroke="currentColor"
            style={{
              opacity: theme === "dark" ? 0 : 1,
              transform: theme === "dark" ? "scale(0.5)" : "scale(1)",
              transformOrigin: "center",
              transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
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

        {/* Role Selector */}
        <div className="auth-role-picker">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`role-pill ${role === "student" ? "active" : ""}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <span>Siswa</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("parent")}
            className={`role-pill ${role === "parent" ? "active" : ""}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Orang Tua</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("tutor")}
            className={`role-pill ${role === "tutor" ? "active" : ""}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
              <path d="M6 6h10"/>
              <path d="M6 10h10"/>
            </svg>
            <span>Tutor</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`role-pill ${role === "admin" ? "active" : ""}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Admin</span>
          </button>
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
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
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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

        <div className="auth-divider">
          <span>atau</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="google-login-btn"
          disabled={loading}
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>Masuk / Daftar dengan Google</span>
        </button>

        <button
          type="button"
          onClick={handleFacebookLogin}
          className="facebook-login-btn"
          disabled={loading}
        >
          <svg className="facebook-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Masuk / Daftar dengan Facebook</span>
        </button>

        <div className="auth-back-link">
          <Link href={homeUrl}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="back-arrow-icon"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Kembali ke Beranda Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
