import { NextRequest, NextResponse } from "next/server";
import { validateProxyDomain } from "./proxyImageHelpers";

export async function GET(request: NextRequest) {
  const imageUrl = new URL(request.url).searchParams.get("url");
  if (!imageUrl) return new NextResponse("Missing url parameter", { status: 400 });

  const { isValid } = validateProxyDomain(imageUrl);
  if (!isValid) return new NextResponse("Forbidden domain", { status: 403 });

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return new NextResponse("Failed to fetch image", { status: res.status });

    const blob = await res.blob();
    return new NextResponse(blob, {
      status: 200,
      headers: { "Content-Type": blob.type || "image/png", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
