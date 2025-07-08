"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 flex flex-col items-center justify-center px-2 sm:px-4 md:px-8 py-6">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-sans text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-blue-600 mb-3 sm:mb-4 text-center drop-shadow-lg">
        Process Scheduling Visualizer
      </h1>
      <p className="max-w-lg sm:max-w-xl md:max-w-2xl text-base sm:text-lg font-medium font-sans text-gray-700 dark:text-gray-200 text-center mb-6 sm:mb-10">
        Explore and visualize different CPU process scheduling algorithms. Add your own processes, see Gantt charts, and understand how each algorithm works with beautiful, interactive UI and in AR.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 w-full max-w-xs sm:max-w-2xl md:max-w-4xl">
        {algorithms.map((algo, idx) => (
          <motion.a
            key={algo.name}
            href={algo.path}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.07, ease: 'easeOut' }}
            whileHover={{
              scale: 1.045,
              boxShadow: "0 8px 32px 0 rgba(80, 120, 255, 0.18)",
              transition: { duration: 0.18, delay: 0 }
            }}
            whileFocus={{
              scale: 1.045,
              boxShadow: "0 0 0 4px #6366f1, 0 8px 32px 0 rgba(80, 120, 255, 0.18)",
              transition: { duration: 0.18, delay: 0 }
            }}
            tabIndex={0}
            aria-label={`Go to ${algo.name} algorithm`}
            className={`rounded-2xl border border-white/30 shadow-xl hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/60 transition-all duration-300 bg-gradient-to-br ${algo.color} bg-opacity-80 backdrop-blur-lg text-white flex flex-col justify-between p-5 sm:p-7 cursor-pointer font-sans`}
            style={{ minHeight: 200, textDecoration: 'none' }}
          >
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-sans mb-1 sm:mb-2 drop-shadow-lg">{algo.name}</h2>
              <p className="mb-3 sm:mb-4 text-sm sm:text-base font-medium font-sans text-white/90">{algo.desc}</p>
            </div>
            <div className="mt-2">
              <span className="inline-block w-full bg-white/90 text-blue-700 font-semibold hover:bg-white hover:scale-105 transition-all duration-200 mt-2 rounded-xl shadow-md backdrop-blur-md font-sans text-sm sm:text-base text-center py-2 px-4">Try {algo.name}</span>
            </div>
          </motion.a>
        ))}
      </div>
      <footer className="mt-10 sm:mt-16 text-gray-500 text-xs sm:text-sm text-center">
        {/* Made with <span className="text-pink-500">♥</span> using Next.js, Tailwind CSS, and shadcn/ui */}
      </footer>
    </div>
  );
}
