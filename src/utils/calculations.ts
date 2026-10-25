import type {
  Memo,
  MemoLoad,
  MemoDieselEntry,
  DynamicExpenseRow,
  MemoCalculations,
} from '../types/database';

/**
 * Safe number parsing and paise conversion to avoid floating point inaccuracies
 */
export function safeNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0;
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  return isNaN(num) ? 0 : num;
}

export function toPaise(amount: number): number {
  return Math.round(safeNumber(amount) * 100);
}

export function fromPaise(paise: number): number {
  return paise / 100;
}

/**
 * Pure calculation function for a single memo and all its child items.
 * Uses integer paise arithmetic to guarantee decimal correctness.
 */
export function calculateMemoTotals(
  memo: Partial<Memo>,
  loads: MemoLoad[] = [],
  dieselEntries: MemoDieselEntry[] = [],
  otherExpenses: DynamicExpenseRow[] = [],
  rtoExpenses: DynamicExpenseRow[] = []
): MemoCalculations {
  // 1. Income calculation from Loads
  let totalIncomePaise = 0;
  let totalCommissionPaise = 0;
  let totalLoadingPaise = 0;
  let totalUnloadingPaise = 0;
  let totalLoadOtherPaise = 0;

  for (const load of loads) {
    totalIncomePaise += toPaise(load.freight_amount);
    totalCommissionPaise += toPaise(load.commission);
    totalLoadingPaise += toPaise(load.loading_charges);
    totalUnloadingPaise += toPaise(load.unloading_charges);
    totalLoadOtherPaise += toPaise(load.other_charges);
  }

  // 2. Diesel expenditure & Litres
  let totalDieselLitres = 0;
  let totalDieselPaise = 0;

  for (const diesel of dieselEntries) {
    totalDieselLitres += safeNumber(diesel.litres);
    totalDieselPaise += toPaise(diesel.amount);
  }

  // Mileage calculation (KM / Litre)
  const startingKm = safeNumber(memo.starting_km);
  const endingKm = safeNumber(memo.ending_km);
  let totalKm = safeNumber(memo.total_km);
  
  if (endingKm > 0 && startingKm > 0 && endingKm >= startingKm) {
    totalKm = endingKm - startingKm;
  }

  let mileage: number | null = null;
  if (totalKm > 0 && totalDieselLitres > 0) {
    mileage = Math.round((totalKm / totalDieselLitres) * 100) / 100;
  }

  // 3. Other Expenses Table
  let totalOtherPaise = 0;
  for (const exp of otherExpenses) {
    totalOtherPaise += toPaise(exp.amount);
  }

  // 4. RTO & PC Expenses Table
  let totalRtoPaise = 0;
  for (const rto of rtoExpenses) {
    totalRtoPaise += toPaise(rto.amount);
  }

  // 5. Trip specific expenses / allowances from ledger
  const driverBattaPaise = toPaise(memo.driver_batta || 0);
  const cleanerBattaPaise = toPaise(memo.cleaner_batta || 0);
  const workshopPaise = toPaise(memo.workshop_expense || 0);
  const bridgePaise = toPaise(memo.bridge_expense || 0);
  const nakaPaise = toPaise(memo.naka_expense || 0);
  const billsPaise = toPaise(memo.bills_expense || 0);
  const advancePaise = toPaise(memo.advance_amount || 0);

  // 6. Total Expenses
  const totalExpensesPaise =
    totalDieselPaise +
    totalCommissionPaise +
    totalLoadingPaise +
    totalUnloadingPaise +
    totalLoadOtherPaise +
    totalOtherPaise +
    totalRtoPaise +
    driverBattaPaise +
    cleanerBattaPaise +
    workshopPaise +
    bridgePaise +
    nakaPaise +
    billsPaise;

  // 7. Net Final Balance = Total Income - Total Expenses
  const netBalancePaise = totalIncomePaise - totalExpensesPaise;

  // 8. Balance with Advance
  const balanceWithAdvancePaise = advancePaise - totalExpensesPaise;

  return {
    totalIncome: fromPaise(totalIncomePaise),

    totalDieselExpense: fromPaise(totalDieselPaise),
    totalDieselLitres: Math.round(totalDieselLitres * 100) / 100,
    mileage,

    totalCommission: fromPaise(totalCommissionPaise),
    totalLoadingCharges: fromPaise(totalLoadingPaise),
    totalUnloadingCharges: fromPaise(totalUnloadingPaise),
    totalLoadOtherCharges: fromPaise(totalLoadOtherPaise),

    totalOtherExpenses: fromPaise(totalOtherPaise),
    totalRtoExpenses: fromPaise(totalRtoPaise),

    driverBatta: fromPaise(driverBattaPaise),
    cleanerBatta: fromPaise(cleanerBattaPaise),
    workshopExpense: fromPaise(workshopPaise),
    bridgeExpense: fromPaise(bridgePaise),
    nakaExpense: fromPaise(nakaPaise),
    billsExpense: fromPaise(billsPaise),

    totalExpenses: fromPaise(totalExpensesPaise),
    netBalance: fromPaise(netBalancePaise),

    advanceAmount: fromPaise(advancePaise),
    balanceWithAdvance: fromPaise(balanceWithAdvancePaise),
  };
}
