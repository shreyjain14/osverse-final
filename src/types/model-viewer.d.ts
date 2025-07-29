declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        ar?: boolean;
        "ar-modes"?: string;
        "camera-controls"?: boolean;
        "auto-rotate"?: boolean;
        "shadow-intensity"?: string;
        "ar-scale"?: string;
        "ar-placement"?: string;
        "ar-button"?: boolean;
        "ar-status"?: string;
        exposure?: string;
        "environment-image"?: string;
        alt?: string;
        style?: React.CSSProperties;
        onError?: (event: any) => void;
      };
    }
  }
}

export {}; 