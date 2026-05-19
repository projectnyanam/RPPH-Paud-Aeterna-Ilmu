import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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
app.post("/api/generate-rpph", async (req, res) => {
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
          const materialsList = a.materials && a.materials.length > 0 ? `\n    Alat & Bahan: ${a.materials.join(', ')}` : "";
          return `- ${a.title}: ${a.description} (Durasi: ${a.duration})${materialsList}`;
        }).join("\n");
      };

      activityInstruction = `
      PENTING: Pengguna telah memilih kegiatan spesifik berikut. Anda WAJIB menggunakan kegiatan ini dan menguraikan langkah-langkah pelaksanaannya secara mendetail di bagian 'langkah':

      KEGIATAN PEMBUKAAN:
      ${formatSection('Pembukaan')}

      KEGIATAN INTI:
      ${formatSection('Kegiatan Inti')}

      ISTIRAHAT:
      ${formatSection('Istirahat')}

      KEGIATAN PENUTUP:
      ${formatSection('Penutup')}
      
      Instruksi Langkah & Integrasi:
      1. Untuk setiap kegiatan di atas, uraikan minimal 4-5 langkah praktis.
      2. INTEGRASI ALAT/BAHAN: Anda WAJIB menyebutkan penggunaan Alat & Bahan yang tercantum di atas langsung di dalam narasi langkah-langkah kegiatan (misal: "Guru mengajak anak memegang [Nama Alat]...", "Anak diminta menuangkan [Nama Bahan]...").
      3. Jangan hanya mencantumkan alat di daftar alatBahan, tapi tunjukkan aksinya di bagian langkah.
      4. Sesuaikan durasi total di JSON dengan total durasi kegiatan yang dipilih.
      5. Jika sesi "Belum ada" kegiatan terpilih (seperti Pembukaan/Istirahat), ciptakan kegiatan kreatif yang relevan dengan tema "${theme}" dan sub-tema "${subTheme}".
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

    INSTRUKSI KHUSUS INTEGRASI:
    - Bagian 'materi' (minimal 3-4 poin): Materi harus spesifik membahas fakta/konsep dari sub-tema "${subTheme}".
    - Bagian 'alatBahan': Kumpulkan SEMUA alat dan bahan yang disebutkan dalam langkah kegiatan ke dalam daftar ini.
    - Bagian 'kegiatan': Ini adalah bagian naratif. Jabarkan interaksi guru-anak secara detail. Pastikan ada alur yang logis dari persiapan alat, penggunaan alat oleh anak, hingga evaluasi penggunaan alat tersebut.
    - HUBUNGKAN sub-tema "${subTheme}" dengan alat bahan yang digunakan (misal: jika sub-tema 'Air', pastikan bahan seperti gelas atau pewarna digunakan untuk menunjukkan sifat air).
    - JANGAN biarkan 'langkah' kosong atau terlalu singkat. Gunakan minimal 50 kata per sesi kegiatan.
    - LOKASI TANDA TANGAN: Ekstrak nama KECAMATAN dari 'Alamat Pendidikan' yang diberikan di atas. Jika tidak ada kecamatan, gunakan nama kota. Outputkan hasil ekstraksi ini di field 'identitas.lokasi'.

    Gunakan Bahasa Indonesia yang edukatif, ramah anak, dan profesional.`;

    console.log("Generating RPPH with prompt for theme:", theme);

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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

startServer();
