import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const urlObj = new URL(imageUrl);
    // Secure it to only allow Supabase and QR server domains
    if (
      !urlObj.hostname.includes("supabase.co") &&
      !urlObj.hostname.includes("qrserver.com")
    ) {
      return new NextResponse("Forbidden domain", { status: 403 });
    }

    const res = await fetch(imageUrl);
    if (!res.ok) {
      return new NextResponse("Failed to fetch image", { status: res.status });
    }

    const blob = await res.blob();
    const headers = new Headers();
    headers.set("Content-Type", blob.type || "image/png");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Cache-Control", "public, max-age=86400");

    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Proxy image error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
