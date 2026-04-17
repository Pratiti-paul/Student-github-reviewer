import React from 'react';
import { Flame, Calendar, Trophy } from 'lucide-react';

interface Day {
  date: string;
  count: number;
  color: string;
}

interface ContributionHeatmapProps {
  total: number;
  streakCurrent: number;
  streakLongest: number;
  days: Day[];
}

export default function ContributionHeatmap({ total, streakCurrent, streakLongest, days }: ContributionHeatmapProps) {
  if (!days || days.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col items-center justify-center min-h-[300px]">
        <Calendar className="w-12 h-12 text-slate-200 mb-4" />
        <p className="text-slate-400 font-medium italic">No contribution data available</p>
      </div>
    );
  }

  // Group days into weeks for the grid logic
  const weeks: Day[][] = [];
  let currentWeek: Day[] = [];
  
  days.forEach((day, i) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || i === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 space-y-8 animate-fade-in-up">
      
      {/* Header Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Contribution Activity
          </h3>
          <p className="text-slate-400 text-sm font-medium italic">{total.toLocaleString()} total contributions in the last year</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100 flex items-center gap-3">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-[10px] font-black text-orange-300 uppercase leading-none mb-1">Current Streak</p>
              <p className="text-lg font-black text-orange-600 leading-none">{streakCurrent} days</p>
            </div>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-[10px] font-black text-blue-300 uppercase leading-none mb-1">Longest Streak</p>
              <p className="text-lg font-black text-blue-600 leading-none">{streakLongest} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* The Heatmap Grid */}
      <div className="overflow-x-auto pb-4 scrollbar-hide">
        <div className="inline-grid grid-flow-col gap-1 auto-cols-max">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="grid grid-rows-7 gap-1">
              {week.map((day, dIdx) => (
                <div
                  key={`${wIdx}-${dIdx}`}
                  title={`${day.date}: ${day.count} contributions`}
                  className="w-3 h-3 rounded-[2px] transition-all duration-300 hover:scale-150 hover:z-10"
                  style={{ backgroundColor: day.color === '#ebedf0' ? '#f1f5f9' : day.color }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mr-2">Less</span>
        <div className="w-3 h-3 rounded-[2px] bg-slate-100"></div>
        <div className="w-3 h-3 rounded-[2px] bg-[#9be9a8]"></div>
        <div className="w-3 h-3 rounded-[2px] bg-[#40c463]"></div>
        <div className="w-3 h-3 rounded-[2px] bg-[#30a14e]"></div>
        <div className="w-3 h-3 rounded-[2px] bg-[#216e39]"></div>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">More</span>
      </div>
    </div>
  );
}
