"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, FastForward } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GanttEntry {
  name: string;
  start: number;
  end: number;
}

interface AnimatedGanttChartProps {
  gantt: GanttEntry[];
  colorScheme: string;
  algorithm?: string;
}

const processColors = [
  "#3B82F6", // Blue
  "#10B981", // Emerald  
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#EC4899", // Pink
  "#6366F1", // Indigo
];

const AnimatedGanttChart: React.FC<AnimatedGanttChartProps> = ({ 
  gantt, 
  colorScheme,
  algorithm = "Scheduling"
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // ms per time unit
  const [showAll, setShowAll] = useState(false);

  const maxTime = gantt.length > 0 ? Math.max(...gantt.map((g) => g.end)) : 10;
  const uniqueProcesses = Array.from(new Set(gantt.filter(g => g.name !== "Idle").map(g => g.name)));

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= maxTime) {
          setIsPlaying(false);
          return maxTime;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed, maxTime]);

  // Get currently running process at given time
  const getCurrentProcess = (time: number) => {
    return gantt.find(g => time >= g.start && time < g.end)?.name || "Idle";
  };

  // Get process color
  const getProcessColor = (processName: string) => {
    if (processName === "Idle") return "#E5E7EB";
    const index = uniqueProcesses.indexOf(processName);
    return processColors[index % processColors.length];
  };

  // Reset animation
  const resetAnimation = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (currentTime >= maxTime) {
      resetAnimation();
      setTimeout(() => setIsPlaying(true), 100);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Show complete gantt chart
  const toggleShowAll = () => {
    setShowAll(!showAll);
    if (!showAll) {
      setCurrentTime(maxTime);
      setIsPlaying(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {algorithm} Algorithm - Gantt Chart
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {showAll ? "Complete execution timeline" : `Animated execution (Time: ${currentTime}/${maxTime})`}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={toggleShowAll}
            className="text-xs"
          >
            {showAll ? "Show Animation" : "Show All"}
          </Button>

          {!showAll && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={resetAnimation}
                disabled={currentTime === 0}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                onClick={togglePlayPause}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>

              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={2000}>0.5x</option>
                <option value={1000}>1x</option>
                <option value={500}>2x</option>
                <option value={250}>4x</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* Time Scale */}
      <div className="mb-4">
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span className="w-16">Time:</span>
          <div className="flex gap-2">
            {Array.from({ length: maxTime + 1 }, (_, i) => (
              <span 
                key={i} 
                className={`w-8 text-center font-mono ${
                  i === currentTime && !showAll ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
                }`}
              >
                {i}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="space-y-3">
        {uniqueProcesses.map((processName, processIndex) => (
          <div key={processName} className="flex items-center gap-1">
            <span className="w-16 text-sm font-medium text-gray-700 dark:text-gray-300">
              {processName}
            </span>
            
            <div className="flex gap-0.5">
              {Array.from({ length: maxTime }, (_, timeUnit) => {
                const isProcessRunning = gantt.some(g => 
                  g.name === processName && timeUnit >= g.start && timeUnit < g.end
                );
                const shouldShow = showAll || timeUnit < currentTime || 
                  (timeUnit === currentTime && isProcessRunning);
                const isCurrentTime = timeUnit === currentTime && !showAll;
                
                return (
                  <motion.div
                    key={timeUnit}
                    className={`w-8 h-6 rounded-sm border border-gray-300 dark:border-gray-600 ${
                      isProcessRunning ? '' : 'bg-gray-100 dark:bg-gray-700'
                    } ${isCurrentTime ? 'ring-2 ring-blue-400' : ''}`}
                    style={{
                      backgroundColor: isProcessRunning ? getProcessColor(processName) : undefined,
                    }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: shouldShow ? 1 : 0.8,
                      opacity: shouldShow ? (isProcessRunning ? 1 : 0.3) : 0,
                    }}
                    transition={{ 
                      duration: 0.3,
                      delay: showAll ? processIndex * 0.1 : 0
                    }}
                  >
                    {isCurrentTime && isProcessRunning && (
                      <motion.div
                        className="w-full h-full bg-white/20 rounded-sm"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Current Process Indicator */}
      {!showAll && (
        <motion.div
          className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Currently Executing:
              </div>
              <motion.div
                key={getCurrentProcess(currentTime)}
                className="flex items-center gap-2"
                initial={{ scale: 0.9, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getProcessColor(getCurrentProcess(currentTime)) }}
                />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {getCurrentProcess(currentTime)}
                </span>
              </motion.div>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Time: {currentTime} / {maxTime}
            </div>
          </div>
        </motion.div>
      )}

      {/* Process Legend */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center pt-4 border-t border-gray-200 dark:border-gray-700">
        {uniqueProcesses.map((processName, index) => (
          <div key={processName} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getProcessColor(processName) }}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {processName}
            </span>
          </div>
        ))}
        {gantt.some(g => g.name === "Idle") && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-300 dark:bg-gray-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Idle
            </span>
          </div>
        )}
      </div>

      {/* Algorithm Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {isPlaying ? "Playing..." : currentTime >= maxTime ? "Execution Complete" : "Paused"} • 
          {uniqueProcesses.length} processes • Total time: {maxTime} units
        </p>
      </div>
    </div>
  );
};

export default AnimatedGanttChart;
