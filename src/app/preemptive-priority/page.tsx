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

function calculatePreemptivePriority(processes: Process[]): SchedulingResult {
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
    let idx = -1, minPriority = Infinity;
    for (let i = 0; i < n; i++) {
      const priority = processes[i].priority || 0;
      if (!isDone[i] && processes[i].arrival <= time && priority < minPriority && rem[i] > 0) {
        minPriority = priority;
        idx = i;
      }
    }
    if (idx === -1) {
      time++;
      continue;
    }
    if (last !== idx) {
      gantt.push({ name: processes[idx].name, start: time, end: time });
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
      gantt[gantt.length - 1].end = time;
    } else {
      gantt[gantt.length - 1].end = time;
    }
    last = idx;
  }
  return {
    results: processes.map((p, i) => ({ ...p, finish: finish[i], tat: tat[i], wt: wt[i], priority: p.priority || 0 })),
    avgTAT: (totalTAT / n).toFixed(2),
    avgWT: (totalWT / n).toFixed(2),
    gantt,
  };
}

export default function PreemptivePriorityPage() {
  const defaultProcesses = [
    { name: "P1", arrival: 0, burst: 7, priority: 2 },
    { name: "P2", arrival: 2, burst: 4, priority: 1 },
    { name: "P3", arrival: 1, burst: 1, priority: 3 },
    { name: "P4", arrival: 3, burst: 3, priority: 2 },
  ];

  const [processes, setProcesses] = useState<Process[]>(defaultProcesses);

  const colorScheme = {
    primary: "text-purple-700",
    secondary: "bg-purple-100 text-purple-700",
    accent: "from-purple-400 to-purple-600",
    bg: "from-purple-100 via-indigo-50 to-pink-100"
  };

  const additionalFields = (
    <Input
      placeholder="Priority"
      type="number"
      className="sm:w-24"
      required
    />
  );

  // Custom setProcesses to include priority
  const setProcessesWithPriority = (newProcesses: Process[]) => {
    setProcesses(newProcesses);
  };

  return (
    <SchedulingTemplate
      title="Preemptive Priority Scheduling"
      description="Preemptive Priority scheduling executes the highest priority process at every time unit. Lower numbers mean higher priority. If a new process arrives with higher priority, it preempts the running process."
      algorithm="preemptive-priority"
      colorScheme={colorScheme}
      processes={processes}
      setProcesses={setProcesses}
      calculateScheduling={calculatePreemptivePriority}
      additionalFields={additionalFields}
      defaultProcesses={defaultProcesses}
    />
  );
} 