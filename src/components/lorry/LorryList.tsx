import React, { useState } from 'react';
import { Truck, Plus, Search, Folder } from 'lucide-react';
import type { Lorry, Memo } from '../../types/database';
import { LorryCard } from './LorryCard';
import { AddLorryModal } from './AddLorryModal';
import { ConfirmModal } from '../common/ConfirmModal';

interface LorryListProps {
  lorries: Lorry[];
  memosByLorry: Record<string, Memo[]>;
  onOpenLorry: (lorry: Lorry) => void;
  onAddLorry: (registrationNumber: string, nickname?: string) => Promise<void>;
  onDeleteLorry: (lorryId: string) => Promise<void>;
}

export const LorryList: React.FC<LorryListProps> = ({
  lorries,
  memosByLorry,
  onOpenLorry,
  onAddLorry,
  onDeleteLorry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [lorryToDelete, setLorryToDelete] = useState<{
    lorry: Lorry;
    memoCount: number;
  } | null>(null);

  const filteredLorries = lorries.filter((l) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const regMatch = l.registration_number.toLowerCase().includes(q);
    const nickMatch = l.nickname?.toLowerCase().includes(q) || false;
    return regMatch || nickMatch;
  });

  const handleDeletePrompt = (lorry: Lorry, memoCount: number) => {
    setLorryToDelete({ lorry, memoCount });
  };

  const handleConfirmDelete = async () => {
    if (lorryToDelete) {
      await onDeleteLorry(lorryToDelete.lorry.id);
      setLorryToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Folder className="w-4 h-4" />
            <span>Transport Virtual Ledger Folders</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Lorry Accounts / லாரி கணக்கு புத்தகங்கள்
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Each lorry is organized into its own dedicated folder. Trip memos, loads, diesel,
            and expenses are strictly separated per vehicle.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Lorry / புதிய லாரி சேர்க்க</span>
        </button>
      </div>

      {/* Toolbar: Search & Count */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lorry registration or name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filteredLorries.length}</span> registered{' '}
          {filteredLorries.length === 1 ? 'lorry' : 'lorries'}
        </div>
      </div>

      {/* Grid of Lorry Folders */}
      {filteredLorries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="p-4 bg-slate-100 text-slate-400 rounded-full inline-block">
            <Truck className="w-10 h-10" />
          </div>
          <div className="max-w-sm mx-auto">
            <h3 className="text-base font-bold text-slate-900">No Lorries Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery
                ? 'No lorries match your search query.'
                : 'Get started by adding your first lorry registration number.'}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Lorry / முதல் லாரி சேர்க்க</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLorries.map((lorry) => (
            <LorryCard
              key={lorry.id}
              lorry={lorry}
              memos={memosByLorry[lorry.id] || []}
              onOpen={onOpenLorry}
              onDelete={handleDeletePrompt}
            />
          ))}
        </div>
      )}

      {/* Add Lorry Modal */}
      <AddLorryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={onAddLorry}
      />

      {/* Safe Deletion Confirmation Modal */}
      {lorryToDelete && (
        <ConfirmModal
          isOpen={Boolean(lorryToDelete)}
          title={`Delete Lorry ${lorryToDelete.lorry.registration_number}?`}
          message={
            lorryToDelete.memoCount > 0
              ? `WARNING: This lorry contains ${lorryToDelete.memoCount} saved trip memos!\n\nDeleting this lorry folder will PERMANENTLY erase all ${lorryToDelete.memoCount} memos, income, diesel, and RTO ledger entries associated with this vehicle.\n\nAre you sure you want to proceed with this deletion?`
              : `Are you sure you want to delete ${lorryToDelete.lorry.registration_number}?`
          }
          confirmLabel={
            lorryToDelete.memoCount > 0
              ? `Delete Lorry & ${lorryToDelete.memoCount} Memos`
              : 'Delete Lorry / நீக்கு'
          }
          cancelLabel="Cancel"
          isDestructive={true}
          onConfirm={handleConfirmDelete}
          onCancel={() => setLorryToDelete(null)}
        />
      )}
    </div>
  );
};
