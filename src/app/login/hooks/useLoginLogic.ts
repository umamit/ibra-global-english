import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import posthog from "posthog-js";
import * as Sentry from "@sentry/nextjs";

export function useLoginLogic() {
  const router = useRouter();
  const supabase = createClient();

  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorBanner] = useState<string>("");
  const [successMsg, setSuccessBanner] = useState<string>("");
  const [theme, setTheme] = useState<string>("light");
  const [role, setRole] = useState<string>("parent");
  const [homeUrl, setHomeUrl] = useState<string>("/");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (cancelled) return;
      const savedTheme = localStorage.getItem("theme");
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
      setTheme(initialTheme);
      document.documentElement.setAttribute("data-theme", initialTheme);

      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const port = window.location.port;

      if (hostname.startsWith("admin.") || hostname.startsWith("digital.")) {
        const mainHost = hostname.replace(/^(admin\.|digital\.)/, "");
        const portSuffix = port ? `:${port}` : "";
        setHomeUrl(`${protocol}//${mainHost}${portSuffix}`);
      } else {
        setHomeUrl("/");
      }

      const params = new URLSearchParams(window.location.search);
      if (params.get("reason") === "idle") {
        setErrorBanner("Sesi Anda telah berakhir karena tidak ada aktivitas selama 1 jam. Silakan masuk kembali.");
      } else if (params.get("error")) {
        const errorParam = params.get("error") || "";
        if (errorParam.includes("unauthorized")) {
          setErrorBanner("Akses ditolak: Akun Anda tidak memiliki wewenang untuk membuka portal tersebut.");
        } else {
          setErrorBanner(decodeURIComponent(errorParam));
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const statusChangeCallback = async (response: { status: string }, isUserInitiated = false) => {
    if (response.status === "connected" && isUserInitiated) {
      setLoading(true);
      try {
        await supabase.auth.signInWithOAuth({
          provider: "facebook",
          options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
      } catch {
        setLoading(false);
      }
    }
  };

  const checkLoginState = () => {
    if (window.FB) {
      window.FB.getLoginStatus((response) => statusChangeCallback(response, true));
    }
  };

  useEffect(() => {
    window.checkLoginState = checkLoginState;
    const checkFB = () => {
      if (window.FB) {
        window.FB.getLoginStatus((response) => statusChangeCallback(response));
      }
    };
    if (window.FB) {
      checkFB();
    } else {
      const interval = setInterval(() => {
        if (window.FB) {
          checkFB();
          clearInterval(interval);
        }
      }, 500);
      return () => {
        clearInterval(interval);
        delete window.checkLoginState;
      };
    }
    return () => { delete window.checkLoginState; };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorBanner("");
    setSuccessBanner("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
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
      let userRole = "parent";
      try {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        if (profile?.role) {
          userRole = profile.role;
        } else {
          userRole = user?.app_metadata?.role || user?.user_metadata?.role || "parent";
        }
      } catch {
        userRole = user?.app_metadata?.role || user?.user_metadata?.role || "parent";
      }

      if (role !== userRole) {
        await supabase.auth.signOut();
        const roleLabels: Record<string, string> = { student: "Siswa", parent: "Orang Tua", tutor: "Tutor", admin: "Admin" };
        const actualLabel = roleLabels[userRole] || userRole;
        setErrorBanner(`Akun Anda terdaftar sebagai portal ${actualLabel}. Harap berpindah ke tab portal "${actualLabel}" untuk masuk.`);
        setLoading(false);
        return;
      }

      if (userRole !== "admin") {
        try {
          const { data: maintData } = await supabase.from("landing_settings").select("value").eq("key", "maintenance_mode").single();
          if (maintData?.value === "true") {
            await supabase.auth.signOut();
            setErrorBanner("Website sedang dalam pemeliharaan. Portal orang tua sementara tidak dapat diakses. Silakan coba lagi nanti atau hubungi admin.");
            setLoading(false);
            return;
          }
        } catch {}
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("login_time", Date.now().toString());
        document.cookie = `login_time=active; path=/; max-age=3600; SameSite=Lax`;
      }

      posthog.identify(user.id, { email: user.email, role: userRole, name: user.user_metadata?.full_name || user.email });
      posthog.capture("user_logged_in", { role: userRole });

      Sentry.setUser({ id: user.id, email: user.email, username: user.user_metadata?.full_name || email, role: userRole });

      setSuccessBanner("Masuk berhasil! Mengalihkan ke halaman dashboard...");

      setTimeout(() => {
        if (userRole === "admin") router.push("/admin");
        else if (userRole === "tutor") router.push("/tutor");
        else if (userRole === "student") router.push("/student");
        else router.push("/parent");
        router.refresh();
      }, 1000);
    } catch {
      setErrorBanner("Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.");
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
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
        options: { data: { full_name: fullName.trim(), role } },
      });

      if (error) {
        setErrorBanner(error.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        posthog.identify(data.user.id, { email: data.user.email, role, name: fullName.trim() });
      }
      posthog.capture("user_registered", { role });

      setSuccessBanner("Pendaftaran berhasil! Akun Anda telah aktif, silakan masuk.");
      setFullName("");

      setTimeout(() => {
        setIsRegister(false);
        setSuccessBanner("");
      }, 2000);
    } catch (err) {
      setErrorBanner("Gagal mendaftar: " + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true); setErrorBanner(""); setSuccessBanner("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?selected_role=${role}` },
      });
      if (error) { setErrorBanner(error.message); setLoading(false); }
    } catch { setErrorBanner("Gagal menghubungkan ke Google. Silakan coba lagi."); setLoading(false); }
  };

  const handleFacebookLogin = async () => {
    setLoading(true); setErrorBanner(""); setSuccessBanner("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: { redirectTo: `${window.location.origin}/auth/callback?selected_role=${role}` },
      });
      if (error) { setErrorBanner(error.message); setLoading(false); }
    } catch { setErrorBanner("Gagal menghubungkan ke Facebook. Silakan coba lagi."); setLoading(false); }
  };

  return {
    isRegister, setIsRegister, fullName, setFullName, email, setEmail, password, setPassword,
    loading, errorMsg, setErrorBanner, successMsg, setSuccessBanner, theme, role, setRole, homeUrl,
    toggleTheme, handleLogin, handleRegister, handleGoogleLogin, handleFacebookLogin,
  };
}
