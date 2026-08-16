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
          const cleanText = (decodedText || "").trim();
          if (!cleanText) return;

          const uuidMatch = cleanText.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
          const targetId = uuidMatch ? uuidMatch[0].toLowerCase() : cleanText.toLowerCase();

          if (targetId === lastScannedId) return;
          setLastScannedId(targetId);
          setTimeout(() => setLastScannedId(""), 2000);

          playBeep();

          // 1. Check Student List (case-insensitive UUID substring matching)
          const student = students.find((s) => s.id.toLowerCase() === targetId || targetId.includes(s.id.toLowerCase()) || s.id.toLowerCase().includes(targetId));
          if (student) {
            const res = await onScanSuccess(student.id);
            if (res.success) {
              setScanMessage({
                type: "success",
                text: `[OK] ${res.message || `${student.name} (${student.program}) - HADIR!`}`,
              });
            } else {
              setScanMessage({
                type: "warning",
                text: res.message || `${student.name} sudah tercatat.`,
              });
            }
            setTimeout(() => setScanMessage(null), 3000);
            return;
          }

          // 2. Check Tutor / Staff List
          const staff = KNOWN_STAFF.find((st) => st.id.toLowerCase() === targetId || targetId.includes(st.id.toLowerCase()) || st.id.toLowerCase().includes(targetId));
          if (staff) {
            setScanMessage({
              type: "success",
              text: `Halo ${staff.name}! Terdaftar sebagai ${staff.role}.`,
            });
            setTimeout(() => setScanMessage(null), 3000);
            return;
          }

          setScanMessage({
            type: "warning",
            text: `Kode QR (${cleanText.substring(0, 12)}...) tidak terdaftar di sistem.`,
          });
          setTimeout(() => setScanMessage(null), 3000);
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
      if (isMounted) {
        startScanner();
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop();
          }
          scannerRef.current.clear();
        } catch {}
        scannerRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleSafeClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderTitle}>
            <span className={styles.modalHeaderIcon}>📷</span>
            <h3>Pemindai Presensi QR Code</h3>
          </div>
          <button className={styles.modalCloseBtn} onClick={handleSafeClose}>
            ✕
          </button>
        </div>

        <div className={styles.scannerViewport}>
          <div id="qr-reader-container" className={styles.qrReaderContainer} />
          {needPermission && (
            <div className={styles.permissionOverlay}>
              <p>Membutuhkan Izin Akses Kamera</p>
              <button className="btn-portal-primary" onClick={requestCameraAccess}>
                Izinkan Akses Kamera HP
              </button>
            </div>
          )}
        </div>

        {scanMessage && (
          <div
            className={
              scanMessage.type === "success"
                ? styles.statusSuccess
                : scanMessage.type === "warning"
                ? styles.statusWarning
                : styles.statusError
            }
          >
            {scanMessage.text}
          </div>
        )}

        <div className={styles.modalFooter}>
          <p className={styles.helpText}>
            Arahkan kamera ke Kartu Siswa atau Kode QR HP. Presensi akan langsung tercatat secara otomatis.
          </p>
          <button className="btn-portal-secondary" onClick={handleSafeClose}>
            Tutup Pemindai
          </button>
        </div>
      </div>
    </div>
  );
}
