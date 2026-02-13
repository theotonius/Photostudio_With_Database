
import React, { useRef, useState } from 'react';
import { Database, Download, Upload, ShieldCheck, FileJson, FileCode, AlertTriangle, Building, Save, Globe, Phone, Mail, DollarSign, Hash, Camera, Lock, Loader2, Cloud, WifiOff, Link as LinkIcon } from 'lucide-react';
import { Client, Contact, StudioProfile } from '../types';

interface MaintenanceProps {
  clients: Client[];
  contacts: Contact[];
  onImport: (clients: Client[]) => void;
  studioProfile: StudioProfile;
  onUpdateProfile: (profile: StudioProfile) => void;
  storageMode: 'local' | 'sql' | 'firebase';
  onStorageModeChange: (mode: 'local' | 'sql' | 'firebase') => void;
}

const Maintenance: React.FC<MaintenanceProps> = ({ clients, contacts, onImport, studioProfile, onUpdateProfile, storageMode, onStorageModeChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [profileForm, setProfileForm] = useState<StudioProfile>(studioProfile);
  
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState('');

  const handleProfileChange = (field: keyof StudioProfile, value: string) => {
    setProfileForm({ ...profileForm, [field]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({ ...profileForm, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileForm);
    alert('Studio Profile Updated Successfully!');
  };

  const updateStorageMode = (mode: 'local' | 'sql' | 'firebase') => {
    localStorage.setItem('studio_storage_mode', mode);
    onStorageModeChange(mode);
    alert(`Storage Mode switched to ${mode.toUpperCase()}. App will reload data.`);
  };

  const exportSQL = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `studio_backup_${timestamp}.sql`;

    let sqlContent = `-- Photo Studio CMS Database Backup\n`;
    sqlContent += `-- Generated on: ${new Date().toLocaleString()}\n\n`;
    
    const escape = (val: any) => val === null || val === undefined ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`;

    sqlContent += `CREATE TABLE IF NOT EXISTS \`users\` (\n  \`id\` int(11) NOT NULL AUTO_INCREMENT,\n  \`username\` varchar(50) NOT NULL UNIQUE,\n  \`email\` varchar(255) NOT NULL UNIQUE,\n  \`password\` varchar(255) NOT NULL,\n  \`createdAt\` datetime DEFAULT CURRENT_TIMESTAMP,\n  PRIMARY KEY (\`id\`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    sqlContent += `CREATE TABLE IF NOT EXISTS \`studio_settings\` (\n  \`id\` int(11) NOT NULL AUTO_INCREMENT,\n  \`name\` varchar(255) NOT NULL,\n  \`logo\` longtext,\n  \`address\` text,\n  \`phone\` varchar(50),\n  \`email\` varchar(255),\n  \`website\` varchar(255),\n  \`currency\` varchar(10),\n  \`taxNumber\` varchar(100),\n  PRIMARY KEY (\`id\`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    sqlContent += `REPLACE INTO \`studio_settings\` VALUES (1, ${escape(studioProfile.name)}, ${escape(studioProfile.logo)}, ${escape(studioProfile.address)}, ${escape(studioProfile.phone)}, ${escape(studioProfile.email)}, ${escape(studioProfile.website)}, ${escape(studioProfile.currency)}, ${escape(studioProfile.taxNumber)});\n\n`;

    sqlContent += `CREATE TABLE IF NOT EXISTS \`clients\` (\n  \`id\` varchar(50) NOT NULL,\n  \`name\` varchar(255) NOT NULL,\n  \`phone\` varchar(50) NOT NULL,\n  \`email\` varchar(255) DEFAULT NULL,\n  \`eventDate\` date DEFAULT NULL,\n  \`eventType\` varchar(100) DEFAULT NULL,\n  \`location\` text,\n  \`image\` longtext,\n  \`package\` varchar(100) DEFAULT NULL,\n  \`totalPrice\` decimal(10,2) DEFAULT 0.00,\n  \`paidAmount\` decimal(10,2) DEFAULT 0.00,\n  \`dueAmount\` decimal(10,2) DEFAULT 0.00,\n  \`status\` varchar(50) DEFAULT NULL,\n  \`notes\` text,\n  \`createdAt\` datetime DEFAULT NULL,\n  PRIMARY KEY (\`id\`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    if (clients.length > 0) {
      sqlContent += `INSERT INTO \`clients\` VALUES\n`;
      const rows = clients.map(client => `(${escape(client.id)}, ${escape(client.name)}, ${escape(client.phone)}, ${escape(client.email)}, ${escape(client.eventDate)}, ${escape(client.eventType)}, ${escape(client.location)}, ${escape(client.image)}, ${escape(client.package)}, ${client.totalPrice}, ${client.paidAmount}, ${client.dueAmount || (client.totalPrice - client.paidAmount)}, ${escape(client.status)}, ${escape(client.notes)}, ${escape(client.createdAt)})`);
      sqlContent += rows.join(',\n') + ';\n\n';
    }

    sqlContent += `CREATE TABLE IF NOT EXISTS \`contacts\` (\n  \`id\` varchar(50) NOT NULL,\n  \`name\` varchar(255) NOT NULL,\n  \`phone\` varchar(50) NOT NULL,\n  \`email\` varchar(255) DEFAULT NULL,\n  \`address\` text,\n  \`image\` longtext,\n  \`notes\` text,\n  \`createdAt\` datetime DEFAULT CURRENT_TIMESTAMP,\n  PRIMARY KEY (\`id\`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    if (contacts.length > 0) {
      sqlContent += `INSERT INTO \`contacts\` VALUES\n`;
      const rows = contacts.map(contact => `(${escape(contact.id)}, ${escape(contact.name)}, ${escape(contact.phone)}, ${escape(contact.email)}, ${escape(contact.address)}, ${escape(contact.image)}, ${escape(contact.notes)}, ${escape(contact.createdAt)})`);
      sqlContent += rows.join(',\n') + ';\n';
    }

    const blob = new Blob([sqlContent], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl space-y-12 pb-20">
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-3 flex items-center gap-3 tracking-tight">
            <Building size={32} className="text-indigo-400" />
            Maintenance & Cloud
          </h3>
          <p className="text-slate-400 max-w-lg font-medium">
            Manage your storage preference and studio identity. Switch between local database, SQL server, or Firebase Cloud.
          </p>
        </div>
        <Building size={200} className="absolute right-[-20px] top-[-20px] opacity-[0.03] rotate-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Storage Mode Selector */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Database size={18} className="text-indigo-600" />
              Primary Storage Source
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                onClick={() => updateStorageMode('local')}
                className={`p-4 rounded-2xl border-2 transition-all text-left ${storageMode === 'local' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center mb-3">
                  <WifiOff size={16} className="text-slate-400" />
                </div>
                <p className="font-black text-slate-800 text-xs uppercase tracking-widest">Local Browser</p>
                <p className="text-[10px] text-slate-500 font-medium mt-1">Saves in browser cache. No setup required.</p>
              </button>
              
              <button 
                onClick={() => updateStorageMode('sql')}
                className={`p-4 rounded-2xl border-2 transition-all text-left ${storageMode === 'sql' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center mb-3">
                  <Database size={16} className="text-emerald-500" />
                </div>
                <p className="font-black text-slate-800 text-xs uppercase tracking-widest">SQL (WAMP/XAMPP)</p>
                <p className="text-[10px] text-slate-500 font-medium mt-1">Professional hosting. Requires PHP/MySQL.</p>
              </button>

              <button 
                onClick={() => updateStorageMode('firebase')}
                className={`p-4 rounded-2xl border-2 transition-all text-left ${storageMode === 'firebase' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center mb-3">
                  <Cloud size={16} className="text-indigo-500" />
                </div>
                <p className="font-black text-slate-800 text-xs uppercase tracking-widest">Firebase Cloud</p>
                <p className="text-[10px] text-slate-500 font-medium mt-1">Online cloud sync. Access anywhere.</p>
              </button>
            </div>
          </div>

          {/* Expanded Studio Branding Section */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <Building size={18} className="text-indigo-600" />
                Studio Branding & Details
              </h4>
            </div>
            <form onSubmit={saveProfile} className="p-8 space-y-8">
              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="w-full md:w-44 flex-shrink-0 space-y-3">
                  <div onClick={() => logoInputRef.current?.click()} className="w-full aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group transition-all hover:bg-indigo-50 hover:border-indigo-200">
                    {profileForm.logo ? (
                      <>
                        <img src={profileForm.logo} alt="Logo" className="w-full h-full object-contain p-4" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <Camera size={24} />
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <Camera className="text-slate-300 mx-auto mb-2" size={32} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Logo</p>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={handleLogoUpload} />
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Studio Business Name</label>
                    <input type="text" placeholder="e.g. Dream Moments Photography" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800" value={profileForm.name} onChange={e => handleProfileChange('name', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Currency Symbol</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="text" placeholder="৳" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800" value={profileForm.currency} onChange={e => handleProfileChange('currency', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Office Address</label>
                    <input type="text" placeholder="123 Studio Lane, Dhaka, Bangladesh" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-600" value={profileForm.address} onChange={e => handleProfileChange('address', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="tel" placeholder="+880 1..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" value={profileForm.phone} onChange={e => handleProfileChange('phone', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="email" placeholder="hello@studio.com" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" value={profileForm.email} onChange={e => handleProfileChange('email', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Website</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="text" placeholder="www.studio.com" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" value={profileForm.website} onChange={e => handleProfileChange('website', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1 md:col-span-2 lg:col-span-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax Identification / BIN Number (Optional)</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="text" placeholder="BIN-123456789" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" value={profileForm.taxNumber || ''} onChange={e => handleProfileChange('taxNumber', e.target.value)} />
                    </div>
                  </div>
              </div>

              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 uppercase tracking-widest text-xs">
                <Save size={20} /> Update Studio Profile
              </button>
            </form>
          </div>
        </div>

        {/* Maintenance Sidebar */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
             <h4 className="font-bold text-slate-800 flex items-center gap-2"><ShieldCheck size={18} className="text-indigo-600" /> Data Management</h4>
             <button onClick={exportSQL} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-2xl transition-all group">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <FileCode size={20} />
                   </div>
                   <span className="font-bold text-slate-700">Export SQL Backup</span>
                </div>
                <Download size={18} className="text-slate-300" />
             </button>
             <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-[10px] text-amber-800 font-bold uppercase leading-relaxed">
                আপনার স্টুডিওর প্রোফাইল তথ্য পরিবর্তন করার পর এটি সেভ বাটনে ক্লিক করে নিশ্চিত করুন। এটি ইনভয়েস জেনারেশনের সময় অটোমেটিক আপডেট হয়ে যাবে।
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
