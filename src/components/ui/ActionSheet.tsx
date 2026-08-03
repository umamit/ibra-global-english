"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import "./apple-ui.css";

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

const subscribe = () => () => {};

export default function ActionSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: ActionSheetProps) {
  const isMounted = useSyncExternalStore(subscribe, () => true, () => false);

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

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <div className="apple-actionsheet-overlay" onClick={onClose}>
      <div
        className="apple-actionsheet-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="apple-actionsheet-handle" />
        {(title || subtitle) && (
          <div className="apple-actionsheet-header">
            {title && <h3 className="apple-actionsheet-title">{title}</h3>}
            {subtitle && (
              <p className="apple-actionsheet-subtitle">{subtitle}</p>
            )}
          </div>
        )}
        <div className="apple-actionsheet-content">{children}</div>
        <button
          type="button"
          className="apple-actionsheet-cancel-btn"
          onClick={onClose}
        >
          Batal
        </button>
      </div>
    </div>,
    document.body
  );
}
