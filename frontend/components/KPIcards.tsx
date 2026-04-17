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
  hireability, 
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

  const getHireabilityColor = (val?: string) => {
    const v = val?.toLowerCase();
    if (v === 'hireable') return 'bg-green-500 text-white';
    if (v === 'borderline') return 'bg-amber-500 text-white';
    return 'bg-slate-400 text-white';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
      {/* Primary Assessment Card */}
      <div className="lg:col-span-1 bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
           <Briefcase className="w-32 h-32 rotate-12" />
        </div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
               <UserCheck className="h-6 w-6" />
            </div>
            {hireability && (
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${getHireabilityColor(hireability)}`}>
                {hireability}
              </span>
            )}
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Portfolio Level</p>
            <div className="flex items-center gap-3">
              <span className={`text-4xl font-black tracking-tight px-4 py-1 rounded-2xl border-2 ${getAssessmentColor(assessment)}`}>
                {assessment || 'Analyzing...'}
              </span>
            </div>
          </div>
        </div>


      </div>

      {/* Secondary Metric Cards Container */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Analyzed Repos */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center space-x-6">
          <div className="p-5 rounded-2xl text-emerald-600 bg-emerald-50">
            <Target className="h-10 w-10" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Analysis</p>
            <h3 className="text-4xl font-black text-slate-900">{totalProjects}</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Original repositories</p>
          </div>
        </div>

        {/* Standout Projects */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center space-x-6">
          <div className="p-5 rounded-2xl text-amber-600 bg-amber-50">
            <Trophy className="h-10 w-10" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Top Tier</p>
            <h3 className="text-4xl font-black text-slate-900">{topProjectsCount}</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Standout original works</p>
          </div>
        </div>
      </div>
    </div>
  );
}
