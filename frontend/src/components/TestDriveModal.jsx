import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Calendar, User, Phone, Mail, CheckCircle } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export function TestDriveModal({ vehicle, isOpen, onClose, onConfirmTestDrive }) {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  if (!isOpen || !vehicle) return null;

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) {
      errs.fullName = 'Full Name is required';
    }
    const phoneRegex = /^\d{10}$/;
    if (!mobileNumber.trim()) {
      errs.mobileNumber = 'Mobile Number is required';
    } else if (!phoneRegex.test(mobileNumber.trim())) {
      errs.mobileNumber = 'Mobile must contain exactly 10 digits';
    }
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errs.email = 'Please enter a valid email address';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onConfirmTestDrive({
        vehicle_id: vehicle.id,
        customer_name: fullName.trim(),
        customer_phone: mobileNumber.trim(),
        customer_email: email.trim() || undefined,
      });
      // Reset
      setFullName('');
      setMobileNumber('');
      setEmail('');
      setErrors({});
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Book Test Drive</h2>
              <p className="text-xs text-slate-400">
                {vehicle.make} {vehicle.model}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-slate-200 text-xs leading-relaxed">
            Are you sure you want to book a test drive for{' '}
            <strong className="text-indigo-400">{vehicle.make} {vehicle.model}</strong>?
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Full Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Rahul Verma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border ${
                  errors.fullName ? 'border-red-500/80' : 'border-slate-800'
                } rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 transition-all`}
              />
            </div>
            {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Mobile Number <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border ${
                  errors.mobileNumber ? 'border-red-500/80' : 'border-slate-800'
                } rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 transition-all`}
              />
            </div>
            {errors.mobileNumber && <p className="mt-1 text-xs text-red-400">{errors.mobileNumber}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address <span className="text-slate-500">(Optional)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border ${
                  errors.email ? 'border-red-500/80' : 'border-slate-800'
                } rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 transition-all`}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-500/20 transition-all"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
