"use client";

import React, { Suspense, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three-stdlib';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import * as THREE from 'three';

function Model({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url);
  gltf.scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const material = child.material as THREE.MeshStandardMaterial;
      material.side = THREE.DoubleSide;
    }
  });
  return <primitive object={gltf.scene} />;
}

function ViewModelContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get('data');

  const gantt = useMemo(() => {
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse gantt data:", e);
      return [];
    }
  }, [data]);

  const maxTime = useMemo(() => {
    if (gantt.length === 0) return 10;
    return Math.max(...gantt.map((g: { end: number }) => g.end));
  }, [gantt]);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <p className="text-red-500 mb-4">No model data provided.</p>
        <Link href="/">
          <Button>Go Back</Button>
        </Link>
      </div>
    );
  }

  const modelUrl = `/api/gantt-model?data=${data}`;
  
  const arLink = useMemo(() => {
    if (typeof window === 'undefined') {
      return '#';
    }
    const absoluteModelUrl = `${window.location.origin}${modelUrl}`;
    return `intent://arvr.google.com/scene-viewer/1.0?file=${absoluteModelUrl}&scale=0.15#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;`;
  }, [modelUrl]);

  const cameraPosition: [number, number, number] = [
    maxTime / 2, 
    maxTime / 4, 
    maxTime + (maxTime / 2)
  ];

  return (
    <div className="w-full h-screen bg-gray-200">
      <div className="absolute top-4 left-4 z-10">
        <Link href="/">
            <Button variant="outline">← Back to Home</Button>
        </Link>
      </div>
      <Suspense fallback={<div className="flex items-center justify-center h-full">Loading 3D Model...</div>}>
        <Canvas dpr={[1, 2]} camera={{ fov: 75, position: cameraPosition }}>
          <ambientLight intensity={1.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[maxTime, 5, 5]} intensity={0.5} />
          <Model url={modelUrl} />
          <OrbitControls target={[maxTime / 2, 0, 0]} />
        </Canvas>
      </Suspense>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <a href={arLink}>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
            View in AR
          </Button>
        </a>
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function ViewModelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading 3D model...</div>}>
      <ViewModelContent />
    </Suspense>
  );
} 