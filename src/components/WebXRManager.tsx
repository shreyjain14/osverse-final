"use client";
import { useEffect, useRef, useState, useCallback } from 'react';

interface WebXRManagerProps {
  onSessionStart?: (session: any) => void;
  onSessionEnd?: () => void;
  onTrackingUpdate?: (tracking: boolean) => void;
  onError?: (error: string) => void;
}

export class WebXRManager {
  private session: any = null;
  private referenceSpace: any = null;
  private frameOfReference: any = null;
  private isTracking = false;
  private callbacks: {
    onSessionStart?: (session: any) => void;
    onSessionEnd?: () => void;
    onTrackingUpdate?: (tracking: boolean) => void;
    onError?: (error: string) => void;
  } = {};

  constructor(callbacks: WebXRManagerProps) {
    this.callbacks = callbacks;
  }

  // Check if WebXR is supported
  static isSupported(): boolean {
    return 'xr' in navigator && 'isSessionSupported' in navigator.xr;
  }

  // Check if AR is supported
  static async isARSupported(): Promise<boolean> {
    if (!this.isSupported()) return false;
    
    try {
      return await navigator.xr.isSessionSupported('immersive-ar');
    } catch {
      return false;
    }
  }

  // Request AR session
  async requestARSession(): Promise<boolean> {
    try {
      if (!WebXRManager.isSupported()) {
        this.callbacks.onError?.('WebXR not supported');
        return false;
      }

      const isARSupported = await WebXRManager.isARSupported();
      if (!isARSupported) {
        this.callbacks.onError?.('AR not supported on this device');
        return false;
      }

      // Request session with required features
      this.session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test', 'dom-overlay'],
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
        domOverlay: { root: document.body }
      });

      // Set up session event handlers
      this.session.addEventListener('end', this.onSessionEnd.bind(this));
      this.session.addEventListener('select', this.onSelect.bind(this));
      this.session.addEventListener('selectstart', this.onSelectStart.bind(this));
      this.session.addEventListener('selectend', this.onSelectEnd.bind(this));

      // Request reference space
      this.referenceSpace = await this.session.requestReferenceSpace('viewer');
      this.frameOfReference = await this.session.requestFrameOfReference('local', this.referenceSpace);

      this.callbacks.onSessionStart?.(this.session);
      return true;
    } catch (error) {
      console.error('Failed to request AR session:', error);
      this.callbacks.onError?.(`Failed to start AR: ${error}`);
      return false;
    }
  }

  // End AR session
  endSession(): void {
    if (this.session) {
      this.session.end();
    }
  }

  // Session event handlers
  private onSessionEnd(): void {
    this.session = null;
    this.referenceSpace = null;
    this.frameOfReference = null;
    this.isTracking = false;
    this.callbacks.onSessionEnd?.();
  }

  private onSelect(event: any): void {
    // Handle selection events (tap to place)
    console.log('AR selection event:', event);
  }

  private onSelectStart(event: any): void {
    // Handle selection start
    console.log('AR selection start:', event);
  }

  private onSelectEnd(event: any): void {
    // Handle selection end
    console.log('AR selection end:', event);
  }

  // Get current session
  getSession(): any {
    return this.session;
  }

  // Check if session is active
  isSessionActive(): boolean {
    return this.session !== null;
  }

  // Get tracking status
  getTrackingStatus(): boolean {
    return this.isTracking;
  }

  // Update tracking status
  updateTrackingStatus(tracking: boolean): void {
    if (this.isTracking !== tracking) {
      this.isTracking = tracking;
      this.callbacks.onTrackingUpdate?.(tracking);
    }
  }
}

// React hook for WebXR management
export function useWebXR(callbacks: WebXRManagerProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isARSupported, setIsARSupported] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const managerRef = useRef<WebXRManager | null>(null);

  useEffect(() => {
    // Initialize WebXR support check
    const checkSupport = async () => {
      const supported = WebXRManager.isSupported();
      setIsSupported(supported);
      
      if (supported) {
        const arSupported = await WebXRManager.isARSupported();
        setIsARSupported(arSupported);
      }
    };

    checkSupport();
  }, []);

  // Initialize manager
  useEffect(() => {
    if (isSupported) {
      managerRef.current = new WebXRManager({
        onSessionStart: (session) => {
          setSessionActive(true);
          setError(null);
          callbacks.onSessionStart?.(session);
        },
        onSessionEnd: () => {
          setSessionActive(false);
          setTracking(false);
          callbacks.onSessionEnd?.();
        },
        onTrackingUpdate: (tracking) => {
          setTracking(tracking);
          callbacks.onTrackingUpdate?.(tracking);
        },
        onError: (error) => {
          setError(error);
          callbacks.onError?.(error);
        }
      });
    }
  }, [isSupported, callbacks]);

  // Request AR session
  const requestSession = useCallback(async (): Promise<boolean> => {
    if (!managerRef.current) return false;
    return await managerRef.current.requestARSession();
  }, []);

  // End session
  const endSession = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.endSession();
    }
  }, []);

  return {
    isSupported,
    isARSupported,
    sessionActive,
    tracking,
    error,
    requestSession,
    endSession,
    manager: managerRef.current
  };
} 