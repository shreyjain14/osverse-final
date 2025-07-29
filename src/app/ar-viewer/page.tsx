"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Camera, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  RotateCcw,
  Eye,
  Download,
  Share2,
  Smartphone,
  Globe
} from "lucide-react";

interface GanttEntry {
  name: string;
  start: number;
  end: number;
}

// Mobile AR Viewer Component
export default function ARViewerPage() {
  const searchParams = useSearchParams();
  const [ganttData, setGanttData] = useState<GanttEntry[]>([]);
  const [arState, setArState] = useState<'loading' | 'ready' | 'error' | 'unsupported'>('loading');
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [arSession, setArSession] = useState<any>(null);
  const [sceneStabilized, setSceneStabilized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [glbUrl, setGlbUrl] = useState<string | null>(null);
  
  const modelViewerRef = useRef<any>(null);

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
        setArState('error');
      }
    } else {
      setError('Missing AR parameters');
      setArState('error');
    }
  }, [searchParams]);

  // Generate GLB from Gantt data
  const generateGLB = async (gantt: GanttEntry[]) => {
    try {
      // @ts-expect-error: No types for three
      const THREE = await import("three");
      // @ts-expect-error: No types for GLTFExporter
      const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
      
      // Create scene
      const scene = new THREE.Scene();
      
      // Add a ground plane
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 2),
        new THREE.MeshStandardMaterial({ color: 0xf0f0f0 })
      );
      plane.position.y = -0.1;
      scene.add(plane);
      
      // Add bars for each Gantt entry
      const colors = [0x4f46e5, 0x22d3ee, 0xf59e42, 0x10b981, 0xf43f5e, 0xfbbf24];
      gantt.forEach((entry, i) => {
        const width = entry.end - entry.start;
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(width, 0.3, 0.5),
          new THREE.MeshStandardMaterial({ color: colors[i % colors.length] })
        );
        bar.position.x = entry.start + width / 2;
        bar.position.y = 0.15 + i * 0.4;
        bar.position.z = 0;
        scene.add(bar);
        
        // Add label
        const label = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.2, 0.2),
          new THREE.MeshStandardMaterial({ color: 0x222222 })
        );
        label.position.x = entry.start + width / 2;
        label.position.y = 0.4 + i * 0.4;
        label.position.z = 0.4;
        scene.add(label);
      });
      
      // Add light
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(5, 10, 7.5);
      scene.add(light);
      
      // Export to GLB
      const exporter = new GLTFExporter();
      exporter.parse(
        scene,
        (gltf: ArrayBuffer) => {
          if (gltf && gltf.byteLength > 0) {
            const blob = new Blob([gltf], { type: "model/gltf-binary" });
            const url = URL.createObjectURL(blob);
            setGlbUrl(url);
            setArState('ready');
          } else {
            setError('Failed to generate 3D model');
            setArState('error');
          }
        },
        (error: any) => {
          setError('Failed to generate 3D model');
          setArState('error');
        },
        { binary: true }
      );
    } catch (error) {
      setError('Failed to generate 3D model');
      setArState('error');
    }
  };

  // Check AR capabilities
  useEffect(() => {
    const checkARCapabilities = async () => {
      // Check if mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (!isMobile) {
        setError('This AR viewer is optimized for mobile devices');
        setArState('unsupported');
        return;
      }

      // Check HTTPS
      const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      if (!isHTTPS) {
        setError('AR requires HTTPS connection');
        setArState('unsupported');
        return;
      }

      // Check camera permission
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
          setCameraPermission(true);
        } else {
          setCameraPermission(false);
        }
      } catch (err) {
        setCameraPermission(false);
      }

      // Load model-viewer
      if (!window.customElements.get('model-viewer')) {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://unpkg.com/@google/model-viewer@^3.4.0/dist/model-viewer.min.js';
        script.onload = () => {
          console.log('Model-viewer loaded successfully');
        };
        script.onerror = () => {
          setError('Failed to load AR viewer');
          setArState('error');
        };
        document.body.appendChild(script);
      }
    };

    checkARCapabilities();
  }, []);

  // Handle AR session
  const startARSession = async () => {
    if (!modelViewerRef.current || !glbUrl) return;

    try {
      const modelViewer = modelViewerRef.current;
      
      // Configure for mobile AR
      modelViewer.setAttribute('ar-modes', 'scene-viewer quick-look webxr');
      modelViewer.setAttribute('ar', 'true');
      modelViewer.setAttribute('ar-scale', 'fixed');
      modelViewer.setAttribute('ar-placement', 'floor');
      modelViewer.setAttribute('ar-button', 'true');

      // Add event listeners
      modelViewer.addEventListener('ar-status', (event: any) => {
        console.log('AR Status:', event.detail.status);
        if (event.detail.status === 'session-started') {
          setArSession(event.detail);
          setSceneStabilized(false);
          
          // Stabilize scene after delay
          setTimeout(() => {
            setSceneStabilized(true);
          }, 2000);
        } else if (event.detail.status === 'session-ended') {
          setArSession(null);
          setSceneStabilized(false);
        }
      });

      modelViewer.addEventListener('ar-tracking', (event: any) => {
        if (event.detail.status === 'tracking') {
          setSceneStabilized(true);
        }
      });

    } catch (err) {
      setError('Failed to start AR session');
    }
  };

  // Loading view
  if (arState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h1 className="text-xl font-semibold text-slate-900">Loading AR Experience</h1>
          <p className="text-slate-600">Preparing your Gantt chart for AR viewing...</p>
        </div>
      </div>
    );
  }

  // Error view
  if (arState === 'error' || arState === 'unsupported') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">AR Not Available</h1>
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
                <p className="text-sm text-slate-500">Mobile AR Experience</p>
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

      {/* AR Content */}
      <div className="p-4">
        <div className="max-w-md mx-auto space-y-4">
          {/* AR Viewer */}
          <div className="relative">
            {glbUrl && (
              <model-viewer
                ref={modelViewerRef}
                src={glbUrl}
                ar
                ar-modes="scene-viewer quick-look webxr"
                ar-scale="fixed"
                ar-placement="floor"
                ar-button
                camera-controls
                auto-rotate
                shadow-intensity="1"
                exposure="1"
                environment-image="neutral"
                style={{ 
                  width: '100%', 
                  height: 300, 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '1rem'
                }}
                alt="3D Gantt chart for AR viewing"
                onError={() => setError("Failed to load 3D model")}
              >
                <div className="text-center text-red-600 mt-2">
                  Your browser does not support AR features.
                </div>
              </model-viewer>
            )}
            
            {/* AR Session Status */}
            {arSession && (
              <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {sceneStabilized ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Scene Stable
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Stabilizing...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AR Controls */}
          <div className="space-y-3">
            <Button 
              onClick={startARSession}
              disabled={!glbUrl}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Camera className="w-4 h-4 mr-2" />
              Start AR Session
            </Button>
            
            <Button 
              onClick={() => window.open(glbUrl, '_blank')}
              variant="outline"
              className="w-full border-green-200 text-green-700 hover:bg-green-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download 3D Model
            </Button>
          </div>

          {/* Gantt Chart Info */}
          <div className="bg-white rounded-lg p-4 shadow-soft">
            <h3 className="font-semibold text-slate-900 mb-2">Gantt Chart Data</h3>
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

          {/* Device Info */}
          <div className="bg-white rounded-lg p-4 shadow-soft">
            <h3 className="font-semibold text-slate-900 mb-2">Device Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Camera Permission</span>
                <span className={cameraPermission ? 'text-green-600' : 'text-red-600'}>
                  {cameraPermission ? 'Allowed' : 'Denied'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">HTTPS Connection</span>
                <span className="text-green-600">Secure</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Mobile Device</span>
                <span className="text-green-600">Detected</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to Use AR</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Tap "Start AR Session"</li>
              <li>2. Allow camera permissions when prompted</li>
              <li>3. Point your camera at a flat surface</li>
              <li>4. Tap to place the Gantt chart</li>
              <li>5. Move around to view from different angles</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 