import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/utils/supabase/config";

// Cache status maintenance di level modul agar tidak query DB tiap request.
// TTL 30 detik: perubahan toggle maintenance tetap terasa cepat, tapi
// halaman publik tidak lagi memukul database pada setiap kunjungan.
let maintenanceCache: { value: boolean | null; expires: number } = { value: null, expires: 0 };

async function getMaintenanceMode(supabase: any) {
  const now = Date.now();
  if (maintenanceCache.expires > now) return maintenanceCache.value;
  try {
    const { data } = await supabase
      .from("landing_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .single();
    const value = data?.value === "true";
    maintenanceCache = { value, expires: now + 30000 };
    return value;
  } catch (_) {
    // Fail open: kalau query gagal, jangan blokir halaman.
    return maintenanceCache.value;
  }
}

export async function proxy(request: NextRequest) {
  // Generate a random base64 nonce using standard Web Crypto API
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  
  const isDev = process.env.NODE_ENV === "development";

  // Define strict Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'report-sample' blob: ${isDev ? "'unsafe-eval'" : ""} https://www.googletagmanager.com https://static.cloudflareinsights.com https://*.cloudflare.com https://*.cloudflareinsights.com https://connect.facebook.net https://www.youtube.com https://s.ytimg.com;
    style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    font-src 'self' https://cdn.jsdelivr.net;
    img-src 'self' data: blob: https://images.unsplash.com https://uszukipvrvjrgrikxfwh.supabase.co https://res.cloudinary.com https://*.canva.com https://www.canva.com https://api.qrserver.com https://www.facebook.com;
    connect-src 'self' https://uszukipvrvjrgrikxfwh.supabase.co wss://uszukipvrvjrgrikxfwh.supabase.co https://www.google-analytics.com https://*.analytics.google.com https://analytics.google.com https://stats.g.doubleclick.net https://graph.facebook.com https://www.facebook.com https://connect.facebook.net;
    frame-src 'self' https://maps.google.com https://www.google.com https://google.com https://*.canva.com https://www.canva.com https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://youtube-nocookie.com https://www.facebook.com https://web.facebook.com;
    frame-ancestors 'self';
    worker-src 'self' blob:;
    child-src 'self' blob:;
    object-src 'none';
    base-uri 'none';
    form-action 'self';
    media-src 'self' blob: data:;
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  const { pathname } = request.nextUrl;
  const acceptHeader = request.headers.get("accept") || "";
  const hostname = request.headers.get("host") || "";

  // A. SUBDOMAIN ROUTING (digital.ibraglobalenglish.uk -> /digital-agency)
  // Exclude static assets, Next.js internal paths, and API routes from rewriting
  const isStaticAsset = pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|pdf|md|json|css|js|ico|txt)$/);
  const isApiOrNext = pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.startsWith("/ingest");

  // Avoid infinite loops by checking !pathname.startsWith("/digital-agency")
  if (hostname.startsWith("digital.") && !isStaticAsset && !isApiOrNext && !pathname.startsWith("/digital-agency")) {
    return NextResponse.rewrite(new URL(`/digital-agency${pathname}`, request.url));
  }

  const addSecurityHeaders = (res: NextResponse) => {
    res.headers.set("Content-Security-Policy", cspHeader);
    
    // Kelola X-Frame-Options secara statis ke DENY (Sanity Studio telah dihapus)
    res.headers.set("X-Frame-Options", "DENY");

    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/parent") ||
      pathname.startsWith("/tutor") ||
      pathname.startsWith("/student") ||
      pathname.startsWith("/api")
    ) {
      res.headers.set("X-Robots-Tag", "noindex, nofollow");
    }
  };

  // B. BYPASS SUPABASE AUTH & DB QUERIES FOR REWRITTEN DIGITAL AGENCY PAGES
  if (pathname.startsWith("/digital-agency")) {
    const res = NextResponse.next();
    addSecurityHeaders(res);
    return res;
  }

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

      // Fallback ke inlined markdown content jika fetch gagal (misal karena batasan network/loopback Vercel)
      const fallbackMd = `# Ibra Global English Bobong - Kursus Bahasa Inggris Terbaik di Pulau Taliabu\n\nBelajar Seru Lancar Bicara. Kursus Bahasa Inggris Offline Terbaik di Bobong, Pulau Taliabu.\n\n## Tentang Kami\nIbra Global English menawarkan kursus bahasa Inggris offline dengan metode pembelajaran yang menyenangkan dan efektif untuk anak-anak dan remaja. Kami fokus pada peningkatan kemampuan speaking secara aktif dan interaktif bersama tutor berpengalaman.\n\n## Program Kursus\n\n### 1. Kids Program (Usia 5-12 tahun)\nPembelajaran menyenangkan melalui lagu, permainan, dan visual untuk membangun kecintaan berbahasa Inggris sejak usia dini.\n\n### 2. Teens Program (Usia 13-17 tahun)\nMembantu siswa sekolah menguasai keterampilan speaking, tata bahasa (grammar), kosa kata (vocabulary), serta melatih rasa percaya diri untuk presentasi dan diskusi kelompok.\n\n### 3. Fun Calistung (Usia 5-7 tahun)\nBimbingan membaca, menulis, dan berhitung dengan metode belajar sambil bermain yang ramah anak.\n\n## Keunggulan\n* **Metode Interaktif**: Belajar sambil praktik langsung lewat percakapan aktif.\n* **Tutor Berpengalaman**: Didampingi tutor yang berdedikasi tinggi.\n* **Kelas Terbatas**: Maksimal 10 siswa per kelas untuk perhatian lebih personal.\n* **Fasilitas Nyaman**: Lingkungan belajar yang mendukung kreativitas.\n\n## Hubungi Kami\n* **Alamat**: Jl. TPU Bobong Komp. Fangahu, Lantai 1 Kost Fitrah, Kabupaten Pulau Taliabu, Maluku Utara.\n* **WhatsApp**: +62 813-5700-1357\n* **Email**: contact@ibraglobalenglish.uk\n* **Facebook**: https://www.facebook.com/IbraGlobalEnglish\n* **Instagram**: https://www.instagram.com/ibraglobalenglish/\n\n## Pendaftaran & Konsultasi Gratis\nSilakan hubungi kontak kami di atas atau kunjungi langsung kantor kami untuk mendapatkan **Placement Test Gratis**!`;
      
      const fallbackTokens = Math.ceil(fallbackMd.length / 4.0).toString();
      return new Response(fallbackMd, {
        status: 200,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "x-markdown-tokens": fallbackTokens,
          "Link": [
            "</.well-known/api-catalog>; rel=\"api-catalog\"",
            "</.well-known/agent-skills/index.json>; rel=\"agent-skills\"",
            "</.well-known/mcp/server-card.json>; rel=\"mcp-server-card\""
          ].join(", ")
        }
      });
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
  // 2b. TIMPA CONTENT-TYPE UNTUK AUTH.MD
  // =====================================================================
  if (pathname === "/auth.md") {
    const response = NextResponse.next();
    response.headers.set("Content-Type", "text/markdown; charset=utf-8");
    return response;
  }

  // =====================================================================
  // 3. AUTENTIKASI SUPABASE & PROTEKSI RUTE BERBASIS PERAN (ROLE-BASED RBAC)
  // =====================================================================
  
  // Lewati pemeriksaan untuk endpoint PostHog ingest proxy agar tidak membebani database
  if (pathname.startsWith("/ingest")) {
    const resIngest = NextResponse.next();
    addSecurityHeaders(resIngest);
    return resIngest;
  }

  // Lewati pemeriksaan sesi cookie Supabase untuk aset-aset statis biasa
  if (isStaticAsset) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  addSecurityHeaders(response);

  // Dapatkan URL dan anonKey dari sanitizer config helper
  const { url, anonKey } = getSupabaseConfig();

  // Buat klien Supabase khusus proxy (middleware)
  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          addSecurityHeaders(response);
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

  // Dapatkan peran pengguna dari app_metadata (aman, hanya service role yang bisa ubah)
  let role = user?.app_metadata?.role;

  // Fallback ke query database profiles jika app_metadata.role belum terisi (untuk sesi lama)
  if (user && !role) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;
  }

  // --- LOGIKA ONBOARDING PERAN (GOOGLE LOGIN) ---
  const isOnboardingPage = pathname === "/onboarding";
  const isOnboardingApi = pathname.startsWith("/api/onboarding");

  // Jika pengguna sudah masuk tetapi BELUM memiliki peran (role kosong/null)
  if (user && !role) {
    if (!isOnboardingPage && !isOnboardingApi && pathname !== "/api/admin/logout") {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  // Jika pengguna sudah memiliki peran tetapi mencoba mengakses halaman onboarding, kembalikan ke dashboard
  if (user && role && isOnboardingPage) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    } else if (role === "tutor") {
      return NextResponse.redirect(new URL("/tutor", request.url));
    } else if (role === "student") {
      return NextResponse.redirect(new URL("/student", request.url));
    } else {
      return NextResponse.redirect(new URL("/parent", request.url));
    }
  }
  // ----------------------------------------------

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

  // Proteksi rute Tutor (/tutor*)
  if (pathname.startsWith("/tutor")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (role !== "tutor") {
      return NextResponse.redirect(new URL("/login?error=unauthorized_tutor", request.url));
    }
  }

  // Proteksi rute Student (/student*)
  if (pathname.startsWith("/student")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (role !== "student") {
      return NextResponse.redirect(new URL("/login?error=unauthorized_student", request.url));
    }
  }

  // Pengalihan cerdas jika pengguna sudah masuk dan membuka halaman login (/login)
  if (pathname === "/login") {
    if (user) {
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else if (role === "tutor") {
        return NextResponse.redirect(new URL("/tutor", request.url));
      } else if (role === "student") {
        return NextResponse.redirect(new URL("/student", request.url));
      } else if (role) {
        return NextResponse.redirect(new URL("/parent", request.url));
      }
    }
  }

  // =====================================================================
  // 4. CEK MODE MAINTENANCE
  // =====================================================================
  const isMaintenancePage = pathname === "/maintenance";
  const isAdminPath = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/login";
  const isApiPath = pathname.startsWith("/api");

  // Hanya cek maintenance untuk halaman publik (bukan admin, bukan API, bukan halaman maintenance itu sendiri)
  if (!isMaintenancePage && !isAdminPath && !isApiPath) {
    try {
      const isMaintenance = await getMaintenanceMode(supabase);

      if (isMaintenance) {
        // Admin tetap bisa mengakses login page
        if (isLoginPage && role === "admin") {
          return response;
        }
        // Semua halaman non-admin saat maintenance → redirect ke /maintenance
        // KECUALI: jika sudah di halaman login dan belum login (biarkan mereka mencoba login admin)
        if (!isLoginPage || role === "parent") {
          return NextResponse.redirect(new URL("/maintenance", request.url));
        }
      }
    } catch (_) {
      // Jika gagal query, biarkan halaman tetap berjalan normal (fail open)
    }
  }

  // Jika maintenance page diakses tapi mode maintenance OFF → redirect ke beranda
  if (isMaintenancePage) {
    try {
      const isMaintenance = await getMaintenanceMode(supabase);
      if (!isMaintenance) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (_) {
      // Jika gagal query, tampilkan saja halaman maintenance
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
