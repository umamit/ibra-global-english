"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import "./ThreeDHeroOrbs.css";

interface OrbData {
  mesh: THREE.Mesh;
  initialY: number;
  initialX: number;
  initialZ: number;
  speed: number;
  offset: number;
  rotSpeedX: number;
  rotSpeedY: number;
}

export default function ThreeDHeroOrbs() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 700;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 180;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Primary Teal Light
    const tealLight = new THREE.PointLight(0x216c7e, 2.5, 300);
    tealLight.position.set(-100, 100, 100);
    scene.add(tealLight);

    // Gold Accent Light
    const goldLight = new THREE.PointLight(0xa68849, 2.2, 300);
    goldLight.position.set(100, -80, 100);
    scene.add(goldLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(0, 150, 100);
    scene.add(dirLight);

    // 5. Materials (Glassmorphic Shaders / Materials in Brand Colors)
    const materials = [
      // Primary Teal Glass
      new THREE.MeshPhysicalMaterial({
        color: 0x216c7e,
        transmission: 0.85,
        opacity: 0.9,
        transparent: true,
        roughness: 0.15,
        ior: 1.4,
        reflectivity: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
      }),
      // Accent Gold Glass
      new THREE.MeshPhysicalMaterial({
        color: 0xa68849,
        transmission: 0.8,
        opacity: 0.9,
        transparent: true,
        roughness: 0.2,
        ior: 1.5,
        reflectivity: 0.8,
        clearcoat: 1.0,
        clearcoatRoughness: 0.15,
      }),
      // Dark Teal Glass
      new THREE.MeshPhysicalMaterial({
        color: 0x164d57,
        transmission: 0.75,
        opacity: 0.85,
        transparent: true,
        roughness: 0.25,
        ior: 1.35,
        reflectivity: 0.7,
        clearcoat: 0.8,
      }),
      // Soft Pearl Frosted Glass
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.9,
        opacity: 0.8,
        transparent: true,
        roughness: 0.1,
        ior: 1.45,
        reflectivity: 0.95,
        clearcoat: 1.0,
      }),
    ];

    // 6. Generate 14 Glass Spheres of various sizes
    const orbs: OrbData[] = [];
    const orbCount = 14;

    for (let i = 0; i < orbCount; i++) {
      const radius = 6 + Math.random() * 16; // Random sizes between 6px and 22px
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = materials[i % materials.length];
      const mesh = new THREE.Mesh(geometry, material);

      // Random positions spread out in 3D space
      const initialX = (Math.random() - 0.5) * 260;
      const initialY = (Math.random() - 0.5) * 160;
      const initialZ = (Math.random() - 0.5) * 120;

      mesh.position.set(initialX, initialY, initialZ);
      scene.add(mesh);

      orbs.push({
        mesh,
        initialX,
        initialY,
        initialZ,
        speed: 0.6 + Math.random() * 0.8,
        offset: Math.random() * Math.PI * 2,
        rotSpeedX: (Math.random() - 0.5) * 0.01,
        rotSpeedY: (Math.random() - 0.5) * 0.01,
      });
    }

    // 7. Parallax Mouse Listener
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 30;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 30;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 700;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      camera.position.x = mouseX;
      camera.position.y = -mouseY;
      camera.lookAt(0, 0, 0);

      // Animate floating bobbing motion for each orb
      orbs.forEach((orb) => {
        orb.mesh.position.y = orb.initialY + Math.sin(elapsedTime * orb.speed + orb.offset) * 12;
        orb.mesh.position.x = orb.initialX + Math.cos(elapsedTime * (orb.speed * 0.7) + orb.offset) * 8;
        orb.mesh.rotation.x += orb.rotSpeedX;
        orb.mesh.rotation.y += orb.rotSpeedY;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      orbs.forEach((orb) => {
        orb.mesh.geometry.dispose();
      });
      materials.forEach((mat) => mat.dispose());
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="hero-3d-orbs-container" />;
}
