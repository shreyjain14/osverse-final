"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  X, 
  Download,
  Eye
} from "lucide-react";

interface GanttEntry {
  name: string;
  start: number;
  end: number;
}

// Simple Mobile AR Viewer Component - Download Only
export default function ARViewerPage() {
  const searchParams = useSearchParams();
  const [ganttData, setGanttData] = useState<GanttEntry[]>([]);
  const [downloadState, setDownloadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [glbUrl, setGlbUrl] = useState<string | null>(null);

  // Parse URL parameters
  useEffect(() => {
    const arParam = searchParams.get('ar');
    const ganttParam = searchParams.get('gantt');
    
    if (arParam === 'true' && ganttParam) {
      try {
        const parsedGantt = JSON.parse(decodeURIComponent(ganttParam));
        setGanttData(parsedGantt);
        generateGLB(parsedGantt);
      } catch (err) {
        setError('Invalid Gantt data');
        setDownloadState('error');
      }
    } else {
      setError('Missing AR parameters');
      setDownloadState('error');
    }
  }, [searchParams]);

  // Generate GLB from Gantt data (simplified - no canvas/model viewer)
  const generateGLB = async (gantt: GanttEntry[]) => {
    try {
      const THREE = await import("three");
      const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
      
      // Create simple scene
      const scene = new THREE.Scene();
      
      // Add bars for each Gantt entry
      const colors = [0x4f46e5, 0x22d3ee, 0xf59e42, 0x10b981, 0xf43f5e, 0xfbbf24];
      gantt.forEach((entry, i) => {
        const width = entry.end - entry.start;
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(width * 0.1, 0.3, 0.5),
          new THREE.MeshStandardMaterial({ color: colors[i % colors.length] })
        );
        bar.position.x = (entry.start + width / 2) * 0.1;
        bar.position.y = 0.15 + i * 0.4;
        bar.position.z = 0;
        scene.add(bar);
      });
      
      // Add light
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(5, 10, 7.5);
      scene.add(light);
      
      // Export to GLB
      const exporter = new GLTFExporter();
      exporter.parse(
        scene,
        (gltf: ArrayBuffer | { [key: string]: unknown }) => {
          if (gltf instanceof ArrayBuffer && gltf.byteLength > 0) {
            const blob = new Blob([gltf], { type: "model/gltf-binary" });
            const url = URL.createObjectURL(blob);
            setGlbUrl(url);
            setDownloadState('ready');
          } else {
            setError('Failed to generate 3D model');
            setDownloadState('error');
          }
        },
        (error: any) => {
          console.error('GLB generation error:', error);
          setError('Failed to generate 3D model');
          setDownloadState('error');
        },
        { binary: true }
      );
    } catch (error) {
      console.error('Failed to generate 3D model:', error);
      setError('Failed to generate 3D model');
      setDownloadState('error');
    }
  };

  // Loading view
  if (downloadState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h1 className="text-xl font-semibold text-slate-900">Preparing 3D Model</h1>
          <p className="text-slate-600">Generating your Gantt chart for AR viewing...</p>
        </div>
      </div>
    );
  }

  // Error view
  if (downloadState === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Error</h1>
          <p className="text-slate-600">{error}</p>
          <Button 
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">AR Gantt Chart</h1>
                <p className="text-sm text-slate-500">Download 3D Model</p>
              </div>
            </div>
            <button 
              onClick={() => window.history.back()}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Main Message */}
          <div className="bg-white rounded-lg p-6 shadow-lg text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Download className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              Download 3D Model to View the Gantt Chart in AR
            </h2>
            <p className="text-slate-600">
              Your 3D Gantt chart model is ready! Download it to view in your device's AR viewer.
            </p>
          </div>

          {/* Download Button */}
          <div className="space-y-3">
            <Button 
              onClick={() => {
                if (glbUrl) {
                  const link = document.createElement('a');
                  link.href = glbUrl;
                  link.download = 'gantt-chart.glb';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}
              disabled={!glbUrl}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              <Download className="w-5 h-5 mr-2" />
              Download 3D Model (.glb)
            </Button>
          </div>

          {/* Gantt Chart Info */}
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <h3 className="font-semibold text-slate-900 mb-3">Gantt Chart Data</h3>
            <div className="space-y-2">
              {ganttData.map((entry, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-600">{entry.name}</span>
                  <span className="text-slate-900">
                    {entry.start} - {entry.end}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to View in AR</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Download the 3D model file (.glb)</li>
              <li>2. Open your device's AR viewer or file manager</li>
              <li>3. Select the downloaded file</li>
              <li>4. Your device will launch AR mode automatically</li>
              <li>5. Point your camera at a flat surface to place the model</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
 