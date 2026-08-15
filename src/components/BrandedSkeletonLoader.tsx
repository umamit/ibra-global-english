"use client";

import React from "react";
import styles from "./brandedSkeleton.module.css";

interface BrandedSkeletonLoaderProps {
  type?: "fullPage" | "dashboard" | "card" | "table";
}

export default function BrandedSkeletonLoader({
  type = "fullPage",
}: BrandedSkeletonLoaderProps) {
  return (
    <div className={styles.loaderContainer} aria-label="Memuat data Ibra Global English...">
      {/* Pulsing Central IGE Logo */}
      <div className={styles.logoWrap}>
        <div className={styles.logoGlow} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo.png"
          alt="Ibra Global English Logo"
          width={90}
          height={90}
          className={styles.logoImage}
        />
      </div>

      {/* Shimmering Skeleton Body */}
      <div className={styles.skeletonBody}>
        {/* Header Bar Skeleton */}
        <div
          className={styles.shimmerBlock}
          style={{ height: "48px", width: "70%", borderRadius: "14px" }}
        />

        {/* Dashboard Stat Cards / Grid Skeleton */}
        {type === "dashboard" || type === "fullPage" ? (
          <div className={styles.skeletonGrid}>
            <div className={styles.shimmerBlock} style={{ height: "110px" }} />
            <div className={styles.shimmerBlock} style={{ height: "110px" }} />
            <div className={styles.shimmerBlock} style={{ height: "110px" }} />
          </div>
        ) : null}

        {/* Main Content / Table Skeleton Block */}
        <div
          className={styles.shimmerBlock}
          style={{
            height: type === "table" ? "320px" : "240px",
            width: "100%",
            borderRadius: "16px",
          }}
        />
      </div>
    </div>
  );
}
