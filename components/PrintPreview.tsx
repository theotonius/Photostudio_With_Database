
import React from 'react';
import { Client, StudioProfile } from '../types';
// Added Camera to imports
import { MapPin, Phone, Mail, Globe, Hash, Camera } from 'lucide-react';

interface PrintPreviewProps {
  client: Client;
  studio: StudioProfile;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ client, studio }) => {
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const balance = client.totalPrice - client.paidAmount;

  return (
    <div className="bg-white text-slate-900 w-full min-h-screen p-12 flex flex-col font-sans">
      {/* Accent Top Bar */}
      <div className="h-2 bg-slate-900 mb-12"></div>

      {/* Header Section */}
      <div className="flex justify-between items-start mb-16">
        <div>
          {studio.logo ? (
            <img src={studio.logo} alt={studio.name} className="h-24 w-auto object-contain mb-4" />
          ) : (
            <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center rounded-2xl mb-4">
              <span className="text-3xl font-black">{studio.name.charAt(0)}</span>
            </div>
          )}
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">{studio.name}</h1>
          <div className="mt-4 space-y-1 text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
            <p className="flex items-center gap-2"><MapPin size={12} className="text-slate-300" /> {studio.address}</p>
            <p className="flex items-center gap-2"><Phone size={12} className="text-slate-300" /> {studio.phone}</p>
            <p className="flex items-center gap-2"><Globe size={12} className="text-slate-300" /> {studio.website}</p>
          </div>
        </div>
        
        <div className="text-right">
          <h2 className="text-6xl font-black uppercase text-slate-100 mb-6 -mr-4 select-none">Invoice</h2>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice Number</span>
              <span className="text-lg font-black text-slate-900 tracking-tight">#INV-{client.id.toUpperCase().slice(0, 8)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Issue Date</span>
              <span className="text-sm font-bold text-slate-800">{today}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Client & Event Info */}
      <div className="grid grid-cols-2 gap-20 mb-16">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-2">Bill To</h3>
          <div className="space-y-1">
            <p className="text-xl font-black text-slate-900">{client.name}</p>
            <p className="text-sm font-bold text-slate-600">{client.phone}</p>
            {client.email && <p className="text-sm font-bold text-slate-600">{client.email}</p>}
          </div>
        </div>
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-2">Project Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Event Type</p>
              <p className="text-sm font-black text-slate-800 uppercase tracking-wide">{client.eventType}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Shoot Date</p>
              <p className="text-sm font-black text-slate-800">{client.eventDate}</p>
            </div>
            {client.location && (
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                <p className="text-sm font-bold text-indigo-600 flex items-center gap-1">
                  <MapPin size={12} /> {client.location}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Itemized Charges Table */}
      <div className="flex-1 mb-16">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-slate-900">
              <th className="py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
              <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {client.items && client.items.length > 0 ? (
              client.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-6 pr-6">
                    <p className="font-black text-slate-800 text-base">{item.description}</p>
                  </td>
                  <td className="py-6 text-right font-black text-slate-900 text-lg">
                    {studio.currency}{item.amount.toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-8 pr-6">
                  <p className="font-black text-slate-800 text-base">{client.eventType} Photography Service</p>
                  <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{client.package} Package</p>
                </td>
                <td className="py-8 text-right font-black text-slate-900 text-lg">
                  {studio.currency}{client.totalPrice.toLocaleString()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="flex justify-between items-start pt-12 border-t-2 border-slate-50">
        <div className="max-w-sm">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Terms & Notes</h4>
          <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
            {client.notes || `Please note that all payments are final. Final edited digital files will be delivered within 15 working days from the date of final selection.`}
          </p>
          {studio.taxNumber && (
            <p className="mt-4 text-[10px] font-black text-slate-800 flex items-center gap-1 uppercase tracking-widest">
              <Hash size={10} /> {studio.taxNumber}
            </p>
          )}
        </div>
        
        <div className="w-72 space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest px-2">
            <span>Total Charge</span>
            <span>{studio.currency}{client.totalPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 py-3 px-4 rounded-xl">
            <span>Amount Paid</span>
            <span>- {studio.currency}{client.paidAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl shadow-xl shadow-slate-200">
            <span className="text-xs font-black uppercase tracking-[0.2em]">Balance Due</span>
            <span className="text-3xl font-black">{studio.currency}{balance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-auto pt-20 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
            {/* Camera used here, now imported correctly */}
            <Camera size={16} className="text-slate-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Generated by Studio Pro CMS</span>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">{studio.name}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{studio.email}</p>
        </div>
      </div>
    </div>
  );
};

export default PrintPreview;
