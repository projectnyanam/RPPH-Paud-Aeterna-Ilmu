# RPPH Ceria - Portal Guru TK

Aplikasi perancangan RPPH (Rencana Pelaksanaan Pembelajaran Harian) untuk guru Taman Kanak-kanak yang didukung oleh kecerdasan buatan (Gemini AI).

## Fitur Utama

- **Pembuat RPPH Otomatis**: Menghasilkan rencana harian mendetail berdasarkan tema, sub-tema, dan kelompok usia.
- **Pustaka Kegiatan**: Ratusan ide kegiatan TK yang bisa dipilih dan dikustomisasi.
- **Buku Referensi**: Panduan praktis aspek perkembangan anak dan tips pedagogi.
- **Export PDF & Word**: Cetak atau simpan rencana ke format dokumen profesional.
- **Responsif**: Dapat diakses melalui smartphone, tablet, maupun laptop.

## Teknologi

- **Frontend**: React 19, Vite, Tailwind CSS, Motion.
- **Backend**: Node.js, Express.
- **AI**: Google Gemini API (@google/genai).
- **Export**: jsPDF, html-to-image.

## Persyaratan Lingkungan

Buat file `.env` dan tambahkan kunci API berikut:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```
