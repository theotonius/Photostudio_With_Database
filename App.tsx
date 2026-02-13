
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Users, Camera, DollarSign, Calendar as CalendarIcon, Printer, Trash2, Edit2, Sparkles, X, ChevronRight, LayoutDashboard, UserPlus, LogOut, Database, Download, CloudSync, Save, Settings, ShieldCheck, WifiOff, Filter, RotateCcw, AlertCircle, Info } from 'lucide-react';
import { Client, ShootStatus, DashboardStats, StudioProfile } from './types.ts';
import ClientModal from './components/ClientModal.tsx';
import DashboardCards from './components/DashboardCards.tsx';
import ClientTable from './components/ClientTable.tsx';
import PrintPreview from './components/PrintPreview.tsx';
import AIConceptGenerator from './components/AIConceptGenerator.tsx';
import Login from './components/Login.tsx';
import Maintenance from './components/Maintenance.tsx';
import ClientDetailModal from './components/ClientDetailModal.tsx';
import CalendarTab from './components/CalendarTab.tsx';

const DEFAULT_STUDIO: StudioProfile = {
  name: 'Modern Photo Studio',
  address: 'আপনার স্টুডিওর ঠিকানা এখানে লিখুন',
  phone: '+880 1XXXXXXXXX',
  email: 'studio@example.com',
  website: 'www.yourstudio.com',
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

  useEffect(() => {
    if (typeof (window as any).process === 'undefined' || !(window as any).process.env.API_KEY || (window as any).process.env.API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      setEnvError(true);
    }
  }, []);

  const fetchFromDatabase = async () => {
    setBackendError(null);
    if (currentUser?.mode === 'demo' || isOffline) {
      const savedClients = localStorage.getItem('photo_studio_clients');
      if (savedClients) setClients(JSON.parse(savedClients));
      const savedProfile = localStorage.getItem('photo_studio_profile');
      if (savedProfile) setStudioProfile(JSON.parse(savedProfile));
      return;
    }

    setIsSyncing(true);
    try {
      const clientRes = await fetch('api.php?type=clients');
      if (!clientRes.ok) throw new Error(`API error: ${clientRes.status}`);
      const clientData = await clientRes.json();
      setClients(Array.isArray(clientData) ? clientData : []);

      const settingsRes = await fetch('api.php?type=settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData && settingsData.name) setStudioProfile(settingsData);
      }
    } catch (error: any) {
      console.warn('Backend failed, switching to local mode');
      setIsOffline(true);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchFromDatabase();
  }, [isAuthenticated]);

  const stats = useMemo<DashboardStats>(() => {
    return {
      totalClients: clients.length,
      totalRevenue: clients.reduce((sum, c) => sum + Number(c.totalPrice), 0),
      pendingPayments: clients.reduce((sum, c) => sum + (Number(c.totalPrice) - Number(c.paidAmount)), 0),
      upcomingShoots: clients.filter(c => c.status === ShootStatus.PENDING).length
    };
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.phone.includes(searchTerm);
      const matchesStatus = filterStatus === 'All' || client.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, filterStatus]);

  const handleAddClient = (clientData: any) => {
    const newClient = { ...clientData, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    const updated = [...clients, newClient];
    setClients(updated);
    localStorage.setItem('photo_studio_clients', JSON.stringify(updated));
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('photo_studio_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) return <Login onLogin={(user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('photo_studio_auth', 'true');
    localStorage.setItem('photo_studio_user', JSON.stringify(user));
  }} />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col no-print">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
            <Camera size={24} />
          </div>
          <h1 className="text-xl font-black tracking-tight">STUDIO PRO</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <LayoutDashboard size={20} />
            <span className="font-bold">Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('clients')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'clients' ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <Users size={20} />
            <span className="font-bold">Clients</span>
          </button>
          <button onClick={() => setActiveTab('calendar')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'calendar' ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <CalendarIcon size={20} />
            <span className="font-bold">Calendar</span>
          </button>
          <button onClick={() => setActiveTab('maintenance')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'maintenance' ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <Settings size={20} />
            <span className="font-bold">Settings</span>
          </button>
        </nav>

        <div className="p-6">
          <button onClick={() => setIsModalOpen(true)} className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/20">
            <Plus size={20} />
            <span>New Booking</span>
          </button>
          <button onClick={handleLogout} className="w-full mt-4 text-slate-500 hover:text-white flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-widest transition-colors">
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 no-print shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-slate-800 capitalize">{activeTab}</h2>
            {isOffline && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><WifiOff size={12}/> Offline Mode</span>}
          </div>
          
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search clients..." 
                className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {envError && activeTab === 'dashboard' && (
            <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4 text-indigo-700 shadow-sm animate-in fade-in duration-500">
              <Sparkles className="shrink-0" size={24} />
              <p className="text-sm font-medium">
                <strong>AI Feature Notice:</strong> Please add your <strong>Gemini API Key</strong> in <code>index.html</code> to enable the AI Shoot Assistant.
              </p>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <DashboardCards stats={stats} />
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Recent Activities</h3>
                  <button onClick={() => setActiveTab('clients')} className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline">View All</button>
                </div>
                <ClientTable 
                  clients={filteredClients.slice(0, 5)} 
                  onDelete={() => {}} 
                  onEdit={() => {}} 
                  onPrint={(c) => {setPrintClient(c); setIsPrinting(true);}} 
                  onAI={(c) => {setAiClient(c); setIsAIOpen(true);}} 
                  onView={(c) => {setSelectedClient(c); setIsDetailOpen(true);}} 
                />
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
               <ClientTable 
                clients={filteredClients} 
                onDelete={() => {}} 
                onEdit={() => {}} 
                onPrint={(c) => {setPrintClient(c); setIsPrinting(true);}} 
                onAI={(c) => {setAiClient(c); setIsAIOpen(true);}} 
                onView={(c) => {setSelectedClient(c); setIsDetailOpen(true);}} 
              />
            </div>
          )}

          {activeTab === 'calendar' && <CalendarTab clients={clients} onViewClient={(c) => {setSelectedClient(c); setIsDetailOpen(true);}} />}
          
          {activeTab === 'maintenance' && (
            <Maintenance 
              clients={clients} 
              onImport={(c) => setClients(c)} 
              studioProfile={studioProfile} 
              onUpdateProfile={setStudioProfile} 
            />
          )}
        </div>
      </main>

      {/* Modals */}
      {isModalOpen && <ClientModal client={null} onClose={() => setIsModalOpen(false)} onSubmit={handleAddClient} />}
      {isAIOpen && aiClient && <AIConceptGenerator client={aiClient} onClose={() => setIsAIOpen(false)} />}
      {isDetailOpen && selectedClient && <ClientDetailModal client={selectedClient} onClose={() => setIsDetailOpen(false)} currency={studioProfile.currency} />}
      
      {isPrinting && printClient && (
        <div className="fixed inset-0 z-[100] bg-white overflow-auto">
          <PrintPreview client={printClient} studio={studioProfile} />
          <div className="fixed bottom-8 right-8 no-print flex gap-4">
            <button onClick={() => window.print()} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-2xl flex items-center gap-2">
              <Printer size={20} /> Print Now
            </button>
            <button onClick={() => setIsPrinting(false)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-2xl flex items-center gap-2">
              <X size={20} /> Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
