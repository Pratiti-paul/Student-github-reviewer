import React from 'react';
import { Target, Trophy, Briefcase } from 'lucide-react';

interface KPIcardsProps {
  hireability: string;
  totalProjects: number;
  topProjectsCount: number;
}

export default function KPIcards({ hireability, totalProjects, topProjectsCount }: KPIcardsProps) {
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Hireability Card */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex items-center space-x-4">
        <div className="p-4 rounded-xl text-blue-600 bg-blue-50">
          <Briefcase className="h-8 w-8" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Hireability</p>
          <h3 className="text-2xl font-bold text-slate-900">{hireability || 'Unknown'}</h3>
        </div>
      </div>

      {/* Total Projects Card */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex items-center space-x-4">
        <div className="p-4 rounded-xl text-green-600 bg-green-50">
          <Target className="h-8 w-8" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Analyzed Repos</p>
          <h3 className="text-3xl font-bold text-slate-900">{totalProjects}</h3>
        </div>
      </div>

      {/* Top Projects Card */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex items-center space-x-4">
        <div className="p-4 rounded-xl text-indigo-600 bg-indigo-50">
          <Trophy className="h-8 w-8" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Standout Projects</p>
          <h3 className="text-3xl font-bold text-slate-900">{topProjectsCount}</h3>
        </div>
      </div>
    </div>
  );
}
