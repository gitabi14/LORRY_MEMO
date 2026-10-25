import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  Search,
  ArrowUpDown,
  Truck,
} from 'lucide-react';
import type { Memo, Lorry } from '../../types/database';
import { MemoCard } from './MemoCard';
import { formatINR } from '../../utils/currency';
import { calculateMemoTotals } from '../../utils/calculations';
import { ConfirmModal } from '../common/ConfirmModal';

interface MemoListProps {
  lorry: Lorry;
  memos: Memo[];
  onBack: () => void;
  onCreateMemo: () => void;
  onViewMemo: (memo: Memo) => void;
  onEditMemo: (memo: Memo) => void;
  onPrintMemo: (memo: Memo) => void;
  onDeleteMemo: (memoId: string) => void;
}

export const MemoList: React.FC<MemoListProps> = ({
  lorry,
  memos,
  onBack,
  onCreateMemo,
  onViewMemo,
  onEditMemo,
  onPrintMemo,
  onDeleteMemo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [memoToDelete, setMemoToDelete] = useState<string | null>(null);

  // Overall lorry stats
  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalLitres = 0;

    for (const m of memos) {
      const calc = calculateMemoTotals(
        m,
        m.loads || [],
        m.diesel_entries || [],
        m.other_expenses || [],
        m.rto_expenses || []
      );
      totalIncome += calc.totalIncome;
      totalExpenses += calc.totalExpenses;
      totalLitres += calc.totalDieselLitres;
    }

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      totalLitres,
      memoCount: memos.length,
    };
  }, [memos]);

  // Filter and sort memos
  const filteredMemos = useMemo(() => {
    return memos
      .filter((m) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const numMatch = m.memo_number.toLowerCase().includes(q);
        const driverMatch = m.driver_name_1?.toLowerCase().includes(q) || false;
        const routeMatch =
          m.loads?.some((l) => l.route.toLowerCase().includes(q)) || false;
        return numMatch || driverMatch || routeMatch;
      })
      .sort((a, b) => {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [memos, searchQuery, sortOrder]);

  const confirmDelete = () => {
    if (memoToDelete) {
      onDeleteMemo(memoToDelete);
      setMemoToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Lorry Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Back to all lorries / அனைத்து லாரிகள்"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Lorry Folder
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500">{memos.length} Trips Saved</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-wide mt-0.5">
                {lorry.registration_number}
              </h2>
              {lorry.nickname && (
                <p className="text-xs font-medium text-slate-600">{lorry.nickname}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCreateMemo}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Memo / புதிய அட்டவணை</span>
            </button>
          </div>
        </div>

        {/* Lorry Lifetime Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 block font-medium">Total Trips</span>
            <span className="text-lg font-bold text-slate-900">{stats.memoCount} Memos</span>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
            <span className="text-xs text-emerald-800 block font-medium">Total Revenue (வரவு)</span>
            <span className="text-lg font-bold text-emerald-900 font-mono">
              {formatINR(stats.totalIncome, false)}
            </span>
          </div>

          <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200">
            <span className="text-xs text-rose-800 block font-medium">Total Expenses (செலவு)</span>
            <span className="text-lg font-bold text-rose-900 font-mono">
              {formatINR(stats.totalExpenses, false)}
            </span>
          </div>

          <div
            className={`p-3 rounded-lg border ${
              stats.netBalance >= 0
                ? 'bg-emerald-100/60 border-emerald-300 text-emerald-950'
                : 'bg-rose-100/60 border-rose-300 text-rose-950'
            }`}
          >
            <span className="text-xs block font-bold opacity-80">Net Balance (லாபம்/மீதி)</span>
            <span className="text-lg font-black font-mono">
              {formatINR(stats.netBalance, false)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memo, driver, route..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Sort by Saved Date:</span>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="px-2.5 py-1 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              {sortOrder === 'newest' ? 'Newest First (புதியது)' : 'Oldest First (பழையது)'}
            </button>
          </div>

          <span className="text-slate-400 font-mono">
            {filteredMemos.length} {filteredMemos.length === 1 ? 'memo' : 'memos'}
          </span>
        </div>
      </div>

      {/* Memo Cards Grid */}
      {filteredMemos.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full inline-block">
            <Truck className="w-8 h-8" />
          </div>
          <div className="max-w-sm mx-auto">
            <h3 className="text-base font-bold text-slate-900">No Memos Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery
                ? 'No memos matched your search query. Try clearing the filter.'
                : 'There are no memos recorded yet for this lorry. Click below to create your first trip memo.'}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={onCreateMemo}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Memo / முதல் அட்டவணை சேர்க்க</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMemos.map((memo) => (
            <MemoCard
              key={memo.id}
              memo={memo}
              lorry={lorry}
              onView={onViewMemo}
              onEdit={onEditMemo}
              onPrint={onPrintMemo}
              onDelete={(id) => setMemoToDelete(id)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(memoToDelete)}
        title="Delete Memo? / அட்டவணையை நீக்கவா?"
        message="Are you sure you want to permanently delete this memo and its entire ledger breakdown? This action cannot be undone."
        confirmLabel="Delete Memo / நிரந்தரமாக நீக்கு"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setMemoToDelete(null)}
      />
    </div>
  );
};
