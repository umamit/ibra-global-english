"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import "./onboarding.css";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [theme] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return savedTheme || (systemPrefersDark ? "dark" : "light");
    }
    return "light";
  });

  // Apply current theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      }
    };
    checkUser();
  }, [supabase, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan peran. Silakan coba lagi.");
      }

      // Force session refresh so the new app_metadata.role is loaded by the client SDK & middleware
      await supabase.auth.refreshSession();

      // Redirect user to their corresponding dashboard using window.location for a clean cookie sync
      if (selectedRole === "student") {
        window.location.href = "/student";
      } else if (selectedRole === "tutor") {
        window.location.href = "/tutor";
      } else {
        window.location.href = "/parent";
      }
    } catch (err) {
      setErrorMsg(err.message || "Terjadi kesalahan sistem. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-wrapper">
      <div className="onboarding-card">
        <img 
          src="/assets/logo.png" 
          alt="Ibra Global English Logo" 
          className="onboarding-logo"
        />
        
        <h1 className="onboarding-title">Pilih Peran Anda</h1>
        <p className="onboarding-subtitle">
          Selamat datang! Langkah terakhir sebelum masuk ke dashboard Anda. Silakan pilih jenis akun yang ingin Anda gunakan.
        </p>

        {errorMsg && <div className="error-banner">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="role-grid" role="radiogroup" aria-label="Pilih Peran Akun">
            
            {/* Card Siswa */}
            <div 
              className={`role-card-option ${selectedRole === "student" ? "selected" : ""}`}
              onClick={() => setSelectedRole("student")}
              role="radio"
              aria-checked={selectedRole === "student"}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setSelectedRole("student");
                }
              }}
            >
              <div className="role-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/>
                  <path d="M6 18.8v-4L2 13"/>
                  <path d="M21.5 12v6a2 2 0 0 1-2 2H4.5a2 2 0 0 1-2-2v-6"/>
                </svg>
              </div>
              <h3 className="role-card-title">Siswa</h3>
              <p className="role-card-desc">
                Akses materi pelajaran, jadwal belajar, dan lihat rapor nilai Anda.
              </p>
            </div>

            {/* Card Wali / Orang Tua */}
            <div 
              className={`role-card-option ${selectedRole === "parent" ? "selected" : ""}`}
              onClick={() => setSelectedRole("parent")}
              role="radio"
              aria-checked={selectedRole === "parent"}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setSelectedRole("parent");
                }
              }}
            >
              <div className="role-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 className="role-card-title">Orang Tua</h3>
              <p className="role-card-desc">
                Pantau kehadiran, tugas, dan perkembangan nilai rapor anak Anda.
              </p>
            </div>

            {/* Card Tutor */}
            <div 
              className={`role-card-option ${selectedRole === "tutor" ? "selected" : ""}`}
              onClick={() => setSelectedRole("tutor")}
              role="radio"
              aria-checked={selectedRole === "tutor"}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setSelectedRole("tutor");
                }
              }}
            >
              <div className="role-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h20v14H2z"/>
                  <path d="M8 21h8"/>
                  <path d="M12 17v4"/>
                  <path d="m10 8.5 2-1.5 2 1.5"/>
                  <path d="M9 12h6"/>
                </svg>
              </div>
              <h3 className="role-card-title">Tutor / Guru</h3>
              <p className="role-card-desc">
                Kelola kelas pengajaran, absensi siswa, dan input nilai rapor.
              </p>
            </div>

          </div>

          <button 
            type="submit" 
            className="onboarding-btn" 
            disabled={!selectedRole || loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin" style={{ width: "1.25rem", height: "1.25rem", marginRight: "0.5rem", animation: "spin 1s linear infinite" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>Simpan & Lanjutkan</span>
            )}
          </button>
        </form>
      </div>
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          display: inline-block;
        }
      `}</style>
    </div>
  );
}
