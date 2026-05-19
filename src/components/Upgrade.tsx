import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Crown, Zap, Star, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function Upgrade() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: string) => {
    if (!user) return;
    setLoading(plan);
    
    // Simulasi integrasi pembayaran
    // Di dunia nyata, ini akan memanggil API /api/create-checkout-session
    setTimeout(async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          isPro: true,
          updatedAt: serverTimestamp()
        });
        setLoading(null);
        alert("Selamat! Anda sekarang adalah member PREMIUM Paud Aeternal Ilmu.");
      } catch (error) {
        console.error(error);
        setLoading(null);
      }
    }, 2000);
  };

  if (profile?.isPro) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto">
          <Crown size={40} />
        </div>
        <h1 className="text-4xl font-serif font-bold text-gray-900">Anda adalah Member Premium</h1>
        <p className="text-gray-500 font-medium">Terima kasih telah mendukung kami. Anda memiliki akses tak terbatas ke semua fitur.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight">Pilih Paket Belajar</h1>
        <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
          Dukung pengembangan aplikasi dan nikmati kemudahan pembuatan RPPH tanpa batas dengan paket Premium.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Paket Gratis */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8 flex flex-col"
        >
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Paket Gratis</h3>
            <p className="text-gray-500 text-sm">Untuk mencoba fitur dasar</p>
          </div>
          <div className="text-4xl font-serif font-bold text-gray-900">Rp 0 <span className="text-sm font-sans text-gray-400">/ selamanya</span></div>
          
          <ul className="space-y-4 flex-1">
            <FeatureItem text="3 Generate RPPH / hari" />
            <FeatureItem text="Akses Pustaka Terbatas" />
            <FeatureItem text="Format Standar" />
            <FeatureItem text="Iklan Banner" cross />
          </ul>

          <button className="w-full py-4 rounded-2xl font-bold border-2 border-gray-100 text-gray-400 cursor-not-allowed">
            Paket Aktif
          </button>
        </motion.div>

        {/* Paket Premium */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900 p-8 rounded-[40px] shadow-2xl space-y-8 flex flex-col relative overflow-hidden"
        >
          <div className="absolute top-6 right-6 bg-amber-400 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
            <Star size={10} fill="currentColor" /> Populer
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Paket Premium</h3>
            <p className="text-slate-400 text-sm">Akses penuh tanpa hambatan</p>
          </div>
          <div className="text-4xl font-serif font-bold text-white">Rp 25.000 <span className="text-sm font-sans text-slate-500">/ bulan</span></div>
          
          <ul className="space-y-4 flex-1">
            <FeatureItem text="Unlimited Generate RPPH" pro />
            <FeatureItem text="Simpan Ke Pustaka Tanpa Batas" pro />
            <FeatureItem text="Kustomisasi Header & Alamat" pro />
            <FeatureItem text="Prioritas Support Guru" pro />
            <FeatureItem text="Tanpa Iklan" pro />
          </ul>

          <button 
            onClick={() => handleUpgrade('premium')}
            disabled={loading !== null}
            className="w-full py-4 rounded-2xl font-bold bg-amber-400 text-slate-900 hover:bg-amber-300 transition-all flex items-center justify-center gap-2"
          >
            {loading === 'premium' ? <Loader2 size={20} className="animate-spin" /> : (
              <>
                Upgrade Sekarang <ArrowRight size={18} />
              </>
            )}
          </button>
        </motion.div>
      </div>

      <div className="bg-indigo-50 rounded-[32px] p-8 flex flex-col md:flex-row items-center gap-6 max-w-4xl mx-auto">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
          <ShieldCheck size={32} />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-indigo-900">Pembayaran Aman & Terpercaya</h4>
          <p className="text-indigo-700/70 text-sm font-medium">Kami menggunakan gateway pembayaran berskala internasional untuk menjamin keamanan data transaksi Anda.</p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text, cross, pro }: { text: string; cross?: boolean; pro?: boolean }) {
  return (
    <li className={`flex items-center gap-3 text-sm font-medium ${cross ? 'text-gray-300 line-through' : pro ? 'text-slate-300' : 'text-gray-600'}`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${cross ? 'bg-gray-50 text-gray-300' : pro ? 'bg-slate-800 text-amber-400' : 'bg-emerald-50 text-emerald-500'}`}>
        {cross ? <Zap size={12} fill="currentColor" /> : <Check size={12} strokeWidth={3} />}
      </div>
      {text}
    </li>
  );
}
