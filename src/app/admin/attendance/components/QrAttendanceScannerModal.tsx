"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface Student {
  id: string;
  name: string;
  program: string;
}

interface QrAttendanceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onScanSuccess: (studentId: string) => Promise<{ success: boolean; message: string; studentName?: string }>;
}

export default function QrAttendanceScannerModal({
  isOpen,
  onClose,
  students,
  onScanSuccess,
}: QrAttendanceScannerModalProps) {
  const [scanMessage, setScanMessage] = useState<{ type: "success" | "warning" | "error"; text: string } | null>(null);
  const [lastScannedId, setLastScannedId] = useState<string>("");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Safe Audio Beep
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  };

  const handleSafeClose = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const timer = setTimeout(() => {
      if (!isMounted) return;
      const container = document.getElementById("qr-reader-container");
      if (!container) return;

      try {
        const html5QrCode = new Html5Qrcode("qr-reader-container");
        scannerRef.current = html5QrCode;

        html5QrCode
          .start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 220, height: 220 } },
            async (decodedText) => {
              if (!isMounted) return;
              const cleanId = decodedText.trim();
              if (!cleanId) return;

              if (cleanId === lastScannedId) return;
              setLastScannedId(cleanId);
              setTimeout(() => setLastScannedId(""), 3000);

              playBeep();

              const student = students.find((s) => s.id === cleanId || cleanId.includes(s.id));
              if (!student) {
                setScanMessage({
                  type: "warning",
                  text: `Kode QR (${cleanId.substring(0, 8)}...) tidak cocok dengan ID siswa.`,
                });
                return;
              }

              const res = await onScanSuccess(student.id);
              if (res.success) {
                setScanMessage({
                  type: "success",
                  text: `✅ ${student.name} (${student.program}) - HADIR!`,
                });
              } else {
                setScanMessage({
                  type: "warning",
                  text: res.message || `${student.name} sudah tercatat.`,
                });
              }

              setTimeout(() => {
                if (isMounted) setScanMessage(null);
              }, 2500);
            },
            () => {}
          )
          .catch((err) => {
            if (isMounted) {
              setScanMessage({
                type: "error",
                text: "Kamera tidak aktif: " + (err?.message || "Izin kamera diperlukan."),
              });
            }
          });
      } catch {}
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch {}
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
    }}>
      <div style={{
        backgroundColor: "#ffffff", borderRadius: "18px", width: "100%", maxWidth: "420px",
        overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", border: "1px solid rgba(0, 0, 0, 0.08)",
      }}>
        {/* Modal Header */}
        <div style={{
          padding: "1rem 1.25rem", backgroundColor: "var(--color-primary)", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "700" }}>Scan QR Absensi Siswa</h3>
          </div>
          <button type="button" onClick={handleSafeClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: "0.25rem", borderRadius: "50%", display: "flex" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Status Toast Notification */}
        {scanMessage && (
          <div style={{
            padding: "0.75rem 1rem", fontSize: "0.85rem", fontWeight: "700", textAlign: "center",
            backgroundColor: scanMessage.type === "success" ? "#f0fdf4" : scanMessage.type === "warning" ? "#fffbeb" : "#fef2f2",
            color: scanMessage.type === "success" ? "#166534" : scanMessage.type === "warning" ? "#92400e" : "#991b1b",
            borderBottom: `1px solid ${scanMessage.type === "success" ? "#bbf7d0" : scanMessage.type === "warning" ? "#fde68a" : "#fecaca"}`,
          }}>
            {scanMessage.text}
          </div>
        )}

        {/* Camera Container */}
        <div style={{ padding: "1.25rem", textAlign: "center" }}>
          <div id="qr-reader-container" style={{ width: "100%", minHeight: "260px", borderRadius: "12px", overflow: "hidden", backgroundColor: "#000" }} />
          <p style={{ margin: "0.75rem 0 0", fontSize: "0.8rem", color: "var(--color-gray-500)", fontWeight: "500" }}>
            Arahkan kamera ke QR Code pada kartu ID Card siswa. Presensi tercatat otomatis hands-free!
          </p>
        </div>

        {/* Footer */}
        <div style={{ padding: "0.75rem 1.25rem 1.25rem", display: "flex", justifyContent: "flex-end" }}>
          <button type="button" onClick={handleSafeClose} className="btn-portal-outline" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
            Selesai Scan
          </button>
        </div>
      </div>
    </div>
  );
}
