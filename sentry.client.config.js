// This file configures the initialization of Sentry on the client.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  // Replay enables session replay for capturing user interactions
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      maskAllInputs: true,
      blockAllMedia: false,
    }),
    Sentry.feedbackIntegration({
      colorScheme: "light",
      isButtonExpanded: false,
    }),
  ],
  // Performance monitoring
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // Only send errors in production
  enabled: process.env.NODE_ENV === "production",
  // Environment tag
  environment: process.env.NODE_ENV || "development",
});