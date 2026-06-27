"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";

export default function PostHogTestPage() {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [distinctId, setDistinctId] = useState("");
  const posthog = usePostHog();

  useEffect(() => {


    let cancelled = false;


    const load = async () => {


      if (cancelled) return;


      setMounted(true);


    };


    load();


    return () => {


      cancelled = true;


    };


  }, []);

  // Memeriksa dan menampilkan Distinct ID pengguna dari PostHog setelah terhubung
  useEffect(() => {
    if (mounted && posthog) {
      const interval = setInterval(() => {
        const id = posthog.get_distinct_id();
        if (id) {
          setDistinctId(id);
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [mounted, posthog]);

  const handleCaptureEvent = () => {
    if (!posthog) {
      setStatus("Error: PostHog client belum terinisialisasi");
      return;
    }

    try {
      setStatus("Mengirim event...");
      // Memicu pengiriman event kustom sesuai permintaan user
      posthog.capture("my_custom_event", {
        property: "value",
        timestamp: new Date().toISOString(),
        tested_from: "PostHog Test Page",
      });
      setStatus("Event 'my_custom_event' sukses terkirim! Silakan periksa tab 'Live Events' pada dashboard PostHog.");
    } catch (error) {
      setStatus(`Gagal mengirim event: ${error.message}`);
    }
  };

  if (!mounted) {
    return null; // Mencegah kesalahan hidrasi SSR
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 selection:bg-blue-500 selection:text-slate-950">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect hiasan latar belakang */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
              PostHog Integration Test
            </h1>
          </div>

          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Halaman ini digunakan untuk menguji integrasi event kustom PostHog. Klik tombol di bawah untuk memicu pengiriman event kustom.
          </p>

          {distinctId && (
            <div className="mb-6 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg text-xs font-mono text-slate-400 break-words">
              <span className="text-slate-500 block uppercase tracking-wider mb-1 font-semibold">PostHog Distinct ID:</span>
              {distinctId}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleCaptureEvent}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/15 active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              Kirim Kustom Event ke PostHog
            </button>
          </div>

          {status && (
            <div className="mt-6 p-4 bg-slate-950/80 border border-slate-800 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                Status Event:
              </p>
              <p className={`text-sm ${status.includes("sukses") ? "text-green-400" : "text-blue-400"} break-words`}>
                {status}
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition-colors">
              ← Kembali ke Beranda
            </Link>
            <span>Ibra Global English</span>
          </div>
        </div>
      </div>
    </div>
  );
}
