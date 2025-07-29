"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface LazyAnimationProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}

const LazyAnimation: React.FC<LazyAnimationProps> = ({ 
  children, 
  className = "",
  threshold = 0.1 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Add a small delay to ensure smooth loading
          setTimeout(() => setIsLoaded(true), 100);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} className={className}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.6 }}
        >
          {isLoaded ? children : (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-soft border border-slate-200/50 dark:border-slate-700/50 p-6">
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Loading animation...
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default LazyAnimation; 