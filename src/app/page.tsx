"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, BarChart3, Eye, Sparkles } from "lucide-react";
import SchedulingAnimation from "@/components/SchedulingAnimation";
import BackgroundAnimation from "@/components/BackgroundAnimation";
import VideoAnimation from "@/components/VideoAnimation";
import QueueAnimation from "@/components/QueueAnimation";
import LazyAnimation from "@/components/LazyAnimation";
import EnhancedVideoAnimation from "@/components/EnhancedVideoAnimation";
import EnhancedSchedulingAnimation from "@/components/EnhancedSchedulingAnimation";
import EnhancedQueueAnimation from "@/components/EnhancedQueueAnimation";

const algorithms = [
  {
    name: "FCFS",
    path: "/fcfs",
    color: "from-pink-500 via-rose-500 to-pink-600",
    bgColor: "from-pink-50 to-rose-50",
    desc: "First-Come, First-Served (FCFS) is the simplest scheduling algorithm where the process that arrives first is executed first.",
    icon: "⚡",
  },
  {
    name: "Round Robin",
    path: "/round-robin",
    color: "from-blue-500 via-indigo-500 to-blue-600",
    bgColor: "from-blue-50 to-indigo-50",
    desc: "Round Robin assigns a fixed time unit per process and cycles through them, ensuring fairness.",
    icon: "🔄",
  },
  {
    name: "SJF",
    path: "/sjf",
    color: "from-emerald-500 via-green-500 to-emerald-600",
    bgColor: "from-emerald-50 to-green-50",
    desc: "Shortest Job First (SJF) schedules the process with the smallest execution time next.",
    icon: "⚡",
  },
  {
    name: "Priority",
    path: "/priority",
    color: "from-amber-500 via-yellow-500 to-amber-600",
    bgColor: "from-amber-50 to-yellow-50",
    desc: "Priority scheduling executes processes based on priority, with higher priority processes running first.",
    icon: "🎯",
  },
  {
    name: "Preemptive SJF (SRTF)",
    path: "/preemptive-sjf",
    color: "from-cyan-500 via-teal-500 to-cyan-600",
    bgColor: "from-cyan-50 to-teal-50",
    desc: "Shortest Remaining Time First (SRTF) is the preemptive version of SJF.",
    icon: "⚡",
  },
  {
    name: "Preemptive Priority",
    path: "/preemptive-priority",
    color: "from-purple-500 via-violet-500 to-purple-600",
    bgColor: "from-purple-50 to-violet-50",
    desc: "Preemptive Priority executes the highest priority process at every time unit.",
    icon: "🎯",
  },
  {
    name: "Multilevel Queue",
    path: "/multilevel-queue",
    color: "from-orange-500 via-amber-500 to-orange-600",
    bgColor: "from-orange-50 to-amber-50",
    desc: "Processes are separated into different queues, each with its own policy and priority.",
    icon: "📊",
  },
  {
    name: "Multilevel Feedback Queue",
    path: "/multilevel-feedback-queue",
    color: "from-sky-500 via-blue-500 to-sky-600",
    bgColor: "from-sky-50 to-blue-50",
    desc: "Processes can move between queues based on their behavior and feedback.",
    icon: "🔄",
  },
  {
    name: "LJF",
    path: "/ljf",
    color: "from-red-500 via-orange-500 to-red-600",
    bgColor: "from-red-50 to-orange-50",
    desc: "Longest Job First (LJF) schedules the process with the largest execution time next.",
    icon: "📈",
  },
  {
    name: "HRRN",
    path: "/hrrn",
    color: "from-fuchsia-500 via-pink-500 to-fuchsia-600",
    bgColor: "from-fuchsia-50 to-pink-50",
    desc: "Highest Response Ratio Next (HRRN) schedules the process with the highest response ratio next.",
    icon: "📊",
  },
  {
    name: "EDF",
    path: "/edf",
    color: "from-rose-500 via-red-500 to-rose-600",
    bgColor: "from-rose-50 to-red-50",
    desc: "Earliest Deadline First (EDF) schedules the process with the earliest deadline next.",
    icon: "⏰",
  },
  {
    name: "Lottery",
    path: "/lottery",
    color: "from-indigo-500 via-purple-500 to-indigo-600",
    bgColor: "from-indigo-50 to-purple-50",
    desc: "Lottery scheduling assigns tickets to processes and randomly selects one to run.",
    icon: "🎲",
  },
  {
    name: "Fair Share",
    path: "/fair-share",
    color: "from-lime-500 via-green-500 to-lime-600",
    bgColor: "from-lime-50 to-green-50",
    desc: "Fair Share divides CPU time among groups, then among processes within each group.",
    icon: "⚖️",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
        <BackgroundAnimation />
        <div className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex items-center justify-center mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <Cpu className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-6 leading-tight">
                Process Scheduling
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Visualizer
                </span>
      </h1>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
                Explore and visualize different CPU process scheduling algorithms with beautiful, 
                interactive UI and augmented reality experiences. Understand how each algorithm 
                works through real-time Gantt charts and 3D visualizations.
              </p>
              
              {/* Feature highlights */}
              <div className="flex flex-wrap justify-center gap-6 mb-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-soft backdrop-blur-sm"
                >
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Interactive Charts</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-soft backdrop-blur-sm"
                >
                  <Eye className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">AR Experience</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-soft backdrop-blur-sm"
                >
                  <Sparkles className="w-4 h-4 text-pink-600" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Real-time Updates</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Live Animation Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Interactive Visualizations
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Experience process scheduling algorithms in action with our interactive visualizations
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <LazyAnimation>
              <EnhancedSchedulingAnimation />
            </LazyAnimation>
            <LazyAnimation>
              <EnhancedVideoAnimation />
            </LazyAnimation>
            <LazyAnimation>
              <EnhancedQueueAnimation />
            </LazyAnimation>
          </div>
        </div>
      </div>

      {/* Algorithms Grid */}
      <div className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {algorithms.map((algo, idx) => (
              <motion.div
            key={algo.name}
                variants={cardVariants}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={algo.path} className="block">
                  <Card className="group relative h-full overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer">
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${algo.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    {/* Content */}
                    <div className="relative p-6 h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl bg-gradient-to-r ${algo.color} shadow-lg`}>
                            <span className="text-2xl">{algo.icon}</span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors">
                            {algo.name}
                          </h3>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-all duration-300 group-hover:translate-x-1" />
                      </div>
                      
                      {/* Description */}
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex-grow mb-4">
                        {algo.desc}
                      </p>
                      
                      {/* Action button */}
                      <div className="mt-auto">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${algo.color} text-white font-medium text-sm shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}>
                          <span>Explore Algorithm</span>
                          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                      </div>
            </div>
          </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Built with modern web technologies for educational purposes
          </p>
        </div>
      </footer>
    </div>
  );
}
