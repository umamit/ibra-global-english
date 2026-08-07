"use client";

import styles from "./maintenance.module.css";

export const dynamic = 'force-dynamic';

export default function MaintenancePage() {
  return (
    <div className={styles.body}>
      {/* Background blobs */}
      <div className={`${styles.blob} ${styles.blob1}`} />
      <div className={`${styles.blob} ${styles.blob2}`} />

      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <img src="/assets/logo.png" alt="Logo Ibra Global English" className={styles.logo} />
          <div style={{ textAlign: "left" }}>
            <div className={styles.logoName}>Ibra Global English</div>
            <div className={styles.logoSub}>Bobong, Pulau Taliabu</div>
          </div>
        </div>

        {/* Icon */}
        <div className={styles.iconWrap}>
          <div className={styles.iconCircle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className={styles.title}>Sedang dalam Pemeliharaan</h1>

        <div className={styles.divider} />

        <p className={styles.subtitle}>
          Website Ibra Global English sedang kami tingkatkan untuk pengalaman belajar yang lebih baik.
          Kami akan kembali online sebentar lagi. Terima kasih atas kesabarannya!
        </p>

        {/* Tagline */}
        <div className={styles.trilogy}>
          <span>Building Confident English Communicators.</span>
        </div>

        {/* WhatsApp CTA */}
        <div className={styles.cta}>
          <a
            href="https://wa.me/6281357001357?text=Halo%20Ibra%20Global%20English%2C%20saya%20ingin%20bertanya%20tentang%20program%20kursus."
            target="_blank"
            rel="noopener noreferrer"
            className={styles.waBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Hubungi via WhatsApp
          </a>

          {/* Admin login link */}
          <div>
            <a href="/login" className={styles.adminLink}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Login sebagai Admin
            </a>
          </div>
        </div>
      </div>

      <p className={styles.footer}>© 2026 Ibra Global English · Bobong, Pulau Taliabu</p>
    </div>
  );
}
