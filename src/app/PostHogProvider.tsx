"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, Suspense } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";

// Inisialisasi PostHog di sisi client
if (typeof window !== "undefined") {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

  if (token && !(posthog as any).__loaded) {
    posthog.init(token, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      defaults: "2026-05-30",
      person_profiles: "identified_only",
      capture_pageview: false,
      capture_pageleave: true,
      capture_exceptions: true,
      debug: process.env.NODE_ENV === "development",
    });
  }
}

// Komponen Client untuk menangkap navigasi halaman (pageviews) pada SPA transitions
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (pathname && ph) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      ph.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, ph]);

  return null;
}

// Wrapper Provider utama
export function PostHogProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
