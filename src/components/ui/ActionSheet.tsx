"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./apple-ui.css";

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function ActionSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: ActionSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`apple-actionsheet-overlay ${isOpen ? "open" : ""}`}
      onClick={onClose}
      aria-hidden={!isOpen}
      role="dialog"
    >
      <div
        className="apple-actionsheet-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="apple-actionsheet-handle" />
        
        {(title || subtitle) && (
          <div style={{ marginBottom: "1.25rem", textAlign: "center" }}>
            {title && (
              <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--color-gray-900)", marginBottom: "0.25rem" }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", margin: 0 }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        {children}
      </div>
    </div>,
    document.body
  );
}
