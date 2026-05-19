import React, { useState } from 'react';
import { Book, CheckCircle2, ChevronRight, HelpCircle, Star, Lightbulb, Users, ClipboardCheck, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Reference() {
  const [activeTab, setActiveTab] = useState<'aspek' | 'usia' | 'tips'>('aspek');

  const tabs = [
    { id: 'aspek', label: '6 Aspek Perkembangan', icon: CheckCircle2 },
    { id: 'usia', label: 'Karakteristik Usia', icon: Users },
    { id: 'tips', label: 'Tips Merancang Kegiatan', icon: Lightbulb },
  ] as const;

  return (
    <div className="space-y-8 md:space-y-12 pb-20">
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-600 rounded-3xl md:rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl"
      >
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 md:mb-6">Buku Referensi Guru</h1>
          <p className="text-lg md:text-xl opacity-90 leading-relaxed">
            Panduan lengkap pengembangan aspek kegiatan, indikator perkembangan anak, dan tips penyusunan RPPH PAUD/TK.
          </p>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/3 opacity-10 flex items-center justify-center transform translate-x-12 translate-y-6 hidden md:flex">
           <Book size={400} />
        </div>
      </motion.section>

      <div className="bg-white rounded-3xl md:rounded-[32px] card-shadow border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 no-print overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[140px] py-6 font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id 
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600' 
                  : 'text-gray-500 hover:bg-gray-50 border-b-2 border-transparent'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-12">
          <AnimatePresence mode="wait">
            {activeTab === 'aspek' && (
              <motion.div
                key="aspek"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-12"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl md:rounded-2xl shrink-0">
                    <CheckCircle2 size={24} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Standar Tingkat Pencapaian Perkembangan Anak (STPPA)</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <ReferenceCard 
                    title="Nilai Agama & Moral" 
                    items={[
                      "Mengenal agama yang dianut",
                      "Mengerjakan ibadah",
                      "Berperilaku jujur, penolong, sopan, hormat",
                      "Menjaga kebersihan diri dan lingkungan"
                    ]}
                    color="bg-blue-50/50 border-blue-100 text-blue-900"
                    icon="✨"
                  />
                  <ReferenceCard 
                    title="Fisik Motorik" 
                    description="Motorik Kasar: Keseimbangan, kelincahan, kelenturan. Motorik Halus: Koordinasi mata-tangan."
                    items={[
                      "Kesehatan & Perilaku Keselamatan",
                      "Koordinasi motorik halus",
                      "Keseimbangan tubuh"
                    ]}
                    color="bg-rose-50/50 border-rose-100 text-rose-900"
                    icon="🏃"
                  />
                  <ReferenceCard 
                    title="Kognitif" 
                    description="Mampu memecahkan masalah sederhana dalam kehidupan sehari-hari."
                    items={[
                      "Belajar & Pemecahan Masalah",
                      "Berpikir Logis",
                      "Berpikir Simbolik"
                    ]}
                    color="bg-amber-50/50 border-amber-100 text-amber-900"
                    icon="🧩"
                  />
                  <ReferenceCard 
                    title="Bahasa" 
                    items={[
                      "Memahami bahasa (reseptif)",
                      "Mengekspresikan bahasa",
                      "Keaksaraan awal"
                    ]}
                    color="bg-sky-50/50 border-sky-100 text-sky-900"
                    icon="💬"
                  />
                  <ReferenceCard 
                    title="Sosial Emosional" 
                    items={[
                      { label: "Kesadaran Diri:", value: "Memperlihatkan kemampuan diri, mengenal perasaan sendiri." },
                      { label: "Tanggung Jawab:", value: "Tahu hak dan aturan, mandiri, mau berbagi dan antre." },
                      { label: "Prososial:", value: "Bermain dengan teman sebaya, empati, kooperatif." }
                    ]}
                    color="bg-emerald-50/50 border-emerald-100 text-emerald-900"
                    icon="❤️"
                  />
                  <ReferenceCard 
                    title="Seni" 
                    items={[
                      { label: "Menikmati Karya Seni:", value: "Merasa senang dengan musik, lagu, atau hasil karya seni." },
                      { label: "Mengekspresikan:", value: "Membuat karya seni menggunakan berbagai media (lukis, kriya, tari, musik)." },
                      { label: "Menghargai:", value: "Menghargai hasil karya diri sendiri dan orang lain." }
                    ]}
                    color="bg-purple-50/50 border-purple-100 text-purple-900"
                    icon="🎨"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'usia' && (
              <motion.div
                key="usia"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl md:rounded-2xl shrink-0">
                    <Users size={24} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Karakteristik & Capaian Usia</h2>
                </div>

                <div className="space-y-6">
                  <AgeDetailCard 
                    age="3 - 4 Tahun (Kelompok Bermain)"
                    points={[
                      "Mulai bisa berbagi meski masih dominan egosentris.",
                      "Kemampuan bahasa meningkat drastis (kalimat sederhana).",
                      "Motorik kasar: meloncat, berdiri satu kaki sebentar.",
                      "Suka meniru perilaku orang dewasa dan bermain peran sederhana.",
                      "Konsentrasi pendek (sekitar 5-10 menit)."
                    ]}
                    color="border-blue-200 bg-blue-50/30"
                    icon="🍼"
                  />
                  <AgeDetailCard 
                    age="4 - 5 Tahun (TK A)"
                    points={[
                      "Sudah mulai bisa bekerja sama dalam kelompok kecil.",
                      "Dapat mengikuti instruksi 2-3 langkah.",
                      "Mengenal konsep angka, warna, dan bentuk secara dasar.",
                      "Motorik halus: mulai bisa menggunting sesuai garis, memegang pensil dengan benar.",
                      "Banyak bertanya (fase 'Mengapa?')."
                    ]}
                    color="border-purple-200 bg-purple-50/30"
                    icon="🎨"
                  />
                  <AgeDetailCard 
                    age="5 - 6 Tahun (TK B)"
                    points={[
                      "Sosialisasi sudah matang, bisa antre dan bergantian.",
                      "Berbahasa runtut dan dapat menceritakan pengalaman.",
                      "Persiapan keaksaraan: mengenal huruf dan mencoba menulis nama sendiri.",
                      "Logika matematika: mengurutkan benda dari terkecil ke terbesar.",
                      "Rasa ingin tahu tinggi terhadap cara kerja sesuatu."
                    ]}
                    color="border-orange-200 bg-orange-50/30"
                    icon="🎒"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'tips' && (
              <motion.div
                key="tips"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl md:rounded-2xl shrink-0">
                    <Lightbulb size={24} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Tips Merancang Kegiatan</h2>
                </div>

                <div className="grid grid-cols-1 gap-6 md:gap-8">
                  <TipsSection 
                    title="1. Tahap Persiapan (Planning)"
                    tips={[
                      "Pilih tema yang dekat dengan lingkungan anak (kontekstual).",
                      "Tentukan tujuan pembelajaran yang spesifik, terukur, dan sesuai tingkat usia.",
                      "Siapkan Alat & Bahan (APE) yang aman, menarik, dan variatif.",
                      "Rancanglah pertanyaan pemantik untuk memancing rasa ingin tahu anak."
                    ]}
                    icon={<ClipboardCheck className="text-blue-500" />}
                  />
                  <TipsSection 
                    title="2. Tahap Pelaksanaan (Implementation)"
                    tips={[
                      "Mulai dengan apersepsi yang menyenangkan (nyanyi/cerita).",
                      "Berikan instruksi satu per satu agar anak tidak bingung.",
                      "Guru berperan sebagai fasilitator, biarkan anak bereksplorasi.",
                      "Gunakan strategi scaffolding (berikan bantuan saat anak menemui kesulitan saja)."
                    ]}
                    icon={<Users className="text-emerald-500" />}
                  />
                  <TipsSection 
                    title="3. Tahap Evaluasi (Assessment)"
                    tips={[
                      "Lakukan observasi saat anak melakukan kegiatan (catat hal unik).",
                      "Gunakan berbagai teknik: Ceklis, Catatan Anekdot, atau Hasil Karya.",
                      "Berikan umpan balik positif yang spesifik terhadap usaha anak.",
                      "Lakukan refleksi bersama anak di akhir kegiatan (Recalling)."
                    ]}
                    icon={<Info className="text-orange-500" />}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="text-center space-y-2 py-10 opacity-60">
         <p className="flex items-center justify-center gap-2 text-sm font-bold text-slate-800">
           🌈 RPPH Ceria — Aplikasi Perencanaan Pembelajaran Anak TK
         </p>
         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
           Sesuai Kurikulum PAUD · Aspek Perkembangan Holistik
         </p>
      </div>
    </div>
  );
}

function AgeDetailCard({ age, points, color, icon }: any) {
  return (
    <div className={`p-6 md:p-8 rounded-2xl md:rounded-3xl border ${color} space-y-4`}>
      <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-800 flex items-center gap-3">
        <span className="text-3xl">{icon}</span> {age}
      </h3>
      <ul className="space-y-3">
        {points.map((p: string, i: number) => (
          <li key={i} className="flex items-start gap-3 text-sm md:text-base text-gray-600 font-medium">
             <div className="w-1.5 h-1.5 rounded-full bg-current mt-2 shrink-0" />
             {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TipsSection({ title, tips, icon }: any) {
  return (
    <div className="bg-gray-50/50 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-50">{icon}</div>
        <h3 className="font-bold text-gray-900 text-lg md:text-xl">{title}</h3>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {tips.map((tip: string, i: number) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-50 shadow-sm flex items-start gap-3">
             <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</div>
             <p className="text-sm text-gray-600 font-medium">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReferenceCard({ title, items, color, icon, description }: any) {
  return (
    <div className={`p-6 md:p-10 rounded-2xl md:rounded-[32px] border ${color} space-y-4 md:space-y-6 shadow-sm`}>
      <div className="flex items-center justify-between">
         <h3 className="text-xl md:text-2xl font-serif font-bold flex items-center gap-3">
           <span className="text-2xl md:text-3xl">{icon}</span> {title}
         </h3>
      </div>
      {description && <p className="text-xs md:text-sm font-medium opacity-70 leading-relaxed mb-4">{description}</p>}
      <ul className="space-y-3 md:space-y-4">
        {items.map((item: any, i: number) => (
          <li key={i} className="flex items-start gap-3 text-xs md:text-sm opacity-90">
            <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              {typeof item === 'string' ? (
                <span className="font-semibold">{item}</span>
              ) : (
                <>
                  <span className="font-bold block md:inline">{item.label}</span>
                  <span className="font-medium ml-1">{item.value}</span>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
