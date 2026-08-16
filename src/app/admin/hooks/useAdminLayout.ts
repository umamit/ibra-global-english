"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import posthog from "posthog-js";

export function useAdminLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [newRegToast, setNewRegToast] = useState<string>("");
  const [newTestToast, setNewTestToast] = useState<string>("");
  const [adminName, setAdminName] = useState<string>("Admin");

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    akademik: false, keuangan: false, komunikasi: false, pengguna: false,
  });

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const isActive = (path: string) => pathname === path;

  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await fetch("/api/register", { credentials: "include", cache: "no-store" });
      const result = await res.json().catch(() => null);
      if (result && result.data) {
        setPendingCount(result.data.filter((r: { status: string }) => r.status === "pending").length);
      }
    } catch {}
  }, []);

  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari portal Admin?")) {
      posthog.capture("admin_logged_out");
      posthog.reset();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    }
  };

  // Auto-expand active group based on pathname
  useEffect(() => {
    const isAkademik = ["/admin/calendar", "/admin/online-schedule", "/admin/attendance", "/admin/reports", "/admin/placement-test", "/admin/curriculum"].includes(pathname);
    const isKeuangan = ["/admin/finance", "/admin/tax"].includes(pathname);
    const isKomunikasi = ["/admin/whatsapp", "/admin/announcements", "/admin/rag", "/admin/landing-page", "/admin/letters"].includes(pathname);
    const isPengguna = ["/admin/students", "/admin/tutors"].includes(pathname);
    const timer = setTimeout(() => { setOpenGroups({ akademik: isAkademik, keuangan: isKeuangan, komunikasi: isKomunikasi, pengguna: isPengguna }); }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Escape key closes sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape" && mobileOpen) setMobileOpen(false); };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileOpen]);

  // Auto-logout after 1 hour idle
  useEffect(() => {
    if (typeof window === "undefined") return;
    let timeoutId: ReturnType<typeof setTimeout>;
    const IDLE_LIMIT = 60 * 60 * 1000;
    const handleAutoLogout = async () => {
      try { await supabase.auth.signOut(); } catch {}
      window.location.href = "/login?reason=idle";
    };
    const resetTimer = () => { if (timeoutId) clearTimeout(timeoutId); timeoutId = setTimeout(handleAutoLogout, IDLE_LIMIT); };
    const activityEvents = ["mousemove", "mousedown", "keypress", "scroll", "touchstart"];
    activityEvents.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => { if (timeoutId) clearTimeout(timeoutId); activityEvents.forEach((e) => window.removeEventListener(e, resetTimer)); };
  }, [supabase]);

  // Realtime notifications
  useEffect(() => {
    setTimeout(() => { fetchPendingCount(); }, 0);
    const channel = supabase
      .channel("admin-realtime-all")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "registrations" }, (payload) => {
        const name = payload.new?.student_name || "Seseorang";
        const program = payload.new?.program || "Program";
        setNewRegToast(` Pendaftaran baru: ${name} (${program})`);
        setTimeout(() => setNewRegToast(""), 6000);
        fetchPendingCount();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "registrations" }, () => { fetchPendingCount(); })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "placement_test_submissions" }, (payload) => {
        const name = payload.new?.full_name || payload.new?.name || "Seseorang";
        const level = payload.new?.level || payload.new?.result_level || "";
        setNewTestToast(` Placement test selesai: ${name}${level ? ` — Level: ${level}` : ""}`);
        setTimeout(() => setNewTestToast(""), 6000);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Session checker
  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const checkSession = async () => {
      if (typeof window === "undefined" || !isMounted) return;
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
          if (expiresAt > 0 && Date.now() > expiresAt) {
            await supabase.auth.signOut();
            window.location.href = "/login";
          }
        }
      } catch {}
    };
    checkSession();
    intervalId = setInterval(checkSession, 60000);
    return () => { isMounted = false; if (intervalId) clearInterval(intervalId); };
  }, [supabase]);

  // Fetch admin name
  useEffect(() => {
    async function fetchAdminName() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setAdminName(user.user_metadata?.full_name || user.email!.split("@")[0]);
      } catch {}
    }
    fetchAdminName();
  }, [supabase]);

  return {
    pathname, mobileOpen, setMobileOpen, pendingCount, openGroups, toggleGroup, isActive,
    newRegToast, setNewRegToast, newTestToast, setNewTestToast, adminName, handleLogout,
  };
}
