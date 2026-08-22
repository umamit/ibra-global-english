"use client";

import React from "react";
import { useDynamicIsland } from "../context/DynamicIslandContext";
import styles from "./DynamicIsland.module.css";

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

const InfoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="16" y2="12" />
    <line x1="12" x2="12.01" y1="8" y2="8" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className={styles.spinner} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export function DynamicIsland() {
  const { current, visible, dismiss } = useDynamicIsland();

  if (!current && !visible) return null;

  const type = current?.type || "info";

  return (
    <aside className={styles.islandContainer} aria-live="polite" aria-atomic="true">
      <div
        className={`${styles.islandPill} ${!visible ? styles.closing : ""}`}
        onClick={dismiss}
        role="status"
        title="Klik untuk menutup notifikasi"
      >
        <div className={`${styles.iconWrapper} ${styles[type]}`}>
          {type === "success" && <CheckIcon />}
          {type === "error" && <AlertIcon />}
          {type === "loading" && <SpinnerIcon />}
          {type === "info" && <InfoIcon />}
        </div>

        <div className={styles.contentWrapper}>
          <p className={styles.title}>{current?.title}</p>
          {current?.message && <p className={styles.message}>{current.message}</p>}
        </div>
      </div>
    </aside>
  );
}
