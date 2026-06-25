"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ParentSessionManager({ supabase, router, onSessionReady }) {
  const [sessionValid, setSessionValid] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      if (typeof window === "undefined") return;

      let loginTimeStr = sessionStorage.getItem("login_time");
      if (!loginTimeStr && document.cookie.includes("login_time=active")) {
        loginTimeStr = Date.now().toString();
        sessionStorage.setItem("login_time", loginTimeStr);
      }

      if (!loginTimeStr) {
        await supabase.auth.signOut();
        document.cookie = "login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/login";
        return;
      }

      const loginTime = parseInt(loginTimeStr);
      const oneHour = 3600 * 1000;
      if (Date.now() - loginTime > oneHour) {
        await supabase.auth.signOut();
        sessionStorage.removeItem("login_time");
        document.cookie = "login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        alert("Sesi login Anda telah berakhir (maksimal 1 jam). Silakan masuk kembali.");
        window.location.href = "/login";
        return;
      }

      setSessionValid(true);
    };

    checkSession();
    const interval = setInterval(checkSession, 15000);

    return () => {
      clearInterval(interval);
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/parent")) {
        supabase.auth.signOut();
        sessionStorage.clear();
        document.cookie = "login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    };
  }, [supabase, router]);

  if (!sessionValid) {
    return (
      <div style={{ textAlign: "center", color: "var(--color-gray-50)", padding: "2rem" }}>
        <p style={{ fontWeight: "600" }}>Memverifikasi sesi...</p>
      </div>
    );
  }

  return null;
}