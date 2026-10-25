import React from 'react';
import {
  FileText,
  Calendar,
  ArrowRight,
  Printer,
  Edit2,
  Trash2,
} from 'lucide-react';
import type { Memo, Lorry } from '../../types/database';
import { formatINR } from '../../utils/currency';
import { formatISTDate, formatISTDateTime } from '../../utils/dateUtils';
import { calculateMemoTotals } from '../../utils/calculations';

interface MemoCardProps {
  memo: Memo;
  lorry: Lorry;
  onView: (memo: Memo) => void;
  onEdit: (memo: Memo) => void;
  onPrint: (memo: Memo) => void;
  onDelete: (memoId: string) => void;
}

export const MemoCard: React.FC<MemoCardProps> = ({
  memo,
  lorry,
  onView,
  onEdit,
  onPrint,
  onDelete,
}) => {
  const calc = calculateMemoTotals(
    memo,
    memo.loads || [],
    memo.diesel_entries || [],
    memo.other_expenses || [],
    memo.rto_expenses || []
  );

  const isProfit = calc.netBalance >= 0;

  // Extract routes if any
  const routeSummary =
    memo.loads && memo.loads.length > 0
      ? memo.loads.map((l) => l.route).filter(Boolean).join(' • ')
      : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all p-5 flex flex-col justify-between group">
      <div>
        {/* Top Header: Memo Number, Trip Date & Balance Pill */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                  {memo.memo_number}
                </h4>
                <span className="text-2xs font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                  {lorry.registration_number}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Trip: {formatISTDate(memo.trip_date)}</span>
              </div>
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-tight ${
              isProfit
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {formatINR(calc.netBalance)}
          </div>
        </div>

        {/* Route summary if available */}
        {routeSummary && (
          <div className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-md mb-3 line-clamp-1 border border-slate-100">
            <span className="font-medium text-slate-400 mr-1">Route:</span> {routeSummary}
          </div>
        )}

        {/* Financial Highlights */}
        <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-100 text-xs mb-3">
          <div>
            <span className="text-slate-400 block">Total Income (வரவு):</span>
            <span className="font-bold text-emerald-700 font-mono text-sm">
              {formatINR(calc.totalIncome)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block">Total Expenses (செலவு):</span>
            <span className="font-bold text-rose-700 font-mono text-sm">
              {formatINR(calc.totalExpenses)}
            </span>
          </div>
        </div>

        {/* Prominent Timestamps in IST */}
        <div className="space-y-1 text-2xs text-slate-500 mb-4 bg-slate-50/50 p-2 rounded border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Saved (பதிவு செய்தது):</span>
            <span className="font-medium text-slate-700 font-mono">
              {formatISTDateTime(memo.created_at)}
            </span>
          </div>
          {memo.updated_at && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Last Modified (மாற்றம்):</span>
              <span className="font-medium text-slate-700 font-mono">
                {formatISTDateTime(memo.updated_at)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPrint(memo)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            title="Print / அச்சிடுக"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(memo)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit / திருத்து"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(memo.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete / நீக்கு"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onView(memo)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <span>Open Memo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
