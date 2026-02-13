
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, MapPin, Camera, Upload, Plus, Trash2, DollarSign, Mail, ReceiptText, Calendar as CalendarIcon, Wallet, AlertCircle } from 'lucide-react';
import { Client, ShootStatus, InvoiceItem, PaymentRecord } from '../types';

interface ClientModalProps {
  client: Client | null;
  onClose: () => void;
  onSubmit: (client: any) => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ client, onClose, onSubmit }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [emailError, setEmailError] = useState('');
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
    payments: PaymentRecord[];
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
    package: 'Basic',
    items: [],
    payments: [],
    totalPrice: 0,
    paidAmount: 0,
    status: ShootStatus.PENDING,
    notes: ''
  });

  const packageOptions = [
    'Basic', 'Silver', 'Gold', 'Exclusive', 'Combo', 'Honor', 'Honor-2', 'Honor-3'
  ];

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        phone: client.phone,
        email: client.email || '',
        eventDate: client.eventDate,
        eventType: client.eventType,
        location: client.location || '',
        image: client.image || '',
        package: client.package || 'Basic',
        items: client.items || [],
        payments: client.payments || [],
        totalPrice: client.totalPrice,
        paidAmount: client.paidAmount,
        status: client.status,
        notes: client.notes
      });
    }
  }, [client]);

  const validateEmail = (email: string) => {
    if (!email) return true; // Optional field
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

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

  const removeImage = () => {
    setFormData({ ...formData, image: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  // Payment management
  const addPayment = () => {
    const newPayment: PaymentRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      method: 'Cash'
    };
    setFormData({ ...formData, payments: [...formData.payments, newPayment] });
  };

  const removePayment = (id: string) => {
    const updatedPayments = formData.payments.filter(p => p.id !== id);
    const newPaidTotal = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
    setFormData({ ...formData, payments: updatedPayments, paidAmount: newPaidTotal });
  };

  const updatePayment = (id: string, field: keyof PaymentRecord, value: any) => {
    const updatedPayments = formData.payments.map(p => 
      p.id === id ? { ...p, [field]: field === 'amount' ? Number(value) : value } : p
    );
    const newPaidTotal = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
    setFormData({ ...formData, payments: updatedPayments, paidAmount: newPaidTotal });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (formData.email && !validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address format.');
      const emailInput = document.getElementById('client-email');
      emailInput?.focus();
      return;
    }

    if (client) {
      onSubmit({ ...client, ...formData });
    } else {
      onSubmit(formData);
    }
  };

  const dueAmount = formData.totalPrice - formData.paidAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
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
            <div className="w-full md:w-40 flex-shrink-0 space-y-3">
              <div 
                className="w-full aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center overflow-hidden relative group"
              >
                {formData.image ? (
                  <>
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-rose-600"
                      title="Remove Image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <Camera className="text-slate-300 mx-auto mb-2" size={32} />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">No Photo Selected</p>
                  </div>
                )}
              </div>
              
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Upload size={14} />
                {formData.image ? 'Change Photo' : 'Upload Photo'}
              </button>
              
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Client Name *</label>
                <input required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Phone *</label>
                <input required type="tel" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${emailError ? 'text-rose-500' : 'text-slate-400'}`} size={16} />
                  <input 
                    id="client-email"
                    type="email" 
                    placeholder="client@example.com" 
                    className={`w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-xl focus:ring-2 outline-none transition-all ${emailError ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-indigo-500'}`}
                    value={formData.email} 
                    onChange={e => {
                      setFormData({...formData, email: e.target.value});
                      if (emailError) setEmailError('');
                    }} 
                  />
                </div>
                {emailError && (
                  <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle size={10} /> {emailError}
                  </p>
                )}
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Event Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="Venue or Event Location" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Service Itemization */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Service Itemization</h4>
                <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                  <Plus size={14} /> Add Item
                </button>
              </div>
              
              {formData.items.length > 0 ? (
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {formData.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input 
                        type="text" 
                        placeholder="Description" 
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        value={item.description}
                        onChange={e => updateItem(item.id, 'description', e.target.value)}
                      />
                      <input 
                        type="number" 
                        placeholder="Amount" 
                        className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                        value={item.amount || ''}
                        onChange={e => updateItem(item.id, 'amount', e.target.value)}
                      />
                      <button type="button" onClick={() => removeItem(item.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 border-2 border-dashed border-slate-100 rounded-2xl text-center text-slate-400 text-sm italic">
                  No service items added.
                </div>
              )}
            </div>

            {/* Payment Records History */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Payment Log</h4>
                <button type="button" onClick={addPayment} className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                  <Plus size={14} /> Add Transaction
                </button>
              </div>
              
              {formData.payments.length > 0 ? (
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {formData.payments.map((p) => (
                    <div key={p.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-3 relative group">
                      <button type="button" onClick={() => removePayment(p.id)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={14} />
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                          <input type="date" className="w-full pl-8 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" value={p.date} onChange={e => updatePayment(p.id, 'date', e.target.value)} />
                        </div>
                        <div className="relative">
                          <Wallet className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                          <select className="w-full pl-8 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs appearance-none" value={p.method} onChange={e => updatePayment(p.id, 'method', e.target.value)}>
                            <option>Cash</option><option>Bkash</option><option>Nagad</option><option>Bank</option><option>Card</option>
                          </select>
                        </div>
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-500" size={14} />
                        <input type="number" placeholder="Payment Amount" className="w-full pl-8 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-emerald-600" value={p.amount || ''} onChange={e => updatePayment(p.id, 'amount', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 border-2 border-dashed border-slate-100 rounded-2xl text-center text-slate-400 text-sm italic">
                  No payments recorded yet.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-50">
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
              <label className="text-xs font-bold text-slate-500 uppercase">Service Package</label>
              <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-600" value={formData.package} onChange={e => setFormData({...formData, package: e.target.value})}>
                {packageOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
             <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
              <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ShootStatus})}>
                {Object.values(ShootStatus).map(s => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <DollarSign size={14} className="text-indigo-400" />
              Financial Statement
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Gross Total</label>
                <input type="number" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-white transition-all text-xl" value={formData.totalPrice} onChange={e => setFormData({...formData, totalPrice: Number(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Total Received</label>
                <div className="w-full px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl font-black text-emerald-400 text-xl flex items-center justify-between">
                   <span>৳</span>
                   <span>{formData.paidAmount.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">* Calculated from payment log</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-rose-500 uppercase tracking-wider">Due Balance</label>
                <div className={`w-full px-4 py-3 border rounded-2xl font-black flex items-center justify-between transition-all text-xl ${dueAmount > 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
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
            <button type="button" onClick={onClose} className="flex-1 py-4 px-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-4 px-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-2xl shadow-indigo-200">
              <Save size={20} /> Finalize Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
