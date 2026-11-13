import React from "react";
import { PaymentMethodType } from "./PaymentMethodSelector";

const LOGO_PATHS: Partial<Record<PaymentMethodType, { src: string; alt: string }>> = {
  va_bri: { src: "/assets/payment-logos/bri.png", alt: "Logo Resmi Bank BRI" },
  va_mandiri: { src: "/assets/payment-logos/mandiri.png", alt: "Logo Resmi Bank Mandiri" },
  va_bni: { src: "/assets/payment-logos/bni.png", alt: "Logo Resmi Bank BNI" },
  va_bsi: { src: "/assets/payment-logos/bsi.png", alt: "Logo Resmi Bank Syariah Indonesia" },
  va_cimb: { src: "/assets/payment-logos/cimb.png", alt: "Logo Resmi CIMB Niaga" },
  va_permata: { src: "/assets/payment-logos/permata.png", alt: "Logo Resmi PermataBank" },
  va_danamon: { src: "/assets/payment-logos/danamon.png", alt: "Logo Resmi Bank Danamon" },
  va_seabank: { src: "/assets/payment-logos/seabank.png", alt: "Logo Resmi SeaBank" },
  gopay: { src: "/assets/payment-logos/gopay.png", alt: "Logo Resmi GoPay" },
  shopeepay: { src: "/assets/payment-logos/shopeepay.png", alt: "Logo Resmi ShopeePay" },
  card: { src: "/assets/payment-logos/card.png", alt: "Logo Resmi Visa & Mastercard" },
  qris: { src: "/assets/payment-logos/qris.png", alt: "Logo Resmi QRIS Standar Nasional" },
  indomaret: { src: "/assets/payment-logos/indomaret.png", alt: "Logo Resmi Indomaret" },
  akulaku: { src: "/assets/payment-logos/akulaku.png", alt: "Logo Resmi Akulaku" },
  astrapay: { src: "/assets/payment-logos/astrapay.png", alt: "Logo Resmi AstraPay" },
  va_sampoerna: { src: "/assets/payment-logos/bss.png", alt: "Logo Resmi Bank Sahabat Sampoerna" },
};

const CUSTOM_BADGES: Partial<Record<PaymentMethodType, { label: string; bg: string; color: string }>> = {};

export function PaymentMethodLogo({ method }: { method: PaymentMethodType }) {
  const custom = CUSTOM_BADGES[method];
  if (custom) {
    return (
      <div
        style={{
          width: "56px",
          height: "32px",
          borderRadius: "8px",
          backgroundColor: custom.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: custom.color,
          fontWeight: 900,
          fontSize: "0.62rem",
          letterSpacing: "0.02em",
        }}
      >
        {custom.label}
      </div>
    );
  }
  const logo = LOGO_PATHS[method];
  if (!logo) return null;

  return (
    <div
      style={{
        width: "56px",
        height: "32px",
        borderRadius: "8px",
        backgroundColor: "#ffffff",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
        padding: "3px 6px",
        boxSizing: "border-box",
      }}
    >
      <img
        src={logo.src}
        alt={logo.alt}
        width={44}
        height={24}
        loading="lazy"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
        }}
      />
    </div>
  );
}
