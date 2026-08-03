"use client";

import React from "react";
import styles from "../digital-agency.module.css";

export default function AgencyFeatures() {
  return (
    <div className={styles.featuresSectionWrapper}>
      <section id="features" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Standar Kualitas Tertinggi</h2>
          <p className={styles.sectionDesc}>
            Setiap lini kode kami tulis dengan dedikasi penuh untuk mencapai kesempurnaan visual dan teknis.
          </p>
        </div>
        <div className={styles.grid}>
          {/* Keunggulan 1 */}
          <article className={styles.card}>
            <div className={styles.iconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className={styles.cardTitle}>Keamanan Tingkat Tinggi</h3>
            <p className={styles.cardText}>
              Perlindungan data optimal dengan otentikasi Supabase JWT, enkripsi SSL/HTTPS penuh, 
              serta implementasi Content Security Policy (CSP) untuk mencegah serangan siber.
            </p>
          </article>

          {/* Keunggulan 2 */}
          <article className={styles.card}>
            <div className={styles.iconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h3 className={styles.cardTitle}>Kecepatan Ekstrim</h3>
            <p className={styles.cardText}>
              Dioptimalkan penuh menggunakan React Server Components, serverless caching, 
              dan CDN Cloudflare Edge untuk meminimalisir LCP dan memuluskan navigasi halaman.
            </p>
          </article>

          {/* Keunggulan 3 */}
          <article className={styles.card}>
            <div className={styles.iconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </div>
            <h3 className={styles.cardTitle}>Estetika Premium (Apple HIG)</h3>
            <p className={styles.cardText}>
              Antarmuka visual yang modern, bersih, dan memikat mata dengan kelengkungan radius halus, 
              bayangan ambient transparan, dan mikro-animasi transisi spring yang dinamis.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
