"use client";

import React, { useRef, useEffect, useState } from "react";
import "./apple-ui.css";

export interface SegmentOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function SegmentedControl({
  options,
  value,
  onChange,
  className = "",
}: SegmentedControlProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const activeEl = containerRef.current.querySelector<HTMLButtonElement>(
      `[data-id="${value}"]`
    );

    if (activeEl) {
      setPillStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [value, options]);

  return (
    <div ref={containerRef} className={`apple-segmented-control ${className}`} role="tablist">
      {/* Sliding Active Pill Background */}
      {pillStyle.width > 0 && (
        <div
          className="apple-segmented-active-pill"
          style={{
            transform: `translateX(${pillStyle.left}px)`,
            width: `${pillStyle.width}px`,
          }}
        />
      )}

      {options.map((opt) => {
        const isActive = opt.id === value;
        return (
          <button
            key={opt.id}
            data-id={opt.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`apple-segmented-item ${isActive ? "active" : ""}`}
            onClick={() => onChange(opt.id)}
          >
            {opt.icon && <span className="segmented-icon">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
