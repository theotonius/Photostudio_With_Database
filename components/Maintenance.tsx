
import React, { useRef } from 'react';
import { Database, Download, Upload, ShieldCheck, FileJson, FileCode, AlertTriangle } from 'lucide-react';
import { Client } from '../types';

interface MaintenanceProps {
  clients: Client[];
  onImport: (clients: Client[]) => void;
}

const Maintenance: React.FC<MaintenanceProps> = ({ clients, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportSQL = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `studio_backup_${timestamp}.sql`;

    let sqlContent = `-- Photo Studio CMS Database Backup\n`;
    sqlContent += `-- Generated on: ${new Date().toLocaleString()}\n\n`;
    sqlContent += `CREATE TABLE IF NOT EXISTS \`clients\` (\n`;
    sqlContent += `  \`id\` varchar(50) NOT NULL,\n`;
    sqlContent += `  \`name\` varchar(255) NOT NULL,\n`;
    sqlContent += `  \`phone\` varchar(50) NOT NULL,\n`;
    sqlContent += `  \`email\` varchar(255) DEFAULT NULL,\n`;
    sqlContent += `  \`eventDate\` date DEFAULT NULL,\n`;
    sqlContent += `  \`eventType\` varchar(100) DEFAULT NULL,\n`;
    sqlContent += `  \`package\` varchar(100) DEFAULT NULL,\n`;
    sqlContent += `  \`totalPrice\` decimal(10,2) DEFAULT 0.00,\n`;
    sqlContent += `  \`paidAmount\` decimal(10,2) DEFAULT 0.00,\n`;
    sqlContent += `  \`status\` varchar(50) DEFAULT NULL,\n`;
    sqlContent += `  \`notes\` text,\n`;
    sqlContent += `  \`createdAt\` datetime DEFAULT NULL,\n`;
    sqlContent += `  PRIMARY KEY (\`id\`)\n`;
    sqlContent += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    if (clients.length > 0) {
      sqlContent += `INSERT INTO \`clients\` VALUES\n`;
      const rows = clients.map(client => {
        const escape = (val: any) => val === null || val === undefined ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`;
        return `(${escape(client.id)}, ${escape(client.name)}, ${escape(client.phone)}, ${escape(client.email)}, ${escape(client.eventDate)}, ${escape(client.eventType)}, ${escape(client.package)}, ${client.totalPrice}, ${client.paidAmount}, ${escape(client.status)}, ${escape(client.notes)}, ${escape(client.createdAt)})`;
      });
      sqlContent += rows.join(',\n') + ';\n';
    }

    downloadFile(sqlContent, filename, 'text/sql');
  };

  const exportJSON = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `studio_data_${timestamp}.json`;
    downloadFile(JSON.stringify(clients, null, 2), filename, 'application/json');
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
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          if (window.confirm('Warning: This will replace your current data. Continue?')) {
            onImport(data);
          }
        } else {
          alert('Invalid JSON format. Expected an array of clients.');
        }
      } catch (err) {
        alert('Error parsing file. Please ensure it is a valid JSON backup.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl flex items-center justify-between relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl font-black mb-2 flex items-center gap-3">
            <ShieldCheck size={28} />
            Data Protection
          </h3>
          <p className="text-indigo-100 max-w-md">
            Keep your studio records safe. We recommend taking a backup at the end of every week to prevent data loss.
          </p>
        </div>
        <Database size={120} className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h4 className="text-lg font-bold text-slate-800 mb-1">Export Backup</h4>
            <p className="text-sm text-slate-500">Download your data to your local device.</p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={exportSQL}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                  <FileCode size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-700">SQL Database Dump</p>
                  <p className="text-xs text-slate-500">Best for phpMyAdmin/MySQL import</p>
                </div>
              </div>
              <Download size={18} className="text-slate-400 group-hover:text-indigo-600" />
            </button>

            <button 
              onClick={exportJSON}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-100 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                  <FileJson size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-700">JSON Data File</p>
                  <p className="text-xs text-slate-500">Best for app-to-app migration</p>
                </div>
              </div>
              <Download size={18} className="text-slate-400 group-hover:text-emerald-600" />
            </button>
          </div>
        </div>

        {/* Restore Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h4 className="text-lg font-bold text-slate-800 mb-1">Restore Database</h4>
            <p className="text-sm text-slate-500">Upload a previously exported JSON backup.</p>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
            <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
            <p className="text-xs text-amber-700 leading-relaxed font-medium">
              Restoring data will overwrite your current local records. Make sure you have a current backup before proceeding.
            </p>
          </div>

          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
          >
            <Upload size={20} />
            <span>Click to Upload Backup</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
