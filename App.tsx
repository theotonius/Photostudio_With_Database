
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Users, Camera, DollarSign, Calendar as CalendarIcon, Printer, Trash2, Edit2, Sparkles, X, ChevronRight, LayoutDashboard, UserPlus, LogOut, Database, Download, CloudSync, Save, Settings, ShieldCheck, WifiOff, Filter, RotateCcw, AlertCircle, Info, Contact as ContactIcon, Cloud } from 'lucide-react';
import { Client, ShootStatus, DashboardStats, StudioProfile, Contact } from './types.ts';
import ClientModal from './components/ClientModal.tsx';
import DashboardCards from './components/DashboardCards.tsx';
import ClientTable from './components/ClientTable.tsx';
import PrintPreview from './components/PrintPreview.tsx';
import AIConceptGenerator from './components/AIConceptGenerator.tsx';
import Login from './components/Login.tsx';
import Maintenance from './components/Maintenance.tsx';
import ClientDetailModal from './components/ClientDetailModal.tsx';
import CalendarTab from './components/CalendarTab.tsx';
import ContactTable from './components/ContactTable.tsx';
import ContactModal from './components/ContactModal.tsx';

// Import Firebase (assuming the user will fill config in firebase.ts)
import { db, collection, getDocs, setDoc, doc, deleteDoc, query, orderBy } from './firebase.ts';

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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [studioProfile, setStudioProfile] = useState<StudioProfile>(DEFAULT_STUDIO);
  
  // Storage Mode Selection
  const [storageMode, setStorageMode] = useState<'local' | 'sql' | 'firebase'>(() => {
    return (localStorage.getItem('studio_storage_mode') as any) || 'local';
  });

  const [isOffline, setIsOffline] = useState(currentUser?.mode === 'demo');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'calendar' | 'contacts' | 'maintenance'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printClient, setPrintClient] = useState<Client | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiClient, setAiClient] = useState<Client | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const fetchFromFirebase = async () => {
    try {
      const clientsSnap = await getDocs(query(collection(db, "clients"), orderBy("createdAt", "desc")));
      const clientsData = clientsSnap.docs.map(doc => ({ ...doc.data() as Client, id: doc.id }));
      setClients(clientsData);

      const contactsSnap = await getDocs(query(collection(db, "contacts"), orderBy("name", "asc")));
      const contactsData = contactsSnap.docs.map(doc => ({ ...doc.data() as Contact, id: doc.id }));
      setContacts(contactsData);

      const settingsSnap = await getDocs(collection(db, "settings"));
      if (!settingsSnap.empty) {
        setStudioProfile(settingsSnap.docs[0].data() as StudioProfile);
      }
    } catch (error) {
      console.error("Firebase fetch error:", error);
      setIsOffline(true);
    }
  };

  const fetchFromDatabase = async () => {
    if (storageMode === 'firebase') {
      return fetchFromFirebase();
    }

    if (currentUser?.mode === 'demo' || isOffline || storageMode === 'local') {
      const savedClients = localStorage.getItem('photo_studio_clients');
      if (savedClients) setClients(JSON.parse(savedClients));
      const savedContacts = localStorage.getItem('photo_studio_contacts');
      if (savedContacts) setContacts(JSON.parse(savedContacts));
      const savedProfile = localStorage.getItem('photo_studio_profile');
      if (savedProfile) setStudioProfile(JSON.parse(savedProfile));
      return;
    }

    try {
      const clientRes = await fetch('api.php?type=clients');
      if (clientRes.ok) {
        const clientData = await clientRes.json();
        setClients(Array.isArray(clientData) ? clientData : []);
      }

      const contactRes = await fetch('api.php?type=contacts');
      if (contactRes.ok) {
        const contactData = await contactRes.json();
        setContacts(Array.isArray(contactData) ? contactData : []);
      }

      const settingsRes = await fetch('api.php?type=settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData && settingsData.name) setStudioProfile(settingsData);
      }
    } catch (error) {
      console.warn('Backend failed, switching to local mode');
      setIsOffline(true);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchFromDatabase();
  }, [isAuthenticated, storageMode]);

  const stats = useMemo<DashboardStats>(() => {
    return {
      totalClients: clients.length,
      totalRevenue: clients.reduce((sum, c) => sum + Number(c.totalPrice), 0),
      pendingPayments: clients.reduce((sum, c) => sum + (Number(c.totalPrice) - Number(c.paidAmount)), 0),
      upcomingShoots: clients.filter(c => c.status === ShootStatus.PENDING).length
    };
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      client.phone.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      contact.phone.includes(searchTerm)
    );
  }, [contacts, searchTerm]);

  const handleSaveClient = async (clientData: any) => {
    const id = editingClient ? editingClient.id : Math.random().toString(36).substr(2, 9);
    const createdAt = editingClient ? editingClient.createdAt : new Date().toISOString();
    const finalClient = { ...clientData, id, createdAt };

    // Update Local State
    let updatedClients;
    if (editingClient) {
      updatedClients = clients.map(c => c.id === id ? finalClient : c);
    } else {
      updatedClients = [...clients, finalClient];
    }
    setClients(updatedClients);
    localStorage.setItem('photo_studio_clients', JSON.stringify(updatedClients));

    // Firebase Sync
    if (storageMode === 'firebase') {
      try {
        await setDoc(doc(db, "clients", id), finalClient);
      } catch (e) { console.error("Firebase save error:", e); }
    } 
    // SQL Sync
    else if (storageMode === 'sql' && !isOffline) {
      try {
        await fetch('api.php?type=clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalClient)
        });
      } catch (e) { console.error(e); }
    }

    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleSaveContact = async (contactData: any) => {
    const id = editingContact ? editingContact.id : Math.random().toString(36).substr(2, 9);
    const createdAt = editingContact ? editingContact.createdAt : new Date().toISOString();
    const finalContact = { ...contactData, id, createdAt };

    let updatedContacts;
    if (editingContact) {
      updatedContacts = contacts.map(c => c.id === id ? finalContact : c);
    } else {
      updatedContacts = [...contacts, finalContact];
    }
    setContacts(updatedContacts);
    localStorage.setItem('photo_studio_contacts', JSON.stringify(updatedContacts));

    if (storageMode === 'firebase') {
      try {
        await setDoc(doc(db, "contacts", id), finalContact);
      } catch (e) { console.error(e); }
    } else if (storageMode === 'sql' && !isOffline) {
      try {
        await fetch('api.php?type=contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalContact)
        });
      } catch (e) { console.error(e); }
    }

    setIsContactModalOpen(false);
    setEditingContact(null);
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      const updated = clients.filter(c => c.id !== id);
      setClients(updated);
      localStorage.setItem('photo_studio_clients', JSON.stringify(updated));
      
      if (storageMode === 'firebase') {
        await deleteDoc(doc(db, "clients", id));
      } else if (storageMode === 'sql' && !isOffline) {
        await fetch(`api.php?type=clients&id=${id}`, { method: 'DELETE' });
      }
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm('Delete this contact?')) {
      const updated = contacts.filter(c => c.id !== id);
      setContacts(updated);
      localStorage.setItem('photo_studio_contacts', JSON.stringify(updated));
      
      if (storageMode === 'firebase') {
        await deleteDoc(doc(db, "contacts", id));
      } else if (storageMode === 'sql' && !isOffline) {
        await fetch(`api.php?type=contacts&id=${id}`, { method: 'DELETE' });
      }
    }
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
      <aside className="w-64 bg-slate-900 text-white flex flex-col no-print shrink-0">
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
          <button onClick={() => setActiveTab('contacts')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'contacts' ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <ContactIcon size={20} />
            <span className="font-bold">Contacts</span>
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
          <button onClick={() => { setEditingClient(null); setIsModalOpen(true); }} className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/20">
            <Plus size={20} />
            <span>New Booking</span>
          </button>
          <button onClick={handleLogout} className="w-full mt-4 text-slate-500 hover:text-white flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-widest transition-colors">
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 no-print shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-slate-800 capitalize">{activeTab}</h2>
            <div className="flex gap-2">
              {storageMode === 'firebase' && <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><Cloud size={12}/> Firebase Cloud</span>}
              {storageMode === 'sql' && <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><Database size={12}/> SQL Server</span>}
              {isOffline && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><WifiOff size={12}/> Offline Mode</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={`Search ${activeTab === 'contacts' ? 'contacts' : 'clients'}...`} 
                className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <DashboardCards stats={stats} />
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Recent Activities</h3>
                  <button onClick={() => setActiveTab('clients')} className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline">View All</button>
                </div>
                <ClientTable clients={filteredClients.slice(0, 5)} onDelete={handleDeleteClient} onEdit={(c) => {setEditingClient(c); setIsModalOpen(true);}} onPrint={(c) => {setPrintClient(c); setIsPrinting(true);}} onAI={(c) => {setAiClient(c); setIsAIOpen(true);}} onView={(c) => {setSelectedClient(c); setIsDetailOpen(true);}} />
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
               <ClientTable clients={filteredClients} onDelete={handleDeleteClient} onEdit={(c) => {setEditingClient(c); setIsModalOpen(true);}} onPrint={(c) => {setPrintClient(c); setIsPrinting(true);}} onAI={(c) => {setAiClient(c); setIsAIOpen(true);}} onView={(c) => {setSelectedClient(c); setIsDetailOpen(true);}} />
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Personal & Business Contacts</h3>
                <button onClick={() => {setEditingContact(null); setIsContactModalOpen(true);}} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                  <Plus size={20} /> Add New Contact
                </button>
              </div>
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <ContactTable contacts={filteredContacts} onDelete={handleDeleteContact} onEdit={(c) => {setEditingContact(c); setIsContactModalOpen(true);}} />
              </div>
            </div>
          )}

          {activeTab === 'calendar' && <CalendarTab clients={clients} onViewClient={(c) => {setSelectedClient(c); setIsDetailOpen(true);}} />}
          {activeTab === 'maintenance' && <Maintenance clients={clients} contacts={contacts} onImport={(c) => setClients(c)} studioProfile={studioProfile} onUpdateProfile={setStudioProfile} storageMode={storageMode} onStorageModeChange={setStorageMode} />}
        </div>
      </main>

      {isModalOpen && <ClientModal client={editingClient} onClose={() => { setIsModalOpen(false); setEditingClient(null); }} onSubmit={handleSaveClient} />}
      {isContactModalOpen && <ContactModal contact={editingContact} onClose={() => { setIsContactModalOpen(false); setEditingContact(null); }} onSubmit={handleSaveContact} />}
      {isAIOpen && aiClient && <AIConceptGenerator client={aiClient} onClose={() => setIsAIOpen(false)} />}
      {isDetailOpen && selectedClient && <ClientDetailModal client={selectedClient} onClose={() => setIsDetailOpen(false)} currency={studioProfile.currency} />}
      
      {isPrinting && printClient && (
        <div className="fixed inset-0 z-[100] bg-white overflow-auto">
          <PrintPreview client={printClient} studio={studioProfile} />
          <div className="fixed bottom-8 right-8 no-print flex gap-4">
            <button onClick={() => window.print()} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-2xl flex items-center gap-2"><Printer size={20} /> Print Now</button>
            <button onClick={() => setIsPrinting(false)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-2xl flex items-center gap-2"><X size={20} /> Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
