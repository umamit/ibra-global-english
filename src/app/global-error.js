"use client";

import * as Sentry from "@sentry/nextjs";

export default function GlobalError({ error, reset }) {
  Sentry.captureException(error);

  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "2rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#c92a2a" }}>
            ⚠️ Terjadi Kesalahan
          </h1>
          <p style={{ fontSize: "1.1rem", marginBottom: "2rem", color: "#555" }}>
            Maaf, telah terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              backgroundColor: "#4a9ba8",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}