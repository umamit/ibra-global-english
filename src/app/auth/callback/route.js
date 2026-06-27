import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/utils/supabase/config";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Siapkan response redirect default ke onboarding
  const response = NextResponse.redirect(`${origin}/onboarding`);

  if (code) {
    const { url, anonKey } = getSupabaseConfig();

    // Buat klien Supabase yang menulis cookies langsung ke response redirect ini
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
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.app_metadata?.role;

      // Jika sudah memiliki peran, arahkan ke dashboard yang sesuai
      if (role) {
        let dashboardUrl = `${origin}/parent`;
        if (role === "admin") dashboardUrl = `${origin}/admin`;
        else if (role === "tutor") dashboardUrl = `${origin}/tutor`;
        else if (role === "student") dashboardUrl = `${origin}/student`;

        // Buat response redirect baru ke dashboard dan salin cookies yang sudah terekam
        const successResponse = NextResponse.redirect(dashboardUrl);
        response.cookies.getAll().forEach((cookie) => {
          successResponse.cookies.set(cookie.name, cookie.value, {
            path: cookie.path,
            domain: cookie.domain,
            expires: cookie.expires,
            secure: cookie.secure,
            httpOnly: cookie.httpOnly,
            sameSite: cookie.sameSite,
          });
        });
        return successResponse;
      }

      // Jika belum memiliki peran, gunakan response default ke onboarding (cookies sudah terpasang)
      return response;
    }
  }

  // Jika terjadi kegagalan, kembalikan ke halaman login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
