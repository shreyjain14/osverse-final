"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  X, 
  Download,
  Smartphone
} from "lucide-react";

interface GanttEntry {
  name: string;
  start: number;
  end: number;
}

// Simple Mobile AR Viewer Component
export default function ARViewerPage() {
  const searchParams = useSearchParams();
  const [ganttData, setGanttData] = useState<GanttEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [glbUrl, setGlbUrl] = useState<string | null>(null);

  // Parse URL parameters and generate GLB
  useEffect(() => {
    const arParam = searchParams.get('ar');
    const ganttParam = searchParams.get('gantt');
    
    if (arParam === 'true' && ganttParam) {
      try {
        const parsedGantt = JSON.parse(decodeURIComponent(ganttParam));
        setGanttData(parsedGantt);
        generateGLBDownload(parsedGantt);
      } catch (err) {
        setError('Invalid Gantt data');
        setIsLoading(false);
      }
    } else {
      setError('Missing AR parameters');
      setIsLoading(false);
    }
  }, [searchParams]);

  // Generate GLB for download
  const generateGLBDownload = async (gantt: GanttEntry[]) => {
    try {
      setIsLoading(true);
      
      // Call the API to generate GLB
      const response = await fetch(`/api/gantt-model?data=${encodeURIComponent(JSON.stringify(gantt))}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setGlbUrl(url);
      } else {
        setError('Failed to generate 3D model');
      }
    } catch (error) {
      console.error('Error generating GLB:', error);
      setError('Failed to generate 3D model');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle GLB download
  const handleDownload = () => {
    if (!glbUrl) return;
    
    const link = document.createElement('a');
    link.href = glbUrl;
    link.download = 'gantt-chart.glb';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loading view
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h1 className="text-xl font-semibold text-slate-900">Generating 3D Model</h1>
          <p className="text-slate-600">Preparing your Gantt chart for AR viewing...</p>
        </div>
      </div>
    );
  }

  // Error view
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Unable to Generate Model</h1>
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
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">AR Gantt Chart</h1>
                <p className="text-sm text-slate-500">3D Model Ready</p>
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
          <div className="text-center space-y-4 bg-white rounded-lg p-6 shadow-soft">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Download className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Download 3D Model</h2>
            <p className="text-slate-600">
              Download the 3D model to view the Gantt chart in AR on your device
            </p>
          </div>

          {/* Download Button */}
          <Button 
            onClick={handleDownload}
            disabled={!glbUrl}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Download GLB Model
          </Button>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to View in AR</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Download the GLB file above</li>
              <li>2. Open your device's file manager</li>
              <li>3. Find and tap the downloaded GLB file</li>
              <li>4. Select "View in AR" or similar option</li>
              <li>5. Place the Gantt chart in your space!</li>
            </ol>
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

          {/* Device Compatibility */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Device Compatibility</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• <strong>Android:</strong> Requires ARCore support</li>
              <li>• <strong>iOS:</strong> Requires iOS 12+ with AR capabilities</li>
              <li>• <strong>File Format:</strong> GLB (3D Binary Format)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
