import React, { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/orderService';
import Toast from '../components/Toast';
import { formatINR } from '../utils/formatters';
import { ShoppingBag, Search, Calendar, CarFront, FileText, CheckCircle2, X } from 'lucide-react';

export default function MyPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [toast, setToast] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders({
        search: search || undefined,
        date: dateFilter || undefined,
      });
      setPurchases(data);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to load your purchase history' });
    } finally {
      setLoading(false);
    }
  }, [search, dateFilter]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center space-x-3">
            <ShoppingBag className="w-8 h-8 text-blue-400" />
            <span>My Purchase History</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track and view all vehicle purchase receipts and order details
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 rounded-2xl mb-8 border border-slate-800 flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by vehicle make or model (e.g. Ford, Corvette)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm glass-input rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Date Filter */}
        <div className="relative w-full md:w-64">
          <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm glass-input rounded-xl text-slate-200 focus:outline-none"
          />
        </div>

        {(search || dateFilter) && (
          <button
            onClick={() => {
              setSearch('');
              setDateFilter('');
            }}
            className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Grid / List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      ) : purchases.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 my-8">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-200">No Purchases Found</h3>
          <p className="text-sm text-slate-400 mt-1 mb-4">
            {search || dateFilter
              ? 'No purchase orders match your filter criteria.'
              : "You haven't purchased any vehicles yet. Explore our showroom!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchases.map((order) => (
            <div
              key={order.id}
              className="glass-card rounded-2xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-all flex flex-col group"
            >
              <div className="relative h-44 bg-slate-900 border-b border-slate-800 overflow-hidden">
                {order.vehicle_image_url ? (
                  <img
                    src={order.vehicle_image_url}
                    alt={`${order.vehicle_make} ${order.vehicle_model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <CarFront className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Order #{order.id}</span>
                    <span>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-100">
                    {order.vehicle_make} {order.vehicle_model}
                  </h3>
                  <div className="mt-2 text-sm text-slate-400 flex items-center justify-between">
                    <span>Quantity: {order.quantity_purchased} unit(s)</span>
                    <span className="text-base font-bold text-blue-400">
                      {formatINR(order.purchase_price)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedReceipt(order)}
                  className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all"
                >
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>View Purchase Receipt</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Purchase Receipt</h3>
                  <p className="text-xs text-slate-400">Order #{selectedReceipt.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex justify-between font-bold text-slate-100">
                  <span>Vehicle:</span>
                  <span>{selectedReceipt.vehicle_make} {selectedReceipt.vehicle_model}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Quantity:</span>
                  <span>{selectedReceipt.quantity_purchased}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-semibold">{selectedReceipt.status}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Purchase Date:</span>
                  <span>{new Date(selectedReceipt.created_at).toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between font-extrabold text-base text-blue-400">
                  <span>Total Amount:</span>
                  <span>{formatINR(selectedReceipt.purchase_price)}</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 text-center">
                Thank you for choosing AutoVault! Your order has been processed and saved.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
