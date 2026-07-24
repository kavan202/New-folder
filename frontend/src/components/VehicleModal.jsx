import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, CarFront, Upload, Image as ImageIcon, Palette, Fuel, DollarSign } from 'lucide-react';
import { vehicleService } from '../services/vehicleService';
import { getVehicleImage, toProperCase } from '../utils/formatters';

export default function VehicleModal({ isOpen, onClose, onSave, vehicle, isSubmitting }) {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    category: 'Sedan',
    color: 'Midnight Black',
    fuel_type: 'Hybrid',
    price: '',
    quantity: '',
    image_url: '',
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');

  const categories = ['Sedan', 'SUV', 'Truck', 'Electric', 'Coupe', 'Luxury', 'Sports', 'Convertible', 'Hatchback', 'Performance'];
  const fuelTypes = ['Petrol', 'Power Petrol', 'Diesel', 'EV', 'Hybrid'];

  useEffect(() => {
    if (vehicle) {
      setFormData({
        make: vehicle.make || '',
        model: vehicle.model || '',
        category: vehicle.category || 'Sedan',
        color: toProperCase(vehicle.color || 'Midnight Black'),
        fuel_type: vehicle.fuel_type || 'Hybrid',
        price: vehicle.price || '',
        quantity: vehicle.quantity !== undefined ? vehicle.quantity : '',
        image_url: vehicle.image_url || '',
      });
      setPreviewImage(getVehicleImage(vehicle));
    } else {
      setFormData({
        make: '',
        model: '',
        category: 'Sedan',
        color: 'Midnight Black',
        fuel_type: 'Hybrid',
        price: '',
        quantity: '',
        image_url: '',
      });
      setPreviewImage(null);
    }
    setImageError('');
  }, [vehicle, isOpen]);

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

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageError('');
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError('Only JPG, JPEG, PNG, and WEBP formats are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('File size exceeds maximum limit of 5MB.');
      return;
    }

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);

    try {
      setUploadingImage(true);
      const res = await vehicleService.uploadImage(file);
      setFormData((prev) => ({ ...prev, image_url: res.image_url }));
    } catch (err) {
      setImageError(err.response?.data?.detail || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      color: toProperCase(formData.color),
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity, 10),
    });
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
        background: 'rgba(0,0,0,0.7)',
        zIndex: 9998,
      }}
      className="p-4 backdrop-blur-md animate-fade-in"
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '700px',
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        className="glass-card rounded-3xl border border-slate-800 shadow-2xl p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center space-x-2">
          <CarFront className="w-6 h-6 text-blue-400" />
          <span>{vehicle ? 'Edit Vehicle Details' : 'Add New Vehicle'}</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Vehicle Image (JPG, JPEG, PNG, WEBP - Max 5MB)
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-32 h-24 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden relative">
                {previewImage ? (
                  <img src={previewImage} alt="Vehicle Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-600" />
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-xs text-blue-400 font-semibold">
                    Uploading...
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>{uploadingImage ? 'Uploading...' : 'Choose Image File'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
                {imageError && <p className="mt-1 text-xs text-red-400">{imageError}</p>}
                <p className="mt-1 text-[11px] text-slate-500">
                  If no image is uploaded, a category default image will be assigned automatically.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Make</label>
              <input
                type="text"
                required
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                placeholder="e.g. Porsche"
                className="w-full px-3 py-2 text-sm glass-input rounded-xl text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Model</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g. 911 GT3 RS"
                className="w-full px-3 py-2 text-sm glass-input rounded-xl text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm glass-input rounded-xl text-slate-100 focus:outline-none bg-slate-900 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Color</label>
              <input
                type="text"
                required
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="e.g. Guards Red"
                className="w-full px-3 py-2 text-sm glass-input rounded-xl text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fuel Type</label>
              <select
                value={formData.fuel_type}
                onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                className="w-full px-3 py-2 text-sm glass-input rounded-xl text-slate-100 focus:outline-none bg-slate-900 cursor-pointer"
              >
                {fuelTypes.map((fuel) => (
                  <option key={fuel} value={fuel}>
                    {fuel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Price (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 12500000"
                  className="w-full pl-8 pr-3 py-2 text-sm glass-input rounded-xl text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Quantity</label>
              <input
                type="number"
                min="0"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="e.g. 5"
                className="w-full px-3 py-2 text-sm glass-input rounded-xl text-slate-100 focus:outline-none"
              />
            </div>
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
              disabled={isSubmitting || uploadingImage}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-md shadow-blue-500/20"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : vehicle ? 'Update Vehicle' : 'Add Vehicle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
