
import React from 'react';
import { Client } from '../types';
import { Camera, MapPin, Phone, Mail, Globe } from 'lucide-react';

interface PrintPreviewProps {
  client: Client;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ client }) => {
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const balance = client.totalPrice - client.paidAmount;

  return (
    <div className="bg-white text-slate-900 w-full min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 text-white p-3 rounded-2xl">
            <Camera size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight leading-none">Your Studio Name</h1>
            <p className="text-sm font-bold text-indigo-600 mt-1 uppercase tracking-widest">Professional Photography</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-black uppercase text-slate-900 mb-2">Invoice</h2>
          <div className="space-y-1 text-sm font-medium text-slate-500">
            <p>Invoice No: <span className="text-slate-900">#INV-{client.id.toUpperCase()}</span></p>
            <p>Date: <span className="text-slate-900">{today}</span></p>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-16 mb-12">
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-2">Client Details</h3>
          <div>
            <p className="text-xl font-black text-slate-900">{client.name}</p>
            <div className="mt-2 space-y-1 text-slate-600 font-medium">
              <p className="flex items-center gap-2"><Phone size={14} /> {client.phone}</p>
              {client.email && <p className="flex items-center gap-2"><Mail size={14} /> {client.email}</p>}
            </div>
          </div>
        </div>
        <div className="space-y-4 text-right">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-2">Event Information</h3>
          <div>
            <p className="text-xl font-black text-slate-900">{client.eventType}</p>
            <div className="mt-2 space-y-1 text-slate-600 font-medium">
              <p>Event Date: <span className="text-slate-900">{client.eventDate}</span></p>
              <p>Package: <span className="text-slate-900">{client.package}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="mb-12">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="py-4 px-6 text-left font-bold uppercase text-xs tracking-widest">Description</th>
              <th className="py-4 px-6 text-right font-bold uppercase text-xs tracking-widest">Amount (BDT)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="py-8 px-6">
                <p className="text-lg font-bold text-slate-900">{client.eventType} Photography Service</p>
                <p className="text-sm text-slate-500 mt-2 max-w-md leading-relaxed">
                  {client.notes || 'Includes high-quality digital photos, professional editing, and standard delivery package.'}
                </p>
              </td>
              <td className="py-8 px-6 text-right text-xl font-black text-slate-900">
                ৳{client.totalPrice.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="flex justify-end mb-20">
        <div className="w-80 space-y-3">
          <div className="flex justify-between items-center py-2 px-4 bg-slate-50 rounded-lg">
            <span className="text-sm font-bold text-slate-500 uppercase">Subtotal</span>
            <span className="text-lg font-bold text-slate-900">৳{client.totalPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2 px-4 bg-emerald-50 rounded-lg">
            <span className="text-sm font-bold text-emerald-600 uppercase">Amount Paid</span>
            <span className="text-lg font-bold text-emerald-700">৳{client.paidAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-4 px-4 bg-slate-900 text-white rounded-xl shadow-xl">
            <span className="text-base font-black uppercase tracking-widest">Due Balance</span>
            <span className="text-2xl font-black">৳{balance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="border-t-2 border-slate-100 pt-10 text-center">
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mb-8">Thank you for capturing moments with us</p>
        
        <div className="grid grid-cols-3 gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <div className="flex flex-col items-center gap-2">
            <Globe size={16} className="text-slate-300" />
            <span>www.yourstudio.com</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <MapPin size={16} className="text-slate-300" />
            <span>Dhanmondi, Dhaka, Bangladesh</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Phone size={16} className="text-slate-300" />
            <span>+880 1XXX-XXXXXX</span>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="mt-20 flex justify-between px-10">
        <div className="text-center">
          <div className="w-40 border-b border-slate-300 mb-2"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Signature</p>
        </div>
        <div className="text-center">
          <div className="w-40 border-b border-slate-900 mb-2"></div>
          <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Authorized Signature</p>
        </div>
      </div>
    </div>
  );
};

export default PrintPreview;
