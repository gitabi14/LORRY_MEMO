import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { MemoLoad } from '../../types/database';
import { formatINR } from '../../utils/currency';
import { safeNumber, toPaise, fromPaise } from '../../utils/calculations';
import { getTodayInputDate } from '../../utils/dateUtils';

interface LoadTableProps {
  loads: MemoLoad[];
  onChange: (loads: MemoLoad[]) => void;
}

export const LoadTable: React.FC<LoadTableProps> = ({ loads, onChange }) => {
  const handleAddRow = () => {
    const newLoad: MemoLoad = {
      id: crypto.randomUUID(),
      load_date: getTodayInputDate(),
      route: '',
      load_description: '',
      weight_tonnes: null,
      freight_amount: 0,
      commission: 0,
      loading_charges: 0,
      unloading_charges: 0,
      other_charges: 0,
      row_order: loads.length + 1,
    };
    onChange([...loads, newLoad]);
  };

  const handleUpdate = <K extends keyof MemoLoad>(id: string, field: K, value: MemoLoad[K]) => {
    onChange(
      loads.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const handleDelete = (id: string) => {
    const filtered = loads.filter((l) => l.id !== id);
    onChange(filtered.map((l, i) => ({ ...l, row_order: i + 1 })));
  };

  // Subtotals
  const totalFreight = fromPaise(loads.reduce((s, l) => s + toPaise(l.freight_amount), 0));
  const totalWeight = Math.round(loads.reduce((s, l) => s + safeNumber(l.weight_tonnes), 0) * 1000) / 1000;
  const totalCommission = fromPaise(loads.reduce((s, l) => s + toPaise(l.commission), 0));
  const totalLoading = fromPaise(loads.reduce((s, l) => s + toPaise(l.loading_charges), 0));
  const totalUnloading = fromPaise(loads.reduce((s, l) => s + toPaise(l.unloading_charges), 0));
  const totalOther = fromPaise(loads.reduce((s, l) => s + toPaise(l.other_charges), 0));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-emerald-50/80 border-b border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="font-bold text-base text-emerald-950 flex items-center gap-2">
            <span>Income & Load Details</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white text-emerald-800">
              வரவு &amp; லோடு விபரம்
            </span>
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Freight charges, weight, route, commission, and loading expenses
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase font-medium text-slate-500 block">Total Freight Income</span>
          <span className="font-bold text-lg text-emerald-700">{formatINR(totalFreight)}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto ledger-scroll">
        <table className="w-full text-left text-xs min-w-[950px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/80 text-slate-700 uppercase font-semibold tracking-wider">
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3 w-28">Date (தேதி)</th>
              <th className="py-2.5 px-3 min-w-[200px]">
                Route (புறப்படும் இடம் To சேருமிடம்)
              </th>
              <th className="py-2.5 px-3 min-w-[150px]">Load / Goods (லோடு)</th>
              <th className="py-2.5 px-2 w-20 text-right">Ton (டன்)</th>
              <th className="py-2.5 px-3 w-32 text-right bg-emerald-100/50 font-bold text-emerald-900">
                Freight Income (வரவு ₹)
              </th>
              <th className="py-2.5 px-2 w-24 text-right">Commission (கமிஷன் ₹)</th>
              <th className="py-2.5 px-2 w-24 text-right">Loading (ஏற்றுக்கூலி ₹)</th>
              <th className="py-2.5 px-2 w-24 text-right">Unloading (இறக்குக்கூலி ₹)</th>
              <th className="py-2.5 px-2 w-24 text-right">Other (இதர ₹)</th>
              <th className="py-2.5 px-2 w-12 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loads.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-400 italic">
                  No loads added yet. Click &quot;Add Load Row&quot; below to record trips and freight.
                </td>
              </tr>
            ) : (
              loads.map((load, index) => (
                <tr key={load.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-3 text-center text-slate-400 font-medium">
                    {index + 1}
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="date"
                      value={load.load_date || ''}
                      onChange={(e) => handleUpdate(load.id, 'load_date', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={load.route}
                        onChange={(e) => handleUpdate(load.id, 'route', e.target.value)}
                        placeholder="e.g. Salem To Chennai"
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={load.load_description || ''}
                      onChange={(e) => handleUpdate(load.id, 'load_description', e.target.value)}
                      placeholder="e.g. Steel / Cement / Yarn"
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={load.weight_tonnes ?? ''}
                      onChange={(e) =>
                        handleUpdate(
                          load.id,
                          'weight_tonnes',
                          e.target.value === '' ? null : parseFloat(e.target.value)
                        )
                      }
                      placeholder="0.0"
                      className="w-full px-2 py-1 text-xs text-right font-mono border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </td>
                  <td className="py-2 px-2 text-right bg-emerald-50/40">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={load.freight_amount === 0 ? '' : load.freight_amount}
                      onChange={(e) =>
                        handleUpdate(
                          load.id,
                          'freight_amount',
                          e.target.value === '' ? 0 : parseFloat(e.target.value)
                        )
                      }
                      placeholder="0.00"
                      className="w-full px-2 py-1 text-xs text-right font-mono font-bold text-emerald-950 border border-emerald-300 rounded focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={load.commission === 0 ? '' : load.commission}
                      onChange={(e) =>
                        handleUpdate(
                          load.id,
                          'commission',
                          e.target.value === '' ? 0 : parseFloat(e.target.value)
                        )
                      }
                      placeholder="0.00"
                      className="w-full px-2 py-1 text-xs text-right font-mono border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={load.loading_charges === 0 ? '' : load.loading_charges}
                      onChange={(e) =>
                        handleUpdate(
                          load.id,
                          'loading_charges',
                          e.target.value === '' ? 0 : parseFloat(e.target.value)
                        )
                      }
                      placeholder="0.00"
                      className="w-full px-2 py-1 text-xs text-right font-mono border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={load.unloading_charges === 0 ? '' : load.unloading_charges}
                      onChange={(e) =>
                        handleUpdate(
                          load.id,
                          'unloading_charges',
                          e.target.value === '' ? 0 : parseFloat(e.target.value)
                        )
                      }
                      placeholder="0.00"
                      className="w-full px-2 py-1 text-xs text-right font-mono border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={load.other_charges === 0 ? '' : load.other_charges}
                      onChange={(e) =>
                        handleUpdate(
                          load.id,
                          'other_charges',
                          e.target.value === '' ? 0 : parseFloat(e.target.value)
                        )
                      }
                      placeholder="0.00"
                      className="w-full px-2 py-1 text-xs text-right font-mono border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleDelete(load.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded hover:bg-rose-50"
                      title="Delete load row / நீக்கு"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {/* Subtotals footer */}
          <tfoot>
            <tr className="border-t-2 border-slate-300 bg-slate-100/90 font-bold text-slate-900 text-xs">
              <td colSpan={4} className="py-2.5 px-3 uppercase tracking-wider">
                Total / கூடுதல் (Loads: {loads.length})
              </td>
              <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                {totalWeight > 0 ? `${totalWeight} T` : '—'}
              </td>
              <td className="py-2.5 px-2 text-right font-mono bg-emerald-100 text-emerald-950 font-extrabold text-sm">
                {formatINR(totalFreight)}
              </td>
              <td className="py-2.5 px-2 text-right font-mono text-slate-800">
                {formatINR(totalCommission)}
              </td>
              <td className="py-2.5 px-2 text-right font-mono text-slate-800">
                {formatINR(totalLoading)}
              </td>
              <td className="py-2.5 px-2 text-right font-mono text-slate-800">
                {formatINR(totalUnloading)}
              </td>
              <td className="py-2.5 px-2 text-right font-mono text-slate-800">
                {formatINR(totalOther)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer action */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <button
          type="button"
          onClick={handleAddRow}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Load Row / புதிய லோடு சேர்க்க</span>
        </button>
        <span className="text-xs text-slate-500">
          Freight Income matches physical ledger top table
        </span>
      </div>
    </div>
  );
};
