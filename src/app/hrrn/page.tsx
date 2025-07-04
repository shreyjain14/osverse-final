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

function calculateHRRN(processes: Process[]): SchedulingResult {
  let time = 0;
  let completed = 0;
  let n = processes.length;
  let isDone = Array(n).fill(false);
  let gantt: GanttEntry[] = [];
  let totalTAT = 0, totalWT = 0;
  let results = Array(n);
  while (completed < n) {
    let idx = -1;
    let maxRR = -1;
    for (let i = 0; i < n; i++) {
      if (!isDone[i] && processes[i].arrival <= time) {
        const wt = time - processes[i].arrival;
        const rr = (wt + processes[i].burst) / processes[i].burst;
        if (rr > maxRR) {
          maxRR = rr;
          idx = i;
        }
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

export default function HRRNPage() {
  const [processes, setProcesses] = useState<Process[]>([
    { name: "P1", arrival: 0, burst: 6 },
    { name: "P2", arrival: 1, burst: 2 },
  ]);

  const colorScheme = {
    primary: "text-fuchsia-700",
    secondary: "bg-fuchsia-100 text-fuchsia-700",
    accent: "from-fuchsia-400 to-fuchsia-600",
    bg: "from-fuchsia-100 via-pink-50 to-purple-100"
  };

  return (
    <SchedulingTemplate
      title="Highest Response Ratio Next (HRRN) Scheduling"
      description="HRRN schedules the process with the highest response ratio next. Response ratio = (waiting time + burst time) / burst time. This balances short and long jobs."
      colorScheme={colorScheme}
      processes={processes}
      setProcesses={setProcesses}
      calculateScheduling={calculateHRRN}
    />
  );
} 