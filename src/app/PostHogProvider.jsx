"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";

// Inisialisasi PostHog di sisi client
if (typeof window !== "undefined") {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (token) {
    posthog.init(token, {
      api_host: host,
      person_profiles: "identified_only", // Pilihan: 'always' | 'never' | 'identified_only'
      capture_pageview: false, // Dinonaktifkan karena ditangani manual oleh PostHogPageView untuk rute dinamis (SPA)
      loaded: (posthogInstance) => {
        if (process.env.NODE_ENV === "development") {
          posthogInstance.debug(); // Aktifkan debug log di mode development
        }
      },
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
export function PostHogProviderWrapper({ children }) {
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
