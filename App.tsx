
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Users, Camera, DollarSign, Calendar as CalendarIcon, Printer, Trash2, Edit2, Sparkles, X, ChevronRight, LayoutDashboard, LogOut, Settings, WifiOff } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
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

// Firebase Initialize
const app = initializeApp((window as any).firebaseConfig);
const db = getFirestore(app);

const DEFAULT_STUDIO: StudioProfile = {
  name: 'Modern Photo Studio',
  address: 'আপনার স্টুডিওর ঠিকানা',
  phone: '+880 1XXXXXXXXX',
  email: 'studio@example.com',
  website: 'www.yourstudio.com',
  currency: '৳'
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('photo_studio_auth') === 'true');
  const [clients, setClients] = useState<Client[]>([]);
  const [studioProfile, setStudioProfile] = useState<StudioProfile>(DEFAULT_STUDIO);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'calendar' | 'maintenance'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printClient, setPrintClient] = useState<Client | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiClient, setAiClient] = useState<Client | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Real-time listener for Firebase
  useEffect(() => {
    if (!isAuthenticated) return;

    const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
      setClients(clientList);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const stats = useMemo<DashboardStats>(() => ({
    totalClients: clients.length,
    totalRevenue: clients.reduce((sum, c) => sum + Number(c.totalPrice), 0),
    pendingPayments: clients.reduce((sum, c) => sum + (Number(c.totalPrice) - Number(c.paidAmount)), 0),
    upcomingShoots: clients.filter(c => c.status === ShootStatus.PENDING).length
  }), [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      client.phone.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  const handleAddClient = async (clientData: any) => {
    try {
      await addDoc(collection(db, 'clients'), {
        ...clientData,
        createdAt: new Date().toISOString()
      });
      setIsModalOpen(false);
    } catch (e) {
      alert('Error saving to Firebase: ' + e);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      await deleteDoc(doc(db, 'clients', id));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('photo_studio_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <aside className="w-64 bg-slate-900 text-white flex flex-col no-print">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-xl shadow-lg"><Camera size={24} /></div>
          <h1 className="text-xl font-black">STUDIO PRO</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'dashboard' ? 'bg-indigo-600' : 'text-slate-400'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('clients')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'clients' ? 'bg-indigo-600' : 'text-slate-400'}`}>
            <Users size={20} /> Clients
          </button>
          <button onClick={() => setActiveTab('calendar')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'calendar' ? 'bg-indigo-600' : 'text-slate-400'}`}>
            <CalendarIcon size={20} /> Calendar
          </button>
          <button onClick={() => setActiveTab('maintenance')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'maintenance' ? 'bg-indigo-600' : 'text-slate-400'}`}>
            <Settings size={20} /> Settings
          </button>
        </nav>
        <div className="p-6">
          <button onClick={() => setIsModalOpen(true)} className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl"><Plus size={20} /> New Booking</button>
          <button onClick={handleLogout} className="w-full mt-4 text-slate-500 hover:text-white flex items-center justify-center gap-2 py-2">Logout</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 no-print">
          <h2 className="text-xl font-black text-slate-800 capitalize">{activeTab}</h2>
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search clients..." className="w-full pl-12 pr-4 py-2.5 bg-slate-100 rounded-2xl outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <DashboardCards stats={stats} />
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <ClientTable clients={filteredClients.slice(0, 5)} onDelete={handleDeleteClient} onEdit={() => {}} onPrint={(c) => {setPrintClient(c); setIsPrinting(true);}} onAI={(c) => {setAiClient(c); setIsAIOpen(true);}} onView={(c) => {setSelectedClient(c); setIsDetailOpen(true);}} />
              </div>
            </div>
          )}
          {activeTab === 'clients' && <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden"><ClientTable clients={filteredClients} onDelete={handleDeleteClient} onEdit={() => {}} onPrint={(c) => {setPrintClient(c); setIsPrinting(true);}} onAI={(c) => {setAiClient(c); setIsAIOpen(true);}} onView={(c) => {setSelectedClient(c); setIsDetailOpen(true);}} /></div>}
          {activeTab === 'calendar' && <CalendarTab clients={clients} onViewClient={(c) => {setSelectedClient(c); setIsDetailOpen(true);}} />}
          {activeTab === 'maintenance' && <Maintenance clients={clients} onImport={() => {}} studioProfile={studioProfile} onUpdateProfile={setStudioProfile} />}
        </div>
      </main>

      {isModalOpen && <ClientModal client={null} onClose={() => setIsModalOpen(false)} onSubmit={handleAddClient} />}
      {isAIOpen && aiClient && <AIConceptGenerator client={aiClient} onClose={() => setIsAIOpen(false)} />}
      {isDetailOpen && selectedClient && <ClientDetailModal client={selectedClient} onClose={() => setIsDetailOpen(false)} currency={studioProfile.currency} />}
      
      {isPrinting && printClient && (
        <div className="fixed inset-0 z-[100] bg-white overflow-auto">
          <PrintPreview client={printClient} studio={studioProfile} />
          <div className="fixed bottom-8 right-8 no-print flex gap-4">
            <button onClick={() => window.print()} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-2xl flex items-center gap-2"><Printer size={20} /> Print</button>
            <button onClick={() => setIsPrinting(false)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-2xl flex items-center gap-2"><X size={20} /> Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
