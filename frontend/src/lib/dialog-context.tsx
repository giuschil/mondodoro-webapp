'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

type DialogType = 'error' | 'success' | 'info';

interface DialogState {
  open: boolean;
  message: string;
  title: string;
  type: DialogType;
}

interface DialogContextType {
  showError: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

const DEFAULT_TITLES: Record<DialogType, string> = {
  error: 'Errore',
  success: 'Operazione completata',
  info: 'Informazione',
};

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    message: '',
    title: '',
    type: 'info',
  });

  const show = useCallback((type: DialogType, message: string, title?: string) => {
    setDialog({ open: true, type, message, title: title || DEFAULT_TITLES[type] });
  }, []);

  const showError = useCallback((message: string, title?: string) => show('error', message, title), [show]);
  const showSuccess = useCallback((message: string, title?: string) => show('success', message, title), [show]);
  const showInfo = useCallback((message: string, title?: string) => show('info', message, title), [show]);

  const close = useCallback(() => setDialog((prev) => ({ ...prev, open: false })), []);

  return (
    <DialogContext.Provider value={{ showError, showSuccess, showInfo }}>
      {children}
      {dialog.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={close}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {dialog.type === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                )}
                {dialog.type === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                )}
                {dialog.type === 'info' && (
                  <AlertCircle className="h-5 w-5 text-gray-400 shrink-0" />
                )}
                <span className="font-semibold text-gray-900 text-base">{dialog.title}</span>
              </div>
              <button
                onClick={close}
                className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
                aria-label="Chiudi"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-gray-700 text-sm leading-relaxed">{dialog.message}</p>
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex justify-end">
              <button
                onClick={close}
                className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used within DialogProvider');
  return ctx;
}
