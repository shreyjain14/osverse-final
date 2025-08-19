import { useState, useEffect } from 'react';

// AR Service - Comprehensive AR functionality management
export interface ARCapabilities {
  isSupported: boolean;
  isARSupported: boolean;
  isMobile: boolean;
  isHTTPS: boolean;
  hasCameraPermission: boolean;
  webXRAvailable: boolean;
  modelViewerAvailable: boolean;
}

export interface ARSession {
  isActive: boolean;
  isTracking: boolean;
  isStabilized: boolean;
  error?: string;
}

export class ARService {
  private static instance: ARService;
  private capabilities: ARCapabilities | null = null;
  private session: ARSession = {
    isActive: false,
    isTracking: false,
    isStabilized: false
  };

  private constructor() {}

  static getInstance(): ARService {
    if (!ARService.instance) {
      ARService.instance = new ARService();
    }
    return ARService.instance;
  }

  // Check all AR capabilities
  async checkCapabilities(): Promise<ARCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    const capabilities: ARCapabilities = {
      isSupported: false,
      isARSupported: false,
      isMobile: this.isMobileDevice(),
      isHTTPS: this.isHTTPS(),
      hasCameraPermission: false,
      webXRAvailable: this.isWebXRAvailable(),
      modelViewerAvailable: false
    };

    // Check camera permission
    try {
      capabilities.hasCameraPermission = await this.checkCameraPermission();
    } catch (error) {
      console.warn('Camera permission check failed:', error);
    }

    // Check WebXR AR support
    if (capabilities.webXRAvailable) {
      try {
        capabilities.isARSupported = await this.isARSupported();
      } catch (error) {
        console.warn('AR support check failed:', error);
      }
    }

    // Check model-viewer availability
    capabilities.modelViewerAvailable = this.isModelViewerAvailable();

    // Overall support
    capabilities.isSupported = capabilities.isHTTPS && 
      (capabilities.webXRAvailable || capabilities.isMobile) && 
      capabilities.modelViewerAvailable;

    this.capabilities = capabilities;
    return capabilities;
  }

  // Device detection
  private isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // HTTPS detection
  private isHTTPS(): boolean {
    if (typeof window === 'undefined') return false;
    return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  }

  // WebXR detection
  private isWebXRAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return 'xr' in navigator && !!navigator.xr && 'isSessionSupported' in navigator.xr;
  }

     // AR support detection
   private async isARSupported(): Promise<boolean> {
     if (!this.isWebXRAvailable()) return false;
     
     try {
       const result = await navigator.xr!.isSessionSupported('immersive-ar');
       return Boolean(result);
     } catch {
       return false;
     }
   }

  // Camera permission check
  private async checkCameraPermission(): Promise<boolean> {
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
  }

  // Model-viewer availability
  private isModelViewerAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return window.customElements.get('model-viewer') !== undefined;
  }

  // Load model-viewer script
  async loadModelViewer(): Promise<boolean> {
    if (this.isModelViewerAvailable()) {
      return true;
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@google/model-viewer@^3.4.0/dist/model-viewer.min.js';
      
      script.onload = () => {
        console.log('Model-viewer loaded successfully');
        resolve(true);
      };
      
      script.onerror = () => {
        console.error('Failed to load model-viewer');
        resolve(false);
      };
      
      document.body.appendChild(script);
    });
  }

  // Request camera permission
  async requestCameraPermission(): Promise<boolean> {
    try {
      const permission = await this.checkCameraPermission();
      if (permission && this.capabilities) {
        this.capabilities.hasCameraPermission = true;
      }
      return permission;
    } catch (error) {
      console.error('Camera permission request failed:', error);
      return false;
    }
  }

  // Generate QR code URL
  generateQRUrl(ganttData: any): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/ar-viewer?ar=true&gantt=${encodeURIComponent(JSON.stringify(ganttData))}`;
  }

  // Get AR session status
  getSessionStatus(): ARSession {
    return { ...this.session };
  }

  // Update session status
  updateSessionStatus(updates: Partial<ARSession>): void {
    this.session = { ...this.session, ...updates };
  }

  // Get recommended AR modes for device
  getRecommendedARModes(): string {
    const capabilities = this.capabilities;
    if (!capabilities) return 'webxr';

    if (capabilities.webXRAvailable && capabilities.isARSupported) {
      return 'webxr scene-viewer quick-look';
    } else if (capabilities.isMobile) {
      return 'scene-viewer quick-look';
    } else {
      return 'webxr';
    }
  }

  // Get AR configuration for model-viewer
  getARConfiguration() {
    const capabilities = this.capabilities;
    if (!capabilities) return {};

    return {
      ar: true,
      'ar-modes': this.getRecommendedARModes(),
      'ar-scale': 'fixed',
      'ar-placement': 'floor',
      'ar-button': true,
      'camera-controls': true,
      'auto-rotate': true,
      'shadow-intensity': '1',
      'exposure': '1',
      'environment-image': 'neutral'
    };
  }

  // Validate AR requirements
  validateARRequirements(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const capabilities = this.capabilities;

    if (!capabilities) {
      errors.push('AR capabilities not checked');
      return { valid: false, errors };
    }

    if (!capabilities.isHTTPS) {
      errors.push('AR requires HTTPS connection');
    }

    if (!capabilities.hasCameraPermission) {
      errors.push('Camera permission is required');
    }

    if (!capabilities.webXRAvailable && !capabilities.isMobile) {
      errors.push('WebXR not supported on this device');
    }

    if (!capabilities.modelViewerAvailable) {
      errors.push('3D viewer not available');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get user-friendly error messages
  getErrorMessage(error: string): string {
    const errorMessages: Record<string, string> = {
      'camera-permission-denied': 'Camera access is required for AR. Please allow camera permissions in your browser settings.',
      'webxr-not-supported': 'Your device doesn\'t support WebXR. Try using a mobile device with AR capabilities.',
      'https-required': 'AR requires a secure HTTPS connection. Please use HTTPS or localhost.',
      'model-viewer-failed': 'Failed to load 3D viewer. Please refresh the page and try again.',
      'session-failed': 'Failed to start AR session. Please try again.',
      'tracking-lost': 'AR tracking lost. Please move your device to a well-lit area with clear surfaces.',
      'default': 'An error occurred with AR. Please try again or use a different device.'
    };

    return errorMessages[error] || errorMessages.default;
  }

  // Get device-specific recommendations
  getDeviceRecommendations(): string[] {
    const recommendations: string[] = [];
    const capabilities = this.capabilities;

    if (!capabilities) return recommendations;

    if (!capabilities.isMobile) {
      recommendations.push('For best AR experience, use a mobile device');
    }

    if (!capabilities.webXRAvailable) {
      recommendations.push('WebXR not available - using fallback AR modes');
    }

    if (!capabilities.hasCameraPermission) {
      recommendations.push('Camera permission required for AR features');
    }

    return recommendations;
  }
}

// React hook for AR service
export function useARService() {
  const [service] = useState(() => ARService.getInstance());
  const [capabilities, setCapabilities] = useState<ARCapabilities | null>(null);
  const [session, setSession] = useState<ARSession>({
    isActive: false,
    isTracking: false,
    isStabilized: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAR = async () => {
      try {
        setLoading(true);
        const caps = await service.checkCapabilities();
        setCapabilities(caps);
        
        if (caps.modelViewerAvailable) {
          await service.loadModelViewer();
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to initialize AR service');
      } finally {
        setLoading(false);
      }
    };

    initializeAR();
  }, [service]);

  const requestCameraPermission = async () => {
    try {
      const granted = await service.requestCameraPermission();
      if (granted && capabilities) {
        setCapabilities({ ...capabilities, hasCameraPermission: true });
      }
      return granted;
    } catch (err) {
      setError('Failed to request camera permission');
      return false;
    }
  };

  const updateSession = (updates: Partial<ARSession>) => {
    service.updateSessionStatus(updates);
    setSession(service.getSessionStatus());
  };

  return {
    service,
    capabilities,
    session,
    loading,
    error,
    requestCameraPermission,
    updateSession,
    getARConfiguration: () => service.getARConfiguration(),
    validateRequirements: () => service.validateARRequirements(),
    getErrorMessage: (error: string) => service.getErrorMessage(error),
    getRecommendations: () => service.getDeviceRecommendations()
  };
} 