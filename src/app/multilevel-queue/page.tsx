"use client";
import { useState } from "react";
import SchedulingTemplate from "@/components/SchedulingTemplate";
import { Input } from "@/components/ui/input";

interface Process {
  name: string;
  arrival: number;
  burst: number;
  queue: number; // 0 = system, 1 = user
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

function calculateMultilevelQueue(processes: Process[]): SchedulingResult {
  // System queue (0) has higher priority than user queue (1)
  let time = 0;
  let completed = 0;
  let n = processes.length;
  let isDone = Array(n).fill(false);
  let gantt: GanttEntry[] = [];
  let totalTAT = 0, totalWT = 0;
  let results = Array(n);
  while (completed < n) {
    let idx = -1;
    let minQueue = 2;
    for (let i = 0; i < n; i++) {
      if (!isDone[i] && processes[i].arrival <= time && processes[i].queue < minQueue) {
        minQueue = processes[i].queue;
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

export default function MultilevelQueuePage() {
  const [processes, setProcesses] = useState<Process[]>([
    { name: "P1", arrival: 0, burst: 4, queue: 0 },
    { name: "P2", arrival: 1, burst: 3, queue: 1 },
  ]);
  const [queue, setQueue] = useState("0");

  const colorScheme = {
    primary: "text-amber-700",
    secondary: "bg-amber-100 text-amber-700",
    accent: "from-amber-400 to-amber-600",
    bg: "from-amber-100 via-yellow-50 to-orange-100"
  };

  const additionalFields = (
    <select
      value={queue}
      onChange={e => setQueue(e.target.value)}
      className="sm:w-24 border rounded px-2 py-1"
      required
    >
      <option value="0">System</option>
      <option value="1">User</option>
    </select>
  );

  // Custom setProcesses to include queue
  const setProcessesWithQueue = (newProcesses: Process[]) => {
    setProcesses(newProcesses);
    setQueue("0");
  };

  return (
    <SchedulingTemplate
      title="Multilevel Queue Scheduling"
      description="Multilevel Queue scheduling separates processes into different queues (e.g., system and user), each with its own scheduling policy and priority. System queue always runs before user queue."
      colorScheme={colorScheme}
      processes={processes}
      setProcesses={setProcessesWithQueue}
      calculateScheduling={calculateMultilevelQueue}
      additionalFields={additionalFields}
    />
  );
} 