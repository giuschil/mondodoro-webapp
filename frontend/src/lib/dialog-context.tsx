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

const ICON_COLOR: Record<DialogType, string> = {
  error: '#ef4444',
  success: '#22c55e',
  info: '#6b7280',
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
        /* Overlay */
        <div
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.45)',
            padding: '16px',
          }}
        >
          {/* Modal card */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              width: '100%',
              maxWidth: '400px',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px 16px',
              borderBottom: '1px solid #f3f4f6',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {dialog.type === 'error' && <AlertCircle size={20} color={ICON_COLOR.error} />}
                {dialog.type === 'success' && <CheckCircle size={20} color={ICON_COLOR.success} />}
                {dialog.type === 'info' && <AlertCircle size={20} color={ICON_COLOR.info} />}
                <span style={{ fontWeight: 600, fontSize: '15px', color: '#111827' }}>
                  {dialog.title}
                </span>
              </div>
              <button
                onClick={close}
                aria-label="Chiudi"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '8px',
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
                {dialog.message}
              </p>
            </div>

            {/* Footer */}
            <div style={{ padding: '0 24px 20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={close}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#111827',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
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
