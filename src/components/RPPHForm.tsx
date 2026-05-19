import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, Save, Clock, Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Library from './Library';
import { type Activity } from '../data/activities';
import { useAuth } from '../context/AuthContext';

interface RPPHFormProps {
  onGenerate: (data: any) => void;
  loading: boolean;
}

export default function RPPHForm({ onGenerate, loading }: RPPHFormProps) {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    teacherName: '',
    schoolName: '',
    schoolAddress: '',
    className: 'TK A',
    date: new Date().toISOString().split('T')[0],
    ageGroup: '4-5 Tahun — TK A',
    semester: 'Semester I (Ganjil)',
    week: '1',
    day: '1',
    theme: 'Diri Sendiri',
    subTheme: 'Identitasku',
    extraContext: '',
    assessment: 'Pengamatan, hasil karya, percakapan, dan unjuk kerja anak.'
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        teacherName: profile.displayName || prev.teacherName,
        schoolName: profile.schoolName || prev.schoolName,
        schoolAddress: profile.schoolAddress || prev.schoolAddress
      }));
    }
  }, [profile]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [goals, setGoals] = useState<string[]>([
    'Anak mampu mengenal Tuhan melalui ciptaan-Nya',
    'Anak mampu berinteraksi dengan teman sebaya'
  ]);
  
  const [goalInput, setGoalInput] = useState('');

  const [activitiesBySection, setActivitiesBySection] = useState<Record<string, Activity[]>>({
    'Pembukaan': [],
    'Kegiatan Inti': [],
    'Istirahat': [],
    'Penutup': []
  });

  const [pickingSection, setPickingSection] = useState<string | null>(null);

  const totalDuration = useMemo(() => {
    let total = 0;
    Object.values(activitiesBySection).flat().forEach((act: Activity) => {
      const mins = parseInt(act.duration) || 0;
      total += mins;
    });
    return total;
  }, [activitiesBySection]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.teacherName.trim()) newErrors.teacherName = 'Nama guru harus diisi';
    if (!formData.schoolName.trim()) newErrors.schoolName = 'Satuan pendidikan harus diisi';
    if (!formData.className.trim()) newErrors.className = 'Nama kelas harus diisi';
    if (!formData.date) newErrors.date = 'Tanggal harus dipilih';
    
    const weekNum = parseInt(formData.week);
    if (isNaN(weekNum) || weekNum < 1 || weekNum > 20) {
      newErrors.week = 'Minggu valid (1-20)';
    }

    const dayNum = parseInt(formData.day);
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 6) {
      newErrors.day = 'Hari valid (1-6)';
    }

    if (goals.length === 0) {
      newErrors.goals = 'Tambahkan minimal 1 tujuan pembelajaran';
    }

    const totalActs = Object.values(activitiesBySection).flat().length;
    if (totalActs === 0) {
      newErrors.activities = 'Tambahkan minimal 1 kegiatan';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      const firstError = Object.keys(newErrors)[0];
      const element = document.getElementsByName(firstError)[0];
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setErrors({});
    onGenerate({
      ...formData,
      goals,
      activities: activitiesBySection
    });
  };

  const addGoal = () => {
    if (goalInput.trim()) {
      setGoals([...goals, goalInput.trim()]);
      setGoalInput('');
    }
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const removeActivity = (section: string, id: string | number) => {
    setActivitiesBySection(prev => ({
      ...prev,
      [section]: prev[section].filter(a => a.id !== id)
    }));
  };

  const sections = [
    { key: 'Pembukaan', title: 'Pembukaan', icon: '🌅', color: 'bg-amber-50 border-amber-100' },
    { key: 'Kegiatan Inti', title: 'Kegiatan Inti', icon: '🎯', color: 'bg-indigo-50 border-indigo-100' },
    { key: 'Istirahat', title: 'Istirahat', icon: '🍪', color: 'bg-rose-50 border-rose-100' },
    { key: 'Penutup', title: 'Penutup', icon: '🌙', color: 'bg-sky-50 border-sky-100' },
  ];

  return (
    <div className="space-y-8 md:space-y-12 pb-32">
      {!profile?.isPro && (
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
               <Sparkles size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900 leading-tight">Paket Gratis</p>
              <p className="text-xs text-amber-700 font-medium">Sisa kuota harian: {3 - (profile?.lastGenerationDate === new Date().toISOString().split('T')[0] ? (profile?.dailyGenerations || 0) : 0)} / 3 RPPH</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'upgrade' }))}
            className="text-[10px] font-bold bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-all"
          >
            Hapus Batasan
          </button>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end no-print gap-4">
        <div>
           <div className="flex items-center gap-3 text-orange-500 mb-2">
            <Sparkles size={24} fill="currentColor" />
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight">Buat RPPH Baru</h1>
          <p className="text-base md:text-lg text-gray-500 mt-1 md:mt-2">Susun rencana pembelajaran harian sesuai usia & tema.</p>
        </div>
        <div className="text-left md:text-right w-full md:w-auto bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none border border-gray-100 md:border-none shadow-sm md:shadow-none">
           <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B5CF6]">Total Durasi</p>
           <p className={`text-3xl md:text-4xl font-serif font-bold ${totalDuration < 150 || totalDuration > 240 ? 'text-amber-500' : 'text-[#8B5CF6]'}`}>
             {totalDuration} menit
           </p>
           <p className="text-[10px] text-gray-400 font-medium mt-1">Ideal: 180 - 210 menit</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
        {/* Identitas Card */}
        <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[32px] card-shadow border border-gray-100 space-y-8 md:space-y-10">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4 md:pb-6">
             <span className="text-xl md:text-2xl">📝</span>
             <h2 className="text-lg md:text-xl font-bold text-gray-800">Identitas RPPH</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-x-12 md:gap-y-10">
            <InputGroup 
              label="NAMA GURU" 
              name="teacherName"
              value={formData.teacherName} 
              onChange={v => {
                setFormData({...formData, teacherName: v});
                if (v.trim()) setErrors(prev => ({...prev, teacherName: ''}));
              }} 
              placeholder="Masukkan nama guru"
              error={errors.teacherName}
              required
            />
            <InputGroup 
              label="SATUAN PENDIDIKAN" 
              name="schoolName"
              value={formData.schoolName} 
              onChange={v => {
                setFormData({...formData, schoolName: v});
                if (v.trim()) setErrors(prev => ({...prev, schoolName: ''}));
              }} 
              placeholder="Contoh: TK Ceria"
              error={errors.schoolName}
              required
            />
            <InputGroup 
              label="ALAMAT SEKOLAH" 
              name="schoolAddress"
              value={formData.schoolAddress} 
              onChange={v => setFormData({...formData, schoolAddress: v})} 
              placeholder="Alamat sekolah..."
            />
            <InputGroup 
              label="NAMA KELAS" 
              name="className"
              value={formData.className} 
              onChange={v => {
                setFormData({...formData, className: v});
                if (v.trim()) setErrors(prev => ({...prev, className: ''}));
              }} 
              error={errors.className}
              required
            />
            <InputGroup 
              label="TANGGAL" 
              name="date"
              type="date"
              value={formData.date} 
              onChange={v => {
                setFormData({...formData, date: v});
                if (v) setErrors(prev => ({...prev, date: ''}));
              }} 
              error={errors.date}
              required
            />
            <SelectGroup 
              label="KELOMPOK USIA" 
              value={formData.ageGroup} 
              onChange={v => setFormData({...formData, ageGroup: v})}
              options={['3-4 Tahun — KB', '4-5 Tahun — TK A', '5-6 Tahun — TK B']}
            />
            <SelectGroup 
              label="SEMESTER" 
              value={formData.semester} 
              onChange={v => setFormData({...formData, semester: v})}
              options={['Semester I (Ganjil)', 'Semester II (Genap)']}
            />
            <div className="flex gap-4">
              <InputGroup 
                label="MINGGU KE-" 
                name="week"
                className="w-1/2"
                type="number"
                value={formData.week} 
                onChange={v => {
                  setFormData({...formData, week: v});
                  setErrors(prev => ({...prev, week: ''}));
                }} 
                error={errors.week}
              />
              <InputGroup 
                label="HARI KE-" 
                name="day"
                className="w-1/2"
                type="number"
                value={formData.day} 
                onChange={v => {
                  setFormData({...formData, day: v});
                  setErrors(prev => ({...prev, day: ''}));
                }} 
                error={errors.day}
              />
            </div>
          </div>
        </div>

        {/* Tema Card */}
        <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[32px] card-shadow border border-gray-100 space-y-8 md:space-y-10">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4 md:pb-6">
             <span className="text-xl md:text-2xl">🎨</span>
             <h2 className="text-lg md:text-xl font-bold text-gray-800">Tema Pembelajaran</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
            <SelectGroup 
              label="TEMA" 
              value={formData.theme} 
              onChange={v => setFormData({...formData, theme: v})}
              options={['👶 Diri Sendiri', '🏡 Lingkunganku', '🦁 Binatang', '🌻 Tanaman', '🚲 Kendaraan']}
            />
             <SelectGroup 
              label="SUB TEMA" 
              value={formData.subTheme} 
              onChange={v => setFormData({...formData, subTheme: v})}
              options={['Identitasku', 'Tubuhku', 'Anggota Keluarga', 'Rumahku']}
            />
          </div>
        </div>

        {/* Tujuan Pembelajaran Card */}
        <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[32px] card-shadow border border-gray-100 space-y-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <span className="text-xl md:text-2xl">🎯</span>
                 <h2 className="text-lg md:text-xl font-bold text-gray-800">Tujuan Pembelajaran</h2>
              </div>
           </div>
           <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <input 
                className="flex-1 px-5 md:px-6 py-3.5 md:py-4 bg-gray-50 rounded-xl md:rounded-2xl border-none focus:ring-2 focus:ring-indigo-100 text-sm font-medium shadow-sm transition-all"
                placeholder="Tambah tujuan pembelajaran (contoh: Anak mampu menyebutkan nama-nama warna)..."
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addGoal())}
              />
              <button 
                type="button" 
                onClick={addGoal}
                className="bg-indigo-600 text-white p-3.5 md:p-4 rounded-xl md:rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center"
              >
                <Plus size={24} />
              </button>
           </div>
           {errors.goals && <p className="text-rose-500 text-[10px] font-bold uppercase mt-2">{errors.goals}</p>}
           <div className="space-y-4 pt-4">
             {goals.map((goal, idx) => (
                <GoalItem 
                  key={idx} 
                  index={idx + 1} 
                  text={goal} 
                  onRemove={() => removeGoal(idx)} 
                />
             ))}
             {goals.length === 0 && (
               <p className="text-center py-6 text-gray-400 text-sm font-medium italic">Belum ada tujuan pembelajaran ditambahkan.</p>
             )}
           </div>
        </div>

        {sections.map((s, i) => {
          const acts = activitiesBySection[s.key] || [];
          return (
            <div key={i} className={`bg-white p-6 md:p-8 rounded-3xl md:rounded-[32px] border-2 border-dashed ${s.color} space-y-6`}>
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                     <span className="text-xl md:text-2xl">{s.icon}</span>
                     <h2 className="text-lg md:text-xl font-bold text-gray-800">{s.title} <span className="font-normal text-gray-400 text-sm">({acts.length} kegiatan)</span></h2>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setPickingSection(s.key)}
                    className="text-xs font-bold bg-white text-gray-800 px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center"
                  >
                    <Plus size={14} /> Tambah Kegiatan
                  </button>
               </div>
               
               {acts.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {acts.map((act, idx) => (
                     <div key={`${act.id}-${idx}`} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 group relative">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                           {act.icon.startsWith('data:image') ? (
                             <img src={act.icon} alt={act.title} className="w-full h-full object-cover rounded-xl" />
                           ) : (
                             <span className="text-2xl">{act.icon}</span>
                           )}
                        </div>
                        <div className="flex-1 min-w-0 pr-8">
                           <h4 className="text-sm font-bold text-gray-900 truncate">{act.title}</h4>
                           <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                             <Clock size={10} /> {act.duration}
                           </p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeActivity(s.key, act.id)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-rose-300 hover:text-rose-500 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="h-24 border-2 border-dashed border-gray-200/50 rounded-2xl flex items-center justify-center">
                    <p className="text-sm font-medium text-gray-400 opacity-60">Belum ada kegiatan. Klik "Tambah Kegiatan" untuk mulai.</p>
                 </div>
               )}
            </div>
          );
        })}

        {errors.activities && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
               <X size={16} />
            </div>
            <p className="text-sm font-bold uppercase tracking-tight">{errors.activities}</p>
          </div>
        )}

        <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[32px] card-shadow border border-gray-100 space-y-8 md:space-y-10">
           <div className="flex items-center gap-3 border-b border-gray-50 pb-4 md:pb-6">
             <span className="text-xl md:text-2xl">📊</span>
             <h2 className="text-lg md:text-xl font-bold text-gray-800">Teknik Penilaian</h2>
          </div>
          <textarea 
             className="w-full h-32 px-5 md:px-6 py-5 md:py-6 bg-gray-50 rounded-xl md:rounded-2xl border-none focus:ring-2 focus:ring-blue-100 text-sm font-medium text-gray-600 placeholder:text-gray-300 resize-none transition-all"
             placeholder="Masukkan teknik penilaian..."
             value={formData.assessment}
             onChange={e => setFormData({...formData, assessment: e.target.value})}
          />
        </div>

        <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 no-print z-40">
           <button 
            type="submit"
            disabled={loading}
            className={`flex items-center gap-3 px-8 md:px-12 py-4 md:py-5 rounded-2xl md:rounded-3xl font-bold text-white shadow-2xl transition-all active:scale-95 ${
              loading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-[#9333ea] hover:bg-[#7e22ce] shadow-[#9333ea]/30'
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : <Save size={20} />}
            {loading ? 'Menyusun RPPH...' : 'Simpan RPPH'}
          </button>
        </div>
      </form>

      <AnimatePresence>
        {pickingSection && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-6 bg-slate-900/60 backdrop-blur-md overflow-hidden">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-[#FDFBF7] w-full max-w-6xl h-full md:rounded-[40px] shadow-2xl overflow-y-auto p-6 md:p-12 relative"
             >
                <Library 
                  isPicker 
                  onSelect={(act) => {
                    setActivitiesBySection(prev => ({
                      ...prev,
                      [pickingSection]: [...(prev[pickingSection] || []), act]
                    }));
                    setPickingSection(null);
                  }}
                  onClose={() => setPickingSection(null)}
                />
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputGroup({ label, value, onChange, type = "text", placeholder, className = "", error, required, name }: any) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
        {error && <span className="text-[10px] font-bold text-rose-500 uppercase">{error}</span>}
      </div>
      <input 
        name={name}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-6 py-4 bg-white border ${error ? 'border-rose-200 bg-rose-50/10' : 'border-gray-100'} rounded-2xl text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:border-indigo-200 outline-none transition-all shadow-sm`}
      />
    </div>
  );
}

function SelectGroup({ label, value, onChange, options }: any) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{label}</label>
      <select 
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 focus:border-indigo-200 outline-none transition-all shadow-sm appearance-none cursor-pointer"
      >
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function GoalItem({ index, text, onRemove }: any) {
  return (
    <div className="flex items-center gap-4 group">
       <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xs">{index}</div>
       <div className="flex-1 px-6 py-4 border border-gray-100 rounded-2xl text-sm font-semibold text-gray-700 bg-white shadow-sm flex items-center justify-between">
          {text}
          <button 
            type="button" 
            onClick={onRemove}
            className="p-2 text-rose-300 hover:text-rose-500 transition-all"
          >
             <Trash2 size={18} />
          </button>
       </div>
    </div>
  );
}

