import React from 'react';
import { Bot, Wrench, Sparkles, FolderGit2 } from 'lucide-react';

export interface ProjectData {
  name: string;
  summary: string;
  tech_stack: string[];
  quality: string;
  improvement: string;
}

interface ProjectsProps {
  projects: ProjectData[];
}

export default function Projects({ projects }: ProjectsProps) {
  if (!projects || projects.length === 0) return null;

  return (
    <div className="space-y-6 mt-12 mb-12">
      <div className="flex items-center space-x-2 mb-6">
        <FolderGit2 className="h-6 w-6 text-slate-800" />
        <h2 className="text-2xl font-bold text-slate-800">Deep Project Analysis</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((proj, idx) => {
          const qualityColor = 
             proj.quality?.toLowerCase().includes('strong') || proj.quality?.toLowerCase().includes('advanced') ? 'text-emerald-700 bg-emerald-100' :
             proj.quality?.toLowerCase().includes('intermediate') ? 'text-blue-700 bg-blue-100' : 'text-slate-700 bg-slate-100';

          return (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col h-full hover:border-blue-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-900 break-all">{proj.name || 'Unnamed'}</h3>
                {proj.quality && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ml-3 ${qualityColor}`}>
                    {proj.quality}
                  </span>
                )}
              </div>
              
              <div className="flex-grow space-y-4">
                <div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-700 mr-1">Summary:</span>
                    {proj.summary}
                  </p>
                </div>
                
                {proj.tech_stack && proj.tech_stack.length > 0 && (
                  <div className="flex items-start">
                    <Wrench className="h-4 w-4 mt-0.5 text-slate-400 mr-2 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1.5">
                      {proj.tech_stack.map((tech, i) => (
                        <span key={i} className="text-xs font-medium px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-md">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-start">
                  <Sparkles className="h-4 w-4 mt-0.5 text-amber-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-slate-700 italic">
                    <span className="font-semibold not-italic text-slate-800 mr-1">AI Suggestion:</span>
                    {proj.improvement}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
