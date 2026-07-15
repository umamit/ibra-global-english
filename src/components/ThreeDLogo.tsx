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

    // Get current container size (which matches .logo-img classes dynamically)
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

    // Load brand logo PNG
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("/assets/logo.png", () => {
      setLoaded(true);
    });

    // Create a thin premium 3D plate
    const geometry = new THREE.BoxGeometry(1.6, 1.6, 0.08);

    // Glass material for the edges & back
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.9,
      ior: 1.5,
      thickness: 0.1,
    });

    // Logo material on the front face
    const logoMaterial = new THREE.MeshPhysicalMaterial({
      map: texture,
      transparent: true,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const materials = [
      glassMaterial, // Right
      glassMaterial, // Left
      glassMaterial, // Top
      glassMaterial, // Bottom
      logoMaterial,  // Front
      glassMaterial, // Back
    ];

    const mesh = new THREE.Mesh(geometry, materials);
    scene.add(mesh);

    // Warm ambient lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Dynamic specular directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(3, 3, 5);
    scene.add(dirLight);

    let animId: number;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX = (e.clientX - centerX) / window.innerWidth;
      mouseY = (e.clientY - centerY) / window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const clock = new THREE.Clock();
    const animate = () => {
      const time = clock.getElapsedTime();

      // Soft vertical floating motion
      mesh.position.y = Math.sin(time * 1.5) * 0.06;

      // Parallax mouse tilt
      const targetRotX = -mouseY * 1.6;
      const targetRotY = mouseX * 1.6;

      mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.1;
      mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.1;
      mesh.rotation.z = Math.sin(time * 0.5) * 0.03;

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

    // Periodically sync size in case parent header class changes dimensions on scroll
    const sizeSyncInterval = setInterval(handleResize, 200);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      clearInterval(sizeSyncInterval);
      geometry.dispose();
      glassMaterial.dispose();
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
