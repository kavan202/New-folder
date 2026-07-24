import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import { useAuth } from '../context/AuthContext';
import VehicleModal from '../components/VehicleModal';
import RestockModal from '../components/RestockModal';
import RegisterAdminModal from '../components/RegisterAdminModal';
import Toast from '../components/Toast';
import { formatINR, toProperCase } from '../utils/formatters';
import { ShieldCheck, Plus, Edit, Trash2, PlusCircle, Search, CarFront, AlertTriangle, UserPlus, ArrowUp, ArrowDown } from 'lucide-react';

export default function AdminPanel() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockSortOrder, setStockSortOrder] = useState('asc');

  // Modals state
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockVehicle, setRestockVehicle] = useState(null);
  const [isRegisterAdminModalOpen, setIsRegisterAdminModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState(null);

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchVehicles();
  }, [isAdmin, navigate]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to fetch inventory' });
    } finally {
      setLoading(false);
    }
  };

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

  const filteredVehicles = vehicles
    .filter(
      (v) =>
        v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.color && v.color.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.fuel_type && v.fuel_type.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (stockSortOrder === 'asc') return a.quantity - b.quantity;
      return b.quantity - a.quantity;
    });

  const toggleSortOrder = () => {
    setStockSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center space-x-3">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
            <span>Admin Management Center</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Full administrative control over showroom inventory catalog and staff privileges
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

      {/* Search & Sort Header */}
      <div className="glass-card p-4 rounded-2xl mb-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search catalog by Make, Model, Category, Color, or Fuel Type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm glass-input rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <button
          onClick={toggleSortOrder}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <span>Sort Stock Status</span>
          {stockSortOrder === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-400" /> : <ArrowDown className="w-4 h-4 text-blue-400" />}
        </button>
      </div>

      {/* Table Container */}
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
              {loading ? (
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
                      <CarFront className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
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
