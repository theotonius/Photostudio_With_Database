
import React from 'react';
import { Trash2, Edit2, Phone, Mail, MapPin, User, Search } from 'lucide-react';
import { Contact } from '../types';

interface ContactTableProps {
  contacts: Contact[];
  onDelete: (id: string) => void;
  onEdit: (contact: Contact) => void;
}

const ContactTable: React.FC<ContactTableProps> = ({ contacts, onDelete, onEdit }) => {
  if (contacts.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500">
        <User className="mx-auto mb-4 opacity-20" size={48} />
        <p className="font-medium">No contacts saved yet. Start adding your business connections.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Contact Identity</th>
            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Communication</th>
            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Location & Info</th>
            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {contacts.map((contact) => (
            <tr key={contact.id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {contact.image ? (
                      <img src={contact.image} alt={contact.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-slate-300" />
                    )}
                  </div>
                  <div>
                    <div className="font-black text-slate-800">{contact.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Contact Profile</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Phone size={12} className="text-indigo-400" /> {contact.phone}
                  </div>
                  {contact.email && (
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <Mail size={12} className="text-slate-300" /> {contact.email}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="max-w-[200px] truncate text-sm font-medium text-slate-600 flex items-center gap-2">
                  <MapPin size={12} className="text-indigo-400 shrink-0" />
                  {contact.address || 'No address provided'}
                </div>
                {contact.notes && (
                    <p className="text-[10px] text-slate-400 mt-1 italic line-clamp-1">{contact.notes}</p>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(contact)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => onDelete(contact.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
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

export default ContactTable;
