import React, { useState, useEffect, useCallback } from 'react';
import { testDriveService } from '../services/testDriveService';
import Toast from '../components/Toast';
import { Calendar, Clock, Phone, Search, CarFront, AlertCircle, CheckCircle2, XCircle, Clock3 } from 'lucide-react';

export default function MyTestDrives() {
  const [testDrives, setTestDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState(null);

  // Cancellation modal state
  const [cancellingId, setCancellingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTestDrives = useCallback(async () => {
    try {
      setLoading(true);
      const data = await testDriveService.getMyTestDrives({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setTestDrives(data);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to load test drive bookings' });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchTestDrives();
  }, [fetchTestDrives]);

  const handleConfirmCancel = async () => {
    if (!cancellingId) return;
    try {
      setIsSubmitting(true);
      await testDriveService.cancelTestDrive(cancellingId);
      setTestDrives((prev) =>
        prev.map((td) => (td.id === cancellingId ? { ...td, status: 'Cancelled' } : td))
      );
      setToast({ type: 'success', message: 'Test drive booking cancelled successfully' });
      setCancellingId(null);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to cancel test drive';
      setToast({ type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 inline-flex items-center space-x-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center space-x-1">
            <Clock3 className="w-3.5 h-3.5" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-indigo-400" />
            <span>My Test Drive Bookings</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your scheduled dealership test drive appointments
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-2xl mb-8 border border-slate-800 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by vehicle name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm glass-input rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-48 py-2 px-3 glass-input rounded-xl text-sm text-slate-200 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {(search || statusFilter) && (
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
            }}
            className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
        </div>
      ) : testDrives.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 my-8">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-200">No Test Drive Appointments</h3>
          <p className="text-sm text-slate-400 mt-1 mb-4">
            {search || statusFilter
              ? 'No test drives match your search parameters.'
              : 'You have not booked any test drives yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testDrives.map((td) => (
            <div
              key={td.id}
              className="glass-card rounded-2xl border border-slate-800 p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-slate-500">Booking #{td.id}</span>
                  {getStatusBadge(td.status)}
                </div>

                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                    <CarFront className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{td.vehicle_name}</h3>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span><strong>Date:</strong> {td.booking_date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span><strong>Time:</strong> {td.booking_time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    <span><strong>Contact:</strong> {td.contact_number}</span>
                  </div>
                  {td.notes && (
                    <div className="text-slate-400 pt-1 border-t border-slate-800">
                      <strong>Notes:</strong> {td.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {(td.status === 'Pending' || td.status === 'Approved') && (
                <button
                  onClick={() => setCancellingId(td.id)}
                  className="w-full py-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl transition-all"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal for Cancellation */}
      {cancellingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-100">Cancel Test Drive?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to cancel your test drive appointment? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setCancellingId(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-500/20 transition-all"
              >
                {isSubmitting ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
