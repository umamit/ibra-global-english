import React from "react";
import { PaymentMethodLogo } from "./PaymentMethodLogo";

export type PaymentMethodType =
  | "va_bri"
  | "va_mandiri"
  | "va_bni"
  | "va_bsi"
  | "va_cimb"
  | "va_danamon"
  | "va_permata"
  | "va_seabank"
  | "gopay"
  | "card"
  | "qris"
  | "indomaret";

export interface PaymentOption {
  id: PaymentMethodType;
  title: string;
  category: "qris" | "va" | "ewallet" | "retail" | "card";
  subtitle: string;
  gateway: "midtrans" | "xendit";
  badge?: string;
}

// Midtrans sebagai gerbang utama untuk saluran yang aktif di dasbor Midtrans
// Xendit sebagai pelengkap untuk saluran yang belum ada di Midtrans (QRIS & Indomaret)
export const PAYMENT_METHODS: PaymentOption[] = [
  {
    id: "va_bri",
    category: "va",
    title: "BRI Virtual Account (BRIVA)",
    subtitle: "Verifikasi instan via BRImo / ATM BRI",
    gateway: "midtrans",
    badge: "Midtrans",
  },
  {
    id: "va_mandiri",
    category: "va",
    title: "Bank Mandiri (Bill / E-Channel)",
    subtitle: "Verifikasi instan via Livin' by Mandiri / ATM",
    gateway: "midtrans",
    badge: "Midtrans",
  },
  {
    id: "va_bni",
    category: "va",
    title: "BNI Virtual Account",
    subtitle: "Verifikasi instan via BNI Mobile Banking / ATM",
    gateway: "midtrans",
    badge: "Midtrans",
  },
  {
    id: "va_bsi",
    category: "va",
    title: "BSI Virtual Account (Bank Syariah)",
    subtitle: "Verifikasi instan via BSI Mobile / ATM",
    gateway: "midtrans",
    badge: "Midtrans",
  },
  {
    id: "va_cimb",
    category: "va",
    title: "CIMB Niaga Virtual Account",
    subtitle: "Verifikasi instan via OCTO Mobile / Clicks",
    gateway: "midtrans",
    badge: "Midtrans",
  },
  {
    id: "va_permata",
    category: "va",
    title: "PermataBank Virtual Account",
    subtitle: "Verifikasi instan via PermataMobile X / ATM",
    gateway: "midtrans",
    badge: "Midtrans",
  },
  {
    id: "va_danamon",
    category: "va",
    title: "Bank Danamon Virtual Account",
    subtitle: "Verifikasi instan via D-Bank PRO / ATM",
    gateway: "midtrans",
    badge: "Midtrans",
  },
  {
    id: "va_seabank",
    category: "va",
    title: "SeaBank Virtual Account",
    subtitle: "Transfer instan via SeaBank App / ShopeePay",
    gateway: "midtrans",
    badge: "Midtrans",
  },
  {
    id: "gopay",
    category: "ewallet",
    title: "GoPay / GoPay App",
    subtitle: "Pembayaran langsung via aplikasi Gojek / GoPay",
    gateway: "midtrans",
    badge: "Midtrans",
  },
  {
    id: "card",
    category: "card",
    title: "Kartu Kredit / Debit & Google Pay",
    subtitle: "Visa, Mastercard, JCB, American Express",
    gateway: "midtrans",
    badge: "Midtrans",
  },
  {
    id: "qris",
    category: "qris",
    title: "QRIS (Semua E-Wallet & M-Banking)",
    subtitle: "BCA Mobile, ShopeePay, DANA, OVO, dll.",
    gateway: "xendit",
    badge: "Pelengkap Xendit",
  },
  {
    id: "indomaret",
    category: "retail",
    title: "Gerai Indomaret",
    subtitle: "Bayar tunai di kasir Indomaret seluruh Indonesia",
    gateway: "xendit",
    badge: "Pelengkap Xendit",
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
              <PaymentMethodLogo method={method.id} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.88rem", fontWeight: 800, color: isSelected ? "#164d57" : "#2d3748" }}>
                    {method.title}
                  </span>
                  {method.badge && (
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        padding: "0.1rem 0.45rem",
                        borderRadius: "5px",
                        backgroundColor: method.gateway === "midtrans" ? "rgba(33, 108, 126, 0.1)" : "rgba(166, 136, 73, 0.12)",
                        color: method.gateway === "midtrans" ? "#216c7e" : "#A68849",
                      }}
                    >
                      {method.badge}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.74rem", color: "#59616e", marginTop: "2px" }}>
                  {method.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
