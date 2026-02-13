
import React from 'react';
import { X, Phone, Mail, Calendar, MapPin, Tag, DollarSign, Clock, FileText, User } from 'lucide-react';
import { Client, ShootStatus } from '../types';

interface ClientDetailModalProps {
  client: Client;
  onClose: () => void;
  currency: string;
}

const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ client, onClose, currency }) => {
  const dueAmount = client.totalPrice - client.paidAmount;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
        {/* Header with Background Pattern */}
        <div className="relative h-32 bg-indigo-600 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%"><pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="white" /></pattern><rect width="100%" height="100%" fill="url(#pattern)" /></svg>
          </div>
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors z-10">
            <X size={20} />
          </button>
        </div>

        {/* Profile Info Overlay */}
        <div className="px-8 pb-8 -mt-16 relative">
          <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
            <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-xl">
              <div className="w-full h-full rounded-[1.2rem] bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-100">
                {client.image ? (
                  <img src={client.image} alt={client.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-slate-300" />
                )}
              </div>
            </div>
            <div className="flex-1 pb-2">
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{client.name}</h3>
              <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mt-1 flex items-center gap-2">
                <Tag size={12} /> {client.eventType} Specialist
              </p>
            </div>
            <div className="pb-2">
               <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                 client.status === ShootStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' :
                 client.status === ShootStatus.CANCELLED ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
               }`}>
                {client.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact & Event Section */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">Contact Details</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600 font-medium">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Phone size={16} /></div>
                    <span>{client.phone}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-3 text-slate-600 font-medium">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Mail size={16} /></div>
                      <span>{client.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">Event Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600 font-medium">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Calendar size={16} /></div>
                    <span>{client.eventDate}</span>
                  </div>
                  {client.location && (
                    <div className="flex items-start gap-3 text-slate-600 font-medium">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 mt-0.5"><MapPin size={16} /></div>
                      <span className="flex-1">{client.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-50 rounded-[2rem] p-6 space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-200 pb-2">Financial Summary</h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Value</span>
                  <span className="text-xl font-black text-slate-800">{currency}{client.totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Paid Amount</span>
                  <span className="text-xl font-black text-emerald-600">{currency}{client.paidAmount.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-black text-rose-500 uppercase tracking-widest">Due Balance</span>
                  <span className="text-2xl font-black text-rose-600">{currency}{dueAmount.toLocaleString()}</span>
                </div>
              </div>

              {client.notes && (
                <div className="pt-4 border-t border-slate-200">
                   <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                     <FileText size={12} /> Special Notes
                   </h5>
                   <p className="text-xs text-slate-500 italic leading-relaxed">
                     "{client.notes}"
                   </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-center">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Client ID: {client.id.toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailModal;
