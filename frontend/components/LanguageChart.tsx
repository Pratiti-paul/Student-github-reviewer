import React from 'react';
import { PieChart, List } from 'lucide-react';

interface Language {
  name: string;
  value: number; // percentage
}

interface LanguageChartProps {
  data: Language[];
}

const COLORS = [
  '#2563eb', // blue
  '#ea580c', // orange
  '#059669', // emerald
  '#7c3aed', // violet
  '#db2777', // pink
  '#4b5563', // gray (others)
];

export default function LanguageChart({ data }: LanguageChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col items-center justify-center min-h-[300px]">
        <PieChart className="w-12 h-12 text-slate-200 mb-4" />
        <p className="text-slate-400 font-medium italic">No language data available</p>
      </div>
    );
  }

  // Calculate coordinates for SVG segments
  let cumulativeValue = 0;
  const segments = data.map((item, index) => {
    const startValue = cumulativeValue;
    cumulativeValue += item.value;
    return { ...item, startValue, color: COLORS[index % COLORS.length] };
  });

  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 space-y-8 h-full animate-fade-in-up">
      
      <div className="space-y-1">
        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <PieChart className="w-5 h-5 text-blue-600" />
          Stack Distribution
        </h3>
        <p className="text-slate-400 text-sm font-medium italic">Across analyzed repositories</p>
      </div>

      <div className="flex flex-col items-center gap-10">
        {/* Simple CSS-based Donut using Conic Gradient */}
        <div 
          className="relative w-48 h-48 rounded-full shadow-inner flex items-center justify-center group"
          style={{
            background: `conic-gradient(${segments.map(s => `${s.color} ${s.startValue}% ${s.startValue + s.value}%`).join(', ')})`
          }}
        >
          {/* Inner Circle for Donut Effect */}
          <div className="absolute inset-8 bg-white rounded-full flex flex-col items-center justify-center text-center shadow-lg transition-transform group-hover:scale-110">
             <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Top</span>
             <span className="text-2xl font-black text-slate-900">{data[0]?.name}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full space-y-3">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between group cursor-default">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full transition-transform group-hover:scale-125" 
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                />
                <span className="text-sm font-bold text-slate-700">{item.name}</span>
              </div>
              <span className="text-sm font-black text-slate-400 font-mono">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
