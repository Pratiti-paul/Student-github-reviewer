'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
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
  level: 'Ready to be Hired' | 'Needs Some Improvement' | 'Early Stage';
  strength_focus: string;
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
  user_profile?: {
    name: string;
    public_repos: number;
    followers: number;
    created_at: string;
    bio: string;
  };
  metrics?: {
    contribution_heatmap?: {
      total: number;
      streak_current: number;
      streak_longest: number;
      days: any[];
    };
    language_distribution?: any[];
    analyzed_count?: number;
  };
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PortfolioData | null>(null);
  const [searchedUsername, setSearchedUsername] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const { showToast } = useToast();

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
    showToast(`Analyzing @${cleanUsername}...`, 'info');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      console.log("API URL:", API_URL);

      const response = await axios.post(`${API_URL}/review`, {
        username: cleanUsername,
      }, {
        timeout: 60000 // 60 seconds safety
      });

      setData(response.data as PortfolioData);
    } catch (err: any) {
      console.error("Error fetching data:", err.message);
      
      if (err.code === 'ECONNABORTED') {
        setError("Analysis is taking a while. Please wait a moment and click 'Retry'—it will likely be ready now.");
      } else if (err.response?.status === 504 || err.response?.status === 502) {
        setError("AI engine timed out, but the work is likely finishing in the background. Please retry in a few seconds.");
      } else if (err.response?.status === 404) {
        setError("User not found. Try another username.");
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.detail || "Invalid request. Please check the username.");
      } else {
        const errorMsg = "Something went wrong. Our servers might be busy.";
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (searchedUsername) {
      handleSearch(searchedUsername);
    }
  };

  const handleShare = () => {
    if (!searchedUsername) return;
    const shareUrl = `${window.location.origin}/review/${searchedUsername}`;
    navigator.clipboard.writeText(shareUrl);
    showToast("Link copied to clipboard!", "success");
  };

  const handleReset = () => {
    setData(null);
    setError(null);
    setSearchedUsername(null);
    setIsLoading(false);
    setSearchInput('');
  };

  return (
    <main className="w-full pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div 
            onClick={handleReset}
            className="inline-flex items-center justify-center p-3 bg-[#EDE6DC] border border-[#D9CEBD] rounded-xl mb-2 cursor-pointer hover:scale-105 transition-transform"
          >
            <Github className="h-8 w-8 text-[#2A2116]" />
          </div>
          <h1 
            onClick={handleReset}
            className="text-4xl md:text-5xl font-bold text-[#2A2116] tracking-tight leading-[1.15] cursor-pointer"
          >
            Analyze Your GitHub Like a <span className="text-[#8B6F47]">Recruiter</span>
          </h1>
          <p className="text-lg text-[#5C4D3A] max-w-2xl mx-auto leading-relaxed font-medium">
            Get deep insights on your projects, skills, and hireability in seconds.
          </p>

          <div className="pt-4">
             <SearchBar 
              onSearch={handleSearch} 
              isLoading={isLoading} 
              value={searchInput}
              onChange={setSearchInput}
             />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-8 text-xs font-medium text-[#8B7A66] font-sans">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#8B6F47]"/> Analyzes top 10 repositories</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#8B6F47]"/> AI-powered insights</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#8B6F47]"/> Recruiter-style feedback</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#8B6F47]"/> Actionable improvements</span>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto p-8 bg-white border border-[#E2D9CC] rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 text-center space-y-4">
             <div className="flex flex-col items-center">
                <div className="p-3 bg-[#F5E8E4] rounded-full text-[#B85040] mb-4">
                   <Github className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-[#2A2116]">{error}</h3>
                
                <div className="flex items-center gap-4 mt-6">
                  <button 
                    onClick={handleReset}
                    className="text-sm font-bold text-[#8B6F47] hover:underline"
                  >
                    Try another username
                  </button>
                  {error.includes("wrong") && (
                    <button 
                      onClick={handleRetry}
                      className="px-6 py-2 bg-[#2A2116] text-[#F7F3ED] text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Retry Now
                    </button>
                  )}
                </div>
             </div>
          </div>
        )}

        {/* Landing Page Content */}
        {!data && !isLoading && !error && (
          <div className="space-y-10 pb-12 animate-in fade-in duration-500">
             <Features />
             <HowItWorks />
          </div>
        )}

        {/* Loading State */}
        {isLoading && <Loader />}

        {/* Results Dashboard */}
        {data && !isLoading && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out space-y-10">
            
            {/* Share & Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-4 border-b border-[#E2D9CC]">
               <div>
                 <h2 className="text-2xl font-bold text-[#2A2116] tracking-tight">Recruiter Report for @{searchedUsername}</h2>
                 <p className="text-[#B8A898] text-xs font-medium mt-1 italic font-sans">Personalized AI evaluation and professional signals</p>
               </div>
               <div className="flex items-center gap-3">
                 <button 
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#EDE6DC] text-[#2A2116] text-sm font-bold rounded-xl transition-all border border-[#D9CEBD] hover:bg-[#D9CEBD]"
                 >
                   New Search
                 </button>
                 <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#2A2116] text-[#F7F3ED] text-sm font-bold rounded-xl transition-all shadow-sm hover:translate-y-[-1px] active:translate-y-[0px]"
                 >
                   <Share2 className="w-3.5 h-3.5" />
                   Share Review Link
                 </button>
               </div>
            </div>

            <KPIcards 
              assessment={data.overall_portfolio_assessment?.level}
              strengthFocus={data.overall_portfolio_assessment?.strength_focus}
              hireability={data.overall_portfolio_assessment?.hireability}
              summary={data.overall_portfolio_assessment?.summary}
              totalProjects={data.user_profile?.public_repos || data.projects?.length || 0}
              topProjectsCount={data.top_projects?.length || 0}
              analyzedCount={data.metrics?.analyzed_count}
            />

            {/* Visual Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
