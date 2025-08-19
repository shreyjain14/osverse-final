"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Cpu, 
  BarChart3, 
  Eye, 
  Sparkles, 
  Play, 
  BookOpen,
  Zap
} from "lucide-react";
import BackgroundAnimation from "@/components/BackgroundAnimation";

const features = [
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Interactive Visualizations",
    description: "Watch algorithms come to life with beautiful, real-time Gantt charts and process animations.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: <Eye className="w-8 h-8" />,
    title: "3D Visualizations",
    description: "Experience scheduling algorithms through immersive 3D models and visual representations.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Real-time Processing",
    description: "Input your own processes and see immediate results with customizable parameters.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: "Educational Content",
    description: "Learn with detailed explanations and step-by-step algorithm breakdowns.",
    color: "from-amber-500 to-orange-500"
  }
];

const algorithmStats = [
  { number: "13+", label: "Scheduling Algorithms" },
  { number: "3D", label: "Visual Models" },
  { number: "100%", label: "Interactive" },
  { number: "∞", label: "Learning Potential" }
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden">
      <BackgroundAnimation />
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                CPU Scheduler
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Features
              </a>
              <a href="#about" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                About
              </a>
              <Link href="/algorithms">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg">
                  Explore Algorithms
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Interactive Learning Experience
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6">
                Master CPU
                <br />
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Scheduling
                </span>
                <br />
                Algorithms
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
                Visualize, understand, and master process scheduling algorithms with interactive 3D models 
                and real-time animations.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-center mb-12">
              <Link href="/algorithms">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Start Learning
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {algorithmStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose Our Platform?
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Experience the future of algorithm learning with cutting-edge visualization and interactive technology.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="p-6 h-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-soft hover:shadow-medium transition-all duration-300 group cursor-pointer">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Learn Through
                <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent"> Visualization</span>
              </h2>
              
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Our platform transforms complex CPU scheduling algorithms into intuitive, 
                interactive experiences. Watch processes move through queues, see time slices in action, 
                and understand priority mechanisms through beautiful animations.
              </p>
              
              <ul className="space-y-3 mb-8">
                {[
                  "13+ scheduling algorithms covered",
                  "Real-time Gantt chart generation",
                  "3D models for AR visualization",
                  "Customizable process parameters",
                  "Step-by-step algorithm breakdown"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500"></div>
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/algorithms">
                <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg group">
                  Explore All Algorithms
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm p-4 border border-white/20">
                <div className="w-full h-full rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 flex flex-col">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      Round Robin Demo
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                      Watch processes execute with time quantum = 2
                    </p>
                  </div>
                  
                  {/* Mini Gantt Chart Animation */}
                  <div className="flex-1 flex flex-col justify-center space-y-4">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-10 text-slate-600 dark:text-slate-400">Time:</span>
                      <div className="flex gap-1 flex-1 justify-center">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((time) => (
                          <span key={time} className="w-5 text-center text-slate-500 text-xs font-mono">
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Animated Process Bars */}
                    <div className="space-y-3 flex-1 flex flex-col justify-center">
                      {[
                        { name: 'P1', color: 'bg-blue-500', start: 0, segments: [[0, 2], [6, 7]] },
                        { name: 'P2', color: 'bg-green-500', start: 1, segments: [[2, 4], [7, 8]] },
                        { name: 'P3', color: 'bg-purple-500', start: 2, segments: [[4, 6]] },
                      ].map((process, idx) => (
                        <div key={process.name} className="flex items-center gap-2">
                          <span className="w-10 text-sm font-medium text-slate-700 dark:text-slate-300">
                            {process.name}
                          </span>
                          <div className="flex gap-1 flex-1 justify-center">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((time) => {
                              const isActive = process.segments.some(([start, end]) => 
                                time >= start && time < end
                              );
                              return (
                                <motion.div
                                  key={time}
                                  className={`w-5 h-5 rounded-sm ${
                                    isActive ? process.color : 'bg-gray-200 dark:bg-gray-600'
                                  }`}
                                  initial={{ scale: 0.8, opacity: 0.5 }}
                                  animate={{ 
                                    scale: isActive ? 1 : 0.8,
                                    opacity: isActive ? 1 : 0.3,
                                  }}
                                  transition={{ 
                                    duration: 0.3,
                                    delay: time * 0.5,
                                    repeat: Infinity,
                                    repeatDelay: 4
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Current Process Indicator */}
                    <motion.div
                      className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700"
                      animate={{ 
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.1)',
                          'rgba(34, 197, 94, 0.1)', 
                          'rgba(147, 51, 234, 0.1)',
                          'rgba(59, 130, 246, 0.1)'
                        ]
                      }}
                      transition={{ 
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Currently Running:</span>
                        <motion.span 
                          className="font-semibold text-slate-800 dark:text-slate-200"
                          animate={{ 
                            color: [
                              '#3b82f6',
                              '#22c55e', 
                              '#9333ea',
                              '#3b82f6'
                            ]
                          }}
                          transition={{ 
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        >
                          P1 → P2 → P3 → P1
                        </motion.span>
                      </div>
                    </motion.div>
                    
                    {/* Algorithm Info */}
                    <div className="text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Time Quantum: 2 units • Preemptive Scheduling
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 bg-gradient-to-r from-blue-500 to-purple-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Master CPU Scheduling?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students and professionals who have enhanced their understanding 
              of operating systems through our interactive platform.
            </p>
            
            <div className="flex justify-center">
              <Link href="/algorithms">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  Start Learning Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  CPU Scheduler
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 max-w-md mb-4">
                Interactive CPU scheduling algorithm visualizer designed for students and professionals 
                to understand operating system concepts through hands-on learning.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Algorithms</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li><Link href="/algorithms" className="hover:text-blue-600 transition-colors">FCFS</Link></li>
                <li><Link href="/algorithms" className="hover:text-blue-600 transition-colors">Round Robin</Link></li>
                <li><Link href="/algorithms" className="hover:text-blue-600 transition-colors">SJF</Link></li>
                <li><Link href="/algorithms" className="hover:text-blue-600 transition-colors">Priority</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Features</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li><Link href="/algorithms" className="hover:text-blue-600 transition-colors">3D Models</Link></li>
                <li><Link href="/algorithms" className="hover:text-blue-600 transition-colors">All Algorithms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-700 pt-8 mt-8 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Built with modern web technologies for educational purposes. 
              © 2025 CPU Scheduler. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
