export interface Lorry {
  id: string;
  registration_number: string;
  nickname?: string;
  created_at: string;
  updated_at: string;
}

export interface MemoLoad {
  id: string;
  memo_id?: string;
  load_date?: string;
  route: string; // புறப்படும் இடம் To சேருமிடம் (From Place To Destination)
  load_description?: string; // லோடு (Goods/Material description)
  weight_tonnes?: number | null; // டன் (Weight in tonnes)
  freight_amount: number; // வரவு (Freight / Income amount in Rs.)
  commission: number; // கமிஷன்
  loading_charges: number; // ஏற்றுக்கூலி
  unloading_charges: number; // இறக்குக்கூலி
  other_charges: number; // இதர செலவுகள்
  row_order: number;
}

export interface MemoDieselEntry {
  id: string;
  memo_id?: string;
  entry_date?: string;
  litres: number; // டீசல் லிட்டர்
  amount: number; // ரூ.
  bill_details?: string; // பில்படி / பங்க் விபரம்
  row_order: number;
}

export interface DynamicExpenseRow {
  id: string;
  memo_id?: string;
  item_name: string; // செலவு விபரம் / பெயர்
  amount: number; // தொகை (ரூ.)
  row_order: number;
}

export interface Memo {
  id: string;
  lorry_id: string;
  memo_number: string; // e.g. "Memo 001" or "001"
  trip_date: string; // YYYY-MM-DD
  from_date?: string;
  to_date?: string;
  driver_name_1?: string;
  driver_name_2?: string;
  cleaner_name?: string;
  manager_name?: string;
  starting_km?: number | null;
  ending_km?: number | null;
  total_km?: number | null;
  advance_amount: number; // அட்வான்ஸ் (Advance cash received)
  driver_batta: number; // டிரைவர் படி
  cleaner_batta: number; // கிளீனர் படி
  workshop_expense: number; // பட்டறை செலவு
  bridge_expense: number; // பாலம் (Toll / Weighbridge)
  naka_expense: number; // நாக்கா (Checkpost)
  bills_expense: number; // பில்படி
  notes?: string;
  created_at: string; // Database timestamp (Asia/Kolkata)
  updated_at: string; // Database timestamp (Asia/Kolkata)

  // Associated relational rows
  loads?: MemoLoad[];
  diesel_entries?: MemoDieselEntry[];
  other_expenses?: DynamicExpenseRow[];
  rto_expenses?: DynamicExpenseRow[];
}

export interface MemoCalculations {
  totalIncome: number; // மொத்த வரவு (Sum of freight_amount)
  
  // Expenses breakdown
  totalDieselExpense: number; // டீசல் மொத்த செலவு
  totalDieselLitres: number; // மொத்த டீசல் லிட்டர்
  mileage: number | null; // கி.மீ / லிட்டர்

  totalCommission: number; // கமிஷன்
  totalLoadingCharges: number; // ஏற்றுக்கூலி
  totalUnloadingCharges: number; // இறக்குக்கூலி
  totalLoadOtherCharges: number; // லோடுகளில் உள்ள இதர செலவுகள்
  
  totalOtherExpenses: number; // இதர செலவுகள் அட்டவணை மொத்தம்
  totalRtoExpenses: number; // RTO & PC செலவுகள் அட்டவணை மொத்தம்
  
  driverBatta: number; // டிரைவர் படி
  cleanerBatta: number; // கிளீனர் படி
  workshopExpense: number; // பட்டறை செலவு
  bridgeExpense: number; // பாலம்
  nakaExpense: number; // நாக்கா
  billsExpense: number; // பில்படி

  totalExpenses: number; // மொத்த செலவு
  netBalance: number; // மீதி இருப்பு (வரவு - செலவு)
  
  advanceAmount: number; // அட்வான்ஸ்
  balanceWithAdvance: number; // டிரைவரிடம் மீதி அல்லது உரிமையாளர் கணக்கு (அட்வான்ஸ் - செலவு)
}

export type LanguageMode = 'bilingual' | 'ta' | 'en';
