"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line, Area } from 'recharts';
import GanttChart from "./GanttChart";
import ClassicGanttChart from "./ClassicGanttChart";

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

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colorScheme.bg} flex flex-col items-center p-6`}>
      <div className="w-full max-w-4xl mb-4">
        <Link href="/">
          <Button variant="outline" className={`mb-4 bg-white ${colorScheme.primary} hover:${colorScheme.secondary}`}>
            ← Back
          </Button>
        </Link>
      </div>
      
      <Card className={`max-w-4xl w-full p-8 shadow-2xl bg-gradient-to-br ${colorScheme.accent} text-white mb-8`}>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="mb-4 text-lg">{description}</p>
      </Card>

      <div className="w-full max-w-4xl space-y-8">
        {/* Process Input Table */}
        <Card className="p-6">
          <h2 className={`text-xl font-semibold mb-4 ${colorScheme.primary}`}>Process Input</h2>
          
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className={`${colorScheme.secondary} ${colorScheme.primary}`}>
                  <th className="px-3 py-2 text-left">Process</th>
                  <th className="px-3 py-2 text-center">Arrival</th>
                  <th className="px-3 py-2 text-center">Burst</th>
                  {additionalFields && (
                    <th className="px-3 py-2 text-center">
                      {tableProcesses[0]?.priority !== undefined ? "Priority" :
                       tableProcesses[0]?.deadline !== undefined ? "Deadline" :
                       tableProcesses[0]?.tickets !== undefined ? "Tickets" :
                       tableProcesses[0]?.group !== undefined ? "Group" : "Additional"}
                    </th>
                  )}
                  <th className="px-3 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableProcesses.map((process, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <Input
                        value={process.name}
                        onChange={(e) => updateProcess(index, 'name', e.target.value)}
                        className="w-20 text-center"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min="0"
                        value={process.arrival}
                        onChange={(e) => updateProcess(index, 'arrival', Number(e.target.value) || 0)}
                        className="w-20 text-center"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min="0"
                        value={process.burst}
                        onChange={(e) => updateProcess(index, 'burst', Number(e.target.value) || 0)}
                        className="w-20 text-center"
                      />
                    </td>
                    {additionalFields && (
                      <td className="px-3 py-2">
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
                          className="w-20 text-center"
                          placeholder={process.priority !== undefined ? "Priority" : 
                                     process.deadline !== undefined ? "Deadline" :
                                     process.tickets !== undefined ? "Tickets" :
                                     process.group !== undefined ? "Group" : "Additional"}
                        />
                      </td>
                    )}
                    <td className="px-3 py-2 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeProcess(index)}
                        disabled={tableProcesses.length === 1}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2 mb-4">
            <Button 
              onClick={addProcess}
              className={`${colorScheme.accent} hover:${colorScheme.primary} text-white`}
            >
              Add Process
            </Button>
            <Button 
              onClick={applyProcesses}
              className={`${colorScheme.accent} hover:${colorScheme.primary} text-white`}
            >
              Apply Processes
            </Button>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {processes.map((p, i) => (
              <span key={i} className={`${colorScheme.secondary} ${colorScheme.primary} px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2`}>
                {p.name} (A:{p.arrival}, B:{p.burst}
                {p.priority && `, Pr:${p.priority}`}
                {p.deadline && `, D:${p.deadline}`}
                {p.tickets && `, T:${p.tickets}`}
                {p.group && `, G:${p.group}`})
                <button onClick={() => setProcesses(processes.filter((_, j) => j !== i))} className="ml-2 hover:opacity-70">×</button>
              </span>
            ))}
          </div>
        </Card>

        {/* Statistics */}
        <Card className="p-6">
          <h2 className={`text-xl font-semibold mb-4 ${colorScheme.primary}`}>Statistics</h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className={`${colorScheme.secondary} p-4 rounded-lg`}>
              <div className="text-2xl font-bold">{avgTAT}</div>
              <div className="text-sm">Average TAT</div>
            </div>
            <div className={`${colorScheme.secondary} p-4 rounded-lg`}>
              <div className="text-2xl font-bold">{avgWT}</div>
              <div className="text-sm">Average WT</div>
            </div>
          </div>
          
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-center border-separate border-spacing-y-2">
              <thead>
                <tr className={`${colorScheme.secondary} ${colorScheme.primary}`}>
                  <th className="px-2 py-1 rounded-l">Process</th>
                  <th className="px-2 py-1">Arrival</th>
                  <th className="px-2 py-1">Burst</th>
                  <th className="px-2 py-1">Finish</th>
                  <th className="px-2 py-1">TAT</th>
                  <th className="px-2 py-1 rounded-r">WT</th>
                </tr>
              </thead>
              <tbody>
                {results.map((p, i) => (
                  <tr key={i} className={`${colorScheme.secondary} ${colorScheme.primary}`}>
                    <td className="px-2 py-1 font-bold">{p.name}</td>
                    <td>{p.arrival}</td>
                    <td>{p.burst}</td>
                    <td>{p.finish}</td>
                    <td>{p.tat}</td>
                    <td>{p.wt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Gantt Chart */}
      <Card className="max-w-4xl w-full p-6 mt-8">
        <h2 className={`text-xl font-semibold mb-4 ${colorScheme.primary}`}>Gantt Chart</h2>
        <ClassicGanttChart gantt={gantt} />
        {gantt.length > 0 && (
          <div className="mt-4 text-center">
            <Link href={`/view-model?data=${encodeURIComponent(JSON.stringify(gantt))}`}>
              <Button asChild className={`${colorScheme.accent} hover:${colorScheme.primary} text-white`}>
                <a>
                  View in 3D / AR
                </a>
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
} 