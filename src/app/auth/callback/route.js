import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/login";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.app_metadata?.role;

      // Jika belum memiliki peran, alihkan langsung ke onboarding
      if (!role) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      // Jika sudah memiliki peran, alihkan ke dashboard yang sesuai
      if (role === "admin") {
        return NextResponse.redirect(`${origin}/admin`);
      } else if (role === "tutor") {
        return NextResponse.redirect(`${origin}/tutor`);
      } else if (role === "student") {
        return NextResponse.redirect(`${origin}/student`);
      } else {
        return NextResponse.redirect(`${origin}/parent`);
      }
    }
  }

  // Jika gagal, kembalikan ke halaman login dengan info error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
