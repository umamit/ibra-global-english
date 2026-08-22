"use client";

import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import styles from "./qrScannerModal.module.css";
import { getAudioContext, playBeep, playVoiceGreeting } from "./qrAudioHelpers";

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
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const stopCamera = () => {
    if (controlsRef.current) {
      try { controlsRef.current.stop(); } catch {}
      controlsRef.current = null;
    }
  };

  const handleSafeClose = () => {
    stopCamera();
    onClose();
  };

  const toggleTorch = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];
    if (track && (track.getCapabilities() as any)?.torch) {
      const nextState = !isTorchOn;
      await (track as any).applyConstraints({ advanced: [{ torch: nextState }] });
      setIsTorchOn(nextState);
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    getAudioContext(audioCtxRef);
    let isMounted = true;
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    const startScanning = async () => {
      try {
        setNeedPermission(false);
        const videoElement = videoRef.current;
        if (!videoElement) return;

        const constraints: MediaStreamConstraints = { video: { facingMode: facingMode } };

        const controls = await reader.decodeFromConstraints(
          constraints,
          videoElement,
          async (result, error) => {
            if (!isMounted || !result) return;
            const cleanText = (result.getText() || "").trim();
            if (!cleanText) return;

            const uuidMatch = cleanText.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
            const targetId = uuidMatch ? uuidMatch[0].toLowerCase() : cleanText.toLowerCase();

            if (targetId === lastScannedId) return;
            setLastScannedId(targetId);
            setTimeout(() => setLastScannedId(""), 2000);

            // 1. Student Match
            const student = students.find((s) => s.id.toLowerCase() === targetId || targetId.includes(s.id.toLowerCase()) || s.id.toLowerCase().includes(targetId));
            if (student) {
              const res = await onScanSuccess(student.id);
              if (res.success) {
                await playBeep(audioCtxRef, "success");
                playVoiceGreeting(`Selamat datang, ${student.name}!`);
                setScanMessage({ type: "success", text: `[OK] ${res.message || `${student.name} (${student.program}) - HADIR!`}` });
              } else {
                await playBeep(audioCtxRef, "warning");
                playVoiceGreeting(`Ananda ${student.name} sudah tercatat presensi hari ini.`);
                setScanMessage({ type: "warning", text: res.message || `${student.name} sudah tercatat.` });
              }
              setTimeout(() => setScanMessage(null), 3000);
              return;
            }

            // 2. Staff Match
            const staff = KNOWN_STAFF.find((st) => st.id.toLowerCase() === targetId || targetId.includes(st.id.toLowerCase()) || st.id.toLowerCase().includes(targetId));
            if (staff) {
              await playBeep(audioCtxRef, "success");
              playVoiceGreeting(`Selamat datang, ${staff.name}!`);
              setScanMessage({ type: "success", text: `Halo ${staff.name}! Terdaftar sebagai ${staff.role}.` });
              setTimeout(() => setScanMessage(null), 3000);
              return;
            }

            await playBeep(audioCtxRef, "error");
            playVoiceGreeting("Kode QR tidak terdaftar.");
            setScanMessage({ type: "warning", text: `Kode QR (${cleanText.substring(0, 12)}...) tidak terdaftar di sistem.` });
            setTimeout(() => setScanMessage(null), 3000);
          }
        );

        controlsRef.current = controls;
      } catch (err) {
        if (isMounted) {
          setNeedPermission(true);
          setScanMessage({ type: "error", text: "Kamera HP belum aktif: Berikan izin akses kamera pada browser." });
        }
      }
    };

    const timer = setTimeout(startScanning, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopCamera();
    };
  }, [isOpen, facingMode, students, onScanSuccess, lastScannedId]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleSafeClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className={styles.liveDot} />
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "#fff" }}>Pemindai Presensi QR Code</h3>
          </div>
          <button type="button" onClick={handleSafeClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem" }} aria-label="Tutup">
            &times;
          </button>
        </div>

        {/* Message Toast */}
        {scanMessage && (
          <div className={scanMessage.type === "success" ? styles.toastSuccess : scanMessage.type === "warning" ? styles.toastWarning : styles.toastError}>
            {scanMessage.text}
          </div>
        )}

        {/* Video Viewport with Laser */}
        <div style={{ position: "relative", width: "100%", height: "280px", backgroundColor: "#000", overflow: "hidden" }}>
          <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div className={styles.laserLine} />

          {/* Floating Camera Controls */}
          <div style={{ position: "absolute", bottom: "12px", right: "12px", display: "flex", gap: "8px", zIndex: 20 }}>
            <button
              type="button"
              onClick={toggleTorch}
              title="Aktifkan Senter"
              style={{ padding: "6px 12px", borderRadius: "20px", backgroundColor: isTorchOn ? "#f59e0b" : "rgba(0,0,0,0.6)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontSize: "0.75rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>{isTorchOn ? "Senter ON" : "Senter OFF"}</span>
            </button>
            <button
              type="button"
              onClick={toggleFacingMode}
              title="Balik Kamera"
              style={{ padding: "6px 12px", borderRadius: "20px", backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontSize: "0.75rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
              <span>Balik Kamera</span>
            </button>
          </div>

          {needPermission && (
            <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem", textAlign: "center", color: "#fff", gap: "1rem" }}>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>Izin Kamera Diperlukan untuk Memindai Kartu Siswa.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "1rem 1.25rem", textAlign: "center", background: "rgba(15, 23, 42, 0.6)" }}>
          <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0 0 0.75rem 0" }}>
            Arahkan Kartu QR Fisik ke dalam bingkai kamera. Sistem akan berbunyi BEEP &amp; menyebutkan nama siswa secara otomatis.
          </p>
          <button type="button" className="btn-portal-secondary" onClick={handleSafeClose} style={{ width: "100%", padding: "0.6rem" }}>
            Tutup Pemindai
          </button>
        </div>
      </div>
    </div>
  );
}
