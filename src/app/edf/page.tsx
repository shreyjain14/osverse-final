"use client";
import { useState } from "react";
import SchedulingTemplate from "@/components/SchedulingTemplate";
import { Input } from "@/components/ui/input";

interface Process {
  name: string;
  arrival: number;
  burst: number;
  deadline?: number; // Make it optional to match SchedulingTemplate
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

function calculateEDF(processes: Process[]): SchedulingResult {
  let time = 0;
  let completed = 0;
  let n = processes.length;
  let isDone = Array(n).fill(false);
  let gantt: GanttEntry[] = [];
  let totalTAT = 0, totalWT = 0;
  let results = Array(n);
  while (completed < n) {
    let idx = -1;
    let minDeadline = Infinity;
    for (let i = 0; i < n; i++) {
      if (!isDone[i] && processes[i].arrival <= time && 
          processes[i].deadline !== undefined && 
          processes[i].deadline! < minDeadline) {
        minDeadline = processes[i].deadline!;
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

export default function EDFPage() {
  const defaultProcesses = [
    { name: "P1", arrival: 0, burst: 4, deadline: 10 },
    { name: "P2", arrival: 1, burst: 3, deadline: 8 },
    { name: "P3", arrival: 2, burst: 2, deadline: 5 },
    { name: "P4", arrival: 3, burst: 1, deadline: 7 },
  ];

  const [processes, setProcesses] = useState<Process[]>(defaultProcesses);
  const [deadline, setDeadline] = useState("");

  const colorScheme = {
    primary: "text-rose-700",
    secondary: "bg-rose-100 text-rose-700",
    accent: "from-rose-400 to-rose-600",
    bg: "from-rose-100 via-pink-50 to-red-100"
  };

  const additionalFields = (
    <Input
      placeholder="Deadline"
      type="number"
      value={deadline}
      onChange={e => setDeadline(e.target.value)}
      className="sm:w-24"
      required
    />
  );

  // Custom setProcesses to include deadline
  const setProcessesWithDeadline = (newProcesses: Process[]) => {
    setProcesses(newProcesses);
    setDeadline("");
  };

  return (
    <SchedulingTemplate
      title="Earliest Deadline First (EDF) Scheduling"
      description="EDF schedules the process with the earliest deadline next. It is a dynamic priority scheduling algorithm used in real-time systems."
      algorithm="EDF"
      colorScheme={colorScheme}
      processes={processes}
      setProcesses={setProcessesWithDeadline}
      calculateScheduling={calculateEDF}
      additionalFields={additionalFields}
      defaultProcesses={defaultProcesses}
    />
  );
} 