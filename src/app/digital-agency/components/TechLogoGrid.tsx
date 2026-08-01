"use client";

import React from "react";
import styles from "./TechLogoGrid.module.css";

const TECH_ITEMS = [
  {
    name: "Next.js 16",
    svg: (
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
    ),
  },
  {
    name: "Supabase",
    svg: (
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
    ),
  },
  {
    name: "React 19",
    svg: (
      <svg className={styles.techLogoSvg} viewBox="-11.5 -10.23174 23 20.46348" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
        <g stroke="#61DAFB" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    ),
  },
  {
    name: "Cloudflare",
    svg: (
      <svg className={styles.techLogoSvg} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M85.4 56.4c-1.8-12.7-12.6-22.4-25.7-22.4-11.2 0-20.8 7.1-24.5 17.2-1.3-.4-2.7-.6-4.2-.6-7.7 0-14 6.3-14 14 0 1.2.2 2.3.5 3.4C15.8 69.2 11 75.5 11 83c0 9.4 7.6 17 17 17h57.4c9.4 0 17-7.6 17-17 0-8.6-6.4-15.7-14.7-16.6z" fill="#F38020" />
        <path d="M72.2 78.4l11.4-11.4c.5-.5.5-1.4 0-1.9l-1.9-1.9c-.5-.5-1.4-.5-1.9 0L71.3 73.7l-4.7-4.7c-.5-.5-1.4-.5-1.9 0l-1.9 1.9c-.5.5-.5 1.4 0 1.9l7.5 7.6c.5.5 1.4.5 1.9 0z" fill="white" />
      </svg>
    ),
  },
  {
    name: "PostgreSQL",
    svg: (
      <svg className={styles.techLogoSvg} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M64 16C37.5 16 16 37.5 16 64s21.5 48 48 48 48-21.5 48-48S90.5 16 64 16zm18.5 75.5c-4.2 2.1-9.5 3.1-15.5 3.1-8.5 0-15.2-2.8-20.2-8.3-4.9-5.5-7.4-13.4-7.4-23.7 0-10.4 2.5-18.3 7.6-23.7 5.1-5.5 11.9-8.2 20.4-8.2 5.8 0 10.9 1 15.1 2.9v10.5c-4.3-2.3-9-3.4-14.2-3.4-5.2 0-9.4 1.8-12.5 5.5-3.1 3.7-4.7 9.2-4.7 16.4 0 7.2 1.6 12.7 4.7 16.4 3.1 3.7 7.3 5.5 12.5 5.5 5.4 0 10.3-1.2 14.7-3.7v10.7z" fill="#4169E1" />
      </svg>
    ),
  },
  {
    name: "Vercel",
    svg: (
      <svg className={styles.techLogoSvg} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M256 48L512 464H0L256 48Z" fill="black" />
      </svg>
    ),
  },
  {
    name: "TypeScript",
    svg: (
      <svg className={styles.techLogoSvg} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" rx="16" fill="#3178C6" />
        <path d="M72.2 99.8c1.6 2.6 4.1 4.5 7.6 4.5 3.4 0 5.6-1.7 5.6-4.1 0-2.8-2.3-3.9-6.3-5.6l-2.2-.9c-6.4-2.7-10.7-6.1-10.7-13.3 0-7.7 6.1-13.7 16.3-13.7 7 0 11.9 2.5 15.2 7.8l-7 4.5c-1.8-3-4.3-4.2-7.8-4.2-3.3 0-5.1 1.7-5.1 3.8 0 2.5 2.1 3.6 6.3 5.3l2.2.9c7.4 3.2 11.1 6.6 11.1 13.5 0 8.8-6.9 14.3-17.7 14.3-9.5 0-15.3-4.3-18.4-9.8l6.9-4.5zM31 63.2h32.8V73H48.4v40.3H36.3V73H31v-9.8z" fill="white" />
      </svg>
    ),
  },
  {
    name: "Prisma ORM",
    svg: (
      <svg className={styles.techLogoSvg} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M428.4 433.9L283 50.4c-6.5-14.3-26.8-14.3-33.3 0L193 174.5l146.4 165.7 89 93.7z" fill="#2D3748" />
        <path d="M193 174.5L83.6 433.9c-7 16.4 10.3 32.8 26.2 24.8l229.6-115.6L193 174.5z" fill="#5A67D8" />
      </svg>
    ),
  },
  {
    name: "Vite",
    svg: (
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
    ),
  },
  {
    name: "Python",
    svg: (
      <svg className={styles.techLogoSvg} viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M54.02 0c-14.73 0-23.77.64-28.38 4.41-5.74 4.7-5.06 13.97-5.06 21.65v10.51h34.09v4.83H7.07c-7.68 0-14.43 4.62-16.5 13.25-2.37 9.87-2.47 16.03 0 26.41 1.84 7.74 6.13 13.25 13.81 13.25h9.08v-12.4c0-8.91 7.74-16.65 16.65-16.65h33.88c7.47 0 13.48-6.01 13.48-13.48V25.96c0-7.47-6.22-13.06-13.48-15.45C59.98.8 54.02 0 54.02 0zM38.86 10.97c3.34 0 6.04 2.7 6.04 6.04 0 3.34-2.7 6.04-6.04 6.04s-6.04-2.7-6.04-6.04c0-3.34 2.7-6.04 6.04-6.04z" fill="url(#py_a)" />
        <path d="M55.98 109.91c14.73 0 23.77-.64 28.38-4.41 5.74-4.7 5.06-13.97 5.06-21.65V73.34H55.33v-4.83h47.5c7.68 0 14.43-4.62 16.5-13.25 2.37-9.87 2.47-16.03 0-26.41-1.84-7.74-6.13-13.25-13.81-13.25h-9.08v12.4c0 8.91-7.74 16.65-16.65 16.65H45.91c-7.47 0-13.48 6.01-13.48 13.48v25.96c0 7.47 6.22 13.06 13.48 15.45 5.01 1.71 10.97 2.51 10.97 2.51zM71.14 98.94c-3.34 0-6.04-2.7-6.04-6.04 0-3.34 2.7-6.04 6.04-6.04s6.04 2.7 6.04 6.04c0 3.34-2.7 6.04-6.04 6.04z" fill="url(#py_b)" />
        <defs>
          <linearGradient id="py_a" x1="12.07" y1="0" x2="80" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3776AB" />
            <stop offset="1" stopColor="#2B5B84" />
          </linearGradient>
          <linearGradient id="py_b" x1="40" y1="60" x2="110" y2="109.91" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFD43B" />
            <stop offset="1" stopColor="#FFE873" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    name: "Groq AI",
    svg: (
      <svg className={styles.techLogoSvg} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" rx="28" fill="#F55036" />
        <path d="M40 40h48v48H40z" fill="white" />
        <circle cx="64" cy="64" r="14" fill="#F55036" />
      </svg>
    ),
  },
  {
    name: "Tailwind CSS",
    svg: (
      <svg className={styles.techLogoSvg} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 68c4-8 12-14 22-14 14 0 18 10 26 10 8 0 14-6 18-14-4 8-12 14-22 14-14 0-18-10-26-10-8 0-14 6-18 14zm-16-24c4-8 12-14 22-14 14 0 18 10 26 10 8 0 14-6 18-14-4 8-12 14-22 14-14 0-18-10-26-10-8 0-14 6-18 14z" fill="#38BDF8" />
      </svg>
    ),
  },
  {
    name: "Capacitor",
    svg: (
      <svg className={styles.techLogoSvg} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" rx="24" fill="#119EFF" />
        <path d="M40 38l48 26-48 26V38z" fill="white" />
      </svg>
    ),
  },
  {
    name: "Leaflet GPS",
    svg: (
      <svg className={styles.techLogoSvg} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M64 16C44.1 16 28 32.1 28 52c0 27 36 60 36 60s36-33 36-60c0-19.9-16.1-36-36-36zm0 48c-6.6 0-12-5.4-12-12s5.4-12 12-12 12 5.4 12 12-5.4 12-12 12z" fill="#199900" />
      </svg>
    ),
  },
  {
    name: "Docker",
    svg: (
      <svg className={styles.techLogoSvg} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M120 60c-2.4 0-5.8 1.4-8 3-2.6-6-8.4-10-15-10-2.8 0-5.4.7-7.6 1.8C86.6 46.8 77 42 66 42c-2.4 0-4.8.2-7.1.7V34H48v8.7c-2.6.9-5.1 2-7.4 3.4V34H30v15c-3.1 2.5-5.8 5.6-7.8 9.2-2.7-1.4-5.8-2.2-9.2-2.2-8 0-14.8 4.7-17.8 11.5C-1 74.8 3.5 86 16 86c32 0 62.7 1.2 92.5-12.8 9.3-4.4 14.8-11.8 14.8-19.2 0-2.2-1.5-4-3.3-4zm-86 4h10v10H34V64zm14 0h10v10H48V64zm14 0h10v10H62V64zm14 0h10v10H76V64z" fill="#2496ED" />
      </svg>
    ),
  },
  {
    name: "GraphQL",
    svg: (
      <svg className={styles.techLogoSvg} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M64 16l41.6 24v48L64 112 22.4 88V40L64 16zm0 14L34.5 47v34L64 98l29.5-17V47L64 30z" fill="#E535AB" />
      </svg>
    ),
  },
  {
    name: "Node.js",
    svg: (
      <svg className={styles.techLogoSvg} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M64 16L20 41.4v50.8L64 112l44-24.8V41.4L64 16zm0 14.4l31.5 17.7v35.4L64 98.9 32.5 83.5V48.1L64 30.4z" fill="#5FA04E" />
      </svg>
    ),
  },
  {
    name: "Redis",
    svg: (
      <svg className={styles.techLogoSvg} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 48l48-24 48 24-48 24-48-24zm0 24l48 24 48-24v16l-48 24-48-24V72zm0 24l48 24 48-24v16l-48 24-48-24V96z" fill="#DC382D" />
      </svg>
    ),
  },
  {
    name: "PWA Native",
    svg: (
      <svg className={styles.techLogoSvg} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" rx="24" fill="#5A0FC8" />
        <path d="M36 44h28c11 0 18 6 18 15s-7 15-18 15H48v20H36V44zm12 20h14c5 0 8-2 8-6s-3-6-8-6H48v12z" fill="white" />
      </svg>
    ),
  },
  {
    name: "GSAP 3D",
    svg: (
      <svg className={styles.techLogoSvg} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" rx="24" fill="#88CE02" />
        <path d="M40 64l24-24 24 24-24 24-24-24z" fill="black" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    svg: (
      <svg className={styles.techLogoSvg} viewBox="0 0 98 96" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.224-5.704-5.426-7.17-5.426-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.094-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0112.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.095 7.822 5.095 13.2 0 18.905-11.485 23.142-22.405 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.869 0 48.854 0z" fill="#181717" />
      </svg>
    ),
  },
];

// Duplicate items twice to ensure seamless continuous 3D loop scrolling (Swiper style)
const DUPLICATED_ITEMS = [...TECH_ITEMS, ...TECH_ITEMS, ...TECH_ITEMS];

export default function TechLogoGrid() {
  return (
    <section className={styles.techShowcaseSection}>
      <div className={styles.techShowcaseTitle}>Teknologi Premium Yang Kami Gunakan</div>
      
      {/* ── Swiper Infinite Horizontal Slider ── */}
      <div className={`swiper swiper-initialized swiper-horizontal logo-swiper ${styles.swiperContainer}`}>
        <div className={`swiper-wrapper ${styles.swiperWrapper}`}>
          {DUPLICATED_ITEMS.map((item, idx) => (
            <div key={`${item.name}-${idx}`} className={styles.techLogoItem}>
              {item.svg}
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
