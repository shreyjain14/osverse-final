"use client";
import { useState } from "react";
import SchedulingTemplate from "@/components/SchedulingTemplate";
import { Input } from "@/components/ui/input";

interface Process {
  name: string;
  arrival: number;
  burst: number;
  tickets: number;
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

function calculateLottery(processes: Process[]): SchedulingResult {
  let time = 0;
  let completed = 0;
  let n = processes.length;
  let rem = processes.map(p => p.burst);
  let isDone = Array(n).fill(false);
  let gantt: GanttEntry[] = [];
  let finish = Array(n).fill(0);
  let tat = Array(n).fill(0);
  let wt = Array(n).fill(0);
  let totalTAT = 0, totalWT = 0;
  while (completed < n) {
    // Only consider arrived and not finished processes
    let candidates = [];
    let tickets = [];
    for (let i = 0; i < n; i++) {
      if (!isDone[i] && processes[i].arrival <= time && rem[i] > 0) {
        candidates.push(i);
        for (let t = 0; t < processes[i].tickets; t++) tickets.push(i);
      }
    }
    if (candidates.length === 0) {
      time++;
      continue;
    }
    // Randomly pick a ticket (simulate fairness)
    let idx = tickets[Math.floor(Math.random() * tickets.length)];
    gantt.push({ name: processes[idx].name, start: time, end: time + 1 });
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
  }
  return {
    results: processes.map((p, i) => ({ ...p, finish: finish[i], tat: tat[i], wt: wt[i] })),
    avgTAT: (totalTAT / n).toFixed(2),
    avgWT: (totalWT / n).toFixed(2),
    gantt,
  };
}

export default function LotteryPage() {
  const [processes, setProcesses] = useState<Process[]>([
    { name: "P1", arrival: 0, burst: 4, tickets: 5 },
    { name: "P2", arrival: 1, burst: 3, tickets: 2 },
  ]);
  const [tickets, setTickets] = useState("");

  const colorScheme = {
    primary: "text-indigo-700",
    secondary: "bg-indigo-100 text-indigo-700",
    accent: "from-indigo-400 to-indigo-600",
    bg: "from-indigo-100 via-blue-50 to-purple-100"
  };

  const additionalFields = (
    <Input
      placeholder="Tickets"
      type="number"
      value={tickets}
      onChange={e => setTickets(e.target.value)}
      className="sm:w-24"
      required
    />
  );

  // Custom setProcesses to include tickets
  const setProcessesWithTickets = (newProcesses: Process[]) => {
    setProcesses(newProcesses);
    setTickets("");
  };

  return (
    <SchedulingTemplate
      title="Lottery Scheduling"
      description="Lottery scheduling assigns tickets to processes. At each time unit, a random ticket is drawn and the corresponding process runs. More tickets means higher chance to run."
      colorScheme={colorScheme}
      processes={processes}
      setProcesses={setProcessesWithTickets}
      calculateScheduling={calculateLottery}
      additionalFields={additionalFields}
    />
  );
} 