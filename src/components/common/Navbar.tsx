import React, { useState } from 'react';
import { Truck, Database, ChevronRight } from 'lucide-react';
import type { Lorry, Memo } from '../../types/database';
import { isSupabaseConfigured } from '../../utils/supabase';
import { SupabaseModal } from './SupabaseModal';

interface NavbarProps {
  currentLorry: Lorry | null;
  currentMemo: Memo | null;
  onNavigateHome: () => void;
  onNavigateLorry: (lorry: Lorry) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLorry,
  currentMemo,
  onNavigateHome,
  onNavigateLorry,
}) => {
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  return (
    <>
      <header className="no-print bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand & Breadcrumbs */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onNavigateHome}
                className="flex items-center gap-2.5 text-left group hover:opacity-95 transition-opacity"
              >
                <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-500 transition-colors">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-black tracking-tight leading-none text-white">
                    LORRY MEMO
                  </h1>
                  <span className="text-2xs text-slate-400 font-medium tracking-wide">
                    Accounts Management / லாரி கணக்கு புத்தகம்
                  </span>
                </div>
              </button>

              {/* Breadcrumbs */}
              {(currentLorry || currentMemo) && (
                <nav className="hidden md:flex items-center gap-2 text-xs text-slate-400 pl-4 border-l border-slate-800">
                  <button
                    onClick={onNavigateHome}
                    className="hover:text-white transition-colors"
                  >
                    Lorries
                  </button>

                  {currentLorry && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                      <button
                        onClick={() => onNavigateLorry(currentLorry)}
                        className={`font-semibold hover:text-white transition-colors ${
                          !currentMemo ? 'text-white' : ''
                        }`}
                      >
                        {currentLorry.registration_number}
                      </button>
                    </>
                  )}

                  {currentMemo && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                      <span className="text-blue-400 font-bold">{currentMemo.memo_number}</span>
                    </>
                  )}
                </nav>
              )}
            </div>

            {/* Right: Supabase Connection Indicator & Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDbModalOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isSupabaseConfigured
                    ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300 hover:bg-emerald-900'
                    : 'bg-amber-950/60 border-amber-700 text-amber-300 hover:bg-amber-900'
                }`}
                title="Click to view database settings"
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isSupabaseConfigured ? 'Supabase Connected' : 'Local Storage Mode'}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      <SupabaseModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />
    </>
  );
};
