import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, User as UserIcon, Building2, MapPin, CheckCircle2, Loader2, Link } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function Settings() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    schoolName: '',
    schoolAddress: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        schoolName: profile.schoolName || '',
        schoolAddress: profile.schoolAddress || ''
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSuccess(false);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...formData,
        updatedAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 tracking-tight">Pengaturan Profil</h1>
        <p className="text-gray-500 font-medium">Kelola informasi instansi dan data diri Anda untuk kemudahan pembuatan RPPH.</p>
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-8 rounded-[32px] card-shadow border border-gray-100 space-y-8">
          <div className="space-y-6">
            <h2 className="flex items-center gap-3 text-lg font-serif font-bold text-gray-800">
               <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                 <UserIcon size={20} />
               </div>
               Informasi Personal
            </h2>
            <InputGroup 
              label="NAMA LENGKAP GURU" 
              icon={<UserIcon size={18} />}
              value={formData.displayName} 
              onChange={v => setFormData({...formData, displayName: v})} 
              placeholder="Masukkan nama lengkap Anda"
            />
          </div>

          <div className="pt-8 border-t border-gray-50 space-y-6">
            <h2 className="flex items-center gap-3 text-lg font-serif font-bold text-gray-800">
               <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                 <Building2 size={20} />
               </div>
               Informasi Satuan Pendidikan
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <InputGroup 
                label="NAMA SEKOLAH / TK" 
                icon={<Building2 size={18} />}
                value={formData.schoolName} 
                onChange={v => setFormData({...formData, schoolName: v})} 
                placeholder="Contoh: TK Ceria Bunda"
              />
              <InputGroup 
                label="ALAMAT SEKOLAH" 
                icon={<MapPin size={18} />}
                value={formData.schoolAddress} 
                onChange={v => setFormData({...formData, schoolAddress: v})} 
                placeholder="Masukkan alamat lengkap sekolah..."
                isTextArea
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            {success && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-emerald-600 font-bold text-sm"
              >
                <CheckCircle2 size={18} />
                Profil berhasil disimpan!
              </motion.div>
            )}
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="bg-slate-900 text-white flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Simpan Perubahan
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function InputGroup({ label, value, onChange, type = "text", placeholder, icon, isTextArea }: any) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
        {icon}
        {label}
      </label>
      {isTextArea ? (
        <textarea 
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:border-indigo-200 outline-none transition-all shadow-sm min-h-[100px] resize-none"
        />
      ) : (
        <input 
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:border-indigo-200 outline-none transition-all shadow-sm"
        />
      )}
    </div>
  );
}
