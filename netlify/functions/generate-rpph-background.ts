import { GoogleGenAI, Type } from "@google/genai";
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    admin.initializeApp();
  }
}

export const handler = async (event: any) => {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: 'Bad Request' };
  }

  const {
    docId, theme, subTheme, ageGroup, date, teacherName, schoolName,
    schoolAddress, className, semester, week, day, extraContext, goals, activities
  } = body;

  if (!docId) {
    console.error("No docId provided");
    return { statusCode: 400 };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    let activityInstruction = "";
    let goalInstruction = "";
    
    if (goals && goals.length > 0) {
      goalInstruction = `Gunakan tujuan pembelajaran yang sudah ditentukan ini: ${goals.join('; ')}`;
    }

    if (activities) {
      const formatSection = (sectionName: string) => {
        const acts = activities[sectionName];
        if (!acts || acts.length === 0) return "Belum ada (buatkan kegiatan kreatif)";
        return acts.map((a: any) => {
          const materialsList = a.materials && a.materials.length > 0 ? `\n    Alat & Bahan yang Wajib Disebutkan di Langkah: ${a.materials.join(', ')}` : "";
          return `- [Nama Kegiatan] ${a.title}\n   [Deskripsi] ${a.description}\n   [Durasi] ${a.duration}${materialsList}`;
        }).join("\n\n");
      };

      activityInstruction = `
      PENTING - INTEGRASI KEGIATAN PILIHAN USER:
      Pengguna telah memilih kegiatan spesifik berikut untuk hari ini. Anda WAJIB menggunakan aktivitas-aktivitas ini sebagai konten utama kegiatan pembelajaran Anda dan menguraikannya secara dinamis dan mendalam di bagian 'langkah':

      KEGIATAN PEMBUKAAN PILIHAN USER:
      ${formatSection('Pembukaan')}

      KEGIATAN INTI PILIHAN USER:
      ${formatSection('Kegiatan Inti')}

      ISTIRAHAT PILIHAN USER:
      ${formatSection('Istirahat')}

      KEGIATAN PENUTUP PILIHAN USER:
      ${formatSection('Penutup')}
      
      INSTRUKSI WAJIB PENGEMBANGAN LANGKAH (STEPS):
      1. URUTKAN LANGKAH SECARA DETAIL: Di bagian objek "kegiatan" untuk masing-masing bagian, menghasilkan minimal 5-6 langkah praktis berurutan.
      2. PENYEBUTAN EKSPLISIT ALAT & BAHAN DALAM LANGKAH: Wajib menggambarkan penggunaan alat/bahan secara eksplisit.
      3. Jangan hanya mendaftar alat/bahan di field 'alatBahan', tapi tunjukkan aksi nyata pemakaiannya.
      4. Jika terdapat sesi yang "Belum ada" kegiatan pilihan, buat sekelompok kegiatan kreatif baru.`;
    }

    const prompt = `Buatlah RPPH (Rencana Pelaksanaan Pembelajaran Harian) TK yang SANGAT DETAIL, KREATIF, dan TERINTEGRASI.
    - Satuan Pendidikan: ${schoolName || '...'}
    - Alamat Pendidikan: ${schoolAddress || '...'}
    - Guru: ${teacherName || '...'}
    - Kelas: ${className || '...'}
    - Semester: ${semester || '...'}
    - Minggu ke: ${week || '...'}
    - Hari ke: ${day || '...'}
    - Tema: ${theme}
    - Sub Tema: ${subTheme}
    - Kelompok Usia: ${ageGroup}
    - Tanggal: ${date || 'Sesuai jadwal'}
    - Konteks Tambahan: ${extraContext || 'Tidak ada'}
    ${goalInstruction}
    ${activityInstruction}
    
    INSTRUKSI KHUSUS INTEGRASI & STRUKTUR:
    - Bagian 'materi' (minimal 3-4 poin): Materi harus spesifik.
    - Bagian 'alatBahan': Kumpulkan dan tuliskan secara lengkap.
    - Bagian 'kegiatan': Ini adalah bagian naratif yang dijabarkan per langkah (step-by-step) dalam bentuk array of strings. Jabarkan interaksi guru-anak secara konkret.
    - LOKASI TANDA TANGAN: Ekstrak nama KECAMATAN dari 'Alamat Pendidikan'. Outputkan di field 'identitas.lokasi'.

    Gunakan Bahasa Indonesia yang edukatif, ramah anak, ekspresif, dan profesional. Output WAJIB berformat JSON sesuai skema.`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["identitas", "materi", "tujuanPembelajaran", "alatBahan", "kegiatan", "rencanaPenilaian"],
          properties: {
            identitas: {
              type: Type.OBJECT,
              properties: {
                satuanPendidikan: { type: Type.STRING },
                lokasi: { type: Type.STRING },
                guru: { type: Type.STRING },
                kelas: { type: Type.STRING },
                semester: { type: Type.STRING },
                minggu: { type: Type.STRING },
                hariKe: { type: Type.STRING },
                hariTanggal: { type: Type.STRING },
                kelompokUsia: { type: Type.STRING },
                temaSubTema: { type: Type.STRING }
              }
            },
            materi: { type: Type.ARRAY, items: { type: Type.STRING } },
            tujuanPembelajaran: { type: Type.ARRAY, items: { type: Type.STRING } },
            alatBahan: { type: Type.ARRAY, items: { type: Type.STRING } },
            kegiatan: {
              type: Type.OBJECT,
              properties: {
                pembukaan: { type: Type.OBJECT, properties: { durasi: { type: Type.STRING }, langkah: { type: Type.ARRAY, items: { type: Type.STRING } } } },
                inti: { type: Type.OBJECT, properties: { durasi: { type: Type.STRING }, langkah: { type: Type.ARRAY, items: { type: Type.STRING } } } },
                istirahat: { type: Type.OBJECT, properties: { durasi: { type: Type.STRING }, langkah: { type: Type.ARRAY, items: { type: Type.STRING } } } },
                penutup: { type: Type.OBJECT, properties: { durasi: { type: Type.STRING }, langkah: { type: Type.ARRAY, items: { type: Type.STRING } } } }
              }
            },
            rencanaPenilaian: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      },
    });

    const text = result.text?.trim();
    if (!text) throw new Error("No response");
    const parsedData = JSON.parse(text);

    await admin.firestore().collection('rpphs').doc(docId).update({
      ...parsedData,
      status: 'completed'
    });
    
  } catch (error: any) {
    console.error("Background Gen Error:", error);
    await admin.firestore().collection('rpphs').doc(docId).update({
      status: 'error',
      errorMessage: error.message || "Unknown error"
    });
  }
};
