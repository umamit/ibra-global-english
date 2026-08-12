import { NextRequest, NextResponse } from "next/server";
import { getCspHeader, handleRoleAccessControl } from "./proxyHelpers";

let maintenanceCache: { value: boolean | null; expires: number } = { value: null, expires: 0 };

async function getMaintenanceMode(supabase: any) {
  const now = Date.now();
  if (maintenanceCache.expires > now) return maintenanceCache.value;
  try {
    const { data } = await supabase.from("landing_settings").select("value").eq("key", "maintenance_mode").single();
    const value = data?.value === "true";
    maintenanceCache = { value, expires: now + 30000 };
    return value;
  } catch (_) { return maintenanceCache.value; }
}

export async function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";
  const cspHeader = getCspHeader(isDev);
  const requestHeaders = new Headers(request.headers);
  const { pathname } = request.nextUrl;
  const acceptHeader = request.headers.get("accept") || "";
  const hostname = request.headers.get("host") || "";

  const isStaticAsset = pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|pdf|md|json|css|js|ico|txt|xml|webmanifest)$/);
  const isApiOrNext = pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.startsWith("/ingest");

  if (hostname.startsWith("digital.") && !isStaticAsset && !isApiOrNext && !pathname.startsWith("/digital-agency")) {
    return NextResponse.rewrite(new URL(`/digital-agency${pathname}`, request.url));
  }

  if (hostname.startsWith("admin.")) {
    if (pathname.startsWith("/admin")) {
      const cleanPath = pathname.replace(/^\/admin/, "") || "/";
      return NextResponse.redirect(new URL(cleanPath, request.url));
    }
    if (!isStaticAsset && !isApiOrNext && !pathname.startsWith("/login") && !pathname.startsWith("/auth")) {
      return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url));
    }
  } else if (pathname.startsWith("/admin") && !isStaticAsset && !isApiOrNext && !isDev) {
    const subPath = pathname.replace(/^\/admin/, "") || "/";
    return NextResponse.redirect(new URL(`https://admin.ibraglobalenglish.uk${subPath}`, request.url));
  }

  const addSecurityHeaders = (res: NextResponse) => {
    res.headers.set("Content-Security-Policy", cspHeader);
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("Permissions-Policy", "camera=(self), microphone=()");
    if (pathname.startsWith("/admin") || pathname.startsWith("/parent") || pathname.startsWith("/tutor") || pathname.startsWith("/student") || pathname.startsWith("/api")) {
      res.headers.set("X-Robots-Tag", "noindex, nofollow");
    }
  };

  if (pathname.startsWith("/digital-agency")) {
    const res = NextResponse.next();
    addSecurityHeaders(res);
    return res;
  }

  if (pathname === "/" || pathname === "/index.html") {
    if (acceptHeader.includes("text/markdown")) {
      const fallbackMd = `# Ibra Global English Bobong\nBelajar Seru Lancar Bicara. Kursus Bahasa Inggris Offline Terbaik di Bobong, Pulau Taliabu.`;
      return new Response(fallbackMd, { status: 200, headers: { "Content-Type": "text/markdown; charset=utf-8", "x-markdown-tokens": "100" } });
    }
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  addSecurityHeaders(response);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
