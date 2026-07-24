import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Calendar, Clock, Phone, MessageSquare, CarFront, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../utils/formatters';

const TIME_SLOTS = [
  '09:00 AM',
  '10:30 AM',
  '12:00 PM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
];

export function TestDriveModal({ vehicle, isOpen, onClose, onConfirmTestDrive }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];

  const [bookingDate, setBookingDate] = useState(minDateString);
  const [bookingTime, setBookingTime] = useState(TIME_SLOTS[0]);
  const [contactNumber, setContactNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  if (!isOpen || !vehicle) return null;

  const validate = () => {
    const errs = {};
    if (!bookingDate) {
      errs.bookingDate = 'Please select a preferred date';
    }
    if (!bookingTime) {
      errs.bookingTime = 'Please select a preferred time slot';
    }
    const phoneRegex = /^\d{10}$/;
    if (!contactNumber.trim()) {
      errs.contactNumber = 'Contact number is required';
    } else if (!phoneRegex.test(contactNumber.trim())) {
      errs.contactNumber = 'Must be a valid 10-digit mobile number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onConfirmTestDrive({
        vehicle_id: vehicle.id,
        booking_date: bookingDate,
        booking_time: bookingTime,
        contact_number: contactNumber.trim(),
        notes: notes.trim() || undefined,
      });
      setContactNumber('');
      setNotes('');
      setErrors({});
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Schedule a Test Drive</h2>
              <p className="text-xs text-slate-400">
                Experience the {vehicle.make} {vehicle.model}
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

        {/* Vehicle Preview Card */}
        <div className="px-6 pt-5">
          <div className="flex items-center space-x-4 p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800">
            {vehicle.image_url ? (
              <img
                src={vehicle.image_url}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-16 h-12 object-cover rounded-xl border border-slate-800"
              />
            ) : (
              <div className="w-16 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                <CarFront className="w-6 h-6 text-slate-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-100 truncate">
                {vehicle.make} {vehicle.model}
              </h4>
              <p className="text-xs text-indigo-400 font-extrabold">{formatINR(vehicle.price)}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              {vehicle.quantity} Available
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Preferred Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Preferred Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  min={minDateString}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2.5 bg-slate-950 border ${
                    errors.bookingDate ? 'border-red-500' : 'border-slate-800'
                  } rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all`}
                />
              </div>
              {errors.bookingDate && <p className="mt-1 text-xs text-red-400">{errors.bookingDate}</p>}
            </div>

            {/* Preferred Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Preferred Time Slot <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2.5 bg-slate-950 border ${
                    errors.bookingTime ? 'border-red-500' : 'border-slate-800'
                  } rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all`}
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
              {errors.bookingTime && <p className="mt-1 text-xs text-red-400">{errors.bookingTime}</p>}
            </div>
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Contact Number <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="tel"
                maxLength={10}
                placeholder="10-digit phone number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ''))}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border ${
                  errors.contactNumber ? 'border-red-500' : 'border-slate-800'
                } rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all`}
              />
            </div>
            {errors.contactNumber && <p className="mt-1 text-xs text-red-400">{errors.contactNumber}</p>}
          </div>

          {/* Optional Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Optional Message / Special Instructions
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <textarea
                rows={2}
                placeholder="Mention any specific features you want to test..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Test Drive</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
