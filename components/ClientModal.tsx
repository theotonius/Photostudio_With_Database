
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Client, ShootStatus } from '../types';

interface ClientModalProps {
  client: Client | null;
  onClose: () => void;
  onSubmit: (client: any) => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ client, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    eventDate: new Date().toISOString().split('T')[0],
    eventType: 'Wedding',
    package: 'Standard',
    totalPrice: 0,
    paidAmount: 0,
    status: ShootStatus.PENDING,
    notes: ''
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        phone: client.phone,
        email: client.email,
        eventDate: client.eventDate,
        eventType: client.eventType,
        package: client.package,
        totalPrice: client.totalPrice,
        paidAmount: client.paidAmount,
        status: client.status,
        notes: client.notes
      });
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (client) {
      onSubmit({ ...client, ...formData });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">
            {client ? 'Edit Client Details' : 'New Client Booking'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Client Name *</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Phone Number *</label>
              <input 
                required
                type="tel" 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Event Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.eventDate}
                onChange={e => setFormData({...formData, eventDate: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Event Type</label>
              <select 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                value={formData.eventType}
                onChange={e => setFormData({...formData, eventType: e.target.value})}
              >
                <option>Wedding</option>
                <option>Birthday</option>
                <option>Corporate</option>
                <option>Photoshoot</option>
                <option>Portfolio</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Total Price (৳)</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.totalPrice}
                onChange={e => setFormData({...formData, totalPrice: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Paid Amount (৳)</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.paidAmount}
                onChange={e => setFormData({...formData, paidAmount: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Status</label>
              <select 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as ShootStatus})}
              >
                {Object.values(ShootStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <input 
                type="email" 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Notes & Special Requirements</label>
            <textarea 
              rows={3}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="Package details, location info, etc."
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
            >
              <Save size={20} />
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
