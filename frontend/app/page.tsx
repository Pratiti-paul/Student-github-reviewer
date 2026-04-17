'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Github, Check, Share2 } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import KPIcards from '../components/KPIcards';
import Insights from '../components/Insights';
import Projects from '../components/Projects';
import Loader from '../components/Loader';
import ContributionHeatmap from '../components/ContributionHeatmap';
import LanguageChart from '../components/LanguageChart';

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
  metrics?: {
    contribution_heatmap?: {
      total: number;
      streak_current: number;
      streak_longest: number;
      days: any[];
    };
    language_distribution?: any[];
  };
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PortfolioData | null>(null);
  const [searchedUsername, setSearchedUsername] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSearch = async (username: string) => {
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError("Please enter a GitHub username to begin the analysis.");
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null);
    setSearchedUsername(cleanUsername);

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

  const handleShare = () => {
    if (!searchedUsername) return;
    const shareUrl = `${window.location.origin}/review/${searchedUsername}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="w-full pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-24">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 border border-blue-100 rounded-2xl mb-2">
            <Github className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            Analyze Your GitHub Like a <span className="text-blue-600">Recruiter</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
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
                 <Check className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Landing Page Content */}
        {!data && !isLoading && !error && (
          <div className="space-y-24 pb-12 animate-in fade-in duration-500">
             <Features />
             <HowItWorks />
          </div>
        )}

        {/* Loading State */}
        {isLoading && <Loader />}

        {/* Results Dashboard */}
        {data && !isLoading && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out space-y-20">
            
            {/* Share & Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-4 border-b border-slate-100">
               <div>
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight">Recruiter Report for @{searchedUsername}</h2>
                 <p className="text-slate-400 text-sm font-medium mt-1 italic">Personalized AI evaluation and professional signals</p>
               </div>
               <div className="flex items-center gap-4">
                 <button 
                  onClick={handleShare}
                  className={`flex items-center gap-2 px-6 py-3 ${copied ? 'bg-emerald-500 shadow-emerald-100' : 'bg-blue-600 shadow-blue-100/50'} text-white font-bold rounded-2xl transition-all shadow-lg hover:scale-105 active:scale-95`}
                 >
                   {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                   {copied ? 'Link Copied!' : 'Share Review Link'}
                 </button>
               </div>
            </div>

            <KPIcards 
              assessment={data.overall_portfolio_assessment?.level}
              hireability={data.overall_portfolio_assessment?.hireability}
              summary={data.overall_portfolio_assessment?.summary}
              totalProjects={data.projects?.length || 0}
              topProjectsCount={data.top_projects?.length || 0}
            />

            {/* Visual Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <ContributionHeatmap 
                  total={data.metrics?.contribution_heatmap?.total || 0}
                  streakCurrent={data.metrics?.contribution_heatmap?.streak_current || 0}
                  streakLongest={data.metrics?.contribution_heatmap?.streak_longest || 0}
                  days={data.metrics?.contribution_heatmap?.days || []}
                />
              </div>
              <div className="lg:col-span-1">
                <LanguageChart data={data.metrics?.language_distribution || []} />
              </div>
            </div>
            
            <Projects projects={data.projects || []} />
            
            <Insights 
              strengths={data.strengths || []}
              weaknesses={data.weaknesses || []}
              missing_skills={data.missing_skills || []}
              top_projects={data.top_projects || []}
            />
          </div>
        )}
      </div>
    </main>
  );
}
