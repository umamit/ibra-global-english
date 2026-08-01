"use client";

import React from "react";
import styles from "./TechLogoGrid.module.css";

export default function TechLogoGrid() {
  return (
    <section className={styles.techShowcaseSection}>
      <div className={styles.techShowcaseTitle}>Teknologi Premium Yang Kami Gunakan</div>
      <div className={styles.techLogoGrid}>
        {/* Next.js */}
        <div className={styles.techLogoItem}>
          <svg className={styles.techLogoSvg} viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="90" cy="90" r="90" fill="black" />
            <path d="M149.508 157.52L69.013 54H54V126H67.8821V74.4534L137.604 163.662C141.837 161.859 145.819 159.8 149.508 157.52Z" fill="url(#next_grad)" />
            <path d="M115 54H129V126H115V54Z" fill="white" />
            <defs>
              <linearGradient id="next_grad" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="white" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <span>Next.js 16</span>
        </div>

        {/* Supabase */}
        <div className={styles.techLogoItem}>
          <svg className={styles.techLogoSvg} viewBox="0 0 106 106" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M64.66 102.86C61.42 106.82 54.88 104.42 55.12 99.32L58.54 26.9L94.9 26.9C102.74 26.9 107.02 36.02 101.96 42.18L64.66 102.86Z" fill="url(#supa_a)" />
            <path d="M41.34 3.14C44.58 -0.82 51.12 1.58 50.88 6.68L47.46 79.1L11.1 79.1C3.26 79.1 -1.02 69.98 4.04 63.82L41.34 3.14Z" fill="#3ECF8E" />
            <defs>
              <linearGradient id="supa_a" x1="58.54" y1="26.9" x2="81.5" y2="102.86" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3ECF8E" />
                <stop offset="1" stopColor="#3ECF8E" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>
          <span>Supabase</span>
        </div>

        {/* React 19 */}
        <div className={styles.techLogoItem}>
          <svg className={styles.techLogoSvg} viewBox="-11.5 -10.23174 23 20.46348" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
            <g stroke="#61DAFB" strokeWidth="1" fill="none">
              <ellipse rx="11" ry="4.2" />
              <ellipse rx="11" ry="4.2" transform="rotate(60)" />
              <ellipse rx="11" ry="4.2" transform="rotate(120)" />
            </g>
          </svg>
          <span>React 19</span>
        </div>

        {/* Cloudflare */}
        <div className={styles.techLogoItem}>
          <svg className={styles.techLogoSvg} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M85.4 56.4c-1.8-12.7-12.6-22.4-25.7-22.4-11.2 0-20.8 7.1-24.5 17.2-1.3-.4-2.7-.6-4.2-.6-7.7 0-14 6.3-14 14 0 1.2.2 2.3.5 3.4C15.8 69.2 11 75.5 11 83c0 9.4 7.6 17 17 17h57.4c9.4 0 17-7.6 17-17 0-8.6-6.4-15.7-14.7-16.6z" fill="#F38020" />
            <path d="M72.2 78.4l11.4-11.4c.5-.5.5-1.4 0-1.9l-1.9-1.9c-.5-.5-1.4-.5-1.9 0L71.3 73.7l-4.7-4.7c-.5-.5-1.4-.5-1.9 0l-1.9 1.9c-.5.5-.5 1.4 0 1.9l7.5 7.6c.5.5 1.4.5 1.9 0z" fill="white" />
          </svg>
          <span>Cloudflare</span>
        </div>

        {/* PostgreSQL */}
        <div className={styles.techLogoItem}>
          <svg className={styles.techLogoSvg} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M64 16C37.5 16 16 37.5 16 64s21.5 48 48 48 48-21.5 48-48S90.5 16 64 16zm18.5 75.5c-4.2 2.1-9.5 3.1-15.5 3.1-8.5 0-15.2-2.8-20.2-8.3-4.9-5.5-7.4-13.4-7.4-23.7 0-10.4 2.5-18.3 7.6-23.7 5.1-5.5 11.9-8.2 20.4-8.2 5.8 0 10.9 1 15.1 2.9v10.5c-4.3-2.3-9-3.4-14.2-3.4-5.2 0-9.4 1.8-12.5 5.5-3.1 3.7-4.7 9.2-4.7 16.4 0 7.2 1.6 12.7 4.7 16.4 3.1 3.7 7.3 5.5 12.5 5.5 5.4 0 10.3-1.2 14.7-3.7v10.7z" fill="#4169E1" />
          </svg>
          <span>PostgreSQL</span>
        </div>

        {/* Vercel */}
        <div className={styles.techLogoItem}>
          <svg className={styles.techLogoSvg} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M256 48L512 464H0L256 48Z" fill="black" />
          </svg>
          <span>Vercel</span>
        </div>

        {/* TypeScript */}
        <div className={styles.techLogoItem}>
          <svg className={styles.techLogoSvg} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="128" height="128" rx="16" fill="#3178C6" />
            <path d="M72.2 99.8c1.6 2.6 4.1 4.5 7.6 4.5 3.4 0 5.6-1.7 5.6-4.1 0-2.8-2.3-3.9-6.3-5.6l-2.2-.9c-6.4-2.7-10.7-6.1-10.7-13.3 0-7.7 6.1-13.7 16.3-13.7 7 0 11.9 2.5 15.2 7.8l-7 4.5c-1.8-3-4.3-4.2-7.8-4.2-3.3 0-5.1 1.7-5.1 3.8 0 2.5 2.1 3.6 6.3 5.3l2.2.9c7.4 3.2 11.1 6.6 11.1 13.5 0 8.8-6.9 14.3-17.7 14.3-9.5 0-15.3-4.3-18.4-9.8l6.9-4.5zM31 63.2h32.8V73H48.4v40.3H36.3V73H31v-9.8z" fill="white" />
          </svg>
          <span>TypeScript</span>
        </div>

        {/* Prisma */}
        <div className={styles.techLogoItem}>
          <svg className={styles.techLogoSvg} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M428.4 433.9L283 50.4c-6.5-14.3-26.8-14.3-33.3 0L193 174.5l146.4 165.7 89 93.7z" fill="#2D3748" />
            <path d="M193 174.5L83.6 433.9c-7 16.4 10.3 32.8 26.2 24.8l229.6-115.6L193 174.5z" fill="#5A67D8" />
          </svg>
          <span>Prisma ORM</span>
        </div>

        {/* Vite */}
        <div className={styles.techLogoItem}>
          <svg className={styles.techLogoSvg} viewBox="0 0 410 404" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M399.641 40.5222L215.82 398.941C211.758 406.861 200.324 406.973 196.104 399.141L3.71714 41.4728C-0.840742 33.0135 7.1054 23.4682 16.2731 26.1158L202.977 80.068C205.894 80.9109 208.971 80.8711 211.865 79.9535L386.837 24.4746C396.095 21.5398 404.28 31.48 399.641 40.5222Z" fill="url(#vite_a)" />
            <path d="M291.93 0.655848L193.303 19.3879C189.626 20.0864 186.757 23.0101 186.208 26.7161L170.835 130.436C170.178 134.872 174.153 138.647 178.536 137.769L223.364 128.789C228.106 127.839 231.848 132.553 230.129 137.07L203.87 206.07C202.046 210.863 207.251 215.358 211.597 212.753L224.237 205.176C228.648 202.532 233.978 206.877 232.222 211.703L203.498 290.672C201.59 295.918 207.412 300.673 300.999 296.868L300.999 296.868L291.93 0.655848Z" fill="url(#vite_b)" />
            <defs>
              <linearGradient id="vite_a" x1="20.7303" y1="24.4746" x2="202.977" y2="404" gradientUnits="userSpaceOnUse">
                <stop stopColor="#41D1FF" />
                <stop offset="1" stopColor="#BD34FE" />
              </linearGradient>
              <linearGradient id="vite_b" x1="186.208" y1="0.655848" x2="232.222" y2="296.868" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFEA83" />
                <stop offset="0.0833333" stopColor="#FFDD35" />
                <stop offset="1" stopColor="#FFA800" />
              </linearGradient>
            </defs>
          </svg>
          <span>Vite</span>
        </div>
      </div>
    </section>
  );
}
