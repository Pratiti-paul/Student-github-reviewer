import React from 'react';
import { Target, Trophy, Briefcase } from 'lucide-react';

interface KPIcardsProps {
  score: number;
  level: string;
  hireability: string;
}

export default function KPIcards({ score, level, hireability }: KPIcardsProps) {
  const scoreColor = score >= 8 ? 'text-green-600 bg-green-50' : score >= 5 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50';
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Score Card */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex items-center space-x-4">
        <div className={`p-4 rounded-xl ${scoreColor}`}>
          <Target className="h-8 w-8" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Portfolio Score</p>
          <h3 className="text-3xl font-bold text-slate-900">{score}<span className="text-lg text-slate-400 font-normal">/10</span></h3>
        </div>
      </div>

      {/* Level Card */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex items-center space-x-4">
        <div className="p-4 rounded-xl text-indigo-600 bg-indigo-50">
          <Trophy className="h-8 w-8" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Developer Level</p>
          <h3 className="text-2xl font-bold text-slate-900">{level}</h3>
        </div>
      </div>

      {/* Hireability Card */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex items-center space-x-4">
        <div className="p-4 rounded-xl text-blue-600 bg-blue-50">
          <Briefcase className="h-8 w-8" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Hireability</p>
          <h3 className="text-2xl font-bold text-slate-900">{hireability}</h3>
        </div>
      </div>
    </div>
  );
}
