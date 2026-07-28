"use client";

import React from "react";
import "./apple-ui.css";

interface SkeletonCardProps {
  variant?: "card" | "bento" | "table" | "text" | "circle";
  height?: string;
  width?: string;
  count?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function SkeletonCard({
  variant = "card",
  height,
  width,
  count = 1,
  className = "",
  style = {},
}: SkeletonCardProps) {
  const items = Array.from({ length: count });

  if (variant === "text") {
    return (
      <div
        className={`apple-skeleton-base ${className}`}
        style={{
          height: height || "1rem",
          width: width || "100%",
          borderRadius: "6px",
          ...style,
        }}
      />
    );
  }

  if (variant === "circle") {
    return (
      <div
        className={`apple-skeleton-base ${className}`}
        style={{
          height: height || "48px",
          width: width || "48px",
          borderRadius: "50%",
          ...style,
        }}
      />
    );
  }

  if (variant === "table") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%" }}>
        {items.map((_, idx) => (
          <div
            key={idx}
            className={`apple-skeleton-base ${className}`}
            style={{
              height: height || "52px",
              width: "100%",
              borderRadius: "10px",
              ...style,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "bento") {
    return (
      <div
        className={`apple-skeleton-base ${className}`}
        style={{
          height: height || "260px",
          width: width || "100%",
          borderRadius: "18px",
          ...style,
        }}
      />
    );
  }

  // Varian Card Standar
  return (
    <>
      {items.map((_, idx) => (
        <div key={idx} className={`apple-skeleton-card ${className}`} style={style}>
          <div
            className="apple-skeleton-base"
            style={{ height: height || "180px", width: "100%", borderRadius: "12px" }}
          />
          <div
            className="apple-skeleton-base"
            style={{ height: "1.25rem", width: "70%", borderRadius: "6px" }}
          />
          <div
            className="apple-skeleton-base"
            style={{ height: "0.9rem", width: "90%", borderRadius: "4px" }}
          />
        </div>
      ))}
    </>
  );
}
