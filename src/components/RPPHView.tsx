import React, { useRef } from 'react';
import { FileText, Printer, ChevronLeft, Calendar, UserCheck, Package, ListChecks, CheckCircle2, BookOpen, Download, FileJson, FileType, Clock, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { useReactToPrint } from 'react-to-print';
import { useAuth } from '../context/AuthContext';

interface RPPHViewProps {
  data: any;
  onBack: () => void;
}

export default function RPPHView({ data, onBack }: RPPHViewProps) {
  const { profile } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  // GANTI LINK DI BAWAH INI DENGAN DIRECT LINK MONETAG ANDA
  const MONETAG_DIRECT_LINK = "https://omg10.com/4/10984630"; // Contoh link

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `RPPH-${data.identitas?.temaSubTema || 'Taman-Kanak-Kanak'}`,
    onBeforePrint: () => {
      // Optional: open monetization link before printing
      window.open(MONETAG_DIRECT_LINK, '_blank');
      return Promise.resolve();
    }
  });

  const exportToPDF = () => {
    // react-to-print utilizes the native browser print dialogue which provides the best 
    // "Save to PDF" experience natively (selectable text, proper vector text).
    handlePrint();
  };

  const exportToWord = () => {
    if (!contentRef.current) return;
    
    window.open(MONETAG_DIRECT_LINK, '_blank');
    
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>RPPH</title><style>body { font-family: 'Times New Roman', serif; padding: 20px; } .text-center { text-align: center; } .font-bold { font-weight: bold; } .uppercase { text-transform: uppercase; } h1 { font-size: 18pt; } h2 { font-size: 14pt; } table { width: 100%; border-collapse: collapse; margin-bottom: 20px; } td { border-bottom: 1px solid #eee; padding: 5px; } .section-title { border-bottom: 1px solid #000; font-weight: bold; margin-top: 20px; text-transform: uppercase; } .step-list { margin-left: 20px; } .footer { margin-top: 40px; border-top: 1px solid #eee; padding-top: 10px; font-size: 10pt; color: #888; text-align: center; }</style></head><body>`;
    const footerLink = `<div class='footer'>Dibuat secara otomatis di <a href='${MONETAG_DIRECT_LINK}'>Paud Aeternal Ilmu</a></div>`;
    const footer = footerLink + "</body></html>";
    const sourceHTML = header + contentRef.current.innerHTML + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `RPPH-${data.identitas?.temaSubTema || 'Taman-Kanak-Kanak'}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const identitas = data.identitas || {};
  const kegiatan = data.kegiatan || {};

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between no-print mb-6 gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors w-fit"
        >
          <ChevronLeft size={20} />
          Kembali
        </button>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
            <button 
              onClick={exportToPDF}
              title="Export ke PDF"
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <Download size={18} />
              <span className="text-xs font-bold uppercase">PDF</span>
            </button>
            <div className="w-px h-6 bg-gray-100 self-center mx-1" />
            <button 
              onClick={exportToWord}
              title="Export ke Word"
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <FileType size={18} />
              <span className="text-xs font-bold uppercase">Word</span>
            </button>
          </div>

          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Printer size={18} />
            <span className="font-bold">Cetak RPPH</span>
          </button>
        </div>
      </div>

      <div ref={contentRef} className="bg-white p-6 md:p-12 rounded-2xl md:rounded-3xl shadow-sm border border-[#E8E2D9] print:border-none print:shadow-none print:p-0 overflow-x-auto">
        {/* Header RPPH */}
        <div className="text-center border-b-2 border-gray-100 pb-6 md:pb-8 mb-6 md:mb-8 space-y-2">
          <h1 className="text-xl md:text-3xl font-serif font-bold text-gray-900 uppercase">Rencana Pelaksanaan Pembelajaran Harian</h1>
          <h2 className="text-sm md:text-xl font-medium text-gray-600">({data.schoolName || identitas.satuanPendidikan || 'Taman Kanak-kanak'})</h2>
          {(data.schoolAddress || identitas.alamatSekolah) && (
            <p className="text-[10px] md:text-xs text-gray-400 font-medium italic">{data.schoolAddress || identitas.alamatSekolah}</p>
          )}
        </div>

        {/* Identity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-10 text-xs md:text-sm">
          <div className="flex justify-between border-b border-gray-50 pb-2">
            <span className="text-gray-500 font-medium">Nama Guru</span>
            <span className="font-bold text-gray-800">{data.teacherName || identitas.guru || '-'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-50 pb-2">
            <span className="text-gray-500 font-medium">Nama Kelas</span>
            <span className="font-bold text-gray-800">{data.className || identitas.kelas || '-'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-50 pb-2">
            <span className="text-gray-500 font-medium">Semester / Minggu</span>
            <span className="font-bold text-gray-800">{identitas.semester || '-'} / {identitas.minggu || '-'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-50 pb-2">
            <span className="text-gray-500 font-medium">Hari / Tanggal</span>
            <span className="font-bold text-gray-800">{identitas.hariTanggal || '-'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-50 pb-2">
            <span className="text-gray-500 font-medium">Kelompok Usia</span>
            <span className="font-bold text-gray-800">{identitas.kelompokUsia || '-'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-50 pb-2">
            <span className="text-gray-500 font-medium">Tema / Sub Tema</span>
            <span className="font-bold text-gray-800">{identitas.temaSubTema || '-'}</span>
          </div>
        </div>

        <div className="space-y-10">
          <Section icon={<BookOpen className="text-blue-500" />} title="Materi Pembelajaran">
            <ul className="list-disc list-inside space-y-1 text-gray-700 leading-relaxed">
              {(data.materi || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
            </ul>
          </Section>

          <Section icon={<CheckCircle2 className="text-green-500" />} title="Tujuan Pembelajaran">
            <ul className="list-disc list-inside space-y-1 text-gray-700 leading-relaxed">
              {(data.tujuanPembelajaran || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
            </ul>
          </Section>

          <Section icon={<Package className="text-orange-500" />} title="Alat dan Bahan">
            <div className="flex flex-wrap gap-2">
              {(data.alatBahan || []).map((item: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-100">
                  {item}
                </span>
              ))}
            </div>
          </Section>

          <Section icon={<ListChecks className="text-purple-500" />} title="Kegiatan Pembelajaran">
            <div className="space-y-6">
              <SubSection title="A. Kegiatan Pembukaan" duration={kegiatan.pembukaan?.durasi || "0 menit"}>
                <ul className="list-decimal list-inside space-y-2 text-gray-700">
                  {(kegiatan.pembukaan?.langkah || []).map((u: string, i: number) => <li key={i} className="pl-2">{u}</li>)}
                </ul>
              </SubSection>
              <SubSection title="B. Kegiatan Inti" duration={kegiatan.inti?.durasi || "0 menit"}>
                <ul className="list-decimal list-inside space-y-2 text-gray-700">
                  {(kegiatan.inti?.langkah || []).map((u: string, i: number) => <li key={i} className="pl-2">{u}</li>)}
                </ul>
              </SubSection>
              <SubSection title="C. Istirahat / Makan" duration={kegiatan.istirahat?.durasi || "0 menit"}>
                <ul className="list-decimal list-inside space-y-2 text-gray-700">
                  {(kegiatan.istirahat?.langkah || []).map((u: string, i: number) => <li key={i} className="pl-2">{u}</li>)}
                </ul>
              </SubSection>
              <SubSection title="D. Kegiatan Penutup" duration={kegiatan.penutup?.durasi || "0 menit"}>
                <ul className="list-decimal list-inside space-y-2 text-gray-700">
                  {(kegiatan.penutup?.langkah || []).map((u: string, i: number) => <li key={i} className="pl-2">{u}</li>)}
                </ul>
              </SubSection>
            </div>
          </Section>

          <Section icon={<FileText className="text-red-500" />} title="Rencana Penilaian">
            <ul className="list-disc list-inside space-y-1 text-gray-700 leading-relaxed">
              {(data.rencanaPenilaian || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
            </ul>
          </Section>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-12 text-center text-sm print:mt-24">
          <div className="space-y-16">
            <p>Mengetahui,<br /><span className="font-bold">Kepala Sekolah</span></p>
            <div className="w-40 h-px bg-gray-400 mx-auto" />
          </div>
          <div className="space-y-16">
            <p>{identitas.lokasi || '........' }, ..........................<br /><span className="font-bold">{data.teacherName || identitas.guru || 'Guru Kelas'}</span></p>
            <div className="w-40 h-px bg-gray-400 mx-auto" />
          </div>
        </div>

        {/* Monetag Backlink - Visible on Export */}
        <div className="mt-12 pt-8 border-t border-gray-50 text-center">
            <p className="text-[10px] text-gray-300 font-medium tracking-widest uppercase mb-2">Dokumen Digital Paud Aeternal Ilmu</p>
            <a 
              href={MONETAG_DIRECT_LINK} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-600 transition-colors text-xs font-bold"
            >
              <ExternalLink size={12} />
              Dapatkan RPPH Menarik Lainnya Disini
            </a>
        </div>
      </div>
    </motion.div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
        <div className="shrink-0">{icon}</div>
        <h3 className="font-bold text-gray-900 tracking-wide uppercase text-sm md:text-base">{title}</h3>
      </div>
      <div className="pl-0 md:pl-8">{children}</div>
    </div>
  );
}

function SubSection({ title, duration, children }: { title: string, duration: string, children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-50 pb-2">
        <h4 className="font-bold text-gray-800 text-sm md:text-base italic">{title}</h4>
        <div className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full w-fit font-bold">
          <Clock size={12} />
          {duration}
        </div>
      </div>
      <div className="pl-0 md:pl-4">{children}</div>
    </div>
  );
}
