

"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line, Area } from 'recharts';
import GanttChart from "./GanttChart";
import ClassicGanttChart from "./ClassicGanttChart";
import SimpleARModal from "./SimpleARModal";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Play, Eye, BarChart3, Calculator, Settings } from "lucide-react";

interface Process {
  name: string;
  arrival: number;
  burst: number;
  priority?: number;
  deadline?: number;
  tickets?: number;
  group?: string;
}

interface GanttEntry {
  name: string;
  start: number;
  end: number;
}

interface SchedulingResult {
  results: (Process & { finish: number; tat: number; wt: number })[];
  avgTAT: string;
  avgWT: string;
  gantt: GanttEntry[];
}

interface SchedulingTemplateProps {
  title: string;
  description: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
  };
  processes: Process[];
  setProcesses: (processes: Process[]) => void;
  calculateScheduling: (processes: Process[]) => SchedulingResult;
  additionalFields?: React.ReactNode;
  defaultProcesses?: Process[];
}

function generateGanttGLB(gantt: GanttEntry[]): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      
      const THREE = await import("three");
      
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
        
        // Add label (as a small box for now)
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
        (gltf: ArrayBuffer | { [key: string]: unknown }) => {
          const gltfBuffer = gltf as ArrayBuffer;
          if (gltfBuffer && gltfBuffer.byteLength > 0) {
            const blob = new Blob([gltfBuffer], { type: "model/gltf-binary" });
            resolve(blob);
          } else {
            reject(new Error("Failed to generate GLB data"));
          }
        },
        (error: any) => {
          reject(error);
        },
        { binary: true }
      );
    } catch (error) {
      reject(error);
    }
  });
}



export default function SchedulingTemplate({
  title,
  description,
  colorScheme,
  processes,
  setProcesses,
  calculateScheduling,
  additionalFields,
  defaultProcesses = []
}: SchedulingTemplateProps) {
  const [tableProcesses, setTableProcesses] = useState<Process[]>([
    { name: "P1", arrival: 0, burst: 0 },
    { name: "P2", arrival: 0, burst: 0 },
    { name: "P3", arrival: 0, burst: 0 }
  ]);

  // Initialize table processes with default processes if provided
  React.useEffect(() => {
    if (defaultProcesses.length > 0) {
      setTableProcesses(defaultProcesses);
    }
  }, [defaultProcesses]);

  const { results, avgTAT, avgWT, gantt } = calculateScheduling(processes);

  // Create timeline data for the chart
  const timelineData = [];
  const maxTime = gantt.length > 0 ? Math.max(...gantt.map(g => g.end)) : 10;
  
  for (let time = 0; time <= maxTime; time++) {
    const entry: any = { time };
    gantt.forEach((g, i) => {
      if (time >= g.start && time < g.end) {
        entry.process = g.name;
        entry.active = true;
      }
    });
    timelineData.push(entry);
  }

  const updateProcess = (index: number, field: keyof Process, value: string | number) => {
    const newProcesses = [...tableProcesses];
    newProcesses[index] = { ...newProcesses[index], [field]: value };
    setTableProcesses(newProcesses);
  };

  const addProcess = () => {
    setTableProcesses([...tableProcesses, { 
      name: `P${tableProcesses.length + 1}`, 
      arrival: 0, 
      burst: 0 
    }]);
  };

  const removeProcess = (index: number) => {
    if (tableProcesses.length > 1) {
      const newProcesses = tableProcesses.filter((_, i) => i !== index);
      // Rename processes to maintain sequential naming
      const renamedProcesses = newProcesses.map((p, i) => ({
        ...p,
        name: `P${i + 1}`
      }));
      setTableProcesses(renamedProcesses);
    }
  };

  const applyProcesses = () => {
    // Filter out processes with burst time 0 and apply to main processes
    const validProcesses = tableProcesses.filter(p => p.burst > 0);
    setProcesses(validProcesses);
  };

  const [arOpen, setArOpen] = useState(false);
  const [ganttGlbUrl, setGanttGlbUrl] = useState<string | null>(null);
  const [arError, setArError] = useState<string | null>(null);

  const handleOpenAR = async () => {
    setArOpen(true);
    setGanttGlbUrl(null);
    setArError(null);
    
    try {
      const blob = await generateGanttGLB(gantt);
      const url = URL.createObjectURL(blob);
      setGanttGlbUrl(url);
    } catch (error) {
      console.error("Failed to generate GLB:", error);
      setArError("Failed to generate 3D model");
      // Don't set glbUrl, so it shows the fallback
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colorScheme.bg} dark:from-slate-900 dark:via-slate-800 dark:to-slate-900`}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
        <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                <ArrowLeft className="w-4 h-4" />
                Back to Algorithms
          </Button>
        </Link>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-500 dark:text-slate-400">Live Preview</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-4">
            {title}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Process Input */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-6 shadow-soft border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Process Configuration</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
              <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="px-3 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">Process</th>
                          <th className="px-3 py-3 text-center text-sm font-medium text-slate-700 dark:text-slate-300">Arrival</th>
                          <th className="px-3 py-3 text-center text-sm font-medium text-slate-700 dark:text-slate-300">Burst</th>
                  {additionalFields && (
                            <th className="px-3 py-3 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                      {tableProcesses[0]?.priority !== undefined ? "Priority" :
                       tableProcesses[0]?.deadline !== undefined ? "Deadline" :
                       tableProcesses[0]?.tickets !== undefined ? "Tickets" :
                       tableProcesses[0]?.group !== undefined ? "Group" : "Additional"}
                    </th>
                  )}
                          <th className="px-3 py-3 text-center text-sm font-medium text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {tableProcesses.map((process, index) => (
                          <motion.tr 
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                          >
                            <td className="px-3 py-3">
                      <Input
                        value={process.name}
                        onChange={(e) => updateProcess(index, 'name', e.target.value)}
                                className="w-20 text-center text-sm"
                                placeholder="P1"
                      />
                    </td>
                            <td className="px-3 py-3">
                      <Input
                        type="number"
                        min="0"
                        value={process.arrival}
                        onChange={(e) => updateProcess(index, 'arrival', Number(e.target.value) || 0)}
                                className="w-20 text-center text-sm"
                                placeholder="0"
                      />
                    </td>
                            <td className="px-3 py-3">
                      <Input
                        type="number"
                        min="0"
                        value={process.burst}
                        onChange={(e) => updateProcess(index, 'burst', Number(e.target.value) || 0)}
                                className="w-20 text-center text-sm"
                                placeholder="0"
                      />
                    </td>
                    {additionalFields && (
                              <td className="px-3 py-3">
                        <Input
                          type={process.priority !== undefined || process.deadline !== undefined || process.tickets !== undefined ? "number" : "text"}
                          min={process.priority !== undefined || process.deadline !== undefined || process.tickets !== undefined ? "0" : undefined}
                          value={process.priority || process.deadline || process.tickets || process.group || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (process.priority !== undefined) {
                              updateProcess(index, 'priority', Number(value) || 0);
                            } else if (process.deadline !== undefined) {
                              updateProcess(index, 'deadline', Number(value) || 0);
                            } else if (process.tickets !== undefined) {
                              updateProcess(index, 'tickets', Number(value) || 0);
                            } else if (process.group !== undefined) {
                              updateProcess(index, 'group', value);
                            }
                          }}
                                  className="w-20 text-center text-sm"
                                  placeholder={process.priority !== undefined ? "0" : 
                                             process.deadline !== undefined ? "0" :
                                             process.tickets !== undefined ? "0" :
                                             process.group !== undefined ? "A" : "Additional"}
                        />
                      </td>
                    )}
                            <td className="px-3 py-3 text-center">
                      <Button
                                variant="ghost"
                        size="sm"
                        onClick={() => removeProcess(index)}
                        disabled={tableProcesses.length === 1}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 p-2"
                      >
                                <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                          </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

                  <div className="flex gap-3 pt-4">
            <Button 
              onClick={addProcess}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-soft"
            >
                      <Plus className="w-4 h-4" />
              Add Process
            </Button>
            <Button 
              onClick={applyProcesses}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-soft"
            >
                      <Play className="w-4 h-4" />
                      Apply & Calculate
            </Button>
          </div>
                </div>
              </Card>
            </motion.div>

            {/* Active Processes */}
            {processes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="p-6 shadow-soft border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Play className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Active Processes</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
            {processes.map((p, i) => (
                      <motion.span 
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                      >
                {p.name} (A:{p.arrival}, B:{p.burst}
                {p.priority && `, Pr:${p.priority}`}
                {p.deadline && `, D:${p.deadline}`}
                {p.tickets && `, T:${p.tickets}`}
                {p.group && `, G:${p.group}`})
                        <button 
                          onClick={() => setProcesses(processes.filter((_, j) => j !== i))} 
                          className="ml-1 hover:opacity-70 transition-opacity"
                        >
                          ×
                        </button>
                      </motion.span>
            ))}
          </div>
        </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Results and Charts */}
          <div className="lg:col-span-2 space-y-6">
        {/* Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="p-6 shadow-soft border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Calculator className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Performance Metrics</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{avgTAT}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">Average Turnaround Time</div>
            </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{avgWT}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">Average Waiting Time</div>
            </div>
          </div>
          
                <div className="overflow-x-auto">
                  <table className="w-full text-center">
              <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">Process</th>
                        <th className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">Arrival</th>
                        <th className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">Burst</th>
                        <th className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">Finish</th>
                        <th className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">TAT</th>
                        <th className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">WT</th>
                </tr>
              </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {results.map((p, i) => (
                        <motion.tr 
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{p.name}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.arrival}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.burst}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.finish}</td>
                          <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-medium">{p.tat}</td>
                          <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">{p.wt}</td>
                        </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
            </motion.div>

            {/* Gantt Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="p-6 shadow-soft border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Gantt Chart Visualization</h2>
                  </div>
                  <Button 
                    onClick={handleOpenAR} 
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-soft"
                  >
                    <Eye className="w-4 h-4" />
                    View in AR
                  </Button>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <ClassicGanttChart gantt={gantt} />
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <SimpleARModal 
        open={arOpen} 
        onClose={() => setArOpen(false)} 
        gantt={gantt} 
        glbUrl={ganttGlbUrl} 
        title={title}
      />
    </div>
  );
} 