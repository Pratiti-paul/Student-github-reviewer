import React from 'react';
import { Target, Trophy, Briefcase, UserCheck } from 'lucide-react';

interface KPIcardsProps {
  assessment?: string;
  hireability?: string;
  summary?: string;
  totalProjects: number;
  topProjectsCount: number;
}

export default function KPIcards({ 
  assessment, 
  summary,
  totalProjects, 
  topProjectsCount 
}: KPIcardsProps) {
  
  const getAssessmentColor = (val?: string) => {
    const v = val?.toLowerCase();
    if (v === 'strong') return 'bg-green-100 text-green-700 border-green-200';
    if (v === 'good') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (v === 'average') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Primary Assessment Card */}
      <div className="lg:col-span-1 bg-white rounded-[2.5rem] p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02)] relative overflow-hidden group border border-slate-50/50">
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
           <Briefcase className="w-32 h-32 rotate-12" />
        </div>
        
        <div className="relative h-full flex flex-col justify-between">
          <div className="flex items-center justify-between mb-12">
            <div className="p-4 rounded-[1.2rem] bg-blue-50 text-blue-600 shadow-sm">
               <UserCheck className="h-6 w-6" />
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Portfolio Level</p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className={`text-5xl font-black tracking-tight px-6 py-2 rounded-2xl border-2 ${getAssessmentColor(assessment)}`}>
                  {assessment || 'Analyzing...'}
                </span>
              </div>
              {summary && (
                <p className="text-slate-500 text-sm leading-relaxed font-medium italic border-l-2 border-slate-100 pl-4 mt-2">
                  "{summary}"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metric Cards Container */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Analyzed Repos */}
        <div className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex items-center space-x-8 border border-slate-50/50">
          <div className="p-6 rounded-[1.5rem] text-emerald-600 bg-emerald-50/50 shadow-sm shadow-emerald-100">
            <Target className="h-10 w-10" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Total Analysis</p>
            <h3 className="text-5xl font-black text-slate-900 tracking-tight">{totalProjects}</h3>
            <p className="text-xs text-slate-400 mt-2 font-medium">Original repositories</p>
          </div>
        </div>

        {/* Standout Projects */}
        <div className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex items-center space-x-8 border border-slate-50/50">
          <div className="p-6 rounded-[1.5rem] text-amber-600 bg-amber-50/50 shadow-sm shadow-amber-100">
            <Trophy className="h-10 w-10" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Top Tier</p>
            <h3 className="text-5xl font-black text-slate-900 tracking-tight">{topProjectsCount}</h3>
            <p className="text-xs text-slate-400 mt-2 font-medium">Standout original works</p>
          </div>
        </div>
      </div>
    </div>
  );
}
