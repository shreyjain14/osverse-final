import Image from "next/image";
import Link from "next/link";

interface AlgorithmCardProps {
  name: string;
  icon: string;
  description: string;
  features: string[];
  href: string;
  gradient: string;
}

export default function AlgorithmCard({ name, icon, description, features, href, gradient }: AlgorithmCardProps) {
  return (
    <div
      className="group relative rounded-3xl shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 card-hover animate-fade-in-up glass border border-white/20 backdrop-blur-lg"
      style={{ background: `${gradient}, rgba(255,255,255,0.15)` }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full -translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-700"></div>
        <div className="absolute bottom-0 right-0 w-14 h-14 bg-white rounded-full translate-x-6 translate-y-6 group-hover:scale-125 transition-transform duration-700"></div>
      </div>

      <div className="relative h-full flex flex-col items-center justify-center p-8 text-white">
        {/* Icon */}
        <div className="w-14 h-14 mb-4 flex items-center justify-center rounded-full bg-white/30 shadow-lg border-2 border-white/30">
          <div className="w-8 h-8 relative">
            <Image
              src={icon}
              alt={`${name} icon`}
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-center mb-2 gradient-text drop-shadow-lg">
          {name}
        </h2>

        {/* Description */}
        <p className="text-white/90 text-center text-sm leading-relaxed mb-4">
          {description}
        </p>

        {/* Features */}
        <div className="space-y-2 w-full mb-4">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-xs">
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              <span className="text-white/80">{feature}</span>
            </div>
          ))}
        </div>

        {/* Visualize Button */}
        <Link
          href={href}
          className="inline-block mt-2 px-5 py-2 rounded-xl bg-white/80 text-blue-700 font-semibold shadow-md hover:bg-white hover:scale-105 transition-all duration-200 backdrop-blur-md"
        >
          Visualize
        </Link>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
      </div>
    </div>
  );
} 