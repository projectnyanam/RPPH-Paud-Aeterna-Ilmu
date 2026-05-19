import React, { useState, useEffect } from 'react';
import { Search, Plus, Clock, Package, X, Save, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BUILT_IN_ACTIVITIES, type Activity } from '../data/activities';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

interface LibraryProps {
  isPicker?: boolean;
  onSelect?: (activity: Activity) => void;
  onClose?: () => void;
}

export default function Library({ isPicker, onSelect, onClose }: LibraryProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [customActivities, setCustomActivities] = useState<Activity[]>([]);
  const [fetching, setFetching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeSource, setActiveSource] = useState('Semua');
  const [activeAge, setActiveAge] = useState('Semua Usia');
  const [activeAspect, setActiveAspect] = useState('Semua Aspek');
  const [activeDuration, setActiveDuration] = useState('Semua');
  const [activeType, setActiveType] = useState('Semua');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | number | null>(null);
  
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    duration: '15 mnt',
    type: 'Inti',
    aspects: [] as string[],
    ages: [] as string[],
    materials: [] as string[],
    learningObjectives: [] as string[],
    assessmentMethods: '',
    icon: '✨'
  });

  const [materialInput, setMaterialInput] = useState('');
  const [objectiveInput, setObjectiveInput] = useState('');

  // Load custom activities from Firestore
  useEffect(() => {
    if (!user) return;

    setFetching(true);
    const q = query(
      collection(db, 'activities'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        isCustom: true
      })) as Activity[];
      setCustomActivities(docs);
      setFetching(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'activities');
      setFetching(false);
    });

    return () => unsubscribe();
  }, [user]);

  const allActivities = [...BUILT_IN_ACTIVITIES, ...customActivities];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'activities'), {
        ...newActivity,
        userId: user.uid,
        createdAt: serverTimestamp()
      });

      setShowModal(false);
      setNewActivity({
        title: '',
        description: '',
        duration: '15 mnt',
        type: 'Inti',
        aspects: [],
        ages: [],
        materials: [],
        learningObjectives: [],
        assessmentMethods: '',
        icon: '✨'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'activities');
    }
  };

  const addMaterial = () => {
    if (materialInput.trim()) {
      setNewActivity(prev => ({
        ...prev,
        materials: [...prev.materials, materialInput.trim()]
      }));
      setMaterialInput('');
    }
  };

  const removeMaterial = (index: number) => {
    setNewActivity(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const addObjective = () => {
    if (objectiveInput.trim()) {
      setNewActivity(prev => ({
        ...prev,
        learningObjectives: [...prev.learningObjectives, objectiveInput.trim()]
      }));
      setObjectiveInput('');
    }
  };

  const removeObjective = (index: number) => {
    setNewActivity(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter((_, i) => i !== index)
    }));
  };

  const deleteActivity = async () => {
    if (deleteConfirmId) {
      try {
        await deleteDoc(doc(db, 'activities', String(deleteConfirmId)));
        setDeleteConfirmId(null);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `activities/${deleteConfirmId}`);
      }
    }
  };

  const filtered = allActivities.filter(a => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      a.title.toLowerCase().includes(searchLower) || 
      a.description.toLowerCase().includes(searchLower) ||
      a.materials?.some(m => m.toLowerCase().includes(searchLower));
    
    // Source Filter
    const matchesSource = activeSource === 'Semua' || 
                         (activeSource === 'Bawaan' && !a.isCustom) || 
                         (activeSource === 'Buatan Saya' && a.isCustom);
    
    // Age Filter
    const ageMap: Record<string, string> = {
      '3-4 Tahun': '3-4 thn',
      '4-5 Tahun': '4-5 thn',
      '5-6 Tahun': '5-6 thn'
    };
    const targetAge = ageMap[activeAge];
    const matchesAge = activeAge === 'Semua Usia' || (targetAge && a.ages.includes(targetAge));

    // Aspect Filter
    const aspectMap: Record<string, string> = {
      'Nilai Agama & Moral': 'NAM',
      'Fisik Motorik': 'Fisik Motorik',
      'Kognitif': 'Kognitif',
      'Bahasa': 'Bahasa',
      'Sosial Emosional': 'Sosial Emosional',
      'Seni': 'Seni'
    };
    const targetAspect = aspectMap[activeAspect];
    const matchesAspect = activeAspect === 'Semua Aspek' || (targetAspect && a.aspects.includes(targetAspect));

    // Duration Filter
    const durationNum = parseInt(a.duration) || 0;
    let matchesDuration = true;
    if (activeDuration === '< 15 mnt') matchesDuration = durationNum < 15;
    else if (activeDuration === '15-30 mnt') matchesDuration = durationNum >= 15 && durationNum <= 30;
    else if (activeDuration === '> 30 mnt') matchesDuration = durationNum > 30;

    // Type Filter
    const matchesType = activeType === 'Semua' || a.type === activeType;

    return matchesSearch && matchesSource && matchesAge && matchesAspect && matchesDuration && matchesType;
  });

  const toggleAspect = (aspect: string) => {
    setNewActivity(prev => ({
      ...prev,
      aspects: prev.aspects.includes(aspect) 
        ? prev.aspects.filter(a => a !== aspect) 
        : [...prev.aspects, aspect]
    }));
  };

  const toggleAge = (age: string) => {
    setNewActivity(prev => ({
      ...prev,
      ages: prev.ages.includes(age) 
        ? prev.ages.filter(a => a !== age) 
        : [...prev.ages, age]
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewActivity(prev => ({ ...prev, icon: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const emojiOptions = ['✨', '🎨', '🧩', '🏃', '📚', '🔢', '🎭', '🌳', '🐱', '🐶', '🍎', '🌈', '🧸', '🎈'];

  return (
    <div className="space-y-8 md:space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <div className="flex items-center gap-3 text-emerald-500 mb-2">
             <span className="text-2xl md:text-3xl">📚</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight">
            {isPicker ? 'Pilih Kegiatan' : 'Pustaka Kegiatan'}
          </h1>
          <p className="text-base md:text-lg text-gray-500 mt-1 md:mt-2">
            {allActivities.length} kegiatan tersedia ({BUILT_IN_ACTIVITIES.length} bawaan + {customActivities.length} kustom).
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {isPicker && (
            <button 
              onClick={onClose}
              className="flex-1 md:flex-none bg-white text-gray-500 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 border border-gray-100 shadow-sm hover:bg-gray-50 transition-all text-sm md:text-base"
            >
              <X size={20} />
              Batal
            </button>
          )}
          <button 
            onClick={() => setShowModal(true)}
            className="flex-1 md:flex-none bg-[#00a884] text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-all text-sm md:text-base"
          >
            <Plus size={20} />
            {isPicker ? "Tambah Baru" : "Tambah Kegiatan Baru"}
          </button>
        </div>
      </header>

      <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[32px] card-shadow border border-gray-100 space-y-8 md:space-y-10">
         <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input 
               className="w-full pl-16 pr-6 py-4 md:py-5 bg-white border border-gray-100 rounded-xl md:rounded-2xl text-sm font-medium text-gray-600 focus:border-emerald-200 outline-none transition-all shadow-sm"
               placeholder="Cari kegiatan..."
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </div>

         <div className="space-y-6">
            <div className="space-y-3">
               <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">SUMBER</label>
               <div className="flex flex-wrap gap-2 md:gap-3">
                  {['Semua', 'Bawaan', 'Buatan Saya'].map((opt) => (
                    <button 
                      key={opt}
                      onClick={() => setActiveSource(opt)}
                      className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-bold transition-all ${
                        activeSource === opt ? 'bg-[#00a884] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {opt} {opt === 'Bawaan' ? BUILT_IN_ACTIVITIES.length : opt === 'Buatan Saya' ? customActivities.length : allActivities.length}
                    </button>
                  ))}
               </div>
            </div>
            <div className="space-y-3">
               <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">KELOMPOK USIA</label>
               <div className="flex flex-wrap gap-3">
                  {['Semua Usia', '3-4 Tahun', '4-5 Tahun', '5-6 Tahun'].map((opt) => (
                    <button 
                      key={opt}
                      onClick={() => setActiveAge(opt)}
                      className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                        activeAge === opt ? 'bg-[#00a884] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">ASPEK PERKEMBANGAN</label>
               <div className="flex flex-wrap gap-3">
                  {['Semua Aspek', 'Nilai Agama & Moral', 'Fisik Motorik', 'Kognitif', 'Bahasa', 'Sosial Emosional', 'Seni'].map((opt) => (
                    <button 
                      key={opt}
                      onClick={() => setActiveAspect(opt)}
                      className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                        activeAspect === opt ? 'bg-[#00a884] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">TIPE KEGIATAN</label>
               <div className="flex flex-wrap gap-3">
                  {['Semua', 'Pembukaan', 'Inti', 'Istirahat', 'Penutup'].map((opt) => (
                    <button 
                      key={opt}
                      onClick={() => setActiveType(opt)}
                      className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                        activeType === opt ? 'bg-[#00a884] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">DURASI</label>
               <div className="flex flex-wrap gap-3">
                  {['Semua', '< 15 mnt', '15-30 mnt', '> 30 mnt'].map((opt) => (
                    <button 
                      key={opt}
                      onClick={() => setActiveDuration(opt)}
                      className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                        activeDuration === opt ? 'bg-[#00a884] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filtered.length === 0 ? (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
             <p className="text-gray-400 font-medium text-sm">Tidak ada kegiatan yang ditemukan.</p>
          </div>
        ) : filtered.map(act => (
          <motion.div 
            key={act.id} 
            whileHover={{ y: -5 }}
            layout
            className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[32px] border border-gray-100 shadow-sm space-y-6 relative overflow-hidden group"
          >
             <div className="flex justify-between items-start">
                 <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden shadow-inner">
                    {act.icon.startsWith('data:image') || act.icon.startsWith('http') ? (
                      <img src={act.icon} alt={act.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-4xl">{act.icon}</span>
                    )}
                 </div>
                 <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B5CF6] px-3 py-1 bg-purple-50 rounded-lg">{act.type}</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={10} /> {act.duration}</span>
                 </div>
             </div>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{act.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{act.description}</p>
                 </div>

                 {act.learningObjectives && act.learningObjectives.length > 0 && (
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Tujuan:</p>
                      <ul className="text-[10px] text-gray-600 list-disc pl-4">
                         {act.learningObjectives.map((obj, i) => <li key={i}>{obj}</li>)}
                      </ul>
                   </div>
                 )}

                 {act.assessmentMethods && (
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Penilaian:</p>
                      <p className="text-[10px] text-gray-600 italic">"{act.assessmentMethods}"</p>
                   </div>
                 )}
              </div>
             <div className="flex flex-wrap gap-2">
                {act.aspects.map(as => (
                  <span key={as} className="text-[10px] font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-full">{as}</span>
                ))}
             </div>
             <div className="pt-4 border-t border-gray-50 space-y-3">
                {isPicker && (
                  <button 
                    type="button"
                    onClick={() => onSelect?.(act)}
                    className="w-full py-3 bg-[#00a884] text-white rounded-xl font-bold hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 mb-2"
                  >
                    Pilih Kegiatan
                  </button>
                )}
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-bold text-gray-400">Cocok untuk:</span>
                   <div className="flex gap-1">
                      {act.ages.map(age => <span key={age} className="text-[9px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase">{age}</span>)}
                   </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-rose-400 font-bold text-[10px]">
                      <Package size={12} /> Bahan ({act.materials?.length || 0})
                    </div>
                    {act.isCustom && (
                      <button 
                        onClick={() => setDeleteConfirmId(act.id)}
                        className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  {act.materials && act.materials.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {act.materials.map((m, i) => (
                        <span key={i} className="text-[8px] bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded border border-rose-100">{m}</span>
                      ))}
                    </div>
                  )}
                </div>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Tambah Kegiatan */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[90vh]"
            >
              <div className="p-6 md:p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                 <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Tambah Kegiatan</h2>
                 <button onClick={() => setShowModal(false)} className="p-2 md:p-3 bg-white rounded-full text-gray-400 hover:text-gray-900 shadow-sm">
                   <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 md:p-10 space-y-6 md:space-y-8 overflow-y-auto">
                 <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">IKON KEGIATAN</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <p className="text-[10px] font-bold text-gray-400">Pilih Emoji</p>
                          <div className="flex flex-wrap gap-2">
                             {emojiOptions.map(emoji => (
                               <button
                                 key={emoji}
                                 type="button"
                                 onClick={() => setNewActivity({...newActivity, icon: emoji})}
                                 className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                                   newActivity.icon === emoji ? 'bg-emerald-100 scale-110 shadow-sm border border-emerald-200' : 'bg-gray-50 hover:bg-gray-100'
                                 }`}
                               >
                                 {emoji}
                               </button>
                             ))}
                          </div>
                       </div>
                       <div className="space-y-3">
                          <p className="text-[10px] font-bold text-gray-400">Atau Unggah Foto</p>
                          <label className="flex flex-col items-center justify-center w-full h-[100px] border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all overflow-hidden group">
                             {newActivity.icon.startsWith('data:image') ? (
                               <div className="relative w-full h-full">
                                 <img src={newActivity.icon} className="w-full h-full object-cover" alt="Preview" />
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Plus className="text-white" size={24} />
                                 </div>
                               </div>
                             ) : (
                               <div className="flex flex-col items-center justify-center py-4">
                                  <Plus className="text-gray-300 mb-1" size={24} />
                                  <span className="text-[10px] font-bold text-gray-400">Upload (Max 1MB)</span>
                               </div>
                             )}
                             <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                          </label>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">TIPE</label>
                       <select 
                         className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-100 text-sm font-bold shadow-sm"
                         value={newActivity.type}
                         onChange={e => setNewActivity({...newActivity, type: e.target.value})}
                       >
                         <option value="Pembukaan">Pembukaan</option>
                         <option value="Inti">Inti</option>
                         <option value="Istirahat">Istirahat</option>
                         <option value="Penutup">Penutup</option>
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">DURASI</label>
                       <input 
                         className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-100 text-sm font-bold shadow-sm"
                         placeholder="Contoh: 15 mnt"
                         value={newActivity.duration}
                         onChange={e => setNewActivity({...newActivity, duration: e.target.value})}
                         required
                       />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">NAMA KEGIATAN</label>
                    <input 
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-100 text-sm font-bold shadow-sm"
                      placeholder="Masukkan nama kegiatan..."
                      value={newActivity.title}
                      onChange={e => setNewActivity({...newActivity, title: e.target.value})}
                      required
                    />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">DESKRIPSI</label>
                    <textarea 
                      className="w-full h-32 px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-100 text-sm font-medium text-gray-600 resize-none shadow-sm"
                      placeholder="Apa yang dilakukan anak dalam kegiatan ini?"
                      value={newActivity.description}
                      onChange={e => setNewActivity({...newActivity, description: e.target.value})}
                      required
                    />
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">ALAT & BAHAN</label>
                    <div className="flex gap-2">
                       <input 
                         className="flex-1 px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-100 text-sm font-medium shadow-sm"
                         placeholder="Tambah bahan (contoh: Krayon)..."
                         value={materialInput}
                         onChange={e => setMaterialInput(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
                       />
                       <button 
                         type="button"
                         onClick={addMaterial}
                         className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl hover:bg-emerald-100 transition-all"
                       >
                         <Plus size={20} />
                       </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {newActivity.materials.map((m, i) => (
                         <span key={i} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-bold">
                           {m}
                           <button type="button" onClick={() => removeMaterial(i)} className="hover:text-rose-800">
                             <X size={12} />
                           </button>
                         </span>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">TUJUAN PEMBELAJARAN</label>
                    <div className="flex gap-2">
                       <input 
                         className="flex-1 px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-100 text-sm font-medium shadow-sm"
                         placeholder="Tambah tujuan (contoh: Anak mampu mengenal warna)..."
                         value={objectiveInput}
                         onChange={e => setObjectiveInput(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                       />
                       <button 
                         type="button"
                         onClick={addObjective}
                         className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl hover:bg-emerald-100 transition-all"
                       >
                         <Plus size={20} />
                       </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {newActivity.learningObjectives.map((obj, i) => (
                         <span key={i} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-bold">
                           {obj}
                           <button type="button" onClick={() => removeObjective(i)} className="hover:text-indigo-800">
                             <X size={12} />
                           </button>
                         </span>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">METODE PENILAIAN</label>
                    <textarea 
                      className="w-full h-24 px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-100 text-sm font-medium text-gray-600 resize-none shadow-sm"
                      placeholder="Bagaimana cara menilai perkembangan anak?"
                      value={newActivity.assessmentMethods}
                      onChange={e => setNewActivity({...newActivity, assessmentMethods: e.target.value})}
                    />
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">ASPEK PERKEMBANGAN</label>
                    <div className="flex flex-wrap gap-2">
                       {['NAM', 'Fisik Motorik', 'Kognitif', 'Bahasa', 'Sosial Emosional', 'Seni'].map(as => (
                         <button
                           key={as}
                           type="button"
                           onClick={() => toggleAspect(as)}
                           className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${
                             newActivity.aspects.includes(as) ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'
                           }`}
                         >
                           {as}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">COCOK UNTUK USIA</label>
                    <div className="flex flex-wrap gap-2">
                       {['3-4 thn', '4-5 thn', '5-6 thn'].map(age => (
                         <button
                           key={age}
                           type="button"
                           onClick={() => toggleAge(age)}
                           className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${
                             newActivity.ages.includes(age) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'
                           }`}
                         >
                           {age}
                         </button>
                       ))}
                    </div>
                 </div>
              </form>

              <div className="p-6 md:p-10 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 md:gap-4">
                 <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold text-gray-500 bg-white sm:bg-transparent border border-gray-100 sm:border-none shadow-sm sm:shadow-none hover:bg-white transition-all order-2 sm:order-1"
                 >
                   Batal
                 </button>
                 <button 
                  onClick={handleCreate}
                  className="flex-1 py-3.5 md:py-4 bg-[#00a884] text-white rounded-xl md:rounded-2xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
                 >
                   <Save size={18} />
                   Simpan Kegiatan
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modal Konfirmasi Hapus */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-10 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
                <Trash2 size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">Hapus Kegiatan?</h3>
                <p className="text-gray-500 text-sm">Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus kegiatan kustom ini?</p>
              </div>
              <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={deleteActivity}
                  className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
