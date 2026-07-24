import React, { useState, useEffect, useCallback } from 'react';
import { vehicleService } from '../services/vehicleService';
import { useAuth } from '../context/AuthContext';
import SearchFilters from '../components/SearchFilters';
import VehicleCard from '../components/VehicleCard';
import VehicleModal from '../components/VehicleModal';
import RestockModal from '../components/RestockModal';
import { CustomerModal } from '../components/CustomerModal';
import { TestDriveModal } from '../components/TestDriveModal';
import Toast from '../components/Toast';
import { CarFront, Layers, PackageCheck, Plus, CheckCircle, Calendar } from 'lucide-react';

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const { isAdmin } = useAuth();

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await vehicleService.search(filters);
      setVehicles(data);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to load vehicle inventory' });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

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

  // Open Customer Purchase Modal (stock check guard)
  const handleOpenPurchaseModal = (v) => {
    if (v.quantity <= 0) return;
    setVehicleToPurchase(v);
    setIsCustomerModalOpen(true);
  };

  // Confirm Purchase with Customer Info
  const handleConfirmPurchase = async (customerData) => {
    if (!vehicleToPurchase || vehicleToPurchase.quantity <= 0) return;
    try {
      setPurchasingId(vehicleToPurchase.id);
      setIsCustomerModalOpen(false);
      const updatedVehicle = await vehicleService.purchase(vehicleToPurchase.id, customerData);
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicleToPurchase.id ? updatedVehicle : v))
      );
      setToast({
        type: 'success',
        message: `✓ Vehicle Purchased Successfully! ${updatedVehicle.make} ${updatedVehicle.model}`,
      });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Purchase failed';
      setToast({ type: 'error', message: msg });
    } finally {
      setPurchasingId(null);
      setVehicleToPurchase(null);
    }
  };

  // Open Test Drive Modal (stock check guard)
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

  // Aggregated Stats
  const totalVehicles = vehicles.length;
  const totalStockUnits = vehicles.reduce((sum, v) => sum + v.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center space-x-3">
            <CarFront className="w-8 h-8 text-blue-400" />
            <span>Vehicle Showroom Inventory</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse, search, and manage premium cars in Indian Rupees (₹) with real-time stock
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center space-x-2 shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        )}
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <CarFront className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Total Vehicle Models</p>
            <p className="text-2xl font-bold text-slate-100">{totalVehicles}</p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Total Units in Stock</p>
            <p className="text-2xl font-bold text-slate-100">{totalStockUnits}</p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Filter Matching</p>
            <p className="text-2xl font-bold text-slate-100">{vehicles.length} Listings</p>
          </div>
        </div>
      </div>

      {/* Multi-Filter Search Component */}
      <SearchFilters
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
      />

      {/* Inventory Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 my-8">
          <CarFront className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-200">No Vehicles Found</h3>
          <p className="text-sm text-slate-400 mt-1 mb-4">
            No cars match your search filters. Try clearing or adjusting your filter criteria.
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
