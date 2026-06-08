import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const acceptHeader = request.headers.get("accept") || "";

  // =====================================================================
  // 1. NEGOSIASI KONTEN MARKDOWN UNTUK AGEN AI (Accept: text/markdown)
  // =====================================================================
  const isHome = (pathname === "/" || pathname === "/index.html");
  if (isHome) {
    if (acceptHeader.includes("text/markdown")) {
      try {
        // Fetch static index.md dari folder public melalui URL lokal
        const mdUrl = new URL("/index.md", request.url);
        const mdRes = await fetch(mdUrl);
        if (mdRes.ok) {
          const mdContent = await mdRes.text();
          const tokens = Math.ceil(mdContent.length / 4.0).toString();
          
          return new Response(mdContent, {
            status: 200,
            headers: {
              "Content-Type": "text/markdown; charset=utf-8",
              "x-markdown-tokens": tokens,
              "Link": [
                "</.well-known/api-catalog>; rel=\"api-catalog\"",
                "</.well-known/agent-skills/index.json>; rel=\"agent-skills\"",
                "</.well-known/mcp/server-card.json>; rel=\"mcp-server-card\""
              ].join(", ")
            }
          });
        }
      } catch (err) {
        console.error("Gagal melakukan negosiasi markdown di proxy:", err);
      }
    }
  }

  // =====================================================================
  // 2. TIMPA CONTENT-TYPE UNTUK FILE DI DIRECTORY .WELL-KNOWN
  // =====================================================================
  if (pathname.startsWith("/.well-known")) {
    const response = NextResponse.next();
    if (pathname.endsWith(".json") || pathname.includes("openid-configuration") || pathname.includes("oauth-protected-resource") || pathname.includes("oauth-authorization-server") || pathname.includes("http-message-signatures-directory")) {
      response.headers.set("Content-Type", "application/json; charset=utf-8");
    } else if (pathname === "/.well-known/api-catalog") {
      response.headers.set("Content-Type", "application/linkset+json; charset=utf-8");
    }
    return response;
  }

  // =====================================================================
  // 3. AUTENTIKASI SUPABASE & PROTEKSI RUTE BERBASIS PERAN (ROLE-BASED RBAC)
  // =====================================================================
  
  // Lewati pemeriksaan sesi cookie Supabase untuk aset-aset statis biasa
  const isStaticAsset = pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|pdf|md|json|css|js|ico)$/);
  if (isStaticAsset) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Buat klien Supabase khusus proxy (middleware)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Ambil data user aktif secara aman
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Dapatkan peran pengguna dari metadata (efisien, tanpa query database tambahan)
  const role = user?.user_metadata?.role;

  // Proteksi rute Admin (/admin*)
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (role !== "admin") {
      // Jika bukan admin, redirect ke login dengan parameter error
      return NextResponse.redirect(new URL("/login?error=unauthorized_admin", request.url));
    }
  }

  // Proteksi rute Orang Tua (/parent*)
  if (pathname.startsWith("/parent")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (role !== "parent") {
      // Jika bukan orang tua, redirect ke login dengan parameter error
      return NextResponse.redirect(new URL("/login?error=unauthorized_parent", request.url));
    }
  }

  // Pengalihan cerdas jika pengguna sudah masuk dan membuka halaman login (/login)
  if (pathname === "/login") {
    if (user) {
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else {
        return NextResponse.redirect(new URL("/parent", request.url));
      }
    }
  }

  // Selalu tambahkan header penemuan agen AI (Link header) pada halaman HTML beranda utama
  if (isHome) {
    response.headers.set(
      "Link",
      [
        "</.well-known/api-catalog>; rel=\"api-catalog\"",
        "</.well-known/agent-skills/index.json>; rel=\"agent-skills\"",
        "</.well-known/mcp/server-card.json>; rel=\"mcp-server-card\""
      ].join(", ")
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Jalankan proxy pada semua jalur request, kecuali:
     * - berkas statis internal Next.js (_next/static, _next/image)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
