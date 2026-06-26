// This file configures the initialization of Sentry on the server.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Performance monitoring for server-side
  tracesSampleRate: 0.2,
  // Only send errors in production
  enabled: process.env.NODE_ENV === "production",
  // Environment tag
  environment: process.env.NODE_ENV || "development",
});