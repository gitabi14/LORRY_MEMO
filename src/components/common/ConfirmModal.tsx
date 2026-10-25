import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm / உறுதிசெய்',
  cancelLabel = 'Cancel / ரத்து செய்',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-full shrink-0 ${
                isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
              }`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{message}</p>
            </div>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-slate-300"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:ring-2 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-400'
                : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-400'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
