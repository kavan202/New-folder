import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Info, AlertCircle } from 'lucide-react';

export default function ReviewerInfoModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.65)',
        zIndex: 9999,
      }}
      className="p-4 backdrop-blur-md animate-fade-in"
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '480px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        className="glass-card rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-7 text-slate-200"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Reviewer Information</h2>
            <p className="text-xs text-slate-400">Application access & authentication rules</p>
          </div>
        </div>

        {/* Body Section */}
        <div className="mb-5 space-y-2.5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 font-bold text-sm leading-none">•</span>
              <span>Login using the demo admin account.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 font-bold text-sm leading-none">•</span>
              <span><strong>Username:</strong> <code className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 font-mono">admin</code></span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 font-bold text-sm leading-none">•</span>
              <span><strong>Password:</strong> <code className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 font-mono">admin123</code></span>
            </li>
          </ul>
        </div>

        {/* Notes Section */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Notes</span>
          </h3>
          <ul className="space-y-2 text-xs text-amber-200/90 leading-relaxed">
            <li className="flex items-start space-x-2">
              <span className="text-amber-400 font-bold text-sm leading-none">•</span>
              <span>Salesperson can only register staff accounts.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-amber-400 font-bold text-sm leading-none">•</span>
              <span>Admin registration is restricted and is only available through the Admin Panel after Administrator login.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>,
    document.body
  );
}
