"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function FluidCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // Dimensions
    let width = container.clientWidth;
    let height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Custom Shader Material for Liquid Glass Blob (Concept 2)
    const customMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vPosition;

        // Approximation of 3D sine-based noise displacement
        float getDisplacement(vec3 p) {
          float wave = sin(p.x * 1.5 + uTime * 0.5) * cos(p.y * 1.5 + uTime * 0.5) * 0.18;
          wave += sin(p.z * 2.0 + uTime * 0.8) * cos(p.x * 2.0 + uTime * 0.8) * 0.12;
          return wave;
        }

        void main() {
          vNormal = normalize(normalMatrix * normal);
          float disp = getDisplacement(position);
          vec3 newPosition = position + normal * disp;
          vPosition = newPosition;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          // Fresnel effect calculation for glass look
          vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
          float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);

          // Brand color codes (Teal #216c7e and Gold #A68849)
          vec3 colorTeal = vec3(0.129, 0.424, 0.494);
          vec3 colorGold = vec3(0.651, 0.533, 0.286);

          // Animate color drift using normals and time
          float mixFactor = sin(vNormal.x * 1.5 + vNormal.y * 1.5 + uTime * 0.4) * 0.5 + 0.5;
          vec3 baseColor = mix(colorTeal, colorGold, mixFactor);

          // Specular glass shine highlights
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.2));
          float spec = pow(max(dot(vNormal, lightDir), 0.0), 48.0);

          // Refraction depth glow
          vec3 finalColor = mix(baseColor, vec3(1.0), fresnel * 0.4) + vec3(spec * 0.3);

          gl_FragColor = vec4(finalColor, 0.72 + fresnel * 0.18);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
      },
      transparent: true,
      side: THREE.DoubleSide,
    });

    // High detail Icosahedron sphere for smooth fluid waves
    const geometry = new THREE.IcosahedronGeometry(2.0, 32);
    const mesh = new THREE.Mesh(geometry, customMaterial);
    scene.add(mesh);

    // Subtle ambient lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Animation variables
    let animationFrameId: number;
    const clock = new THREE.Clock();

    // IntersectionObserver to pause rendering when the element is off-screen (saves visitor CPU/battery)
    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.01 }
    );
    observer.observe(container);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return; // Pause draw/render calls when off-screen

      const elapsedTime = clock.getElapsedTime();
      
      // Update shader uniforms
      customMaterial.uniforms.uTime.value = elapsedTime;
      
      // Slow rotation drift
      mesh.rotation.y = elapsedTime * 0.08;
      mesh.rotation.x = elapsedTime * 0.05;

      renderer.render(scene, camera);
    };

    // Initialize animation loop
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      
      // Dispose materials & geometries
      geometry.dispose();
      customMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 0, overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
