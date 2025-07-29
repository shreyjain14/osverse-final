"use client";

import { motion } from 'framer-motion';

const QueueAnimation: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className={`relative ${className}`}
    >
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-soft border border-slate-200/50 dark:border-slate-700/50 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Process Queue Animation
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Watch processes flow through the scheduling system
          </p>
        </div>
        
        <div className="relative h-32 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg overflow-hidden">
          {/* CPU indicator */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div className="text-xs text-center mt-1 text-slate-600 dark:text-slate-300 font-medium">
              CPU
            </div>
          </div>
          
          {/* Queue line */}
          <div className="absolute left-4 right-20 top-1/2 transform -translate-y-1/2">
            <div className="h-2 bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500 rounded-full"></div>
          </div>
          
          {/* Animated processes */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <div className="flex space-x-2">
              {/* Process 1 */}
              <motion.div
                className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                animate={{
                  x: [0, 200, 400, 600],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                P1
              </motion.div>
              
              {/* Process 2 */}
              <motion.div
                className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                animate={{
                  x: [0, 200, 400, 600],
                }}
                transition={{
                  duration: 8,
                  delay: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                P2
              </motion.div>
              
              {/* Process 3 */}
              <motion.div
                className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                animate={{
                  x: [0, 200, 400, 600],
                }}
                transition={{
                  duration: 8,
                  delay: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                P3
              </motion.div>
              
              {/* Process 4 */}
              <motion.div
                className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                animate={{
                  x: [0, 200, 400, 600],
                }}
                transition={{
                  duration: 8,
                  delay: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                P4
              </motion.div>
              
              {/* Process 5 */}
              <motion.div
                className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                animate={{
                  x: [0, 200, 400, 600],
                }}
                transition={{
                  duration: 8,
                  delay: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                P5
              </motion.div>
            </div>
          </div>
          
          {/* Processing indicator */}
          <motion.div
            className="absolute right-16 top-1/2 transform -translate-y-1/2"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
          </motion.div>
        </div>
        
        {/* Status indicators */}
        <div className="mt-4 flex justify-between text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Ready Queue</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>Processing</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Completed</span>
          </div>
        </div>
        
        {/* Algorithm info */}
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              Current: Round Robin
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Time Quantum: 2
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QueueAnimation; 