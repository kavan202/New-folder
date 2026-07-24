import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, type: propType, message: propMessage, onClose }) {
  const type = toast?.type || propType;
  const message = toast?.message || propMessage;

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return createPortal(
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
      }}
      className="animate-fade-in max-w-md"
    >
      <div
        className={`flex items-center space-x-3 p-4 rounded-xl border shadow-2xl backdrop-blur-xl ${
          isSuccess
            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-900/30'
            : isError
            ? 'bg-rose-950/90 border-rose-500/40 text-rose-200 shadow-rose-900/30'
            : 'bg-blue-950/90 border-blue-500/40 text-blue-200 shadow-blue-900/30'
        }`}
      >
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
        {isError && <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />}

        <p className="text-sm font-medium pr-2">{message}</p>

        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>,
    document.body
  );
}
