import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import { orderService } from '../services/orderService';
import { testDriveService } from '../services/testDriveService';
import { useAuth } from '../context/AuthContext';
import VehicleModal from '../components/VehicleModal';
import RestockModal from '../components/RestockModal';
import RegisterAdminModal from '../components/RegisterAdminModal';
import Toast from '../components/Toast';
import { formatINR, toProperCase } from '../utils/formatters';
import {
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  PlusCircle,
  Search,
  CarFront,
  AlertTriangle,
  UserPlus,
  ArrowUp,
  ArrowDown,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock3,
  Filter,
} from 'lucide-react';

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders' | 'testdrives'
  const [toast, setToast] = useState(null);

  // --- TAB 1: INVENTORY STATE ---
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [stockSortOrder, setStockSortOrder] = useState('asc');

  // Inventory Modals
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockVehicle, setRestockVehicle] = useState(null);
  const [isRegisterAdminModalOpen, setIsRegisterAdminModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- TAB 2: ORDERS STATE ---
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderDateFilter, setOrderDateFilter] = useState('');

  // --- TAB 3: TEST DRIVES STATE ---
  const [testDrives, setTestDrives] = useState([]);
  const [loadingTestDrives, setLoadingTestDrives] = useState(false);
  const [tdSearch, setTdSearch] = useState('');
  const [tdStatusFilter, setTdStatusFilter] = useState('');
  const [tdDateFilter, setTdDateFilter] = useState('');

  // Check admin role
  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  // Fetch Inventory
  const fetchVehicles = useCallback(async () => {
    try {
      setLoadingVehicles(true);
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to fetch inventory' });
    } finally {
      setLoadingVehicles(false);
    }
  }, []);

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const data = await orderService.getAllOrders({
        search: orderSearch || undefined,
        date: orderDateFilter || undefined,
      });
      setOrders(data);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to fetch purchase orders' });
    } finally {
      setLoadingOrders(false);
    }
  }, [orderSearch, orderDateFilter]);

  // Fetch Test Drives
  const fetchTestDrives = useCallback(async () => {
    try {
      setLoadingTestDrives(true);
      const data = await testDriveService.getAllTestDrives({
        search: tdSearch || undefined,
        status: tdStatusFilter || undefined,
        date: tdDateFilter || undefined,
      });
      setTestDrives(data);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to fetch test drive requests' });
    } finally {
      setLoadingTestDrives(false);
    }
  }, [tdSearch, tdStatusFilter, tdDateFilter]);

  useEffect(() => {
    if (activeTab === 'inventory') fetchVehicles();
    else if (activeTab === 'orders') fetchOrders();
    else if (activeTab === 'testdrives') fetchTestDrives();
  }, [activeTab, fetchVehicles, fetchOrders, fetchTestDrives]);

  // --- INVENTORY ACTIONS ---
  const handleOpenAddModal = () => {
    setSelectedVehicle(null);
    setIsVehicleModalOpen(true);
  };

  const handleOpenEditModal = (v) => {
    setSelectedVehicle(v);
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = async (formData) => {
    try {
      setIsSubmitting(true);
      if (selectedVehicle) {
        await vehicleService.update(selectedVehicle.id, formData);
        setToast({ type: 'success', message: `Updated ${formData.make} ${formData.model}` });
      } else {
        await vehicleService.create(formData);
        setToast({ type: 'success', message: `Added ${formData.make} ${formData.model} to inventory` });
      }
      setIsVehicleModalOpen(false);
      fetchVehicles();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Error saving vehicle';
      setToast({ type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${name}?`)) return;
    try {
      await vehicleService.delete(id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      setToast({ type: 'success', message: `${name} deleted successfully` });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete vehicle' });
    }
  };

  const handleOpenRestockModal = (v) => {
    setRestockVehicle(v);
    setIsRestockModalOpen(true);
  };

  const handleRestockSubmit = async (id, qty) => {
    try {
      setIsSubmitting(true);
      const updated = await vehicleService.restock(id, qty);
      setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
      setToast({ type: 'success', message: `Restocked ${updated.make} ${updated.model}. New Stock: ${updated.quantity}` });
      setIsRestockModalOpen(false);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to restock vehicle' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- TEST DRIVE STATUS ACTIONS ---
  const handleApproveTestDrive = async (id) => {
    try {
      await testDriveService.approveTestDrive(id);
      setToast({ type: 'success', message: 'Test Drive appointment Approved' });
      fetchTestDrives();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to approve test drive' });
    }
  };

  const handleCancelTestDrive = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this test drive booking?')) return;
    try {
      await testDriveService.cancelTestDrive(id);
      setToast({ type: 'success', message: 'Test Drive appointment Cancelled' });
      fetchTestDrives();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to cancel test drive' });
    }
  };

  const handleCompleteTestDrive = async (id) => {
    try {
      await testDriveService.completeTestDrive(id);
      setToast({ type: 'success', message: 'Test Drive marked as Completed' });
      fetchTestDrives();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to complete test drive' });
    }
  };

  // Filtered inventory list
  const filteredVehicles = vehicles
    .filter(
      (v) =>
        v.make.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
        v.model.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
        v.category.toLowerCase().includes(vehicleSearch.toLowerCase())
    )
    .sort((a, b) => {
      if (stockSortOrder === 'asc') return a.quantity - b.quantity;
      return b.quantity - a.quantity;
    });

  const getTdStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Approved
          </span>
        );
      case 'Completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center space-x-3">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
            <span>Admin Management Center</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Centralized control over showroom inventory, user purchase orders, and test drive bookings
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsRegisterAdminModalOpen(true)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all hover:bg-slate-800"
          >
            <UserPlus className="w-4 h-4 text-indigo-400" />
            <span>Register Admin</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Vehicle</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'inventory'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CarFront className="w-4 h-4" />
          <span>Inventory Catalog ({vehicles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>All Purchase Orders</span>
        </button>

        <button
          onClick={() => setActiveTab('testdrives')}
          className={`px-5 py-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'testdrives'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Test Drive Requests</span>
        </button>
      </div>

      {/* TAB 1: INVENTORY CATALOG */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search catalog by Make, Model, or Category..."
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm glass-input rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setStockSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <span>Sort Stock</span>
              {stockSortOrder === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-400" /> : <ArrowDown className="w-4 h-4 text-blue-400" />}
            </button>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-6">Vehicle</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Color</th>
                    <th className="py-4 px-6">Fuel Type</th>
                    <th className="py-4 px-6">Price (₹)</th>
                    <th className="py-4 px-6">Stock Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loadingVehicles ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                      </td>
                    </tr>
                  ) : filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-slate-500">
                        No vehicle records matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredVehicles.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-900/50 transition-colors group">
                        <td className="py-4 px-6 font-bold text-slate-100 flex items-center space-x-3">
                          <CarFront className="w-5 h-5 text-blue-400" />
                          <div>
                            <div>{v.make} {v.model}</div>
                            <div className="text-[10px] font-mono text-slate-500">ID #{v.id}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium">
                            {v.category}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-300">
                          {toProperCase(v.color || 'Midnight Black')}
                        </td>
                        <td className="py-4 px-6 font-medium text-blue-300">
                          {v.fuel_type || 'Hybrid'}
                        </td>
                        <td className="py-4 px-6 font-extrabold text-slate-100">
                          {formatINR(v.price)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1 border ${
                              v.quantity === 0
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : v.quantity <= 3
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            {v.quantity === 0 ? (
                              <>
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                <span>Out of Stock</span>
                              </>
                            ) : (
                              <span>{v.quantity} Units</span>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleOpenRestockModal(v)}
                              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                              title="Restock Inventory"
                            >
                              <PlusCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(v)}
                              className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                              title="Edit Record"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVehicle(v.id, `${v.make} ${v.model}`)}
                              className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL PURCHASE ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders by vehicle make/model..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm glass-input rounded-xl text-slate-200 focus:outline-none"
              />
            </div>

            <div className="relative w-full md:w-64">
              <input
                type="date"
                value={orderDateFilter}
                onChange={(e) => setOrderDateFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm glass-input rounded-xl text-slate-200 focus:outline-none"
              />
            </div>

            {(orderSearch || orderDateFilter) && (
              <button
                onClick={() => {
                  setOrderSearch('');
                  setOrderDateFilter('');
                }}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 rounded-xl"
              >
                Clear
              </button>
            )}
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-6">Order ID</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Vehicle Purchased</th>
                    <th className="py-4 px-6">Qty</th>
                    <th className="py-4 px-6">Total Amount (₹)</th>
                    <th className="py-4 px-6">Date & Time</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loadingOrders ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-slate-500">
                        No purchase orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs font-bold text-slate-400">
                          #{o.id}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-200">
                          <div>{o.user_username || `User #${o.user_id}`}</div>
                          <div className="text-[10px] text-slate-500">{o.user_email}</div>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-100">
                          {o.vehicle_make} {o.vehicle_model}
                        </td>
                        <td className="py-4 px-6 text-slate-300 font-semibold">
                          {o.quantity_purchased}
                        </td>
                        <td className="py-4 px-6 font-extrabold text-emerald-400">
                          {formatINR(o.purchase_price)}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-400">
                          {new Date(o.created_at).toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEST DRIVE REQUESTS */}
      {activeTab === 'testdrives' && (
        <div className="space-y-6">
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by vehicle name or contact phone..."
                value={tdSearch}
                onChange={(e) => setTdSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm glass-input rounded-xl text-slate-200 focus:outline-none"
              />
            </div>

            <select
              value={tdStatusFilter}
              onChange={(e) => setTdStatusFilter(e.target.value)}
              className="w-full md:w-44 py-2 px-3 glass-input rounded-xl text-sm text-slate-200 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <input
              type="date"
              value={tdDateFilter}
              onChange={(e) => setTdDateFilter(e.target.value)}
              className="w-full md:w-48 px-3 py-2 text-sm glass-input rounded-xl text-slate-200 focus:outline-none"
            />

            {(tdSearch || tdStatusFilter || tdDateFilter) && (
              <button
                onClick={() => {
                  setTdSearch('');
                  setTdStatusFilter('');
                  setTdDateFilter('');
                }}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 rounded-xl"
              >
                Clear
              </button>
            )}
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">User / Contact</th>
                    <th className="py-4 px-6">Vehicle</th>
                    <th className="py-4 px-6">Date & Time Slot</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loadingTestDrives ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                      </td>
                    </tr>
                  ) : testDrives.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-slate-500">
                        No test drive requests found.
                      </td>
                    </tr>
                  ) : (
                    testDrives.map((td) => (
                      <tr key={td.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs font-bold text-slate-400">
                          #{td.id}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-200">
                            {td.user_username || `User #${td.user_id}`}
                          </div>
                          <div className="text-xs text-indigo-400">📞 {td.contact_number}</div>
                          {td.notes && (
                            <div className="text-[11px] text-slate-400 italic max-w-xs truncate">
                              "{td.notes}"
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-100">
                          {td.vehicle_name}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-300">
                          <div className="font-bold text-slate-200">{td.booking_date}</div>
                          <div className="text-slate-400">⏰ {td.booking_time}</div>
                        </td>
                        <td className="py-4 px-6">
                          {getTdStatusBadge(td.status)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {td.status === 'Pending' && (
                              <button
                                onClick={() => handleApproveTestDrive(td.id)}
                                className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            {(td.status === 'Pending' || td.status === 'Approved') && (
                              <>
                                <button
                                  onClick={() => handleCompleteTestDrive(td.id)}
                                  className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-lg transition-colors"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => handleCancelTestDrive(td.id)}
                                  className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-lg transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSave={handleSaveVehicle}
        vehicle={selectedVehicle}
        isSubmitting={isSubmitting}
      />

      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        onRestock={handleRestockSubmit}
        vehicle={restockVehicle}
        isSubmitting={isSubmitting}
      />

      <RegisterAdminModal
        isOpen={isRegisterAdminModalOpen}
        onClose={() => setIsRegisterAdminModalOpen(false)}
        onSuccess={() => setToast({ type: 'success', message: 'New Administrator registered successfully' })}
      />
    </div>
  );
}
