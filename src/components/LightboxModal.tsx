"use client";

import React from "react";

interface LightboxModalProps {
  isOpen: boolean;
  src: string;
  caption: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasNavigation?: boolean;
}

export default function LightboxModal({
  isOpen,
  src,
  caption,
  onClose,
  onPrev,
  onNext,
  hasNavigation = false
}: LightboxModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      id="lightbox-modal" 
      className={`lightbox-modal ${isOpen ? "active" : ""}`} 
      aria-hidden={!isOpen} 
      role="dialog"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === "lightbox-modal") {
          onClose();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
      }}
    >
      <div className="lightbox-content" style={{ position: "relative", maxWidth: "90%", maxHeight: "90%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <button 
          className="lightbox-close" 
          id="lightbox-close" 
          onClick={onClose} 
          aria-label="Tutup Galeri"
          style={{
            position: "absolute",
            top: "-40px",
            right: "0",
            background: "none",
            border: "none",
            color: "white",
            fontSize: "2rem",
            cursor: "pointer"
          }}
        >
          &times;
        </button>

        {hasNavigation && onPrev && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            aria-label="Foto sebelumnya"
            style={{
              position: "absolute",
              left: "-60px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              color: "white",
              fontSize: "1.5rem",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            &#10094;
          </button>
        )}

        <img src={src} alt={caption} className="lightbox-img" id="lightbox-img" style={{ maxWidth: "100%", maxHeight: "75vh", objectFit: "contain", borderRadius: "4px" }} />
        <p className="lightbox-caption" id="lightbox-caption" style={{ color: "white", marginTop: "1rem", fontSize: "1rem", fontWeight: "700", textAlign: "center" }}>{caption}</p>

        {hasNavigation && onNext && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            aria-label="Foto berikutnya"
            style={{
              position: "absolute",
              right: "-60px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              color: "white",
              fontSize: "1.5rem",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            &#10095;
          </button>
        )}
      </div>
    </div>
  );
}
