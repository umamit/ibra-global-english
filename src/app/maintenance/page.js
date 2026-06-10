"use client";

export const dynamic = 'force-dynamic';

export default function MaintenancePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .maint-body {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.25rem;
          font-family: 'Montserrat', sans-serif;
          background: linear-gradient(135deg, #0f3741 0%, #164d57 40%, #216c7e 100%);
          position: relative;
          overflow: hidden;
          text-align: center;
        }

        /* Decorative blobs */
        .maint-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.18;
          pointer-events: none;
        }
        .maint-blob-1 {
          width: 520px; height: 520px;
          background: #A68849;
          top: -160px; left: -160px;
        }
        .maint-blob-2 {
          width: 400px; height: 400px;
          background: #a7d8e0;
          bottom: -120px; right: -100px;
        }

        .maint-card {
          position: relative;
          z-index: 1;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 28px;
          padding: 3rem 2.5rem;
          max-width: 520px;
          width: 100%;
          box-shadow: 0 32px 64px rgba(0,0,0,0.3);
          animation: fadeUp 0.8s cubic-bezier(0.34,1.2,0.64,1) both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .maint-logo-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          animation: fadeUp 0.8s 0.1s both;
        }

        .maint-logo {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(255,255,255,0.92);
          padding: 0.3rem;
          object-fit: contain;
          box-shadow: 0 0 0 2px rgba(255,255,255,0.3), 0 6px 20px rgba(0,0,0,0.2);
        }

        .maint-logo-name {
          font-size: 1.05rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.2;
        }
        .maint-logo-sub {
          font-size: 0.7rem;
          font-weight: 600;
          color: rgba(255,255,255,0.55);
          letter-spacing: 0.05em;
        }

        .maint-icon-wrap {
          margin-bottom: 1.5rem;
          animation: pulse 3s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.08); }
        }

        .maint-icon-circle {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: linear-gradient(135deg, #A68849 0%, #c9a45a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          box-shadow: 0 8px 32px rgba(166,136,73,0.4);
        }

        .maint-title {
          font-size: 1.75rem;
          font-weight: 900;
          color: #ffffff;
          margin-bottom: 0.75rem;
          line-height: 1.25;
          animation: fadeUp 0.8s 0.2s both;
        }

        .maint-subtitle {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.7);
          line-height: 1.7;
          margin-bottom: 2rem;
          animation: fadeUp 0.8s 0.3s both;
        }

        .maint-divider {
          width: 48px;
          height: 3px;
          background: linear-gradient(90deg, #A68849, #facc15);
          border-radius: 99px;
          margin: 0 auto 2rem;
        }

        .maint-trilogy {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem 0.65rem;
          flex-wrap: wrap;
          justify-content: center;
          padding: 0.65rem 1.25rem;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 100px;
          margin-bottom: 2.5rem;
          animation: fadeUp 0.8s 0.4s both;
        }

        .maint-trilogy span {
          font-size: 0.78rem;
          font-weight: 700;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        .maint-trilogy-sep {
          font-size: 0.9rem;
          color: #A68849;
          font-weight: 900;
        }

        .maint-cta {
          animation: fadeUp 0.8s 0.5s both;
        }

        .maint-wa-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.85rem 1.75rem;
          background: #25d366;
          color: #fff;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          border-radius: 12px;
          text-decoration: none;
          box-shadow: 0 6px 20px rgba(37,211,102,0.35);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .maint-wa-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(37,211,102,0.45);
        }

        .maint-admin-link {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          margin-top: 1rem;
          padding: 0.55rem 1.1rem;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.55);
          font-family: 'Montserrat', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .maint-admin-link:hover {
          background: rgba(255,255,255,0.14);
          color: rgba(255,255,255,0.9);
          border-color: rgba(255,255,255,0.3);
        }

        .maint-footer {
          position: relative;
          z-index: 1;
          margin-top: 2rem;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.35);
          font-family: 'Montserrat', sans-serif;
          animation: fadeUp 0.8s 0.6s both;
        }
      `}</style>

      <div className="maint-body">
        {/* Background blobs */}
        <div className="maint-blob maint-blob-1" />
        <div className="maint-blob maint-blob-2" />

        <div className="maint-card">
          {/* Logo */}
          <div className="maint-logo-wrap">
            <img src="/assets/logo.png" alt="Logo Ibra Global English" className="maint-logo" />
            <div style={{ textAlign: "left" }}>
              <div className="maint-logo-name">Ibra Global English</div>
              <div className="maint-logo-sub">Bobong, Pulau Taliabu</div>
            </div>
          </div>

          {/* Icon */}
          <div className="maint-icon-wrap">
            <div className="maint-icon-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="maint-title">Sedang dalam Pemeliharaan</h1>

          <div className="maint-divider" />

          <p className="maint-subtitle">
            Website Ibra Global English sedang kami tingkatkan untuk pengalaman belajar yang lebih baik.
            Kami akan kembali online sebentar lagi. Terima kasih atas kesabarannya! 🙏
          </p>

          {/* Trilogy */}
          <div className="maint-trilogy">
            <span>🎉 Belajar Seru</span>
            <span className="maint-trilogy-sep">•</span>
            <span>🗣️ Berani Bicara</span>
            <span className="maint-trilogy-sep">•</span>
            <span>🌍 Siap Mendunia</span>
          </div>

          {/* WhatsApp CTA */}
          <div className="maint-cta">
            <a
              href="https://wa.me/6281357001357?text=Halo%20Ibra%20Global%20English%2C%20saya%20ingin%20bertanya%20tentang%20program%20kursus."
              target="_blank"
              rel="noopener noreferrer"
              className="maint-wa-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Hubungi via WhatsApp
            </a>

            {/* Admin login link */}
            <div>
              <a href="/login" className="maint-admin-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Login sebagai Admin
              </a>
            </div>
          </div>
        </div>

        <p className="maint-footer">© 2026 Ibra Global English · Bobong, Pulau Taliabu</p>
      </div>
    </>
  );
}
