import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import RPPHForm from './components/RPPHForm';
import RPPHView from './components/RPPHView';
import Library from './components/Library';
import Reference from './components/Reference';
import Login from './components/Login';
import Settings from './components/Settings';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, History, Trash2, FileText, Loader2 } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';

export default function App() {
  const { user, profile } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [isAdminPortal, setIsAdminPortal] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('portal') === 'admin' || localStorage.getItem('admin_authenticated') === 'true';
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => 
    localStorage.getItem('admin_authenticated') === 'true'
  );
  const [history, setHistory] = useState<any[]>([]);
  const [currentRPPH, setCurrentRPPH] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listen for custom navigation events (from components deeper in tree)
  useEffect(() => {
    const handleCustomNavigate = (e: any) => {
      setCurrentPage(e.detail);
      if (e.detail === 'create') setCurrentRPPH(null);
    };
    window.addEventListener('navigate', handleCustomNavigate);
    return () => window.removeEventListener('navigate', handleCustomNavigate);
  }, []);

  // Sync RPPH History from Firestore
  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    setFetchingHistory(true);
    const q = query(
      collection(db, 'rpphs'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setHistory(docs);
      setFetchingHistory(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'rpphs');
      setFetchingHistory(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Admin Portal Views
  if (isAdminPortal) {
    if (!isAdminAuthenticated) {
      return <AdminLogin onLogin={() => {
        setIsAdminAuthenticated(true);
        localStorage.setItem('admin_authenticated', 'true');
      }} />;
    }
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <AdminDashboard onBack={() => {
          setIsAdminAuthenticated(false);
          setIsAdminPortal(false);
          localStorage.removeItem('admin_authenticated');
          window.location.href = '/'; // Clear portal param
        }} />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const handleGenerate = async (formData: any) => {
    if (!user) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-rpph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Terjadi kesalahan saat membuat RPPH');
      }

      const data = await response.json();
      
      // Save to Firestore
      const rpphRef = collection(db, 'rpphs');
      const docRef = await addDoc(rpphRef, {
        ...data,
        userId: user.uid,
        teacherName: formData.teacherName,
        schoolName: formData.schoolName,
        schoolAddress: formData.schoolAddress,
        date: formData.date,
        theme: formData.theme,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const newRPPH = {
        ...data,
        id: docRef.id,
        teacherName: formData.teacherName,
        schoolName: formData.schoolName,
        className: formData.className,
        createdAt: new Date().toISOString()
      };

      setCurrentRPPH(newRPPH);
      setCurrentPage('view');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteFromHistory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'rpphs', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `rpphs/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar 
        currentPage={currentPage} 
        userName={profile?.displayName || user.displayName || user.email?.split('@')[0]}
        onNavigate={(p) => {
          setCurrentPage(p);
          if (p === 'create') setCurrentRPPH(null);
        }} 
      />

      <main className="pt-24 md:pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600">
                <AlertCircle size={20} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </motion.div>
          )}

          {currentPage === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Home 
                onNavigate={setCurrentPage} 
                stats={{
                  saved: history.length,
                  library: 79,
                  themes: 11,
                  ageGroups: 3
                }} 
              />
            </motion.div>
          )}

          {currentPage === 'create' && (
            <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <RPPHForm onGenerate={handleGenerate} loading={isGenerating} />
            </motion.div>
          )}

          {currentPage === 'view' && currentRPPH && (
            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RPPHView data={currentRPPH} onBack={() => setCurrentPage('create')} />
            </motion.div>
          )}

          {currentPage === 'library' && (
             <motion.div key="library" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
               <Library />
             </motion.div>
          )}

          {currentPage === 'reference' && (
             <motion.div key="reference" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
               <Reference />
             </motion.div>
          )}

          {currentPage === 'history' && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <header>
                <h1 className="text-5xl font-serif font-bold text-gray-900 tracking-tight">RPPH Tersimpan</h1>
                <p className="text-lg text-gray-500 mt-2">Daftar rancangan pembelajaran yang telah Anda buat.</p>
              </header>

              {fetchingHistory ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 size={40} className="text-indigo-500 animate-spin" />
                  <p className="text-gray-400 font-medium tracking-tight">Memuat riwayat...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="bg-white p-20 rounded-[32px] text-center space-y-4 border border-gray-100 card-shadow">
                   <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                      <FileText size={40} />
                   </div>
                   <p className="text-gray-400 font-medium tracking-tight">Belum ada RPPH yang tersimpan.</p>
                   <button 
                    onClick={() => setCurrentPage('create')}
                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all"
                   >
                     Mulai Buat Sekarang
                   </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {history.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white p-8 rounded-[32px] border border-gray-100 card-shadow flex justify-between items-start group"
                    >
                      <div className="cursor-pointer flex-1" onClick={() => {
                        setCurrentRPPH(item);
                        setCurrentPage('view');
                      }}>
                        <div className="flex items-center gap-2 text-indigo-600 mb-2 font-bold text-[10px] uppercase tracking-widest">
                           <FileText size={12} /> {item.identitas?.hariTanggal || 'Tanpa Tanggal'}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{item.identitas?.temaSubTema || 'Tanpa Tema'}</h3>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-tight">{item.identitas?.kelompokUsia || 'Semua Usia'}</p>
                      </div>
                      <button 
                        onClick={() => deleteFromHistory(item.id)}
                        className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {currentPage === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Settings />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

