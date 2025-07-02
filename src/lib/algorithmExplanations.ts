export const algorithmExplanations: Record<string, string> = {
  'fcfs': `First Come First Serve (FCFS) is the simplest CPU scheduling algorithm. In this algorithm:
• Processes are executed in the order they arrive in the ready queue
• It is a non-preemptive algorithm, meaning once a process starts executing, it continues until completion
• Easy to understand and implement
• However, it can lead to the "convoy effect" where short processes wait behind long ones`,

  'sjf': `Shortest Job First (SJF) is a non-preemptive scheduling algorithm that:
• Selects the process with the smallest burst time to execute next
• Optimal for minimizing average waiting time
• Requires knowledge of burst time in advance
• May lead to starvation of processes with longer burst times
• Non-preemptive: once a process starts, it runs to completion`,

  'srtf': `Shortest Remaining Time First (SRTF) is the preemptive version of SJF that:
• Always chooses the process with the shortest remaining time
• Preempts current process if a new process arrives with shorter burst time
• Optimal for minimizing average waiting time
• Can lead to starvation of longer processes
• Has higher overhead due to frequent context switching`,

  'round-robin': `Round Robin (RR) is a preemptive scheduling algorithm where:
• Each process gets a fixed time quantum/slice
• After time quantum expires, process is moved to back of ready queue
• Fair allocation of CPU time to all processes
• No starvation as each process gets fair share of CPU
• Performance depends heavily on time quantum size`,

  'ljf': `Longest Job First (LJF) is a non-preemptive scheduling algorithm that:
• Selects the process with the largest burst time to execute next
• Opposite of SJF
• Can be useful in specific scenarios where longer jobs are prioritized
• May lead to starvation of shorter processes
• Non-preemptive: once a process starts, it runs to completion`,

  'lrtf': `Longest Remaining Time First (LRTF) is the preemptive version of LJF where:
• Always chooses the process with the longest remaining time
• Preempts current process if a new process arrives with longer remaining time
• Can lead to starvation of shorter processes
• Has higher overhead due to frequent context switching
• Useful in specific scenarios where longer processes are critical`,

  'priority-p': `Priority Scheduling (Preemptive) is an algorithm where:
• Each process is assigned a priority
• Higher priority processes are executed first
• Current process is preempted if a higher priority process arrives
• Can lead to starvation of lower priority processes
• Priority can be based on memory requirements, time requirements, etc.`,

  'priority-np': `Priority Scheduling (Non-Preemptive) is an algorithm where:
• Each process is assigned a priority
• Higher priority processes are executed first
• Once a process starts executing, it cannot be preempted
• Can lead to starvation of lower priority processes
• Simpler to implement than preemptive version but less flexible`
}; 