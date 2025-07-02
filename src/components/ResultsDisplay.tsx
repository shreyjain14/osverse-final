import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface ResultsDisplayProps {
  waitingTime: number[];
  turnaroundTime: number[];
  completionTime: number[];
  averageWaitingTime: number;
  averageTurnaroundTime: number;
  ganttChart: { processId: number; startTime: number; endTime: number }[];
}

export default function ResultsDisplay({
  waitingTime,
  turnaroundTime,
  completionTime,
  averageWaitingTime,
  averageTurnaroundTime,
  ganttChart,
}: ResultsDisplayProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if any
    const existingChart = Chart.getChart(chartRef.current);
    if (existingChart) {
      existingChart.destroy();
    }

    // Prepare data for Gantt chart
    const labels = ganttChart.map(item => `P${item.processId}`);
    const data = ganttChart.map(item => ({
      x: [item.startTime, item.endTime],
      y: `P${item.processId}`,
    }));

    // Create new chart
    new Chart(ctx, {
      type: 'bar',
      data: {
        datasets: [{
          label: 'Process Timeline',
          data: data,
          backgroundColor: ganttChart.map(() => 
            `hsl(${Math.random() * 360}, 70%, 50%)`
          ),
          borderWidth: 1,
        }],
      },
      options: {
        indexAxis: 'y',
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'Time Units',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Process ID',
            },
          },
        },
        plugins: {
          title: {
            display: true,
            text: 'Gantt Chart',
          },
        },
      },
    });
  }, [ganttChart]);

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Average Times</h3>
            <p>Average Waiting Time: {averageWaitingTime.toFixed(2)}</p>
            <p>Average Turnaround Time: {averageTurnaroundTime.toFixed(2)}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Process Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2">Process</th>
                    <th className="px-4 py-2">Waiting Time</th>
                    <th className="px-4 py-2">Turnaround Time</th>
                    <th className="px-4 py-2">Completion Time</th>
                  </tr>
                </thead>
                <tbody>
                  {waitingTime.map((_, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">P{index + 1}</td>
                      <td className="px-4 py-2">{waitingTime[index]}</td>
                      <td className="px-4 py-2">{turnaroundTime[index]}</td>
                      <td className="px-4 py-2">{completionTime[index]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <canvas ref={chartRef} height="200"></canvas>
      </div>
    </div>
  );
} 