// This file configures the initialization of Sentry on the client.
// The current pattern is instrumentation-client.js (replaces sentry.client.config.js)
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && !(posthog as any).__loaded) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    defaults: "2026-05-30",
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
    capture_exceptions: false,
    debug: process.env.NODE_ENV === "development",
  });
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Include PII (IP, request headers) in events
  sendDefaultPii: true,

  // 100% in dev, 10% in production
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Session Replay: matikan di production untuk performa, aktifkan hanya jika ada error
  replaysSessionSampleRate: 0.0,
  replaysOnErrorSampleRate: 0.0,

  // Enable Sentry Logs
  enableLogs: true,

  integrations: [
    Sentry.replayIntegration(),
    // User feedback widget
    Sentry.feedbackIntegration({ 
      colorScheme: "light",
      autoInject: true
    }),
  ],
});

// Hook into App Router navigation transitions (App Router only)
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;