"use client";

export default function LightboxModal({ isOpen, src, caption, onClose }: {
  isOpen: boolean;
  src: string;
  caption: string;
  onClose: () => void;
}) {
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
    >
      <div className="lightbox-content">
        <button className="lightbox-close" id="lightbox-close" onClick={onClose} aria-label="Tutup Galeri">&times;</button>
        <img src={src} alt={caption} className="lightbox-img" id="lightbox-img" />
        <p className="lightbox-caption" id="lightbox-caption">{caption}</p>
      </div>
    </div>
  );
}
