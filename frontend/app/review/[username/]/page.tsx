'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { Github, ArrowLeft, Share2, Check } from 'lucide-react';
import KPIcards from '../../../components/KPIcards';
import Insights from '../../../components/Insights';
import Projects from '../../../components/Projects';
import Loader from '../../../components/Loader';

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

export default function SharedReviewPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PortfolioData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (username) {
      fetchReview();
    }
  }, [username]);

  const fetchReview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/review/${username}`);
      setData(response.data as PortfolioData);
    } catch (err: any) {
      console.error("Error fetching shared review:", err);
      const detail = err.response?.data?.detail;
      setError(detail || "Failed to load the review. The user may not exist or the link is invalid.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <main className="w-full pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
          <Loader />
          <p className="mt-8 text-slate-400 font-medium animate-pulse italic">Retrieving persistent analysis for {username}...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto mt-20 p-12 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-red-50 text-center space-y-8 animate-fade-in-up">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto text-red-500">
            <Github className="w-10 h-10" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Review Not Found</h1>
            <p className="text-slate-500 font-medium leading-relaxed">{error}</p>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Search
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-24">
        
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Review for <span className="text-blue-600">@{username}</span>
            </h1>
            <p className="text-slate-400 font-medium text-sm flex items-center justify-center md:justify-start gap-2">
               <Check className="w-4 h-4 text-emerald-500" /> Shareable report link is active
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-6 py-3 text-slate-600 font-bold text-sm hover:text-slate-900 transition-colors"
            >
              Search New
            </button>
            <button 
              onClick={handleShare}
              className={`flex items-center gap-2 px-6 py-3 ${copied ? 'bg-emerald-500 shadow-emerald-100' : 'bg-blue-600 shadow-blue-100'} text-white font-bold rounded-2xl transition-all shadow-lg hover:scale-105 active:scale-95`}
            >
              {copied ? <><Check className="w-4 h-4" /> Link Copied</> : <><Share2 className="w-4 h-4" /> Share Review</>}
            </button>
          </div>
        </div>

        {/* Results Dashboard */}
        {data && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out space-y-24">
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
              top_projects={data.top_projects || []}
            />
          </div>
        )}
      </div>
    </main>
  );
}
