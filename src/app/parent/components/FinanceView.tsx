"use client";

import React from "react";

interface SelectedChild {
  program?: string;
  name?: string;
}

interface PaymentSettings {
  payment_bank_name?: string;
  payment_account_number?: string;
  payment_account_name?: string;
  payment_account_sub?: string;
}

interface Payment {
  id?: string;
  month: string;
  amount: number | string;
  status: string;
  receipt_url?: string;
}

interface FinanceViewProps {
  selectedChild: SelectedChild | null;
  paymentSettings: PaymentSettings;
  parentPayments: Payment[];
  uploadingReceipt: boolean;
  getChildProgramPrice: (program?: string) => number;
  getMonthName: (month: string) => string;
  handleUploadReceipt: (e: React.ChangeEvent<HTMLInputElement>, month: string) => void;
  triggerPrintReceipt: (pay: Payment) => void;
  detailsLoading: boolean;
}

export default function FinanceView({
  selectedChild,
  paymentSettings,
  parentPayments,
  uploadingReceipt,
  getChildProgramPrice,
  getMonthName,
  handleUploadReceipt,
  triggerPrintReceipt,
  detailsLoading
}: FinanceViewProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      {/* Bank Transfer Guide */}
      <div className="portal-card" style={{ borderLeft: "5px solid var(--color-accent)", background: "linear-gradient(135deg, rgba(166, 136, 73, 0.05) 0%, rgba(255,255,255,0) 100%)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)" }}>Panduan Transfer Pembayaran SPP</h3>
            <p style={{ color: "var(--color-gray-600)", fontSize: "0.875rem", marginTop: "4px" }}>
              Pembayaran SPP sebesar <strong>Rp {getChildProgramPrice(selectedChild?.program).toLocaleString("id-ID")} / bulan</strong> paling lambat tanggal 10 setiap bulannya.
            </p>
          </div>
          <div style={{ padding: "0.5rem 1rem", backgroundColor: "var(--color-accent-light)", color: "var(--color-accent)", borderRadius: "8px", fontWeight: "700", fontSize: "0.875rem" }}>
            Nominal: Rp {getChildProgramPrice(selectedChild?.program).toLocaleString("id-ID")}
          </div>
        </div>

        <div className="bank-transfer-box">
          <div className="bank-item">
            <div className="bank-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)", letterSpacing: "0.05em" }}>Rekening Pembayaran</p>
              <p style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--color-gray-900)", marginTop: "2px" }}>{paymentSettings.payment_bank_name || "Bank Mandiri"}</p>
              <p style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--color-primary-dark)" }}>{paymentSettings.payment_account_number || "137-00-1234567-8"}</p>
            </div>
          </div>

          <div className="bank-item">
            <div className="bank-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)", letterSpacing: "0.05em" }}>Atas Nama Rekening</p>
              <p style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--color-gray-900)", marginTop: "2px" }}>{paymentSettings.payment_account_name || "Ibra Global English"}</p>
              <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>{paymentSettings.payment_account_sub || "Bobong Learning Centre"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly list with real-time status & uploader */}
      <div className="portal-card">
        <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.5rem" }}>
          Pelacakan & Administrasi SPP Bulanan
        </h3>

        {detailsLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="receipt-row">
                <div>
                  <div className="skeleton-pulse skeleton-title" style={{ width: "120px", marginBottom: "0.5rem" }} />
                  <div className="skeleton-pulse skeleton-text" style={{ width: "150px" }} />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.5rem" }}>
                  <div className="skeleton-pulse skeleton-text" style={{ width: "100px" }} />
                  <div className="skeleton-pulse skeleton-text" style={{ width: "80px" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {getRecentMonths().map((month) => {
              const dbPay = parentPayments.find(p => p.month === month);
              const pay: Payment = dbPay ? {
                ...dbPay,
                amount: dbPay.status === "belum_bayar" ? getChildProgramPrice(selectedChild?.program) : dbPay.amount
              } : {
                month,
                amount: getChildProgramPrice(selectedChild?.program),
                status: "belum_bayar",
                receipt_url: ""
              };

              return (
                <div key={month} className="payment-tracker-row">
                  <div>
                    <p style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--color-gray-900)" }}>
                      {getMonthName(month)}
                    </p>
                    <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-500)", marginTop: "2px" }}>
                      Tagihan: Rp {parseInt(String(pay.amount)).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.25rem" }}>
                    {/* Status badge */}
                    <div>
                      {pay.status === "lunas" ? (
                        <span className="status-badge submitted" style={{ minWidth: "110px", justifyContent: "center" }}>LUNAS</span>
                      ) : pay.status === "menunggu_konfirmasi" ? (
                        <span className="status-badge pending" style={{ minWidth: "110px", justifyContent: "center" }}>KONFIRMASI</span>
                      ) : (
                        <span className="status-badge unpaid" style={{ minWidth: "110px", justifyContent: "center" }}>BELUM BAYAR</span>
                      )}
                    </div>

                    {/* Uploader / Receipt button */}
                    <div>
                      {pay.status === "belum_bayar" ? (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <label className="btn-portal-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer", display: "flex", gap: "0.4rem", alignItems: "center", margin: 0 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            <span>{uploadingReceipt ? "Mengunggah..." : "Unggah Bukti"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={(e) => handleUploadReceipt(e, month)}
                              disabled={uploadingReceipt}
                            />
                          </label>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          {pay.receipt_url && (
                            <a
                              href={pay.receipt_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-portal-outline"
                              style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", fontWeight: "600", textDecoration: "none" }}
                            >
                              Lihat Bukti ↗
                            </a>
                          )}
                          {pay.status === "lunas" && (
                            <button
                              onClick={() => triggerPrintReceipt(pay)}
                              className="btn-portal-primary"
                              style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", fontWeight: "700", display: "flex", gap: "0.3rem", alignItems: "center" }}
                              type="button"
                            >
                              <span>Cetak Kuitansi</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function getRecentMonths(): string[] {
  const list: string[] = [];
  const d = new Date();
  for (let i = 0; i < 6; i++) {
    const temp = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const mm = String(temp.getMonth() + 1).padStart(2, "0");
    const yyyy = temp.getFullYear();
    list.push(`${yyyy}-${mm}`);
  }
  return list;
}
