
import React, { useRef, useState } from 'react';
import { Database, Download, Upload, ShieldCheck, FileJson, FileCode, AlertTriangle, Building, Save, Globe, Phone, Mail, DollarSign, Hash, Camera } from 'lucide-react';
import { Client, StudioProfile } from '../types';

interface MaintenanceProps {
  clients: Client[];
  onImport: (clients: Client[]) => void;
  studioProfile: StudioProfile;
  onUpdateProfile: (profile: StudioProfile) => void;
}

const Maintenance: React.FC<MaintenanceProps> = ({ clients, onImport, studioProfile, onUpdateProfile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [profileForm, setProfileForm] = useState<StudioProfile>(studioProfile);

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
    alert('Studio Profile Updated!');
  };

  const exportSQL = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `studio_backup_${timestamp}.sql`;

    let sqlContent = `-- Photo Studio CMS Database Backup\n`;
    sqlContent += `-- Generated on: ${new Date().toLocaleString()}\n\n`;
    
    // Settings Table
    sqlContent += `CREATE TABLE IF NOT EXISTS \`studio_settings\` (\n`;
    sqlContent += `  \`id\` int(11) NOT NULL AUTO_INCREMENT,\n`;
    sqlContent += `  \`name\` varchar(255) NOT NULL,\n`;
    sqlContent += `  \`logo\` longtext,\n`;
    sqlContent += `  \`address\` text,\n`;
    sqlContent += `  \`phone\` varchar(50),\n`;
    sqlContent += `  \`email\` varchar(255),\n`;
    sqlContent += `  \`website\` varchar(255),\n`;
    sqlContent += `  \`currency\` varchar(10),\n`;
    sqlContent += `  \`taxNumber\` varchar(100),\n`;
    sqlContent += `  PRIMARY KEY (\`id\`)\n`;
    sqlContent += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    const escape = (val: any) => val === null || val === undefined ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`;
    
    sqlContent += `REPLACE INTO \`studio_settings\` VALUES (1, ${escape(studioProfile.name)}, ${escape(studioProfile.logo)}, ${escape(studioProfile.address)}, ${escape(studioProfile.phone)}, ${escape(studioProfile.email)}, ${escape(studioProfile.website)}, ${escape(studioProfile.currency)}, ${escape(studioProfile.taxNumber)});\n\n`;

    // Clients Table
    sqlContent += `CREATE TABLE IF NOT EXISTS \`clients\` (\n`;
    sqlContent += `  \`id\` varchar(50) NOT NULL,\n`;
    sqlContent += `  \`name\` varchar(255) NOT NULL,\n`;
    sqlContent += `  \`phone\` varchar(50) NOT NULL,\n`;
    sqlContent += `  \`email\` varchar(255) DEFAULT NULL,\n`;
    sqlContent += `  \`eventDate\` date DEFAULT NULL,\n`;
    sqlContent += `  \`eventType\` varchar(100) DEFAULT NULL,\n`;
    sqlContent += `  \`location\` text,\n`;
    sqlContent += `  \`image\` longtext,\n`;
    sqlContent += `  \`package\` varchar(100) DEFAULT NULL,\n`;
    sqlContent += `  \`totalPrice\` decimal(10,2) DEFAULT 0.00,\n`;
    sqlContent += `  \`paidAmount\` decimal(10,2) DEFAULT 0.00,\n`;
    sqlContent += `  \`dueAmount\` decimal(10,2) DEFAULT 0.00,\n`; // Added dueAmount column
    sqlContent += `  \`status\` varchar(50) DEFAULT NULL,\n`;
    sqlContent += `  \`notes\` text,\n`;
    sqlContent += `  \`createdAt\` datetime DEFAULT NULL,\n`;
    sqlContent += `  PRIMARY KEY (\`id\`)\n`;
    sqlContent += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    if (clients.length > 0) {
      sqlContent += `INSERT INTO \`clients\` VALUES\n`;
      const rows = clients.map(client => {
        return `(${escape(client.id)}, ${escape(client.name)}, ${escape(client.phone)}, ${escape(client.email)}, ${escape(client.eventDate)}, ${escape(client.eventType)}, ${escape(client.location)}, ${escape(client.image)}, ${escape(client.package)}, ${client.totalPrice}, ${client.paidAmount}, ${client.dueAmount || (client.totalPrice - client.paidAmount)}, ${escape(client.status)}, ${escape(client.notes)}, ${escape(client.createdAt)})`;
      });
      sqlContent += rows.join(',\n') + ';\n';
    }

    downloadFile(sqlContent, filename, 'text/sql');
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data) && window.confirm('This will replace your current data. Continue?')) {
          onImport(data);
        }
      } catch (err) { alert('Invalid File Format'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl space-y-12">
      {/* Hero Banner */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-3 flex items-center gap-3 tracking-tight">
            <Building size={32} className="text-indigo-400" />
            Studio Configuration
          </h3>
          <p className="text-slate-400 max-w-lg font-medium">
            Customize how your studio appears on invoices and manage your data backups. Settings are now synced to your cloud database.
          </p>
        </div>
        <Building size={200} className="absolute right-[-20px] top-[-20px] opacity-[0.03] rotate-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Profile Settings */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <Building size={18} className="text-indigo-600" />
              Studio Branding & Details
            </h4>
          </div>
          <form onSubmit={saveProfile} className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="w-full md:w-44 flex-shrink-0 space-y-3">
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all overflow-hidden relative group"
                >
                  {profileForm.logo ? (
                    <>
                      <img src={profileForm.logo} alt="Logo" className="w-full h-full object-contain p-4" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Camera size={24} />
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera className="text-slate-400 mb-2" size={32} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Studio Logo</span>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={handleLogoUpload} />
                <p className="text-[10px] font-bold text-slate-400 uppercase text-center tracking-widest">Preferred: PNG/SVG</p>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Studio Name</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" value={profileForm.name} onChange={e => handleProfileChange('name', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Currency Symbol</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" value={profileForm.currency} onChange={e => handleProfileChange('currency', e.target.value)} />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Business Address</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" value={profileForm.address} onChange={e => handleProfileChange('address', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" value={profileForm.phone} onChange={e => handleProfileChange('phone', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="email" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" value={profileForm.email} onChange={e => handleProfileChange('email', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Website</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" value={profileForm.website} onChange={e => handleProfileChange('website', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tax ID / BIN</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" value={profileForm.taxNumber} onChange={e => handleProfileChange('taxNumber', e.target.value)} />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-100">
              <Save size={20} /> Save Studio Profile
            </button>
          </form>
        </div>

        {/* Maintenance Tools */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
            <div>
              <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                <ShieldCheck size={18} className="text-indigo-600" />
                Data Protection
              </h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Regular backups are crucial for business continuity. Your backups now include your studio settings.</p>
            </div>
            
            <div className="space-y-3">
              <button onClick={exportSQL} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-2xl transition-all group">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600"><FileCode size={20} /></div>
                  <div className="text-left font-bold text-slate-700 text-sm">Export SQL</div>
                </div>
                <Download size={18} className="text-slate-400 group-hover:text-indigo-600" />
              </button>
              
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
                <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider leading-relaxed">
                  Importing data will overwrite your local studio records and cloud settings.
                </p>
              </div>

              <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all text-sm">
                <Upload size={20} /> Restore JSON Backup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
