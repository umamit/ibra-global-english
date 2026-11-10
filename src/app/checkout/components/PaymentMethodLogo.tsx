import React from "react";
import { PaymentMethodType } from "./PaymentMethodSelector";

export function PaymentMethodLogo({ method }: { method: PaymentMethodType }) {
  const boxStyle: React.CSSProperties = {
    width: "44px",
    height: "28px",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
    padding: "2px",
  };

  switch (method) {
    case "va_bri":
      return (
        <div style={boxStyle} title="Bank BRI">
          <svg viewBox="0 0 100 40" width="38" height="20">
            <rect width="100" height="40" rx="6" fill="#00529C" />
            <text x="50" y="26" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">BRI</text>
          </svg>
        </div>
      );
    case "va_mandiri":
      return (
        <div style={boxStyle} title="Bank Mandiri">
          <svg viewBox="0 0 120 40" width="40" height="20">
            <text x="5" y="27" fill="#003D79" fontSize="20" fontWeight="900" fontFamily="sans-serif">mandırı</text>
            <path d="M100 8 C115 12, 115 28, 100 32" stroke="#F5A623" strokeWidth="5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      );
    case "va_bni":
      return (
        <div style={boxStyle} title="Bank BNI">
          <svg viewBox="0 0 100 40" width="38" height="20">
            <text x="10" y="28" fill="#005E6A" fontSize="26" fontWeight="900" fontFamily="sans-serif">BNI</text>
            <circle cx="85" cy="18" r="7" fill="#F15A24" />
          </svg>
        </div>
      );
    case "va_bsi":
      return (
        <div style={boxStyle} title="Bank Syariah Indonesia">
          <svg viewBox="0 0 100 40" width="38" height="20">
            <rect width="100" height="40" rx="4" fill="#00A39D" />
            <text x="50" y="26" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">BSI</text>
          </svg>
        </div>
      );
    case "va_cimb":
      return (
        <div style={boxStyle} title="CIMB Niaga">
          <svg viewBox="0 0 110 40" width="40" height="20">
            <rect width="110" height="40" rx="4" fill="#ED1C24" />
            <text x="55" y="26" fill="#ffffff" fontSize="20" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">CIMB</text>
          </svg>
        </div>
      );
    case "va_permata":
      return (
        <div style={boxStyle} title="PermataBank">
          <svg viewBox="0 0 110 40" width="40" height="20">
            <path d="M20 20 L28 10 L36 20 L28 30 Z" fill="#008080" />
            <path d="M28 10 L36 20 L44 10 Z" fill="#78BE20" />
            <text x="50" y="25" fill="#002D62" fontSize="16" fontWeight="800" fontFamily="sans-serif">Permata</text>
          </svg>
        </div>
      );
    case "va_danamon":
      return (
        <div style={boxStyle} title="Bank Danamon">
          <svg viewBox="0 0 120 40" width="40" height="20">
            <rect x="5" y="10" width="8" height="20" fill="#FF6A00" />
            <rect x="15" y="10" width="8" height="20" fill="#008542" />
            <text x="30" y="26" fill="#1C3F94" fontSize="17" fontWeight="800" fontFamily="sans-serif">Danamon</text>
          </svg>
        </div>
      );
    case "va_seabank":
      return (
        <div style={boxStyle} title="SeaBank">
          <svg viewBox="0 0 110 40" width="40" height="20">
            <rect width="110" height="40" rx="4" fill="#EE4D2D" />
            <text x="55" y="26" fill="#ffffff" fontSize="18" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">SeaBank</text>
          </svg>
        </div>
      );
    case "gopay":
      return (
        <div style={boxStyle} title="GoPay">
          <svg viewBox="0 0 110 40" width="40" height="20">
            <circle cx="20" cy="20" r="12" fill="#00AED6" />
            <circle cx="20" cy="20" r="5" fill="#ffffff" />
            <text x="38" y="26" fill="#00AED6" fontSize="20" fontWeight="900" fontFamily="sans-serif">gopay</text>
          </svg>
        </div>
      );
    case "card":
      return (
        <div style={boxStyle} title="Kartu Kredit & Google Pay">
          <svg viewBox="0 0 110 40" width="40" height="20">
            <circle cx="30" cy="20" r="14" fill="#EB001B" />
            <circle cx="48" cy="20" r="14" fill="#F79E1B" fillOpacity="0.85" />
            <text x="70" y="26" fill="#1A1F71" fontSize="15" fontWeight="900" fontFamily="sans-serif">PAY</text>
          </svg>
        </div>
      );
    case "qris":
      return (
        <div style={boxStyle} title="QRIS Standar Nasional">
          <svg viewBox="0 0 110 40" width="40" height="20">
            <rect width="110" height="40" rx="4" fill="#ffffff" />
            <text x="55" y="27" fill="#D32F2F" fontSize="22" fontWeight="900" fontFamily="sans-serif" letterSpacing="1" textAnchor="middle">QRIS</text>
          </svg>
        </div>
      );
    case "indomaret":
      return (
        <div style={boxStyle} title="Indomaret">
          <svg viewBox="0 0 120 40" width="42" height="20">
            <rect x="5" y="10" width="36" height="20" fill="#005BAA" />
            <rect x="41" y="10" width="36" height="20" fill="#ED1C24" />
            <rect x="77" y="10" width="36" height="20" fill="#FFF200" />
            <text x="58" y="25" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">INDOMARET</text>
          </svg>
        </div>
      );
    default:
      return null;
  }
}
