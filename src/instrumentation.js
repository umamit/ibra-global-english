export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { init } = await import("@sentry/nextjs");
    init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      // Performance monitoring
      tracesSampleRate: 0.2,
      // Only send errors in production
      enabled: process.env.NODE_ENV === "production",
      // Environment tag
      environment: process.env.NODE_ENV || "development",
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const { init } = await import("@sentry/nextjs");
    init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      // Performance monitoring for edge
      tracesSampleRate: 0.2,
      // Only send errors in production
      enabled: process.env.NODE_ENV === "production",
      // Environment tag
      environment: process.env.NODE_ENV || "development",
    });
  }
}