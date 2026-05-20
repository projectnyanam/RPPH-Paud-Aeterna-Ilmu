import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  FileText, 
  ShieldCheck, 
  TrendingUp, 
  Search, 
  ChevronRight, 
  ArrowLeft,
  Calendar,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { collection, query, getDocs, limit, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Stats {
  totalUsers: number;
  totalRPPH: number;
  totalPremium: number;
}

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalRPPH: 0, totalPremium: 0 });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [rpphHistory, setRpphHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch User Stats
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = usersSnapshot.docs.reduce((acc: any, doc) => {
          acc[doc.id] = { id: doc.id, ...doc.data() };
          return acc;
        }, {});
        
        const usersList = Object.values(users);
        
        // Fetch RPPH Stats & History
        const rpphSnapshot = await getDocs(collection(db, 'rpphs'));
        const rpphs = rpphSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          user: users[(doc.data() as any).userId] || { displayName: 'User Terhapus' }
        }));
        
        setStats({
          totalUsers: usersList.length,
          totalRPPH: rpphSnapshot.size,
          totalPremium: usersList.filter((u: any) => u.isPro).length
        });

        // Get Recent Users (First 10)
        const sortedUsers = [...usersList].sort((a: any, b: any) => 
          (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        ).slice(0, 10);
        
        setRecentUsers(sortedUsers);

        // Sort RPPH History by date
        const sortedRpph = [...rpphs].sort((a: any, b: any) => 
          (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );
        setRpphHistory(sortedRpph);
      } catch (error) {
        console.error("Admin fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleProStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isPro: !currentStatus,
        updatedAt: serverTimestamp()
      });
      // Refresh local state
      setRecentUsers(prev => prev.map(u => u.id === userId ? { ...u, isPro: !currentStatus } : u));
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm tracking-wider uppercase mb-1">
            <ShieldCheck size={16} />
            Administrator Panel
          </div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 tracking-tight">Dashboard Pantauan</h1>
          <p className="text-gray-500 font-medium">Monitoring aktivitas guru dan performa aplikasi di Paud Aeternal Ilmu.</p>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-200 font-bold hover:bg-slate-800 transition-all active:scale-95"
        >
          <LogOut size={18} />
          Logout Admin
        </button>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Users size={24} />}
          label="Total Guru Terdaftar"
          value={stats.totalUsers}
          subValue="+12 minggu ini"
          color="bg-indigo-50 text-indigo-600"
        />
        <StatCard 
          icon={<FileText size={24} />}
          label="RPPH Berhasil Dibuat"
          value={stats.totalRPPH}
          subValue="+85 total hari ini"
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          icon={<TrendingUp size={24} />}
          label="Pengguna Premium"
          value={stats.totalPremium}
          subValue="15.5% dari total guru"
          color="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Table Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                Guru Terbaru
                <span className="text-xs font-medium bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{recentUsers.length} Terakhir</span>
              </h2>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  placeholder="Cari guru..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none text-sm focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nama & Sekolah</th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tanggal Gabung</th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-gray-400">Loading data...</td>
                    </tr>
                  ) : recentUsers.filter(u => u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                            alt={user.displayName}
                            className="w-10 h-10 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all"
                          />
                          <div>
                            <div className="font-bold text-gray-900">{user.displayName}</div>
                            <div className="text-xs text-gray-500 font-medium">{user.schoolName || 'Sekolah belum diatur'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {user.isPro ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Premium
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-400 text-[10px] font-bold uppercase">
                            Free Trial
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                          <Calendar size={14} />
                          {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => toggleProStatus(user.id, user.isPro)}
                          className={`p-2 rounded-lg transition-all ${user.isPro ? 'text-red-400 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                          title={user.isPro ? "Hapus Akses Premium" : "Berikan Akses Premium"}
                        >
                          {user.isPro ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-6">
          <div className="bg-indigo-900 text-white rounded-[40px] p-8 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-800 rounded-full translate-x-10 -translate-y-10 blur-3xl opacity-50" />
            
            <div className="space-y-1 relative">
              <h3 className="text-lg font-bold">Ringkasan Sistem</h3>
              <p className="text-indigo-300 text-sm font-medium">Status operasional hari ini</p>
            </div>

            <div className="space-y-6 relative">
              <SummaryItem 
                label="Uptime Server" 
                value="100%" 
                status="Healthy" 
              />
              <SummaryItem 
                label="Rata-rata AI Respon" 
                value="3.2s" 
                status="Good" 
              />
              <SummaryItem 
                label="Error Rate" 
                value="0.02%" 
                status="Excellent" 
              />
            </div>

            <div className="pt-8 border-t border-indigo-800 space-y-4 relative">
              <div className="flex justify-between items-center">
                <span className="text-indigo-400 font-bold text-xs uppercase">Integrasi Monetag</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[8px] font-bold">ACTIVE</span>
              </div>
              <p className="text-indigo-300 text-xs leading-relaxed font-medium">
                Semua link hasil eksport telah terintegrasi otomatis dengan direct link yang Anda tentukan di coding.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-gray-100 p-8 space-y-6 shadow-sm">
            <h3 className="font-bold text-gray-900 flex items-center justify-between">
              Aksi Cepat
              <MoreVertical size={16} className="text-gray-400" />
            </h3>
            
            <div className="space-y-3">
              <ActionButton 
                icon={<Clock size={16} />} 
                label="Reset Limit Harian" 
                onClick={() => alert("Fitur dalam pengembangan")}
              />
              <ActionButton 
                icon={<FileText size={16} />} 
                label="Export Report (CSV)" 
                onClick={() => alert("Fitur dalam pengembangan")}
              />
              <ActionButton 
                icon={<ExternalLink size={16} />} 
                label="Buka Direct Link Monetag" 
                onClick={() => window.open('https://omg10.com/4/10984630', '_blank')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* RPPH Generation History Section */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              Riwayat Generasi RPPH
              <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">Monitoring AI</span>
            </h2>
            <p className="text-sm text-gray-500 font-medium">Log aktivitas pembuatan rencana pembelajaran secara real-time.</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Cari tema atau guru..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none text-sm focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <input 
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-gray-50 border-none text-sm text-gray-600 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tanggal & Waktu</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Guru</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tema Pembelajaran</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400">Loading history...</td>
                </tr>
              ) : rpphHistory.filter(item => {
                  const matchesSearch = 
                    item.theme?.toLowerCase().includes(historySearch.toLowerCase()) || 
                    item.user?.displayName?.toLowerCase().includes(historySearch.toLowerCase());
                  
                  const rpphDate = item.createdAt ? new Date(item.createdAt.seconds * 1000).toISOString().split('T')[0] : '';
                  const matchesDate = !dateFilter || rpphDate === dateFilter;
                  
                  return matchesSearch && matchesDate;
                }).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-medium">Tidak ada riwayat yang ditemukan.</td>
                </tr>
              ) : rpphHistory.filter(item => {
                const matchesSearch = 
                  item.theme?.toLowerCase().includes(historySearch.toLowerCase()) || 
                  item.user?.displayName?.toLowerCase().includes(historySearch.toLowerCase());
                
                const rpphDate = item.createdAt ? new Date(item.createdAt.seconds * 1000).toISOString().split('T')[0] : '';
                const matchesDate = !dateFilter || rpphDate === dateFilter;
                
                return matchesSearch && matchesDate;
              }).map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-gray-900">
                      {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                      {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''} WIB
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                        {item.user?.displayName?.charAt(0) || 'U'}
                      </div>
                      <div className="text-sm font-medium text-gray-700">{item.user?.displayName || 'Unknown'}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-indigo-600 bg-indigo-50/50 inline-block px-3 py-1 rounded-lg">
                      {item.theme || 'Tanpa Tema'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 font-medium">{item.subTheme || 'Sub tema tidak ada'}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase">
                      <CheckCircle2 size={12} />
                      Berhasil
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Lihat Detail">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subValue, color }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{label}</h3>
        <div className="flex items-end gap-3">
          <div className="text-4xl font-serif font-bold text-gray-900 tracking-tight">{value}</div>
          <div className="mb-1 text-xs font-bold text-emerald-500 flex items-center gap-1">
            <TrendingUp size={12} />
            {subValue}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SummaryItem({ label, value, status }: any) {
  return (
    <div className="flex justify-between items-center">
      <div className="space-y-0.5">
        <div className="text-xs text-indigo-400 font-bold uppercase tracking-tight">{label}</div>
        <div className="text-white font-bold">{value}</div>
      </div>
      <div className="px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold">
        {status}
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all group"
    >
      <div className="text-gray-400 group-hover:text-indigo-600 transition-colors">
        {icon}
      </div>
      <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{label}</span>
      <ChevronRight size={14} className="ml-auto text-gray-300" />
    </button>
  );
}
