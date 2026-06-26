// This file configures the initialization of Sentry on the client.
// The current pattern is instrumentation-client.js (replaces sentry.client.config.js)
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Include PII (IP, request headers) in events
  sendDefaultPii: true,

  // 100% in dev, 10% in production
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Session Replay: 10% of all sessions, 100% of sessions with errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Enable Sentry Logs
  enableLogs: true,

  integrations: [
    Sentry.replayIntegration(),
    // User feedback widget
    Sentry.feedbackIntegration({ colorScheme: "light" }),
  ],
});

// Hook into App Router navigation transitions (App Router only)
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;