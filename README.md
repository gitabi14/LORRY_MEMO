# Lorry Memo & Accounts Management Web Application
### லாரி பயண கணக்கு மற்றும் அட்டவணை மேலாண்மை மென்பொருள்

A complete, production-ready, ledger-accurate web application designed specifically for lorry owners to digitize their traditional handwritten Tamil trip ledger, prevent calculation mistakes, eliminate duplicate entries, organize memos by lorry registration folders, and maintain financial records securely in Supabase PostgreSQL.

---

## 🚛 Core Features

1. **Virtual Lorry Folder Hierarchy**:
   - Each lorry has its own virtual folder (e.g. `TN 36 AB 1234`, `TN 38 CD 5678`).
   - Memos are strictly isolated per lorry — records are never mixed between vehicles.
   - Deletion safety: Confirmation modal protects lorries with saved memos from accidental deletion.

2. **Handwritten Tamil Ledger Accurate Design**:
   - **Trip & Vehicle Details**: Lorry number, memo number, trip date, date range (`From Date To Date`), crew details (`Driver 1`, `Driver 2`, `Cleaner`, `Manager`), Starting KM, Ending KM, Auto-calculated Run KM (with warning if Ending < Starting), Advance Cash (`அட்வான்ஸ்`).
   - **Trip Overheads**: Driver Batta (`டிரைவர் படி`), Cleaner Batta (`கிளீனர் படி`), Workshop (`பட்டறை செலவு`), Bridge / Toll (`பாலம்`), Checkpost (`நாக்கா`), Bills (`பில்படி`).
   - **Income & Load Table (`வரவு & லோடு விபரம்`)**: Unlimited loads, route, goods description, tonnes, freight income, commission, loading charges, unloading charges, and other load charges with automatic subtotals.
   - **Diesel Table (`டீசல் விபரம்`)**: Purchase date, fuel quantity in litres, actual amount paid, bunk/bill details, and derived rate per litre.
   - **Dynamic Expense Table (`இதர செலவுகள்`)**: Dynamic rows, editable expense description, editable amount, real-time total, and instant row deletion.
   - **RTO Expenses Table (`RTO & PC செலவு`)**: Uses the **exact same reusable dynamic component** as Other Expenses, supporting specific RTO checkpoints and police mamool (e.g. Chinnasalem ₹3,800, Sungam ₹1,000, Namakkal ₹100, PC ₹350 as found in the paper ledger).

3. **Centralized Paise-Safe Calculation Engine**:
   - Uses integer paise arithmetic (`Math.round(amount * 100)`) to eliminate JavaScript floating-point rounding bugs (`0.1 + 0.2 = 0.30000000000000004`).
   - Formula:
     $$\text{Total Expenses} = \text{Diesel} + \text{Commission} + \text{Loading} + \text{Unloading} + \text{Other Expenses} + \text{RTO} + \text{Batta} + \text{Workshop} + \text{Bridge} + \text{Naka} + \text{Bills}$$
     $$\text{Final Balance} = \text{Total Income} - \text{Total Expenses}$$
     $$\text{Advance Reconciliation} = \text{Advance} - \text{Total Expenses}$$
   - Displays all currency in Indian Rupee format (`₹ 26,000.00`).

4. **Timestamps & Audit**:
   - Separate `trip_date` (date trip took place).
   - Database-generated `created_at` timestamp in Indian Standard Time (`Asia/Kolkata`).
   - Automatic `updated_at` timestamp in IST on edits. Editing never overwrites the creation date.
   - Default sorting: newest saved memo first, with toggle for oldest first.

5. **Printable Ledger View (`அச்சு வடிவம்`)**:
   - Single-click ledger sheet formatted exactly like the physical memo book for physical printing or saving as PDF.

6. **Dual Persistence (Supabase + Local Offline Fallback)**:
   - Primary database: Supabase PostgreSQL tables with foreign keys and Row Level Security.
   - Instant local storage fallback if Supabase keys are pending, allowing immediate out-of-the-box usage with zero setup downtime.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Testing**: Vitest
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel

---

## 🗄️ Database Schema & Supabase Setup

The database schema is provided in `supabase/migrations/20261025_init_lorry_memo.sql`.

### Tables:
1. `public.lorries`:
   - `id` (UUID PK)
   - `registration_number` (VARCHAR(20) UNIQUE)
   - `nickname` (VARCHAR(100))
   - `created_at`, `updated_at` (TIMESTAMPTZ in Asia/Kolkata)
2. `public.memos`:
   - `id` (UUID PK)
   - `lorry_id` (UUID FK -> `lorries.id` ON DELETE CASCADE)
   - `memo_number` (VARCHAR(50))
   - `trip_date`, `from_date`, `to_date` (DATE)
   - `driver_name_1`, `driver_name_2`, `cleaner_name`, `manager_name`
   - `starting_km`, `ending_km`, `total_km`
   - `advance_amount`, `driver_batta`, `cleaner_batta`, `workshop_expense`, `bridge_expense`, `naka_expense`, `bills_expense`
   - `created_at`, `updated_at`
3. `public.memo_loads`: Load rows linked to `memo_id`.
4. `public.memo_diesel_entries`: Fuel records linked to `memo_id`.
5. `public.memo_other_expenses`: Other expense line items linked to `memo_id`.
6. `public.memo_rto_expenses`: RTO & PC line items linked to `memo_id`.

### Setup Instructions for Supabase:
1. Create a free account at [supabase.com](https://supabase.com) and create a new project.
2. Go to the **SQL Editor** in your Supabase project dashboard.
3. Open `supabase/migrations/20261025_init_lorry_memo.sql` and run the script.
4. Go to **Project Settings > API** to find your:
   - **Project URL**
   - **Project API Keys (`anon` public key)**
5. Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

---

## 🚀 Deployment Instructions for Vercel

1. Push your repository to GitHub:
   ```bash
   git remote add origin https://github.com/your-username/lorry_memo.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select your GitHub repository `lorry_memo`.
4. In the Project Configuration:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
6. Click **Deploy**. Vercel will build and deploy the app with global CDN distribution.
7. SPA rewrites are already configured in `vercel.json` so direct links and page refreshes work seamlessly.

---

## 💻 Local Development & Testing

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite (Vitest)
npm test

# 3. Build for production (TypeScript check + Vite bundler)
npm run build

# 4. Start local development server
npm run dev
```
