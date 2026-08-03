"use client";

import { useState } from "react";
import Script from "next/script";

interface CloudflareAnalyticsProps {
  nonce?: string;
}

export default function CloudflareAnalytics({ nonce }: CloudflareAnalyticsProps) {
  const [token] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return window.location.hostname.startsWith("digital.")
        ? "4033539977cf471e9b25f5fb69d8868b"
        : "30b277bf69f4494d94550e9771fe8aa0";
    }
    return "30b277bf69f4494d94550e9771fe8aa0";
  });

  if (!token) return null;

  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={`{"token": "${token}"}`}
      strategy="afterInteractive"
      nonce={nonce}
      type="module"
    />
  );
}
