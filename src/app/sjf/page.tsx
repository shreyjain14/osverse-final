"use client";
import { useState } from "react";
import SchedulingTemplate from "@/components/SchedulingTemplate";

interface Process {
  name: string;
  arrival: number;
  burst: number;
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

function calculateSJF(processes: Process[]): SchedulingResult {
  let time = 0;
  let completed = 0;
  let n = processes.length;
  let isDone = Array(n).fill(false);
  let gantt: GanttEntry[] = [];
  let totalTAT = 0, totalWT = 0;
  let results = Array(n);
  while (completed < n) {
    let idx = -1;
    let minBurst = Infinity;
    for (let i = 0; i < n; i++) {
      if (!isDone[i] && processes[i].arrival <= time && processes[i].burst < minBurst) {
        minBurst = processes[i].burst;
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
    results[idx] = { ...processes[idx], finish, tat, wt };
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

export default function SJFPage() {
  const [processes, setProcesses] = useState<Process[]>([
    { name: "P1", arrival: 0, burst: 6 },
    { name: "P2", arrival: 1, burst: 2 },
  ]);

  const colorScheme = {
    primary: "text-green-700",
    secondary: "bg-green-100 text-green-700",
    accent: "from-green-400 to-green-600",
    bg: "from-green-100 via-lime-50 to-teal-100"
  };

  return (
    <SchedulingTemplate
      title="SJF Scheduling"
      description="Shortest Job First (SJF) schedules the process with the smallest execution time next. It minimizes average waiting time but can cause starvation for longer jobs."
      colorScheme={colorScheme}
      processes={processes}
      setProcesses={setProcesses}
      calculateScheduling={calculateSJF}
    />
  );
} 