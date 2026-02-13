
import React from 'react';
import { Users, DollarSign, Calendar, Clock } from 'lucide-react';
import { DashboardStats } from '../types';

interface DashboardCardsProps {
  stats: DashboardStats;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ stats }) => {
  const items = [
    { 
      label: 'Total Clients', 
      value: stats.totalClients, 
      icon: Users, 
      color: 'bg-blue-500', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Total Revenue', 
      value: `৳${stats.totalRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      color: 'bg-emerald-500', 
      bg: 'bg-emerald-50' 
    },
    { 
      label: 'Due Payments', 
      value: `৳${stats.pendingPayments.toLocaleString()}`, 
      icon: Clock, 
      color: 'bg-rose-500', 
      bg: 'bg-rose-50' 
    },
    { 
      label: 'Upcoming Shoots', 
      value: stats.upcomingShoots, 
      icon: Calendar, 
      color: 'bg-amber-500', 
      bg: 'bg-amber-50' 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item, idx) => (
        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">{item.label}</p>
            <h4 className="text-2xl font-bold text-slate-800">{item.value}</h4>
          </div>
          <div className={`${item.bg} p-3 rounded-xl`}>
            <item.icon className={item.color.replace('bg-', 'text-')} size={24} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
