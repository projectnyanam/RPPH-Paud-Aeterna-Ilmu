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
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, History, Trash2, FileText, Loader2, Search } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';

export default function App() {
  const { user, profile } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [isAdminPortal, setIsAdminPortal] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('portal') === 'admin';
  });
  const [history, setHistory] = useState<any[]>([]);
  const [currentRPPH, setCurrentRPPH] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter history based on search query
  const filteredHistory = React.useMemo(() => {
    if (!searchQuery.trim()) return history;
    const lowerQuery = searchQuery.toLowerCase();
    return history.filter(item => {
      const tema = item.identitas?.tema?.toLowerCase() || '';
      const tanggal = item.identitas?.hariTanggal?.toLowerCase() || '';
      return tema.includes(lowerQuery) || tanggal.includes(lowerQuery);
    });
  }, [history, searchQuery]);

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
    if (!user) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">Portal Administrator</h1>
            <p className="text-slate-500 font-medium mt-2">Masuk dengan Akun Google Administrator Anda.</p>
          </div>
          <Login />
        </div>
      );
    }
    if (!profile?.isAdmin) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-slate-100 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 mb-6">
              <AlertCircle size={32} className="text-rose-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Akses Ditolak</h2>
            <p className="text-slate-500 font-medium mb-8">Akun Anda tidak memiliki hak akses administrator.</p>
            <button 
              onClick={() => {
                setIsAdminPortal(false);
                window.location.href = '/';
              }}
              className="bg-slate-900 text-white rounded-2xl py-4 px-8 font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <AdminDashboard onBack={() => {
          setIsAdminPortal(false);
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
      const idToken = await user.getIdToken();
      const response = await fetch('/api/generate-rpph', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(formData),
      });

      let data;
      let errData;
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        if (!response.ok) {
          errData = await response.json();
          throw new Error(errData.error || 'Terjadi kesalahan saat membuat RPPH');
        }
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Server returned non-JSON response:', text);
        throw new Error(`Server bermasalah (${response.status} ${response.statusText}). Silakan coba lagi.`);
      }
      
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

              <div className="relative max-w-xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Cari berdasarkan tema atau tanggal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>

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
              ) : filteredHistory.length === 0 ? (
                <div className="bg-white p-20 rounded-[32px] text-center space-y-4 border border-gray-100 card-shadow">
                   <p className="text-gray-400 font-medium tracking-tight">Tidak ada RPPH yang cocok dengan pencarian Anda.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredHistory.map((item) => (
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
                        onClick={() => setDeleteConfirmId(item.id)}
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

        {/* Modal Konfirmasi Hapus */}
        <AnimatePresence>
          {deleteConfirmId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => setDeleteConfirmId(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white p-8 rounded-[32px] w-full max-w-md shadow-2xl border border-gray-100"
              >
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-500 mx-auto">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Hapus RPPH?</h3>
                <p className="text-gray-500 text-sm text-center mb-8">Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus RPPH ini dari riwayat?</p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 px-4 py-4 rounded-xl font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-all uppercase tracking-wider text-xs"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={async () => {
                      if (deleteConfirmId) {
                        await deleteFromHistory(deleteConfirmId);
                        setDeleteConfirmId(null);
                      }
                    }}
                    className="flex-1 px-4 py-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all uppercase tracking-wider text-xs"
                  >
                    Ya, Hapus
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

