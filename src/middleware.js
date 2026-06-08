import { NextResponse } from "next/server";

export async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const isHome = (path === "/" || path === "/index.html");

  // 1. Handle Homepage discovery and markdown negotiation
  if (isHome) {
    const acceptHeader = request.headers.get("accept") || "";

    // Check for Markdown content negotiation
    if (acceptHeader.includes("text/markdown")) {
      try {
        // Fetch static index.md from public directory via local URL
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
        console.error("Failed to negotiate markdown in middleware:", err);
      }
    }

    // Standard homepage request: Proceed, and append agent discovery Link header
    const response = NextResponse.next();
    response.headers.set(
      "Link",
      [
        "</.well-known/api-catalog>; rel=\"api-catalog\"",
        "</.well-known/agent-skills/index.json>; rel=\"agent-skills\"",
        "</.well-known/mcp/server-card.json>; rel=\"mcp-server-card\""
      ].join(", ")
    );
    return response;
  }

  // 2. Override Content-Types for .well-known files if requested
  if (path.startsWith("/.well-known")) {
    const response = NextResponse.next();
    if (path.endsWith(".json") || path.includes("openid-configuration") || path.includes("oauth-protected-resource") || path.includes("oauth-authorization-server") || path.includes("http-message-signatures-directory")) {
      response.headers.set("Content-Type", "application/json; charset=utf-8");
    } else if (path === "/.well-known/api-catalog") {
      response.headers.set("Content-Type", "application/linkset+json; charset=utf-8");
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/index.html",
    "/.well-known/:path*",
  ],
};
