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

// Simple 2-level feedback queue: Q0 (quantum=2, RR), Q1 (FCFS)
function calculateMLFQ(processes: Process[], quantum: number = 2): SchedulingResult {
  let n = processes.length;
  let time = 0, completed = 0;
  let rem = processes.map(p => p.burst);
  let finish = Array(n).fill(0);
  let tat = Array(n).fill(0);
  let wt = Array(n).fill(0);
  let isDone = Array(n).fill(false);
  let gantt: GanttEntry[] = [];
  let queue0: number[] = [];
  let queue1: number[] = [];
  let arrived = Array(n).fill(false);

  while (completed < n) {
    // Arrivals
    for (let i = 0; i < n; i++) {
      if (!arrived[i] && processes[i].arrival <= time) {
        queue0.push(i);
        arrived[i] = true;
      }
    }
    let idx = -1;
    let fromQ0 = false;
    if (queue0.length > 0) {
      idx = queue0.shift()!;
      fromQ0 = true;
    } else if (queue1.length > 0) {
      idx = queue1.shift()!;
    }
    if (idx === -1) {
      time++;
      continue;
    }
    if (fromQ0) {
      let exec = Math.min(quantum, rem[idx]);
      gantt.push({ name: processes[idx].name, start: time, end: time + exec });
      time += exec;
      rem[idx] -= exec;
      // New arrivals during execution
      for (let i = 0; i < n; i++) {
        if (!arrived[i] && processes[i].arrival <= time) {
          queue0.push(i);
          arrived[i] = true;
        }
      }
      if (rem[idx] > 0) {
        queue1.push(idx); // Demote to Q1
      } else {
        finish[idx] = time;
        tat[idx] = finish[idx] - processes[idx].arrival;
        wt[idx] = tat[idx] - processes[idx].burst;
        isDone[idx] = true;
        completed++;
      }
    } else {
      // FCFS in Q1
      gantt.push({ name: processes[idx].name, start: time, end: time + rem[idx] });
      time += rem[idx];
      finish[idx] = time;
      tat[idx] = finish[idx] - processes[idx].arrival;
      wt[idx] = tat[idx] - processes[idx].burst;
      isDone[idx] = true;
      completed++;
    }
  }
  let totalTAT = tat.reduce((a, b) => a + b, 0);
  let totalWT = wt.reduce((a, b) => a + b, 0);
  return {
    results: processes.map((p, i) => ({ ...p, finish: finish[i], tat: tat[i], wt: wt[i] })),
    avgTAT: (totalTAT / n).toFixed(2),
    avgWT: (totalWT / n).toFixed(2),
    gantt,
  };
}

export default function MLFQPage() {
  const defaultProcesses = [
    { name: "P1", arrival: 0, burst: 5 },
    { name: "P2", arrival: 1, burst: 3 },
    { name: "P3", arrival: 2, burst: 6 },
    { name: "P4", arrival: 3, burst: 2 },
  ];

  const [processes, setProcesses] = useState<Process[]>(defaultProcesses);
  const [quantum, setQuantum] = useState(2);

  const colorScheme = {
    primary: "text-sky-700",
    secondary: "bg-sky-100 text-sky-700",
    accent: "from-sky-400 to-sky-600",
    bg: "from-sky-100 via-blue-50 to-cyan-100"
  };

  const additionalFields = (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium">Q0 Quantum:</label>
      <Input 
        type="number" 
        value={quantum} 
        onChange={e => setQuantum(Number(e.target.value))} 
        className="w-20" 
        min={1} 
      />
    </div>
  );

  const calculateScheduling = (processes: Process[]) => calculateMLFQ(processes, quantum);

  return (
    <SchedulingTemplate
      title="Multilevel Feedback Queue Scheduling"
      description="MLFQ uses multiple queues with different priorities and feedback. New processes start in the highest queue (Q0, RR), and if not finished, are demoted to lower queues (Q1, FCFS)."
      algorithm="multilevel-feedback-queue"
      colorScheme={colorScheme}
      processes={processes}
      setProcesses={setProcesses}
      calculateScheduling={calculateScheduling}
      additionalFields={additionalFields}
      defaultProcesses={defaultProcesses}
    />
  );
} 