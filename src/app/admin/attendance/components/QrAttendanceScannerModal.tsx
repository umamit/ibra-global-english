"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import styles from "./qrScannerModal.module.css";

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

const KNOWN_STAFF = [
  { id: "bbf5bbd7-17bf-4f14-9007-87068a0725f7", name: "Husnita Usman", role: "Direktur & Tutor Utama" },
  { id: "f14fc6e3-644f-4df6-913e-d353597c6e5e", name: "Anhar Ekho Sulasmin Umamit", role: "Admin Finance" },
  { id: "38481803-b572-475f-bbf1-b40ed4d2dcd1", name: "Anhar", role: "Staff Admin" },
];

export default function QrAttendanceScannerModal({
  isOpen,
  onClose,
  students,
  onScanSuccess,
}: QrAttendanceScannerModalProps) {
  const [scanMessage, setScanMessage] = useState<{ type: "success" | "warning" | "error"; text: string } | null>(null);
  const [lastScannedId, setLastScannedId] = useState<string>("");
  const [needPermission, setNeedPermission] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const scannerRef = useRef<Html5Qrcode | null>(null);

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

  const requestCameraAccess = async () => {
    setNeedPermission(false);
    await startScanner();
  };

  const startScanner = async () => {
    const container = document.getElementById("qr-reader-container");
    if (!container) return;

    try {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          scannerRef.current.clear();
        } catch {}
      }

      const html5QrCode = new Html5Qrcode("qr-reader-container", { verbose: false });
      scannerRef.current = html5QrCode;

      let cameraConfig: any = { facingMode: "environment" };
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          const backCam = cameras.find((c) =>
            c.label.toLowerCase().includes("back") ||
            c.label.toLowerCase().includes("rear") ||
            c.label.toLowerCase().includes("environment") ||
            c.label.toLowerCase().includes("0")
          ) || cameras[cameras.length - 1];
          if (backCam) {
            cameraConfig = backCam.id;
          }
        }
      } catch {}

      await html5QrCode.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minSize = Math.min(viewfinderWidth, viewfinderHeight);
            const qrSize = Math.floor(minSize * 0.82);
            return { width: qrSize, height: qrSize };
          },
        },
        async (decodedText) => {
          const cleanId = decodedText.trim();
          if (!cleanId) return;

          if (cleanId === lastScannedId) return;
          setLastScannedId(cleanId);
          setTimeout(() => setLastScannedId(""), 3000);

          playBeep();

          // 1. Check Student List
          const student = students.find((s) => s.id === cleanId || cleanId.includes(s.id));
          if (student) {
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
            setTimeout(() => setScanMessage(null), 2500);
            return;
          }

          // 2. Check Tutor / Staff List
          const staff = KNOWN_STAFF.find((st) => st.id === cleanId || cleanId.includes(st.id));
          if (staff) {
            setScanMessage({
              type: "success",
              text: `👋 Halo ${staff.name}! Terdaftar sebagai ${staff.role}.`,
            });
            setTimeout(() => setScanMessage(null), 3000);
            return;
          }

          setScanMessage({
            type: "warning",
            text: `Kode QR (${cleanId.substring(0, 8)}...) tidak terdaftar di sistem.`,
          });
          setTimeout(() => setScanMessage(null), 2500);
        },
        () => {}
      );
      setNeedPermission(false);
      setScanMessage(null);
    } catch (err: any) {
      setNeedPermission(true);
      setScanMessage({
        type: "error",
        text: "Kamera HP belum aktif: Klik tombol 'Izinkan Akses Kamera HP' di bawah.",
      });
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const timer = setTimeout(() => {
      if (isMounted) startScanner();
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
    <div className={styles.overlay}>
      <style>{`
        #qr-reader-container video {
          transform: rotate(${rotation}deg) !important;
          object-fit: cover !important;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        #qr-reader-container, #qr-reader-container__scan_region { border: none !important; }
      `}</style>

      <div className={styles.modalCard}>
        {/* Header */}
        <div className={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", backgroundColor: "rgba(255, 255, 255, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "800", color: "#fff" }}>Scan QR Absensi Siswa & Tutor</h3>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.75)", fontWeight: "500" }}>Ibra Global English AI Scanner</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: "800", padding: "0.2rem 0.5rem", borderRadius: "9999px", backgroundColor: "rgba(16, 185, 129, 0.2)", color: "#34d399", border: "1px solid rgba(52, 211, 153, 0.3)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span className={styles.liveDot} />
              LIVE
            </span>
            <button type="button" onClick={handleSafeClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", cursor: "pointer", padding: "0.35rem", borderRadius: "50%", display: "flex" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* Status Toast Banner */}
        {scanMessage && (
          <div className={scanMessage.type === "success" ? styles.toastSuccess : scanMessage.type === "warning" ? styles.toastWarning : styles.toastError}>
            {scanMessage.text}
          </div>
        )}

        {/* Camera Viewfinder */}
        <div style={{ padding: "1.25rem", textAlign: "center", position: "relative" }}>
          <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", backgroundColor: "#090d16", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
            <div id="qr-reader-container" style={{ width: "100%", minHeight: "280px" }} />
            <div className={styles.laserLine} />
          </div>

          {needPermission && (
            <button type="button" onClick={requestCameraAccess} className="btn-portal-primary" style={{ marginTop: "1rem", width: "100%", justifyContent: "center", borderRadius: "12px", padding: "0.75rem" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.4rem" }}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
              <span>Izinkan Akses Kamera HP</span>
            </button>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", gap: "0.5rem" }}>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.65)", fontWeight: "500", textAlign: "left", lineHeight: "1.3" }}>
              Arahkan kamera ke QR Code ID Card Siswa atau Tutor.
            </p>
            <button
              type="button"
              onClick={() => setRotation((r) => (r === 0 ? 180 : 0))}
              style={{
                padding: "0.35rem 0.75rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem", flexShrink: 0,
                backgroundColor: "rgba(255, 255, 255, 0.1)", color: "#fff", border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "10px", cursor: "pointer", fontWeight: "700", transition: "all 0.2s ease",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6"/><path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>Putar 180°</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "0.75rem 1.25rem 1.25rem", display: "flex", justifyContent: "flex-end", backgroundColor: "rgba(0, 0, 0, 0.2)" }}>
          <button type="button" onClick={handleSafeClose} style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", fontWeight: "700", borderRadius: "12px", backgroundColor: "rgba(255, 255, 255, 0.12)", color: "#fff", border: "1px solid rgba(255, 255, 255, 0.2)", cursor: "pointer" }}>
            Selesai Scan
          </button>
        </div>
      </div>
    </div>
  );
}
