
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Users, Camera, DollarSign, Calendar, Printer, Trash2, Edit2, Sparkles, X, ChevronRight, LayoutDashboard, UserPlus, LogOut, Database, Download, CloudSync, Save } from 'lucide-react';
import { Client, ShootStatus, DashboardStats } from './types';
import ClientModal from './components/ClientModal';
import DashboardCards from './components/DashboardCards';
import ClientTable from './components/ClientTable';
import PrintPreview from './components/PrintPreview';
import AIConceptGenerator from './components/AIConceptGenerator';
import Login from './components/Login';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('photo_studio_auth') === 'true';
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients'>('dashboard');
  const [isPrinting, setIsPrinting] = useState(false);
  const [printClient, setPrintClient] = useState<Client | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiClient, setAiClient] = useState<Client | null>(null);

  // ডাটাবেস থেকে ডাটা লোড করা
  const fetchFromDatabase = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('api.php');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setClients(Array.isArray(data) ? data : []);
      localStorage.setItem('photo_studio_clients', JSON.stringify(data));
    } catch (error) {
      console.error("Sync failed, using offline data", error);
      const saved = localStorage.getItem('photo_studio_clients');
      if (saved) setClients(JSON.parse(saved));
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchFromDatabase();
  }, []);

  // ডাটাবেসে সেভ করার ফাংশন
  const saveToDatabase = async (client: Client) => {
    try {
      await fetch('api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
      });
    } catch (error) {
      console.error("Failed to save to cloud", error);
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

  const handleAddClient = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    localStorage.setItem('photo_studio_clients', JSON.stringify(updatedClients));
    await saveToDatabase(newClient);
    setIsModalOpen(false);
  };

  const handleEditClient = async (updatedClient: Client) => {
    const updatedClients = clients.map(c => c.id === updatedClient.id ? updatedClient : c);
    setClients(updatedClients);
    localStorage.setItem('photo_studio_clients', JSON.stringify(updatedClients));
    await saveToDatabase(updatedClient);
    setEditingClient(null);
    setIsModalOpen(false);
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      const updatedClients = clients.filter(c => c.id !== id);
      setClients(updatedClients);
      localStorage.setItem('photo_studio_clients', JSON.stringify(updatedClients));
      try {
        await fetch(`api.php?id=${id}`, { method: 'DELETE' });
      } catch (e) {
        console.error("Delete from server failed");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('photo_studio_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      {isPrinting && printClient && (
        <div className="print-only">
          <PrintPreview client={printClient} />
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
              <button onClick={fetchFromDatabase} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800">
                <CloudSync size={20} className={isSyncing ? 'animate-spin' : ''} />
                <span>Refresh Data</span>
              </button>
            </nav>
          </div>
          
          <div className="mt-auto p-6 space-y-3">
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
            <h2 className="text-2xl font-bold text-slate-800 capitalize">{activeTab === 'dashboard' ? 'Overview' : 'Client Records'}</h2>
            
            <div className="flex items-center gap-4 w-full max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Search by name or event..." className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button onClick={fetchFromDatabase} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2 px-4">
                <CloudSync size={18} className={isSyncing ? 'animate-spin' : ''} />
                <span className="font-medium text-sm">Sync Now</span>
              </button>
            </div>
          </header>

          <div className="p-6 max-w-7xl mx-auto space-y-8">
            {activeTab === 'dashboard' ? (
              <>
                <DashboardCards stats={stats} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Recent Clients</h3>
                        <button onClick={() => setActiveTab('clients')} className="text-indigo-600 text-sm font-medium hover:underline">View All</button>
                      </div>
                      <ClientTable clients={filteredClients.slice(0, 5)} onDelete={handleDeleteClient} onEdit={(c) => {setEditingClient(c); setIsModalOpen(true)}} onPrint={(c) => {setPrintClient(c); setIsPrinting(true)}} onAI={(c) => {setAiClient(c); setIsAIOpen(true)}} />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-800 mb-4">Financial Status</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-indigo-50 rounded-xl">
                        <p className="text-sm text-indigo-600 font-medium">Total Billing</p>
                        <p className="text-2xl font-bold text-slate-900">৳{stats.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-xl">
                        <p className="text-sm text-amber-600 font-medium">Due Balance</p>
                        <p className="text-2xl font-bold text-slate-900">৳{stats.pendingPayments.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <ClientTable clients={filteredClients} onDelete={handleDeleteClient} onEdit={(c) => {setEditingClient(c); setIsModalOpen(true)}} onPrint={(c) => {setPrintClient(c); setIsPrinting(true)}} onAI={(c) => {setAiClient(c); setIsAIOpen(true)}} />
              </div>
            )}
          </div>
        </main>

        {isModalOpen && (
          <ClientModal client={editingClient} onClose={() => setIsModalOpen(false)} onSubmit={editingClient ? handleEditClient : handleAddClient} />
        )}

        {isAIOpen && aiClient && (
          <AIConceptGenerator client={aiClient} onClose={() => setIsAIOpen(false)} />
        )}
      </div>
    </>
  );
};

export default App;
