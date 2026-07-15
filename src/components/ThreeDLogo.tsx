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

    // Group to hold the volumetric stack layers
    const group = new THREE.Group();

    // Common Plane geometry for all layers
    const geometry = new THREE.PlaneGeometry(1.6, 1.6);

    // Front-most material (faces camera)
    const frontMaterial = new THREE.MeshPhysicalMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.08,
      side: THREE.FrontSide,
      roughness: 0.15,
      metalness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    // Back-most material (faces away from camera)
    const backMaterial = new THREE.MeshPhysicalMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.08,
      side: THREE.FrontSide,
      roughness: 0.15,
      metalness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    // Inner materials (fill the volumetric depth)
    const innerMaterial = new THREE.MeshPhysicalMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.08,
      side: THREE.DoubleSide,
      roughness: 0.25,
      metalness: 0.1,
    });

    // Generate 13 tightly stacked layers to create a solid 3D extrusion effect
    const layersCount = 13;
    const step = 0.01;
    const startZ = -((layersCount - 1) * step) / 2; // -0.06 to 0.06

    for (let i = 0; i < layersCount; i++) {
      const z = startZ + i * step;
      let mesh;
      if (i === 0) {
        // Back-most layer
        mesh = new THREE.Mesh(geometry, backMaterial);
        mesh.rotation.y = Math.PI; // Face backward
      } else if (i === layersCount - 1) {
        // Front-most layer
        mesh = new THREE.Mesh(geometry, frontMaterial);
      } else {
        // Inner layers
        mesh = new THREE.Mesh(geometry, innerMaterial);
      }
      mesh.position.z = z;
      group.add(mesh);
    }

    scene.add(group);

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

      // 1. Soft vertical floating motion applied to the entire group
      group.position.y = Math.sin(time * 1.5) * 0.05;
      
      // 2. Subtle organic Z-axis tilt
      group.rotation.z = Math.sin(time * 0.5) * 0.02;

      // 3. Periodic Y-axis spin every 5 seconds (lasts 1.8 seconds)
      const spinDuration = 1.8;
      const cycleDuration = 5.0;
      const progress = time % cycleDuration;

      if (progress < spinDuration) {
        const t = progress / spinDuration;
        // Ease-in-out smooth transition curve
        const ease = t * t * (3 - 2 * t);
        group.rotation.y = ease * Math.PI * 2;

        // Dynamic light sweep to simulate reflection shine glares
        dirLight1.position.x = -4 + ease * 8;
        dirLight2.position.x = 4 - ease * 8;
      } else {
        group.rotation.y = 0;
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
      frontMaterial.dispose();
      backMaterial.dispose();
      innerMaterial.dispose();
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
