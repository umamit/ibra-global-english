// Mock implementation of posthog-js and posthog-js/react.
import React from "react";

const posthogMock = {
  init: (...args: any[]) => {},
  capture: (...args: any[]) => {
    console.log("[PostHog Mock] capture:", ...args);
  },
  identify: (...args: any[]) => {
    console.log("[PostHog Mock] identify:", ...args);
  },
  reset: (...args: any[]) => {},
  get_distinct_id: (...args: any[]) => "mock-distinct-id",
  usePostHog: () => posthogMock,
};

export const PostHogProvider = ({ children, ...props }: any) => {
  return <>{children}</>;
};

export const PostHogProviderWrapper = ({ children, ...props }: any) => {
  return <>{children}</>;
};

export const usePostHog = () => posthogMock;

export default posthogMock;
