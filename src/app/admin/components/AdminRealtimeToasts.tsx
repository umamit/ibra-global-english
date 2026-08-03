"use client";

import React from "react";

interface RealtimeToastProps {
  newRegToast: string;
  setNewRegToast: (v: string) => void;
  newTestToast: string;
  setNewTestToast: (v: string) => void;
}

export default function AdminRealtimeToasts({ newRegToast, setNewRegToast, newTestToast, setNewTestToast }: RealtimeToastProps) {
  const toastBase: React.CSSProperties = {
    position: "fixed", right: "24px", zIndex: 9999, borderRadius: "12px", padding: "14px 20px",
    fontSize: "0.9rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "10px",
    maxWidth: "360px", animation: "slideInRight 0.35s cubic-bezier(0.34,1.56,0.64,1)",
  };

  return (
    <>
      {newRegToast && (
        <div role="alert" aria-live="polite" style={{ ...toastBase, top: "24px", background: "linear-gradient(135deg, #1a2a3a 0%, #0f1f2d 100%)", color: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(99,202,183,0.25)", borderLeft: "4px solid #63cab7" }}>
          <span style={{ display: "inline-flex", color: "#63cab7" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </span>
          <span>{newRegToast}</span>
          <button onClick={() => setNewRegToast("")} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "1rem", lineHeight: 1, padding: "0 2px" }} aria-label="Tutup notifikasi">×</button>
        </div>
      )}
      {newTestToast && (
        <div role="alert" aria-live="polite" style={{ ...toastBase, top: newRegToast ? "110px" : "24px", background: "linear-gradient(135deg, #1a2d1a 0%, #0f1f0f 100%)", color: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(99,183,99,0.25)", borderLeft: "4px solid #63b763", transition: "top 0.3s ease" }}>
          <span style={{ display: "inline-flex", color: "#63b763" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          </span>
          <span>{newTestToast}</span>
          <button onClick={() => setNewTestToast("")} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "1rem", lineHeight: 1, padding: "0 2px" }} aria-label="Tutup notifikasi placement test">×</button>
        </div>
      )}
    </>
  );
}
