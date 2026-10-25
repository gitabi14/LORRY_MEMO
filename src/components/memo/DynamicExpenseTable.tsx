import React from 'react';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import type { DynamicExpenseRow } from '../../types/database';
import { formatINR } from '../../utils/currency';
import { toPaise, fromPaise } from '../../utils/calculations';

interface DynamicExpenseTableProps {
  title: string;
  tamilTitle?: string;
  totalLabel: string;
  tamilTotalLabel?: string;
  rows: DynamicExpenseRow[];
  onChange: (rows: DynamicExpenseRow[]) => void;
  placeholderItem?: string;
  quickSuggestions?: string[];
  themeColor?: 'amber' | 'blue' | 'indigo' | 'emerald';
}

export const DynamicExpenseTable: React.FC<DynamicExpenseTableProps> = ({
  title,
  tamilTitle,
  totalLabel,
  tamilTotalLabel,
  rows,
  onChange,
  placeholderItem = 'Enter expense item / செலவு விபரம்',
  quickSuggestions = [],
  themeColor = 'indigo',
}) => {
  // Calculate total safely in paise
  const totalAmount = fromPaise(
    rows.reduce((sum, r) => sum + toPaise(r.amount), 0)
  );

  const handleAddRow = (suggestedName?: string) => {
    const newRow: DynamicExpenseRow = {
      id: crypto.randomUUID(),
      item_name: suggestedName || '',
      amount: 0,
      row_order: rows.length + 1,
    };
    onChange([...rows, newRow]);
  };

  const handleUpdateItem = (id: string, itemName: string) => {
    onChange(
      rows.map((r) => (r.id === id ? { ...r, item_name: itemName } : r))
    );
  };

  const handleUpdateAmount = (id: string, amountStr: string) => {
    const val = amountStr === '' ? 0 : parseFloat(amountStr);
    onChange(
      rows.map((r) => (r.id === id ? { ...r, amount: isNaN(val) ? 0 : val } : r))
    );
  };

  const handleDeleteRow = (id: string) => {
    const filtered = rows.filter((r) => r.id !== id);
    // Re-index row_order
    const reindexed = filtered.map((r, i) => ({ ...r, row_order: i + 1 }));
    onChange(reindexed);
  };

  const headerColors = {
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  }[themeColor];

  const totalRowColors = {
    indigo: 'bg-indigo-100/70 border-indigo-200 text-indigo-950',
    blue: 'bg-blue-100/70 border-blue-200 text-blue-950',
    amber: 'bg-amber-100/70 border-amber-200 text-amber-950',
    emerald: 'bg-emerald-100/70 border-emerald-200 text-emerald-950',
  }[themeColor];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header Section */}
      <div className={`px-4 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${headerColors}`}>
        <div>
          <h4 className="font-bold text-base flex items-center gap-2">
            <span>{title}</span>
            {tamilTitle && <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/70">{tamilTitle}</span>}
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Dynamic expenses with instant total calculation / தானியங்கி கூடுதல் தொகை
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase font-medium text-slate-500 block">Total</span>
          <span className="font-bold text-lg text-slate-900">{formatINR(totalAmount)}</span>
        </div>
      </div>

      {/* Quick Suggestions Chips */}
      {quickSuggestions.length > 0 && (
        <div className="px-4 py-2 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
          <span className="flex items-center gap-1 text-slate-500 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Add:
          </span>
          {quickSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleAddRow(suggestion)}
              className="px-2 py-0.5 bg-white border border-slate-300 rounded-md hover:bg-slate-100 hover:border-slate-400 text-slate-700 transition-colors text-xs"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto ledger-scroll">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-700 text-xs uppercase tracking-wider font-semibold">
              <th className="py-2.5 px-4 w-12 text-center">#</th>
              <th className="py-2.5 px-4">
                Item / Expense Description <span className="font-normal text-slate-500">(செலவு விபரம்)</span>
              </th>
              <th className="py-2.5 px-4 w-48 text-right">
                Amount ₹ <span className="font-normal text-slate-500">(தொகை)</span>
              </th>
              <th className="py-2.5 px-3 w-16 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                  No expense rows added yet. Click &quot;Add Row&quot; below to add an expense.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-2 px-4 text-center text-xs font-medium text-slate-400">
                    {index + 1}
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={row.item_name}
                      onChange={(e) => handleUpdateItem(row.id, e.target.value)}
                      placeholder={placeholderItem}
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    />
                  </td>
                  <td className="py-2 px-4 text-right">
                    <div className="relative inline-flex items-center w-full">
                      <span className="absolute left-2.5 text-slate-400 text-xs">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.amount === 0 ? '' : row.amount}
                        onChange={(e) => handleUpdateAmount(row.id, e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-6 pr-3 py-1.5 text-sm text-right font-medium font-mono border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      />
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(row.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-md hover:bg-rose-50"
                      title="Delete row / நீக்கு"
                      aria-label="Delete row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {/* Table Totals Row */}
          <tfoot>
            <tr className={`border-t-2 font-bold ${totalRowColors}`}>
              <td colSpan={2} className="py-3 px-4 uppercase text-xs tracking-wider">
                <div className="flex items-center gap-2">
                  <span>{totalLabel}</span>
                  {tamilTotalLabel && (
                    <span className="text-slate-700 font-medium">({tamilTotalLabel})</span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-right font-mono text-base">
                {formatINR(totalAmount)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Bottom Action Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <button
          type="button"
          onClick={() => handleAddRow()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Row / புதிய வரிசை சேர்க்க</span>
        </button>
        <span className="text-xs text-slate-500">
          {rows.length} {rows.length === 1 ? 'row' : 'rows'}
        </span>
      </div>
    </div>
  );
};
