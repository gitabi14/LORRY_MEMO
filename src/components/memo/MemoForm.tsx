import React, { useState, useEffect } from 'react';
import {
  Save,
  X,
  Printer,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import type {
  Memo,
  Lorry,
  MemoLoad,
  MemoDieselEntry,
  DynamicExpenseRow,
} from '../../types/database';
import { TripDetailsForm } from './TripDetailsForm';
import { LoadTable } from './LoadTable';
import { DieselTable } from './DieselTable';
import { DynamicExpenseTable } from './DynamicExpenseTable';
import { SummaryCalculations } from './SummaryCalculations';
import { calculateMemoTotals } from '../../utils/calculations';
import { getTodayInputDate } from '../../utils/dateUtils';
import { memoService } from '../../services/memoService';
import { ConfirmModal } from '../common/ConfirmModal';

interface MemoFormProps {
  lorry: Lorry;
  initialMemo?: Memo | null;
  onSaveSuccess: (savedMemo: Memo) => void;
  onCancel: () => void;
  onShowPrint?: (memo: Memo) => void;
}

export const MemoForm: React.FC<MemoFormProps> = ({
  lorry,
  initialMemo,
  onSaveSuccess,
  onCancel,
  onShowPrint,
}) => {
  const isEditing = Boolean(initialMemo?.id);

  // Core memo state
  const [memoState, setMemoState] = useState<Partial<Memo>>(() => {
    if (initialMemo) {
      return { ...initialMemo };
    }
    return {
      lorry_id: lorry.id,
      memo_number: '',
      trip_date: getTodayInputDate(),
      from_date: getTodayInputDate(),
      to_date: getTodayInputDate(),
      driver_name_1: '',
      driver_name_2: '',
      cleaner_name: '',
      manager_name: '',
      starting_km: null,
      ending_km: null,
      total_km: null,
      advance_amount: 0,
      driver_batta: 0,
      cleaner_batta: 0,
      workshop_expense: 0,
      bridge_expense: 0,
      naka_expense: 0,
      bills_expense: 0,
      notes: '',
    };
  });

  // Table states
  const [loads, setLoads] = useState<MemoLoad[]>(initialMemo?.loads || []);
  const [dieselEntries, setDieselEntries] = useState<MemoDieselEntry[]>(
    initialMemo?.diesel_entries || []
  );
  const [otherExpenses, setOtherExpenses] = useState<DynamicExpenseRow[]>(
    initialMemo?.other_expenses || []
  );
  const [rtoExpenses, setRtoExpenses] = useState<DynamicExpenseRow[]>(
    initialMemo?.rto_expenses || []
  );

  // Form control states
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Auto-generate memo number if new memo
  useEffect(() => {
    if (!isEditing && !memoState.memo_number) {
      memoService.getNextMemoNumber(lorry.id).then((nextNum) => {
        setMemoState((prev) => ({ ...prev, memo_number: nextNum }));
      });
    }
  }, [isEditing, lorry.id, memoState.memo_number]);

  // Mark form as dirty on edits
  const handleFieldChange = <K extends keyof Memo>(field: K, value: Memo[K]) => {
    setIsDirty(true);
    setMemoState((prev) => ({ ...prev, [field]: value }));
  };

  const handleLoadsChange = (newLoads: MemoLoad[]) => {
    setIsDirty(true);
    setLoads(newLoads);
  };

  const handleDieselChange = (newDiesel: MemoDieselEntry[]) => {
    setIsDirty(true);
    setDieselEntries(newDiesel);
  };

  const handleOtherExpensesChange = (newOther: DynamicExpenseRow[]) => {
    setIsDirty(true);
    setOtherExpenses(newOther);
  };

  const handleRtoExpensesChange = (newRto: DynamicExpenseRow[]) => {
    setIsDirty(true);
    setRtoExpenses(newRto);
  };

  // Instant calculated totals
  const calculations = calculateMemoTotals(
    memoState,
    loads,
    dieselEntries,
    otherExpenses,
    rtoExpenses
  );

  // Form submission
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!memoState.memo_number?.trim()) {
      setErrorMessage('Memo number is required / அட்டவணை எண் தேவை');
      return;
    }
    if (!memoState.trip_date) {
      setErrorMessage('Trip date is required / பயண தேதி தேவை');
      return;
    }

    try {
      setIsSaving(true);
      const payload: Partial<Memo> & { lorry_id: string; trip_date: string; memo_number: string } = {
        ...memoState,
        lorry_id: lorry.id,
        memo_number: memoState.memo_number.trim(),
        trip_date: memoState.trip_date,
      };

      const saved = await memoService.saveMemo(
        payload,
        loads,
        dieselEntries,
        otherExpenses,
        rtoExpenses
      );

      setIsDirty(false);
      onSaveSuccess(saved);
    } catch (err: unknown) {
      console.error('Failed to save memo:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to save memo to database. Please retry.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setShowCancelConfirm(true);
    } else {
      onCancel();
    }
  };

  // Common suggestions for RTO expenses matching handwritten ledger
  const rtoQuickSuggestions = [
    'சின்னசேலம் (Chinnasalem)',
    'சுங்கம் (Toll / Sungam)',
    'நாமக்கல் (Namakkal)',
    'திடீர் (Thideer)',
    'பெரியசேலம் (Periyaselam)',
    'சேலம் (Salem)',
    'இடபூண்டி (Edappadi)',
    'P.C. மாமூல் (Police PC)',
  ];

  // Common suggestions for Other expenses
  const otherQuickSuggestions = [
    'வண்டி வாஷ் (Water Wash)',
    'டயர் பன்சர் (Tyre Puncture)',
    'கிரீஸ் & ஆயில் (Greasing)',
    'தார்பாய் கயிறு (Tarpaulin Rope)',
    'டிரைவர் டீ செலவு (Tea & Snacks)',
    'ஸ்பேர் பார்ட்ஸ் (Spare parts)',
  ];

  return (
    <div className="space-y-6">
      {/* Top Sticky Action Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancelClick}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Go back / பின் செல்ல"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <span>{isEditing ? `Edit Memo: ${memoState.memo_number}` : 'Create New Memo'}</span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-blue-100 text-blue-800">
                {lorry.registration_number}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {isEditing
                ? 'Update trip entries and ledger details / கணக்கு விவரங்களை திருத்தவும்'
                : 'Enter trip loads, diesel, RTO and expenses / புதிய பயண கணக்கு பதிவு'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isDirty && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded font-medium">
              Unsaved changes
            </span>
          )}

          {isEditing && onShowPrint && initialMemo && (
            <button
              type="button"
              onClick={() => onShowPrint(initialMemo)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print View</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCancelClick}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel (ரத்து)
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-lg transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Memo (சேமிக்க)'}</span>
          </button>
        </div>
      </div>

      {/* Error message alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-bold block">Save Failed / சேமிக்க இயலவில்லை</strong>
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Trip & Vehicle Details Form */}
      <section>
        <TripDetailsForm
          lorry={lorry}
          memo={memoState}
          onChange={handleFieldChange}
          isEditingExisting={isEditing}
        />
      </section>

      {/* 2. Income & Load Table */}
      <section>
        <LoadTable loads={loads} onChange={handleLoadsChange} />
      </section>

      {/* 3. Diesel Entry Table */}
      <section>
        <DieselTable entries={dieselEntries} onChange={handleDieselChange} />
      </section>

      {/* 4. Other Expenses & 5. RTO Expenses (Using the EXACT same reusable DynamicExpenseTable component!) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Other Expenses Table */}
        <section>
          <DynamicExpenseTable
            title="Other Expenses"
            tamilTitle="இதர செலவுகள்"
            totalLabel="TOTAL OTHER EXPENSES"
            tamilTotalLabel="இதர செலவுகள் மொத்தம்"
            rows={otherExpenses}
            onChange={handleOtherExpensesChange}
            placeholderItem="e.g. Water wash, Tyre repair..."
            quickSuggestions={otherQuickSuggestions}
            themeColor="indigo"
          />
        </section>

        {/* RTO Expenses Table (Exact same component, separate data & suggestions) */}
        <section>
          <DynamicExpenseTable
            title="RTO & PC Expenses"
            tamilTitle="RTO &amp; PC செலவு"
            totalLabel="TOTAL RTO & PC EXPENSES"
            tamilTotalLabel="RTO & PC மொத்தம்"
            rows={rtoExpenses}
            onChange={handleRtoExpensesChange}
            placeholderItem="e.g. Chinnasalem, Namakkal, Toll..."
            quickSuggestions={rtoQuickSuggestions}
            themeColor="blue"
          />
        </section>
      </div>

      {/* 6. Summary & Calculations Card */}
      <section>
        <SummaryCalculations calc={calculations} />
      </section>

      {/* Bottom Save Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Double check all figures before final save. Saved memos can be edited anytime.
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancelClick}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving to Database...' : 'Save Memo / சேமிக்கவும்'}</span>
          </button>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelConfirm}
        title="Discard Unsaved Changes? / மாற்றங்களை கைவிடவா?"
        message="You have unsaved changes in this memo. If you leave now, your recent edits will be lost."
        confirmLabel="Discard & Leave / வெளியேறு"
        cancelLabel="Keep Editing / தொடர்ந்து திருத்து"
        isDestructive={true}
        onConfirm={() => {
          setShowCancelConfirm(false);
          setIsDirty(false);
          onCancel();
        }}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </div>
  );
};
