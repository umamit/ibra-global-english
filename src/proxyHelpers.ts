import { NextResponse } from "next/server";

export function getCspHeader(isDev: boolean): string {
  return `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'report-sample' blob: ${isDev ? "'unsafe-eval'" : ""} https://www.googletagmanager.com https://static.cloudflareinsights.com https://*.cloudflare.com https://*.cloudflareinsights.com https://cdnjs.cloudflare.com https://*.cesium.com https://connect.facebook.net https://www.youtube.com https://s.ytimg.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://*.cesium.com;
    font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net;
    img-src 'self' data: blob: https://images.unsplash.com https://uszukipvrvjrgrikxfwh.supabase.co https://res.cloudinary.com https://*.cloudinary.com https://*.canva.com https://www.canva.com https://api.qrserver.com https://www.facebook.com https://server.arcgisonline.com https://*.arcgisonline.com https://*.tile.openstreetmap.org https://tile.openstreetmap.org https://*.basemaps.cartocdn.com https://*.cesium.com https://assets.cesium.com https://*.google.com https://*.google.co.id https://www.google.com https://www.google.co.id https://*.googletagmanager.com https://*.google-analytics.com;
    connect-src 'self' https://uszukipvrvjrgrikxfwh.supabase.co wss://uszukipvrvjrgrikxfwh.supabase.co https://res.cloudinary.com https://static.cloudflareinsights.com https://*.cloudflareinsights.com https://www.googletagmanager.com https://cdn.jsdelivr.net https://www.google-analytics.com https://*.analytics.google.com https://analytics.google.com https://stats.g.doubleclick.net https://graph.facebook.com https://www.facebook.com https://connect.facebook.net https://*.google.com https://*.google.co.id https://www.google.com https://www.google.co.id https://server.arcgisonline.com https://*.arcgisonline.com https://*.tile.openstreetmap.org https://tile.openstreetmap.org https://*.basemaps.cartocdn.com https://*.cesium.com https://assets.cesium.com;
    frame-src 'self' https://maps.google.com https://www.google.com https://google.com https://*.canva.com https://www.canva.com https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://youtube-nocookie.com https://www.facebook.com https://web.facebook.com;
    frame-ancestors 'self';
    worker-src 'self' blob:;
    child-src 'self' blob:;
    object-src 'none';
    base-uri 'none';
    form-action 'self';
    media-src 'self' blob: data:;
  `.replace(/\s{2,}/g, ' ').trim();
}

export function handleRoleAccessControl(pathname: string, user: any, role: string, requestUrl: string) {
  if (pathname.startsWith("/admin") && (!user || role !== "admin")) {
    return NextResponse.redirect(new URL("/login?error=unauthorized_admin", requestUrl));
  }
  if (pathname.startsWith("/parent") && (!user || role !== "parent")) {
    return NextResponse.redirect(new URL("/login?error=unauthorized_parent", requestUrl));
  }
  if (pathname.startsWith("/tutor") && (!user || role !== "tutor")) {
    return NextResponse.redirect(new URL("/login?error=unauthorized_tutor", requestUrl));
  }
  if (pathname.startsWith("/student") && (!user || role !== "student")) {
    return NextResponse.redirect(new URL("/login?error=unauthorized_student", requestUrl));
  }
  if (pathname === "/login" && user) {
    if (role === "admin") return NextResponse.redirect(new URL("/admin", requestUrl));
    if (role === "tutor") return NextResponse.redirect(new URL("/tutor", requestUrl));
    if (role === "student") return NextResponse.redirect(new URL("/student", requestUrl));
    if (role) return NextResponse.redirect(new URL("/parent", requestUrl));
  }
  return null;
}
