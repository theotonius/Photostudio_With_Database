
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Users, Camera, DollarSign, Calendar as CalendarIcon, Printer, Trash2, Edit2, Sparkles, X, ChevronRight, LayoutDashboard, UserPlus, LogOut, Database, Download, CloudSync, Save, Settings, ShieldCheck, WifiOff, Filter, RotateCcw, AlertCircle, Info } from 'lucide-react';
import { Client, ShootStatus, DashboardStats, StudioProfile } from './types';
import ClientModal from './components/ClientModal';
import DashboardCards from './components/DashboardCards';
import ClientTable from './components/ClientTable';
import PrintPreview from './components/PrintPreview';
import AIConceptGenerator from './components/AIConceptGenerator';
import Login from './components/Login';
import Maintenance from './components/Maintenance';
import ClientDetailModal from './components/ClientDetailModal';
import CalendarTab from './components/CalendarTab';

const DEFAULT_STUDIO: StudioProfile = {
  name: 'Studio Pro Photography',
  address: 'Dhanmondi, Dhaka, Bangladesh',
  phone: '+880 1XXX-XXXXXX',
  email: 'hello@studiopro.com',
  website: 'www.studiopro.com',
  currency: '৳',
  taxNumber: 'BIN-123456789'
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('photo_studio_auth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('photo_studio_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [studioProfile, setStudioProfile] = useState<StudioProfile>(DEFAULT_STUDIO);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [envError, setEnvError] = useState<boolean>(false);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(currentUser?.mode === 'demo');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filterStatus, setFilterStatus] = useState<ShootStatus | 'All'>('All');
  const [filterEventType, setFilterEventType] = useState<string>('All');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'calendar' | 'maintenance'>('dashboard');
  const [isPrinting, setIsPrinting] = useState(false);
  const [printClient, setPrintClient] = useState<Client | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiClient, setAiClient] = useState<Client | null>(null);
  
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Check for environment variables and browser environment issues
  useEffect(() => {
    try {
      // Basic check to prevent app crash if process is missing
      if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) {
        console.warn("API_KEY not found in process.env. If running locally on WAMP, ensure you are using a dev server or build tool that supports .env files.");
        setEnvError(true);
      }
    } catch (e) {
      setEnvError(true);
    }
  }, []);

  const fetchFromDatabase = async () => {
    setBackendError(null);
    if (currentUser?.mode === 'demo') {
      const savedClients = localStorage.getItem('photo_studio_clients');
      if (savedClients) setClients(JSON.parse(savedClients));
      const savedProfile = localStorage.getItem('photo_studio_profile');
      if (savedProfile) setStudioProfile(JSON.parse(savedProfile));
      setIsOffline(true);
      return;
    }

    setIsSyncing(true);
    try {
      // Using relative path to api.php. Ensure this is served via http://localhost/...
      const clientRes = await fetch('api.php?type=clients');
      if (!clientRes.ok) {
        const errorData = await clientRes.json().catch(() => ({ message: `Server error: ${clientRes.status}` }));
        throw new Error(errorData.message || `API error: ${clientRes.status}`);
      }

      const clientData = await clientRes.json();
      const clientList = Array.isArray(clientData) ? clientData : [];
      setClients(clientList);
      localStorage.setItem('photo_studio_clients', JSON.stringify(clientList));

      const settingsRes = await fetch('api.php?type=settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData && !settingsData.status) {
          setStudioProfile(settingsData);
          localStorage.setItem('photo_studio_profile', JSON.stringify(settingsData));
        }
      }

      setIsOffline(false);
    } catch (error: any) {
      console.warn('Backend connection failed:', error.message);
      setBackendError(`Backend Error: ${error.message}. Please check if WAMP is running and api.php is accessible.`);
      setIsOffline(true);
      const savedClients = localStorage.getItem('photo_studio_clients');
      if (savedClients) setClients(JSON.parse(savedClients));
      const savedProfile = localStorage.getItem('photo_studio_profile');
      if (savedProfile) setStudioProfile(JSON.parse(savedProfile));
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFromDatabase();
    }
  }, [isAuthenticated, currentUser]);

  const saveToDatabase = async (client: Client) => {
    if (isOffline || currentUser?.mode === 'demo') return;
    try {
      const res = await fetch('api.php?type=clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
      });
      if (!res.ok) throw new Error('Failed to save to cloud');
    } catch (error) {
      setIsOffline(true);
    }
  };

  const updateStudioProfile = async (profile: StudioProfile) => {
    setStudioProfile(profile);
    localStorage.setItem('photo_studio_profile', JSON.stringify(profile));
    if (!isOffline && currentUser?.mode !== 'demo') {
      try {
        await fetch('api.php?type=settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile)
        });
      } catch (error) {}
    }
  };

  const stats = useMemo<DashboardStats>(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      totalClients: clients.length,
      totalRevenue: clients.reduce((sum, c) => sum + Number(c.totalPrice), 0),
      pendingPayments: clients.reduce((sum, c) => sum + (Number(c.totalPrice) - Number(c.paidAmount)), 0),
      upcomingShoots: clients.filter(c => c.eventDate >= today && c.status === ShootStatus.PENDING).length
    };
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            client.phone.includes(searchTerm) ||
                            client.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (client.location && client.location.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = filterStatus === 'All' || client.status === filterStatus;
      const matchesEventType = filterEventType === 'All' || client.eventType === filterEventType;
      const matchesDate = (!filterStartDate || client.eventDate >= filterStartDate) &&
                          (!filterEndDate || client.eventDate <= filterEndDate);
                          
      return matchesSearch && matchesStatus && matchesEventType && matchesDate;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [clients, searchTerm, filterStatus, filterEventType, filterStartDate, filterEndDate]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('All');
    setFilterEventType('All');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const handleAddClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'dueAmount'>) => {
    const newClient: Client = {
      ...clientData,
      id: Math.random().toString(36).substr(2, 9),
      dueAmount: clientData.totalPrice - clientData.paidAmount,
      createdAt: new Date().toISOString()
    };
    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    localStorage.setItem('photo_studio_clients', JSON.stringify(updatedClients));
    await saveToDatabase(newClient);
    setIsModalOpen(false);
  };

  const handleEditClient = async (updatedClient: Client) => {
    const clientWithDue = { ...updatedClient, dueAmount: updatedClient.totalPrice - updatedClient.paidAmount };
    const updatedClients = clients.map(c => c.id === clientWithDue.id ? clientWithDue : c);
    setClients(updatedClients);
    localStorage.setItem('photo_studio_clients', JSON.stringify(updatedClients));
    await saveToDatabase(clientWithDue);
    setEditingClient(null);
    setIsModalOpen(false);
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      const updatedClients = clients.filter(c => c.id !== id);
      setClients(updatedClients);
      localStorage.setItem('photo_studio_clients', JSON.stringify(updatedClients));
      if (!isOffline && currentUser?.mode !== 'demo') {
        try {
          await fetch(`api.php?type=clients&id=${id}`, { method: 'DELETE' });
        } catch (e) {}
      }
    }
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setIsDetailOpen(true);
  };

  const handleImportClients = (importedClients: Client[]) => {
    setClients(importedClients);
    localStorage.setItem('photo_studio_clients', JSON.stringify(importedClients));
    alert('Restored successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem('photo_studio_auth');
    localStorage.removeItem('photo_studio_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (!isAuthenticated) return <Login onLogin={(user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  }} />;

  return (
    <>
      {isPrinting && printClient && (
        <div className="print-only">
          <PrintPreview client={printClient} studio={studioProfile} />
          <button 
            onClick={() => setIsPrinting(false)}
            className="fixed bottom-8 right-8 bg-slate-900 text-white p-4 rounded-full shadow-2xl no-print hover:scale-110 transition-transform"
          >
            <X size={24} />
          </button>
        </div>
      )}

      <div className={`min-h-screen flex flex-col md:flex-row bg-slate-50 no-print ${isPrinting ? 'hidden' : ''}`}>
        <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-indigo-500 p-2 rounded-lg">
                <Camera className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Studio Pro</h1>
            </div>
            
            <nav className="space-y-2">
              <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </button>
              <button onClick={() => setActiveTab('clients')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'clients' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}>
                <Users size={20} />
                <span>Clients</span>
              </button>
              <button onClick={() => setActiveTab('calendar')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'calendar' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}>
                <CalendarIcon size={20} />
                <span>Calendar</span>
              </button>
              <button onClick={() => setActiveTab('maintenance')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'maintenance' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}>
                <Settings size={20} />
                <span>Settings</span>
              </button>
              <button onClick={fetchFromDatabase} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800">
                <CloudSync size={20} className={isSyncing ? 'animate-spin' : ''} />
                <span>Sync Cloud</span>
              </button>
            </nav>
          </div>
          
          <div className="mt-auto p-6 space-y-3">
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active User</p>
              <p className="text-sm font-bold text-white truncate">{currentUser?.username}</p>
            </div>
            {isOffline && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl mb-2 flex items-center gap-2 text-amber-500">
                <WifiOff size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Local Mode</span>
              </div>
            )}
            <button onClick={() => {setEditingClient(null); setIsModalOpen(true)}} className="w-full bg-white text-slate-900 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all shadow-lg">
              <Plus size={20} />
              <span>New Booking</span>
            </button>
            <button onClick={handleLogout} className="w-full text-slate-400 hover:text-white flex items-center justify-center gap-2 py-2 text-sm transition-colors">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto pb-12">
          {envError && (
             <div className="bg-amber-100 border-b border-amber-200 px-6 py-3 flex items-center gap-3 text-amber-800 text-sm">
                <Info size={18} />
                <p><strong>Config Note:</strong> API_KEY is missing from process.env. AI features will be disabled. 
                   If using WAMP, open the browser console (F12) to check for errors.</p>
             </div>
          )}

          {backendError && (
            <div className="bg-rose-500 text-white px-6 py-2 flex items-center justify-between text-xs font-bold animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{backendError}</span>
              </div>
              <button onClick={() => setBackendError(null)}><X size={14} /></button>
            </div>
          )}

          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-slate-800 capitalize">
                {activeTab === 'dashboard' ? 'Overview' : activeTab === 'clients' ? 'Client Records' : activeTab === 'calendar' ? 'Booking Calendar' : 'Settings & Tools'}
              </h2>
            </div>
            
            <div className="flex items-center gap-4 w-full max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Search by name, phone or event..." className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
          </header>

          <div className="p-6 max-w-7xl mx-auto space-y-8">
            {activeTab === 'dashboard' && (
              <>
                <DashboardCards stats={stats} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Recent Clients</h3>
                        <button onClick={() => setActiveTab('clients')} className="text-indigo-600 text-sm font-medium hover:underline">View All</button>
                      </div>
                      <ClientTable clients={filteredClients.slice(0, 5)} onDelete={handleDeleteClient} onEdit={(c) => {setEditingClient(c); setIsModalOpen(true)}} onPrint={(c) => {setPrintClient(c); setIsPrinting(true)}} onAI={(c) => {setAiClient(c); setIsAIOpen(true)}} onView={handleViewClient} />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-800 mb-4">Quick Financials</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-indigo-50 rounded-xl">
                        <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">Total Collections</p>
                        <p className="text-2xl font-bold text-slate-900">{studioProfile.currency}{stats.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-rose-50 rounded-xl">
                        <p className="text-xs text-rose-600 font-bold uppercase tracking-wider mb-1">Outstanding</p>
                        <p className="text-2xl font-bold text-slate-900">{studioProfile.currency}{stats.pendingPayments.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'clients' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-end gap-4">
                  <div className="flex-1 min-w-[150px] space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shoot Status</label>
                    <div className="relative">
                      <select 
                        className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-bold text-sm text-slate-700 cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as ShootStatus | 'All')}
                      >
                        <option value="All">All Statuses</option>
                        {Object.values(ShootStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-[150px] space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Type</label>
                    <div className="relative">
                      <select 
                        className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-bold text-sm text-slate-700 cursor-pointer"
                        value={filterEventType}
                        onChange={(e) => setFilterEventType(e.target.value)}
                      >
                        <option value="All">All Types</option>
                        <option>Wedding</option><option>Birthday</option><option>Corporate</option><option>Photoshoot</option><option>Portfolio</option><option>Other</option>
                      </select>
                      <Camera className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                    </div>
                  </div>

                  <div className="flex-[1.5] min-w-[300px] grid grid-cols-2 gap-2 space-y-0">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Date</label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm text-slate-700"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To Date</label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm text-slate-700"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={resetFilters}
                    className="p-2 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
                    title="Reset Filters"
                  >
                    <RotateCcw size={16} />
                    <span>Clear</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Showing {filteredClients.length} of {clients.length} Records</p>
                  </div>
                  <ClientTable clients={filteredClients} onDelete={handleDeleteClient} onEdit={(c) => {setEditingClient(c); setIsModalOpen(true)}} onPrint={(c) => {setPrintClient(c); setIsPrinting(true)}} onAI={(c) => {setAiClient(c); setIsAIOpen(true)}} onView={handleViewClient} />
                </div>
              </div>
            )}

            {activeTab === 'calendar' && (
              <CalendarTab 
                clients={clients} 
                onViewClient={handleViewClient}
              />
            )}

            {activeTab === 'maintenance' && (
              <Maintenance 
                clients={clients} 
                onImport={handleImportClients} 
                studioProfile={studioProfile} 
                onUpdateProfile={updateStudioProfile} 
              />
            )}
          </div>
        </main>

        {isModalOpen && (
          <ClientModal client={editingClient} onClose={() => setIsModalOpen(false)} onSubmit={editingClient ? handleEditClient : handleAddClient} />
        )}

        {isAIOpen && aiClient && (
          <AIConceptGenerator client={aiClient} onClose={() => setIsAIOpen(false)} />
        )}

        {isDetailOpen && selectedClient && (
          <ClientDetailModal client={selectedClient} onClose={() => setIsDetailOpen(false)} currency={studioProfile.currency} />
        )}
      </div>
    </>
  );
};

export default App;
