'use client';

import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Toast() {
  const { toast, hideToast } = useToast();

  if (!toast) return null;

  const { message, type, isVisible } = toast;

  const styles = {
    success: 'border-[#C6D9A0] bg-white text-[#4A7C40]',
    error: 'border-[#E2BCB1] bg-white text-[#B85040]',
    info: 'border-[#D9CEBD] bg-white text-[#2A2116]',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-[#4A7C40]" />,
    error: <AlertCircle className="w-5 h-5 text-[#B85040]" />,
    info: <Info className="w-5 h-5 text-[#8B6F47]" />,
  };

  return (
    <div 
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-xl transition-all duration-500 ease-out transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      } ${styles[type]}`}
    >
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <p className="text-sm font-bold tracking-tight leading-tight">
        {message}
      </p>
      <button 
        onClick={hideToast}
        className="ml-2 p-1 hover:bg-[#EDE6DC] rounded-lg transition-colors opacity-60 hover:opacity-100"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
