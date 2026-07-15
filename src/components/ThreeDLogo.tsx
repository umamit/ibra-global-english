"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function ThreeDLogo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;

    let width = container.clientWidth || 50;
    let height = container.clientHeight || 50;

    const scene = new THREE.Scene();
    
    // Position camera with low field of view for high flat detail
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 10);
    camera.position.z = 3.2;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Load brand logo PNG (supports transparency)
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("/assets/logo.png", () => {
      setLoaded(true);
    });

    // Create a flat double-sided transparent plane to show only the logo letters/graphics
    const geometry = new THREE.PlaneGeometry(1.6, 1.6);

    const logoMaterial = new THREE.MeshPhysicalMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 0.15,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const mesh = new THREE.Mesh(geometry, logoMaterial);
    scene.add(mesh);

    // Warm ambient lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    // Dual specular directional lights (front & back) to sweep reflection shine
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(3, 3, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight2.position.set(-3, -3, -5);
    scene.add(dirLight2);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();

      // 1. Soft vertical floating motion (always active)
      mesh.position.y = Math.sin(time * 1.5) * 0.05;
      
      // 2. Subtle organic Z-axis tilt
      mesh.rotation.z = Math.sin(time * 0.5) * 0.02;

      // 3. Periodic Y-axis spin every 5 seconds (lasts 1.8 seconds)
      const spinDuration = 1.8;
      const cycleDuration = 5.0;
      const progress = time % cycleDuration;

      if (progress < spinDuration) {
        const t = progress / spinDuration;
        // Ease-in-out smooth transition curve
        const ease = t * t * (3 - 2 * t);
        mesh.rotation.y = ease * Math.PI * 2;

        // Dynamic light sweep to simulate high-end glass glare reflections
        dirLight1.position.x = -4 + ease * 8;
        dirLight2.position.x = 4 - ease * 8;
      } else {
        mesh.rotation.y = 0;
        dirLight1.position.x = 3;
        dirLight2.position.x = -3;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth || 50;
      const newHeight = containerRef.current.clientHeight || 50;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    // Keep size in sync when parent header dimensions scale on scroll
    const sizeSyncInterval = setInterval(handleResize, 200);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      clearInterval(sizeSyncInterval);
      geometry.dispose();
      logoMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Fallback Static Image */}
      <img
        src="/assets/logo.png"
        alt="Ibra Global English Logo"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          position: "absolute",
          top: 0,
          left: 0,
          opacity: loaded ? 0 : 1,
          transition: "opacity 0.4s ease",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: loaded ? "block" : "none",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 2,
        }}
      />
    </div>
  );
}
