import React from 'react';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Wallet,
  Gauge,
  Fuel,
} from 'lucide-react';
import type { MemoCalculations } from '../../types/database';
import { formatINR } from '../../utils/currency';

interface SummaryCalculationsProps {
  calc: MemoCalculations;
}

export const SummaryCalculations: React.FC<SummaryCalculationsProps> = ({ calc }) => {
  const isProfit = calc.netBalance >= 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Calculator className="w-5 h-5 text-emerald-400" />
          <h4 className="font-bold text-base tracking-wide">
            Accounts &amp; Balance Summary / கணக்கு &amp; இருப்பு விபரம்
          </h4>
        </div>
        <div className="text-xs text-slate-300 font-mono">
          Auto-computed with Decimal/Paise precision
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Itemized Expenses Ledger (8 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h5 className="text-xs uppercase font-bold text-slate-500 tracking-wider">
            Expense Breakdown Matching Tamil Ledger / செலவு பிரிவுகள்
          </h5>

          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <div className="divide-y divide-slate-100">
              <div className="flex justify-between py-2 px-3 hover:bg-slate-50">
                <span className="text-slate-600 font-medium">1. Diesel Expenses (டீசல் செலவு)</span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatINR(calc.totalDieselExpense)}
                </span>
              </div>

              {calc.totalCommission > 0 && (
                <div className="flex justify-between py-2 px-3 hover:bg-slate-50">
                  <span className="text-slate-600 font-medium">2. Commission (கமிஷன்)</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatINR(calc.totalCommission)}
                  </span>
                </div>
              )}

              {calc.totalLoadingCharges > 0 && (
                <div className="flex justify-between py-2 px-3 hover:bg-slate-50">
                  <span className="text-slate-600 font-medium">3. Loading Charges (ஏற்றுக்கூலி)</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatINR(calc.totalLoadingCharges)}
                  </span>
                </div>
              )}

              {calc.totalUnloadingCharges > 0 && (
                <div className="flex justify-between py-2 px-3 hover:bg-slate-50">
                  <span className="text-slate-600 font-medium">4. Unloading Charges (இறக்குக்கூலி)</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatINR(calc.totalUnloadingCharges)}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-2 px-3 hover:bg-slate-50 bg-indigo-50/30">
                <span className="text-indigo-900 font-medium">
                  5. Other Expenses Table (இதர செலவுகள் அட்டவணை)
                </span>
                <span className="font-mono font-semibold text-indigo-950">
                  {formatINR(calc.totalOtherExpenses)}
                </span>
              </div>

              <div className="flex justify-between py-2 px-3 hover:bg-slate-50 bg-blue-50/30">
                <span className="text-blue-900 font-medium">
                  6. RTO &amp; PC Expenses Table (RTO &amp; PC செலவு)
                </span>
                <span className="font-mono font-semibold text-blue-950">
                  {formatINR(calc.totalRtoExpenses)}
                </span>
              </div>

              {calc.driverBatta > 0 && (
                <div className="flex justify-between py-2 px-3 hover:bg-slate-50">
                  <span className="text-slate-600 font-medium">7. Driver Batta (டிரைவர் படி)</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatINR(calc.driverBatta)}
                  </span>
                </div>
              )}

              {calc.cleanerBatta > 0 && (
                <div className="flex justify-between py-2 px-3 hover:bg-slate-50">
                  <span className="text-slate-600 font-medium">8. Cleaner Batta (கிளீனர் படி)</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatINR(calc.cleanerBatta)}
                  </span>
                </div>
              )}

              {calc.workshopExpense > 0 && (
                <div className="flex justify-between py-2 px-3 hover:bg-slate-50">
                  <span className="text-slate-600 font-medium">9. Workshop (பட்டறை செலவு)</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatINR(calc.workshopExpense)}
                  </span>
                </div>
              )}

              {calc.bridgeExpense > 0 && (
                <div className="flex justify-between py-2 px-3 hover:bg-slate-50">
                  <span className="text-slate-600 font-medium">10. Bridge / Toll (பாலம்)</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatINR(calc.bridgeExpense)}
                  </span>
                </div>
              )}

              {calc.nakaExpense > 0 && (
                <div className="flex justify-between py-2 px-3 hover:bg-slate-50">
                  <span className="text-slate-600 font-medium">11. Naka / Checkpost (நாக்கா)</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatINR(calc.nakaExpense)}
                  </span>
                </div>
              )}

              {calc.billsExpense > 0 && (
                <div className="flex justify-between py-2 px-3 hover:bg-slate-50">
                  <span className="text-slate-600 font-medium">12. Bills / Miscellaneous (பில்படி)</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatINR(calc.billsExpense)}
                  </span>
                </div>
              )}
            </div>

            {/* Total Expenses Row */}
            <div className="flex justify-between py-2.5 px-3 bg-rose-50 border-t border-rose-200 text-rose-950 font-bold">
              <span>மொத்த செலவு (TOTAL EXPENSES)</span>
              <span className="font-mono text-sm">{formatINR(calc.totalExpenses)}</span>
            </div>
          </div>

          {/* Quick Metrics (Fuel & Mileage) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
              <Fuel className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 block">Total Diesel Litres</span>
                <span className="font-bold text-sm text-slate-800 font-mono">
                  {calc.totalDieselLitres} Litres
                </span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
              <Gauge className="w-5 h-5 text-blue-500 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 block">Trip Mileage</span>
                <span className="font-bold text-sm text-slate-800 font-mono">
                  {calc.mileage ? `${calc.mileage} KM/L` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Primary Balance Cards (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Total Income Card */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">
                  Total Income / மொத்த வரவு
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-950 font-mono">
                {formatINR(calc.totalIncome)}
              </div>
              <p className="text-xs text-emerald-700 mt-1">
                Sum of freight revenue from all trip loads
              </p>
            </div>

            {/* Total Expense Card */}
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs uppercase font-bold text-rose-800 tracking-wider">
                  Total Expenses / மொத்த செலவு
                </span>
                <TrendingDown className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-950 font-mono">
                {formatINR(calc.totalExpenses)}
              </div>
              <p className="text-xs text-rose-700 mt-1">
                All diesel, RTO, loading, crew &amp; trip costs
              </p>
            </div>

            {/* Final Remaining Balance Card */}
            <div
              className={`p-5 rounded-xl border-2 shadow-sm ${
                isProfit
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-rose-600 text-white border-rose-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider opacity-90">
                    FINAL BALANCE / மீதி இருப்பு
                  </span>
                  <div className="text-xs opacity-75 font-sans">
                    (Total Income − Total Expenses)
                  </div>
                </div>
                {isProfit ? (
                  <CheckCircle className="w-6 h-6 text-emerald-200" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-rose-200" />
                )}
              </div>

              <div className="text-3xl font-black font-mono tracking-tight my-2">
                {formatINR(calc.netBalance)}
              </div>

              <div className="text-xs opacity-90 font-medium">
                {isProfit
                  ? '✓ Trip Profit (நிகர லாபம்)'
                  : '⚠ Trip Deficit / Loss (செலவு வரவை விட அதிகம்)'}
              </div>
            </div>
          </div>

          {/* Advance Reconciliation */}
          {calc.advanceAmount > 0 && (
            <div className="p-3.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-center justify-between text-slate-700 mb-1">
                <span className="font-medium flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-slate-500" /> Driver Advance (அட்வான்ஸ்):
                </span>
                <span className="font-bold font-mono text-slate-900">
                  {formatINR(calc.advanceAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-600">
                  {calc.balanceWithAdvance >= 0
                    ? 'Driver to return (டிரைவரிடம் மீதி):'
                    : 'Owner to pay driver (கொடுக்க வேண்டியது):'}
                </span>
                <span
                  className={`font-mono font-bold ${
                    calc.balanceWithAdvance >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {formatINR(Math.abs(calc.balanceWithAdvance))}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
