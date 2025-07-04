"use client";
import { useState } from "react";
import SchedulingTemplate from "@/components/SchedulingTemplate";
import GanttChart from "@/components/GanttChart";

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

function calculateFCFS(processes: Process[]): SchedulingResult {
  let time = 0;
  let gantt: GanttEntry[] = [];
  let totalTAT = 0, totalWT = 0;
  const results = processes.map((p, i) => {
    const start = time;
    time = Math.max(time, p.arrival) + p.burst;
    const finish = time;
    const tat = finish - p.arrival;
    const wt = tat - p.burst;
    totalTAT += tat;
    totalWT += wt;
    gantt.push({ name: p.name, start, end: finish });
    return { ...p, finish, tat, wt };
  });
  return {
    results,
    avgTAT: (totalTAT / processes.length).toFixed(2),
    avgWT: (totalWT / processes.length).toFixed(2),
    gantt,
  };
}

export default function FCFSPage() {
  const [processes, setProcesses] = useState<Process[]>([
    { name: "P1", arrival: 0, burst: 4 },
    { name: "P2", arrival: 1, burst: 3 },
  ]);

  const colorScheme = {
    primary: "text-pink-700",
    secondary: "bg-pink-100 text-pink-700",
    accent: "from-pink-400 to-pink-600",
    bg: "from-pink-100 via-orange-50 to-yellow-100"
  };

  return (
    <SchedulingTemplate
      title="FCFS Scheduling"
      description="First-Come, First-Served (FCFS) is the simplest scheduling algorithm where the process that arrives first is executed first. It is non-preemptive and easy to implement, but can lead to the convoy effect."
      colorScheme={colorScheme}
      processes={processes}
      setProcesses={setProcesses}
      calculateScheduling={calculateFCFS}
    />
  );
} 