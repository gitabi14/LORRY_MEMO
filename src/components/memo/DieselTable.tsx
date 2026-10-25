import React from 'react';
import { Plus, Trash2, Fuel } from 'lucide-react';
import type { MemoDieselEntry } from '../../types/database';
import { formatINR } from '../../utils/currency';
import { safeNumber, toPaise, fromPaise } from '../../utils/calculations';
import { getTodayInputDate } from '../../utils/dateUtils';

interface DieselTableProps {
  entries: MemoDieselEntry[];
  onChange: (entries: MemoDieselEntry[]) => void;
}

export const DieselTable: React.FC<DieselTableProps> = ({ entries, onChange }) => {
  const handleAddRow = () => {
    const newEntry: MemoDieselEntry = {
      id: crypto.randomUUID(),
      entry_date: getTodayInputDate(),
      litres: 0,
      amount: 0,
      bill_details: '',
      row_order: entries.length + 1,
    };
    onChange([...entries, newEntry]);
  };

  const handleUpdate = <K extends keyof MemoDieselEntry>(
    id: string,
    field: K,
    value: MemoDieselEntry[K]
  ) => {
    onChange(
      entries.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const handleDelete = (id: string) => {
    const filtered = entries.filter((e) => e.id !== id);
    onChange(filtered.map((e, i) => ({ ...e, row_order: i + 1 })));
  };

  const totalLitres = Math.round(entries.reduce((s, e) => s + safeNumber(e.litres), 0) * 100) / 100;
  const totalAmount = fromPaise(entries.reduce((s, e) => s + toPaise(e.amount), 0));
  const avgRate = totalLitres > 0 ? Math.round((totalAmount / totalLitres) * 100) / 100 : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-amber-50/80 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="font-bold text-base text-amber-950 flex items-center gap-2">
            <Fuel className="w-5 h-5 text-amber-600" />
            <span>Diesel Entries</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white text-amber-800">
              டீசல் விபரம்
            </span>
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Record fuel purchases, litres, amount paid, and bill numbers
          </p>
        </div>
        <div className="text-right flex items-center gap-4">
          {avgRate && (
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Avg Rate</span>
              <span className="font-semibold text-xs text-slate-700 font-mono">₹ {avgRate}/L</span>
            </div>
          )}
          <div className="text-right">
            <span className="text-xs uppercase font-medium text-slate-500 block">Total Diesel</span>
            <span className="font-bold text-lg text-amber-800">{formatINR(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto ledger-scroll">
        <table className="w-full text-left text-xs min-w-[650px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/80 text-slate-700 uppercase font-semibold tracking-wider">
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3 w-32">Date (தேதி)</th>
              <th className="py-2.5 px-3 w-32 text-right">Litres (டீசல் லிட்டர்)</th>
              <th className="py-2.5 px-3 w-40 text-right bg-amber-100/50 text-amber-950 font-bold">
                Amount Paid (ரூ. ₹)
              </th>
              <th className="py-2.5 px-3 w-32 text-right">Rate / Litre</th>
              <th className="py-2.5 px-3">Bill Details / Bunk (பில்படி / பங்க்)</th>
              <th className="py-2.5 px-2 w-12 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                  No diesel entries added yet. Click &quot;Add Diesel Entry&quot; below.
                </td>
              </tr>
            ) : (
              entries.map((entry, index) => {
                const rowRate =
                  safeNumber(entry.litres) > 0 && safeNumber(entry.amount) > 0
                    ? Math.round((safeNumber(entry.amount) / safeNumber(entry.litres)) * 100) / 100
                    : null;

                return (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-400 font-medium">
                      {index + 1}
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="date"
                        value={entry.entry_date || ''}
                        onChange={(e) => handleUpdate(entry.id, 'entry_date', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-amber-500 bg-white"
                      />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={entry.litres === 0 ? '' : entry.litres}
                        onChange={(e) =>
                          handleUpdate(
                            entry.id,
                            'litres',
                            e.target.value === '' ? 0 : parseFloat(e.target.value)
                          )
                        }
                        placeholder="0.00"
                        className="w-full px-2 py-1 text-xs text-right font-mono border border-slate-200 rounded focus:ring-1 focus:ring-amber-500 bg-white"
                      />
                    </td>
                    <td className="py-2 px-2 text-right bg-amber-50/40">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={entry.amount === 0 ? '' : entry.amount}
                        onChange={(e) =>
                          handleUpdate(
                            entry.id,
                            'amount',
                            e.target.value === '' ? 0 : parseFloat(e.target.value)
                          )
                        }
                        placeholder="0.00"
                        className="w-full px-2 py-1 text-xs text-right font-mono font-bold text-amber-950 border border-amber-300 rounded focus:ring-1 focus:ring-amber-500 bg-white"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-500">
                      {rowRate ? `₹ ${rowRate}` : '—'}
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={entry.bill_details || ''}
                        onChange={(e) => handleUpdate(entry.id, 'bill_details', e.target.value)}
                        placeholder="e.g. Salem HP Bunk Bill #401"
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-amber-500 bg-white"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded hover:bg-rose-50"
                        title="Delete diesel entry / நீக்கு"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {/* Subtotals footer */}
          <tfoot>
            <tr className="border-t-2 border-slate-300 bg-slate-100/90 font-bold text-slate-900 text-xs">
              <td colSpan={2} className="py-2.5 px-3 uppercase tracking-wider">
                Total Diesel / மொத்த டீசல் ({entries.length} entries)
              </td>
              <td className="py-2.5 px-2 text-right font-mono text-slate-900 font-extrabold">
                {totalLitres > 0 ? `${totalLitres} L` : '0 L'}
              </td>
              <td className="py-2.5 px-2 text-right font-mono bg-amber-100 text-amber-950 font-extrabold text-sm">
                {formatINR(totalAmount)}
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                {avgRate ? `₹ ${avgRate}/L` : '—'}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer action */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <button
          type="button"
          onClick={handleAddRow}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Diesel Entry / டீசல் பதிவு சேர்க்க</span>
        </button>
        <span className="text-xs text-slate-500">
          Enter actual paid amount (includes tax/discounts)
        </span>
      </div>
    </div>
  );
};
