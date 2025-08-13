"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Target, 
  Zap,
  BarChart3,
  Timer,
  Layers,
  Star,
  ArrowRight,
  Activity
} from "lucide-react";
import BackgroundAnimation from "@/components/BackgroundAnimation";

interface AlgorithmData {
  name: string;
  path: string;
  description: string;
  icon: React.ReactNode;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  timeComplexity: string;
  spaceComplexity: string;
  category: "Non-preemptive" | "Preemptive" | "Hybrid";
  color: string;
  features: string[];
}

const algorithms: AlgorithmData[] = [
  {
    name: "First Come First Serve",
    path: "/fcfs",
    description: "The simplest scheduling algorithm where processes are served in the order they arrive.",
    icon: <Clock className="w-6 h-6" />,
    difficulty: "Beginner",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    category: "Non-preemptive",
    color: "from-green-500 to-emerald-500",
    features: ["Simple implementation", "No starvation", "Poor average waiting time"]
  },
  {
    name: "Shortest Job First",
    path: "/sjf",
    description: "Executes the process with the smallest execution time first, minimizing average waiting time.",
    icon: <Target className="w-6 h-6" />,
    difficulty: "Intermediate",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(1)",
    category: "Non-preemptive",
    color: "from-blue-500 to-cyan-500",
    features: ["Optimal average waiting time", "May cause starvation", "Requires prior knowledge"]
  },
  {
    name: "Preemptive SJF (SRTF)",
    path: "/preemptive-sjf",
    description: "Preemptive version of SJF where a shorter job can interrupt a longer running job.",
    icon: <Zap className="w-6 h-6" />,
    difficulty: "Intermediate",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    category: "Preemptive",
    color: "from-purple-500 to-pink-500",
    features: ["Optimal for response time", "Complex implementation", "High overhead"]
  },
  {
    name: "Round Robin",
    path: "/round-robin",
    description: "Each process gets a fixed time quantum in a circular manner, ensuring fairness.",
    icon: <Activity className="w-6 h-6" />,
    difficulty: "Beginner",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    category: "Preemptive",
    color: "from-orange-500 to-red-500",
    features: ["Fair time sharing", "No starvation", "Context switching overhead"]
  },
  {
    name: "Priority Scheduling",
    path: "/priority",
    description: "Processes are scheduled based on priority levels, with highest priority first.",
    icon: <Star className="w-6 h-6" />,
    difficulty: "Intermediate",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(1)",
    category: "Non-preemptive",
    color: "from-yellow-500 to-orange-500",
    features: ["Flexible priority system", "May cause starvation", "Good for real-time systems"]
  },
  {
    name: "Preemptive Priority",
    path: "/preemptive-priority",
    description: "Priority scheduling with preemption, allowing higher priority jobs to interrupt lower ones.",
    icon: <Zap className="w-6 h-6" />,
    difficulty: "Advanced",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    category: "Preemptive",
    color: "from-red-500 to-pink-500",
    features: ["Immediate response", "Complex scheduling", "Starvation possible"]
  },
  {
    name: "Longest Job First",
    path: "/ljf",
    description: "Schedules the process with the longest execution time first.",
    icon: <BarChart3 className="w-6 h-6" />,
    difficulty: "Beginner",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(1)",
    category: "Non-preemptive",
    color: "from-indigo-500 to-purple-500",
    features: ["Opposite of SJF", "High waiting time", "Educational purpose"]
  },
  {
    name: "Highest Response Ratio Next",
    path: "/hrrn",
    description: "Selects the process with the highest response ratio, balancing waiting time and service time.",
    icon: <Target className="w-6 h-6" />,
    difficulty: "Advanced",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    category: "Non-preemptive",
    color: "from-teal-500 to-green-500",
    features: ["Prevents starvation", "Optimal response ratio", "Complex calculation"]
  },
  {
    name: "Multilevel Queue",
    path: "/multilevel-queue",
    description: "Processes are divided into multiple queues with different priorities and scheduling algorithms.",
    icon: <Layers className="w-6 h-6" />,
    difficulty: "Advanced",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    category: "Hybrid",
    color: "from-cyan-500 to-blue-500",
    features: ["Multiple queue system", "Fixed queue assignment", "Complex but efficient"]
  },
  {
    name: "Multilevel Feedback Queue",
    path: "/multilevel-feedback-queue",
    description: "Advanced multilevel queue where processes can move between queues based on behavior.",
    icon: <Layers className="w-6 h-6" />,
    difficulty: "Advanced",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    category: "Hybrid",
    color: "from-violet-500 to-purple-500",
    features: ["Dynamic queue movement", "Adaptive scheduling", "Most complex algorithm"]
  },
  {
    name: "Lottery Scheduling",
    path: "/lottery",
    description: "Probabilistic scheduling where processes are given lottery tickets and winners are chosen randomly.",
    icon: <Star className="w-6 h-6" />,
    difficulty: "Intermediate",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    category: "Preemptive",
    color: "from-pink-500 to-rose-500",
    features: ["Probabilistic fairness", "Flexible resource sharing", "Unpredictable execution order"]
  },
  {
    name: "Fair Share Scheduling",
    path: "/fair-share",
    description: "Ensures fair allocation of CPU time among users or groups rather than individual processes.",
    icon: <Users className="w-6 h-6" />,
    difficulty: "Advanced",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    category: "Preemptive",
    color: "from-emerald-500 to-teal-500",
    features: ["User-based fairness", "Group scheduling", "Complex allocation"]
  },
  {
    name: "Earliest Deadline First",
    path: "/edf",
    description: "Real-time scheduling algorithm that schedules tasks based on their deadlines.",
    icon: <Timer className="w-6 h-6" />,
    difficulty: "Advanced",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(1)",
    category: "Preemptive",
    color: "from-amber-500 to-yellow-500",
    features: ["Real-time scheduling", "Deadline-driven", "Optimal for feasible task sets"]
  }
];

const categories = ["All", "Non-preemptive", "Preemptive", "Hybrid"];
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

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

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export default function AlgorithmsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = React.useState("All");

  const filteredAlgorithms = algorithms.filter(algorithm => {
    const categoryMatch = selectedCategory === "All" || algorithm.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === "All" || algorithm.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "Intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Advanced": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Non-preemptive": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "Preemptive": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "Hybrid": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <BackgroundAnimation />
      
      {/* Header */}
      <div className="relative z-10 pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="outline" className="group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              CPU Scheduling
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"> Algorithms</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Explore and understand different CPU scheduling algorithms through interactive visualizations, 
              Gantt charts, and real-time simulations.
            </p>
          </motion.div>

          {/* Filter Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center mb-12"
          >
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 self-center mr-2">Category:</span>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-blue-500 hover:bg-blue-600" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 self-center mr-2">Difficulty:</span>
              {difficulties.map((difficulty) => (
                <Button
                  key={difficulty}
                  variant={selectedDifficulty === difficulty ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={selectedDifficulty === difficulty ? "bg-purple-500 hover:bg-purple-600" : ""}
                >
                  {difficulty}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{algorithms.length}</div>
              <div className="text-slate-600 dark:text-slate-400 text-sm">Total Algorithms</div>
            </div>
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{filteredAlgorithms.length}</div>
              <div className="text-slate-600 dark:text-slate-400 text-sm">Filtered Results</div>
            </div>
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">3</div>
              <div className="text-slate-600 dark:text-slate-400 text-sm">Categories</div>
            </div>
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">∞</div>
              <div className="text-slate-600 dark:text-slate-400 text-sm">Learning Potential</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Algorithms Grid */}
      <div className="relative z-10 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredAlgorithms.map((algorithm, index) => (
              <motion.div key={algorithm.path} variants={itemVariants} className="h-full">
                <Card className="h-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-soft hover:shadow-medium transition-all duration-300 group cursor-pointer overflow-hidden flex flex-col">
                  <div className={`h-2 bg-gradient-to-r ${algorithm.color}`}></div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${algorithm.color} group-hover:scale-110 transition-transform duration-300`}>
                        <div className="text-white">
                          {algorithm.icon}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(algorithm.difficulty)}`}>
                          {algorithm.difficulty}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(algorithm.category)}`}>
                          {algorithm.category}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {algorithm.name}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed flex-shrink-0" style={{ minHeight: '3rem' }}>
                      {algorithm.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm flex-shrink-0">
                      <div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">Time: </span>
                        <span className="text-slate-600 dark:text-slate-400">{algorithm.timeComplexity}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">Space: </span>
                        <span className="text-slate-600 dark:text-slate-400">{algorithm.spaceComplexity}</span>
                      </div>
                    </div>

                    <div className="mb-6 flex-grow">
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2 text-sm">Key Features:</h4>
                      <ul className="space-y-1" style={{ minHeight: '4.5rem' }}>
                        {algorithm.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-slate-400 flex-shrink-0"></div>
                            <span className="truncate">{feature}</span>
                          </li>
                        ))}
                        {algorithm.features.length > 3 && (
                          <li className="text-xs text-slate-500 dark:text-slate-500 italic">
                            +{algorithm.features.length - 3} more features...
                          </li>
                        )}
                      </ul>
                    </div>

                    <Link href={algorithm.path} className="mt-auto">
                      <Button className="w-full h-11 group-hover:bg-blue-600 transition-colors">
                        Explore Algorithm
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {filteredAlgorithms.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                No algorithms found
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Try adjusting your filters to see more results.
              </p>
              <Button 
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedDifficulty("All");
                }}
              >
                Clear Filters
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
