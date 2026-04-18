'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { Github, ArrowLeft, Share2, Check } from 'lucide-react';
import KPIcards from '../../../components/KPIcards';
import Insights from '../../../components/Insights';
import Projects from '../../../components/Projects';
import Loader from '../../../components/Loader';
import ContributionHeatmap from '../../../components/ContributionHeatmap';
import LanguageChart from '../../../components/LanguageChart';

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
      <main className="w-full min-h-screen bg-[#F7F3ED] pt-12">
        <Loader />
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full min-h-screen bg-[#F7F3ED] pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto p-12 bg-white border border-[#E2D9CC] rounded-2xl shadow-sm text-center space-y-6 animate-fade-in-up">
           <div className="flex flex-col items-center">
              <div className="p-4 bg-[#F5E8E4] rounded-2xl text-[#B85040] mb-4">
                 <Github className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-[#2A2116]">Review Not Found</h3>
              <p className="text-[#8B7A66] font-medium mt-2">{error}</p>
           </div>
           <button 
             onClick={() => router.push('/')}
             className="flex items-center justify-center gap-2 mx-auto px-8 py-3 bg-[#2A2116] text-[#F7F3ED] font-bold rounded-xl hover:bg-[#3D3020] transition-all"
           >
             <ArrowLeft className="w-5 h-5" /> Back to Dashboard
           </button>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen bg-[#F7F3ED] pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#E2D9CC]">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-[#2A2116] tracking-tight">
              Recruiter Report for <span className="text-[#8B6F47]">@{username}</span>
            </h1>
            <p className="text-[#B8A898] text-xs font-medium font-sans italic flex items-center justify-center md:justify-start gap-2">
               <Check className="w-4 h-4 text-[#4A7C40]" /> This is a persistent, shareable portfolio analysis.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="px-6 py-2.5 bg-[#EDE6DC] border border-[#D9CEBD] text-[#2A2116] text-sm font-bold rounded-xl hover:bg-[#D9CEBD] transition-all"
            >
              Analyze New Profile
            </button>
            <button 
              onClick={handleShare}
              className={`flex items-center gap-2 px-6 py-2.5 ${copied ? 'bg-[#4A7C40]' : 'bg-[#2A2116]'} text-[#F7F3ED] text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Link Copied!' : 'Share This Review'}
            </button>
          </div>
        </div>

        {/* Results Dashboard */}
        {data && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out space-y-10">
            <KPIcards 
              assessment={data.overall_portfolio_assessment?.level}
              hireability={data.overall_portfolio_assessment?.hireability}
              summary={data.overall_portfolio_assessment?.summary}
              totalProjects={data.projects?.length || 0}
              topProjectsCount={data.top_projects?.length || 0}
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
