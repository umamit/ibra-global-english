import React from "react";

export type PaymentMethodType = "qris" | "va_bca" | "va_bri" | "va_mandiri" | "va_bni" | "va_bsi" | "gopay" | "indomaret";

export interface PaymentOption {
  id: PaymentMethodType;
  title: string;
  category: "qris" | "va" | "ewallet" | "retail";
  subtitle: string;
  gateway: "xendit" | "midtrans";
}

export const PAYMENT_METHODS: PaymentOption[] = [
  {
    id: "qris",
    category: "qris",
    title: "QRIS (Semua E-Wallet & M-Banking)",
    subtitle: "BCA Mobile, Livin', BRImo, ShopeePay, GoPay, DANA, OVO",
    gateway: "xendit",
  },
  {
    id: "va_bri",
    category: "va",
    title: "BRI Virtual Account (BRIVA)",
    subtitle: "Verifikasi instan via BRImo / ATM BRI",
    gateway: "xendit",
  },
  {
    id: "va_mandiri",
    category: "va",
    title: "Mandiri Virtual Account",
    subtitle: "Verifikasi instan via Livin' by Mandiri / ATM",
    gateway: "xendit",
  },
  {
    id: "va_bni",
    category: "va",
    title: "BNI Virtual Account",
    subtitle: "Verifikasi instan via BNI Mobile Banking / ATM",
    gateway: "xendit",
  },
  {
    id: "va_bsi",
    category: "va",
    title: "BSI Virtual Account",
    subtitle: "Verifikasi instan via BSI Mobile / ATM",
    gateway: "xendit",
  },
  {
    id: "va_bca",
    category: "va",
    title: "BCA & Bank Lainnya (Virtual Account)",
    subtitle: "Transfer otomatis via jaringan ATM Bersama / Prima",
    gateway: "midtrans",
  },
  {
    id: "gopay",
    category: "ewallet",
    title: "GoPay / GoPay App",
    subtitle: "Pembayaran langsung via aplikasi Gojek / GoPay",
    gateway: "midtrans",
  },
  {
    id: "indomaret",
    category: "retail",
    title: "Gerai Indomaret",
    subtitle: "Bayar tunai di kasir Indomaret seluruh Indonesia",
    gateway: "xendit",
  },
];

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType;
  onSelectMethod: (method: PaymentMethodType) => void;
}

export default function PaymentMethodSelector({ selectedMethod, onSelectMethod }: PaymentMethodSelectorProps) {
  return (
    <div className="liquid-glass-card" style={{ borderRadius: "18px", padding: "1.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#164d57" }}>3. Metode Pembayaran</h2>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#216c7e", backgroundColor: "#eef6f8", padding: "0.2rem 0.6rem", borderRadius: "6px" }}>
          Verifikasi Otomatis
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <div
              key={method.id}
              onClick={() => onSelectMethod(method.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
                padding: "0.85rem 1rem",
                borderRadius: "12px",
                border: isSelected ? "2px solid #216c7e" : "1px solid rgba(0,0,0,0.08)",
                backgroundColor: isSelected ? "#eef6f8" : "#ffffff",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  border: isSelected ? "5px solid #216c7e" : "2px solid rgba(0,0,0,0.25)",
                  backgroundColor: "#ffffff",
                  flexShrink: 0,
                  boxSizing: "border-box",
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 800, color: isSelected ? "#164d57" : "#2d3748" }}>
                  {method.title}
                </div>
                <div style={{ fontSize: "0.74rem", color: "#59616e", marginTop: "2px" }}>
                  {method.subtitle}
                </div>
              </div>
              {method.id === "qris" && (
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#ffffff", backgroundColor: "#A68849", padding: "0.15rem 0.5rem", borderRadius: "6px" }}>
                  Favorit
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
