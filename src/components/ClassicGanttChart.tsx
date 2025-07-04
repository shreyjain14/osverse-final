"use client";

interface GanttEntry {
  name: string;
  start: number;
  end: number;
}

interface ClassicGanttChartProps {
  gantt: GanttEntry[];
}

const processColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export default function ClassicGanttChart({ gantt }: ClassicGanttChartProps) {
  if (!gantt || gantt.length === 0) return <div className="text-center text-gray-400">No Gantt data</div>;
  const total = gantt[gantt.length - 1].end;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Gantt Bar Row */}
      <div className="flex w-full border border-gray-300 rounded overflow-hidden bg-white shadow-sm" style={{ minHeight: 48 }}>
        {gantt.map((g, i) => {
          const widthPercent = ((g.end - g.start) / total) * 100;
          return (
            <div
              key={i}
              className="flex items-center justify-center border-r last:border-r-0 border-gray-300 text-xs font-bold"
              style={{
                width: `${widthPercent}%`,
                background: processColors[i % processColors.length],
                color: '#222',
                minWidth: 40,
                position: 'relative',
                height: 48
              }}
            >
              {g.name}
            </div>
          );
        })}
      </div>
      {/* Time Markers */}
      <div className="flex w-full relative select-none">
        {gantt.map((g, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${(g.start / total) * 100}%`,
              transform: 'translateX(-50%)',
              minWidth: 24,
              textAlign: 'center',
              fontSize: 12,
              color: '#555',
              top: 0
            }}
          >
            {g.start}
          </div>
        ))}
        {/* Last time marker */}
        <div
          style={{
            position: 'absolute',
            left: '100%',
            transform: 'translateX(-50%)',
            minWidth: 24,
            textAlign: 'center',
            fontSize: 12,
            color: '#555',
            top: 0
          }}
        >
          {total}
        </div>
      </div>
    </div>
  );
} 