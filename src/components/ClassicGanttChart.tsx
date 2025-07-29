"use client";

import { motion } from "framer-motion";

interface GanttEntry {
  name: string;
  start: number;
  end: number;
}

interface ClassicGanttChartProps {
  gantt: GanttEntry[];
}

const processColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

const processGradients = [
  'from-blue-500 to-blue-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-red-500 to-red-600',
  'from-violet-500 to-violet-600',
  'from-cyan-500 to-cyan-600',
  'from-lime-500 to-lime-600',
  'from-orange-500 to-orange-600',
  'from-pink-500 to-pink-600',
  'from-indigo-500 to-indigo-600'
];

export default function ClassicGanttChart({ gantt }: ClassicGanttChartProps) {
  if (!gantt || gantt.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-400 dark:text-slate-500">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm font-medium">No Gantt chart data available</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Add processes and calculate to see the visualization</p>
        </div>
      </div>
    );
  }

  const total = gantt[gantt.length - 1].end;

  return (
    <div className="w-full">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Process Execution Timeline</h3>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span>Total Time:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{total} units</span>
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div className="relative">
        {/* Background Grid */}
        <div className="absolute inset-0 grid grid-cols-10 divide-x divide-slate-200 dark:divide-slate-700 pointer-events-none">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="h-full"></div>
          ))}
        </div>

        {/* Gantt Bars */}
        <div className="relative flex w-full border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-soft" style={{ minHeight: 64 }}>
          {gantt.map((g, i) => {
            const widthPercent = ((g.end - g.start) / total) * 100;
            const colorIndex = i % processColors.length;
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                className="flex items-center justify-center border-r last:border-r-0 border-slate-200 dark:border-slate-700 text-sm font-semibold relative group"
                style={{
                  width: `${widthPercent}%`,
                  minWidth: 60,
                  height: 64
                }}
              >
                {/* Gradient Background */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-r ${processGradients[colorIndex]} opacity-90 group-hover:opacity-100 transition-opacity duration-200`}
                />
                
                {/* Process Name */}
                <div className="relative z-10 text-white drop-shadow-sm">
                  {g.name}
                </div>

                {/* Duration Tooltip */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                  Duration: {g.end - g.start}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Time Markers */}
        <div className="flex w-full relative mt-4 select-none">
          {gantt.map((g, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              style={{
                position: 'absolute',
                left: `${(g.start / total) * 100}%`,
                transform: 'translateX(-50%)',
                minWidth: 32,
                textAlign: 'center',
              }}
              className="text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              {g.start}
            </motion.div>
          ))}
          {/* Last time marker */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gantt.length * 0.1 + 0.3 }}
            style={{
              position: 'absolute',
              left: '100%',
              transform: 'translateX(-50%)',
              minWidth: 32,
              textAlign: 'center',
            }}
            className="text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            {total}
          </motion.div>
        </div>

        {/* Process Legend */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from(new Set(gantt.map(g => g.name))).map((processName, i) => {
            const colorIndex = i % processColors.length;
            return (
              <motion.div
                key={processName}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.5 }}
                className="flex items-center gap-2 text-sm"
              >
                <div 
                  className={`w-4 h-4 rounded bg-gradient-to-r ${processGradients[colorIndex]} shadow-sm`}
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{processName}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 