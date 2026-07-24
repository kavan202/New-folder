import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Calendar,
  Award,
  BarChart3,
  RefreshCw,
  CarFront,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { vehicleService } from '../services/vehicleService';

export default function AnalyticsPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await vehicleService.getAnalytics();
      setData(res);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 text-blue-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-sm font-semibold">Loading Business Analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
        <p className="font-bold">Error loading analytics:</p>
        <p>{error}</p>
        <button
          onClick={loadAnalytics}
          className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    total_purchases = 0,
    total_test_drives = 0,
    most_purchased_vehicle = 'No purchase records available.',
    most_test_driven_vehicle = 'No test drive records available.',
    vehicle_purchase_counts = [],
    vehicle_test_drive_counts = [],
  } = data || {};

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center space-x-2">
            <BarChart3 className="w-7 h-7 text-blue-400" />
            <span>Business Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time purchase and test drive metrics directly from inventory database.
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          className="self-start md:self-auto flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-blue-400" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Item 5: 4 Summary Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Purchases */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Purchases</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-100 mt-3">{total_purchases}</p>
          <span className="text-[11px] text-slate-500">Purchases completed</span>
        </div>

        {/* Card 2: Total Test Drives */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Test Drives</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-100 mt-3">{total_test_drives}</p>
          <span className="text-[11px] text-slate-500">Bookings scheduled</span>
        </div>

        {/* Card 3: Most Purchased Vehicle */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Most Purchased Vehicle</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-base font-bold text-amber-300 mt-3 truncate">{most_purchased_vehicle}</p>
          <span className="text-[11px] text-slate-500">Top selling model</span>
        </div>

        {/* Card 4: Most Test Driven Vehicle */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Most Test Driven Vehicle</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CarFront className="w-5 h-5" />
            </div>
          </div>
          <p className="text-base font-bold text-indigo-300 mt-3 truncate">{most_test_driven_vehicle}</p>
          <span className="text-[11px] text-slate-500">Most requested for drive</span>
        </div>
      </div>

      {/* Item 4: Vehicle-wise Purchase Count & Test Drive Count Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purchase Count List */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-blue-400" />
            <span>Vehicle-wise Purchase Count</span>
          </h3>

          {vehicle_purchase_counts.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              No purchase records available.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {vehicle_purchase_counts.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-sm"
                >
                  <span className="font-semibold text-slate-200">{item.name}</span>
                  <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 text-xs">
                    Purchased: {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test Drive Count List */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <span>Vehicle-wise Test Drive Count</span>
          </h3>

          {vehicle_test_drive_counts.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              No test drive records available.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {vehicle_test_drive_counts.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-sm"
                >
                  <span className="font-semibold text-slate-200">{item.name}</span>
                  <span className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20 text-xs">
                    Test Drives: {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Item 6: Simple Bar Charts (Only 2 Bar Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Vehicle Purchase Count (Bar Chart) */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span>Chart 1: Vehicle Purchase Count (Bar Chart)</span>
          </h3>
          {vehicle_purchase_counts.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
              No purchase records available.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vehicle_purchase_counts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                    formatter={(val) => [`${val} purchases`, 'Purchased']}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Vehicle Test Drive Count (Bar Chart) */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span>Chart 2: Vehicle Test Drive Count (Bar Chart)</span>
          </h3>
          {vehicle_test_drive_counts.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
              No test drive records available.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vehicle_test_drive_counts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                    formatter={(val) => [`${val} test drives`, 'Test Drives']}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
