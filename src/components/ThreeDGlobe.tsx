"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import "./ThreeDGlobe.css";

// Latitude & Longitude Bobong, Pulau Taliabu, Maluku Utara
const BOBONG_LAT = -1.86;
const BOBONG_LON = 124.38;

export default function ThreeDGlobe() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 400;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 240;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group to hold globe objects for rotation
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const radius = 80;

    // 4. Globe Sphere Wireframe (Brand Primary Teal #216c7e)
    const sphereGeometry = new THREE.SphereGeometry(radius, 36, 36);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x216c7e,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const wireframeSphere = new THREE.Mesh(sphereGeometry, wireframeMaterial);
    globeGroup.add(wireframeSphere);

    // Inner Glass Core Sphere
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: 0x164d57,
      emissive: 0x0a262c,
      specular: 0x216c7e,
      shininess: 40,
      transparent: true,
      opacity: 0.7,
    });
    const coreSphere = new THREE.Mesh(sphereGeometry, coreMaterial);
    globeGroup.add(coreSphere);

    // Atmosphere Glow Outer Ring
    const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.15, 32, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x216c7e,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.1,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // 5. Partikel Emas untuk Benua & Titik-Titik Global (#A68849)
    const dotsCount = 1200;
    const dotsPositions = new Float32Array(dotsCount * 3);
    const goldColor = new THREE.Color(0xa68849);

    for (let i = 0; i < dotsCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / dotsCount);
      const theta = Math.sqrt(dotsCount * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      dotsPositions[i * 3] = x;
      dotsPositions[i * 3 + 1] = y;
      dotsPositions[i * 3 + 2] = z;
    }

    const dotsGeometry = new THREE.BufferGeometry();
    dotsGeometry.setAttribute("position", new THREE.BufferAttribute(dotsPositions, 3));

    const dotsMaterial = new THREE.PointsMaterial({
      color: goldColor,
      size: 1.8,
      transparent: true,
      opacity: 0.85,
    });
    const dotsParticles = new THREE.Points(dotsGeometry, dotsMaterial);
    globeGroup.add(dotsParticles);

    // 6. Konversi Koordinat Bobong (-1.86° S, 124.38° E) ke Kartesian 3D
    const latRad = (BOBONG_LAT * Math.PI) / 180;
    const lonRad = ((BOBONG_LON - 90) * Math.PI) / 180;

    const pinX = radius * Math.cos(latRad) * Math.sin(lonRad);
    const pinY = radius * Math.sin(latRad);
    const pinZ = radius * Math.cos(latRad) * Math.cos(lonRad);

    // Pin Beacon Cone (Gold Glow #A68849)
    const pinGroup = new THREE.Group();
    pinGroup.position.set(pinX, pinY, pinZ);

    // Arahkan pin keluar dari pusat bola
    pinGroup.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(pinX, pinY, pinZ).normalize()
    );

    const pinConeGeo = new THREE.ConeGeometry(3, 14, 16);
    pinConeGeo.translate(0, 7, 0);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0xa68849 });
    const pinMesh = new THREE.Mesh(pinConeGeo, pinMat);
    pinGroup.add(pinMesh);

    // Spherical Beacon Top Light
    const topLightGeo = new THREE.SphereGeometry(3.5, 16, 16);
    topLightGeo.translate(0, 14, 0);
    const topLightMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const topLightMesh = new THREE.Mesh(topLightGeo, topLightMat);
    pinGroup.add(topLightMesh);

    // Pulsing Ring Beacon at base
    const ringGeo = new THREE.RingGeometry(2, 6, 32);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa68849,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    pinGroup.add(ringMesh);

    globeGroup.add(pinGroup);

    // Initial Rotation supaya Bobong langsung menghadap ke depan saat awal muat
    globeGroup.rotation.y = -lonRad + Math.PI / 4;
    globeGroup.rotation.x = -latRad;

    // 7. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x216c7e, 1.5);
    dirLight1.position.set(200, 200, 200);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa68849, 1.2);
    dirLight2.position.set(-200, -200, -200);
    scene.add(dirLight2);

    // 8. Interaction: Drag to Rotate & Auto-Rotate
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let animationFrameId: number;
    let pulseScale = 1;
    let pulseGrowing = true;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      previousMousePosition = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousMousePosition.x;
      const deltaY = clientY - previousMousePosition.y;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;

      previousMousePosition = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener("mousedown", onPointerDown);
    domEl.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    domEl.addEventListener("touchstart", onPointerDown, { passive: true });
    domEl.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);

    // Responsive Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Render Animation Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotasi halus saat idle (tidak di-drag)
      if (!isDragging) {
        globeGroup.rotation.y += 0.0025;
      }

      // Animasi Cincin Pulsasi Beacon Bobong
      if (pulseGrowing) {
        pulseScale += 0.015;
        if (pulseScale >= 1.6) pulseGrowing = false;
      } else {
        pulseScale -= 0.015;
        if (pulseScale <= 0.9) pulseGrowing = true;
      }
      ringMesh.scale.set(pulseScale, pulseScale, pulseScale);
      (ringMat as THREE.MeshBasicMaterial).opacity = 1.6 - pulseScale;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      domEl.removeEventListener("mousedown", onPointerDown);
      domEl.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      domEl.removeEventListener("touchstart", onPointerDown);
      domEl.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);

      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }

      sphereGeometry.dispose();
      wireframeMaterial.dispose();
      coreMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      dotsGeometry.dispose();
      dotsMaterial.dispose();
      pinConeGeo.dispose();
      pinMat.dispose();
      topLightGeo.dispose();
      topLightMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="globe-3d-wrapper">
      {/* Location Badge */}
      <div className="globe-badge">
        <div className="globe-badge-dot" />
        <span>📍 Bobong, Pulau Taliabu, Maluku Utara</span>
      </div>

      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="globe-canvas-container" />

      {/* Hint */}
      <div className="globe-footer-hint">
        🌐 Putar Globe 360°
      </div>
    </div>
  );
}
