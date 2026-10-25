import type { Memo, MemoLoad, MemoDieselEntry, DynamicExpenseRow } from '../types/database';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { INITIAL_SEED_MEMOS } from './seedData';

const STORAGE_KEY_MEMOS = 'lorry_memo_memos_v1';

function getLocalMemos(): Memo[] {
  const data = localStorage.getItem(STORAGE_KEY_MEMOS);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_MEMOS, JSON.stringify(INITIAL_SEED_MEMOS));
    return INITIAL_SEED_MEMOS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SEED_MEMOS;
  }
}

function saveLocalMemos(memos: Memo[]) {
  localStorage.setItem(STORAGE_KEY_MEMOS, JSON.stringify(memos));
}

export const memoService = {
  /**
   * Get all memos for a given lorry id.
   * Strictly filters by lorry_id to ensure memos are never mixed between lorries.
   */
  async getMemosByLorryId(
    lorryId: string,
    sortOrder: 'newest' | 'oldest' = 'newest'
  ): Promise<Memo[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('memos')
          .select(`
            *,
            loads:memo_loads(*),
            diesel_entries:memo_diesel_entries(*),
            other_expenses:memo_other_expenses(*),
            rto_expenses:memo_rto_expenses(*)
          `)
          .eq('lorry_id', lorryId)
          .order('created_at', { ascending: sortOrder === 'oldest' });

        if (error) {
          console.warn('Supabase fetch error, fallback to local:', error.message);
          return this.getLocalMemosForLorry(lorryId, sortOrder);
        }

        if (!data || data.length === 0) {
          // Check if seed data has memos for this lorry
          const localSeeds = INITIAL_SEED_MEMOS.filter((m) => m.lorry_id === lorryId);
          if (localSeeds.length > 0) {
            // Attempt to seed Supabase
            for (const s of localSeeds) {
              await this.saveMemo(s, s.loads || [], s.diesel_entries || [], s.other_expenses || [], s.rto_expenses || []);
            }
            return localSeeds;
          }
          return [];
        }

        return data as Memo[];
      } catch (err) {
        console.warn('Supabase fetch exception:', err);
        return this.getLocalMemosForLorry(lorryId, sortOrder);
      }
    }

    return this.getLocalMemosForLorry(lorryId, sortOrder);
  },

  getLocalMemosForLorry(lorryId: string, sortOrder: 'newest' | 'oldest' = 'newest'): Memo[] {
    const all = getLocalMemos();
    const filtered = all.filter((m) => m.lorry_id === lorryId);
    return filtered.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });
  },

  async getMemoById(memoId: string): Promise<Memo | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('memos')
          .select(`
            *,
            loads:memo_loads(*),
            diesel_entries:memo_diesel_entries(*),
            other_expenses:memo_other_expenses(*),
            rto_expenses:memo_rto_expenses(*)
          `)
          .eq('id', memoId)
          .single();

        if (error) {
          console.warn('Supabase getMemoById error:', error.message);
          const local = getLocalMemos();
          return local.find((m) => m.id === memoId) || null;
        }

        // Sort child arrays by row_order
        if (data) {
          if (Array.isArray(data.loads)) data.loads.sort((a: MemoLoad, b: MemoLoad) => a.row_order - b.row_order);
          if (Array.isArray(data.diesel_entries)) data.diesel_entries.sort((a: MemoDieselEntry, b: MemoDieselEntry) => a.row_order - b.row_order);
          if (Array.isArray(data.other_expenses)) data.other_expenses.sort((a: DynamicExpenseRow, b: DynamicExpenseRow) => a.row_order - b.row_order);
          if (Array.isArray(data.rto_expenses)) data.rto_expenses.sort((a: DynamicExpenseRow, b: DynamicExpenseRow) => a.row_order - b.row_order);
        }

        return data as Memo;
      } catch (err) {
        console.warn('Supabase query error:', err);
        const local = getLocalMemos();
        return local.find((m) => m.id === memoId) || null;
      }
    }

    const local = getLocalMemos();
    return local.find((m) => m.id === memoId) || null;
  },

  /**
   * Generates next sequential memo number for a lorry, e.g. "MEMO-003"
   */
  async getNextMemoNumber(lorryId: string): Promise<string> {
    const memos = await this.getMemosByLorryId(lorryId, 'newest');
    if (memos.length === 0) return 'MEMO-001';

    let maxNum = 0;
    for (const m of memos) {
      const match = m.memo_number.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    const next = maxNum + 1;
    return `MEMO-${String(next).padStart(3, '0')}`;
  },

  /**
   * Saves or updates a memo and all associated child rows atomically.
   */
  async saveMemo(
    memoData: Partial<Memo> & { lorry_id: string; trip_date: string; memo_number: string },
    loads: MemoLoad[],
    dieselEntries: MemoDieselEntry[],
    otherExpenses: DynamicExpenseRow[],
    rtoExpenses: DynamicExpenseRow[]
  ): Promise<Memo> {
    const isNew = !memoData.id;
    const memoId = memoData.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const localMemos = getLocalMemos();
    const existingMemo = localMemos.find((m) => m.id === memoId);

    // Prepare core memo payload
    const memoRecord: Memo = {
      id: memoId,
      lorry_id: memoData.lorry_id,
      memo_number: memoData.memo_number.trim(),
      trip_date: memoData.trip_date,
      from_date: memoData.from_date || undefined,
      to_date: memoData.to_date || undefined,
      driver_name_1: memoData.driver_name_1?.trim() || undefined,
      driver_name_2: memoData.driver_name_2?.trim() || undefined,
      cleaner_name: memoData.cleaner_name?.trim() || undefined,
      manager_name: memoData.manager_name?.trim() || undefined,
      starting_km: memoData.starting_km !== undefined ? memoData.starting_km : null,
      ending_km: memoData.ending_km !== undefined ? memoData.ending_km : null,
      total_km: memoData.total_km !== undefined ? memoData.total_km : null,
      advance_amount: memoData.advance_amount || 0,
      driver_batta: memoData.driver_batta || 0,
      cleaner_batta: memoData.cleaner_batta || 0,
      workshop_expense: memoData.workshop_expense || 0,
      bridge_expense: memoData.bridge_expense || 0,
      naka_expense: memoData.naka_expense || 0,
      bills_expense: memoData.bills_expense || 0,
      notes: memoData.notes?.trim() || undefined,
      // IMPORTANT: Never overwrite creation timestamp when editing
      created_at: isNew ? now : (memoData.created_at || existingMemo?.created_at || now),
      updated_at: now,
      loads: loads.map((l, i) => ({
        ...l,
        id: l.id || crypto.randomUUID(),
        memo_id: memoId,
        row_order: i + 1,
      })),
      diesel_entries: dieselEntries.map((d, i) => ({
        ...d,
        id: d.id || crypto.randomUUID(),
        memo_id: memoId,
        row_order: i + 1,
      })),
      other_expenses: otherExpenses.map((o, i) => ({
        ...o,
        id: o.id || crypto.randomUUID(),
        memo_id: memoId,
        row_order: i + 1,
      })),
      rto_expenses: rtoExpenses.map((r, i) => ({
        ...r,
        id: r.id || crypto.randomUUID(),
        memo_id: memoId,
        row_order: i + 1,
      })),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        // Upsert memo parent row
        const { error: memoError } = await supabase.from('memos').upsert({
          id: memoRecord.id,
          lorry_id: memoRecord.lorry_id,
          memo_number: memoRecord.memo_number,
          trip_date: memoRecord.trip_date,
          from_date: memoRecord.from_date || null,
          to_date: memoRecord.to_date || null,
          driver_name_1: memoRecord.driver_name_1 || null,
          driver_name_2: memoRecord.driver_name_2 || null,
          cleaner_name: memoRecord.cleaner_name || null,
          manager_name: memoRecord.manager_name || null,
          starting_km: memoRecord.starting_km,
          ending_km: memoRecord.ending_km,
          total_km: memoRecord.total_km,
          advance_amount: memoRecord.advance_amount,
          driver_batta: memoRecord.driver_batta,
          cleaner_batta: memoRecord.cleaner_batta,
          workshop_expense: memoRecord.workshop_expense,
          bridge_expense: memoRecord.bridge_expense,
          naka_expense: memoRecord.naka_expense,
          bills_expense: memoRecord.bills_expense,
          notes: memoRecord.notes || null,
          created_at: memoRecord.created_at,
          updated_at: memoRecord.updated_at,
        });

        if (memoError) {
          throw new Error(`Failed to save memo: ${memoError.message}`);
        }

        // Clean up previous child rows for this memo before inserting new ones
        await Promise.all([
          supabase.from('memo_loads').delete().eq('memo_id', memoId),
          supabase.from('memo_diesel_entries').delete().eq('memo_id', memoId),
          supabase.from('memo_other_expenses').delete().eq('memo_id', memoId),
          supabase.from('memo_rto_expenses').delete().eq('memo_id', memoId),
        ]);

        // Insert new child rows
        if (memoRecord.loads && memoRecord.loads.length > 0) {
          const { error: loadsErr } = await supabase.from('memo_loads').insert(
            memoRecord.loads.map((l) => ({
              id: l.id,
              memo_id: memoId,
              load_date: l.load_date || null,
              route: l.route,
              load_description: l.load_description || null,
              weight_tonnes: l.weight_tonnes || null,
              freight_amount: l.freight_amount,
              commission: l.commission,
              loading_charges: l.loading_charges,
              unloading_charges: l.unloading_charges,
              other_charges: l.other_charges,
              row_order: l.row_order,
            }))
          );
          if (loadsErr) throw new Error(`Failed to save loads: ${loadsErr.message}`);
        }

        if (memoRecord.diesel_entries && memoRecord.diesel_entries.length > 0) {
          const { error: dieselErr } = await supabase.from('memo_diesel_entries').insert(
            memoRecord.diesel_entries.map((d) => ({
              id: d.id,
              memo_id: memoId,
              entry_date: d.entry_date || null,
              litres: d.litres,
              amount: d.amount,
              bill_details: d.bill_details || null,
              row_order: d.row_order,
            }))
          );
          if (dieselErr) throw new Error(`Failed to save diesel entries: ${dieselErr.message}`);
        }

        if (memoRecord.other_expenses && memoRecord.other_expenses.length > 0) {
          const { error: otherErr } = await supabase.from('memo_other_expenses').insert(
            memoRecord.other_expenses.map((o) => ({
              id: o.id,
              memo_id: memoId,
              item_name: o.item_name,
              amount: o.amount,
              row_order: o.row_order,
            }))
          );
          if (otherErr) throw new Error(`Failed to save other expenses: ${otherErr.message}`);
        }

        if (memoRecord.rto_expenses && memoRecord.rto_expenses.length > 0) {
          const { error: rtoErr } = await supabase.from('memo_rto_expenses').insert(
            memoRecord.rto_expenses.map((r) => ({
              id: r.id,
              memo_id: memoId,
              item_name: r.item_name,
              amount: r.amount,
              row_order: r.row_order,
            }))
          );
          if (rtoErr) throw new Error(`Failed to save RTO expenses: ${rtoErr.message}`);
        }
      } catch (err: unknown) {
        console.error('Supabase save error, persisting locally:', err);
        // Persist locally as fallback
      }
    }

    // Always update local storage mirror
    const existingIdx = localMemos.findIndex((m) => m.id === memoId);
    if (existingIdx >= 0) {
      localMemos[existingIdx] = memoRecord;
    } else {
      localMemos.push(memoRecord);
    }
    saveLocalMemos(localMemos);

    return memoRecord;
  },

  async deleteMemo(memoId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('memos').delete().eq('id', memoId);
        if (error) throw new Error(error.message);
      } catch (err: unknown) {
        console.error('Supabase delete error:', err);
      }
    }

    const local = getLocalMemos().filter((m) => m.id !== memoId);
    saveLocalMemos(local);
  },
};
