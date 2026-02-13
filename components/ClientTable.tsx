
import React from 'react';
import { Trash2, Edit2, Printer, Sparkles, Phone, Calendar, Tag } from 'lucide-react';
import { Client, ShootStatus } from '../types';

interface ClientTableProps {
  clients: Client[];
  onDelete: (id: string) => void;
  onEdit: (client: Client) => void;
  onPrint: (client: Client) => void;
  onAI: (client: Client) => void;
}

const ClientTable: React.FC<ClientTableProps> = ({ clients, onDelete, onEdit, onPrint, onAI }) => {
  const getStatusColor = (status: ShootStatus) => {
    switch (status) {
      case ShootStatus.COMPLETED: return 'bg-emerald-100 text-emerald-700';
      case ShootStatus.EDITING: return 'bg-blue-100 text-blue-700';
      case ShootStatus.CANCELLED: return 'bg-slate-100 text-slate-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  if (clients.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500">
        <Users className="mx-auto mb-4 opacity-20" size={48} />
        <p>No clients found. Start by adding a new booking.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client & Info</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Event Details</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Financials</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
              <td className="px-6 py-4">
                <div className="font-bold text-slate-800">{client.name}</div>
                <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <Phone size={12} /> {client.phone}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-slate-700 flex items-center gap-1 text-sm font-medium">
                  <Tag size={12} className="text-indigo-400" /> {client.eventType}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Calendar size={12} /> {client.eventDate}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-semibold text-slate-800">Total: ৳{client.totalPrice.toLocaleString()}</div>
                <div className="text-xs text-rose-500 mt-1">
                  Due: ৳{(client.totalPrice - client.paidAmount).toLocaleString()}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                  {client.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onAI(client)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    title="AI Shoot Concept"
                  >
                    <Sparkles size={18} />
                  </button>
                  <button 
                    onClick={() => onPrint(client)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    title="Print Invoice"
                  >
                    <Printer size={18} />
                  </button>
                  <button 
                    onClick={() => onEdit(client)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(client.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

import { Users } from 'lucide-react';
export default ClientTable;
