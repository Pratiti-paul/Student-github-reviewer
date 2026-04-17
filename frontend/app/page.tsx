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

interface PortfolioData {
  projects?: ProjectData[];
  top_projects?: string[];
  strengths?: string[];
  weaknesses?: string[];
  missing_skills?: string[];
  hireability?: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PortfolioData | null>(null);

  const handleSearch = async (username: string) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/review', {
        username: username,
      });

      // Based on our FastAPI format, the nested structured JSON is located in mentor_feedback.feedback
      // depending on whether we parsed it as a python dict under feedback
      let feedback = {};
      if (response.data && response.data.mentor_feedback) {
         if (response.data.mentor_feedback.feedback) {
             feedback = response.data.mentor_feedback.feedback;
         } else {
             feedback = response.data.mentor_feedback;
         }
      } else {
         feedback = response.data;
      }

      setData(feedback as PortfolioData);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(
        err.response?.data?.detail || 
        'Failed to fetch portfolio data. Make sure the backend server and LangGraph are running.'
      );
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

          {!data && !isLoading && (
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
            <div className="max-w-xl mx-auto p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center animate-in fade-in">
              {error}
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
              hireability={data.hireability || 'Unknown'} 
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
