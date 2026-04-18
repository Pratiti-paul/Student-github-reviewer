'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { Github, ArrowLeft, Share2, Check } from 'lucide-react';
import KPIcards from '@/components/KPIcards';
import Insights from '@/components/Insights';
import Projects from '@/components/Projects';
import Loader from '@/components/Loader';
import ContributionHeatmap from '@/components/ContributionHeatmap';
import LanguageChart from '@/components/LanguageChart';

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

export default function SharedReviewPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PortfolioData | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (username) {
      fetchReview();
    }
  }, [username]);

  const fetchReview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      console.log("API URL:", API_URL);

      const response = await axios.get(`${API_URL}/review/${username}`, {
        timeout: 60000 // 60 seconds safety for Render cold starts
      });
      setData(response.data as PortfolioData);
      showToast("Report loaded successfully!", "success");
    } catch (err: any) {
      console.error("Error fetching shared review:", err.message);
      const detail = err.response?.data?.detail;
      const errorMsg = detail || "Failed to load the review.";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Review link copied!", "success");
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
              className="flex items-center gap-2 px-6 py-2.5 bg-[#2A2116] text-[#F7F3ED] text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95 hover:translate-y-[-1px]"
            >
              <Share2 className="w-4 h-4" />
              Share This Review
            </button>
          </div>
        </div>

        {/* Results Dashboard */}
        {data && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out space-y-10">
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
