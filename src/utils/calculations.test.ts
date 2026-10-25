import { describe, it, expect } from 'vitest';
import {
  calculateMemoTotals,
  safeNumber,
  toPaise,
  fromPaise,
} from './calculations';
import type {
  Memo,
  MemoLoad,
  MemoDieselEntry,
  DynamicExpenseRow,
} from '../types/database';

describe('Paise precision and safe numbers', () => {
  it('safely handles empty, null, undefined and invalid values', () => {
    expect(safeNumber(null)).toBe(0);
    expect(safeNumber(undefined)).toBe(0);
    expect(safeNumber('')).toBe(0);
    expect(safeNumber('abc')).toBe(0);
    expect(safeNumber('123.45')).toBe(123.45);
    expect(safeNumber(500)).toBe(500);
  });

  it('converts to paise and back with exact decimal accuracy', () => {
    expect(toPaise(10.25)).toBe(1025);
    expect(toPaise(0.1) + toPaise(0.2)).toBe(30);
    expect(fromPaise(30)).toBe(0.3);
  });
});

describe('Handwritten Tamil Ledger exact calculation verification', () => {
  it('correctly calculates the uploaded handwritten RTO & PC statement and trip totals', () => {
    // Exact items from handwritten image (rot90_img1.jpg):
    // Chinnasalem: 3800
    // Sungam: 1000
    // Namakkal: 100
    // Thideer: 100
    // Periyaselam: 300
    // Salem: 300
    // Edappadi: 300
    // Total RTO = 5900
    // PC: 200 + 150 = 350
    // Total RTO & PC = 6250
    const rtoExpenses: DynamicExpenseRow[] = [
      { id: '1', item_name: 'சின்னசேலம்', amount: 3800, row_order: 1 },
      { id: '2', item_name: 'சுங்கம்', amount: 1000, row_order: 2 },
      { id: '3', item_name: 'நாமக்கல்', amount: 100, row_order: 3 },
      { id: '4', item_name: 'திடீர்', amount: 100, row_order: 4 },
      { id: '5', item_name: 'பெரியசேலம்', amount: 300, row_order: 5 },
      { id: '6', item_name: 'சேலம்', amount: 300, row_order: 6 },
      { id: '7', item_name: 'இடபூண்டி', amount: 300, row_order: 7 },
      { id: '8', item_name: 'PC 1', amount: 200, row_order: 8 },
      { id: '9', item_name: 'PC 2', amount: 150, row_order: 9 },
    ];

    const loads: MemoLoad[] = [
      {
        id: 'l1',
        route: 'சேலம் To சென்னை',
        load_description: 'ஸ்டீல் கம்பி',
        weight_tonnes: 16.5,
        freight_amount: 26000,
        commission: 500,
        loading_charges: 400,
        unloading_charges: 300,
        other_charges: 0,
        row_order: 1,
      },
    ];

    const dieselEntries: MemoDieselEntry[] = [
      { id: 'd1', litres: 110, amount: 10450, bill_details: 'HP Bunk', row_order: 1 },
    ];

    const otherExpenses: DynamicExpenseRow[] = [
      { id: 'o1', item_name: 'டயர் பன்சர்', amount: 250, row_order: 1 },
      { id: 'o2', item_name: 'வாட்டர் வாஷ்', amount: 300, row_order: 2 },
    ];

    const memo: Partial<Memo> = {
      starting_km: 142500,
      ending_km: 143240,
      advance_amount: 26000,
      driver_batta: 1500,
      cleaner_batta: 700,
      workshop_expense: 450,
      bridge_expense: 350,
      naka_expense: 200,
      bills_expense: 0,
    };

    const result = calculateMemoTotals(memo, loads, dieselEntries, otherExpenses, rtoExpenses);

    // Verify Income
    expect(result.totalIncome).toBe(26000);

    // Verify RTO total
    expect(result.totalRtoExpenses).toBe(6250);

    // Verify Other expenses total: 250 + 300 = 550
    expect(result.totalOtherExpenses).toBe(550);

    // Verify Diesel
    expect(result.totalDieselExpense).toBe(10450);
    expect(result.totalDieselLitres).toBe(110);

    // Verify Mileage: totalKm = 143240 - 142500 = 740 km; 740 / 110 = 6.73 km/L
    expect(result.mileage).toBe(6.73);

    // Verify Total Expenses:
    // Diesel (10450) + Commission (500) + Loading (400) + Unloading (300) +
    // OtherExp (550) + RtoExp (6250) + DriverBatta (1500) + CleanerBatta (700) +
    // Workshop (450) + Bridge (350) + Naka (200) + Bills (0)
    // 10450 + 500 + 400 + 300 + 550 + 6250 + 1500 + 700 + 450 + 350 + 200 = 21650
    expect(result.totalExpenses).toBe(21650);

    // Verify Final Balance = Total Income (26000) - Total Expenses (21650) = 4350 profit
    expect(result.netBalance).toBe(4350);

    // Verify Advance reconciliation:
    // Driver Advance received (26000) - Total Expenses (21650) = 4350 to return to owner
    expect(result.balanceWithAdvance).toBe(4350);
  });

  it('handles empty lists and zero inputs gracefully', () => {
    const result = calculateMemoTotals({});
    expect(result.totalIncome).toBe(0);
    expect(result.totalExpenses).toBe(0);
    expect(result.netBalance).toBe(0);
    expect(result.totalDieselLitres).toBe(0);
    expect(result.mileage).toBeNull();
  });

  it('prevents negative KM and calculation errors when ending km is less than starting km', () => {
    const memo: Partial<Memo> = {
      starting_km: 1000,
      ending_km: 900, // Invalid: Ending < Starting
    };
    const diesel: MemoDieselEntry[] = [{ id: '1', litres: 50, amount: 4500, row_order: 1 }];
    const result = calculateMemoTotals(memo, [], diesel);
    // Mileage should not calculate negative number
    expect(result.mileage).toBeNull();
  });

  it('handles fractional paise and decimal rounding without floating point bugs', () => {
    const loads: MemoLoad[] = [
      {
        id: '1',
        route: 'A to B',
        freight_amount: 10000.33,
        commission: 100.1,
        loading_charges: 50.2,
        unloading_charges: 50.3,
        other_charges: 0,
        row_order: 1,
      },
    ];

    const other: DynamicExpenseRow[] = [
      { id: '1', item_name: 'P1', amount: 0.1, row_order: 1 },
      { id: '2', item_name: 'P2', amount: 0.2, row_order: 2 },
    ];

    const result = calculateMemoTotals({}, loads, [], other, []);
    expect(result.totalIncome).toBe(10000.33);
    expect(result.totalOtherExpenses).toBe(0.3); // 0.1 + 0.2 is exactly 0.3, not 0.30000000000000004
  });
});
