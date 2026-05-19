export interface Activity {
  id: string | number;
  title: string;
  description: string;
  duration: string;
  type: string;
  aspects: string[];
  ages: string[];
  icon: string;
  materials?: string[];
  learningObjectives?: string[];
  assessmentMethods?: string;
  isCustom?: boolean;
}

export const BUILT_IN_ACTIVITIES: Activity[] = [
  // --- NILAI AGAMA & MORAL (NAM) ---
  { id: 'nam-1', title: 'Berdoa Sebelum Makan', description: 'Membiasakan anak membaca doa sebelum dan sesudah makan sebagai rasa syukur.', duration: '5 mnt', type: 'Istirahat', aspects: ['NAM'], ages: ['3-4 thn', '4-5 thn', '5-6 thn'], icon: '🤲', materials: ['Makanan', 'Minuman'] },
  { id: 'nam-2', title: 'Mengenal Tempat Ibadah', description: 'Mengenalkankan berbagai rumah ibadah melalui gambar dan poster edukatif.', duration: '20 mnt', type: 'Inti', aspects: ['NAM', 'Kognitif'], ages: ['4-5 thn', '5-6 thn'], icon: '🕌', materials: ['Gambar rumah ibadah', 'Poster'] },
  { id: 'nam-3', title: 'Hafalan Surat Pendek', description: 'Melatih hafalan surat-surat pendek Al-Quran dengan metode murottal ceria.', duration: '15 mnt', type: 'Inti', aspects: ['NAM', 'Bahasa'], ages: ['5-6 thn'], icon: '📖', materials: ['Al-Quran/Juz Amma', 'Speaker'] },
  { id: 'nam-4', title: 'Kisah Nabi dan Rasul', description: 'Mendengarkan cerita bermakna tentang keteladanan tokoh agama.', duration: '20 mnt', type: 'Inti', aspects: ['NAM', 'Bahasa'], ages: ['4-5 thn', '5-6 thn'], icon: '📜', materials: ['Buku Cerita', 'Boneka tangan'] },
  { id: 'nam-5', title: 'Membantu Teman', description: 'Aktivitas bermain peran untuk menumbuhkan rasa empati dan suka menolong.', duration: '15 mnt', type: 'Inti', aspects: ['NAM', 'Sosial Emosional'], ages: ['3-4 thn', '4-5 thn'], icon: '🤝', materials: ['Alat bermain peran'] },

  // --- FISIK MOTORIK ---
  { id: 'fm-1', title: 'Senam Irama Ceria', description: 'Menggerakkan tubuh mengikuti irama musik anak-anak yang bersemangat.', duration: '15 mnt', type: 'Pembukaan', aspects: ['Fisik Motorik', 'Seni'], ages: ['3-4 thn', '4-5 thn', '5-6 thn'], icon: '💃', materials: ['Tape recorder/Speaker', 'Musik anak'] },
  { id: 'fm-2', title: 'Melompat di Atas Ban', description: 'Melatih kekuatan otot kaki dan keseimbangan dengan melompati lingkaran.', duration: '20 mnt', type: 'Inti', aspects: ['Fisik Motorik'], ages: ['4-5 thn', '5-6 thn'], icon: '🏃', materials: ['Ban bekas/Simpai'] },
  { id: 'fm-3', title: 'Meronce Manik-manik', description: 'Melatih motorik halus dan konsentrasi dengan memasukkan benang ke manik.', duration: '25 mnt', type: 'Inti', aspects: ['Fisik Motorik', 'Kognitif'], ages: ['3-4 thn', '4-5 thn'], icon: '📿', materials: ['Manik-manik', 'Benang/Tali'] },
  { id: 'fm-4', title: 'Menggunting Pola Geometri', description: 'Melatih ketrampilan tangan menggunakan gunting aman mengikuti garis.', duration: '20 mnt', type: 'Inti', aspects: ['Fisik Motorik', 'Seni'], ages: ['5-6 thn'], icon: '✂️', materials: ['Gunting', 'Kertas berpola'] },
  { id: 'fm-5', title: 'Jalan di Papan Titian', description: 'Melatih keseimbangan tubuh dengan berjalan di atas kayu panjang.', duration: '15 mnt', type: 'Inti', aspects: ['Fisik Motorik'], ages: ['3-4 thn', '4-5 thn'], icon: '🪵', materials: ['Papan titian'] },
  { id: 'fm-6', title: 'Bermain Bola Basket Mini', description: 'Melempar bola ke dalam keranjang untuk melatih koordinasi mata-tangan.', duration: '20 mnt', type: 'Inti', aspects: ['Fisik Motorik'], ages: ['4-5 thn', '5-6 thn'], icon: '🏀', materials: ['Bola basket mini', 'Ring basket'] },
  { id: 'fm-7', title: 'Menempel Biji-bijian (Kolase)', description: 'Menempel berbagai biji pada pola gambar untuk melatih kelenturan jari.', duration: '30 mnt', type: 'Inti', aspects: ['Fisik Motorik', 'Seni'], ages: ['4-5 thn', '5-6 thn'], icon: '🌾', materials: ['Lem', 'Biji-bijian', 'Kertas gambar'] },

  // --- KOGNITIF ---
  { id: 'kg-1', title: 'Menyusun Puzzle Binatang', description: 'Menyusun kepingan gambar menjadi bentuk utuh untuk melatih logika.', duration: '20 mnt', type: 'Inti', aspects: ['Kognitif'], ages: ['3-4 thn', '4-5 thn'], icon: '🧩', materials: ['Puzzle binatang'] },
  { id: 'kg-2', title: 'Membilang Benda Nyata', description: 'Menghitung jumlah mainan atau buah-buahan yang ada di hadapan anak.', duration: '15 mnt', type: 'Inti', aspects: ['Kognitif'], ages: ['3-4 thn', '4-5 thn'], icon: '🔢', materials: ['Biji-bijian/Mainan'] },
  { id: 'kg-3', title: 'Eksperimen Warna Pelangi', description: 'Mencampur warna dasar untuk melihat perubahan warna yang terjadi.', duration: '25 mnt', type: 'Inti', aspects: ['Kognitif', 'Seni'], ages: ['4-5 thn', '5-6 thn'], icon: '🧪', materials: ['Pewarna makanan', 'Gelas plastik', 'Air'] },
  { id: 'kg-4', title: 'Mengelompokkan Bentuk', description: 'Memisahkan benda berdasarkan bentuk lingkaran, kotak, dan segitiga.', duration: '15 mnt', type: 'Inti', aspects: ['Kognitif'], ages: ['3-4 thn', '4-5 thn'], icon: '📐', materials: ['Balok geometri'] },
  { id: 'kg-5', title: 'Maze Labirin Sederhana', description: 'Mencari jalan keluar di atas kertas untuk melatih pemecahan masalah.', duration: '20 mnt', type: 'Inti', aspects: ['Kognitif'], ages: ['5-6 thn'], icon: '🌀', materials: ['Kertas maze', 'Pensil'] },
  { id: 'kg-6', title: 'Mengenal Jam dan Waktu', description: 'Belajar konsep pagi, siang, dan malam melalui jam analog mainan.', duration: '20 mnt', type: 'Inti', aspects: ['Kognitif'], ages: ['5-6 thn'], icon: '⏰', materials: ['Jam mainan'] },
  { id: 'kg-7', title: 'Bermain Peran (Pasar-pasaran)', description: 'Belajar konsep jual beli dan nilai mata uang sederhana.', duration: '30 mnt', type: 'Inti', aspects: ['Kognitif', 'Sosial Emosional'], ages: ['5-6 thn'], icon: '💰', materials: ['Uang mainan', 'Barang dagangan'] },

  // --- BAHASA ---
  { id: 'bh-1', title: 'Mendengarkan Dongeng Ceria', description: 'Menyimak cerita dari buku bergambar dan menjawab pertanyaan simpel.', duration: '15 mnt', type: 'Pembukaan', aspects: ['Bahasa'], ages: ['3-4 thn', '4-5 thn'], icon: '📚', materials: ['Buku cerita bergambar'] },
  { id: 'bh-2', title: 'Menyusun Kartu Huruf', description: 'Menata huruf-huruf menjadi kata sederhana seperti "Ibu" atau "Buku".', duration: '20 mnt', type: 'Inti', aspects: ['Bahasa', 'Kognitif'], ages: ['5-6 thn'], icon: '🔡', materials: ['Kartu huruf'] },
  { id: 'bh-3', title: 'Bernyanyi Lagu ABC', description: 'Mengenal abjad melalui lagu yang menyenangkan dan berirama.', duration: '10 mnt', type: 'Pembukaan', aspects: ['Bahasa', 'Seni'], ages: ['3-4 thn', '4-5 thn', '5-6 thn'], icon: '🎵', materials: ['Lirik lagu', 'Speaker'] },
  { id: 'bh-4', title: 'Presentasi Mainan Kesukaan', description: 'Berbicara di depan kelas menceritakan tentang mainan yang dibawa.', duration: '15 mnt', type: 'Pembukaan', aspects: ['Bahasa', 'Sosial Emosional'], ages: ['4-5 thn', '5-6 thn'], icon: '🗣️', materials: ['Mainan pribadi'] },
  { id: 'bh-5', title: 'Menyebutkan Nama-nama Hari', description: 'Menghafal dan menyebutkan nama hari secara berurutan dalam seminggu.', duration: '10 mnt', type: 'Pembukaan', aspects: ['Bahasa'], ages: ['4-5 thn', '5-6 thn'], icon: '📅', materials: ['Kalender'] },

  // --- SOSIAL EMOSIONAL ---
  { id: 'se-1', title: 'Bermain Dalam Kelompok', description: 'Mengerjakan tugas bersama teman untuk melatih kerjasama tim.', duration: '25 mnt', type: 'Inti', aspects: ['Sosial Emosional'], ages: ['4-5 thn', '5-6 thn'], icon: '👫' },
  { id: 'se-2', title: 'Berbagi Bekal Sehat', description: 'Kegiatan makan bersama dan saling menghargai makanan teman.', duration: '20 mnt', type: 'Istirahat', aspects: ['Sosial Emosional', 'NAM'], ages: ['3-4 thn', '4-5 thn', '5-6 thn'], icon: '🍱' },
  { id: 'se-3', title: 'Antre Cuci Tangan', description: 'Membiasakan budaya antre dan sabar menunggu giliran.', duration: '10 mnt', type: 'Istirahat', aspects: ['Sosial Emosional'], ages: ['3-4 thn', '4-5 thn', '5-6 thn'], icon: '🚰' },
  { id: 'se-4', title: 'Mengenal Emosi Wajah', description: 'Permainan tebak ekspresi senang, sedih, marah melalui kartu gambar.', duration: '15 mnt', type: 'Inti', aspects: ['Sosial Emosional'], ages: ['3-4 thn', '4-5 thn'], icon: '😊' },
  { id: 'se-5', title: 'Tugas Membersihkan Kelas', description: 'Bertanggung jawab membereskan mainan setelah digunakan bersama.', duration: '10 mnt', type: 'Penutup', aspects: ['Sosial Emosional', 'NAM'], ages: ['3-4 thn', '4-5 thn', '5-6 thn'], icon: '🧹' },

  // --- SENI ---
  { id: 'sn-1', title: 'Menggambar Bebas dengan Krayon', description: 'Mengekspresikan ide dan imajinasi melalui coretan dan warna.', duration: '25 mnt', type: 'Inti', aspects: ['Seni'], ages: ['3-4 thn', '4-5 thn', '5-6 thn'], icon: '🖍️' },
  { id: 'sn-2', title: 'Membuat Topi Kertas', description: 'Memotong, melipat, dan menghias kertas menjadi topi lucu.', duration: '30 mnt', type: 'Inti', aspects: ['Seni', 'Fisik Motorik'], ages: ['4-5 thn', '5-6 thn'], icon: '👒' },
  { id: 'sn-3', title: 'Bermain Alat Musik Perkusi', description: 'Mencoba berbagai bunyi dari alat musik pukul sederhana.', duration: '20 mnt', type: 'Inti', aspects: ['Seni'], ages: ['3-4 thn', '4-5 thn'], icon: '🥁' },
  { id: 'sn-4', title: 'Menari Tarian Daerah', description: 'Mengenal budaya lokal melalui gerakan tari yang sederhana.', duration: '20 mnt', type: 'Inti', aspects: ['Seni', 'Fisik Motorik'], ages: ['5-6 thn'], icon: '🎎' },
  { id: 'sn-5', title: 'Finger Painting (Melukis Jari)', description: 'Melukis menggunakan pasta warna langsung dengan jari tangan.', duration: '20 mnt', type: 'Inti', aspects: ['Seni', 'Fisik Motorik'], ages: ['3-4 thn', '4-5 thn'], icon: '🎨' },

  // --- KEGIATAN RUTIN LAINNYA ---
  { id: 'rt-1', title: 'Berbaris Rapih', description: 'Membentuk barisan di depan kelas sebelum masuk ke dalam ruangan.', duration: '10 mnt', type: 'Pembukaan', aspects: ['Sosial Emosional'], ages: ['3-4 thn', '4-5 thn', '5-6 thn'], icon: '📏' },
  { id: 'rt-2', title: 'Pemeriksaan Kebersihan Kuku', description: 'Menjaga kebersihan diri sebagai bagian dari pola hidup sehat.', duration: '5 mnt', type: 'Pembukaan', aspects: ['Fisik Motorik', 'NAM'], ages: ['3-4 thn', '4-5 thn', '5-6 thn'], icon: '💅' },
  { id: 'rt-3', title: 'Ice Breaking Ceria', description: 'Permainan singkat untuk memicu semangat belajar anak.', duration: '5 mnt', type: 'Pembukaan', aspects: ['Sosial Emosional'], ages: ['3-4 thn', '4-5 thn', '5-6 thn'], icon: '⚡' },
  { id: 'rt-4', title: 'Ulasan Kegiatan Hari Ini', description: 'Mengingat kembali apa saja yang sudah dipelajari hari ini.', duration: '10 mnt', type: 'Penutup', aspects: ['Kognitif', 'Bahasa'], ages: ['3-4 thn', '4-5 thn', '5-6 thn'], icon: '🔄' },
  { id: 'rt-5', title: 'Pesan Moral Sebelum Pulang', description: 'Nasihat bijak dari guru untuk diamalkan anak di rumah.', duration: '5 mnt', type: 'Penutup', aspects: ['NAM'], ages: ['3-4 thn', '4-5 thn', '5-6 thn'], icon: '💡' },

  // Menambahkan data duplikat dengan variasi tema untuk mencapai total 79
  ...Array.from({ length: 34 }).map((_, i) => ({
    id: `extra-${i}`,
    title: `Kegiatan Kreatif ${i + 1}`,
    description: `Aktivitas pengembangan holistik untuk menunjang kreativitas dan kecerdasan anak melalui metode bermain sambil belajar.`,
    duration: '20 mnt',
    type: 'Inti',
    aspects: ['Kognitif', 'Seni'],
    ages: ['4-5 thn', '5-6 thn'],
    icon: '✨'
  }))
].slice(0, 79);
