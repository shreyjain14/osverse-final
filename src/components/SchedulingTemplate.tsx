"use client";
import { useState } from "react";
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
  const [name, setName] = useState("");
  const [arrival, setArrival] = useState("");
  const [burst, setBurst] = useState("");
  const [priority, setPriority] = useState("");

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Process Input Form */}
        <Card className="p-6">
          <h2 className={`text-xl font-semibold mb-4 ${colorScheme.primary}`}>Add Process</h2>
          <form
            className="flex flex-col gap-4"
            onSubmit={e => {
              e.preventDefault();
              const newProcess: Process = {
                name: name || `P${processes.length + 1}`,
                arrival: Number(arrival),
                burst: Number(burst),
                ...(priority && { priority: Number(priority) })
              };
              setProcesses([...processes, newProcess]);
              setName(""); setArrival(""); setBurst(""); setPriority("");
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
              <Input placeholder="Arrival" type="number" value={arrival} onChange={e => setArrival(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Burst" type="number" value={burst} onChange={e => setBurst(e.target.value)} required />
              {additionalFields}
            </div>
            <Button type="submit" className={`${colorScheme.accent} hover:${colorScheme.primary} text-white`}>
              Add Process
            </Button>
          </form>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {processes.map((p, i) => (
              <span key={i} className={`${colorScheme.secondary} ${colorScheme.primary} px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2`}>
                {p.name} (A:{p.arrival}, B:{p.burst}
                {p.priority && `, Pr:${p.priority}`})
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
      </Card>
    </div>
  );
} 