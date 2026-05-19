import React, { useState } from 'react';
import { Home as HomeIcon, Sparkles, BookOpen, Library, Save, ChevronDown, Menu, X, LogOut, Settings as SettingsIcon, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userName?: string;
}

export default function Navbar({ currentPage, onNavigate, userName = "Guru" }: NavbarProps) {
  const { logout, user, profile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const menuItems = [
    { id: 'home', label: 'Beranda', icon: HomeIcon },
    { id: 'create', label: 'Buat RPPH', icon: Sparkles },
    { id: 'library', label: 'Pustaka', icon: Library },
    { id: 'reference', label: 'Referensi', icon: BookOpen },
    { id: 'history', label: 'Tersimpan', icon: Save },
    { id: 'settings', label: 'Pengaturan', icon: SettingsIcon },
  ];

  const navigate = (id: string) => {
    onNavigate(id);
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 md:gap-3 cursor-pointer group"
          onClick={() => navigate('home')}
        >
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
            <span className="text-white text-base md:text-xl">🌈</span>
          </div>
          <div>
            <h1 className="font-serif font-bold text-sm md:text-lg text-gray-900 leading-tight">RPPH Ceria</h1>
            <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-gray-400 font-bold">Portal Guru TK</p>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-2 bg-gray-100/50 p-1.5 rounded-2xl">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                currentPage === item.id 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>

        {/* User Profile & Mobile Toggle */}
        <div className="flex items-center gap-2 md:gap-3 lg:pl-6 lg:border-l lg:border-gray-100">
          {!profile?.isPro && (
            <button 
              onClick={() => navigate('upgrade')}
              className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:shadow-amber-200 transition-all active:scale-95"
            >
              <Crown size={14} fill="currentColor" />
              Upgrade Premium
            </button>
          )}
          
          <div className="hidden sm:flex items-center gap-3 relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                 {user?.photoURL ? (
                   <img src={user.photoURL} alt={userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                 ) : (
                   <div className="w-full h-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xs md:text-sm">
                     {userName.charAt(0).toUpperCase()}
                   </div>
                 )}
              </div>
              <div className="hidden md:block text-left">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-gray-800 leading-tight">{userName}</span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </div>
                <p className="text-[10px] text-gray-400 font-medium">Terverifikasi</p>
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                <button 
                  onClick={() => {
                    logout();
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={16} />
                  Keluar Sesi
                </button>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl overflow-hidden py-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col px-4 gap-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-bold transition-all ${
                  currentPage === item.id 
                    ? 'bg-slate-900 text-white' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
            <button
              onClick={() => logout()}
              className="flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all border-t border-gray-50 mt-2"
            >
              <LogOut size={18} />
              Keluar Sesi
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
