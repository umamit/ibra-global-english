import * as Sentry from "@sentry/nextjs";

export async function register() {
  // Sentry server and edge configs removed
}

// Automatically captures all unhandled server-side request errors
// Requires @sentry/nextjs >= 8.28.0
export const onRequestError = Sentry.captureRequestError;