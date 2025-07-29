"use client";

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoAnimationProps {
  className?: string;
  videoSrc?: string;
  fallbackImage?: string;
}

const VideoAnimation: React.FC<VideoAnimationProps> = ({ 
  className = "",
  videoSrc = "/scheduling-demo.mp4", // You can add a demo video to public folder
  fallbackImage = "/scheduling-preview.svg" // Fallback image
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const handleVideoError = () => {
    setShowFallback(true);
  };

  const handleVideoLoad = () => {
    setShowFallback(false);
  };

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
              Process Scheduling Demo
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Watch a comprehensive overview of scheduling algorithms
            </p>
          </div>
        </div>
        
        <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
          {showFallback ? (
            // Fallback content when video fails to load
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Interactive Demo Available
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Try the live animation above to see algorithms in action
                </p>
                <div className="flex justify-center space-x-2">
                  {['FCFS', 'Round Robin', 'SJF', 'Priority'].map((algo, index) => (
                    <div
                      key={algo}
                      className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium rounded-full"
                    >
                      {algo}
                    </div>
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
                poster={fallbackImage}
              >
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Video controls overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
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
                </div>
                
                {/* Algorithm indicators */}
                <div className="flex space-x-2">
                  {['FCFS', 'RR', 'SJF', 'PRI'].map((algo, index) => (
                    <motion.div
                      key={algo}
                      className="px-2 py-1 bg-black/70 text-white text-xs font-medium rounded"
                      animate={{
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        delay: index * 0.5,
                        repeat: Infinity,
                      }}
                    >
                      {algo}
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Video description */}
        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <h4 className="font-medium text-slate-900 dark:text-white mb-2">
            What you'll see:
          </h4>
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li>• Real-time process execution visualization</li>
            <li>• Different scheduling algorithm comparisons</li>
            <li>• CPU utilization and waiting time analysis</li>
            <li>• Interactive Gantt chart representations</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoAnimation; 