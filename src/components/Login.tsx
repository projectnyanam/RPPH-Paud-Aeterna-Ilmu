import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, LogIn, AlertCircle, ExternalLink, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleGoogleLogin = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError('Popup terblokir oleh browser. Silakan buka aplikasi di tab baru menggunakan tombol di pojok kanan atas preview.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Metode masuk menggunakan akun Google belum diaktifkan di Firebase Console Anda. Silakan aktifkan penyedia/provider "Google" di menu: Authentication > Sign-in method.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(`Domain ini (${window.location.hostname}) belum diizinkan di Firebase Console Anda. Silakan tambahkan domain ini ke daftar: Authentication > Settings > Authorized domains.`);
      } else {
        setError('Gagal masuk dengan Google. Silakan coba lagi nanti.');
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        if (!displayName) throw new Error('Nama lengkap wajib diisi');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { 
          displayName,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Email Auth Error:", err);
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Email sudah digunakan. Silakan gunakan email lain atau login.');
          break;
        case 'auth/invalid-email':
          setError('Format email tidak valid.');
          break;
        case 'auth/weak-password':
          setError('Password minimal 6 karakter.');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Email atau password salah.');
          break;
        case 'auth/operation-not-allowed':
          setError('Metode masuk menggunakan Email/Sandi belum diaktifkan di Firebase Console Anda. Silakan aktifkan penyedia/provider "Email/Password" di menu: Authentication > Sign-in method.');
          break;
        default:
          setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100"
      >
        <div className="p-8 md:p-10 space-y-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto transform rotate-6 scale-90 md:scale-100">
              <span className="text-white text-4xl">🌈</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 tracking-tight">RPPH Ceria</h1>
              <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">Portal Kreatif Guru Taman Kanak-kanak</p>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <AnimatePresence mode="wait">
              {isRegistering && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Masukkan nama Anda"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3 text-rose-600"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10px] font-bold leading-tight uppercase tracking-tight">{error}</p>
                  {error.includes('tab baru') && (
                    <p className="text-[9px] opacity-80 font-medium">Klik icon <ExternalLink size={10} className="inline" /> di pojok atas.</p>
                  )}
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white flex items-center justify-center gap-2 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : (
                <>
                  {isRegistering ? 'Daftar Sekarang' : 'Masuk ke Aplikasi'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-400 font-bold tracking-widest">Atau</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white border-2 border-gray-100 text-gray-700 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Lanjutkan dengan Google
          </button>

          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors"
            >
              {isRegistering ? 'Sudah punya akun? Masuk di sini' : 'Belum punya akun? Daftar gratis'}
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-6 flex justify-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            <Sparkles size={12} className="text-indigo-400" />
            Powered by Gemini AI
          </p>
        </div>
      </motion.div>
    </div>
  );
}
