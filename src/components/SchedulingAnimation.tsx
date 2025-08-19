"use client";

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Process {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
  color: string;
}

interface SchedulingAnimationProps {
  className?: string;
}

const SchedulingAnimation: React.FC<SchedulingAnimationProps> = ({ className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [currentAlgorithm, setCurrentAlgorithm] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Sample processes for demonstration
  const processes: Process[] = [
    { id: "P1", arrivalTime: 0, burstTime: 4, color: "#3B82F6" },
    { id: "P2", arrivalTime: 1, burstTime: 3, color: "#10B981" },
    { id: "P3", arrivalTime: 2, burstTime: 5, color: "#F59E0B" },
    { id: "P4", arrivalTime: 3, burstTime: 2, color: "#EF4444" },
    { id: "P5", arrivalTime: 4, burstTime: 4, color: "#8B5CF6" },
  ];

  const algorithms = [
    { name: "FCFS", description: "First-Come, First-Served" },
    { name: "Round Robin", description: "Time Quantum = 2" },
    { name: "SJF", description: "Shortest Job First" },
    { name: "Priority", description: "Priority-based" },
  ];

  // FCFS scheduling
  const fcfsSchedule = () => {
    const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    const schedule: { process: string; start: number; end: number; color: string }[] = [];
    let currentTime = 0;

    sorted.forEach(process => {
      if (currentTime < process.arrivalTime) {
        currentTime = process.arrivalTime;
      }
      schedule.push({
        process: process.id,
        start: currentTime,
        end: currentTime + process.burstTime,
        color: process.color
      });
      currentTime += process.burstTime;
    });

    return schedule;
  };

  // Round Robin scheduling
  const roundRobinSchedule = () => {
    const timeQuantum = 2;
    const schedule: { process: string; start: number; end: number; color: string }[] = [];
    const remainingTime = new Map(processes.map(p => [p.id, p.burstTime]));
    const queue: string[] = [];
    let currentTime = 0;
    let completed = new Set<string>();

    // Initialize queue with processes that have arrived
    processes.forEach(p => {
      if (p.arrivalTime <= currentTime) {
        queue.push(p.id);
      }
    });

    while (completed.size < processes.length) {
      if (queue.length === 0) {
        currentTime++;
        processes.forEach(p => {
          if (p.arrivalTime <= currentTime && !completed.has(p.id) && !queue.includes(p.id)) {
            queue.push(p.id);
          }
        });
        continue;
      }

      const currentProcess = queue.shift()!;
      const process = processes.find(p => p.id === currentProcess)!;
      const executeTime = Math.min(timeQuantum, remainingTime.get(currentProcess)!);
      
      schedule.push({
        process: currentProcess,
        start: currentTime,
        end: currentTime + executeTime,
        color: process.color
      });

      currentTime += executeTime;
      remainingTime.set(currentProcess, remainingTime.get(currentProcess)! - executeTime);

      // Add newly arrived processes to queue
      processes.forEach(p => {
        if (p.arrivalTime <= currentTime && !completed.has(p.id) && !queue.includes(p.id) && p.id !== currentProcess) {
          queue.push(p.id);
        }
      });

      // Re-add current process if not completed
      if (remainingTime.get(currentProcess)! > 0) {
        queue.push(currentProcess);
      } else {
        completed.add(currentProcess);
      }
    }

    return schedule;
  };

  // SJF scheduling
  const sjfSchedule = () => {
    const schedule: { process: string; start: number; end: number; color: string }[] = [];
    const remainingTime = new Map(processes.map(p => [p.id, p.burstTime]));
    let currentTime = 0;
    let completed = new Set<string>();

    while (completed.size < processes.length) {
      // Find shortest job among arrived processes
      const available = processes.filter(p => 
        p.arrivalTime <= currentTime && 
        !completed.has(p.id) && 
        remainingTime.get(p.id)! > 0
      );

      if (available.length === 0) {
        currentTime++;
        continue;
      }

      const shortest = available.reduce((min, p) => 
        remainingTime.get(p.id)! < remainingTime.get(min.id)! ? p : min
      );

      schedule.push({
        process: shortest.id,
        start: currentTime,
        end: currentTime + remainingTime.get(shortest.id)!,
        color: shortest.color
      });

      currentTime += remainingTime.get(shortest.id)!;
      remainingTime.set(shortest.id, 0);
      completed.add(shortest.id);
    }

    return schedule;
  };

  // Priority scheduling (using burst time as priority - lower is higher priority)
  const prioritySchedule = () => {
    const schedule: { process: string; start: number; end: number; color: string }[] = [];
    const remainingTime = new Map(processes.map(p => [p.id, p.burstTime]));
    let currentTime = 0;
    let completed = new Set<string>();

    while (completed.size < processes.length) {
      // Find highest priority job among arrived processes
      const available = processes.filter(p => 
        p.arrivalTime <= currentTime && 
        !completed.has(p.id) && 
        remainingTime.get(p.id)! > 0
      );

      if (available.length === 0) {
        currentTime++;
        continue;
      }

      const highestPriority = available.reduce((min, p) => 
        p.burstTime < min.burstTime ? p : min
      );

      schedule.push({
        process: highestPriority.id,
        start: currentTime,
        end: currentTime + remainingTime.get(highestPriority.id)!,
        color: highestPriority.color
      });

      currentTime += remainingTime.get(highestPriority.id)!;
      remainingTime.set(highestPriority.id, 0);
      completed.add(highestPriority.id);
    }

    return schedule;
  };

  const getSchedule = () => {
    switch (currentAlgorithm) {
      case 0: return fcfsSchedule();
      case 1: return roundRobinSchedule();
      case 2: return sjfSchedule();
      case 3: return prioritySchedule();
      default: return fcfsSchedule();
    }
  };

  const drawAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const schedule = getSchedule();
    const maxTime = Math.max(...schedule.map(s => s.end));
    const timeScale = (width - 100) / maxTime;
    const barHeight = 30;
    const barSpacing = 10;
    const startY = 60;

    // Draw title
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(algorithms[currentAlgorithm].name, width / 2, 25);
    
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px system-ui';
    ctx.fillText(algorithms[currentAlgorithm].description, width / 2, 40);

    // Draw time axis
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, startY - 10);
    ctx.lineTo(width - 50, startY - 10);
    ctx.stroke();

    // Draw time markers with collision detection
    const timeMarkers: { x: number; text: string }[] = [];
    for (let i = 0; i <= maxTime; i++) {
      const x = 50 + i * timeScale;
      timeMarkers.push({ x, text: i.toString() });
    }

    // Filter overlapping time markers
    const visibleMarkers = timeMarkers.filter((marker, index) => {
      if (index === 0 || index === timeMarkers.length - 1) return true; // Always show first and last
      
      // Check if this marker overlaps with the previous one
      const prevMarker = timeMarkers[index - 1];
      const minSpacing = 20; // Minimum pixels between markers
      return marker.x - prevMarker.x >= minSpacing;
    });

    visibleMarkers.forEach(marker => {
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(marker.text, marker.x, startY - 15);
      
      // Draw vertical grid line
      ctx.strokeStyle = '#E5E7EB';
      ctx.beginPath();
      ctx.moveTo(marker.x, startY - 10);
      ctx.lineTo(marker.x, startY + schedule.length * (barHeight + barSpacing) + 10);
      ctx.stroke();
    });

    // Draw process bars
    schedule.forEach((item, index) => {
      const y = startY + index * (barHeight + barSpacing);
      const x = 50 + item.start * timeScale;
      const barWidth = (item.end - item.start) * timeScale;

      // Draw bar
      ctx.fillStyle = item.color;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw border
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barWidth, barHeight);

      // Draw process ID with collision detection
      if (barWidth >= 25) { // Only draw text if bar is wide enough
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(item.process, x + barWidth / 2, y + barHeight / 2 + 4);
      } else {
        // Draw process ID outside the bar if it's too narrow
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 10px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText(item.process, x + barWidth + 3, y + barHeight / 2 + 3);
      }
    });

    // Draw current time indicator
    if (isPlaying) {
      const indicatorX = 50 + currentTime * timeScale;
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(indicatorX, startY - 10);
      ctx.lineTo(indicatorX, startY + schedule.length * (barHeight + barSpacing) + 10);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  useEffect(() => {
    let animationId: number;
    let lastTime = 0;
    const animationSpeed = 100; // ms per time unit

    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;

      if (deltaTime >= animationSpeed && isPlaying) {
        const schedule = getSchedule();
        const maxTime = Math.max(...schedule.map(s => s.end));
        
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime > maxTime) {
            // Switch to next algorithm
            setCurrentAlgorithm(prev => (prev + 1) % algorithms.length);
            return 0;
          }
          return newTime;
        });
        
        lastTime = timestamp;
      }

      drawAnimation();
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [currentAlgorithm, isPlaying, currentTime]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      drawAnimation();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`relative ${className}`}
    >
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-soft border border-slate-200/50 dark:border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Live Algorithm Demo
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Watch different scheduling algorithms in action
            </p>
          </div>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
        </div>
        
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-48 rounded-lg border border-slate-200 dark:border-slate-700"
            style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
          />
          
          {/* Algorithm indicator */}
          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {algorithms[currentAlgorithm].name}
          </div>
        </div>
        
        {/* Process legend */}
        <div className="flex flex-wrap gap-3 mt-4">
          {processes.map(process => (
            <div key={process.id} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: process.color }}
              />
              <span className="text-xs text-slate-600 dark:text-slate-300">
                {process.id}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SchedulingAnimation; 