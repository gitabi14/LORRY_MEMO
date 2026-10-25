import React, { useState } from 'react';
import { Database, X, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured } from '../../utils/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const envSnippet = `VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-public-key`;

  const handleCopy = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Supabase Database Connection</h3>
              <p className="text-xs text-slate-300">
                PostgreSQL persistence &amp; Vercel deployment configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed">
          {/* Current Status Pill */}
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 ${
              isSupabaseConfigured
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <ShieldCheck className="w-6 h-6 shrink-0" />
            <div>
              <span className="font-bold text-sm block">
                {isSupabaseConfigured
                  ? 'Connected to Supabase PostgreSQL!'
                  : 'Currently Operating in Local Offline Mode'}
              </span>
              <span className="text-xs">
                {isSupabaseConfigured
                  ? 'All lorry folders and memo records are synchronizing in real-time to your cloud PostgreSQL database.'
                  : 'The application is running smoothly with persistent local browser storage. To connect to Supabase, follow the 3 quick steps below.'}
              </span>
            </div>
          </div>

          {/* Quick Setup Steps */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              How to Connect Your Supabase PostgreSQL Project:
            </h4>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <strong className="text-slate-900 font-bold block">1. Create a Supabase project</strong>
              <p className="text-slate-600">
                Visit <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium inline-flex items-center gap-1">supabase.com <ExternalLink className="w-3 h-3" /></a> and create a new free project.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <strong className="text-slate-900 font-bold block">2. Execute Database Schema</strong>
              <p className="text-slate-600">
                Go to the Supabase <strong>SQL Editor</strong> and paste the contents of file <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">supabase/migrations/20261025_init_lorry_memo.sql</code> to create tables, indexes, triggers, and RLS policies.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-slate-900 font-bold">3. Add Environment Variables to .env / Vercel</strong>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-2 bg-slate-900 text-slate-100 rounded text-2xs font-mono overflow-x-auto">
                {envSnippet}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close / மூடு
          </button>
        </div>
      </div>
    </div>
  );
};
