import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, LogIn, AlertCircle, ExternalLink } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function Login() {
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError('Popup terblokir oleh browser. Silakan buka aplikasi di tab baru menggunakan tombol di pojok kanan atas preview.');
      } else {
        setError('Gagal masuk. Silakan coba lagi nanti.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 space-y-8 border border-gray-100"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto transform rotate-6">
            <span className="text-white text-4xl">🌈</span>
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">RPPH Ceria</h1>
            <p className="text-sm text-gray-500 font-medium mt-2">Portal Kreatif Guru Taman Kanak-kanak</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-50 p-6 rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
              <Sparkles size={16} />
              Fitur Utama
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Buat RPPH otomatis dengan AI
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Simpan & Kelola data di cloud
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Akses dari mana saja & kapan saja
              </li>
            </ul>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3 text-rose-600">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-xs font-bold leading-tight uppercase tracking-tight">{error}</p>
                {error.includes('tab baru') && (
                  <p className="text-[10px] opacity-80 font-medium">Klik icon <ExternalLink size={10} className="inline" /> di bar atas editor untuk membuka di tab baru.</p>
                )}
              </div>
            </div>
          )}

          <button 
            onClick={handleLogin}
            className="w-full bg-slate-900 text-white flex items-center justify-center gap-3 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95"
          >
            <LogIn size={20} />
            Masuk dengan Google
          </button>
        </div>

        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
          Powered by Gemini AI
        </p>
      </motion.div>
    </div>
  );
}
