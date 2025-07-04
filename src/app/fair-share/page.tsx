"use client";
import { useState } from "react";
import SchedulingTemplate from "@/components/SchedulingTemplate";
import { Input } from "@/components/ui/input";

interface Process {
  name: string;
  arrival: number;
  burst: number;
  group: string;
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

function calculateFairShare(processes: Process[]): SchedulingResult {
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
  // Group processes by group
  const groupMap: { [group: string]: number[] } = {};
  processes.forEach((p, i) => {
    if (!groupMap[p.group]) groupMap[p.group] = [];
    groupMap[p.group].push(i);
  });
  const groupNames = Object.keys(groupMap);
  let groupIdx = 0;
  while (completed < n) {
    let found = false;
    for (let gi = 0; gi < groupNames.length; gi++) {
      const group = groupNames[(groupIdx + gi) % groupNames.length];
      const indices = groupMap[group];
      for (let idx of indices) {
        if (!isDone[idx] && processes[idx].arrival <= time && rem[idx] > 0) {
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
          found = true;
          groupIdx = (groupIdx + gi + 1) % groupNames.length;
          break;
        }
      }
      if (found) break;
    }
    if (!found) time++;
  }
  return {
    results: processes.map((p, i) => ({ ...p, finish: finish[i], tat: tat[i], wt: wt[i] })),
    avgTAT: (totalTAT / n).toFixed(2),
    avgWT: (totalWT / n).toFixed(2),
    gantt,
  };
}

export default function FairSharePage() {
  const [processes, setProcesses] = useState<Process[]>([
    { name: "P1", arrival: 0, burst: 4, group: "A" },
    { name: "P2", arrival: 1, burst: 3, group: "B" },
  ]);
  const [group, setGroup] = useState("");

  const colorScheme = {
    primary: "text-lime-700",
    secondary: "bg-lime-100 text-lime-700",
    accent: "from-lime-400 to-lime-600",
    bg: "from-lime-100 via-green-50 to-yellow-100"
  };

  const additionalFields = (
    <Input
      placeholder="Group"
      value={group}
      onChange={e => setGroup(e.target.value)}
      className="sm:w-24"
      required
    />
  );

  // Custom setProcesses to include group
  const setProcessesWithGroup = (newProcesses: Process[]) => {
    setProcesses(newProcesses);
    setGroup("");
  };

  return (
    <SchedulingTemplate
      title="Fair Share Scheduling"
      description="Fair Share Scheduling divides CPU time among groups, then among processes within each group. Groups are scheduled round-robin, then processes within group."
      colorScheme={colorScheme}
      processes={processes}
      setProcesses={setProcessesWithGroup}
      calculateScheduling={calculateFairShare}
      additionalFields={additionalFields}
    />
  );
} 