import React from 'react';
import { Truck, AlertTriangle } from 'lucide-react';
import type { Memo, Lorry } from '../../types/database';
import { safeNumber } from '../../utils/calculations';
import { formatISTDateTime } from '../../utils/dateUtils';

interface TripDetailsFormProps {
  lorry: Lorry;
  memo: Partial<Memo>;
  onChange: <K extends keyof Memo>(field: K, value: Memo[K]) => void;
  isEditingExisting?: boolean;
}

export const TripDetailsForm: React.FC<TripDetailsFormProps> = ({
  lorry,
  memo,
  onChange,
  isEditingExisting = false,
}) => {
  const startingKm = safeNumber(memo.starting_km);
  const endingKm = safeNumber(memo.ending_km);

  const isKmWarning = endingKm > 0 && startingKm > 0 && endingKm < startingKm;
  const calculatedRunKm =
    endingKm > 0 && startingKm > 0 && endingKm >= startingKm
      ? endingKm - startingKm
      : memo.total_km || 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-6">
      {/* Top Banner: Lorry Info & Timestamps */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-slate-900 tracking-wide">
                {lorry.registration_number}
              </span>
              {lorry.nickname && (
                <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                  {lorry.nickname}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Lorry Trip Memo &amp; Accounts / லாரி பயண கணக்கு அட்டை
            </p>
          </div>
        </div>

        {/* Timestamps in IST */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <div>
            <span className="text-slate-400 block font-medium">Saved (பதிவு செய்த நேரம்):</span>
            <span className="font-semibold text-slate-800">
              {formatISTDateTime(memo.created_at)}
            </span>
          </div>
          {isEditingExisting && memo.updated_at && (
            <div className="border-l border-slate-200 pl-4">
              <span className="text-slate-400 block font-medium">Last Modified (கடைசி மாற்றம்):</span>
              <span className="font-semibold text-slate-800">
                {formatISTDateTime(memo.updated_at)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Memo Number & Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Memo Number (அட்டவணை எண்) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={memo.memo_number || ''}
            onChange={(e) => onChange('memo_number', e.target.value)}
            placeholder="e.g. MEMO-001"
            className="w-full px-3 py-2 text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Trip Date (பயண தேதி) <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            required
            value={memo.trip_date || ''}
            onChange={(e) => onChange('trip_date', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            From Date (ஆரம்ப தேதி)
          </label>
          <input
            type="date"
            value={memo.from_date || ''}
            onChange={(e) => onChange('from_date', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            To Date (முடிவு தேதி)
          </label>
          <input
            type="date"
            value={memo.to_date || ''}
            onChange={(e) => onChange('to_date', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Grid: Crew details (Drivers, Cleaner, Manager) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Driver Name 1 (டிரைவர் 1)
          </label>
          <input
            type="text"
            value={memo.driver_name_1 || ''}
            onChange={(e) => onChange('driver_name_1', e.target.value)}
            placeholder="Driver 1 name"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Driver Name 2 (டிரைவர் 2)
          </label>
          <input
            type="text"
            value={memo.driver_name_2 || ''}
            onChange={(e) => onChange('driver_name_2', e.target.value)}
            placeholder="Optional second driver"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Cleaner Name (கிளீனர் பெயர்)
          </label>
          <input
            type="text"
            value={memo.cleaner_name || ''}
            onChange={(e) => onChange('cleaner_name', e.target.value)}
            placeholder="Cleaner name"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Manager (மேனேஜர்)
          </label>
          <input
            type="text"
            value={memo.manager_name || ''}
            onChange={(e) => onChange('manager_name', e.target.value)}
            placeholder="Manager / Clerk"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Grid: KM readings & Advance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Starting KM (ஆரம்ப கி.மீ)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="any"
              value={memo.starting_km ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? null : parseFloat(e.target.value);
                onChange('starting_km', val);
                if (val && endingKm && endingKm >= val) {
                  onChange('total_km', endingKm - val);
                }
              }}
              placeholder="e.g. 142500"
              className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Ending KM (முடிவு கி.மீ)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="any"
              value={memo.ending_km ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? null : parseFloat(e.target.value);
                onChange('ending_km', val);
                if (val && startingKm && val >= startingKm) {
                  onChange('total_km', val - startingKm);
                }
              }}
              placeholder="e.g. 143240"
              className={`w-full px-3 py-2 text-sm font-mono border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white ${
                isKmWarning ? 'border-amber-400 bg-amber-50/50' : 'border-slate-300'
              }`}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Run / Total KM (ஓடிய கி.மீ)
          </label>
          <div className="relative">
            <input
              type="number"
              readOnly
              value={calculatedRunKm || ''}
              placeholder="Auto-calculated"
              className="w-full px-3 py-2 text-sm font-mono font-bold text-slate-800 bg-slate-100 border border-slate-300 rounded-lg cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-emerald-800 mb-1">
            Advance Cash (அட்வான்ஸ் ₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-emerald-600 font-bold">₹</span>
            <input
              type="number"
              min="0"
              step="any"
              value={memo.advance_amount === 0 ? '' : memo.advance_amount}
              onChange={(e) =>
                onChange('advance_amount', e.target.value === '' ? 0 : parseFloat(e.target.value))
              }
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-2 text-sm font-mono font-bold text-emerald-900 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-emerald-50/40"
            />
          </div>
        </div>
      </div>

      {/* Warning for KM */}
      {isKmWarning && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Warning:</strong> Ending KM ({endingKm}) is less than Starting KM ({startingKm}).
            Please verify your odometer readings.
          </span>
        </div>
      )}

      {/* Trip Allowances & Fixed Ledger Expenses Section */}
      <div className="pt-4 border-t border-slate-200">
        <h5 className="text-xs uppercase font-bold text-slate-600 tracking-wider mb-3">
          Trip Allowances &amp; Overhead Expenses (பயணப் படிகள் மற்றும் செலவுகள்)
        </h5>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Driver Batta (டிரைவர் படி)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={memo.driver_batta === 0 ? '' : memo.driver_batta}
              onChange={(e) =>
                onChange('driver_batta', e.target.value === '' ? 0 : parseFloat(e.target.value))
              }
              placeholder="₹ 0.00"
              className="w-full px-2.5 py-1.5 text-xs font-mono text-right border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Cleaner Batta (கிளீனர் படி)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={memo.cleaner_batta === 0 ? '' : memo.cleaner_batta}
              onChange={(e) =>
                onChange('cleaner_batta', e.target.value === '' ? 0 : parseFloat(e.target.value))
              }
              placeholder="₹ 0.00"
              className="w-full px-2.5 py-1.5 text-xs font-mono text-right border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Workshop (பட்டறை செலவு)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={memo.workshop_expense === 0 ? '' : memo.workshop_expense}
              onChange={(e) =>
                onChange('workshop_expense', e.target.value === '' ? 0 : parseFloat(e.target.value))
              }
              placeholder="₹ 0.00"
              className="w-full px-2.5 py-1.5 text-xs font-mono text-right border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Bridge / Toll (பாலம்)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={memo.bridge_expense === 0 ? '' : memo.bridge_expense}
              onChange={(e) =>
                onChange('bridge_expense', e.target.value === '' ? 0 : parseFloat(e.target.value))
              }
              placeholder="₹ 0.00"
              className="w-full px-2.5 py-1.5 text-xs font-mono text-right border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Naka / Checkpost (நாக்கா)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={memo.naka_expense === 0 ? '' : memo.naka_expense}
              onChange={(e) =>
                onChange('naka_expense', e.target.value === '' ? 0 : parseFloat(e.target.value))
              }
              placeholder="₹ 0.00"
              className="w-full px-2.5 py-1.5 text-xs font-mono text-right border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Bills (பில்படி)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={memo.bills_expense === 0 ? '' : memo.bills_expense}
              onChange={(e) =>
                onChange('bills_expense', e.target.value === '' ? 0 : parseFloat(e.target.value))
              }
              placeholder="₹ 0.00"
              className="w-full px-2.5 py-1.5 text-xs font-mono text-right border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
