"use client";

import packageInfo from "../../package.json";

export default function Footer() {
  return (
    <footer>
      <div className="container footer-content">
        <div className="footer-logo">
          <img src="/assets/logo.png" alt="Ibra Global English Logo" loading="lazy" />
          <div className="footer-logo-text">
            <h3>Ibra Global English</h3>
            <p>Belajar Seru Lancar Bicara</p>
          </div>
        </div>
        <p className="footer-desc">Kursus Bahasa Inggris Offline Terbaik di Bobong</p>
        <p className="footer-copyright">
          &copy; 2026 Ibra Global English. All rights reserved. 
          <span className="footer-version" style={{ opacity: 0.6, fontSize: "0.85em", marginLeft: "8px" }}>
            v{packageInfo.version}
          </span>
        </p>
      </div>
    </footer>
  );
}
