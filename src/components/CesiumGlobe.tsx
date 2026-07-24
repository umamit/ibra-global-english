"use client";

import React, { useEffect, useRef, useState } from "react";
import "./CesiumGlobe.css";

// Koordinat Bobong, Kabupaten Pulau Taliabu, Maluku Utara
const BOBONG_LON = 124.3831;
const BOBONG_LAT = -1.8617;

export default function CesiumGlobe() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingText, setLoadingText] = useState("Memuat Peta Satelit 3D CesiumJS...");

  useEffect(() => {
    let isMounted = true;

    // Load Cesium.js CSS CDN jika belum ada
    if (!document.getElementById("cesium-css")) {
      const link = document.createElement("link");
      link.id = "cesium-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/cesium/1.119.0/Widgets/widgets.css";
      document.head.appendChild(link);
    }

    // Load Cesium.js Script CDN jika belum ada
    const loadCesiumScript = () => {
      return new Promise<void>((resolve, reject) => {
        if ((window as any).Cesium) {
          resolve();
          return;
        }

        const existingScript = document.getElementById("cesium-script");
        if (existingScript) {
          existingScript.addEventListener("load", () => resolve());
          return;
        }

        const script = document.createElement("script");
        script.id = "cesium-script";
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/cesium/1.119.0/Cesium.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Gagal memuat CesiumJS CDN"));
        document.body.appendChild(script);
      });
    };

    loadCesiumScript()
      .then(() => {
        if (!isMounted || !containerRef.current) return;
        const Cesium = (window as any).Cesium;
        if (!Cesium) return;

        // Nonaktifkan Ion token warning
        Cesium.Ion.defaultAccessToken = "";

        // Provider Citra Satelit Foto Realistis (Esri World Imagery)
        const imageryProvider = new Cesium.UrlTemplateImageryProvider({
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          credit: "Esri World Imagery",
          maximumLevel: 18,
        });

        // 1. Inisialisasi Cesium Viewer dalam mode clean
        const viewer = new Cesium.Viewer(containerRef.current, {
          imageryProvider: imageryProvider,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          navigationHelpButton: false,
          sceneModePicker: false,
          selectionIndicator: false,
          timeline: false,
          animation: false,
          fullscreenButton: false,
          vrButton: false,
          useBrowserRecommendedResolution: true,
          creditContainer: document.createElement("div"), // Menyembunyikan teks kredit default
        });

        viewerRef.current = viewer;

        // Paksa resize viewport agar canvas mengisi 100% penuh kontainer
        viewer.forceResize();
        window.dispatchEvent(new Event("resize"));

        // 2. Tambahkan Pin 3D Emas Menyala di Bobong, Pulau Taliabu
        const bobongLocation = Cesium.Cartesian3.fromDegrees(BOBONG_LON, BOBONG_LAT, 0);

        viewer.entities.add({
          position: bobongLocation,
          point: {
            pixelSize: 14,
            color: Cesium.Color.fromCssColorString("#A68849"),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 3,
          },
          label: {
            text: "📍 Ibra Global English\nBobong, Pulau Taliabu",
            font: "bold 13px system-ui, -apple-system, sans-serif",
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.fromCssColorString("#164d57"),
            outlineWidth: 4,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -18),
            backgroundColor: Cesium.Color.fromCssColorString("rgba(33, 108, 126, 0.85)"),
            showBackground: true,
            backgroundPadding: new Cesium.Cartesian2(8, 6),
          },
        });

        // 3. Atur Posisi Kamera Awal di Luar Angkasa (Global Earth Overview)
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(118.0, -2.0, 12000000.0),
        });

        setIsLoaded(true);

        // Resize ulang secara aman setelah beberapa frame render
        requestAnimationFrame(() => {
          if (viewerRef.current) {
            viewerRef.current.forceResize();
          }
        });

        // 4. Animasi Fly-To Meluncur Terbang dari Luar Angkasa ke Bobong
        setTimeout(() => {
          if (!isMounted || !viewerRef.current) return;
          viewerRef.current.forceResize();
          viewerRef.current.flyTo(viewerRef.current.entities, {
            duration: 3.5,
            offset: new Cesium.HeadingPitchRange(
              Cesium.Math.toRadians(0),
              Cesium.Math.toRadians(-45),
              25000
            ),
          });
        }, 600);
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) {
          setLoadingText("Terjadi kendala memuat peta 3D. Silakan coba muat ulang.");
        }
      });

    return () => {
      isMounted = false;
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // Fungsi Tombol Terbang Kembali ke Bobong
  const handleFlyToBobong = () => {
    if (!viewerRef.current) return;
    const Cesium = (window as any).Cesium;
    if (!Cesium) return;

    viewerRef.current.forceResize();
    viewerRef.current.flyTo(viewerRef.current.entities, {
      duration: 2.5,
      offset: new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(0),
        Cesium.Math.toRadians(-45),
        25000
      ),
    });
  };

  return (
    <div className="cesium-globe-wrapper">
      {/* Floating Location Badge */}
      <div className="cesium-badge">
        <div className="cesium-badge-dot" />
        <span>🌏 Peta Satelit Asli: Bobong, Pulau Taliabu</span>
      </div>

      {/* Fly-To Action Button */}
      {isLoaded && (
        <button type="button" className="cesium-flyto-btn" onClick={handleFlyToBobong}>
          <span>🎯 Terbang ke Bobong</span>
        </button>
      )}

      {/* Loading Overlay */}
      {!isLoaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 15,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.9)",
            color: "var(--color-primary-dark, #164d57)",
            fontWeight: 700,
            fontSize: "0.95rem",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              border: "3.5px solid rgba(33, 108, 126, 0.2)",
              borderTopColor: "var(--color-primary, #216c7e)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <span>{loadingText}</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="cesium-canvas-container" />
    </div>
  );
}
