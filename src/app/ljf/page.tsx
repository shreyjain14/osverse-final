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

function calculateLJF(processes: Process[]): SchedulingResult {
  let time = 0;
  let completed = 0;
  let n = processes.length;
  let isDone = Array(n).fill(false);
  let gantt: GanttEntry[] = [];
  let totalTAT = 0, totalWT = 0;
  let results = Array(n);
  while (completed < n) {
    let idx = -1;
    let maxBurst = -1;
    for (let i = 0; i < n; i++) {
      if (!isDone[i] && processes[i].arrival <= time && processes[i].burst > maxBurst) {
        maxBurst = processes[i].burst;
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

export default function LJFPage() {
  const defaultProcesses = [
    { name: "P1", arrival: 0, burst: 6 },
    { name: "P2", arrival: 1, burst: 2 },
    { name: "P3", arrival: 2, burst: 8 },
    { name: "P4", arrival: 3, burst: 1 },
  ];

  const [processes, setProcesses] = useState<Process[]>(defaultProcesses);

  const colorScheme = {
    primary: "text-orange-700",
    secondary: "bg-orange-100 text-orange-700",
    accent: "from-orange-400 to-orange-600",
    bg: "from-orange-100 via-yellow-50 to-red-100"
  };

  return (
    <SchedulingTemplate
      title="Longest Job First (LJF) Scheduling"
      description="Longest Job First (LJF) schedules the process with the largest execution time next. It can lead to high waiting times for short jobs."
      algorithm="LJF"
      colorScheme={colorScheme}
      processes={processes}
      setProcesses={setProcesses}
      calculateScheduling={calculateLJF}
      defaultProcesses={defaultProcesses}
    />
  );
} 