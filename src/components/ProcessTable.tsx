import React, { useState } from 'react';

interface Process {
  id: number;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
}

interface ProcessTableProps {
  showPriority?: boolean;
  onCalculate: (processes: Process[]) => void;
  algorithm: string;
}

export default function ProcessTable({ showPriority = false, onCalculate, algorithm }: ProcessTableProps) {
  const [processes, setProcesses] = useState<Process[]>([
    { id: 1, arrivalTime: 0, burstTime: 0, priority: showPriority ? 0 : undefined }
  ]);
  const [isCalculating, setIsCalculating] = useState(false);

  const addProcessBelow = (index: number) => {
    const newProcess: Process = {
      id: processes.length + 1,
      arrivalTime: 0,
      burstTime: 0,
      priority: showPriority ? 0 : undefined
    };
    const newProcesses = [
      ...processes.slice(0, index + 1),
      newProcess,
      ...processes.slice(index + 1)
    ].map((p, i) => ({ ...p, id: i + 1 }));
    setProcesses(newProcesses);
  };

  const removeProcess = (index: number) => {
    if (processes.length === 1) return;
    const newProcesses = processes.filter((_, i) => i !== index).map((p, i) => ({ ...p, id: i + 1 }));
    setProcesses(newProcesses);
  };

  const updateProcess = (index: number, field: keyof Process, value: number) => {
    setProcesses(processes.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    ));
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onCalculate(processes);
    setIsCalculating(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-4">{algorithm}</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Add, edit, or remove processes. Click 'Add Below' to insert a new process after any row.
        </p>
      </div>
      <div className="card overflow-x-auto mb-8">
        <table className="table-modern">
          <thead>
            <tr>
              <th className="text-center">Process ID</th>
              <th className="text-center">Arrival Time</th>
              <th className="text-center">Burst Time</th>
              {showPriority && <th className="text-center">Priority</th>}
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((process, idx) => (
              <tr key={process.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
                <td className="text-center font-semibold">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm mx-auto">
                    P{process.id}
                  </div>
                </td>
                <td className="text-center">
                  <input
                    type="number"
                    min="0"
                    value={process.arrivalTime}
                    onChange={e => updateProcess(idx, 'arrivalTime', parseInt(e.target.value) || 0)}
                    className="input-field w-24 text-center"
                  />
                </td>
                <td className="text-center">
                  <input
                    type="number"
                    min="1"
                    value={process.burstTime}
                    onChange={e => updateProcess(idx, 'burstTime', parseInt(e.target.value) || 0)}
                    className="input-field w-24 text-center"
                  />
                </td>
                {showPriority && (
                  <td className="text-center">
                    <input
                      type="number"
                      min="0"
                      value={process.priority}
                      onChange={e => updateProcess(idx, 'priority', parseInt(e.target.value) || 0)}
                      className="input-field w-24 text-center"
                    />
                  </td>
                )}
                <td className="text-center flex flex-col gap-2 items-center">
                  <button
                    onClick={() => addProcessBelow(idx)}
                    className="btn-secondary flex items-center space-x-1 px-2 py-1 text-xs"
                  >
                    <span>+ Add Below</span>
                  </button>
                  <button
                    onClick={() => removeProcess(idx)}
                    disabled={processes.length === 1}
                    className="text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200 p-1 rounded-lg hover:bg-red-50 text-xs"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-4">
        <button
          onClick={handleCalculate}
          disabled={isCalculating || processes.some(p => p.burstTime <= 0)}
          className="btn-success flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCalculating ? (
            <>
              <div className="spinner"></div>
              <span>Calculating...</span>
            </>
          ) : (
            <>
              <span>Calculate Results</span>
            </>
          )}
        </button>
      </div>
      {processes.some(p => p.burstTime <= 0) && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
          <div className="flex items-center justify-center space-x-2 text-yellow-800">
            <span className="font-medium">Please ensure all processes have burst time greater than 0</span>
          </div>
        </div>
      )}
    </div>
  );
} 