"use client";
import { useState } from "react";
import SchedulingTemplate from "@/components/SchedulingTemplate";
import { Input } from "@/components/ui/input";

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

function calculateRR(processes: Process[], quantum: number): SchedulingResult {
  let time = 0;
  let queue: number[] = [];
  let gantt: GanttEntry[] = [];
  let n = processes.length;
  let rem = processes.map((p) => p.burst);
  let finish = Array(n).fill(0);
  let tat = Array(n).fill(0);
  let wt = Array(n).fill(0);
  let arrived = Array(n).fill(false);
  let completed = 0;

  while (completed < n) {
    for (let i = 0; i < n; i++) {
      if (!arrived[i] && processes[i].arrival <= time) {
        queue.push(i);
        arrived[i] = true;
      }
    }
    if (queue.length === 0) {
      time++;
      continue;
    }
    let idx = queue.shift()!;
    let exec = Math.min(quantum, rem[idx]);
    gantt.push({ name: processes[idx].name, start: time, end: time + exec });
    time += exec;
    rem[idx] -= exec;

    for (let i = 0; i < n; i++) {
      if (!arrived[i] && processes[i].arrival <= time) {
        queue.push(i);
        arrived[i] = true;
      }
    }

    if (rem[idx] > 0) {
      queue.push(idx);
    } else {
      finish[idx] = time;
      tat[idx] = finish[idx] - processes[idx].arrival;
      wt[idx] = tat[idx] - processes[idx].burst;
      completed++;
    }
  }

  let totalTAT = tat.reduce((a, b) => a + b, 0);
  let totalWT = wt.reduce((a, b) => a + b, 0);

  return {
    results: processes.map((p, i) => ({
      ...p,
      finish: finish[i],
      tat: tat[i],
      wt: wt[i],
    })),
    avgTAT: (totalTAT / n).toFixed(2),
    avgWT: (totalWT / n).toFixed(2),
    gantt,
  };
}

export default function RRPage() {
  const [processes, setProcesses] = useState<Process[]>([
    { name: "P1", arrival: 0, burst: 5 },
    { name: "P2", arrival: 1, burst: 3 },
  ]);
  const [quantum, setQuantum] = useState(2);

  const colorScheme = {
    primary: "text-blue-700",
    secondary: "bg-blue-100 text-blue-700",
    accent: "from-blue-400 to-blue-600",
    bg: "from-blue-100 via-cyan-50 to-purple-100",
  };

  const calculateScheduling = (processes: Process[]) =>
    calculateRR(processes, quantum);

  const timeQuantumInput = (
    <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Time Quantum:
        </label>
        <Input
          type="number"
          value={quantum}
          onChange={(e) => setQuantum(Number(e.target.value) || 1)}
          className="w-24"
          min={1}
          placeholder="2"
        />
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Fixed time unit per process cycle
        </span>
      </div>
    </div>
  );

  return (
    <SchedulingTemplate
      title="Round Robin Scheduling"
      description="Round Robin assigns a fixed time unit (quantum) per process and cycles through them, ensuring fairness and preemption. It is widely used in time-sharing systems."
      algorithm="round-robin"
      colorScheme={colorScheme}
      processes={processes}
      setProcesses={setProcesses}
      calculateScheduling={calculateScheduling}
      timeQuantumInput={timeQuantumInput}
    />
  );
}
