-- ==============================================================================
-- LORRY MEMO & ACCOUNTS MANAGEMENT - SUPABASE POSTGRESQL SCHEMA
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. LORRIES TABLE
CREATE TABLE IF NOT EXISTS public.lorries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_number VARCHAR(20) NOT NULL UNIQUE,
    nickname VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('Asia/Kolkata', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('Asia/Kolkata', NOW())
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_lorries_reg ON public.lorries(registration_number);

-- 2. MEMOS TABLE
CREATE TABLE IF NOT EXISTS public.memos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lorry_id UUID NOT NULL REFERENCES public.lorries(id) ON DELETE CASCADE,
    memo_number VARCHAR(50) NOT NULL,
    trip_date DATE NOT NULL,
    from_date DATE,
    to_date DATE,
    driver_name_1 VARCHAR(100),
    driver_name_2 VARCHAR(100),
    cleaner_name VARCHAR(100),
    manager_name VARCHAR(100),
    starting_km NUMERIC(10, 2),
    ending_km NUMERIC(10, 2),
    total_km NUMERIC(10, 2),
    advance_amount NUMERIC(12, 2) DEFAULT 0,
    driver_batta NUMERIC(12, 2) DEFAULT 0,
    cleaner_batta NUMERIC(12, 2) DEFAULT 0,
    workshop_expense NUMERIC(12, 2) DEFAULT 0,
    bridge_expense NUMERIC(12, 2) DEFAULT 0,
    naka_expense NUMERIC(12, 2) DEFAULT 0,
    bills_expense NUMERIC(12, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('Asia/Kolkata', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('Asia/Kolkata', NOW()),
    CONSTRAINT unique_memo_per_lorry UNIQUE (lorry_id, memo_number)
);

CREATE INDEX IF NOT EXISTS idx_memos_lorry_id ON public.memos(lorry_id);
CREATE INDEX IF NOT EXISTS idx_memos_trip_date ON public.memos(trip_date);
CREATE INDEX IF NOT EXISTS idx_memos_created_at ON public.memos(created_at DESC);

-- 3. MEMO_LOADS TABLE (Income & Loads)
CREATE TABLE IF NOT EXISTS public.memo_loads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memo_id UUID NOT NULL REFERENCES public.memos(id) ON DELETE CASCADE,
    load_date DATE,
    route VARCHAR(255) NOT NULL,
    load_description VARCHAR(255),
    weight_tonnes NUMERIC(8, 3),
    freight_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    commission NUMERIC(12, 2) NOT NULL DEFAULT 0,
    loading_charges NUMERIC(12, 2) NOT NULL DEFAULT 0,
    unloading_charges NUMERIC(12, 2) NOT NULL DEFAULT 0,
    other_charges NUMERIC(12, 2) NOT NULL DEFAULT 0,
    row_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_memo_loads_memo_id ON public.memo_loads(memo_id);

-- 4. MEMO_DIESEL_ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.memo_diesel_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memo_id UUID NOT NULL REFERENCES public.memos(id) ON DELETE CASCADE,
    entry_date DATE,
    litres NUMERIC(10, 2) NOT NULL DEFAULT 0,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    bill_details VARCHAR(255),
    row_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_memo_diesel_memo_id ON public.memo_diesel_entries(memo_id);

-- 5. MEMO_OTHER_EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.memo_other_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memo_id UUID NOT NULL REFERENCES public.memos(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    row_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_memo_other_exp_memo_id ON public.memo_other_expenses(memo_id);

-- 6. MEMO_RTO_EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.memo_rto_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memo_id UUID NOT NULL REFERENCES public.memos(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    row_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_memo_rto_exp_memo_id ON public.memo_rto_expenses(memo_id);

-- 7. AUTOMATIC UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('Asia/Kolkata', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lorries_updated_at ON public.lorries;
CREATE TRIGGER trigger_lorries_updated_at
    BEFORE UPDATE ON public.lorries
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_memos_updated_at ON public.memos;
CREATE TRIGGER trigger_memos_updated_at
    BEFORE UPDATE ON public.memos
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- For a single-owner transport business application, allow full authenticated/anon access with RLS enabled
ALTER TABLE public.lorries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memo_loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memo_diesel_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memo_other_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memo_rto_expenses ENABLE ROW LEVEL SECURITY;

-- Allow read/write access (can be scoped to auth.uid() when user authentication is activated)
CREATE POLICY "Enable read access for all users" ON public.lorries FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.lorries FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.lorries FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.lorries FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.memos FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.memos FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.memos FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.memos FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.memo_loads FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.memo_loads FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.memo_loads FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.memo_loads FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.memo_diesel_entries FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.memo_diesel_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.memo_diesel_entries FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.memo_diesel_entries FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.memo_other_expenses FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.memo_other_expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.memo_other_expenses FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.memo_other_expenses FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.memo_rto_expenses FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.memo_rto_expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.memo_rto_expenses FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.memo_rto_expenses FOR DELETE USING (true);
