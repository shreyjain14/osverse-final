import React, { useState } from 'react';
import { Chart } from 'chart.js/auto';

interface Process {
  id: number;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
}

interface InputTableProps {
  algorithm: string;
  onCalculate: (processes: Process[]) => void;
  showPriority?: boolean;
}

export default function InputTable({ algorithm, onCalculate, showPriority = false }: InputTableProps) {
  const [processes, setProcesses] = useState<Process[]>([
    { id: 1, arrivalTime: 0, burstTime: 0, priority: showPriority ? 0 : undefined }
  ]);

  const addProcess = () => {
    setProcesses([
      ...processes,
      {
        id: processes.length + 1,
        arrivalTime: 0,
        burstTime: 0,
        priority: showPriority ? 0 : undefined
      }
    ]);
  };

  const removeProcess = (id: number) => {
    if (processes.length > 1) {
      setProcesses(processes.filter(p => p.id !== id));
    }
  };

  const updateProcess = (id: number, field: keyof Process, value: number) => {
    setProcesses(processes.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{algorithm}</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left">Process ID</th>
              <th className="px-6 py-3 text-left">Arrival Time</th>
              <th className="px-6 py-3 text-left">Burst Time</th>
              {showPriority && <th className="px-6 py-3 text-left">Priority</th>}
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((process) => (
              <tr key={process.id} className="border-t border-gray-300">
                <td className="px-6 py-4">P{process.id}</td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    min="0"
                    value={process.arrivalTime}
                    onChange={(e) => updateProcess(process.id, 'arrivalTime', parseInt(e.target.value) || 0)}
                    className="w-20 p-1 border rounded"
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    min="1"
                    value={process.burstTime}
                    onChange={(e) => updateProcess(process.id, 'burstTime', parseInt(e.target.value) || 0)}
                    className="w-20 p-1 border rounded"
                  />
                </td>
                {showPriority && (
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      min="0"
                      value={process.priority}
                      onChange={(e) => updateProcess(process.id, 'priority', parseInt(e.target.value) || 0)}
                      className="w-20 p-1 border rounded"
                    />
                  </td>
                )}
                <td className="px-6 py-4">
                  <button
                    onClick={() => removeProcess(process.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-x-4">
        <button
          onClick={addProcess}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Process
        </button>
        <button
          onClick={() => onCalculate(processes)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Calculate
        </button>
      </div>
    </div>
  );
} 