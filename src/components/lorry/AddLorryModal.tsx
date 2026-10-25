import React, { useState } from 'react';
import { Truck, X, Plus } from 'lucide-react';

interface AddLorryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (registrationNumber: string, nickname?: string) => Promise<void>;
}

export const AddLorryModal: React.FC<AddLorryModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [regNumber, setRegNumber] = useState('');
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = regNumber.trim().toUpperCase();
    if (!clean) {
      setError('Registration number is required / லாரி பதிவு எண் தேவை');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAdd(clean, nickname.trim() || undefined);
      setRegNumber('');
      setNickname('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to register lorry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Add New Lorry Folder</h3>
              <p className="text-xs text-slate-500">புதிய லாரி கோப்பை உருவாக்க</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Registration Number (பதிவு எண்) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
              placeholder="e.g. TN 36 AB 1234"
              className="w-full px-3.5 py-2 text-sm font-mono font-bold uppercase tracking-wider border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <p className="text-2xs text-slate-400 mt-1">
              Standard vehicle registration format (e.g. TN 38 CD 5678)
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nickname / Vehicle Name (வண்டி பெயர் - விருப்பப்படி)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Raja / Amman / 12-Wheeler"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Adding...' : 'Add Lorry / சேர்'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
