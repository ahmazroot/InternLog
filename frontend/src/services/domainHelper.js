/**
 * Domain Helper
 * Membantu deteksi kategori domain industri magang (IT, Marketing, Admin, Finance, Medical, Education, Umum)
 * dan menyediakan generator data simulasi (mock) yang sangat relevan dengan disiplin ilmu masing-masing.
 */

export const DOMAINS = {
  IT: 'IT',
  MARKETING: 'MARKETING',
  ADMIN: 'ADMIN',
  FINANCE: 'FINANCE',
  HEALTH: 'HEALTH',
  EDUCATION: 'EDUCATION',
  GENERAL: 'GENERAL'
}

/**
 * Deteksi domain secara cerdas berdasarkan nama program magang
 */
export function detectDomain(namaMagang) {
  if (!namaMagang) return DOMAINS.GENERAL
  const name = namaMagang.toLowerCase()

  if (
    name.includes('developer') ||
    name.includes('programmer') ||
    name.includes('it') ||
    name.includes('software') ||
    name.includes('coding') ||
    name.includes('system') ||
    name.includes('web') ||
    name.includes('network') ||
    name.includes('data') ||
    name.includes('rekayasa') ||
    name.includes('teknologi')
  ) {
    return DOMAINS.IT
  }

  if (
    name.includes('marketing') ||
    name.includes('pemasaran') ||
    name.includes('sales') ||
    name.includes('penjualan') ||
    name.includes('brand') ||
    name.includes('socmed') ||
    name.includes('medsos') ||
    name.includes('desain') ||
    name.includes('design') ||
    name.includes('kreatif') ||
    name.includes('creative') ||
    name.includes('copywriter') ||
    name.includes('konten') ||
    name.includes('content') ||
    name.includes('visual')
  ) {
    return DOMAINS.MARKETING
  }

  if (
    name.includes('admin') ||
    name.includes('administrasi') ||
    name.includes('hrd') ||
    name.includes('hr') ||
    name.includes('sdm') ||
    name.includes('recruitment') ||
    name.includes('rekrutmen') ||
    name.includes('manajemen') ||
    name.includes('office') ||
    name.includes('sekretaris') ||
    name.includes('staff')
  ) {
    return DOMAINS.ADMIN
  }

  if (
    name.includes('keuangan') ||
    name.includes('finance') ||
    name.includes('akuntansi') ||
    name.includes('accounting') ||
    name.includes('pajak') ||
    name.includes('tax') ||
    name.includes('bank') ||
    name.includes('audit') ||
    name.includes('kas')
  ) {
    return DOMAINS.FINANCE
  }

  if (
    name.includes('kesehatan') ||
    name.includes('health') ||
    name.includes('medis') ||
    name.includes('nurse') ||
    name.includes('perawat') ||
    name.includes('bidan') ||
    name.includes('dokter') ||
    name.includes('rs') ||
    name.includes('rumah sakit') ||
    name.includes('klinik') ||
    name.includes('farmasi') ||
    name.includes('apotek')
  ) {
    return DOMAINS.HEALTH
  }

  if (
    name.includes('guru') ||
    name.includes('pengajar') ||
    name.includes('pendidikan') ||
    name.includes('education') ||
    name.includes('sekolah') ||
    name.includes('bimbel') ||
    name.includes('kelas') ||
    name.includes('ajar')
  ) {
    return DOMAINS.EDUCATION
  }

  return DOMAINS.GENERAL
}

/**
 * Kamus konfigurasi konten spesifik per domain
 */
const DOMAIN_CONFIGS = {
  [DOMAINS.IT]: {
    kategori: 'Teknis',
    hardSkills: [
      { nama_skill: 'React.js', bukti: 'Mengembangkan komponen antarmuka pengguna berbasis React.' },
      { nama_skill: 'CSS Styling', bukti: 'Menata estetika komponen agar selaras dengan desain sistem.' },
      { nama_skill: 'RESTful API', bukti: 'Mengintegrasikan data asinkron dari backend API dengan frontend.' },
      { nama_skill: 'Git & Versioning', bukti: 'Melakukan management branch dan push revision ke repositori.' }
    ],
    softSkills: [
      { nama_skill: 'Kemandirian', bukti: 'Menyelesaikan pengerjaan tugas harian secara mandiri.' },
      { nama_skill: 'Ketelitian', bukti: 'Memeriksa detail implementasi kode agar terhindar dari bug.' },
      { nama_skill: 'Pemecahan Masalah', bukti: 'Menyelesaikan kendala error data fetching secara logis.' }
    ],
    pembelajaran: [
      'Pemahaman alur integrasi manajemen state komponen.',
      'Penerapan standar clean code dalam pengerjaan frontend.'
    ],
    tantangan: 'Menyelesaikan masalah teknis tak terduga yang muncul saat pengerjaan integrasi API.',
    judulLaporan: 'Laporan Akhir Rekayasa Perangkat Lunak & Sistem Informasi',
    ringkasanEksekutif: 'Mahasiswa menunjukkan dedikasi yang tinggi selama masa magang. Yang bersangkutan sangat aktif mengimplementasikan fitur dengan performa solid, serta mandiri dalam menyusun komponen modular yang responsif.',
    perjalanan: [
      { periode: 'Bulan ke-1', narasi: 'Fokus pada pengenalan codebase sistem, setup local development environment, serta pengerjaan slicing UI dasar menggunakan React.js dan Vanilla CSS.' },
      { periode: 'Bulan ke-2', narasi: 'Mulai masuk ke integrasi sistem RESTful API, implementasi modul grafik interaktif, dan optimasi performa render komponen utama.' },
      { periode: 'Bulan ke-3', narasi: 'Pengerjaan modul Timeline & AI, implementasi BlockNote editor WYSIWYG, dan pemolesan kualitas antarmuka visual (premium micro-animations).' }
    ],
    rekomendasiKarir: 'Junior Frontend Developer / Junior Software Engineer',
    rekomendasiKarirAlasan: 'Sangat terampil dalam menyusun arsitektur komponen modular berbasis React dan memiliki logika pemecahan masalah yang kuat saat debugging.',
    rekomendasiKarirSaran: 'Perdalam pemahaman konsep struktur data modern dan performa rendering visual.',
    refleksi: 'Masa magang ini memberikan perspektif industri nyata yang sangat berharga, mengasah keterampilan teknis coding, serta meningkatkan kesiapan karir sebagai pengembang perangkat lunak profesional.',
    perusahaan: {
      Surabaya: [
        { nama_perusahaan: 'DOT Indonesia (Surabaya)', alamat: 'Kawasan Sentra Teknologi Utama, Surabaya', kontak: 'careers.dot.co.id', alasan_kecocokan: 'Sangat cocok untuk memperdalam pengerjaan sistem React modular yang Anda kuasai.' },
        { nama_perusahaan: 'Jagoan Hosting (Surabaya)', alamat: 'Gedung Cyber Tech, Surabaya', kontak: 'recruitment@jagoanhosting.com', alasan_kecocokan: 'Fokus pada penyediaan infrastruktur awan dan optimasi rendering.' }
      ],
      Jakarta: [
        { nama_perusahaan: 'Gojek (Jakarta)', alamat: 'Menara Pasaraya Blok M, Jakarta Selatan', kontak: 'careers.gojek.com', alasan_kecocokan: 'Membangun solusi transportasi berbasis aplikasi super skala besar.' },
        { nama_perusahaan: 'Tokopedia (Jakarta)', alamat: 'Tokopedia Tower, Kuningan, Jakarta', kontak: 'recruitment@tokopedia.com', alasan_kecocokan: 'Mengembangkan platform marketplace e-commerce terbesar di Indonesia.' }
      ],
      Bandung: [
        { nama_perusahaan: 'Agate Studio (Bandung)', alamat: 'Kawasan Bandung Techno Park, Bandung', kontak: 'careers.agate.id', alasan_kecocokan: 'Studio game dan pengembangan perangkat interaktif multinasional.' }
      ],
      default: [
        { nama_perusahaan: 'PT Telkom Indonesia', alamat: 'Kantor Wilayah Telekomunikasi Setempat', kontak: 'recruitment.telkom.co.id', alasan_kecocokan: 'Peluang magang dan karir IT infrastruktur nasional terbesar.' }
      ]
    }
  },

  [DOMAINS.MARKETING]: {
    kategori: 'Pemasaran & Desain',
    hardSkills: [
      { nama_skill: 'Copywriting', bukti: 'Merancang naskah promosi kreatif untuk kampanye media sosial.' },
      { nama_skill: 'Desain Grafis (Canva/Figma)', bukti: 'Membuat aset visual konten promosi mingguan.' },
      { nama_skill: 'Riset Kompetitor', bukti: 'Menganalisis strategi konten kompetitor utama.' },
      { nama_skill: 'Social Media Analytics', bukti: 'Membaca dan merangkum grafik keterlibatan audiens.' }
    ],
    softSkills: [
      { nama_skill: 'Kreativitas', bukti: 'Menghadirkan ide kampanye digital yang segar dan interaktif.' },
      { nama_skill: 'Kerjasama Tim', bukti: 'Menyelaraskan konsep desain dengan tim hubungan masyarakat.' },
      { nama_skill: 'Adaptabilitas', bukti: 'Menyesuaikan gaya penulisan dengan tren audiens yang cepat berubah.' }
    ],
    pembelajaran: [
      'Penyusunan pilar konten mingguan (content pillars) yang sistematis.',
      'Pemahaman demografi audiens target produk.'
    ],
    tantangan: 'Menyusun visualisasi yang menarik dalam batas waktu singkat bagi platform digital.',
    judulLaporan: 'Laporan Akhir Pemasaran Digital & Industri Kreatif',
    ringkasanEksekutif: 'Mahasiswa menunjukkan antusiasme yang tinggi dalam menyusun aset komunikasi pemasaran. Yang bersangkutan sangat kreatif dalam mengolah konten visual dan menyusun copy yang berhasil mendongkrak retensi keterlibatan audiens.',
    perjalanan: [
      { periode: 'Bulan ke-1', narasi: 'Orientasi produk, riset segmentasi audiens, serta pengerjaan riset keyword dasar bagi kebutuhan artikel dan takarir media sosial.' },
      { periode: 'Bulan ke-2', narasi: 'Mulai menyusun pilar konten bulanan, membuat desain grafis menggunakan Figma/Canva, serta mengelola postingan berjadwal.' },
      { periode: 'Bulan ke-3', narasi: 'Melakukan analisis matriks performa (engagement rate), menyusun evaluasi kampanye pemasaran digital, dan merapikan panduan gaya visual merek.' }
    ],
    rekomendasiKarir: 'Social Media Specialist / Digital Marketer / Graphic Designer',
    rekomendasiKarirAlasan: 'Menunjukkan naluri kreatif yang sangat baik dalam merancang komunikasi visual dan penulisan teks promosi digital.',
    rekomendasiKarirSaran: 'Perdalam pemahaman pemosisian merek (brand positioning) dan optimalisasi periklanan digital berbayar (Meta/Google Ads).',
    refleksi: 'Magang ini memberikan pengalaman nyata mengelola reputasi digital, meramu visual kreatif, serta memahami pergerakan tren pasar secara objektif.',
    perusahaan: {
      Surabaya: [
        { nama_perusahaan: 'Inagata Creative (Surabaya)', alamat: 'Jl. Raya Darmo, Surabaya', kontak: 'contact@inagata.com', alasan_kecocokan: 'Agensi kreatif yang fokus pada digital marketing dan kreasi konten terdepan.' },
        { nama_perusahaan: 'PT AJBS Digital', alamat: 'Ruko Klampis Jaya, Surabaya', kontak: 'recruitment@ajbs.co.id', alasan_kecocokan: 'Penanganan kampanye digital dan branding retail daerah.' }
      ],
      Jakarta: [
        { nama_perusahaan: 'Narrada Communications (Jakarta)', alamat: 'Sudirman Central Business District, Jakarta', kontak: 'careers@narrada.com', alasan_kecocokan: 'Agensi kreatif dan periklanan digital ternama berskala nasional.' },
        { nama_perusahaan: 'PT Kreatif Media Karya (KMK)', alamat: 'Jl. Asia Afrika, Senayan, Jakarta', kontak: 'recruitment@kmklabs.com', alasan_kecocokan: 'Manajemen media digital dan konten interaktif berskala besar.' }
      ],
      Bandung: [
        { nama_perusahaan: 'Sembilan Matahari (Bandung)', alamat: 'Jl. Muararajeun, Cibeunying, Bandung', kontak: 'info@sembilanmatahari.com', alasan_kecocokan: 'Studio kreatif visual art dan kampanye interaktif digital.' }
      ],
      default: [
        { nama_perusahaan: 'Agensi Pemasaran Lokal', alamat: 'Pusat Area Komersial Terdekat', kontak: 'info@agensikreatif.com', alasan_kecocokan: 'Pengembangan identitas visual produk-produk UMKM regional.' }
      ]
    }
  },

  [DOMAINS.ADMIN]: {
    kategori: 'Administrasi & SDM',
    hardSkills: [
      { nama_skill: 'Otomasi MS Office (Excel/Word)', bukti: 'Mengolah spreadsheet data internal dengan formula kompleks.' },
      { nama_skill: 'Pengarsipan Digital', bukti: 'Menata tata kelola berkas digital di Google Drive secara rapi.' },
      { nama_skill: 'Database Karyawan', bukti: 'Mengecek kelengkapan portofolio biodata karyawan baru.' },
      { nama_skill: 'Penyusunan SOP', bukti: 'Membantu pengetikan draf Standard Operating Procedure administrasi.' }
    ],
    softSkills: [
      { nama_skill: 'Ketelitian Tinggi', bukti: 'Memeriksa keakuratan data entri agar bebas dari kesalahan ketik.' },
      { nama_skill: 'Manajemen Waktu', bukti: 'Mengatur koordinasi jadwal rapat divisi secara terjadwal.' },
      { nama_skill: 'Integritas', bukti: 'Menjaga kerahasiaan data internal berkas karyawan dengan aman.' }
    ],
    pembelajaran: [
      'Alur penataan administrasi perkantoran modern yang rapi.',
      'Siklus seleksi administrasi awal calon kandidat karyawan.'
    ],
    tantangan: 'Mengolah volume data administratif yang sangat besar dengan tingkat presisi tinggi.',
    judulLaporan: 'Laporan Akhir Administrasi Perkantoran & Manajemen Sumber Daya Manusia',
    ringkasanEksekutif: 'Mahasiswa sangat cakap dalam memelihara keteraturan administratif organisasi. Yang bersangkutan memiliki kedisiplinan luar biasa, ketelitian tinggi dalam pengolahan berkas, serta etika kerja profesional yang andal.',
    perjalanan: [
      { periode: 'Bulan ke-1', narasi: 'Pengenalan struktur organisasi, tata kelola dokumen arsip fisik dan digital, serta penanganan surat-menyurat operasional.' },
      { periode: 'Bulan ke-2', narasi: 'Penyusunan rekapitulasi presensi, pemutakhiran database karyawan, serta membantu administrasi logistik rekrutmen.' },
      { periode: 'Bulan ke-3', narasi: 'Menyusun draf laporan bulanan divisi, membantu administrasi pelatihan internal, dan menguji alur otomasi dokumen.' }
    ],
    rekomendasiKarir: 'Administrative Officer / Junior HR Specialist / Secretary',
    rekomendasiKarirAlasan: 'Ketelitian yang mengagumkan dalam mengelola arsip digital, pengolahan spreadsheet data, serta komunikasi koordinatif yang tertata.',
    rekomendasiKarirSaran: 'Perdalam penguasaan pemrograman Google Apps Script untuk otomatisasi laporan dokumen perkantoran.',
    refleksi: 'Magang ini membentuk pemahaman mendalam tentang tata kelola operasional perusahaan dan pentingnya tertib administrasi sebagai pilar organisasi.',
    perusahaan: {
      Surabaya: [
        { nama_perusahaan: 'PT PAL Indonesia (Surabaya)', alamat: 'Jl. Ujung, Semampir, Surabaya', kontak: 'hr@pal.co.id', alasan_kecocokan: 'BUMN industri perkapalan dengan tata kelola manajemen SDM yang sangat terstruktur.' },
        { nama_perusahaan: 'Bank Jatim (Surabaya)', alamat: 'Jl. Basuki Rahmat, Surabaya', kontak: 'rekrutmen@bankjatim.co.id', alasan_kecocokan: 'Administrasi keuangan daerah yang presisi dengan standar operasional ketat.' }
      ],
      Jakarta: [
        { nama_perusahaan: 'PT Astra International (Jakarta)', alamat: 'Jl. Gaya Motor Raya, Sunter, Jakarta Utara', kontak: 'recruitment@astra.co.id', alasan_kecocokan: 'Manajemen korporasi multisektor terbesar dengan standar rekrutmen unggulan.' },
        { nama_perusahaan: 'Bank Mandiri (Jakarta)', alamat: 'Plaza Mandiri, Jenderal Gatot Subroto, Jakarta', kontak: 'hr.recruitment@bankmandiri.co.id', alasan_kecocokan: 'Pengelolaan operasional perkantoran skala nasional yang masif.' }
      ],
      default: [
        { nama_perusahaan: 'Kantor Pemerintahan / BUMN Setempat', alamat: 'Pusat Balai Kota atau Kantor Dinas Terdekat', kontak: 'info@pemda.go.id', alasan_kecocokan: 'Pelayanan administrasi publik terpadu satu pintu.' }
      ]
    }
  },

  [DOMAINS.FINANCE]: {
    kategori: 'Keuangan',
    hardSkills: [
      { nama_skill: 'Penyusunan Jurnal Keuangan', bukti: 'Membukukan transaksi debit-kredit operasional secara berkala.' },
      { nama_skill: 'Rekonsiliasi Bank', bukti: 'Menyamakan catatan kas internal dengan rekening koran bank.' },
      { nama_skill: 'Analisis Arus Kas', bukti: 'Menyusun rekapitulasi mingguan kas masuk dan keluar.' },
      { nama_skill: 'Software Akuntansi (Zahir/Excel)', bukti: 'Memasukkan transaksi keuangan ke dalam modul laporan akuntansi.' }
    ],
    softSkills: [
      { nama_skill: 'Akurasi Angka', bukti: 'Mengecek kesesuaian nilai transaksi terkecil hingga presisi.' },
      { nama_skill: 'Integritas & Kejujuran', bukti: 'Melaporkan selisih transaksi secara transparan dan objektif.' },
      { nama_skill: 'Berpikir Kritis', bukti: 'Mengidentifikasi pos anggaran yang berlebih (over-budget).' }
    ],
    pembelajaran: [
      'Alur siklus akuntansi penuh dari pencatatan hingga penyajian neraca.',
      'Konsep kepatuhan perpajakan dasar perusahaan.'
    ],
    tantangan: 'Menemukan selisih kecil dalam pencocokan ribuan transaksi rekening koran.',
    judulLaporan: 'Laporan Akhir Pembukuan Akuntansi & Evaluasi Kinerja Keuangan',
    ringkasanEksekutif: 'Mahasiswa sangat teliti dan memiliki pemahaman numerik yang tajam. Yang bersangkutan berkontribusi aktif dalam merapikan rekonsiliasi kas, menyusun jurnal penyesuaian secara bebas kesalahan, serta menjunjung tinggi integritas laporan keuangan.',
    perjalanan: [
      { periode: 'Bulan ke-1', narasi: 'Mempelajari standar akuntansi internal, verifikasi dokumen invoice tagihan, dan pencatatan kas kecil (petty cash).' },
      { periode: 'Bulan ke-2', narasi: 'Rekonsiliasi bank harian, penyusunan jurnal umum, serta pengecekan kepatuhan potongan pajak dasar.' },
      { periode: 'Bulan ke-3', narasi: 'Membantu penyusunan draf neraca keuangan bulanan, merangkum grafik anggaran vs realisasi proyek, dan audit kepatuhan kasir.' }
    ],
    rekomendasiKarir: 'Junior Accountant / Financial Analyst / Tax Assistant',
    rekomendasiKarirAlasan: 'Keandalan tinggi dalam penyusunan jurnal akuntansi presisi dan ketajaman mengidentifikasi selisih transaksi kas.',
    rekomendasiKarirSaran: 'Kembangkan keahlian akuntansi dengan mengambil brevet pajak A & B.',
    refleksi: 'Masa magang ini memberikan pemahaman konkret mengenai aliran kas korporat sesungguhnya, melatih ketahanan menghadapi data numerik, serta pentingnya integritas audit.',
    perusahaan: {
      Surabaya: [
        { nama_perusahaan: 'Bank Jatim Kantor Pusat (Surabaya)', alamat: 'Jl. Basuki Rahmat, Surabaya', kontak: 'finance@bankjatim.co.id', alasan_kecocokan: 'Pengelolaan pembukuan keuangan perbankan regional yang kompleks.' },
        { nama_perusahaan: 'KAP Ernst & Young Surabaya', alamat: 'Jl. Kombes Pol. Moh. Duryat, Surabaya', kontak: 'recruitment.ey@id.ey.com', alasan_kecocokan: 'Kantor Akuntan Publik global dengan variasi portofolio klien audit.' }
      ],
      Jakarta: [
        { nama_perusahaan: 'PwC Indonesia (Jakarta)', alamat: 'Plaza 89, Jl. HR Rasuna Said, Jakarta', kontak: 'careers.pwc@id.pwc.com', alasan_kecocokan: 'Agensi audit dan konsultasi keuangan Big Four terdepan di Indonesia.' },
        { nama_perusahaan: 'Bank Central Asia (BCA)', alamat: 'Menara BCA, Grand Indonesia, Jakarta', kontak: 'recruitment@bca.co.id', alasan_kecocokan: 'Manajemen perbankan swasta terbesar dengan tata kelola risiko terbaik.' }
      ],
      default: [
        { nama_perusahaan: 'Kantor Akuntan Publik (KAP) Setempat', alamat: 'Area Pusat Bisnis Kota Terdekat', kontak: 'info@kaplokal.com', alasan_kecocokan: 'Pembukuan laporan keuangan dan audit bisnis regional.' }
      ]
    }
  },

  [DOMAINS.HEALTH]: {
    kategori: 'Kesehatan & Medis',
    hardSkills: [
      { nama_skill: 'Asuhan Keperawatan (Askep)', bukti: 'Menyusun rencana tindakan keperawatan tertulis bagi pasien.' },
      { nama_skill: 'Vital Sign Checks', bukti: 'Mengukur tekanan darah, detak jantung, suhu, dan laju pernapasan pasien.' },
      { nama_skill: 'Triage Medis', bukti: 'Membantu memilah tingkat urgensi penanganan pasien di ruang IGD.' },
      { nama_skill: 'Pencatatan Rekam Medis', bukti: 'Mengisi berkas rekam medis digital pasien secara presisi.' }
    ],
    softSkills: [
      { nama_skill: 'Empati Tinggi (Compassion)', bukti: 'Menyapa dan mendengarkan keluhan pasien dengan ramah dan menenangkan.' },
      { nama_skill: 'Komunikasi Terapeutik', bukti: 'Menjelaskan prosedur pemberian obat kepada keluarga pasien secara santun.' },
      { nama_skill: 'Ketahanan Mental', bukti: 'Tetap tenang dan sigap melakukan tindakan klinis di bawah tekanan darurat.' }
    ],
    pembelajaran: [
      'Protokol keselamatan pasien (patient safety) dan kebersihan klinis.',
      'Siklus diagnosis keperawatan dan alur penanganan IGD.'
    ],
    tantangan: 'Mengelola penanganan multi-pasien dengan tingkat keparahan yang bervariasi secara bersamaan.',
    judulLaporan: 'Laporan Akhir Asuhan Medis & Kualitas Pelayanan Klinis Keperawatan',
    ringkasanEksekutif: 'Mahasiswa berdedikasi luar biasa dalam memberikan asuhan pasien yang aman dan humanis. Yang bersangkutan memiliki empati terapeutik tinggi, cekatan dalam pengecekan tanda vital, dan menaati SOP medis secara disiplin.',
    perjalanan: [
      { periode: 'Bulan ke-1', narasi: 'Orientasi sanitasi bangsal perawatan, latihan komunikasi terapeutik awal, dan asistensi vital sign check harian.' },
      { periode: 'Bulan ke-2', narasi: 'Masuk ke ruang perawatan intensif/bangsal utama, terlibat dalam penyusunan asuhan keperawatan, dan pemberian obat sesuai instruksi.' },
      { periode: 'Bulan ke-3', narasi: 'Rotasi dinas ke ruang IGD/Triage medis, menangani rekam medis digital secara presisi, serta membantu edukasi pemulangan pasien.' }
    ],
    rekomendasiKarir: 'Staf Perawat Klinis / Asisten Medis / Pengelola Layanan Kesehatan',
    rekomendasiKarirAlasan: 'Menunjukkan kemampuan klinis asuhan keperawatan yang matang, ketepatan rekam medis, dan disukai pasien karena empati tingginya.',
    rekomendasiKarirSaran: 'Ikuti pelatihan sertifikasi khusus Basic Trauma & Cardiac Life Support (BTCLS) lanjutan.',
    refleksi: 'Magang klinis ini membuka mata tentang nilai kemanusiaan sejati, mematangkan keterampilan penanganan darurat, dan membentuk kesiapan mengabdi di tim kesehatan.',
    perusahaan: {
      Surabaya: [
        { nama_perusahaan: 'RSUD Dr. Soetomo (Surabaya)', alamat: 'Jl. Mayjen Prof. Dr. Moestopo, Surabaya', kontak: 'info@rsuddrsoetomo.co.id', alasan_kecocokan: 'Rumah sakit rujukan nasional terbesar di Jawa Timur dengan kasus klinis variatif.' },
        { nama_perusahaan: 'RS Premier Surabaya', alamat: 'Jl. Nginden Intan Barat, Surabaya', kontak: 'recruitment@rs-premier.co.id', alasan_kecocokan: 'Layanan rawat medis standar akreditasi internasional.' }
      ],
      Jakarta: [
        { nama_perusahaan: 'Rumah Sakit Cipto Mangunkusumo (RSCM)', alamat: 'Jl. Pangeran Diponegoro, Jakarta Pusat', kontak: 'humas@rscm.co.id', alasan_kecocokan: 'Pusat rujukan medis nasional dan rumah sakit pendidikan terbaik.' },
        { nama_perusahaan: 'Siloam Hospitals Group', alamat: 'Kawasan Siloam Kebon Jeruk, Jakarta', kontak: 'careers@siloamhospitals.com', alasan_kecocokan: 'Jaringan rumah sakit swasta terbesar di Indonesia dengan tata kelola digital.' }
      ],
      default: [
        { nama_perusahaan: 'Rumah Sakit Umum Daerah (RSUD) Setempat', alamat: 'Pusat Layanan Kesehatan Wilayah', kontak: 'info@rsudlokal.go.id', alasan_kecocokan: 'Pengabdian pelayanan rawat jalan dan darurat medis daerah setempat.' }
      ]
    }
  },

  [DOMAINS.EDUCATION]: {
    kategori: 'Pendidikan',
    hardSkills: [
      { nama_skill: 'Penyusunan RPP / Rencana Ajar', bukti: 'Menyusun modul rencana pelaksanaan pembelajaran interaktif.' },
      { nama_skill: 'Media Ajar Digital (Canva/Quizizz)', bukti: 'Membuat kuis visual berbasis game untuk meningkatkan minat belajar.' },
      { nama_skill: 'Evaluasi Hasil Belajar', bukti: 'Melakukan rekapitulasi nilai ujian dan menyusun remedial siswa.' },
      { nama_skill: 'Manajemen Kelas', bukti: 'Mengelola konsentrasi 30 murid di kelas selama jam pelajaran.' }
    ],
    softSkills: [
      { nama_skill: 'Kesabaran Tinggi', bukti: 'Mengulangi penjelasan materi yang sulit dengan senyuman dan analogi sederhana.' },
      { nama_skill: 'Kemampuan Asertif', bukti: 'Menertibkan kegaduhan murid di kelas secara persuasif tanpa membentak.' },
      { nama_skill: 'Empati Terhadap Siswa', bukti: 'Mendampingi secara khusus murid yang tertinggal dalam pemahaman matematika dasar.' }
    ],
    pembelajaran: [
      'Penerapan diferensiasi metode ajar berdasarkan karakteristik siswa.',
      'Siklus evaluasi sumatif dan formatif kurikulum pengajaran.'
    ],
    tantangan: 'Menjaga fokus belajar anak didik agar tetap aktif dan antusias selama kelas berlangsung.',
    judulLaporan: 'Laporan Akhir Manajemen Pembelajaran Kelas & Kurikulum Edukatif',
    ringkasanEksekutif: 'Mahasiswa adalah pendidik yang berkarakter hangat, sabar, dan inovatif. Yang bersangkutan piawai dalam merancang modul ajar yang interaktif, cekatan mengelola kedisiplinan kelas, dan sangat mengutamakan kenyamanan belajar siswa.',
    perjalanan: [
      { periode: 'Bulan ke-1', narasi: 'Asistensi guru pamong, mengamati psikologi belajar murid, serta mempelajari rancangan kurikulum sekolah.' },
      { periode: 'Bulan ke-2', narasi: 'Praktik mengajar mandiri di kelas, menyusun lembar kerja interaktif, dan melakukan penilaian tugas mingguan.' },
      { periode: 'Bulan ke-3', narasi: 'Menyusun bank soal ujian semester, memimpin proyek belajar kreatif berkelompok, serta mengisi raport evaluasi siswa.' }
    ],
    rekomendasiKarir: 'Educator / Guru Kelas / Kurator Materi Pembelajaran / EdTech Content Writer',
    rekomendasiKarirAlasan: 'Memiliki kemampuan mengajar yang inovatif dan interaktif dengan pemanfaatan media digital, serta disukai siswa karena sifat asertifnya.',
    rekomendasiKarirSaran: 'Perdalam pemahaman implementasi kurikulum merdeka berbasis projek (Project-Based Learning).',
    refleksi: 'Magang kependidikan ini menyadarkan saya bahwa mengajar bukan sekadar mentransfer ilmu, melainkan menumbuhkan karakter dan memicu rasa ingin tahu murid.',
    perusahaan: {
      Surabaya: [
        { nama_perusahaan: 'Sekolah Menengah Unggulan (Surabaya)', alamat: 'Kawasan Pendidikan Pusat Kota, Surabaya', kontak: 'info@smanegeri.sch.id', alasan_kecocokan: 'Lembaga pendidikan formal berprestasi dengan fasilitas ajar lengkap.' },
        { nama_perusahaan: 'Ruangguru Surabaya', alamat: 'Ruko Klampis, Surabaya', kontak: 'careers@ruangguru.com', alasan_kecocokan: 'Penyedia bimbingan belajar non-formal berbasis teknologi pendidikan.' }
      ],
      Jakarta: [
        { nama_perusahaan: 'BPK Penabur Jakarta', alamat: 'BPK Education Center, Jakarta', kontak: 'recruitment@penabur.or.id', alasan_kecocokan: 'Jaringan sekolah swasta terkemuka dengan kurikulum disiplin tinggi.' },
        { nama_perusahaan: 'Ruangguru Pusat (Jakarta)', alamat: 'Kuningan, Jakarta Selatan', kontak: 'recruitment@ruangguru.com', alasan_kecocokan: 'Perusahaan teknologi pendidikan (EdTech) terbesar di Asia Tenggara.' }
      ],
      default: [
        { nama_perusahaan: 'Sekolah / Lembaga Pendidikan Setempat', alamat: 'Dinas Pendidikan Area Terdekat', kontak: 'info@sekolahsetempat.sch.id', alasan_kecocokan: 'Pengabdian mendidik generasi bangsa di daerah asal.' }
      ]
    }
  },

  [DOMAINS.GENERAL]: {
    kategori: 'Umum',
    hardSkills: [
      { nama_skill: 'Penyusunan Laporan Progres', bukti: 'Menulis berkas pelaporan berkala pengerjaan proyek divisi.' },
      { nama_skill: 'Riset Informasi', bukti: 'Melakukan pencarian data tepercaya untuk kebutuhan internal.' },
      { nama_skill: 'Data Entry & Reporting', bukti: 'Memasukkan data operasional harian ke sistem digital.' },
      { nama_skill: 'Koordinasi Operasional', bukti: 'Menghubungkan divisi internal dalam penjadwalan aktivitas.' }
    ],
    softSkills: [
      { nama_skill: 'Profesionalisme', bukti: 'Menyelesaikan tugas yang didelegasikan tepat waktu dengan hasil rapi.' },
      { nama_skill: 'Kemandirian Kerja', bukti: 'Memulai riset pemecahan kendala kerja sebelum berdiskusi dengan mentor.' },
      { nama_skill: 'Komunikasi Efektif', bukti: 'Menyampaikan progres pengerjaan tugas harian secara lugas di forum rapat.' }
    ],
    pembelajaran: [
      'Adaptasi budaya dan etika kerja profesional di lingkungan perkantoran.',
      'Metode manajemen proyek dasar untuk menjaga kualitas hasil kerja.'
    ],
    tantangan: 'Menyeimbangkan fokus penyelesaian tugas rutin dengan permintaan koordinasi dinamis.',
    judulLaporan: 'Laporan Akhir Praktik Kerja Lapangan & Evaluasi Kinerja Umum',
    ringkasanEksekutif: 'Mahasiswa beradaptasi dengan sangat cepat di lingkungan kerja. Yang bersangkutan memiliki profesionalisme tinggi, mandiri dalam mengeksekusi instruksi kerja, serta komunikatif dalam koordinasi tim.',
    perjalanan: [
      { periode: 'Bulan ke-1', narasi: 'Orientasi profil instansi, pemahaman alur kerja utama, serta penanganan berkas penunjang operasional.' },
      { periode: 'Bulan ke-2', narasi: 'Eksekusi tugas-tugas inti operasional harian secara mandiri dan terlibat dalam forum diskusi berkala divisi.' },
      { periode: 'Bulan ke-3', narasi: 'Penyusunan laporan rekap operasional triwulan, koordinasi tugas penutupan, dan evaluasi capaian kerja.' }
    ],
    rekomendasiKarir: 'Project Coordinator / Junior Operations Specialist / Management Trainee',
    rekomendasiKarirAlasan: 'Adaptabilitas kerja yang luar biasa di berbagai penugasan operasional serta disiplin penyusunan laporan progres kerja.',
    rekomendasiKarirSaran: 'Perdalam satu bidang spesifik (T-shaped skills) untuk menaikkan nilai kompetensi industri khusus Anda.',
    refleksi: 'Program magang ini memberikan fondasi kerja profesional yang sangat kokoh, membangun disiplin kerja harian, serta melatih kecakapan kolaboratif lintas sektor.',
    perusahaan: {
      Surabaya: [
        { nama_perusahaan: 'PT Petrokimia Gresik (Surabaya Raya)', alamat: 'Kawasan Industri Gresik, Surabaya Raya', kontak: 'rekrutmen@petrokimia-gresik.com', alasan_kecocokan: 'BUMN industri besar dengan wilayah operasional luas bagi pengembangan karir umum.' },
        { nama_perusahaan: 'Bank Jatim', alamat: 'Jl. Basuki Rahmat, Surabaya', kontak: 'contact@bankjatim.co.id', alasan_kecocokan: 'Pengalaman administratif dan operasional standar jasa perbankan.' }
      ],
      Jakarta: [
        { nama_perusahaan: 'PT Telkom Indonesia (Jakarta)', alamat: 'Kawasan Gatot Subroto, Jakarta Selatan', kontak: 'careers@telkom.co.id', alasan_kecocokan: 'BUMN telekomunikasi terbesar dengan ragam divisi operasional.' },
        { nama_perusahaan: 'PT Astra International (Jakarta)', alamat: 'Sunter, Jakarta Utara', kontak: 'recruitment@astra.co.id', alasan_kecocokan: 'Konglomerasi besar multi-industri dengan jenjang karir manajerial terintegrasi.' }
      ],
      default: [
        { nama_perusahaan: 'Instansi Swasta / BUMN / BUMD Terdekat', alamat: 'Kawasan Bisnis Pusat Kota Terdekat', kontak: 'info@instansilokal.com', alasan_kecocokan: 'Pengalaman operasional dan manajerial terintegrasi.' }
      ]
    }
  }
}

/**
 * Mengambil konfigurasi data mockup berdasarkan domain
 */
export function getDomainConfig(domain) {
  return DOMAIN_CONFIGS[domain] || DOMAIN_CONFIGS[DOMAINS.GENERAL]
}

/**
 * Menghasilkan feedback harian tiruan (mock) berdasar nama magang & tulisan catatan
 */
export function getDomainMockFeedback(namaMagang, logsText = '') {
  const domain = detectDomain(namaMagang)
  const config = getDomainConfig(domain)
  
  const text = logsText.trim()
  const score = text ? Math.min(5, Math.max(2, Math.ceil(text.length / 80))) : 3
  
  const ringkasan = text
    ? `Berhasil merampungkan pekerjaan terkait: "${text.slice(0, 85)}..."`
    : `Melakukan pengerjaan tugas harian, eksplorasi modul kerja, dan dokumentasi aktivitas magang.`

  // Ambil 2 hard & 2 soft skills secara dinamis
  const hard = config.hardSkills.slice(0, 2)
  const soft = config.softSkills.slice(0, 2)
  
  return {
    tanggal_analisis: new Date().toISOString().split('T')[0],
    kategori_aktivitas: config.kategori,
    ringkasan_aktivitas: ringkasan,
    soft_skills: soft,
    hard_skills: hard,
    pembelajaran_utama: config.pembelajaran,
    tantangan: logsText.toLowerCase().includes('kendala') || logsText.toLowerCase().includes('error') || logsText.toLowerCase().includes('susah')
      ? config.tantangan
      : 'Tidak ada kendala berarti hari ini.',
    skor_produktivitas: score
  }
}

/**
 * Menghasilkan evaluasi mingguan tiruan (mock) berdasar nama magang & nomor minggu
 */
export function getDomainMockWeekly(namaMagang, weekNumber, collectedLogs = []) {
  const domain = detectDomain(namaMagang)
  const config = getDomainConfig(domain)
  
  const startDay = (Number(weekNumber) - 1) * 7 + 1
  const endDay = Number(weekNumber) * 7
  
  const avgScore = collectedLogs.length > 0
    ? Number((collectedLogs.reduce((acc, l) => acc + (l.ai_feedback?.skor_produktivitas || 0), 0) / collectedLogs.length).toFixed(1))
    : 4.0

  return {
    week_number: Number(weekNumber),
    magang_id: collectedLogs[0]?.magang_id || 1,
    total_days_in_week: 7,
    analyzed_days: collectedLogs.length || 5,
    summary: {
      periode: `Minggu ke-${weekNumber} (Hari ${startDay}-${endDay})`,
      ringkasan_minggu: `Selama minggu ke-${weekNumber}, mahasiswa menunjukkan performa yang sangat progresif di bidang ${config.kategori}. Kemampuan implementasi teknis harian dan koordinasi fungsional di lingkungan magang berjalan dengan baik.`,
      highlight_aktivitas: collectedLogs.length > 0
        ? collectedLogs.map((l) => l.ai_feedback?.ringkasan_aktivitas).filter(Boolean).slice(0, 3)
        : [`Berhasil merampungkan penugasan berkala di bidang ${config.kategori} secara presisi.`, 'Mengikuti koordinasi progres harian bersama mentor lapangan.'],
      soft_skills_dominan: config.softSkills.slice(0, 2).map(s => ({
        nama_skill: s.nama_skill,
        frekuensi: Math.max(1, collectedLogs.length || 3),
        tren: 'Meningkat'
      })),
      hard_skills_dominan: config.hardSkills.slice(0, 2).map(s => ({
        nama_skill: s.nama_skill,
        frekuensi: Math.max(1, collectedLogs.length || 3),
        tren: 'Meningkat'
      })),
      perkembangan_utama: `Menunjukkan peningkatan kompetensi yang stabil dalam pengerjaan ${config.kategori} secara mandiri dan disiplin.`,
      area_perbaikan: `Harap terus pertahankan ritme kerja dan luangkan waktu untuk memvalidasi ulang setiap hasil tugas sebelum diserahkan.`,
      skor_produktivitas_rata_rata: avgScore
    }
  }
}

/**
 * Menghasilkan evaluasi laporan akhir tiruan (mock) berdasar nama magang & kota
 */
export function getDomainMockFinalReport(namaMagang, magangInfo = {}, collectedLogs = [], city = 'Surabaya') {
  const domain = detectDomain(namaMagang || magangInfo.nama)
  const config = getDomainConfig(domain)
  
  // Format list hard & soft skills
  const total_soft_skills = config.softSkills.map(s => ({
    nama_skill: s.nama_skill,
    level_akhir: 'Mahir',
    deskripsi_perkembangan: s.bukti
  }))

  const total_hard_skills = config.hardSkills.map(s => ({
    nama_skill: s.nama_skill,
    level_akhir: 'Mahir',
    deskripsi_perkembangan: s.bukti
  }))

  // Ambil list perusahaan berdasarkan kota
  const listPerusahaan = config.perusahaan[city] || config.perusahaan['default']

  // Kompilasi pencapaian & tantangan
  const pencapaian = collectedLogs.length > 0
    ? collectedLogs.filter(l => l.ai_feedback?.skor_produktivitas >= 4).map(l => l.ai_feedback?.ringkasan_aktivitas).slice(0, 3)
    : [
        `Berhasil menyempurnakan seluruh draf tugas di bidang ${config.kategori} secara konsisten.`,
        'Mendapatkan umpan balik positif dari mentor magang lapangan atas disiplin kerja.'
      ]
      
  const tantangan = collectedLogs.length > 0
    ? collectedLogs.map(l => l.ai_feedback?.tantangan).filter(t => t && t !== 'Tidak ada kendala berarti' && t !== 'Tidak disebutkan').slice(0, 3)
    : [
        `Menyelaraskan alur kerja instansi dengan target waktu penyelesaian tugas di minggu-minggu awal.`,
        'Memahami instruksi tugas bernilai kompleksitas tinggi dalam waktu singkat.'
      ]

  if (pencapaian.length === 0) {
    pencapaian.push(`Berhasil merampungkan seluruh riwayat catatan harian magang di bidang ${config.kategori} dengan progress konsisten.`)
  }
  if (tantangan.length === 0) {
    tantangan.push('Tidak ada kendala fatal yang menghambat pengerjaan tugas.')
  }

  const avgScore = collectedLogs.length > 0
    ? Number((collectedLogs.reduce((acc, l) => acc + (l.ai_feedback?.skor_produktivitas || 0), 0) / collectedLogs.length).toFixed(1))
    : 4.5

  return {
    magang_id: Number(magangInfo.id || 1),
    magang_info: {
      nama: magangInfo.user_name || 'Mahasiswa Magang',
      tempat_magang: magangInfo.tempat_magang || 'Instansi Terkait',
      tanggal_mulai: magangInfo.tanggal_mulai || '2026-03-01',
      tanggal_selesai: magangInfo.tanggal_selesai || '2026-05-31',
      total_hari: magangInfo.timeline || 60
    },
    total_analyzed_days: collectedLogs.length || 15,
    report: {
      judul_laporan: `${config.judulLaporan} - ${magangInfo.nama}`,
      ringkasan_eksekutif: `${magangInfo.user_name || 'Mahasiswa'} menunjukkan dedikasi yang tinggi selama masa magang di ${magangInfo.tempat_magang || 'instansi terkait'}. ${config.ringkasanEksekutif}`,
      perjalanan_magang: config.perjalanan,
      total_soft_skills,
      total_hard_skills,
      pencapaian_terbaik: pencapaian,
      tantangan_terbesar: tantangan,
      refleksi_keseluruhan: config.refleksi,
      rekomendasi_karir: `Sangat direkomendasikan untuk langsung diproyeksikan sebagai ${config.rekomendasiKarir}. ${config.rekomendasiKarirAlasan} Saran pengembangan: ${config.rekomendasiKarirSaran}`,
      rekomendasi_perusahaan: listPerusahaan
    }
  }
}
