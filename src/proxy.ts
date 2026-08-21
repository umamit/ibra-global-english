import { NextRequest, NextResponse } from "next/server";
import { getCspHeader } from "./proxyHelpers";

let maintenanceCache: { value: boolean | null; expires: number } = { value: null, expires: 0 };

export async function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";
  const cspHeader = getCspHeader(isDev);
  const requestHeaders = new Headers(request.headers);
  const { pathname } = request.nextUrl;
  const acceptHeader = request.headers.get("accept") || "";
  const hostname = request.headers.get("host") || "";

  const isStaticAsset = pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|pdf|md|json|css|js|ico|txt|xml|webmanifest)$/);
  const isApiOrNext = pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.startsWith("/ingest");

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

    // Strict No-Cache & Privacy Headers for Admin, Parent, Tutor, Student, & API Routes
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/parent") ||
      pathname.startsWith("/tutor") ||
      pathname.startsWith("/student") ||
      pathname.startsWith("/api")
    ) {
      res.headers.set("X-Robots-Tag", "noindex, nofollow");
      res.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate, max-age=0");
      res.headers.set("Pragma", "no-cache");
      res.headers.set("Expires", "0");
    }
  };

  if (pathname === "/" || pathname === "/index.html") {
    if (acceptHeader.includes("text/markdown")) {
      const fallbackMd = `# Ibra Global English Bobong\nBelajar Seru Lancar Bicara. Kursus Bahasa Inggris Offline Terbaik di Bobong, Pulau Taliabu.`;
      return new Response(fallbackMd, {
        status: 200,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "x-markdown-tokens": "100",
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      });
    }
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  addSecurityHeaders(response);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
