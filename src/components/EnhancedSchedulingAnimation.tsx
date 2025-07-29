"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Process {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
  color: string;
  status: 'waiting' | 'executing' | 'completed';
  startTime?: number;
  endTime?: number;
}

interface SchedulingAnimationProps {
  className?: string;
}

const EnhancedSchedulingAnimation: React.FC<SchedulingAnimationProps> = ({ className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [currentAlgorithm, setCurrentAlgorithm] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hoveredProcess, setHoveredProcess] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [showStats, setShowStats] = useState(false);

  // Enhanced processes with status tracking
  const processes: Process[] = [
    { id: "P1", arrivalTime: 0, burstTime: 4, color: "#3B82F6", status: 'waiting' },
    { id: "P2", arrivalTime: 1, burstTime: 3, color: "#10B981", status: 'waiting' },
    { id: "P3", arrivalTime: 2, burstTime: 5, color: "#F59E0B", status: 'waiting' },
    { id: "P4", arrivalTime: 3, burstTime: 2, color: "#EF4444", status: 'waiting' },
    { id: "P5", arrivalTime: 4, burstTime: 4, color: "#8B5CF6", status: 'waiting' },
  ];

  const algorithms = [
    { name: "FCFS", description: "First-Come, First-Served", color: "#3B82F6" },
    { name: "Round Robin", description: "Time Quantum = 2", color: "#10B981" },
    { name: "SJF", description: "Shortest Job First", color: "#F59E0B" },
    { name: "Priority", description: "Priority-based", color: "#EF4444" },
  ];

  // Enhanced FCFS scheduling with status updates
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

  // Enhanced Round Robin scheduling
  const roundRobinSchedule = () => {
    const timeQuantum = 2;
    const schedule: { process: string; start: number; end: number; color: string }[] = [];
    const remainingTime = new Map(processes.map(p => [p.id, p.burstTime]));
    const queue: string[] = [];
    let currentTime = 0;
    let completed = new Set<string>();

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

      processes.forEach(p => {
        if (p.arrivalTime <= currentTime && !completed.has(p.id) && !queue.includes(p.id) && p.id !== currentProcess) {
          queue.push(p.id);
        }
      });

      if (remainingTime.get(currentProcess)! > 0) {
        queue.push(currentProcess);
      } else {
        completed.add(currentProcess);
      }
    }

    return schedule;
  };

  // Enhanced SJF scheduling
  const sjfSchedule = () => {
    const schedule: { process: string; start: number; end: number; color: string }[] = [];
    const remainingTime = new Map(processes.map(p => [p.id, p.burstTime]));
    let currentTime = 0;
    let completed = new Set<string>();

    while (completed.size < processes.length) {
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

  // Enhanced Priority scheduling
  const prioritySchedule = () => {
    const schedule: { process: string; start: number; end: number; color: string }[] = [];
    const remainingTime = new Map(processes.map(p => [p.id, p.burstTime]));
    let currentTime = 0;
    let completed = new Set<string>();

    while (completed.size < processes.length) {
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

    // Set canvas size with high DPI support
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const schedule = getSchedule();
    const maxTime = Math.max(...schedule.map(s => s.end));
    const timeScale = (width - 120) / maxTime;
    const barHeight = 35;
    const barSpacing = 15;
    const startY = 80;

    // Draw title with enhanced styling
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 18px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(algorithms[currentAlgorithm].name, width / 2, 30);
    
    ctx.fillStyle = '#6B7280';
    ctx.font = '14px system-ui';
    ctx.fillText(algorithms[currentAlgorithm].description, width / 2, 50);

    // Draw enhanced time axis
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, startY - 15);
    ctx.lineTo(width - 60, startY - 15);
    ctx.stroke();

    // Draw time markers with enhanced styling and collision detection
    const timeMarkers: { x: number; text: string }[] = [];
    for (let i = 0; i <= maxTime; i++) {
      const x = 60 + i * timeScale;
      timeMarkers.push({ x, text: i.toString() });
    }

    // Filter overlapping time markers
    const visibleMarkers = timeMarkers.filter((marker, index) => {
      if (index === 0 || index === timeMarkers.length - 1) return true; // Always show first and last
      
      // Check if this marker overlaps with the previous one
      const prevMarker = timeMarkers[index - 1];
      const minSpacing = 25; // Minimum pixels between markers
      return marker.x - prevMarker.x >= minSpacing;
    });

    visibleMarkers.forEach(marker => {
      ctx.fillStyle = '#6B7280';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(marker.text, marker.x, startY - 25);
      
      // Draw vertical grid line
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(marker.x, startY - 15);
      ctx.lineTo(marker.x, startY + schedule.length * (barHeight + barSpacing) + 15);
      ctx.stroke();
    });

    // Draw enhanced process bars with animations
    schedule.forEach((item, index) => {
      const y = startY + index * (barHeight + barSpacing);
      const x = 60 + item.start * timeScale;
      const barWidth = (item.end - item.start) * timeScale;

      // Check if process is currently executing
      const isExecuting = currentTime >= item.start && currentTime < item.end;
      const isCompleted = currentTime >= item.end;
      const isWaiting = currentTime < item.start;

      // Draw bar with enhanced styling
      const barGradient = ctx.createLinearGradient(x, y, x + barWidth, y + barHeight);
      barGradient.addColorStop(0, item.color);
      barGradient.addColorStop(1, isExecuting ? '#1E40AF' : item.color);
      
      ctx.fillStyle = barGradient;
      ctx.shadowColor = isExecuting ? item.color : 'transparent';
      ctx.shadowBlur = isExecuting ? 10 : 0;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw border
      ctx.strokeStyle = isExecuting ? '#1E40AF' : '#374151';
      ctx.lineWidth = isExecuting ? 3 : 1;
      ctx.strokeRect(x, y, barWidth, barHeight);

      // Draw process ID with enhanced styling and collision detection
      if (barWidth >= 30) { // Only draw text if bar is wide enough
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(item.process, x + barWidth / 2, y + barHeight / 2 + 5);
      } else {
        // Draw process ID outside the bar if it's too narrow
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText(item.process, x + barWidth + 5, y + barHeight / 2 + 4);
      }

      // Draw execution indicator
      if (isExecuting) {
        ctx.fillStyle = '#FCD34D';
        ctx.beginPath();
        ctx.arc(x + barWidth / 2, y - 8, 4, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Draw status indicator
      const statusColor = isCompleted ? '#10B981' : isExecuting ? '#F59E0B' : '#6B7280';
      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.arc(x - 8, y + barHeight / 2, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw enhanced current time indicator
    if (isPlaying) {
      const indicatorX = 60 + currentTime * timeScale;
      
      // Draw indicator line
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(indicatorX, startY - 15);
      ctx.lineTo(indicatorX, startY + schedule.length * (barHeight + barSpacing) + 15);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw indicator circle
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(indicatorX, startY - 15, 6, 0, 2 * Math.PI);
      ctx.fill();

      // Draw time label with collision detection
      const timeLabel = `t=${currentTime}`;
      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      
      // Check if time label would overlap with time markers
      const labelWidth = ctx.measureText(timeLabel).width;
      const labelX = Math.max(60 + labelWidth/2, Math.min(indicatorX, width - 60 - labelWidth/2));
      ctx.fillText(timeLabel, labelX, startY - 35);
    }

    // Draw process legend with enhanced styling and responsive layout
    const legendY = startY + schedule.length * (barHeight + barSpacing) + 40;
    const legendItemWidth = Math.min(120, (width - 120) / processes.length);
    
    processes.forEach((process, index) => {
      const x = 60 + index * legendItemWidth;
      
      // Draw color indicator
      ctx.fillStyle = process.color;
      ctx.fillRect(x, legendY, 20, 20);
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, legendY, 20, 20);

      // Draw process ID with proper spacing
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'left';
      
      // Ensure text doesn't overflow the allocated space
      const processText = process.id;
      const textWidth = ctx.measureText(processText).width;
      const maxTextWidth = legendItemWidth - 25; // Leave space for color indicator
      
      if (textWidth <= maxTextWidth) {
        ctx.fillText(processText, x + 25, legendY + 15);
      } else {
        // Truncate text if it's too long
        let truncatedText = processText;
        while (ctx.measureText(truncatedText + '...').width > maxTextWidth && truncatedText.length > 0) {
          truncatedText = truncatedText.slice(0, -1);
        }
        ctx.fillText(truncatedText + '...', x + 25, legendY + 15);
      }
    });
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if click is on a process bar
    const schedule = getSchedule();
    const maxTime = Math.max(...schedule.map(s => s.end));
    const timeScale = (rect.width - 120) / maxTime;
    const barHeight = 35;
    const barSpacing = 15;
    const startY = 80;

    schedule.forEach((item, index) => {
      const barY = startY + index * (barHeight + barSpacing);
      const barX = 60 + item.start * timeScale;
      const barWidth = (item.end - item.start) * timeScale;

      if (x >= barX && x <= barX + barWidth && y >= barY && y <= barY + barHeight) {
        setTooltip({
          text: `${item.process}: ${item.start}-${item.end} (${item.end - item.start} units)`,
          x: event.clientX,
          y: event.clientY
        });
        setTimeout(() => setTooltip(null), 3000);
      }
    });
  };

  useEffect(() => {
    let animationId: number;
    let lastTime = 0;
    const animationSpeed = 80; // Slightly slower for better visibility

    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;

      if (deltaTime >= animationSpeed && isPlaying) {
        const schedule = getSchedule();
        const maxTime = Math.max(...schedule.map(s => s.end));
        
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime > maxTime) {
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
              Enhanced Live Algorithm Demo
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Interactive Gantt chart with real-time process execution
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
              onClick={() => setShowStats(!showStats)}
              className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
            >
              📊 Stats
            </button>
          </div>
        </div>
        
        <div className="relative">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-64 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
          />
          
          {/* Enhanced algorithm indicator */}
          <motion.div 
            className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium"
            key={currentAlgorithm}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {algorithms[currentAlgorithm].name}
          </motion.div>

          {/* Stats panel */}
          <AnimatePresence>
            {showStats && (
              <motion.div
                className="absolute top-2 right-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-slate-200 dark:border-slate-700"
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="font-medium text-slate-900 dark:text-white text-sm mb-2">Statistics</h4>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <div>Current Time: {currentTime}</div>
                  <div>Total Processes: {processes.length}</div>
                  <div>Algorithm: {algorithms[currentAlgorithm].name}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Enhanced tooltip */}
        <AnimatePresence>
          {tooltip && (
            <motion.div
              className="fixed bg-black/80 text-white px-3 py-2 rounded-lg text-sm pointer-events-none z-50"
              style={{ left: tooltip.x + 10, top: tooltip.y - 10 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {tooltip.text}
              <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Enhanced process legend */}
        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <h4 className="font-medium text-slate-900 dark:text-white mb-3">Process Status</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {processes.map((process) => (
              <motion.div
                key={process.id}
                className="flex items-center space-x-2 p-2 rounded-lg bg-white dark:bg-slate-600 shadow-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: process.color }}
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {process.id}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {process.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedSchedulingAnimation; 