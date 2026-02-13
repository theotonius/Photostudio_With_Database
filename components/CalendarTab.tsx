
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, User, Eye, X, Calendar as CalendarIcon, Tag, Clock } from 'lucide-react';
import { Client, ShootStatus } from '../types';

interface CalendarTabProps {
  clients: Client[];
  onViewClient: (client: Client) => void;
}

const CalendarTab: React.FC<CalendarTabProps> = ({ clients, onViewClient }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  }, [currentDate]);

  const firstDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  }, [currentDate]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const getBookingsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return clients.filter(client => client.eventDate === dateStr);
  };

  const getStatusColor = (status: ShootStatus) => {
    switch (status) {
      case ShootStatus.COMPLETED: return 'bg-emerald-500';
      case ShootStatus.EDITING: return 'bg-blue-500';
      case ShootStatus.CANCELLED: return 'bg-slate-500';
      default: return 'bg-amber-500';
    }
  };

  const getStatusBadgeColor = (status: ShootStatus) => {
    switch (status) {
      case ShootStatus.COMPLETED: return 'bg-emerald-100 text-emerald-700';
      case ShootStatus.EDITING: return 'bg-blue-100 text-blue-700';
      case ShootStatus.CANCELLED: return 'bg-slate-100 text-slate-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const days = [];
  // Padding for first week
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 sm:h-32 border-slate-100 bg-slate-50/30"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayBookings = getBookingsForDay(day);
    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

    days.push(
      <div 
        key={day} 
        onClick={() => setSelectedDay(day)}
        className={`h-24 sm:h-32 p-2 border-slate-100 border transition-all cursor-pointer relative group overflow-hidden ${
          isToday ? 'bg-indigo-50/30' : 'hover:bg-slate-50'
        } ${selectedDay === day ? 'ring-2 ring-inset ring-indigo-500 bg-white z-10' : ''}`}
      >
        <span className={`text-sm font-bold ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>
          {day}
        </span>
        
        <div className="mt-1 space-y-1">
          {dayBookings.slice(0, 3).map(booking => (
            <div 
              key={booking.id} 
              className={`h-1.5 w-full rounded-full ${getStatusColor(booking.status)} opacity-80`}
              title={`${booking.name} - ${booking.eventType}`}
            ></div>
          ))}
          {dayBookings.length > 3 && (
            <div className="text-[10px] font-black text-slate-400 text-center">
              +{dayBookings.length - 3} more
            </div>
          )}
        </div>

        {dayBookings.length > 0 && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white p-1 rounded-md">
            <Eye size={12} />
          </div>
        )}
      </div>
    );
  }

  const selectedDayBookings = selectedDay ? getBookingsForDay(selectedDay) : [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        {/* Calendar Grid */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100">
                <ChevronLeft size={20} className="text-slate-600" />
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100">
                <ChevronRight size={20} className="text-slate-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-l border-t border-slate-100">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="py-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-b border-slate-100 bg-slate-50/50">
                {day}
              </div>
            ))}
            {days}
          </div>
        </div>

        {/* Selected Day Sidebar */}
        <div className="w-full md:w-80 bg-slate-50 border-l border-slate-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-black text-slate-800 flex items-center gap-2">
              <CalendarIcon size={18} className="text-indigo-600" />
              {selectedDay ? `${selectedDay} ${monthNames[currentDate.getMonth()]}` : 'Select a Date'}
            </h4>
            {selectedDay && (
              <button onClick={() => setSelectedDay(null)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
            {selectedDayBookings.length > 0 ? (
              selectedDayBookings.map(client => (
                <div 
                  key={client.id}
                  onClick={() => onViewClient(client)}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100">
                      {client.image ? (
                        <img src={client.image} alt={client.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-800 truncate group-hover:text-indigo-600 transition-colors text-sm">{client.name}</p>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${getStatusBadgeColor(client.status)}`}>
                        {client.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-tighter">
                      <Tag size={12} className="text-slate-300" />
                      {client.eventType}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-tighter">
                      <Clock size={12} className="text-slate-300" />
                      Due: ৳{(client.totalPrice - client.paidAmount).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-30">
                <CalendarIcon size={48} className="mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">
                  {selectedDay ? 'No bookings scheduled' : 'Select a date to view bookings'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-full mb-2">Status Legend</h5>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-xs font-bold text-slate-600">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-xs font-bold text-slate-600">Editing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-xs font-bold text-slate-600">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-500"></div>
          <span className="text-xs font-bold text-slate-600">Cancelled</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarTab;
