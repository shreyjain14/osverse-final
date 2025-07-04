"use client";
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Bar } from 'recharts';

interface GanttEntry {
  name: string;
  start: number;
  end: number;
}

interface GanttChartProps {
  gantt: GanttEntry[];
  colorScheme: string;
}

const processColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export default function GanttChart({ gantt, colorScheme }: GanttChartProps) {
  // Create timeline data showing which process is running at each time unit
  const timelineData = [];
  const maxTime = gantt.length > 0 ? Math.max(...gantt.map(g => g.end)) : 10;
  
  for (let time = 0; time <= maxTime; time++) {
    const entry: any = { time };
    
    // Find which process is running at this time
    let runningProcess = null;
    for (const g of gantt) {
      if (time >= g.start && time < g.end) {
        runningProcess = g.name;
        break;
      }
    }
    
    entry.process = runningProcess || 'Idle';
    entry.active = runningProcess ? 1 : 0;
    
    // Add individual process data for stacked visualization
    gantt.forEach((g, i) => {
      if (time >= g.start && time < g.end) {
        entry[g.name] = 1;
      } else {
        entry[g.name] = 0;
      }
    });
    
    timelineData.push(entry);
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            type="number"
            domain={[0, maxTime]}
            tickCount={Math.min(maxTime + 1, 20)}
            label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            domain={[0, 1]}
            tickFormatter={(value) => value === 1 ? 'CPU' : ''}
            label={{ value: 'CPU Status', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value, name, props) => {
              if (name === 'process') {
                return [props.payload.process, 'Running Process'];
              }
              if (name !== 'time' && name !== 'active') {
                return [name, 'Process'];
              }
              return [value, name];
            }}
            labelFormatter={(label) => `Time: ${label}`}
          />
          
          {/* Render bars for each process */}
          {gantt.map((g, i) => (
            <Bar
              key={g.name}
              dataKey={g.name}
              stackId="a"
              fill={processColors[i % processColors.length]}
              stroke={processColors[i % processColors.length]}
              strokeWidth={1}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* Process Legend */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {gantt.map((g, i) => (
          <div key={g.name} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: processColors[i % processColors.length] }}
            />
            <span className="text-sm font-medium">{g.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 