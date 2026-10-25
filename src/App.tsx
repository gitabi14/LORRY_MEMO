import { useState, useEffect, useCallback } from 'react';
import type { Lorry, Memo } from './types/database';
import { lorryService } from './services/lorryService';
import { memoService } from './services/memoService';
import { Navbar } from './components/common/Navbar';
import { LorryList } from './components/lorry/LorryList';
import { MemoList } from './components/memo/MemoList';
import { MemoForm } from './components/memo/MemoForm';
import { MemoPrintView } from './components/memo/MemoPrintView';
import { ToastContainer } from './components/common/Toast';
import type { ToastMessage } from './components/common/Toast';
import { Loader2 } from 'lucide-react';

export function App() {
  // Navigation view
  const [view, setView] = useState<
    'lorries' | 'lorry_memos' | 'create_memo' | 'edit_memo' | 'print_memo'
  >('lorries');

  const [selectedLorry, setSelectedLorry] = useState<Lorry | null>(null);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);

  // Data state
  const [lorries, setLorries] = useState<Lorry[]>([]);
  const [memosByLorry, setMemosByLorry] = useState<Record<string, Memo[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load initial lorries & memos
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const allLorries = await lorryService.getLorries();
      setLorries(allLorries);

      // Fetch memos for each lorry
      const memosMap: Record<string, Memo[]> = {};
      for (const l of allLorries) {
        const memos = await memoService.getMemosByLorryId(l.id, 'newest');
        memosMap[l.id] = memos;
      }
      setMemosByLorry(memosMap);
    } catch (err: unknown) {
      console.error('Failed to load initial data:', err);
      addToast('error', 'Error loading accounts data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Lorry actions
  const handleAddLorry = async (regNumber: string, nickname?: string) => {
    try {
      const created = await lorryService.createLorry(regNumber, nickname);
      setLorries((prev) => [...prev, created]);
      setMemosByLorry((prev) => ({ ...prev, [created.id]: [] }));
      addToast('success', `Lorry folder ${created.registration_number} created successfully!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create lorry';
      addToast('error', msg);
      throw err;
    }
  };

  const handleDeleteLorry = async (lorryId: string) => {
    try {
      const lorry = lorries.find((l) => l.id === lorryId);
      await lorryService.deleteLorry(lorryId);
      setLorries((prev) => prev.filter((l) => l.id !== lorryId));
      setMemosByLorry((prev) => {
        const copy = { ...prev };
        delete copy[lorryId];
        return copy;
      });
      if (selectedLorry?.id === lorryId) {
        setSelectedLorry(null);
        setSelectedMemo(null);
        setView('lorries');
      }
      addToast('success', `Lorry ${lorry?.registration_number || ''} deleted`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete lorry';
      addToast('error', msg);
    }
  };

  const handleOpenLorry = async (lorry: Lorry) => {
    setSelectedLorry(lorry);
    setSelectedMemo(null);
    setView('lorry_memos');

    // Ensure fresh memos for this lorry
    try {
      const memos = await memoService.getMemosByLorryId(lorry.id, 'newest');
      setMemosByLorry((prev) => ({ ...prev, [lorry.id]: memos }));
    } catch (err) {
      console.error('Error fetching memos:', err);
    }
  };

  // Memo actions
  const handleCreateMemo = () => {
    setSelectedMemo(null);
    setView('create_memo');
  };

  const handleEditMemo = (memo: Memo) => {
    setSelectedMemo(memo);
    setView('edit_memo');
  };

  const handleViewMemo = (memo: Memo) => {
    setSelectedMemo(memo);
    setView('edit_memo'); // Full edit/view interface
  };

  const handlePrintMemo = (memo: Memo) => {
    setSelectedMemo(memo);
    setView('print_memo');
  };

  const handleDeleteMemo = async (memoId: string) => {
    if (!selectedLorry) return;
    try {
      await memoService.deleteMemo(memoId);
      const updated = (memosByLorry[selectedLorry.id] || []).filter((m) => m.id !== memoId);
      setMemosByLorry((prev) => ({ ...prev, [selectedLorry.id]: updated }));
      addToast('success', 'Memo deleted successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete memo';
      addToast('error', msg);
    }
  };

  const handleSaveMemoSuccess = (savedMemo: Memo) => {
    if (!selectedLorry) return;

    // Update state
    const currentList = memosByLorry[selectedLorry.id] || [];
    const index = currentList.findIndex((m) => m.id === savedMemo.id);
    let updatedList: Memo[];
    if (index >= 0) {
      updatedList = [...currentList];
      updatedList[index] = savedMemo;
    } else {
      updatedList = [savedMemo, ...currentList];
    }

    setMemosByLorry((prev) => ({ ...prev, [selectedLorry.id]: updatedList }));
    setSelectedMemo(savedMemo);
    addToast('success', `Memo ${savedMemo.memo_number} saved to database!`);
    setView('lorry_memos');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentLorry={selectedLorry}
        currentMemo={selectedMemo}
        onNavigateHome={() => {
          setSelectedLorry(null);
          setSelectedMemo(null);
          setView('lorries');
        }}
        onNavigateLorry={(l) => {
          setSelectedLorry(l);
          setSelectedMemo(null);
          setView('lorry_memos');
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="text-sm font-medium text-slate-500">
              Loading transport ledgers &amp; memos...
            </span>
          </div>
        ) : (
          <>
            {/* View 1: Lorries Folder Grid */}
            {view === 'lorries' && (
              <LorryList
                lorries={lorries}
                memosByLorry={memosByLorry}
                onOpenLorry={handleOpenLorry}
                onAddLorry={handleAddLorry}
                onDeleteLorry={handleDeleteLorry}
              />
            )}

            {/* View 2: Memos inside a selected Lorry Folder */}
            {view === 'lorry_memos' && selectedLorry && (
              <MemoList
                lorry={selectedLorry}
                memos={memosByLorry[selectedLorry.id] || []}
                onBack={() => {
                  setSelectedLorry(null);
                  setView('lorries');
                }}
                onCreateMemo={handleCreateMemo}
                onViewMemo={handleViewMemo}
                onEditMemo={handleEditMemo}
                onPrintMemo={handlePrintMemo}
                onDeleteMemo={handleDeleteMemo}
              />
            )}

            {/* View 3 & 4: Create or Edit Memo Form */}
            {(view === 'create_memo' || view === 'edit_memo') && selectedLorry && (
              <MemoForm
                lorry={selectedLorry}
                initialMemo={view === 'edit_memo' ? selectedMemo : null}
                onSaveSuccess={handleSaveMemoSuccess}
                onCancel={() => setView('lorry_memos')}
                onShowPrint={(m) => {
                  setSelectedMemo(m);
                  setView('print_memo');
                }}
              />
            )}

            {/* View 5: Physical Ledger Print / PDF View */}
            {view === 'print_memo' && selectedLorry && selectedMemo && (
              <MemoPrintView
                lorry={selectedLorry}
                memo={selectedMemo}
                onBack={() => setView('lorry_memos')}
              />
            )}
          </>
        )}
      </main>

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
