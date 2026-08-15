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

    // Synchronous texture loading initialization to prevent WebGL shader compilation issues
    const textureLoader = new THREE.TextureLoader();
    let textureLoaded = false;
    let backTextureLoaded = false;

    const checkLoaded = () => {
      if (textureLoaded && backTextureLoaded) {
        setLoaded(true);
      }
    };

    const texture = textureLoader.load("/assets/logo.png?v=3", () => {
      textureLoaded = true;
      checkLoaded();
    });

    const backTexture = textureLoader.load("/assets/logo.png?v=3", () => {
      backTextureLoaded = true;
      checkLoaded();
    });

    // Configure back texture with flipped horizontal mapping to offset 180deg Y-rotation mirroring
    backTexture.wrapS = THREE.RepeatWrapping;
    backTexture.repeat.x = -1;

    // Group to hold the volumetric stack layers
    const group = new THREE.Group();

    // Common Plane geometry for all layers
    const geometry = new THREE.PlaneGeometry(1.6, 1.6);

    // Front-most material (faces camera, normal reading)
    const frontMaterial = new THREE.MeshPhysicalMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.05,
      depthWrite: false,
      side: THREE.FrontSide,
      roughness: 0.15,
      metalness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    // Back-most material (faces away from camera, flipped mapping)
    const backMaterial = new THREE.MeshPhysicalMaterial({
      map: backTexture,
      transparent: true,
      alphaTest: 0.05,
      depthWrite: false,
      side: THREE.FrontSide,
      roughness: 0.15,
      metalness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    // Inner materials for front block (z > 0, normal texture, FrontSide)
    const innerFrontMaterial = new THREE.MeshPhysicalMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.05,
      depthWrite: false,
      side: THREE.FrontSide,
      roughness: 0.25,
      metalness: 0.1,
    });

    // Inner materials for back block (z < 0, flipped texture, FrontSide)
    const innerBackMaterial = new THREE.MeshPhysicalMaterial({
      map: backTexture,
      transparent: true,
      alphaTest: 0.05,
      depthWrite: false,
      side: THREE.FrontSide,
      roughness: 0.25,
      metalness: 0.1,
    });

    // Generate 12 tightly stacked layers divided into front block and back block
    const layersCount = 12;
    const step = 0.01;
    const startZ = -((layersCount - 1) * step) / 2; // -0.055 to 0.055

    for (let i = 0; i < layersCount; i++) {
      const z = startZ + i * step;
      let mesh;
      
      if (i < 6) {
        // Sisi Belakang (Back block: i = 0..5, z = -0.055 s.d. -0.005)
        if (i === 0) {
          mesh = new THREE.Mesh(geometry, backMaterial);
        } else {
          mesh = new THREE.Mesh(geometry, innerBackMaterial);
        }
        mesh.rotation.y = Math.PI; // Face backward
      } else {
        // Sisi Depan (Front block: i = 6..11, z = 0.005 s.d. 0.055)
        if (i === layersCount - 1) {
          mesh = new THREE.Mesh(geometry, frontMaterial);
        } else {
          mesh = new THREE.Mesh(geometry, innerFrontMaterial);
        }
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
    dirLight1.position.set(2, 3, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight2.position.set(-2, -2, -3);
    scene.add(dirLight2);

    let animationFrameId: number;
    let targetRotY = 0;
    let targetRotX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 0.5;
      targetRotX = -y * 0.5;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Continuous 360deg Y-axis rotation
      group.rotation.y += 0.012;
      group.rotation.x += (targetRotX - group.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      width = containerRef.current.clientWidth || 50;
      height = containerRef.current.clientHeight || 50;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      frontMaterial.dispose();
      backMaterial.dispose();
      innerFrontMaterial.dispose();
      innerBackMaterial.dispose();
      texture.dispose();
      backTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />
    </div>
  );
}
