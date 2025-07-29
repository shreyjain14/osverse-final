"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const BackgroundAnimation: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [positions, setPositions] = useState<Array<{ left: number; top: number }>>([]);

  const processes = [
    { id: 1, color: 'bg-blue-500/20', delay: 0, duration: 8 },
    { id: 2, color: 'bg-green-500/20', delay: 1, duration: 10 },
    { id: 3, color: 'bg-purple-500/20', delay: 2, duration: 12 },
    { id: 4, color: 'bg-orange-500/20', delay: 3, duration: 9 },
    { id: 5, color: 'bg-pink-500/20', delay: 4, duration: 11 },
    { id: 6, color: 'bg-indigo-500/20', delay: 5, duration: 7 },
  ];

  useEffect(() => {
    // Generate random positions only on client side after mounting
    const randomPositions = processes.map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
    }));
    setPositions(randomPositions);
    setMounted(true);
  }, []);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div className="absolute inset-0 overflow-hidden pointer-events-none"></div>;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {processes.map((process, index) => (
        <motion.div
          key={process.id}
          className={`absolute w-16 h-16 ${process.color} rounded-2xl blur-sm`}
          animate={{
            x: ['0vw', '100vw'],
            y: ['0vh', '100vh', '0vh'],
            rotate: [0, 360],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: process.duration,
            delay: process.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            left: `${positions[index]?.left || 0}%`,
            top: `${positions[index]?.top || 0}%`,
          }}
        />
      ))}
      
      {/* Floating queue indicators */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={`queue-${i}`}
          className="absolute w-24 h-2 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-sm"
          animate={{
            x: ['-100px', 'calc(100vw + 100px)'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 15,
            delay: i * 3,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            top: `${20 + i * 25}%`,
          }}
        />
      ))}
    </div>
  );
};

export default BackgroundAnimation; 