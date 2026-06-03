import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

import firebaseConfig from "./firebase-applet-config.json";

// Initialize Firebase Admin (Required for Token Verification)
if (!admin.apps?.length) {
  try {
    admin.initializeApp({
      projectId: firebaseConfig.projectId
    });
  } catch (error) {
    console.warn("Failed to initialize Firebase Admin automatically.", error);
  }
}

// Middleware to verify Firebase Auth Token
async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Token Otentikasi tidak ditemukan." });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying auth token', error);
    return res.status(401).json({ error: "Sesi otentikasi tidak valid atau telah berakhir." });
  }
}

// Extend Express Request object
declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken;
    }
  }
}

// Initialize Gemini lazily
let aiInstance: GoogleGenAI | null = null;
function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in the environment variables.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// API Routes

app.post("/api/generate-rpph", requireAuth, async (req, res) => {
  const { 
    theme, 
    subTheme, 
    ageGroup, 
    date, 
    teacherName, 
    schoolName,
    schoolAddress,
    className,
    semester,
    week,
    day,
    extraContext,
    goals,
    activities
  } = req.body;

  if (!theme || !subTheme || !ageGroup) {
    return res.status(400).json({ error: "Kolom Tema, Sub Tema, dan Kelompok Usia wajib diisi." });
  }

  try {
    const ai = getAI();
    
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
      1. URUTKAN LANGKAH SECARA DETAIL: Di bagian objek "kegiatan" untuk masing-masing bagian (pembukaan, inti, istirahat, penutup), Anda harus menghasilkan minimal 5-6 langkah praktis, konkret, dan taktis yang berurutan secara logis. Setiap langkah harus berupa instruksi operasional yang interaktif antara guru dan anak.
      2. PENYEBUTAN EKSPLISIT ALAT & BAHAN DALAM LANGKAH: Untuk setiap kegiatan di atas yang memiliki daftar "Alat & Bahan", Anda WAJIB menggambarkan penggunaan dan menyebutkan nama alat/bahan tersebut secara eksplisit di dalam kalimat langkah kegiatannya.
         * Contoh Benar: "Guru membagikan kertas lipat biru dan lem kertas kepada anak-anak, kemudian menginstruksikan cara menempel kertas tersebut untuk membentuk kapal."
         * Contoh Salah: "Guru membagikan bahan dan meminta anak menempelnya." (Terlalu abstrak dan tidak menyebutkan nama bahan secara eksplisit).
      3. Jangan hanya mendaftar alat/bahan di field 'alatBahan', tapi tunjukkan aksi nyata pemakaiannya satu per satu di runtutan narasi 'langkah'.
      4. Jika terdapat sesi yang "Belum ada" kegiatan pilihan, buat sekelompok kegiatan kreatif baru yang relevan dengan tema "${theme}" dan sub-tema "${subTheme}" serta kombinasikan dengan alat/bahan edukatif yang menarik untuk kelompok usia ${ageGroup}.
      `;
    }

    const prompt = `Buatlah RPPH (Rencana Pelaksanaan Pembelajaran Harian) TK yang SANGAT DETAIL, KREATIF, dan TERINTEGRASI.
    
    DATA IDENTITAS:
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
    - Bagian 'materi' (minimal 3-4 poin): Materi harus spesifik membahas fakta, konsep, dan nilai moral dari sub-tema "${subTheme}".
    - Bagian 'alatBahan': Kumpulkan dan tuliskan secara lengkap SEMUA alat dan bahan yang digunakan oleh anak dan guru yang disebutkan pada langkah kegiatan.
    - Bagian 'kegiatan': Ini adalah bagian naratif yang dijabarkan per langkah (step-by-step) dalam bentuk array of strings. Jabarkan interaksi guru-anak secara konkret. Pastikan ada alur yang logis dari persiapan alat/bahan, penggunaan alat/bahan oleh anak, interaksi eksploratif, hingga beres-beres.
    - HUBUNGKAN sub-tema "${subTheme}" secara eksplisit dengan alat bahan yang digunakan (misal: jika sub-tema 'Air', pastikan bahan seperti gelas plastik, air jernih, pewarna makanan digunakan untuk eksperimen membuktikan sifat air).
    - JANGAN biarkan 'langkah' kosong, terlalu singkat, atau bernada umum. Setiap sesi kegiatan (pembukaan, inti, istirahat, penutup) harus dijabarkan minimal 5-6 langkah runtut dengan detail aksi konkret yang jelas.
    - LOKASI TANDA TANGAN: Ekstrak nama KECAMATAN dari 'Alamat Pendidikan' yang diberikan di atas. Jika tidak ada kecamatan, gunakan nama kota. Outputkan hasil ekstraksi ini di field 'identitas.lokasi'.

    Gunakan Bahasa Indonesia yang edukatif, ramah anak, ekspresif, dan profesional.`;

    console.log("Generating RPPH with prompt for theme:", theme);

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
              required: ["satuanPendidikan", "lokasi", "guru", "kelas", "semester", "minggu", "hariKe", "hariTanggal", "kelompokUsia", "temaSubTema"],
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
              required: ["pembukaan", "inti", "istirahat", "penutup"],
              properties: {
                pembukaan: {
                  type: Type.OBJECT,
                  required: ["durasi", "langkah"],
                  properties: {
                    durasi: { type: Type.STRING },
                    langkah: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                },
                inti: {
                  type: Type.OBJECT,
                  required: ["durasi", "langkah"],
                  properties: {
                    durasi: { type: Type.STRING },
                    langkah: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                },
                istirahat: {
                  type: Type.OBJECT,
                  required: ["durasi", "langkah"],
                  properties: {
                    durasi: { type: Type.STRING },
                    langkah: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                },
                penutup: {
                  type: Type.OBJECT,
                  required: ["durasi", "langkah"],
                  properties: {
                    durasi: { type: Type.STRING },
                    langkah: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              }
            },
            rencanaPenilaian: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      },
    });

    const text = result.text?.trim();
    if (!text) {
      throw new Error("AI tidak memberikan respon. Silakan coba lagi.");
    }

    try {
      const parsedData = JSON.parse(text);
      console.log("Successfully parsed RPPH data");
      res.json(parsedData);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw text:", text);
      res.status(500).json({ error: "Gagal memproses data RPPH. Silakan coba sesaat lagi." });
    }
  } catch (error: any) {
    console.error("Gemini Error:", error);
    const message = error.message || "Terjadi kesalahan pada server AI.";
    res.status(500).json({ error: message });
  }
});

// Generic API error handler
app.use('/api/*', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: "Invalid JSON format in the request payload." });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: "Payload terlalu besar." });
  }
  console.error("Express API Error:", err);
  res.status(500).json({ error: "Terjadi kesalahan pada server AI." });
});

// Vite middleware flow
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export const apiApp = app;

if (process.env.NETLIFY !== "true") {
  startServer();
}
