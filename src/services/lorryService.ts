import type { Lorry } from '../types/database';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { INITIAL_SEED_LORRIES } from './seedData';

const STORAGE_KEY_LORRIES = 'lorry_memo_lorries_v1';

function getLocalLorries(): Lorry[] {
  const data = localStorage.getItem(STORAGE_KEY_LORRIES);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_LORRIES, JSON.stringify(INITIAL_SEED_LORRIES));
    return INITIAL_SEED_LORRIES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SEED_LORRIES;
  }
}

function saveLocalLorries(lorries: Lorry[]) {
  localStorage.setItem(STORAGE_KEY_LORRIES, JSON.stringify(lorries));
}

export const lorryService = {
  async getLorries(): Promise<Lorry[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('lorries')
          .select('*')
          .order('registration_number', { ascending: true });

        if (error) {
          console.warn('Supabase fetch error, using local storage:', error.message);
          return getLocalLorries();
        }
        
        // If Supabase table is completely empty, seed it with initial sample lorries
        if (!data || data.length === 0) {
          for (const seed of INITIAL_SEED_LORRIES) {
            await supabase.from('lorries').insert({
              id: seed.id,
              registration_number: seed.registration_number,
              nickname: seed.nickname,
            });
          }
          return INITIAL_SEED_LORRIES;
        }

        return data as Lorry[];
      } catch (err) {
        console.warn('Supabase connection error:', err);
        return getLocalLorries();
      }
    }
    return getLocalLorries();
  },

  async getLorryById(id: string): Promise<Lorry | null> {
    const all = await this.getLorries();
    return all.find((l) => l.id === id) || null;
  },

  async createLorry(registrationNumber: string, nickname?: string): Promise<Lorry> {
    const cleanReg = registrationNumber.trim().toUpperCase();
    if (!cleanReg) {
      throw new Error('Registration number is required / லாரி பதிவு எண் தேவை');
    }

    // Check duplicate
    const existing = await this.getLorries();
    if (existing.some((l) => l.registration_number.replace(/\s+/g, '') === cleanReg.replace(/\s+/g, ''))) {
      throw new Error(`Lorry ${cleanReg} is already registered / ${cleanReg} ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது`);
    }

    const now = new Date().toISOString();
    const newLorry: Lorry = {
      id: crypto.randomUUID(),
      registration_number: cleanReg,
      nickname: nickname?.trim() || undefined,
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('lorries')
        .insert({
          id: newLorry.id,
          registration_number: newLorry.registration_number,
          nickname: newLorry.nickname,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase insert failed:', error);
        throw new Error(error.message);
      }
      // Also update local
      const local = getLocalLorries();
      saveLocalLorries([...local, data as Lorry]);
      return data as Lorry;
    }

    const local = getLocalLorries();
    const updated = [...local, newLorry];
    saveLocalLorries(updated);
    return newLorry;
  },

  async updateLorry(id: string, updates: { registration_number?: string; nickname?: string }): Promise<Lorry> {
    const cleanReg = updates.registration_number?.trim().toUpperCase();
    if (cleanReg) {
      const existing = await this.getLorries();
      const duplicate = existing.find(
        (l) => l.id !== id && l.registration_number.replace(/\s+/g, '') === cleanReg.replace(/\s+/g, '')
      );
      if (duplicate) {
        throw new Error(`Another lorry with registration ${cleanReg} already exists.`);
      }
    }

    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('lorries')
        .update({
          ...(cleanReg ? { registration_number: cleanReg } : {}),
          ...(updates.nickname !== undefined ? { nickname: updates.nickname.trim() } : {}),
          updated_at: now,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data as Lorry;
    }

    const local = getLocalLorries();
    const idx = local.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error('Lorry not found');

    const updated: Lorry = {
      ...local[idx],
      ...(cleanReg ? { registration_number: cleanReg } : {}),
      ...(updates.nickname !== undefined ? { nickname: updates.nickname.trim() } : {}),
      updated_at: now,
    };

    local[idx] = updated;
    saveLocalLorries(local);
    return updated;
  },

  async deleteLorry(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('lorries').delete().eq('id', id);
      if (error) throw new Error(error.message);
    }
    const local = getLocalLorries().filter((l) => l.id !== id);
    saveLocalLorries(local);
  },
};
