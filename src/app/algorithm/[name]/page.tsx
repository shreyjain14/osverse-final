'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import InputTable from '@/components/InputTable';
import ResultsDisplay from '@/components/ResultsDisplay';
import { calculateFCFS, calculateSJF, calculateSRTF, calculateRR, calculateLJF, calculateLRTF, calculatePriorityP, calculatePriorityNP } from '@/lib/algorithms';

interface Process {
  id: number;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
}

interface PageProps {
  params: {
    name: string;
  };
}

export default function AlgorithmPage({ params }: PageProps) {
  const [results, setResults] = useState<null | {
    waitingTime: number[];
    turnaroundTime: number[];
    completionTime: number[];
    averageWaitingTime: number;
    averageTurnaroundTime: number;
    ganttChart: { processId: number; startTime: number; endTime: number }[];
  }>(null);

  const algorithmName = params.name.replace(/-/g, ' ').toUpperCase();
  
  const getCalculationFunction = (name: string) => {
    switch (name) {
      case 'fcfs':
        return calculateFCFS;
      case 'sjf':
        return calculateSJF;
      case 'srtf':
        return calculateSRTF;
      case 'round-robin':
        return calculateRR;
      case 'ljf':
        return calculateLJF;
      case 'lrtf':
        return calculateLRTF;
      case 'priority-p':
        return calculatePriorityP;
      case 'priority-np':
        return calculatePriorityNP;
      default:
        return null;
    }
  };

  const calculationFunction = getCalculationFunction(params.name);
  if (!calculationFunction) {
    notFound();
  }

  const showPriority = params.name.includes('priority');

  const handleCalculate = (processes: Process[]) => {
    const result = calculationFunction(processes);
    setResults(result);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6">
        <h1 className="text-3xl font-bold text-center mb-8">{algorithmName}</h1>
        <InputTable
          algorithm={algorithmName}
          onCalculate={handleCalculate}
          showPriority={showPriority}
        />
        {results && <ResultsDisplay {...results} />}
      </div>
    </div>
  );
} 