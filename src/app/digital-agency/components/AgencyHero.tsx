"use client";

import React from "react";
import styles from "./AgencyHero.module.css";
import FluidCanvas from "./FluidCanvas";

export default function AgencyHero() {
  return (
    <div className={styles.heroSectionWrapper}>
      <FluidCanvas />
      <section className={styles.hero}>
        <span className={styles.heroTagline}>Your Growth Partner — digital.ibraglobalenglish.uk</span>
        <h1 className={styles.heroTitle}>
          Helping Businesses Scale with <span className={styles.gradientText}>Digital Excellence</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Your Success Starts with the Right Strategy. Kami membangun landing page, portal bisnis, dan aplikasi web modern berbasis Next.js, Supabase, 
          dan Cloudflare. Menghadirkan estetika premium Apple HIG, keamanan data super ketat, dan kecepatan optimal.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem 1rem", marginBottom: "2rem", position: "relative", zIndex: 1 }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-primary)", backgroundColor: "var(--color-primary-light)", padding: "0.3rem 0.8rem", borderRadius: "9999px" }}>SEO</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-primary)", backgroundColor: "var(--color-primary-light)", padding: "0.3rem 0.8rem", borderRadius: "9999px" }}>•</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-primary)", backgroundColor: "var(--color-primary-light)", padding: "0.3rem 0.8rem", borderRadius: "9999px" }}>Social Media</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-primary)", backgroundColor: "var(--color-primary-light)", padding: "0.3rem 0.8rem", borderRadius: "9999px" }}>•</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-primary)", backgroundColor: "var(--color-primary-light)", padding: "0.3rem 0.8rem", borderRadius: "9999px" }}>Branding</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-primary)", backgroundColor: "var(--color-primary-light)", padding: "0.3rem 0.8rem", borderRadius: "9999px" }}>•</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-primary)", backgroundColor: "var(--color-primary-light)", padding: "0.3rem 0.8rem", borderRadius: "9999px" }}>Web & App Development</span>
        </div>
        <div className={styles.heroActions}>
          <a href="#order" className={styles.btnPrimary}>Mulai Proyek</a>
          <a href="#portfolio" className={styles.btnSecondary}>Lihat Karya Kami</a>
        </div>

        {/* ── Statistics / Metrics Bar ── */}
        <div className={styles.statsContainer} style={{ position: "relative", zIndex: 2 }}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>100%</div>
            <div className={styles.statLabel}>Kepuasan Klien</div>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>3-5 Hari</div>
            <div className={styles.statLabel}>Launch Cepat</div>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>99.9%</div>
            <div className={styles.statLabel}>Uptime Server</div>
          </div>
        </div>
      </section>
    </div>
  );
}
