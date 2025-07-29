"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Process {
  id: string;
  color: string;
  status: 'waiting' | 'executing' | 'completed';
  burstTime: number;
  remainingTime: number;
  priority: number;
}

const EnhancedQueueAnimation: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentAlgorithm, setCurrentAlgorithm] = useState(0);
  const [activeProcess, setActiveProcess] = useState<string | null>(null);
  const [queue, setQueue] = useState<Process[]>([]);
  const [completedProcesses, setCompletedProcesses] = useState<Process[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const algorithms = [
    { name: "Round Robin", description: "Time Quantum = 2", color: "#3B82F6" },
    { name: "Priority Queue", description: "Priority-based", color: "#10B981" },
    { name: "FCFS Queue", description: "First-Come, First-Served", color: "#F59E0B" },
  ];

  // Initialize processes
  const initialProcesses: Process[] = [
    { id: "P1", color: "#3B82F6", status: 'waiting', burstTime: 4, remainingTime: 4, priority: 1 },
    { id: "P2", color: "#10B981", status: 'waiting', burstTime: 3, remainingTime: 3, priority: 2 },
    { id: "P3", color: "#F59E0B", status: 'waiting', burstTime: 5, remainingTime: 5, priority: 3 },
    { id: "P4", color: "#EF4444", status: 'waiting', burstTime: 2, remainingTime: 2, priority: 1 },
    { id: "P5", color: "#8B5CF6", status: 'waiting', burstTime: 4, remainingTime: 4, priority: 2 },
  ];

  // Enhanced queue simulation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 1;
        
        // Simulate queue processing
        if (queue.length > 0) {
          const currentProcess = queue[0];
          const timeQuantum = currentAlgorithm === 0 ? 2 : currentProcess.burstTime;
          const executeTime = Math.min(timeQuantum, currentProcess.remainingTime);
          
          // Update process status
          setActiveProcess(currentProcess.id);
          
          // Update remaining time
          const updatedProcess = {
            ...currentProcess,
            remainingTime: currentProcess.remainingTime - executeTime
          };
          
          // Move to next process or complete
          if (updatedProcess.remainingTime <= 0) {
            // Process completed
            setCompletedProcesses(prev => [...prev, { ...updatedProcess, status: 'completed' }]);
            setQueue(prev => prev.slice(1));
            setActiveProcess(null);
          } else {
            // Process still has remaining time
            if (currentAlgorithm === 0) {
              // Round Robin: move to end of queue
              setQueue(prev => [...prev.slice(1), updatedProcess]);
            } else {
              // Other algorithms: continue with same process
              setQueue(prev => [updatedProcess, ...prev.slice(1)]);
            }
          }
        } else {
          // Queue is empty, add new processes
          if (newTime % 3 === 0 && initialProcesses.length > 0) {
            const newProcess = initialProcesses[Math.floor(Math.random() * initialProcesses.length)];
            setQueue(prev => [...prev, { ...newProcess, status: 'waiting' }]);
          }
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, queue, currentAlgorithm]);

  // Algorithm cycling
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setCurrentAlgorithm(prev => (prev + 1) % algorithms.length);
        // Reset queue when algorithm changes
        setQueue([]);
        setCompletedProcesses([]);
        setActiveProcess(null);
      }
    }, 15000); // Change every 15 seconds

    return () => clearInterval(interval);
  }, [isPlaying]);

  const getProcessStatusColor = (status: string) => {
    switch (status) {
      case 'executing': return '#F59E0B';
      case 'completed': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className={`relative ${className}`}
    >
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-soft border border-slate-200/50 dark:border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Enhanced Queue Animation
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Dynamic process queue with real-time state transitions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
            >
              📊 Details
            </button>
          </div>
        </div>
        
        {/* Algorithm indicator */}
        <motion.div 
          className="mb-4 p-3 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg"
          key={currentAlgorithm}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">
                {algorithms[currentAlgorithm].name}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {algorithms[currentAlgorithm].description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                t = {currentTime}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Time Units
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Main animation area */}
        <div className="relative h-48 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg overflow-hidden mb-4">
          {/* CPU indicator */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <motion.div 
              className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
              animate={{
                scale: activeProcess ? [1, 1.1, 1] : 1,
                rotate: activeProcess ? [0, 360] : 0,
              }}
              transition={{
                duration: 2,
                repeat: activeProcess ? Infinity : 0,
                ease: "linear"
              }}
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </motion.div>
            <div className="text-xs text-center mt-1 text-slate-600 dark:text-slate-300 font-medium">
              CPU
            </div>
            
            {/* Active process indicator */}
            <AnimatePresence>
              {activeProcess && (
                <motion.div
                  className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeProcess}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Queue line with enhanced styling */}
          <div className="absolute left-4 right-24 top-1/2 transform -translate-y-1/2">
            <div className="h-3 bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300 dark:from-slate-600 dark:via-slate-500 dark:to-slate-600 rounded-full shadow-inner">
              {/* Queue flow indicator */}
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                animate={{
                  x: ['0%', '100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ width: '20%' }}
              />
            </div>
          </div>
          
          {/* Queue processes */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <div className="flex space-x-3">
              <AnimatePresence>
                {queue.map((process, index) => (
                  <motion.div
                    key={`${process.id}-${index}`}
                    className="relative"
                    initial={{ opacity: 0, x: -50, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0, 
                      scale: activeProcess === process.id ? 1.2 : 1,
                      y: activeProcess === process.id ? -5 : 0
                    }}
                    exit={{ opacity: 0, x: 50, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {/* Process circle */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white"
                      style={{ backgroundColor: process.color }}
                    >
                      {process.id}
                    </div>
                    
                    {/* Status indicator */}
                    <div
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white"
                      style={{ backgroundColor: getProcessStatusColor(process.status) }}
                    />
                    
                    {/* Progress bar for remaining time */}
                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-green-500"
                        initial={{ width: '100%' }}
                        animate={{ width: `${(process.remainingTime / process.burstTime) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Processing indicator */}
          <motion.div
            className="absolute right-20 top-1/2 transform -translate-y-1/2"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-lg"></div>
          </motion.div>
        </div>
        
        {/* Enhanced status indicators */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Ready Queue</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {queue.length}
            </div>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Processing</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {activeProcess ? 1 : 0}
            </div>
          </div>
          
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Completed</span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {completedProcesses.length}
            </div>
          </div>
        </div>
        
        {/* Enhanced details panel */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="font-medium text-slate-900 dark:text-white mb-3">Queue Details</h4>
              
              {/* Current queue */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Queue:</h5>
                <div className="flex flex-wrap gap-2">
                  {queue.map((process, index) => (
                    <div
                      key={process.id}
                      className="px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: process.color }}
                    >
                      {process.id} ({process.remainingTime}/{process.burstTime})
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Completed processes */}
              <div>
                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Completed:</h5>
                <div className="flex flex-wrap gap-2">
                  {completedProcesses.map((process) => (
                    <div
                      key={process.id}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                    >
                      {process.id} ✓
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Algorithm info */}
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              Current: {algorithms[currentAlgorithm].name}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {currentAlgorithm === 0 ? 'Time Quantum: 2' : 'Priority-based'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedQueueAnimation; 