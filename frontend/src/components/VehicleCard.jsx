import React from 'react';
import { ShoppingCart, Calendar, Edit, Trash2, PlusCircle, CheckCircle2, AlertTriangle, XCircle, Tag, Palette, Fuel } from 'lucide-react';
import { formatINR, getVehicleImage, toProperCase } from '../utils/formatters';

export default function VehicleCard({
  vehicle,
  onPurchase,
  onBookTestDrive,
  onEdit,
  onDelete,
  onRestock,
  isAdmin,
  purchasingId,
}) {
  const isOutOfStock = vehicle.quantity === 0;
  const isLowStock = vehicle.quantity > 0 && vehicle.quantity <= 3;
  const isPurchasing = purchasingId === vehicle.id;
  const vehicleImageUrl = getVehicleImage(vehicle);

  return (
    <div className="glass-card rounded-3xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 group relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />

      <div>
        {/* Vehicle Image Container */}
        <div className="relative w-full h-44 mb-4 rounded-2xl overflow-hidden bg-slate-900/80 border border-slate-800">
          <img
            src={vehicleImageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Stock Pill Badge */}
          <div className="absolute top-3 right-3">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 border backdrop-blur-md ${
                isOutOfStock
                  ? 'bg-rose-950/80 text-rose-400 border-rose-500/30'
                  : isLowStock
                  ? 'bg-amber-950/80 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {isOutOfStock ? (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  <span>Out of Stock</span>
                </>
              ) : isLowStock ? (
                <>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  <span>Only {vehicle.quantity} left</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  <span>In Stock ({vehicle.quantity})</span>
                </>
              )}
            </span>
          </div>

          {/* Category Badge */}
          <div className="absolute bottom-3 left-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-950/80 text-blue-400 border border-blue-500/30 backdrop-blur-md flex items-center">
              <Tag className="w-3 h-3 mr-1" />
              {vehicle.category}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
          {vehicle.make} <span className="font-light text-slate-400">{vehicle.model}</span>
        </h3>

        {/* Price in ₹ */}
        <div className="mt-2 mb-3">
          <span className="text-2xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            {formatINR(vehicle.price)}
          </span>
        </div>

        {/* Color and Fuel Type Details */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
          <div>
            <div className="text-slate-500 flex items-center space-x-1 font-medium mb-0.5">
              <Palette className="w-3 h-3 text-slate-400" />
              <span>Color:</span>
            </div>
            <div className="text-slate-200 font-semibold truncate pl-4">
              {toProperCase(vehicle.color || 'Midnight Black')}
            </div>
          </div>
          <div>
            <div className="text-slate-500 flex items-center space-x-1 font-medium mb-0.5">
              <Fuel className="w-3 h-3 text-blue-400" />
              <span>Fuel:</span>
            </div>
            <div className="text-blue-300 font-semibold truncate pl-4">
              {vehicle.fuel_type || 'Hybrid'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Row: 2 Equal Width Buttons */}
      <div className="space-y-3 pt-3 border-t border-slate-800/80">
        <div className="grid grid-cols-2 gap-3 w-full">
          {/* Purchase Vehicle Button */}
          <button
            onClick={() => !isOutOfStock && onPurchase(vehicle)}
            disabled={isOutOfStock || isPurchasing}
            className={`w-full h-10 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-md ${
              isOutOfStock
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="truncate">{isPurchasing ? 'Processing...' : isOutOfStock ? 'Out of Stock' : 'Purchase Vehicle'}</span>
          </button>

          {/* Book Test Drive Button (Disabled when stock = 0) */}
          <button
            onClick={() => !isOutOfStock && onBookTestDrive(vehicle)}
            disabled={isOutOfStock}
            className={`w-full h-10 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md transition-all ${
              isOutOfStock
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 hover:border-blue-500/50 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <Calendar className={`w-3.5 h-3.5 ${isOutOfStock ? 'text-slate-500' : 'text-indigo-400'}`} />
            <span className="truncate">{isOutOfStock ? 'Book Test Drive (Disabled)' : 'Book Test Drive'}</span>
          </button>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/50">
            <button
              onClick={() => onRestock(vehicle)}
              className="py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
              title="Restock Inventory"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Restock</span>
            </button>

            <button
              onClick={() => onEdit(vehicle)}
              className="py-1.5 px-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
              title="Edit Vehicle"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => onDelete(vehicle.id)}
              className="py-1.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
              title="Delete Vehicle"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
