
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Users, Camera, DollarSign, Calendar, Printer, Trash2, Edit2, Sparkles, X, ChevronRight, LayoutDashboard, UserPlus, LogOut, Database, Download, CloudSync, Save, Settings, ShieldCheck, WifiOff } from 'lucide-react';
import { Client, ShootStatus, DashboardStats, StudioProfile } from './types';
import ClientModal from './components/ClientModal';
import DashboardCards from './components/DashboardCards';
import ClientTable from './components/ClientTable';
import PrintPreview from './components/PrintPreview';
import AIConceptGenerator from './components/AIConceptGenerator';
import Login from './components/Login';
import Maintenance from './components/Maintenance';
import ClientDetailModal from './components/ClientDetailModal';

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

  const [clients, setClients] = useState<Client[]>([]);
  const [studioProfile, setStudioProfile] = useState<StudioProfile>(DEFAULT_STUDIO);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'maintenance'>('dashboard');
  const [isPrinting, setIsPrinting] = useState(false);
  const [printClient, setPrintClient] = useState<Client | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiClient, setAiClient] = useState<Client | null>(null);
  
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const fetchFromDatabase = async () => {
    setIsSyncing(true);
    try {
      // Fetch Clients
      const clientRes = await fetch('api.php?type=clients');
      const clientData = await clientRes.json();
      const clientList = Array.isArray(clientData) ? clientData : [];
      setClients(clientList);
      localStorage.setItem('photo_studio_clients', JSON.stringify(clientList));

      // Fetch Settings
      const settingsRes = await fetch('api.php?type=settings');
      const settingsData = await settingsRes.json();
      if (settingsData) {
        setStudioProfile(settingsData);
        localStorage.setItem('photo_studio_profile', JSON.stringify(settingsData));
      } else {
        // If no settings in DB, use local or default
        const saved = localStorage.getItem('photo_studio_profile');
        if (saved) setStudioProfile(JSON.parse(saved));
      }

      setIsOffline(false);
    } catch (error) {
      console.error('Fetch error:', error);
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
  }, [isAuthenticated]);

  const saveToDatabase = async (client: Client) => {
    if (isOffline) return;
    try {
      await fetch('api.php?type=clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
      });
    } catch (error) {
      setIsOffline(true);
    }
  };

  const updateStudioProfile = async (profile: StudioProfile) => {
    setStudioProfile(profile);
    localStorage.setItem('photo_studio_profile', JSON.stringify(profile));
    
    if (!isOffline) {
      try {
        await fetch('api.php?type=settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile)
        });
      } catch (error) {
        console.error('Failed to sync settings:', error);
      }
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

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.eventType.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
      if (!isOffline) await fetch(`api.php?type=clients&id=${id}`, { method: 'DELETE' });
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
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

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
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-slate-800 capitalize">
                {activeTab === 'dashboard' ? 'Overview' : activeTab === 'clients' ? 'Client Records' : 'Settings & Tools'}
              </h2>
            </div>
            
            <div className="flex items-center gap-4 w-full max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <ClientTable clients={filteredClients} onDelete={handleDeleteClient} onEdit={(c) => {setEditingClient(c); setIsModalOpen(true)}} onPrint={(c) => {setPrintClient(c); setIsPrinting(true)}} onAI={(c) => {setAiClient(c); setIsAIOpen(true)}} onView={handleViewClient} />
              </div>
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
