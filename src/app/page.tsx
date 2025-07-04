import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const algorithms = [
  {
    name: "FCFS",
    path: "/fcfs",
    color: "from-pink-400 to-pink-600",
    desc: "First-Come, First-Served (FCFS) is the simplest scheduling algorithm where the process that arrives first is executed first.",
  },
  {
    name: "Round Robin",
    path: "/round-robin",
    color: "from-blue-400 to-blue-600",
    desc: "Round Robin assigns a fixed time unit per process and cycles through them, ensuring fairness.",
  },
  {
    name: "SJF",
    path: "/sjf",
    color: "from-green-400 to-green-600",
    desc: "Shortest Job First (SJF) schedules the process with the smallest execution time next.",
  },
  {
    name: "Priority",
    path: "/priority",
    color: "from-yellow-400 to-yellow-600",
    desc: "Priority scheduling executes processes based on priority, with higher priority processes running first.",
  },
  {
    name: "Preemptive SJF (SRTF)",
    path: "/preemptive-sjf",
    color: "from-cyan-400 to-cyan-600",
    desc: "Shortest Remaining Time First (SRTF) is the preemptive version of SJF.",
  },
  {
    name: "Preemptive Priority",
    path: "/preemptive-priority",
    color: "from-purple-400 to-purple-600",
    desc: "Preemptive Priority executes the highest priority process at every time unit.",
  },
  {
    name: "Multilevel Queue",
    path: "/multilevel-queue",
    color: "from-amber-400 to-amber-600",
    desc: "Processes are separated into different queues, each with its own policy and priority.",
  },
  {
    name: "Multilevel Feedback Queue",
    path: "/multilevel-feedback-queue",
    color: "from-sky-400 to-sky-600",
    desc: "Processes can move between queues based on their behavior and feedback.",
  },
  {
    name: "LJF",
    path: "/ljf",
    color: "from-orange-400 to-orange-600",
    desc: "Longest Job First (LJF) schedules the process with the largest execution time next.",
  },
  {
    name: "HRRN",
    path: "/hrrn",
    color: "from-fuchsia-400 to-fuchsia-600",
    desc: "Highest Response Ratio Next (HRRN) schedules the process with the highest response ratio next.",
  },
  {
    name: "EDF",
    path: "/edf",
    color: "from-rose-400 to-rose-600",
    desc: "Earliest Deadline First (EDF) schedules the process with the earliest deadline next.",
  },
  {
    name: "Lottery",
    path: "/lottery",
    color: "from-indigo-400 to-indigo-600",
    desc: "Lottery scheduling assigns tickets to processes and randomly selects one to run.",
  },
  {
    name: "Fair Share",
    path: "/fair-share",
    color: "from-lime-400 to-lime-600",
    desc: "Fair Share divides CPU time among groups, then among processes within each group.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-blue-600 mb-4 text-center drop-shadow-lg">
        Process Scheduling Visualizer
      </h1>
      <p className="max-w-2xl text-lg text-gray-700 dark:text-gray-200 text-center mb-10">
        Explore and visualize different CPU process scheduling algorithms. Add your own processes, see Gantt charts, and understand how each algorithm works with beautiful, interactive UI and in AR.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {algorithms.map((algo) => (
          <Card
            key={algo.name}
            className={`p-6 shadow-xl bg-gradient-to-br ${algo.color} text-white flex flex-col justify-between`}
          >
            <div>
              <h2 className="text-2xl font-bold mb-2">{algo.name}</h2>
              <p className="mb-4 text-base font-medium">{algo.desc}</p>
            </div>
            <Button asChild className="w-full bg-white text-black font-semibold hover:bg-gray-100 mt-2">
              <Link href={algo.path}>Try {algo.name}</Link>
            </Button>
          </Card>
        ))}
        </div>
      <footer className="mt-16 text-gray-500 text-sm text-center">
        {/* Made with <span className="text-pink-500">♥</span> using Next.js, Tailwind CSS, and shadcn/ui */}
      </footer>
    </div>
  );
}
