"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWebXR } from "./WebXRManager";
import "../types/model-viewer";
import { 
  Camera, 
  Smartphone, 
  Globe, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  RotateCcw,
  Eye,
  EyeOff,
  Download,
  Share2
} from "lucide-react";

interface GanttEntry {
  name: string;
  start: number;
  end: number;
}

interface EnhancedARModalProps {
  open: boolean;
  onClose: () => void;
  gantt: GanttEntry[];
  glbUrl: string | null;
  title: string;
}

// WebXR Device API detection
const isWebXRAvailable = () => {
  return 'xr' in navigator && navigator.xr && 'isSessionSupported' in navigator.xr;
};

// AR.js detection
const isARjsAvailable = () => {
  return typeof window !== 'undefined' && 'ARjs' in window;
};

// Mobile device detection
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// HTTPS detection (required for AR)
const isHTTPS = () => {
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
};

// Camera permission check
const checkCameraPermission = async (): Promise<boolean> => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return false;
    }
    
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.warn('Camera permission denied:', error);
    return false;
  }
};

// QR Code generation for mobile sharing
const generateQRCode = (url: string): string => {
  // Using a simple QR code service - in production, use a proper QR library
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
};

export default function EnhancedARModal({ 
  open, 
  onClose, 
  gantt, 
  glbUrl, 
  title 
}: EnhancedARModalProps) {
  const [arState, setArState] = useState<'checking' | 'ready' | 'permission-denied' | 'unsupported' | 'loading'>('checking');
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [webXRAvailable, setWebXRAvailable] = useState<boolean>(false);
  const [mobileDevice, setMobileDevice] = useState<boolean>(false);
  const [httpsAvailable, setHttpsAvailable] = useState<boolean>(false);
  const [arSession, setArSession] = useState<any>(null);
  const [sceneStabilized, setSceneStabilized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  
  const modelViewerRef = useRef<any>(null);
  const arContainerRef = useRef<HTMLDivElement>(null);

  // Initialize AR capabilities check
  useEffect(() => {
    if (!open) return;

    const checkARCapabilities = async () => {
      setArState('checking');
      
      try {
        // Check all requirements
        const [hasPermission, isWebXR, isMobile, isSecure] = await Promise.all([
          checkCameraPermission(),
          Promise.resolve(isWebXRAvailable()),
          Promise.resolve(isMobileDevice()),
          Promise.resolve(isHTTPS())
        ]);

        setCameraPermission(hasPermission);
        setWebXRAvailable(isWebXR || false);
        setMobileDevice(isMobile || false);
        setHttpsAvailable(isSecure || false);

        // Determine AR state
        if (!isSecure) {
          setArState('unsupported');
          setError('AR requires HTTPS connection');
        } else if (!hasPermission) {
          setArState('permission-denied');
          setError('Camera permission is required for AR');
        } else if (!isWebXR && !isMobile) {
          setArState('unsupported');
          setError('WebXR not supported on this device');
        } else {
          setArState('ready');
          setError(null);
        }
      } catch (err) {
        setArState('unsupported');
        setError('Failed to check AR capabilities');
      }
    };

    checkARCapabilities();
  }, [open]);

  // Load model-viewer script
  useEffect(() => {
    if (open && !window.customElements.get('model-viewer')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@google/model-viewer@^3.4.0/dist/model-viewer.min.js';
      script.onload = () => {
        console.log('Model-viewer loaded successfully');
      };
      script.onerror = () => {
        setError('Failed to load AR viewer');
      };
      document.body.appendChild(script);
    }
  }, [open]);

  // Handle AR session
  const startARSession = useCallback(async () => {
    if (!modelViewerRef.current || arState !== 'ready') return;

    try {
      setArState('loading');
      
      // Request camera permission explicitly
      if (!cameraPermission) {
        const permission = await checkCameraPermission();
        if (!permission) {
          setArState('permission-denied');
          setError('Camera permission denied');
          return;
        }
        setCameraPermission(true);
      }

      // Start AR session
      const modelViewer = modelViewerRef.current;
      
      // Configure AR modes based on device capabilities
      const arModes = webXRAvailable 
        ? 'webxr scene-viewer quick-look' 
        : mobileDevice 
        ? 'scene-viewer quick-look' 
        : 'webxr';

      modelViewer.setAttribute('ar-modes', arModes);
      modelViewer.setAttribute('ar', 'true');
      modelViewer.setAttribute('ar-scale', 'fixed');
      modelViewer.setAttribute('ar-placement', 'floor');
      modelViewer.setAttribute('ar-button', 'true');
      modelViewer.setAttribute('ar-status', 'not-presenting');

      // Add event listeners for AR session
      modelViewer.addEventListener('ar-status', (event: any) => {
        console.log('AR Status:', event.detail.status);
        if (event.detail.status === 'session-started') {
          setArSession(event.detail);
          setSceneStabilized(false);
          
          // Stabilize scene after a short delay
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

      setArState('ready');
    } catch (err) {
      console.error('AR session error:', err);
      setArState('unsupported');
      setError('Failed to start AR session');
    }
  }, [arState, cameraPermission, webXRAvailable, mobileDevice]);

  // Generate share URL and QR code
  const generateShareContent = useCallback(() => {
    const baseUrl = window.location.origin;
    const arUrl = `${baseUrl}/ar-viewer?ar=true&gantt=${encodeURIComponent(JSON.stringify(gantt))}`;
    setShareUrl(arUrl);
    setShowQR(true);
  }, [gantt]);

  // Handle camera permission request
  const requestCameraPermission = async () => {
    try {
      const permission = await checkCameraPermission();
      if (permission) {
        setCameraPermission(true);
        setArState('ready');
        setError(null);
      } else {
        setArState('permission-denied');
        setError('Camera permission is required for AR');
      }
    } catch (err) {
      setArState('permission-denied');
      setError('Failed to request camera permission');
    }
  };

  // Fallback AR viewer for unsupported devices
  const FallbackARViewer = () => (
    <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <Eye className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">AR Not Available</h3>
        <p className="text-sm text-slate-600 max-w-xs">
          Your device doesn't support AR features. Try using a mobile device with AR capabilities.
        </p>
        <Button 
          onClick={generateShareContent}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share for Mobile AR
        </Button>
      </div>
    </div>
  );

  // Permission denied view
  const PermissionDeniedView = () => (
    <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Camera Permission Required</h3>
        <p className="text-sm text-slate-600 max-w-xs">
          AR features need camera access to work. Please allow camera permissions and try again.
        </p>
        <Button 
          onClick={requestCameraPermission}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Camera className="w-4 h-4 mr-2" />
          Allow Camera Access
        </Button>
      </div>
    </div>
  );

  // Loading view
  const LoadingView = () => (
    <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-slate-600">Initializing AR experience...</p>
      {arSession && !sceneStabilized && (
        <p className="text-sm text-slate-500 mt-2">Stabilizing scene...</p>
      )}
    </div>
  );

  // Status indicator
  const StatusIndicator = () => (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${
        arState === 'ready' ? 'bg-green-500' :
        arState === 'loading' ? 'bg-yellow-500 animate-pulse' :
        'bg-red-500'
      }`}></div>
      <span className="text-slate-600">
        {arState === 'ready' ? 'AR Ready' :
         arState === 'loading' ? 'Initializing' :
         'AR Unavailable'}
      </span>
    </div>
  );

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-2xl w-full mx-4 relative flex flex-col shadow-strong"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {title} - AR Experience
                </h3>
                <StatusIndicator />
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-2xl font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* AR Content */}
          <div ref={arContainerRef} className="flex-1">
            {arState === 'checking' && <LoadingView />}
            {arState === 'loading' && <LoadingView />}
            {arState === 'permission-denied' && <PermissionDeniedView />}
            {arState === 'unsupported' && <FallbackARViewer />}
            {arState === 'ready' && glbUrl && (
              <div className="space-y-4">
                {/* AR Viewer */}
                <div className="relative">
                  <model-viewer
                    ref={modelViewerRef}
                    src={glbUrl}
                    ar
                    ar-modes="webxr scene-viewer quick-look"
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
                      height: 400, 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '1rem',
                      margin: '0 auto'
                    }}
                    alt="3D Gantt chart for AR viewing"
                    onError={() => setError("Failed to load 3D model")}
                  >
                    <div className="text-center text-red-600 mt-2">
                      Your browser does not support AR features.
                    </div>
                  </model-viewer>
                  
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
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button 
                    onClick={startARSession}
                    disabled={arState !== 'ready'}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Start AR Session
                  </Button>
                  
                  <Button 
                    onClick={generateShareContent}
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share for Mobile
                  </Button>
                  
                  <Button 
                    onClick={() => window.open(glbUrl, '_blank')}
                    variant="outline"
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Model
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* QR Code Modal */}
          {showQR && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-white dark:bg-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center"
            >
              <h4 className="text-lg font-semibold mb-4 text-center">Scan QR Code for Mobile AR</h4>
              <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
                <img 
                  src={generateQRCode(shareUrl)} 
                  alt="QR Code for AR sharing"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-sm text-slate-600 text-center mb-4 max-w-xs">
                Scan this QR code with your mobile device to view the Gantt chart in AR
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowQR(false)}
                  variant="outline"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => navigator.clipboard.writeText(shareUrl)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Copy Link
                </Button>
              </div>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Device Info */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3" />
                <span>WebXR: {webXRAvailable ? 'Available' : 'Not Available'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-3 h-3" />
                <span>Mobile: {mobileDevice ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Camera className="w-3 h-3" />
                <span>Camera: {cameraPermission ? 'Allowed' : 'Denied'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                <span>HTTPS: {httpsAvailable ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 