"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

interface CloudflareAnalyticsProps {
  nonce?: string;
}

export default function CloudflareAnalytics({ nonce }: CloudflareAnalyticsProps) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host.startsWith("digital.")) {
        setToken("4033539977cf471e9b25f5fb69d8868b"); // Ibra Digital
      } else {
        setToken("30b277bf69f4494d94550e9771fe8aa0"); // Ibra Global English
      }
    }
  }, []);

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
