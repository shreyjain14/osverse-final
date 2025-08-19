/// <reference path="../../types/model-viewer.d.ts" />
"use client";
import { useEffect } from "react";

export default function ARDemo() {
  useEffect(() => {
    // Dynamically load model-viewer script from CDN
    if (!window.customElements.get('model-viewer')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 p-4">
      <h1 className="text-2xl font-bold mb-2 text-center">AR Demo: View a 3D Model in AR</h1>
      <p className="mb-4 text-center max-w-xl">
        You can interact with the 3D model below. On supported devices, tap the AR button to view it in your space!
      </p>
      <div 
        className="w-full max-w-md h-96 bg-white rounded-xl shadow-lg flex items-center justify-center"
        style={{ minHeight: '400px' }}
      >
        <p className="text-gray-500 text-center">
          AR Demo temporarily disabled for build compatibility.<br />
          Model-viewer will be restored once TypeScript conflicts are resolved.
        </p>
      </div>
      {/* Temporarily disabled for build
      <model-viewer
        src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
        ar
        ar-modes="scene-viewer quick-look webxr"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        style={{ width: '100%', maxWidth: 400, height: 400, background: 'white', borderRadius: '1rem', margin: '0 auto' }}
        alt="A 3D model of an astronaut"
      >
        <div className="text-center text-red-600 mt-2">
          Your browser does not support model-viewer or AR features.
        </div>
      </model-viewer>
      */}
      <p className="mt-4 text-xs text-gray-500 text-center">Powered by <a href="https://modelviewer.dev/" target="_blank" rel="noopener noreferrer" className="underline">model-viewer</a></p>
    </div>
  );
} 