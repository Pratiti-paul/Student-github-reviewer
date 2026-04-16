import React from 'react';
import { Code2 } from 'lucide-react';

interface SkillsProps {
  skills: string[];
}

export default function Skills({ skills }: SkillsProps) {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <Code2 className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-800">Demonstrated Skills</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span 
            key={index} 
            className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
