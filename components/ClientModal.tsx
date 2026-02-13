
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, MapPin, Camera, Upload, Plus, Trash2, DollarSign } from 'lucide-react';
import { Client, ShootStatus, InvoiceItem } from '../types';

interface ClientModalProps {
  client: Client | null;
  onClose: () => void;
  onSubmit: (client: any) => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ client, onClose, onSubmit }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    email: string;
    eventDate: string;
    eventType: string;
    location: string;
    image: string;
    package: string;
    items: InvoiceItem[];
    totalPrice: number;
    paidAmount: number;
    status: ShootStatus;
    notes: string;
  }>({
    name: '',
    phone: '',
    email: '',
    eventDate: new Date().toISOString().split('T')[0],
    eventType: 'Wedding',
    location: '',
    image: '',
    package: 'Standard',
    items: [],
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
        location: client.location || '',
        image: client.image || '',
        package: client.package,
        items: client.items || [],
        totalPrice: client.totalPrice,
        paidAmount: client.paidAmount,
        status: client.status,
        notes: client.notes
      });
    }
  }, [client]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      amount: 0
    };
    setFormData({ ...formData, items: [...formData.items, newItem] });
  };

  const removeItem = (id: string) => {
    const updatedItems = formData.items.filter(item => item.id !== id);
    const newTotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    setFormData({ ...formData, items: updatedItems, totalPrice: newTotal });
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const updatedItems = formData.items.map(item => 
      item.id === id ? { ...item, [field]: field === 'amount' ? Number(value) : value } : item
    );
    const newTotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    setFormData({ ...formData, items: updatedItems, totalPrice: newTotal });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (client) {
      onSubmit({ ...client, ...formData });
    } else {
      onSubmit(formData);
    }
  };

  const dueAmount = formData.totalPrice - formData.paidAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">
            {client ? 'Edit Booking' : 'New Booking'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-40 flex-shrink-0">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all overflow-hidden relative group"
              >
                {formData.image ? (
                  <>
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <Camera size={24} />
                    </div>
                  </>
                ) : (
                  <>
                    <Camera className="text-slate-400 mb-2" size={32} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Profile Photo</span>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Client Name *</label>
                <input required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Phone *</label>
                <input required type="tel" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Event Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="Venue Address" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Service Itemization</h4>
              <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={14} /> Add Item
              </button>
            </div>
            
            {formData.items.length > 0 ? (
              <div className="space-y-2">
                {formData.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. 4 Hours Wedding Coverage" 
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      value={item.description}
                      onChange={e => updateItem(item.id, 'description', e.target.value)}
                    />
                    <input 
                      type="number" 
                      placeholder="Amount" 
                      className="w-32 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      value={item.amount || ''}
                      onChange={e => updateItem(item.id, 'amount', e.target.value)}
                    />
                    <button type="button" onClick={() => removeItem(item.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 border-2 border-dashed border-slate-100 rounded-2xl text-center text-slate-400 text-sm italic">
                No items added. The total price will be used as a single entry.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Event Date</label>
              <input type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Event Type</label>
              <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.eventType} onChange={e => setFormData({...formData, eventType: e.target.value})}>
                <option>Wedding</option><option>Birthday</option><option>Corporate</option><option>Photoshoot</option><option>Portfolio</option><option>Other</option>
              </select>
            </div>
             <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
              <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ShootStatus})}>
                {Object.values(ShootStatus).map(s => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
          </div>

          <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <DollarSign size={14} className="text-indigo-500" />
              Financial Breakdown
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Total Price</label>
                <input type="number" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800 transition-all" value={formData.totalPrice} onChange={e => setFormData({...formData, totalPrice: Number(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Paid Amount</label>
                <input type="number" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-600 transition-all" value={formData.paidAmount} onChange={e => setFormData({...formData, paidAmount: Number(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-rose-500 uppercase tracking-wider">Due Amount</label>
                <div className={`w-full px-4 py-3 border rounded-2xl font-black flex items-center justify-between transition-all ${dueAmount > 0 ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                  <span>৳</span>
                  <span>{dueAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Notes & Special Requirements</label>
            <textarea rows={2} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Package details, deadlines, etc." />
          </div>

          <div className="pt-4 flex gap-3 sticky bottom-0 bg-white border-t border-slate-50 pb-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
              <Save size={20} /> Save Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
