import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, PlusCircle, Package } from 'lucide-react';

export default function RestockModal({ isOpen, onClose, onRestock, vehicle, isSubmitting }) {
  const [quantity, setQuantity] = useState(5);

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

  if (!isOpen || !vehicle) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onRestock(vehicle.id, quantity);
  };

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
        background: 'rgba(0,0,0,0.6)',
        zIndex: 9998,
      }}
      className="p-4 backdrop-blur-md animate-fade-in"
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '700px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        className="glass-card rounded-2xl border border-slate-800 shadow-2xl p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-100 mb-2 flex items-center space-x-2">
          <Package className="w-6 h-6 text-emerald-400" />
          <span>Restock Inventory</span>
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Add additional units for <strong className="text-slate-200">{vehicle.make} {vehicle.model}</strong>. Current stock: <span className="text-emerald-400 font-bold">{vehicle.quantity}</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity to Add</label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 text-sm glass-input rounded-xl text-slate-100 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-md shadow-emerald-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Restocking...' : 'Confirm Restock'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
