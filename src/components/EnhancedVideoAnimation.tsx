"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, RotateCcw, Settings } from 'lucide-react';

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

interface EnhancedVideoAnimationProps {
  className?: string;
  videoSrc?: string;
  fallbackImage?: string;
}

const EnhancedVideoAnimation: React.FC<EnhancedVideoAnimationProps> = ({ 
  className = "",
  videoSrc = "/scheduling-demo.mp4",
  fallbackImage = "/scheduling-preview.svg"
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [activeProcess, setActiveProcess] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Sample processes with enhanced data
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

  const [currentAlgorithm, setCurrentAlgorithm] = useState(0);

  // Enhanced scheduling simulation
  const simulateScheduling = () => {
    const schedule = getSchedule();
    const currentSchedule = schedule.find(s => 
      currentTime >= s.start && currentTime < s.end
    );
    
    if (currentSchedule) {
      setActiveProcess(currentSchedule.process);
      const process = processes.find(p => p.id === currentSchedule.process);
      if (process) {
        setTooltip({
          text: `${process.id} executing (${currentSchedule.start}-${currentSchedule.end})`,
          x: 50 + (currentTime / 12) * 100, // Percentage position
          y: 50
        });
      }
    } else {
      setActiveProcess(null);
      setTooltip(null);
    }
  };

  // FCFS scheduling implementation
  const getSchedule = () => {
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

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      simulateScheduling();
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoError = () => {
    setShowFallback(true);
  };

  const handleVideoLoad = () => {
    setShowFallback(false);
  };

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Algorithm cycling effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setCurrentAlgorithm(prev => (prev + 1) % algorithms.length);
      }
    }, 8000); // Change algorithm every 8 seconds

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className={`relative ${className}`}
    >
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-soft border border-slate-200/50 dark:border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Enhanced Process Scheduling Demo
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Interactive visualization with real-time feedback
            </p>
          </div>
        </div>
        
        <div 
          className="relative rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800"
          onMouseMove={showControlsTemporarily}
          onTouchStart={showControlsTemporarily}
        >
          {showFallback ? (
            // Enhanced fallback content
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <motion.div 
                  className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Interactive Demo Available
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Try the live animation above to see algorithms in action
                </p>
                
                {/* Enhanced algorithm indicators */}
                <div className="flex justify-center space-x-2 mb-4">
                  {algorithms.map((algo, index) => (
                    <motion.div
                      key={algo.name}
                      className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium rounded-full"
                      animate={{
                        scale: currentAlgorithm === index ? [1, 1.1, 1] : 1,
                        opacity: currentAlgorithm === index ? 1 : 0.7,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {algo.name}
                    </motion.div>
                  ))}
                </div>

                {/* Process queue visualization */}
                <div className="flex justify-center space-x-2">
                  {processes.map((process, index) => (
                    <motion.div
                      key={process.id}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: process.color }}
                      animate={{
                        y: [0, -5, 0],
                        scale: activeProcess === process.id ? [1, 1.2, 1] : 1,
                      }}
                      transition={{
                        duration: 2,
                        delay: index * 0.2,
                        repeat: Infinity,
                      }}
                    >
                      {process.id}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full aspect-video object-cover"
                muted={isMuted}
                loop
                onError={handleVideoError}
                onLoadedData={handleVideoLoad}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                poster={fallbackImage}
              >
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Enhanced video controls overlay */}
              <AnimatePresence>
                {showControls && (
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Top controls */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={togglePlay}
                          className="p-2 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={toggleMute}
                          className="p-2 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => seekTo(0)}
                          className="p-2 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Algorithm indicator */}
                      <motion.div
                        className="px-3 py-1 bg-black/70 text-white text-sm font-medium rounded-full"
                        key={currentAlgorithm}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {algorithms[currentAlgorithm].name}
                      </motion.div>
                    </div>

                    {/* Bottom controls */}
                    <div className="absolute bottom-4 left-4 right-4">
                      {/* Timeline */}
                      <div className="mb-2">
                        <div className="relative h-2 bg-white/30 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                            transition={{ duration: 0.1 }}
                          />
                          <div 
                            className="absolute top-0 bottom-0 w-1 bg-white rounded-full cursor-pointer"
                            style={{ left: `${(currentTime / duration) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-white mt-1">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      {/* Process status indicators */}
                      <div className="flex justify-center space-x-2">
                        {processes.map((process) => (
                          <motion.div
                            key={process.id}
                            className="flex flex-col items-center"
                            animate={{
                              scale: activeProcess === process.id ? 1.1 : 1,
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: process.color }}
                            >
                              {process.id}
                            </div>
                            <div className="text-xs text-white mt-1">
                              {process.status}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tooltip */}
              <AnimatePresence>
                {tooltip && (
                  <motion.div
                    className="absolute bg-black/80 text-white px-3 py-2 rounded-lg text-sm pointer-events-none z-10"
                    style={{ left: `${tooltip.x}%`, top: `${tooltip.y}%`, transform: 'translate(-50%, -100%)' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {tooltip.text}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
        
        {/* Enhanced description */}
        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <h4 className="font-medium text-slate-900 dark:text-white mb-2">
            Interactive Features:
          </h4>
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li>• Real-time process execution visualization</li>
            <li>• Color-coded processes with status indicators</li>
            <li>• Interactive timeline with seek controls</li>
            <li>• Algorithm switching with smooth transitions</li>
            <li>• Tooltips showing current execution details</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedVideoAnimation; 