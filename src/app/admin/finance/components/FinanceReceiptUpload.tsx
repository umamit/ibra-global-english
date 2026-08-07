"use client";

import React from "react";

interface FinanceReceiptUploadProps {
  modalReceiptUrl: string;
  setModalReceiptUrl: (val: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleUploadReceipt: React.ChangeEventHandler<HTMLInputElement>;
}

export default function FinanceReceiptUpload({
  modalReceiptUrl,
  setModalReceiptUrl,
  fileInputRef,
  handleUploadReceipt,
}: FinanceReceiptUploadProps) {
  return (
    <div style={{ borderTop: "1px solid var(--color-gray-100)", paddingTop: "1rem" }}>
      <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "var(--color-gray-700)", display: "block", marginBottom: "0.5rem" }}>
        Berkas Bukti Transfer (Receipt)
      </label>

      {modalReceiptUrl ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ width: "100%", maxHeight: "160px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--color-gray-200)", display: "flex", justifyContent: "center", background: "#f8fafc" }}>
            <img src={modalReceiptUrl} alt="Bukti Transfer" style={{ maxHeight: "160px", objectFit: "contain" }} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <a
              href={modalReceiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-portal-outline"
              style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", textAlign: "center", flex: 1 }}
            >
              Buka Gambar Penuh ↗
            </a>
            <button
              type="button"
              onClick={() => setModalReceiptUrl("")}
              className="btn-portal-danger"
              style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
            >
              Hapus Berkas
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "1.5rem", border: "2px dashed var(--color-gray-200)", borderRadius: "8px", background: "var(--color-gray-50)", cursor: "pointer" }} onClick={() => fileInputRef.current?.click()}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "0.5rem" }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", fontWeight: "600" }}>Pilih berkas foto bukti pembayaran</span>
          <span style={{ fontSize: "0.7rem", color: "var(--color-gray-400)", marginTop: "2px" }}>Format PNG/JPG/JPEG maks. 5MB</span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUploadReceipt}
            accept="image/*"
            style={{ display: "none" }}
          />
        </div>
      )}
    </div>
  );
}
