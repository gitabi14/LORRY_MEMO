import React from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import type { Memo, Lorry } from '../../types/database';
import { formatINR } from '../../utils/currency';
import { formatISTDate, formatISTDateTime } from '../../utils/dateUtils';
import { calculateMemoTotals } from '../../utils/calculations';

interface MemoPrintViewProps {
  lorry: Lorry;
  memo: Memo;
  onBack: () => void;
}

export const MemoPrintView: React.FC<MemoPrintViewProps> = ({ lorry, memo, onBack }) => {
  const calc = calculateMemoTotals(
    memo,
    memo.loads || [],
    memo.diesel_entries || [],
    memo.other_expenses || [],
    memo.rto_expenses || []
  );

  const handlePrint = () => {
    window.print();
  };

  const loads = memo.loads || [];
  const diesel = memo.diesel_entries || [];
  const otherExp = memo.other_expenses || [];
  const rtoExp = memo.rto_expenses || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top action bar (hidden in print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Memo / பின் செல்ல</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            Official Ledger Printable Format / அச்சு வடிவம்
          </span>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-black rounded-lg transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Ledger / அச்சிடுக</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="print-page bg-white p-8 rounded-xl border border-slate-300 shadow-md text-slate-900 font-sans print:p-0 print:border-none print:shadow-none">
        {/* Title & Lorry Banner */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
          <h2 className="text-2xl font-black uppercase tracking-wider text-slate-900">
            லாரி கணக்கு அட்டவணை / LORRY TRIP MEMO
          </h2>
          <div className="text-sm font-bold text-slate-700 mt-1">
            {lorry.registration_number} {lorry.nickname ? `— ${lorry.nickname}` : ''}
          </div>
        </div>

        {/* Ledger Header Information Box */}
        <div className="border border-slate-900 text-xs mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-900 divide-x divide-slate-900">
            <div className="p-2">
              <span className="font-bold">அட்டவணை எண் (Memo No):</span> {memo.memo_number}
            </div>
            <div className="p-2">
              <span className="font-bold">பயண தேதி (Trip Date):</span> {formatISTDate(memo.trip_date)}
            </div>
            <div className="p-2">
              <span className="font-bold">ஆரம்ப கி.மீ (Start KM):</span> {memo.starting_km || '—'}
            </div>
            <div className="p-2">
              <span className="font-bold">முடிவு கி.மீ (End KM):</span> {memo.ending_km || '—'}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-900 divide-x divide-slate-900">
            <div className="p-2">
              <span className="font-bold">ஓடிய கி.மீ (Total KM):</span> {memo.total_km || '—'}
            </div>
            <div className="p-2">
              <span className="font-bold">டீசல் (Diesel):</span> {calc.totalDieselLitres} L
            </div>
            <div className="p-2">
              <span className="font-bold">மைலேஜ் (Mileage):</span> {calc.mileage ? `${calc.mileage} KM/L` : '—'}
            </div>
            <div className="p-2">
              <span className="font-bold">அட்வான்ஸ் (Advance):</span> {formatINR(memo.advance_amount)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-slate-900">
            <div className="p-2">
              <span className="font-bold">டிரைவர் பெயர் 1:</span> {memo.driver_name_1 || '—'}
              {memo.driver_name_2 ? ` / 2: ${memo.driver_name_2}` : ''}
            </div>
            <div className="p-2">
              <span className="font-bold">கிளீனர் பெயர்:</span> {memo.cleaner_name || '—'}
            </div>
            <div className="p-2">
              <span className="font-bold">தேதி:</span> {formatISTDate(memo.from_date)} To {formatISTDate(memo.to_date)}
            </div>
          </div>
        </div>

        {/* 1. TOP TABLE: Income & Loads */}
        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-wider mb-1 bg-slate-100 p-1 border border-slate-900">
            1. வரவு மற்றும் லோடு விபரம் (INCOME &amp; LOAD PARTICULARS)
          </div>
          <table className="w-full border-collapse border border-slate-900 text-xs text-left">
            <thead>
              <tr className="bg-slate-200 border-b border-slate-900 font-bold">
                <th className="border border-slate-900 p-1.5 w-8 text-center">#</th>
                <th className="border border-slate-900 p-1.5 w-24">தேதி (Date)</th>
                <th className="border border-slate-900 p-1.5">புறப்படும் இடம் To சேருமிடம் (Route)</th>
                <th className="border border-slate-900 p-1.5">லோடு (Load)</th>
                <th className="border border-slate-900 p-1.5 text-right w-16">டன் (Ton)</th>
                <th className="border border-slate-900 p-1.5 text-right w-28 bg-slate-300">வரவு (Freight ₹)</th>
                <th className="border border-slate-900 p-1.5 text-right w-20">கமிஷன் ₹</th>
                <th className="border border-slate-900 p-1.5 text-right w-20">ஏற்றுக்கூலி ₹</th>
                <th className="border border-slate-900 p-1.5 text-right w-20">இறக்குக்கூலி ₹</th>
              </tr>
            </thead>
            <tbody>
              {loads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="border border-slate-900 p-2 text-center text-slate-500">
                    No loads recorded
                  </td>
                </tr>
              ) : (
                loads.map((l, i) => (
                  <tr key={l.id} className="border-b border-slate-900">
                    <td className="border border-slate-900 p-1 text-center">{i + 1}</td>
                    <td className="border border-slate-900 p-1">{formatISTDate(l.load_date)}</td>
                    <td className="border border-slate-900 p-1 font-medium">{l.route}</td>
                    <td className="border border-slate-900 p-1">{l.load_description || '—'}</td>
                    <td className="border border-slate-900 p-1 text-right font-mono">{l.weight_tonnes ?? '—'}</td>
                    <td className="border border-slate-900 p-1 text-right font-mono font-bold bg-slate-100">
                      {formatINR(l.freight_amount)}
                    </td>
                    <td className="border border-slate-900 p-1 text-right font-mono">{formatINR(l.commission)}</td>
                    <td className="border border-slate-900 p-1 text-right font-mono">{formatINR(l.loading_charges)}</td>
                    <td className="border border-slate-900 p-1 text-right font-mono">{formatINR(l.unloading_charges)}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-200 border-t-2 border-slate-900 font-bold">
                <td colSpan={5} className="border border-slate-900 p-1.5 text-right uppercase">
                  மொத்த வரவு (TOTAL INCOME):
                </td>
                <td className="border border-slate-900 p-1.5 text-right font-mono font-extrabold text-sm">
                  {formatINR(calc.totalIncome)}
                </td>
                <td className="border border-slate-900 p-1.5 text-right font-mono">{formatINR(calc.totalCommission)}</td>
                <td className="border border-slate-900 p-1.5 text-right font-mono">{formatINR(calc.totalLoadingCharges)}</td>
                <td className="border border-slate-900 p-1.5 text-right font-mono">{formatINR(calc.totalUnloadingCharges)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 2. DUAL COLUMNS: Diesel / Expenses Left, Totals Breakdown Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Left: Diesel & RTO table */}
          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1 bg-slate-100 p-1 border border-slate-900">
                2. டீசல் விபரம் (DIESEL ENTRIES)
              </div>
              <table className="w-full border-collapse border border-slate-900 text-xs text-left">
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-900 font-bold">
                    <th className="border border-slate-900 p-1 w-8 text-center">#</th>
                    <th className="border border-slate-900 p-1 w-20">தேதி</th>
                    <th className="border border-slate-900 p-1 text-right w-16">லிட்டர்</th>
                    <th className="border border-slate-900 p-1 text-right w-24">ரூபாய் ₹</th>
                    <th className="border border-slate-900 p-1">பில் விபரம்</th>
                  </tr>
                </thead>
                <tbody>
                  {diesel.map((d, i) => (
                    <tr key={d.id} className="border-b border-slate-900">
                      <td className="border border-slate-900 p-1 text-center">{i + 1}</td>
                      <td className="border border-slate-900 p-1">{formatISTDate(d.entry_date)}</td>
                      <td className="border border-slate-900 p-1 text-right font-mono">{d.litres}</td>
                      <td className="border border-slate-900 p-1 text-right font-mono font-semibold">
                        {formatINR(d.amount)}
                      </td>
                      <td className="border border-slate-900 p-1">{d.bill_details || '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-200 border-t border-slate-900 font-bold">
                    <td colSpan={2} className="border border-slate-900 p-1 text-right">டீசல் மொத்தம்:</td>
                    <td className="border border-slate-900 p-1 text-right font-mono">{calc.totalDieselLitres} L</td>
                    <td className="border border-slate-900 p-1 text-right font-mono">{formatINR(calc.totalDieselExpense)}</td>
                    <td className="border border-slate-900 p-1"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* RTO & PC statement */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1 bg-slate-100 p-1 border border-slate-900">
                3. RTO &amp; PC விபரம் (RTO &amp; PC STATEMENT)
              </div>
              <table className="w-full border-collapse border border-slate-900 text-xs text-left">
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-900 font-bold">
                    <th className="border border-slate-900 p-1 w-8 text-center">#</th>
                    <th className="border border-slate-900 p-1">இடம் / செலவு பெயர் (Item)</th>
                    <th className="border border-slate-900 p-1 text-right w-24">தொகை (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {rtoExp.map((r, i) => (
                    <tr key={r.id} className="border-b border-slate-900">
                      <td className="border border-slate-900 p-1 text-center">{i + 1}</td>
                      <td className="border border-slate-900 p-1">{r.item_name}</td>
                      <td className="border border-slate-900 p-1 text-right font-mono">{formatINR(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-200 border-t border-slate-900 font-bold">
                    <td colSpan={2} className="border border-slate-900 p-1 text-right">RTO &amp; PC மொத்தம்:</td>
                    <td className="border border-slate-900 p-1 text-right font-mono">{formatINR(calc.totalRtoExpenses)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Other Expenses statement */}
            {otherExp.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-1 bg-slate-100 p-1 border border-slate-900">
                  4. இதர செலவுகள் விபரம் (OTHER EXPENSES)
                </div>
                <table className="w-full border-collapse border border-slate-900 text-xs text-left">
                  <thead>
                    <tr className="bg-slate-200 border-b border-slate-900 font-bold">
                      <th className="border border-slate-900 p-1 w-8 text-center">#</th>
                      <th className="border border-slate-900 p-1">செலவு பெயர் (Item)</th>
                      <th className="border border-slate-900 p-1 text-right w-24">தொகை (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherExp.map((o, i) => (
                      <tr key={o.id} className="border-b border-slate-900">
                        <td className="border border-slate-900 p-1 text-center">{i + 1}</td>
                        <td className="border border-slate-900 p-1">{o.item_name}</td>
                        <td className="border border-slate-900 p-1 text-right font-mono">{formatINR(o.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-200 border-t border-slate-900 font-bold">
                      <td colSpan={2} className="border border-slate-900 p-1 text-right">இதர செலவுகள் மொத்தம்:</td>
                      <td className="border border-slate-900 p-1 text-right font-mono">{formatINR(calc.totalOtherExpenses)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Right: Master Expense Breakdown & Final Balance */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-1 bg-slate-100 p-1 border border-slate-900">
              4. மொத்த கணக்கு விபரம் (EXPENDITURE &amp; SETTLEMENT)
            </div>
            <table className="w-full border-collapse border border-slate-900 text-xs text-left">
              <thead>
                <tr className="bg-slate-200 border-b border-slate-900 font-bold">
                  <th className="border border-slate-900 p-1.5">செலவு தலைப்பு (Ledger Items)</th>
                  <th className="border border-slate-900 p-1.5 text-right w-28">ரூபாய் (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-900">
                  <td className="border border-slate-900 p-1">1. டீசல் (Diesel)</td>
                  <td className="border border-slate-900 p-1 text-right font-mono">{formatINR(calc.totalDieselExpense)}</td>
                </tr>
                <tr className="border-b border-slate-900">
                  <td className="border border-slate-900 p-1">2. கமிஷன் (Commission)</td>
                  <td className="border border-slate-900 p-1 text-right font-mono">{formatINR(calc.totalCommission)}</td>
                </tr>
                <tr className="border-b border-slate-900">
                  <td className="border border-slate-900 p-1">3. ஏற்றுக்கூலி (Loading)</td>
                  <td className="border border-slate-900 p-1 text-right font-mono">{formatINR(calc.totalLoadingCharges)}</td>
                </tr>
                <tr className="border-b border-slate-900">
                  <td className="border border-slate-900 p-1">4. இறக்குக்கூலி (Unloading)</td>
                  <td className="border border-slate-900 p-1 text-right font-mono">{formatINR(calc.totalUnloadingCharges)}</td>
                </tr>
                <tr className="border-b border-slate-900">
                  <td className="border border-slate-900 p-1">5. இதரசெலவுகள் (Other Expenses)</td>
                  <td className="border border-slate-900 p-1 text-right font-mono">{formatINR(calc.totalOtherExpenses)}</td>
                </tr>
                <tr className="border-b border-slate-900">
                  <td className="border border-slate-900 p-1">6. டிரைவர் படி (Driver Batta)</td>
                  <td className="border border-slate-900 p-1 text-right font-mono">{formatINR(calc.driverBatta)}</td>
                </tr>
                <tr className="border-b border-slate-900">
                  <td className="border border-slate-900 p-1">7. கிளீனர் படி (Cleaner Batta)</td>
                  <td className="border border-slate-900 p-1 text-right font-mono">{formatINR(calc.cleanerBatta)}</td>
                </tr>
                <tr className="border-b border-slate-900">
                  <td className="border border-slate-900 p-1">8. பட்டறை செலவு (Workshop)</td>
                  <td className="border border-slate-900 p-1 text-right font-mono">{formatINR(calc.workshopExpense)}</td>
                </tr>
                <tr className="border-b border-slate-900">
                  <td className="border border-slate-900 p-1">9. RTO &amp; PC செலவு</td>
                  <td className="border border-slate-900 p-1 text-right font-mono font-semibold">{formatINR(calc.totalRtoExpenses)}</td>
                </tr>
                <tr className="border-b border-slate-900">
                  <td className="border border-slate-900 p-1">10. பாலம் (Bridge / Weighbridge)</td>
                  <td className="border border-slate-900 p-1 text-right font-mono">{formatINR(calc.bridgeExpense)}</td>
                </tr>
                <tr className="border-b border-slate-900">
                  <td className="border border-slate-900 p-1">11. நாக்கா (Checkpost / Toll)</td>
                  <td className="border border-slate-900 p-1 text-right font-mono">{formatINR(calc.nakaExpense)}</td>
                </tr>
                <tr className="border-b border-slate-900">
                  <td className="border border-slate-900 p-1">12. பில்படி (Bills)</td>
                  <td className="border border-slate-900 p-1 text-right font-mono">{formatINR(calc.billsExpense)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-200 border-t-2 border-slate-900 font-bold">
                  <td className="border border-slate-900 p-1.5 uppercase text-right">மொத்த செலவு (TOTAL EXPENSES):</td>
                  <td className="border border-slate-900 p-1.5 text-right font-mono font-bold">{formatINR(calc.totalExpenses)}</td>
                </tr>
                <tr className="bg-slate-200 border-t border-slate-900 font-bold">
                  <td className="border border-slate-900 p-1.5 uppercase text-right">மொத்த வரவு (TOTAL INCOME):</td>
                  <td className="border border-slate-900 p-1.5 text-right font-mono font-bold">{formatINR(calc.totalIncome)}</td>
                </tr>
                <tr className="bg-slate-900 text-white font-black text-sm">
                  <td className="border border-slate-900 p-2 uppercase text-right">மீதி இருப்பு (FINAL BALANCE):</td>
                  <td className="border border-slate-900 p-2 text-right font-mono text-base">{formatINR(calc.netBalance)}</td>
                </tr>
              </tfoot>
            </table>

            {/* Advance & Driver settlement */}
            {calc.advanceAmount > 0 && (
              <div className="mt-3 p-2 border border-slate-900 text-xs">
                <div className="flex justify-between py-0.5">
                  <span className="font-bold">அட்வான்ஸ் தொகை (Advance):</span>
                  <span className="font-mono">{formatINR(calc.advanceAmount)}</span>
                </div>
                <div className="flex justify-between py-0.5 font-bold border-t border-slate-300">
                  <span>
                    {calc.balanceWithAdvance >= 0
                      ? 'டிரைவரிடம் மீதி (Driver to Return):'
                      : 'கொடுக்க வேண்டியது (Pay to Driver):'}
                  </span>
                  <span className="font-mono">{formatINR(Math.abs(calc.balanceWithAdvance))}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer & Signatures */}
        <div className="mt-8 pt-4 border-t border-slate-900 flex justify-between text-xs text-slate-700">
          <div>
            <div>பதிவு செய்த நாள்: {formatISTDateTime(memo.created_at)}</div>
            <div>கடைசி மாற்றம்: {formatISTDateTime(memo.updated_at)}</div>
          </div>
          <div className="text-center">
            <div className="w-32 border-b border-slate-900 mb-1"></div>
            <span>டிரைவர் கையொப்பம் (Driver Sign)</span>
          </div>
          <div className="text-center">
            <div className="w-32 border-b border-slate-900 mb-1"></div>
            <span>உரிமையாளர் கையொப்பம் (Owner Sign)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
