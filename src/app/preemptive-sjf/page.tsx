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

function calculateSRTF(processes: Process[]): SchedulingResult {
  let n = processes.length;
  let time = 0, completed = 0;
  let rem = processes.map(p => p.burst);
  let isDone = Array(n).fill(false);
  let finish = Array(n).fill(0);
  let tat = Array(n).fill(0);
  let wt = Array(n).fill(0);
  let gantt: GanttEntry[] = [];
  let last = -1;
  let totalTAT = 0, totalWT = 0;
  
  while (completed < n) {
    let idx = -1, minRem = Infinity;
    for (let i = 0; i < n; i++) {
      if (!isDone[i] && processes[i].arrival <= time && rem[i] < minRem && rem[i] > 0) {
        minRem = rem[i];
        idx = i;
      }
    }
    
    if (idx === -1) {
      time++;
      continue;
    }
    
    // If we switch to a different process, close the previous gantt entry and start a new one
    if (last !== idx) {
      if (gantt.length > 0) {
        gantt[gantt.length - 1].end = time;
      }
      gantt.push({ name: processes[idx].name, start: time, end: time + 1 });
    }
    
    rem[idx]--;
    time++;
    
    if (rem[idx] === 0) {
      isDone[idx] = true;
      completed++;
      finish[idx] = time;
      tat[idx] = finish[idx] - processes[idx].arrival;
      wt[idx] = tat[idx] - processes[idx].burst;
      totalTAT += tat[idx];
      totalWT += wt[idx];
    }
    
    // Update the end time of current gantt entry
    if (gantt.length > 0) {
      gantt[gantt.length - 1].end = time;
    }
    
    last = idx;
  }
  
  return {
    results: processes.map((p, i) => ({ ...p, finish: finish[i], tat: tat[i], wt: wt[i] })),
    avgTAT: (totalTAT / n).toFixed(2),
    avgWT: (totalWT / n).toFixed(2),
    gantt,
  };
}

export default function SRTFPage() {
  const defaultProcesses = [
    { name: "P1", arrival: 0, burst: 8 },
    { name: "P2", arrival: 1, burst: 4 },
    { name: "P3", arrival: 2, burst: 2 },
    { name: "P4", arrival: 3, burst: 1 },
  ];

  const [processes, setProcesses] = useState<Process[]>(defaultProcesses);

  const colorScheme = {
    primary: "text-cyan-700",
    secondary: "bg-cyan-100 text-cyan-700",
    accent: "from-cyan-400 to-cyan-600",
    bg: "from-cyan-100 via-blue-50 to-purple-100"
  };

  return (
    <SchedulingTemplate
      title="Preemptive SJF (SRTF) Scheduling"
      description="Shortest Remaining Time First (SRTF) is the preemptive version of SJF. At every time unit, the process with the smallest remaining burst time is selected. This minimizes average waiting time but can cause starvation for longer jobs."
      algorithm="SRTF"
      colorScheme={colorScheme}
      processes={processes}
      setProcesses={setProcesses}
      calculateScheduling={calculateSRTF}
      defaultProcesses={defaultProcesses}
    />
  );
} 