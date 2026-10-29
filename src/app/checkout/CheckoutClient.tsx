"use client";

import React from "react";
import Link from "next/link";
import { usePublicCheckout } from "./hooks/usePublicCheckout";
import { LandingSettings } from "@/utils/getLandingSettings";

export default function CheckoutClient({ initialSettings }: { initialSettings: LandingSettings }) {
  const {
    products,
    selectedProgram,
    setSelectedProgram,
    activeProduct,
    serviceFee,
    totalAmount,
    studentName,
    setStudentName,
    parentName,
    setParentName,
    email,
    setEmail,
    whatsapp,
    setWhatsapp,
    month,
    setMonth,
    agreedTerms,
    setAgreedTerms,
    loadingGateway,
    errorMsg,
    paymentSuccessBanner,
    handleCheckout,
  } = usePublicCheckout(initialSettings);

  const bankName = String(initialSettings?.payment_bank_name || "BRI");
  const accountNumber = String(initialSettings?.payment_account_number || "767901015374533");
  const accountName = String(initialSettings?.payment_account_name || "Husnita Usman");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f7", padding: "3rem 1.25rem", fontFamily: "Montserrat, sans-serif" }}>
      <div style={{ maxWidth: "1060px", margin: "0 auto" }}>
        {/* Header Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <img src="/assets/logo.png" alt="Logo Ibra Global English" width={48} height={48} style={{ borderRadius: "12px", objectFit: "contain" }} />
            <div>
              <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "#164d57" }}>Checkout Pembayaran Kursus &amp; SPP</h1>
              <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#59616e" }}>PT. IBRA GLOBAL ENGLISH (IGE) Bobong · NPSN K7069872</p>
            </div>
          </div>
          <Link href="/" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#216c7e", textDecoration: "none", padding: "0.55rem 1rem", borderRadius: "10px", backgroundColor: "#ffffff", border: "1px solid rgba(0,0,0,0.06)" }}>
            ← Kembali ke Beranda
          </Link>
        </div>

        {paymentSuccessBanner && (
          <div style={{ padding: "1.1rem 1.25rem", borderRadius: "14px", backgroundColor: "#ecfdf5", border: "1px solid #10b981", color: "#065f46", fontSize: "0.9rem", fontWeight: 700, marginBottom: "1.5rem" }}>
            Pembayaran Anda telah berhasil diterima oleh sistem. Status SPP akan diperbarui secara otomatis.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.75rem", alignItems: "start" }}>
          {/* Left Column: Course Catalog & Customer Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ backgroundColor: "#ffffff", borderRadius: "18px", padding: "1.75rem", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <h2 style={{ margin: "0 0 1rem", fontSize: "1.05rem", fontWeight: 800, color: "#164d57" }}>1. Pilih Program Kursus</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                {products.map((item) => {
                  const isSelected = selectedProgram === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedProgram(item.id)}
                      style={{
                        textAlign: "left",
                        padding: "1rem",
                        borderRadius: "14px",
                        border: isSelected ? "2px solid #216c7e" : "1px solid rgba(0,0,0,0.08)",
                        backgroundColor: isSelected ? "#eef6f8" : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#164d57" }}>{item.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#59616e", marginTop: "2px" }}>{item.age}</div>
                      <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#216c7e", marginTop: "4px" }}>{item.schedule}</div>
                      <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#A68849", marginTop: "8px" }}>
                        Rp {item.price.toLocaleString("id-ID")} <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#59616e" }}>/ bulan</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ backgroundColor: "#ffffff", borderRadius: "18px", padding: "1.75rem", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <h2 style={{ margin: "0 0 1rem", fontSize: "1.05rem", fontWeight: 800, color: "#164d57" }}>2. Data Siswa &amp; Wali Murid</h2>
              {errorMsg && (
                <div style={{ padding: "0.85rem 1rem", borderRadius: "10px", backgroundColor: "#fef2f2", color: "#b91c1c", fontSize: "0.85rem", fontWeight: 600, marginBottom: "1rem" }}>
                  {errorMsg}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#164d57", marginBottom: "0.35rem" }}>Nama Lengkap Siswa *</label>
                  <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Contoh: Ahmad Fauzan" style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.9rem" }} required />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#164d57", marginBottom: "0.35rem" }}>Nama Orang Tua / Wali *</label>
                    <input type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="Nama Wali Murid" style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.9rem" }} required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#164d57", marginBottom: "0.35rem" }}>Periode Bulan SPP *</label>
                    <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.9rem" }} required />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#164d57", marginBottom: "0.35rem" }}>Email Penerima Bukti Bayar *</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@contoh.com" style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.9rem" }} required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#164d57", marginBottom: "0.35rem" }}>Nomor WhatsApp Aktif *</label>
                    <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="0813xxxxxxx" style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.9rem" }} required />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Payment Buttons */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "18px", padding: "1.75rem", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <h2 style={{ margin: "0 0 1rem", fontSize: "1.05rem", fontWeight: 800, color: "#164d57" }}>Ringkasan Tagihan (Order Summary)</h2>
            <div style={{ padding: "1rem", borderRadius: "12px", backgroundColor: "#eef6f8", marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#164d57" }}>{activeProduct.name}</div>
              <div style={{ fontSize: "0.8rem", color: "#59616e", marginTop: "4px" }}>{activeProduct.desc}</div>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#216c7e", marginTop: "6px" }}>Jadwal: {activeProduct.schedule}</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "#59616e", marginBottom: "0.5rem" }}>
              <span>Biaya SPP Bulanan ({month})</span>
              <span style={{ fontWeight: 700, color: "#164d57" }}>Rp {activeProduct.price.toLocaleString("id-ID")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "#59616e", paddingBottom: "1rem", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
              <span>Biaya Layanan Pembayaran Otomatis</span>
              <span style={{ fontWeight: 700, color: "#164d57" }}>Rp {serviceFee.toLocaleString("id-ID")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0", fontSize: "1.1rem", fontWeight: 800, color: "#164d57" }}>
              <span>Total Pembayaran (IDR)</span>
              <span style={{ color: "#A68849", fontSize: "1.25rem" }}>Rp {totalAmount.toLocaleString("id-ID")}</span>
            </div>

            <label style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", fontSize: "0.8rem", color: "#59616e", marginBottom: "1.25rem", cursor: "pointer", lineHeight: 1.45 }}>
              <input type="checkbox" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} style={{ marginTop: "3px" }} />
              <span>
                Saya menyetujui <Link href="/terms" style={{ color: "#216c7e", fontWeight: 700 }}>Syarat &amp; Ketentuan</Link> (termasuk kebijakan pengembalian dana/refund) serta <Link href="/privacy" style={{ color: "#216c7e", fontWeight: 700 }}>Kebijakan Privasi</Link> PT. IBRA Global English.
              </span>
            </label>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => handleCheckout("xendit")}
                disabled={Boolean(loadingGateway)}
                style={{ width: "100%", padding: "0.9rem 1rem", borderRadius: "12px", border: "none", backgroundColor: "#216c7e", color: "#ffffff", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer" }}
              >
                {loadingGateway === "xendit" ? "Memproses Invoice Xendit..." : "Bayar Sekarang via Xendit (QRIS / Virtual Account)"}
              </button>
              <button
                type="button"
                onClick={() => handleCheckout("midtrans")}
                disabled={Boolean(loadingGateway)}
                style={{ width: "100%", padding: "0.9rem 1rem", borderRadius: "12px", border: "1px solid #216c7e", backgroundColor: "#ffffff", color: "#216c7e", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer" }}
              >
                {loadingGateway === "midtrans" ? "Memproses Sesi Midtrans..." : "Bayar Sekarang via Midtrans (QRIS / Virtual Account)"}
              </button>
            </div>

            <div className="selectable" style={{ marginTop: "1.25rem", padding: "0.9rem", borderRadius: "10px", backgroundColor: "#f5f5f7", fontSize: "0.78rem", color: "#59616e", lineHeight: 1.5 }}>
              <strong>Alternatif Transfer Bank Manual:</strong><br />
              Bank {bankName} · No. Rek: <strong>{accountNumber}</strong> a.n. <strong>{accountName}</strong>.<br />
              Konfirmasi otomatis 24 jam tersedia di <Link href="/login" style={{ color: "#216c7e", fontWeight: 700 }}>Portal Orang Tua</Link>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
