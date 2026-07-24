import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import { orderService } from '../services/orderService';
import { testDriveService } from '../services/testDriveService';
import { useAuth } from '../context/AuthContext';
import SearchFilters from '../components/SearchFilters';
import VehicleCard from '../components/VehicleCard';
import VehicleModal from '../components/VehicleModal';
import RestockModal from '../components/RestockModal';
import { CustomerModal } from '../components/CustomerModal';
import { TestDriveModal } from '../components/TestDriveModal';
import Toast from '../components/Toast';
import { formatINR } from '../utils/formatters';
import {
  CarFront,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  Plus,
  ArrowRight,
  Sparkles,
  Clock3,
} from 'lucide-react';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  // User Stats & Recent Activity State
  const [myPurchases, setMyPurchases] = useState([]);
  const [myTestDrives, setMyTestDrives] = useState([]);

  const [filters, setFilters] = useState({
    make: '',
    model: '',
    category: '',
    color: '',
    fuel_type: '',
    min_price: '',
    max_price: '',
  });

  const [toast, setToast] = useState(null);
  const [purchasingId, setPurchasingId] = useState(null);

  // Customer & Purchase Modal State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [vehicleToPurchase, setVehicleToPurchase] = useState(null);

  // Test Drive Modal State
  const [isTestDriveModalOpen, setIsTestDriveModalOpen] = useState(false);
  const [vehicleForTestDrive, setVehicleForTestDrive] = useState(null);

  // Admin Modals
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockVehicle, setRestockVehicle] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Vehicles
  const fetchVehicles = useCallback(async () => {
    try {
      setLoadingVehicles(true);
      const data = await vehicleService.search(filters);
      setVehicles(data);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to load vehicle inventory' });
    } finally {
      setLoadingVehicles(false);
    }
  }, [filters]);

  // Fetch User Orders & Test Drives
  const fetchUserMetrics = useCallback(async () => {
    try {
      const [purchasesData, testDrivesData] = await Promise.all([
        orderService.getMyOrders(),
        testDriveService.getMyTestDrives(),
      ]);
      setMyPurchases(purchasesData);
      setMyTestDrives(testDrivesData);
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
    fetchUserMetrics();
  }, [fetchVehicles, fetchUserMetrics]);

  const handleResetFilters = () => {
    setFilters({
      make: '',
      model: '',
      category: '',
      color: '',
      fuel_type: '',
      min_price: '',
      max_price: '',
    });
  };

  // Open Customer Purchase Modal
  const handleOpenPurchaseModal = (v) => {
    if (v.quantity <= 0) return;
    setVehicleToPurchase(v);
    setIsCustomerModalOpen(true);
  };

  // Confirm Purchase
  const handleConfirmPurchase = async (customerData) => {
    if (!vehicleToPurchase || vehicleToPurchase.quantity <= 0) return;
    try {
      setPurchasingId(vehicleToPurchase.id);
      setIsCustomerModalOpen(false);
      await vehicleService.purchase(vehicleToPurchase.id, customerData);
      
      setToast({
        type: 'success',
        message: `✓ Purchase Order Created Successfully! ${vehicleToPurchase.make} ${vehicleToPurchase.model}`,
      });
      fetchVehicles();
      fetchUserMetrics();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Purchase failed';
      setToast({ type: 'error', message: msg });
    } finally {
      setPurchasingId(null);
      setVehicleToPurchase(null);
    }
  };

  // Open Test Drive Modal
  const handleOpenTestDriveModal = (v) => {
    if (v.quantity <= 0) return;
    setVehicleForTestDrive(v);
    setIsTestDriveModalOpen(true);
  };

  // Confirm Test Drive Booking
  const handleConfirmTestDrive = async (testDriveData) => {
    if (!vehicleForTestDrive || vehicleForTestDrive.quantity <= 0) return;
    try {
      setIsTestDriveModalOpen(false);
      await vehicleService.bookTestDrive(testDriveData);
      setToast({
        type: 'success',
        message: `✓ Test Drive Booked Successfully! ${vehicleForTestDrive.make} ${vehicleForTestDrive.model}`,
      });
      fetchUserMetrics();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Test drive booking failed';
      setToast({ type: 'error', message: msg });
    } finally {
      setVehicleForTestDrive(null);
    }
  };

  // Admin Actions
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
        setToast({ type: 'success', message: 'Vehicle updated successfully' });
      } else {
        await vehicleService.create(formData);
        setToast({ type: 'success', message: 'Vehicle created successfully' });
      }
      setIsVehicleModalOpen(false);
      fetchVehicles();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save vehicle';
      setToast({ type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle from inventory?')) return;
    try {
      await vehicleService.delete(id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      setToast({ type: 'success', message: 'Vehicle deleted from inventory' });
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
      setToast({
        type: 'success',
        message: `Restocked ${updated.make} ${updated.model}. New quantity: ${updated.quantity}`,
      });
      setIsRestockModalOpen(false);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to restock vehicle' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Metrics
  const totalPurchasesCount = myPurchases.length;
  const upcomingTestDrivesCount = myTestDrives.filter(
    (td) => td.status === 'Pending' || td.status === 'Approved'
  ).length;
  const completedTestDrivesCount = myTestDrives.filter(
    (td) => td.status === 'Completed'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Toast Notifications */}
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* Header & Quick Action Banner */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Welcome Back, {user?.username}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">AutoVault Control Center</h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Browse current showroom vehicles, manage your test drive appointments, and review past vehicle purchases in Indian Rupees (₹).
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#showroom"
              className="px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all"
            >
              <CarFront className="w-4 h-4" />
              <span>Browse Vehicles</span>
            </a>

            <Link
              to="/purchases"
              className="px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>My Purchases</span>
            </Link>

            <Link
              to="/test-drives"
              className="px-4 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>My Test Drives</span>
            </Link>

            {isAdmin && (
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Dashboard Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Purchases</p>
            <p className="text-2xl font-black text-slate-100">{totalPurchasesCount}</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Clock3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Upcoming Test Drives</p>
            <p className="text-2xl font-black text-slate-100">{upcomingTestDrivesCount}</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Completed Test Drives</p>
            <p className="text-2xl font-black text-slate-100">{completedTestDrivesCount}</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <CarFront className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Showroom Models</p>
            <p className="text-2xl font-black text-slate-100">{vehicles.length}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Preview */}
      {myPurchases.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <span>Recent Orders</span>
            </h3>
            <Link
              to="/purchases"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <span>View All Purchases</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myPurchases.slice(0, 2).map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">
                    {order.vehicle_make} {order.vehicle_model}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Order #{order.id} • {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-blue-400">
                    {formatINR(order.purchase_price)}
                  </p>
                  <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehicle Showroom Section */}
      <div id="showroom" className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-slate-100 flex items-center space-x-3">
            <CarFront className="w-7 h-7 text-blue-400" />
            <span>Vehicle Showroom Inventory</span>
          </h2>
          <span className="text-xs text-slate-400">
            {vehicles.length} Models Available
          </span>
        </div>

        {/* Search & Filters */}
        <SearchFilters
          filters={filters}
          setFilters={setFilters}
          onReset={handleResetFilters}
        />

        {/* Inventory Grid */}
        {loadingVehicles ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-slate-800">
            <CarFront className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-200">No Vehicles Found</h3>
            <p className="text-sm text-slate-400 mt-1 mb-4">
              No cars match your search filters. Try adjusting your search criteria.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                onPurchase={handleOpenPurchaseModal}
                onBookTestDrive={handleOpenTestDriveModal}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteVehicle}
                onRestock={handleOpenRestockModal}
                isAdmin={isAdmin}
                purchasingId={purchasingId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Customer Purchase Modal */}
      <CustomerModal
        vehicle={vehicleToPurchase}
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onConfirmPurchase={handleConfirmPurchase}
      />

      {/* Test Drive Booking Modal */}
      <TestDriveModal
        vehicle={vehicleForTestDrive}
        isOpen={isTestDriveModalOpen}
        onClose={() => setIsTestDriveModalOpen(false)}
        onConfirmTestDrive={handleConfirmTestDrive}
      />

      {/* Add / Edit Vehicle Modal (Admin) */}
      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSave={handleSaveVehicle}
        vehicle={selectedVehicle}
        isSubmitting={isSubmitting}
      />

      {/* Restock Inventory Modal (Admin) */}
      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        onRestock={handleRestockSubmit}
        vehicle={restockVehicle}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
