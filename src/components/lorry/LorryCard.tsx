import React from 'react';
import { Folder, ArrowRight, Trash2, Calendar } from 'lucide-react';
import type { Lorry, Memo } from '../../types/database';
import { formatISTDate } from '../../utils/dateUtils';
import { formatINRCompact } from '../../utils/currency';
import { calculateMemoTotals } from '../../utils/calculations';

interface LorryCardProps {
  lorry: Lorry;
  memos: Memo[];
  onOpen: (lorry: Lorry) => void;
  onDelete: (lorry: Lorry, memoCount: number) => void;
}

export const LorryCard: React.FC<LorryCardProps> = ({
  lorry,
  memos,
  onOpen,
  onDelete,
}) => {
  // Aggregate stats
  let totalRevenue = 0;
  for (const m of memos) {
    const calc = calculateMemoTotals(
      m,
      m.loads || [],
      m.diesel_entries || [],
      m.other_expenses || [],
      m.rto_expenses || []
    );
    totalRevenue += calc.totalIncome;
  }

  const latestMemo = memos.length > 0 ? memos[0] : null;

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200 p-6 flex flex-col justify-between group relative overflow-hidden">
      {/* Top Folder Tab Graphic Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 via-slate-50 to-transparent rounded-bl-full pointer-events-none" />

      <div>
        {/* Header: Folder Icon & Reg No */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xs font-extrabold uppercase tracking-widest text-blue-600 block">
                LORRY FOLDER
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-wide">
                {lorry.registration_number}
              </h3>
              {lorry.nickname && (
                <p className="text-xs font-semibold text-slate-500">{lorry.nickname}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(lorry, memos.length);
            }}
            className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors"
            title="Delete lorry folder / கோப்பை நீக்கு"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-slate-100 mb-4 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-lg">
            <span className="text-slate-400 block text-2xs font-medium">Recorded Trips</span>
            <span className="font-extrabold text-slate-800 text-sm">
              {memos.length} {memos.length === 1 ? 'Memo' : 'Memos'}
            </span>
          </div>

          <div className="bg-emerald-50/70 p-2.5 rounded-lg">
            <span className="text-emerald-700 block text-2xs font-medium">Total Freight</span>
            <span className="font-black text-emerald-900 font-mono text-sm">
              {formatINRCompact(totalRevenue)}
            </span>
          </div>
        </div>

        {/* Latest Activity */}
        <div className="text-xs text-slate-500 mb-4">
          {latestMemo ? (
            <div className="flex items-center gap-1.5 text-2xs text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Latest trip: <strong className="text-slate-700">{formatISTDate(latestMemo.trip_date)}</strong>
              </span>
            </div>
          ) : (
            <span className="text-2xs text-slate-400 italic">No trips recorded yet</span>
          )}
        </div>
      </div>

      {/* Open Button */}
      <button
        type="button"
        onClick={() => onOpen(lorry)}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-colors shadow-xs group-hover:shadow-md"
      >
        <span>Open Lorry Folder / கோப்பை திற</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};
