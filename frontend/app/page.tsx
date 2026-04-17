'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Github, Check } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import KPIcards from '../components/KPIcards';
import Insights from '../components/Insights';
import Projects, { ProjectData } from '../components/Projects';
import Loader from '../components/Loader';

interface TopProjectData {
  name: string;
  reasoning: string;
}

interface OverallPortfolioAssessment {
  level: 'Strong' | 'Good' | 'Average' | 'Needs Improvement';
  hireability: 'Hireable' | 'Borderline' | 'Not Ready';
  summary: string;
}

interface PortfolioData {
  projects?: any[]; 
  top_projects?: TopProjectData[];
  strengths?: string[];
  weaknesses?: string[];
  missing_skills?: string[];
  overall_portfolio_assessment?: OverallPortfolioAssessment;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PortfolioData | null>(null);

  const handleSearch = async (username: string) => {
    // 1. Validation & Reset
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError("Please enter a GitHub username to begin the analysis.");
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/review', {
        username: cleanUsername,
      });

      setData(response.data as PortfolioData);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      const detail = err.response?.data?.detail;
      
      if (err.response?.status === 404) {
        setError(`GitHub user "${cleanUsername}" not found.`);
      } else {
        setError(detail || "Something went wrong while fetching data. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 border border-blue-100 rounded-2xl mb-2">
            <Github className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            Analyze Your GitHub Like a <span className="text-blue-600">Recruiter</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Get deep insights on your projects, skills, and hireability in seconds.
          </p>

          <div className="pt-4">
             <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {!data && !isLoading && !error && (
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-8 text-sm font-medium text-slate-600">
              <span className="flex items-center gap-1.5"><Check className="w-5 h-5 text-green-500"/> Analyzes top 10 repositories</span>
              <span className="flex items-center gap-1.5"><Check className="w-5 h-5 text-green-500"/> AI-powered insights</span>
              <span className="flex items-center gap-1.5"><Check className="w-5 h-5 text-green-500"/> Recruiter-style feedback</span>
              <span className="flex items-center gap-1.5"><Check className="w-5 h-5 text-green-500"/> Actionable improvements</span>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
            <div className="max-w-2xl mx-auto p-8 bg-white border-2 border-red-100 rounded-3xl shadow-[0_8px_30px_rgb(220,38,38,0.05)] animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-red-50 rounded-full text-red-600">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                   </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">{error}</h3>
                  {error.includes("not found") && (
                    <div className="text-left bg-slate-50 border border-slate-100 p-6 rounded-2xl mt-4 space-y-3">
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Please double-check:</p>
                      <ul className="space-y-2 text-slate-600 text-sm font-medium">
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div> Spelling and capitalization</li>
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div> Profile existence on GitHub</li>
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div> No leading or trailing spaces</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
        )}

        {/* Landing Page Content (Hides when searching or viewing results) */}
        {!data && !isLoading && (
          <div className="space-y-24 pb-12 animate-in fade-in duration-500">


             <Features />
             <HowItWorks />
          </div>
        )}

        {/* Loading State */}
        {isLoading && <Loader />}

        {/* Results Dashboard */}
        {data && !isLoading && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            <KPIcards 
              assessment={data.overall_portfolio_assessment?.level}
              hireability={data.overall_portfolio_assessment?.hireability}
              summary={data.overall_portfolio_assessment?.summary}
              totalProjects={data.projects?.length || 0}
              topProjectsCount={data.top_projects?.length || 0}
            />
            
            <Projects projects={data.projects || []} />
            
            <Insights 
              strengths={data.strengths || []}
              weaknesses={data.weaknesses || []}
              missing_skills={data.missing_skills || []}
              red_flags={data.red_flags || []}
              top_projects={data.top_projects || []}
            />
          </div>
        )}

      </div>
    </main>
  );
}
