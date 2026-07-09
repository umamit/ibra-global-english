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
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        transition: "opacity 0.25s ease-in-out"
      }}
    >
      {/* Circle Close Button at top-right */}
      <button 
        className="lightbox-close" 
        id="lightbox-close" 
        onClick={onClose} 
        aria-label="Tutup Galeri"
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.12)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 0.2s, transform 0.2s",
          zIndex: 10000,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.12)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="lightbox-content" style={{ position: "relative", maxWidth: "800px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        {/* Navigation Left Button */}
        {hasNavigation && onPrev && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            aria-label="Foto sebelumnya"
            style={{
              position: "absolute",
              left: "-64px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "white",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.12)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* Rounded Image Container */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "auto" }}>
          <img 
            src={src} 
            alt={caption} 
            className="lightbox-img" 
            id="lightbox-img" 
            style={{ 
              maxWidth: "100%", 
              maxHeight: "75vh", 
              height: "auto", 
              width: "auto", 
              display: "block", 
              borderRadius: "14px", 
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)", 
              border: "1px solid rgba(255, 255, 255, 0.15)",
              objectFit: "contain" 
            }} 
          />
        </div>

        {/* Stylized Caption Text */}
        <p 
          className="lightbox-caption" 
          id="lightbox-caption" 
          style={{ 
            color: "white", 
            marginTop: "1.25rem", 
            fontSize: "1.05rem", 
            fontWeight: "700", 
            textAlign: "center", 
            letterSpacing: "-0.01em",
            fontFamily: "var(--font-sans), sans-serif",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.6)"
          }}
        >
          {caption}
        </p>

        {/* Navigation Right Button */}
        {hasNavigation && onNext && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            aria-label="Foto berikutnya"
            style={{
              position: "absolute",
              right: "-64px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "white",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.12)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
