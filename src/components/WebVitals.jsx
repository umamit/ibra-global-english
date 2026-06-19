"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    // 1. Log to console in development mode for easy debugging
    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vitals] ${metric.name}:`, metric.value, `(delta: ${metric.delta}, id: ${metric.id})`);
    }

    // 2. Send data to Google Analytics (if loaded and available)
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", metric.name, {
        value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value), // CLS is multiplied by 1000 as it's a decimal ratio
        event_label: metric.id,
        event_category: "Web Vitals",
        non_interaction: true,
      });
    }
  });

  return null;
}
