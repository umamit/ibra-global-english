// Mock implementation of posthog-node.
export class PostHog {
  constructor(token?: string, options?: any) {}
  capture(params: any) {
    console.log("[PostHog Node Mock] capture:", params);
  }
  shutdown() {}
}
