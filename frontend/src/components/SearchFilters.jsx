import React from 'react';
import { Search, Filter, RefreshCw, Tag, CarFront, Palette, Fuel } from 'lucide-react';

export default function SearchFilters({ filters, setFilters, onReset }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const categories = ['Sedan', 'SUV', 'Truck', 'Electric', 'Coupe', 'Luxury', 'Sports', 'Convertible', 'Hatchback', 'Performance'];
  const fuelTypes = ['Petrol', 'Power Petrol', 'Diesel', 'EV', 'Hybrid'];

  return (
    <div className="glass-card p-5 rounded-2xl mb-8 border border-slate-800 shadow-xl animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-semibold text-slate-200">Search & Filter Inventory</h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* Make search */}
        <div className="relative">
          <CarFront className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            name="make"
            value={filters.make || ''}
            onChange={handleChange}
            placeholder="Make (e.g. Tesla)"
            className="w-full pl-9 pr-3 py-2 text-sm glass-input rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Model search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            name="model"
            value={filters.model || ''}
            onChange={handleChange}
            placeholder="Model (e.g. Camry)"
            className="w-full pl-9 pr-3 py-2 text-sm glass-input rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Category dropdown */}
        <div className="relative">
          <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <select
            name="category"
            value={filters.category || ''}
            onChange={handleChange}
            className="w-full pl-9 pr-3 py-2 text-sm glass-input rounded-xl text-slate-200 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="" className="bg-slate-900 text-slate-400">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Color search */}
        <div className="relative">
          <Palette className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            name="color"
            value={filters.color || ''}
            onChange={handleChange}
            placeholder="Color (e.g. Black)"
            className="w-full pl-9 pr-3 py-2 text-sm glass-input rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Fuel Type dropdown */}
        <div className="relative">
          <Fuel className="w-4 h-4 absolute left-3 top-3 text-blue-400" />
          <select
            name="fuel_type"
            value={filters.fuel_type || ''}
            onChange={handleChange}
            className="w-full pl-9 pr-3 py-2 text-sm glass-input rounded-xl text-slate-200 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="" className="bg-slate-900 text-slate-400">All Fuel Types</option>
            {fuelTypes.map((fuel) => (
              <option key={fuel} value={fuel} className="bg-slate-900 text-slate-200">
                {fuel}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price (₹) */}
        <div className="relative">
          <span className="absolute left-3.5 top-2 text-slate-400 text-sm font-bold">₹</span>
          <input
            type="number"
            name="min_price"
            value={filters.min_price || ''}
            onChange={handleChange}
            placeholder="Min Price (₹)"
            className="w-full pl-8 pr-3 py-2 text-sm glass-input rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Max Price (₹) */}
        <div className="relative">
          <span className="absolute left-3.5 top-2 text-slate-400 text-sm font-bold">₹</span>
          <input
            type="number"
            name="max_price"
            value={filters.max_price || ''}
            onChange={handleChange}
            placeholder="Max Price (₹)"
            className="w-full pl-8 pr-3 py-2 text-sm glass-input rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}