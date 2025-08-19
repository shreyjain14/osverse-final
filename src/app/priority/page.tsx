"use client";
import { useState } from "react";
import SchedulingTemplate from "@/components/SchedulingTemplate";
import { Input } from "@/components/ui/input";

interface Process {
  name: string;
  arrival: number;
  burst: number;
  priority?: number;
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

function calculatePriority(processes: Process[]): SchedulingResult {
  let time = 0;
  let completed = 0;
  let n = processes.length;
  let isDone = Array(n).fill(false);
  let gantt: GanttEntry[] = [];
  let totalTAT = 0, totalWT = 0;
  let results = Array(n);
  while (completed < n) {
    let idx = -1;
    let minPriority = Infinity;
    for (let i = 0; i < n; i++) {
      const priority = processes[i].priority;
      if (!isDone[i] && processes[i].arrival <= time && priority !== undefined && priority < minPriority) {
        minPriority = priority;
        idx = i;
      }
    }
    if (idx === -1) {
      time++;
      continue;
    }
    const start = time;
    time += processes[idx].burst;
    const finish = time;
    const tat = finish - processes[idx].arrival;
    const wt = tat - processes[idx].burst;
    totalTAT += tat;
    totalWT += wt;
    gantt.push({ name: processes[idx].name, start, end: finish });
    results[idx] = { ...processes[idx], finish, tat, wt, priority: processes[idx].priority || 0 };
    isDone[idx] = true;
    completed++;
  }
  return {
    results,
    avgTAT: (totalTAT / n).toFixed(2),
    avgWT: (totalWT / n).toFixed(2),
    gantt,
  };
}

export default function PriorityPage() {
  const [processes, setProcesses] = useState<Process[]>([
    { name: "P1", arrival: 0, burst: 4, priority: 2 },
    { name: "P2", arrival: 1, burst: 3, priority: 1 },
  ]);

  const colorScheme = {
    primary: "text-yellow-700",
    secondary: "bg-yellow-100 text-yellow-700",
    accent: "from-yellow-400 to-yellow-600",
    bg: "from-yellow-100 via-orange-50 to-red-100"
  };

  const defaultProcesses = [
    { name: "P1", arrival: 0, burst: 4, priority: 2 },
    { name: "P2", arrival: 1, burst: 3, priority: 1 },
    { name: "P3", arrival: 2, burst: 5, priority: 3 }
  ];

  return (
    <SchedulingTemplate
      title="Priority Scheduling"
      description="Priority scheduling executes processes based on priority, with higher priority processes running first. Lower numbers mean higher priority. Can cause starvation for low-priority processes."
      algorithm="priority"
      colorScheme={colorScheme}
      processes={processes}
      setProcesses={setProcesses}
      calculateScheduling={calculatePriority}
      defaultProcesses={defaultProcesses}
    />
  );
} 