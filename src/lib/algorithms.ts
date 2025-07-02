interface Process {
  id: number;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
}

interface CalculationResult {
  waitingTime: number[];
  turnaroundTime: number[];
  completionTime: number[];
  averageWaitingTime: number;
  averageTurnaroundTime: number;
  ganttChart: { processId: number; startTime: number; endTime: number }[];
}

// Helper function to calculate average
const calculateAverage = (arr: number[]): number => {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
};

// First Come First Serve (FCFS)
export const calculateFCFS = (processes: Process[]): CalculationResult => {
  const n = processes.length;
  const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  
  const waitingTime: number[] = new Array(n).fill(0);
  const turnaroundTime: number[] = new Array(n).fill(0);
  const completionTime: number[] = new Array(n).fill(0);
  const ganttChart: { processId: number; startTime: number; endTime: number }[] = [];
  
  let currentTime = 0;
  
  sortedProcesses.forEach((process, index) => {
    if (currentTime < process.arrivalTime) {
      currentTime = process.arrivalTime;
    }
    
    ganttChart.push({
      processId: process.id,
      startTime: currentTime,
      endTime: currentTime + process.burstTime
    });
    
    completionTime[process.id - 1] = currentTime + process.burstTime;
    turnaroundTime[process.id - 1] = completionTime[process.id - 1] - process.arrivalTime;
    waitingTime[process.id - 1] = turnaroundTime[process.id - 1] - process.burstTime;
    
    currentTime += process.burstTime;
  });
  
  return {
    waitingTime,
    turnaroundTime,
    completionTime,
    averageWaitingTime: calculateAverage(waitingTime),
    averageTurnaroundTime: calculateAverage(turnaroundTime),
    ganttChart
  };
};

// Shortest Job First (SJF)
export const calculateSJF = (processes: Process[]): CalculationResult => {
  const n = processes.length;
  const waitingTime: number[] = new Array(n).fill(0);
  const turnaroundTime: number[] = new Array(n).fill(0);
  const completionTime: number[] = new Array(n).fill(0);
  const ganttChart: { processId: number; startTime: number; endTime: number }[] = [];
  
  let currentTime = 0;
  let remainingProcesses = [...processes];
  
  while (remainingProcesses.length > 0) {
    const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
    
    if (availableProcesses.length === 0) {
      currentTime = Math.min(...remainingProcesses.map(p => p.arrivalTime));
      continue;
    }
    
    const shortestJob = availableProcesses.reduce((prev, curr) => 
      prev.burstTime < curr.burstTime ? prev : curr
    );
    
    ganttChart.push({
      processId: shortestJob.id,
      startTime: currentTime,
      endTime: currentTime + shortestJob.burstTime
    });
    
    completionTime[shortestJob.id - 1] = currentTime + shortestJob.burstTime;
    turnaroundTime[shortestJob.id - 1] = completionTime[shortestJob.id - 1] - shortestJob.arrivalTime;
    waitingTime[shortestJob.id - 1] = turnaroundTime[shortestJob.id - 1] - shortestJob.burstTime;
    
    currentTime += shortestJob.burstTime;
    remainingProcesses = remainingProcesses.filter(p => p.id !== shortestJob.id);
  }
  
  return {
    waitingTime,
    turnaroundTime,
    completionTime,
    averageWaitingTime: calculateAverage(waitingTime),
    averageTurnaroundTime: calculateAverage(turnaroundTime),
    ganttChart
  };
};

// Shortest Remaining Time First (SRTF)
export const calculateSRTF = (processes: Process[]): CalculationResult => {
  const n = processes.length;
  const waitingTime: number[] = new Array(n).fill(0);
  const turnaroundTime: number[] = new Array(n).fill(0);
  const completionTime: number[] = new Array(n).fill(0);
  const ganttChart: { processId: number; startTime: number; endTime: number }[] = [];
  
  let currentTime = 0;
  let remainingProcesses = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
  let lastProcessId = -1;
  
  while (remainingProcesses.length > 0) {
    const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
    
    if (availableProcesses.length === 0) {
      currentTime = Math.min(...remainingProcesses.map(p => p.arrivalTime));
      continue;
    }
    
    const shortestJob = availableProcesses.reduce((prev, curr) => 
      prev.remainingTime < curr.remainingTime ? prev : curr
    );
    
    if (lastProcessId !== shortestJob.id) {
      if (lastProcessId !== -1) {
        ganttChart[ganttChart.length - 1].endTime = currentTime;
      }
      ganttChart.push({
        processId: shortestJob.id,
        startTime: currentTime,
        endTime: currentTime + 1
      });
      lastProcessId = shortestJob.id;
    }
    
    shortestJob.remainingTime--;
    currentTime++;
    
    if (shortestJob.remainingTime === 0) {
      completionTime[shortestJob.id - 1] = currentTime;
      turnaroundTime[shortestJob.id - 1] = completionTime[shortestJob.id - 1] - shortestJob.arrivalTime;
      waitingTime[shortestJob.id - 1] = turnaroundTime[shortestJob.id - 1] - shortestJob.burstTime;
      remainingProcesses = remainingProcesses.filter(p => p.id !== shortestJob.id);
      lastProcessId = -1;
    }
  }
  
  return {
    waitingTime,
    turnaroundTime,
    completionTime,
    averageWaitingTime: calculateAverage(waitingTime),
    averageTurnaroundTime: calculateAverage(turnaroundTime),
    ganttChart
  };
};

// Round Robin (RR)
export const calculateRR = (processes: Process[], timeQuantum: number = 2): CalculationResult => {
  const n = processes.length;
  const waitingTime: number[] = new Array(n).fill(0);
  const turnaroundTime: number[] = new Array(n).fill(0);
  const completionTime: number[] = new Array(n).fill(0);
  const ganttChart: { processId: number; startTime: number; endTime: number }[] = [];
  
  let currentTime = 0;
  let remainingProcesses = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
  let queue: typeof remainingProcesses = [];
  
  while (remainingProcesses.length > 0 || queue.length > 0) {
    // Add newly arrived processes to queue
    const newProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
    queue.push(...newProcesses);
    remainingProcesses = remainingProcesses.filter(p => p.arrivalTime > currentTime);
    
    if (queue.length === 0) {
      currentTime = Math.min(...remainingProcesses.map(p => p.arrivalTime));
      continue;
    }
    
    const currentProcess = queue.shift()!;
    const executeTime = Math.min(timeQuantum, currentProcess.remainingTime);
    
    ganttChart.push({
      processId: currentProcess.id,
      startTime: currentTime,
      endTime: currentTime + executeTime
    });
    
    currentProcess.remainingTime -= executeTime;
    currentTime += executeTime;
    
    if (currentProcess.remainingTime > 0) {
      queue.push(currentProcess);
    } else {
      completionTime[currentProcess.id - 1] = currentTime;
      turnaroundTime[currentProcess.id - 1] = completionTime[currentProcess.id - 1] - currentProcess.arrivalTime;
      waitingTime[currentProcess.id - 1] = turnaroundTime[currentProcess.id - 1] - currentProcess.burstTime;
    }
  }
  
  return {
    waitingTime,
    turnaroundTime,
    completionTime,
    averageWaitingTime: calculateAverage(waitingTime),
    averageTurnaroundTime: calculateAverage(turnaroundTime),
    ganttChart
  };
};

// Longest Job First (LJF)
export const calculateLJF = (processes: Process[]): CalculationResult => {
  const n = processes.length;
  const waitingTime: number[] = new Array(n).fill(0);
  const turnaroundTime: number[] = new Array(n).fill(0);
  const completionTime: number[] = new Array(n).fill(0);
  const ganttChart: { processId: number; startTime: number; endTime: number }[] = [];
  
  let currentTime = 0;
  let remainingProcesses = [...processes];
  
  while (remainingProcesses.length > 0) {
    const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
    
    if (availableProcesses.length === 0) {
      currentTime = Math.min(...remainingProcesses.map(p => p.arrivalTime));
      continue;
    }
    
    const longestJob = availableProcesses.reduce((prev, curr) => 
      prev.burstTime > curr.burstTime ? prev : curr
    );
    
    ganttChart.push({
      processId: longestJob.id,
      startTime: currentTime,
      endTime: currentTime + longestJob.burstTime
    });
    
    completionTime[longestJob.id - 1] = currentTime + longestJob.burstTime;
    turnaroundTime[longestJob.id - 1] = completionTime[longestJob.id - 1] - longestJob.arrivalTime;
    waitingTime[longestJob.id - 1] = turnaroundTime[longestJob.id - 1] - longestJob.burstTime;
    
    currentTime += longestJob.burstTime;
    remainingProcesses = remainingProcesses.filter(p => p.id !== longestJob.id);
  }
  
  return {
    waitingTime,
    turnaroundTime,
    completionTime,
    averageWaitingTime: calculateAverage(waitingTime),
    averageTurnaroundTime: calculateAverage(turnaroundTime),
    ganttChart
  };
};

// Longest Remaining Time First (LRTF)
export const calculateLRTF = (processes: Process[]): CalculationResult => {
  const n = processes.length;
  const waitingTime: number[] = new Array(n).fill(0);
  const turnaroundTime: number[] = new Array(n).fill(0);
  const completionTime: number[] = new Array(n).fill(0);
  const ganttChart: { processId: number; startTime: number; endTime: number }[] = [];
  
  let currentTime = 0;
  let remainingProcesses = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
  let lastProcessId = -1;
  
  while (remainingProcesses.length > 0) {
    const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
    
    if (availableProcesses.length === 0) {
      currentTime = Math.min(...remainingProcesses.map(p => p.arrivalTime));
      continue;
    }
    
    const longestJob = availableProcesses.reduce((prev, curr) => 
      prev.remainingTime > curr.remainingTime ? prev : curr
    );
    
    if (lastProcessId !== longestJob.id) {
      if (lastProcessId !== -1) {
        ganttChart[ganttChart.length - 1].endTime = currentTime;
      }
      ganttChart.push({
        processId: longestJob.id,
        startTime: currentTime,
        endTime: currentTime + 1
      });
      lastProcessId = longestJob.id;
    }
    
    longestJob.remainingTime--;
    currentTime++;
    
    if (longestJob.remainingTime === 0) {
      completionTime[longestJob.id - 1] = currentTime;
      turnaroundTime[longestJob.id - 1] = completionTime[longestJob.id - 1] - longestJob.arrivalTime;
      waitingTime[longestJob.id - 1] = turnaroundTime[longestJob.id - 1] - longestJob.burstTime;
      remainingProcesses = remainingProcesses.filter(p => p.id !== longestJob.id);
      lastProcessId = -1;
    }
  }
  
  return {
    waitingTime,
    turnaroundTime,
    completionTime,
    averageWaitingTime: calculateAverage(waitingTime),
    averageTurnaroundTime: calculateAverage(turnaroundTime),
    ganttChart
  };
};

// Priority Scheduling (Preemptive)
export const calculatePriorityP = (processes: Process[]): CalculationResult => {
  const n = processes.length;
  const waitingTime: number[] = new Array(n).fill(0);
  const turnaroundTime: number[] = new Array(n).fill(0);
  const completionTime: number[] = new Array(n).fill(0);
  const ganttChart: { processId: number; startTime: number; endTime: number }[] = [];
  
  let currentTime = 0;
  let remainingProcesses = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
  let lastProcessId = -1;
  
  while (remainingProcesses.length > 0) {
    const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
    
    if (availableProcesses.length === 0) {
      currentTime = Math.min(...remainingProcesses.map(p => p.arrivalTime));
      continue;
    }
    
    const highestPriorityJob = availableProcesses.reduce((prev, curr) => 
      (prev.priority ?? 0) < (curr.priority ?? 0) ? prev : curr
    );
    
    if (lastProcessId !== highestPriorityJob.id) {
      if (lastProcessId !== -1) {
        ganttChart[ganttChart.length - 1].endTime = currentTime;
      }
      ganttChart.push({
        processId: highestPriorityJob.id,
        startTime: currentTime,
        endTime: currentTime + 1
      });
      lastProcessId = highestPriorityJob.id;
    }
    
    highestPriorityJob.remainingTime--;
    currentTime++;
    
    if (highestPriorityJob.remainingTime === 0) {
      completionTime[highestPriorityJob.id - 1] = currentTime;
      turnaroundTime[highestPriorityJob.id - 1] = completionTime[highestPriorityJob.id - 1] - highestPriorityJob.arrivalTime;
      waitingTime[highestPriorityJob.id - 1] = turnaroundTime[highestPriorityJob.id - 1] - highestPriorityJob.burstTime;
      remainingProcesses = remainingProcesses.filter(p => p.id !== highestPriorityJob.id);
      lastProcessId = -1;
    }
  }
  
  return {
    waitingTime,
    turnaroundTime,
    completionTime,
    averageWaitingTime: calculateAverage(waitingTime),
    averageTurnaroundTime: calculateAverage(turnaroundTime),
    ganttChart
  };
};

// Priority Scheduling (Non-Preemptive)
export const calculatePriorityNP = (processes: Process[]): CalculationResult => {
  const n = processes.length;
  const waitingTime: number[] = new Array(n).fill(0);
  const turnaroundTime: number[] = new Array(n).fill(0);
  const completionTime: number[] = new Array(n).fill(0);
  const ganttChart: { processId: number; startTime: number; endTime: number }[] = [];
  
  let currentTime = 0;
  let remainingProcesses = [...processes];
  
  while (remainingProcesses.length > 0) {
    const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
    
    if (availableProcesses.length === 0) {
      currentTime = Math.min(...remainingProcesses.map(p => p.arrivalTime));
      continue;
    }
    
    const highestPriorityJob = availableProcesses.reduce((prev, curr) => 
      (prev.priority ?? 0) < (curr.priority ?? 0) ? prev : curr
    );
    
    ganttChart.push({
      processId: highestPriorityJob.id,
      startTime: currentTime,
      endTime: currentTime + highestPriorityJob.burstTime
    });
    
    completionTime[highestPriorityJob.id - 1] = currentTime + highestPriorityJob.burstTime;
    turnaroundTime[highestPriorityJob.id - 1] = completionTime[highestPriorityJob.id - 1] - highestPriorityJob.arrivalTime;
    waitingTime[highestPriorityJob.id - 1] = turnaroundTime[highestPriorityJob.id - 1] - highestPriorityJob.burstTime;
    
    currentTime += highestPriorityJob.burstTime;
    remainingProcesses = remainingProcesses.filter(p => p.id !== highestPriorityJob.id);
  }
  
  return {
    waitingTime,
    turnaroundTime,
    completionTime,
    averageWaitingTime: calculateAverage(waitingTime),
    averageTurnaroundTime: calculateAverage(turnaroundTime),
    ganttChart
  };
}; 