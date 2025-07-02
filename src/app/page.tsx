import Image from "next/image";
import Link from "next/link";

const algorithms = [
  { id: "0", name: "FCFS", icon: "/assets/algoIcons/flagIcon.png", color: "bg-emerald-600", gradient: "from-emerald-400", description: "First Come First Serve - Simple and straightforward scheduling" },
  { id: "1", name: "SJF", icon: "/assets/algoIcons/fast-forward.png", color: "bg-blue-700", gradient: "from-amber-400", description: "Shortest Job First - Optimizes for shorter processes" },
  { id: "2", name: "SRTF", icon: "/assets/algoIcons/clock.png", color: "bg-blue-600", gradient: "from-cyan-400", description: "Shortest Remaining Time First - Preemptive version of SJF" },
  { id: "3", name: "Round Robin", icon: "/assets/algoIcons/refresh.png", color: "bg-amber-500", gradient: "from-purple-500", description: "Time-sliced scheduling for fair process execution" },
  { id: "4", name: "LJF", icon: "/assets/algoIcons/watch.png", color: "bg-purple-400", gradient: "from-indigo-700", description: "Longest Job First - Prioritizes longer processes" },
  { id: "5", name: "LRTF", icon: "/assets/algoIcons/server.png", color: "bg-amber-500", gradient: "from-amber-900", description: "Longest Remaining Time First - Preemptive version of LJF" },
  { id: "6", name: "Priority (P)", icon: "/assets/algoIcons/priority.png", color: "bg-red-500", gradient: "from-yellow-400", description: "Preemptive Priority Scheduling - Based on process priority" },
  { id: "7", name: "Priority (NP)", icon: "/assets/algoIcons/percentage.png", color: "bg-teal-400", gradient: "from-teal-600", description: "Non-preemptive Priority Scheduling" }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            CPU Scheduling
            <span className="text-blue-600"> Visualizer</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Interactive visualization of popular CPU scheduling algorithms. Choose an algorithm below to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {algorithms.map((algo) => (
            <Link 
              key={algo.id}
              href={`/algorithm/${algo.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}`}
              className={`group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${algo.color}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${algo.gradient} to-transparent opacity-60 transition-opacity group-hover:opacity-80`} />
              <div className="relative h-full flex flex-col items-center justify-center p-8">
                <div className="w-20 h-20 relative mb-6 transform transition-transform group-hover:scale-110">
                  <Image
                    src={algo.icon}
                    alt={`${algo.name} icon`}
                    fill
                    className="object-contain"
                  />
                </div>
                <h2 className="text-2xl font-bold text-white text-center mb-3">
                  {algo.name}
                </h2>
                <p className="text-white/90 text-center text-sm">
                  {algo.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-blue-600 text-2xl mb-3">1</div>
              <h3 className="font-semibold mb-2">Select Algorithm</h3>
              <p className="text-gray-600">Choose from any of the available CPU scheduling algorithms above</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-blue-600 text-2xl mb-3">2</div>
              <h3 className="font-semibold mb-2">Enter Process Details</h3>
              <p className="text-gray-600">Input arrival time, burst time, and other required parameters</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-blue-600 text-2xl mb-3">3</div>
              <h3 className="font-semibold mb-2">View Results</h3>
              <p className="text-gray-600">Analyze the Gantt chart and performance metrics</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
