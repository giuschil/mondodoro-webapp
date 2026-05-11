'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

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

const ICONS: Record<DialogType, React.ReactNode> = {
  error: <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />,
  success: <CheckCircle className="h-5 w-5 text-primary-600 shrink-0" />,
  info: <Info className="h-5 w-5 text-secondary-400 shrink-0" />,
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

  const showError = useCallback(
    (message: string, title?: string) => show('error', message, title),
    [show],
  );
  const showSuccess = useCallback(
    (message: string, title?: string) => show('success', message, title),
    [show],
  );
  const showInfo = useCallback(
    (message: string, title?: string) => show('info', message, title),
    [show],
  );

  const close = useCallback(() => setDialog((prev) => ({ ...prev, open: false })), []);

  return (
    <DialogContext.Provider value={{ showError, showSuccess, showInfo }}>
      {children}

      {dialog.open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-secondary-900/50"
          onClick={close}
        >
          <div
            className="bg-white rounded-lg shadow-md border border-secondary-200 w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-secondary-100">
              <div className="flex items-center gap-2.5">
                {ICONS[dialog.type]}
                <span className="text-secondary-900 font-semibold text-sm">
                  {dialog.title}
                </span>
              </div>
              <button
                onClick={close}
                aria-label="Chiudi"
                className="text-secondary-400 hover:text-secondary-600 transition-colors rounded p-0.5 hover:bg-secondary-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              <p className="text-secondary-600 text-sm leading-relaxed">
                {dialog.message}
              </p>
            </div>

            {/* Footer */}
            <div className="px-5 pb-4 flex justify-end">
              <button
                onClick={close}
                className="h-9 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                OK
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
