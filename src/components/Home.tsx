import React from 'react';
import { Sparkles, Library, FileText, UserCircle, LayoutGrid, CalendarRange } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  onNavigate: (page: string) => void;
  stats: {
    saved: number;
    library: number;
    themes: number;
    ageGroups: number;
  };
}

export default function Home({ onNavigate, stats }: HomeProps) {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#EC4899] rounded-3xl md:rounded-[40px] p-8 md:p-12 text-white shadow-2xl"
      >
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4 md:mb-6">
             <span className="text-lg md:text-xl">🌈</span>
             <span className="uppercase tracking-[0.2em] font-bold text-[10px] md:text-xs opacity-90">Selamat Datang, Bu/Pak Guru!</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 md:mb-6 tracking-tight">RPPH Ceria</h1>
          <p className="text-lg md:text-xl opacity-90 leading-relaxed mb-8 md:mb-10">
            Rancang Rencana Pelaksanaan Pembelajaran Harian (RPPH) untuk anak TK dengan mudah — kegiatan disesuaikan dengan tahap perkembangan usia 3-6 tahun.
          </p>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            <button 
              onClick={() => onNavigate('create')}
              className="bg-white text-gray-900 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all text-sm md:text-base"
            >
              <Sparkles size={20} className="text-orange-500" />
              Buat RPPH Baru
            </button>
            <button 
              onClick={() => onNavigate('library')}
              className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/30 transition-all text-sm md:text-base"
            >
              <Library size={20} />
              Lihat Pustaka Kegiatan
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full blur-[100px]" />
        </div>
      </motion.section>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          icon={<FileText size={20} />} 
          value={stats.saved} 
          label="RPPH Tersimpan" 
          color="bg-purple-100 text-purple-600" 
        />
        <StatCard 
          icon={<Library size={20} />} 
          value={stats.library} 
          label="Pustaka Kegiatan" 
          color="bg-pink-100 text-pink-600" 
        />
        <StatCard 
          icon={<LayoutGrid size={20} />} 
          value={stats.themes} 
          label="Tema Pembelajaran" 
          color="bg-orange-100 text-orange-600" 
        />
        <StatCard 
          icon={<UserCircle size={20} />} 
          value={stats.ageGroups} 
          label="Kelompok Usia" 
          color="bg-blue-100 text-blue-600" 
        />
      </div>

      {/* Kelompok Usia */}
      <section className="space-y-6 md:space-y-8">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Kelompok Usia</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <AgeCard 
            title="3-4 Tahun" 
            subtitle="Kelompok Bermain / TK A Awal" 
            count={38} 
            color="bg-gradient-to-br from-pink-500 to-rose-500" 
          />
          <AgeCard 
            title="4-5 Tahun" 
            subtitle="TK A" 
            count={67} 
            color="bg-gradient-to-br from-orange-400 to-amber-500" 
          />
          <AgeCard 
            title="5-6 Tahun" 
            subtitle="TK B" 
            count={64} 
            color="bg-gradient-to-br from-sky-400 to-blue-500" 
          />
        </div>
      </section>

      {/* Aspek Perkembangan */}
      <section className="space-y-8">
        <h2 className="text-3xl font-serif font-bold text-gray-900">6 Aspek Perkembangan Anak</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <AspectCard icon="🕌" label="Nilai Agama & Moral" color="bg-emerald-50 text-emerald-700" />
          <AspectCard icon="🏃" label="Fisik Motorik" color="bg-rose-50 text-rose-700" />
          <AspectCard icon="🧠" label="Kognitif" color="bg-indigo-50 text-indigo-700" />
          <AspectCard icon="💬" label="Bahasa" color="bg-sky-50 text-sky-700" />
          <AspectCard icon="❤️" label="Sosial Emosional" color="bg-amber-50 text-amber-700" />
          <AspectCard icon="🎨" label="Seni" color="bg-fuchsia-50 text-fuchsia-700" />
        </div>
      </section>

      {/* Footer text */}
      <div className="text-center pt-20">
         <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
            <span>🌈 RPPH Ceria — Aplikasi Perencanaan Pembelajaran Anak TK</span>
         </p>
         <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">
            Sesuai Kurikulum PAUD · Aspek Perkembangan Holistik
         </p>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color }: any) {
  return (
    <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-[32px] card-shadow border border-gray-100 space-y-3 md:space-y-4">
       <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center ${color}`}>
         {icon}
       </div>
       <div>
         <div className="text-2xl md:text-4xl font-serif font-bold text-gray-900">{value}</div>
         <div className="text-[10px] md:text-sm font-medium text-gray-400 uppercase tracking-tight">{label}</div>
       </div>
    </div>
  );
}

function AgeCard({ title, subtitle, count, color }: any) {
  return (
    <div className={`${color} p-8 md:p-10 rounded-2xl md:rounded-[32px] text-white space-y-4 md:space-y-6 relative overflow-hidden group cursor-pointer shadow-xl`}>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
      <div className="space-y-1 relative z-10">
        <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Usia</div>
        <div className="text-3xl md:text-4xl font-serif font-bold tracking-tight">{title}</div>
      </div>
      <div className="space-y-3 md:space-y-4 relative z-10">
        <p className="text-xs md:text-sm font-medium opacity-90">{subtitle}</p>
        <p className="text-[10px] md:text-xs font-bold opacity-80">{count} kegiatan tersedia</p>
      </div>
      <div className="absolute bottom-4 right-6 md:bottom-6 md:right-8 opacity-20 pointer-events-none transform group-hover:scale-110 transition-transform">
        <span className="text-4xl md:text-6xl">👶</span>
      </div>
    </div>
  );
}

function AspectCard({ icon, label, color }: any) {
  return (
    <div className={`${color} p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-4 transition-all hover:scale-105 cursor-pointer shadow-sm border border-black/5`}>
       <span className="text-3xl">{icon}</span>
       <span className="text-[11px] font-bold uppercase tracking-tight leading-tight">{label}</span>
    </div>
  );
}
