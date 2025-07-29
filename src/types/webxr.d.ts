// WebXR Device API TypeScript declarations
interface XRSession extends EventTarget {
  end(): Promise<void>;
  requestReferenceSpace(type: string): Promise<XRReferenceSpace>;
  requestFrameOfReference(type: string, referenceSpace: XRReferenceSpace): Promise<XRFrameOfReference>;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

interface XRReferenceSpace {
  // Basic reference space interface
}

interface XRFrameOfReference {
  // Frame of reference interface
}

interface XR {
  isSessionSupported(sessionMode: string): Promise<boolean>;
  requestSession(sessionMode: string, options?: XRSessionInit): Promise<XRSession>;
}

interface XRSessionInit {
  requiredFeatures?: string[];
  optionalFeatures?: string[];
  domOverlay?: { root: Element };
}

declare global {
  interface Navigator {
    xr?: XR;
  }
}

export {}; 