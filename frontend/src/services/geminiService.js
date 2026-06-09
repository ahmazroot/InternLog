const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

/**
 * Service to interact directly with the Google Gemini API from the React frontend.
 * Provides real-time log analysis, weekly summaries, and final report evaluations.
 */
export const geminiService = {
  /**
   * Check if Gemini API is configured
   */
  isConfigured: () => {
    return API_KEY.trim().length > 0 && !API_KEY.startsWith('your_')
  },

  /**
   * General helper to invoke Gemini API with structured JSON output
   */
  generateStructuredJSON: async (prompt) => {
    if (!geminiService.isConfigured()) {
      return null
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json'
            }
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Gemini API Error Response:', errorData)
        throw new Error(errorData?.error?.message || `HTTP error! Status: ${response.status}`)
      }

      const responseData = await response.json()
      const textResponse = responseData?.candidates?.[0]?.content?.parts?.[0]?.text
      
      if (!textResponse) {
        throw new Error('Format respon Gemini tidak valid.')
      }

      return JSON.parse(textResponse)
    } catch (err) {
      console.error('Failed to communicate with Gemini:', err)
      throw err
    }
  },

  /**
   * Analyze daily log text to extract structured details and skills
   */
  analyzeDailyLog: async (logText) => {
    const prompt = `
Anda adalah Mentor Magang AI (AI Internship Mentor) yang profesional. 
Tugas Anda adalah menganalisis catatan aktivitas harian mahasiswa magang berikut dan mengekstrak informasi serta evaluasi harian secara objektif.

Berikut adalah catatan aktivitas mahasiswa hari ini:
"""
${logText}
"""

Kembalikan hasil analisis Anda dalam format JSON yang valid dengan skema berikut:
{
  "tanggal_analisis": "ISO Date string hari ini (misal YYYY-MM-DD)",
  "kategori_aktivitas": "Satu kata kategori aktivitas utama (contoh: Teknis, Pemasaran, Keuangan, Medis, Pendidikan, Administrasi, Desain, Riset, dll.)",
  "ringkasan_aktivitas": "1-2 kalimat ringkasan profesional mengenai apa yang diselesaikan hari ini berdasarkan catatan di atas.",
  "soft_skills": [
    { "nama_skill": "Nama soft skill yang ditunjukkan (contoh: Kemandirian, Empati Terapeutik, Ketelitian, Kerja Keras, Kesabaran, Pemecahan Masalah)", "bukti": "Kalimat bukti nyata bagaimana mahasiswa menunjukkan skill tersebut berdasarkan catatannya" }
  ],
  "hard_skills": [
    { "nama_skill": "Nama hard skill / teknologi / metodologi yang dipakai (contoh: React.js, Asuhan Keperawatan, Riset Pasar, Akuntansi Dasar, RPP Ajar, Copywriting, Excel Formula)", "bukti": "Kalimat bukti nyata implementasi hard skill tersebut berdasarkan catatannya" }
  ],
  "pembelajaran_utama": [
    "Satu poin pelajaran berharga atau temuan baru yang mahasiswa dapatkan hari ini (maksimalkan 2 poin)"
  ],
  "tantangan": "Kendala, kesulitan, atau tantangan utama yang dihadapi mahasiswa hari ini (jika tidak ada kendala sebutkan 'Tidak ada kendala berarti')",
  "skor_produktivitas": 1-5 (Integer antara 1 sampai 5 yang mencerminkan tingkat produktivitas dan bobot pengerjaan tugas hari ini)
}

Ketentuan Khusus:
1. Respon HARUS berupa JSON murni yang valid tanpa tambahan markdown atau teks pembuka/penutup lainnya.
2. Gunakan bahasa Indonesia yang santun, profesional, dan membangun.
3. Ekstrak skill secara jujur berdasarkan bukti catatan. Jangan mengada-ada skill yang sama sekali tidak dibahas di catatan.
`
    return geminiService.generateStructuredJSON(prompt)
  },

  /**
   * Aggregate and evaluate logs of a full week
   */
  analyzeWeeklySummary: async (logsArray, weekNumber) => {
    const logsText = logsArray
      .map(
        (log, idx) => `[Hari ke-${log.hari} / Tanggal: ${log.ai_feedback?.tanggal_analisis || '-'}]
Catatan: ${log.catatan_plain || 'Tidak ada catatan'}
Skor AI: ${log.ai_feedback?.skor_produktivitas || 0}/5
Kategori: ${log.ai_feedback?.kategori_aktivitas || '-'}
Soft Skills: ${log.ai_feedback?.soft_skills?.map(s => s.nama_skill).join(', ') || '-'}
Hard Skills: ${log.ai_feedback?.hard_skills?.map(s => s.nama_skill).join(', ') || '-'}`
      )
      .join('\n\n---\n\n')

    const prompt = `
Anda adalah Mentor Magang AI (AI Internship Mentor) yang profesional.
Tugas Anda adalah merangkum seluruh aktivitas harian mahasiswa magang selama Minggu ke-${weekNumber} dan memberikan evaluasi mingguan yang mendalam.

Berikut adalah daftar catatan aktivitas harian mahasiswa di minggu ini:
"""
${logsText}
"""

Kembalikan hasil evaluasi mingguan Anda dalam format JSON yang valid dengan skema berikut:
{
  "week_number": ${weekNumber},
  "average_productivity": Rata-rata skor produktivitas minggu ini (Desimal antara 1.0 sampai 5.0),
  "evaluasi_ai": "Narasi evaluasi profesional sepanjang 2-3 kalimat yang mengulas kinerja keseluruhan mahasiswa minggu ini, menyoroti konsistensi, pencapaian, dan sikap kerjanya.",
  "soft_skills": [
    { "nama_skill": "Nama soft skill dominan", "bukti": "Bagaimana soft skill ini mendominasi dan terbukti dari aktivitasnya minggu ini", "trend": "Pilih salah satu dari: 'TrendingUp' (jika skill ini berkembang pesat dibanding hari sebelumnya), 'Minus' (jika stabil/biasa saja), atau 'TrendingDown' (jika performanya menurun di skill ini)" }
  ],
  "hard_skills": [
    { "nama_skill": "Nama hard skill / teknologi dominan", "bukti": "Bukti implementasi atau penguasaan teknologi ini minggu ini", "trend": "Pilih salah satu dari: 'TrendingUp', 'Minus', atau 'TrendingDown'" }
  ],
  "perkembangan": [
    "Poin utama perkembangan kompetensi atau perilaku kerja yang positif minggu ini (1-2 poin)"
  ],
  "area_perbaikan": [
    "Saran perbaikan, rekomendasi belajar, atau area yang perlu ditingkatkan untuk minggu depan (1-2 poin)"
  ]
}

Ketentuan Khusus:
1. Respon HARUS berupa JSON murni yang valid tanpa tambahan markdown atau teks pembuka/penutup lainnya.
2. Gunakan bahasa Indonesia yang profesional, memotivasi, dan konstruktif.
3. Maksimal 3 soft skill dan 3 hard skill teratas.
`
    return geminiService.generateStructuredJSON(prompt)
  },

  /**
   * Aggregate all logs for the final report evaluation
   */
  analyzeFinalReport: async (logsArray, userLocation = 'Indonesia') => {
    const totalDays = logsArray.length
    const logsText = logsArray
      .map(
        (log) => `[Hari ke-${log.hari}] 
Catatan: ${log.catatan_plain || 'Tidak ada'}
Skor AI: ${log.ai_feedback?.skor_produktivitas || 0}
Kategori: ${log.ai_feedback?.kategori_aktivitas || '-'}
Skills: ${[...(log.ai_feedback?.hard_skills || []), ...(log.ai_feedback?.soft_skills || [])].map(s => s.nama_skill).join(', ')}`
      )
      .join('\n\n')

    const prompt = `
Anda adalah Mentor Magang AI (AI Internship Mentor) Senior yang berpengalaman luas di berbagai bidang industri (Bisnis, Teknologi, Administrasi, Keuangan, Desain/Kreatif, Kesehatan, Pendidikan, Hukum, dll.).
Tugas Anda adalah mengevaluasi seluruh portofolio aktivitas mahasiswa selama periode magang (${totalDays} hari aktif) untuk menyusun Laporan Akhir Magang (Final Report).

Lokasi / Domisili Mahasiswa saat ini: "${userLocation}"

Berikut adalah rangkuman seluruh catatan aktivitas magang mahasiswa:
"""
${logsText}
"""

Kembalikan hasil analisis evaluasi akhir dalam format JSON yang valid dengan skema berikut:
{
  "total_days": ${totalDays},
  "average_productivity": Rata-rata skor produktivitas selama magang (Desimal antara 1.0 sampai 5.0),
  "kesimpulan_evaluasi": "Narasi kesimpulan evaluasi akhir setebal 3-4 kalimat. Ulas pencapaian terbesar mahasiswa, kemajuannya dari awal hingga akhir magang, dan testimoni kualitatif atas kinerjanya.",
  "monthly_progress": [
    { "bulan": "Bulan 1", "ringkasan": "Ringkasan perkembangan dan capaian utama di bulan pertama (misal: adaptasi alur kerja, penguasaan materi dasar)" },
    { "bulan": "Bulan 2", "ringkasan": "Ringkasan perkembangan dan capaian utama di bulan kedua (misal: pengerjaan tugas inti secara mandiri, pemecahan masalah)" }
  ],
  "competencies": [
    { "nama_skill": "Nama keahlian utama (gabungan soft & hard skill terkuat)", "bukti": "Ringkasan bukti kumulatif penguasaan keahlian ini selama magang", "level": "Pilih salah satu tingkat penguasaan: 'Pemula', 'Berkembang', 'Kompeten', atau 'Mahir'" }
  ],
  "rekomendasi_karir": {
    "karir_cocok": "Nama posisi karir / profesi industri yang sangat cocok bagi mahasiswa (contoh: Frontend Developer, Admin HRD, Social Media Specialist, Akuntan, Desainer Grafis, Staff Operasional, dll. sesuai bidang magangnya)",
    "alasan": "Alasan detail mengapa karir tersebut sangat cocok bagi mahasiswa berdasarkan bukti keahlian yang dia tunjukkan selama magang.",
    "saran_pengembangan": "Saran pengembangan karir / keahlian taktis masa depan agar mahasiswa lebih bersaing di industri (contoh: memperdalam teknik riset pemasaran, atau mempelajari tools otomasi administrasi).",
    "rekomendasi_perusahaan": [
      {
        "nama_perusahaan": "Nama perusahaan / kantor / startup / agensi / BUMN / instansi / rumah sakit / sekolah nyata yang berlokasi di daerah ${userLocation} (atau sekitarnya) yang sangat relevan dengan bidang keahlian mahasiswa (contoh: Siloam Hospitals untuk Kesehatan, Ruangguru/Sekolah untuk Pendidikan, PwC untuk Akuntansi, Gojek untuk IT, Astra untuk Administrasi/Marketing)",
        "alamat": "Alamat jalan nyata atau perkiraan lokasi kantor instansi tersebut di kota tersebut",
        "kontak": "Situs web resmi atau email rekrutmen perkiraan instansi tersebut (contoh: careers.tokopedia.com atau recruitment@bankmandiri.co.id atau humas@rscm.co.id)",
        "alasan_kecocokan": "1 kalimat penjelasan mengapa keahlian mahasiswa sangat cocok dengan kebutuhan perusahaan/instansi ini"
      }
    ]
  }
}

Ketentuan Khusus:
1. Respon HARUS berupa JSON murni yang valid tanpa tambahan markdown atau teks pembuka/penutup lainnya.
2. Gunakan bahasa Indonesia yang profesional, memuji pencapaian positif, namun tetap memberikan arahan karir yang realistis dan berharga.
3. Berikan maksimal 3 rekomendasi perusahaan / instansi riil di daerah "${userLocation}" (jika di daerah kecil, sebutkan BUMN, sekolah, rumah sakit, instansi pemerintahan daerah setempat, atau opsi kerja remote).
4. Batasi kompetensi terkuat maksimal 4-5 keahlian utama.
`
    return geminiService.generateStructuredJSON(prompt)
  }
}
