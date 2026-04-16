'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Github } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import KPIcards from '../components/KPIcards';
import Skills from '../components/Skills';
import Insights from '../components/Insights';
import Loader from '../components/Loader';

interface PortfolioData {
  score?: number;
  level?: string;
  skills?: string[];
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  missing_skills?: string[];
  activity_insights?: string[];
  project_insights?: string[];
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
      const response = await axios.post('http://127.0.0.1:8000/review', {
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
    <main className="min-h-screen pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-4">
            <Github className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            GitHub Portfolio AI Reviewer
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Analyze your GitHub profile with AI to discover your developer level, strengths, and hireability.
          </p>
        </div>

        {/* Search */}
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {/* Error State */}
        {error && (
            <div className="max-w-xl mx-auto p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center">
              {error}
            </div>
        )}

        {/* Loading State */}
        {isLoading && <Loader />}

        {/* Results Dashboard */}
        {data && !isLoading && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            <KPIcards 
              score={data.score || 0} 
              level={data.level || 'Unknown'} 
              hireability={data.hireability || 'Unknown'} 
            />
            
            <Skills skills={data.skills || []} />
            
            <Insights 
              strengths={data.strengths || []}
              weaknesses={data.weaknesses || []}
              suggestions={data.suggestions || []}
              missing_skills={data.missing_skills || []}
              activity_insights={data.activity_insights || []}
              project_insights={data.project_insights || []}
            />
          </div>
        )}

      </div>
    </main>
  );
}
