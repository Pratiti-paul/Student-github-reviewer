import React, { useState, useEffect } from 'react';
import { Check, Loader2, Github, Terminal, Search, ShieldCheck } from 'lucide-react';

const steps = [
  { id: 1, text: "Connecting to GitHub...", icon: Github },
  { id: 2, text: "Indexing top repositories...", icon: Terminal },
  { id: 3, text: "AI project evaluation...", icon: Search },
  { id: 4, text: "Generating recruiter insights...", icon: ShieldCheck },
];

const subMessages = [
  "Scanning for professional impact signals...",
  "Analyzing tech stack distribution...",
  "Identifying standout contributions...",
  "Formatting recruiter deep-dive...",
  "Almost there, finalizing the report...",
];

export default function Loader() {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress through steps every 1.8 seconds (simulated)
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length ? prev + 1 : prev));
    }, 1800);

    // Rotate sub-messages every 2.5 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % subMessages.length);
    }, 2500);

    // Smooth fake progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98; // Stay near the end until data arrives
        return prev + 0.5;
      });
    }, 100);

    return () => {
      clearInterval(stepInterval);
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-lg mx-auto p-12 space-y-12 animate-fade-in-up">
      
      {/* Visual Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="relative bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-50">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        </div>
      </div>

      {/* Main Status */}
      <div className="text-center space-y-3">
        <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">
          Conducting Deep Analysis
        </h3>
        <p className="text-slate-400 text-sm font-medium h-5 flex items-center justify-center">
          <span className="animate-pulse">{subMessages[currentMessage]}</span>
        </p>
      </div>

      {/* Checklist Sections */}
      <div className="w-full space-y-5 bg-white/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const Icon = step.icon;

          return (
            <div 
              key={step.id} 
              className={`flex items-center space-x-4 transition-all duration-500 ${isCompleted || isActive ? 'opacity-100' : 'opacity-20 translate-x-2'}`}
            >
              <div className={`p-2 rounded-xl border-2 transition-all ${
                isCompleted ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 
                isActive ? 'bg-blue-50 border-blue-100 text-blue-500 shadow-sm' : 
                'bg-slate-50 border-slate-100 text-slate-300'
              }`}>
                {isCompleted ? <Check className="h-4 w-4" /> : <Icon className={`h-4 w-4 ${isActive ? 'animate-pulse' : ''}`} />}
              </div>
              <span className={`text-sm font-bold tracking-tight transition-colors ${
                isCompleted ? 'text-slate-400 line-through decoration-emerald-500/30' : 
                isActive ? 'text-slate-800' : 
                'text-slate-300'
              }`}>
                {step.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Elegant Progress Bar */}
      <div className="w-full space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Pipeline Progress</span>
          <span className="text-[10px] font-black text-blue-600 tracking-widest">{Math.floor(progress)}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
          </div>
        </div>
      </div>

    </div>
  );
}
