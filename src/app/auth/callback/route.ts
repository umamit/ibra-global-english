import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/utils/supabase/config";

export async function GET(request: any) {
  let searchParams: URLSearchParams, origin: string;
  try {
    ({ searchParams, origin } = new URL(request.url));
  } catch {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/login?error=invalid_url`);
  }
  const code = searchParams.get("code");

  // Siapkan response redirect default ke onboarding
  const response = NextResponse.redirect(`${origin}/onboarding`);

  if (code) {
    const { url, anonKey } = getSupabaseConfig();

    // Buat klien Supabase yang menulis cookies langsung ke response redirect
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Set cookie login_time=active agar tidak terlogout oleh ParentSessionManager
      response.cookies.set("login_time", "active", {
        path: "/",
        maxAge: 3600,
        sameSite: "lax",
      });

      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.app_metadata?.role;

      // Jika sudah memiliki peran, ubah lokasi redirect langsung pada header response yang sama
      // Ini menjaga seluruh cookie (termasuk path "/" dan httpOnly) tetap utuh tanpa terbuang!
      if (role) {
        let dashboardUrl = `${origin}/parent`;
        if (role === "admin") dashboardUrl = `${origin}/admin`;
        else if (role === "tutor") dashboardUrl = `${origin}/tutor`;
        else if (role === "student") dashboardUrl = `${origin}/student`;

        response.headers.set("Location", dashboardUrl);
      }

      return response;
    }
  }

  // Jika terjadi kegagalan, kembalikan ke halaman login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
