import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { timelineService } from '../services/timelineService'
import { magangService } from '../services/magangService'
import logoUrl from '../assets/images/logo.png'
import { ArrowLeft, Award, Calendar, CheckCircle2, AlertOctagon, GraduationCap } from 'lucide-react'
import { geminiService } from '../services/geminiService'

export function FinalReportPage({ user, onLogout }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [magang, setMagang] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isDemo = localStorage.getItem('demo_mode') === 'true'

  // Fetch info magang dan generate laporan
  useEffect(() => {
    const fetchAndGenerate = async () => {
      setLoading(true)
      setError(null)
      try {
        // 1. Fetch metadata magang
        let currentMagang = null
        if (isDemo) {
          const stored = localStorage.getItem('mock_magang_items')
          const items = stored ? JSON.parse(stored) : []
          currentMagang = items.find((i) => String(i.id) === String(id))
          if (currentMagang) setMagang(currentMagang)
        } else {
          const data = await magangService.getById(id)
          currentMagang = data?.data ?? data
          setMagang(currentMagang)
        }

        // 2. Generate Final Report
        if (isDemo) {
          const collectedLogs = []
          const totalTimelineDays = currentMagang?.timeline || 90

          // Kumpulkan semua catatan dari localStorage
          for (let d = 1; d <= totalTimelineDays; d++) {
            const itemKey = `magang_${id}_day_${d}`
            const data = localStorage.getItem(itemKey)
            if (data) {
              const parsed = JSON.parse(data)
              if (parsed && parsed.ai_feedback) {
                let catatanPlain = ''
                if (parsed.description) {
                  try {
                    const blocks = JSON.parse(parsed.description)
                    if (Array.isArray(blocks)) {
                      catatanPlain = blocks
                        .map((b) => {
                          if (b.content && Array.isArray(b.content)) {
                            return b.content.map((c) => c.text || '').join('')
                          }
                          return ''
                        })
                        .filter(Boolean)
                        .join('\n')
                    }
                  } catch (_) {
                    catatanPlain = parsed.description
                  }
                }
                collectedLogs.push({
                  hari: d,
                  catatan_plain: catatanPlain,
                  ai_feedback: parsed.ai_feedback
                })
              }
            }
          }

          // Tampilkan error jika belum ada catatan harian teranalisis sama sekali
          if (collectedLogs.length === 0) {
            throw {
              response: {
                status: 422,
                data: {
                  error: "Belum ada catatan harian yang diisi dan dianalisis di local storage. Silakan isi minimal satu catatan harian di detail magang terlebih dahulu sebelum membuat Laporan Akhir."
                }
              }
            }
          }

          // Jika di demo mode kita sengaja mensimulasikan error via feature flag
          if (localStorage.getItem('simulate_final_error') === 'true') {
            throw {
              response: {
                status: 422,
                data: {
                  error: "Belum ada catatan harian yang berhasil dianalisis AI. Simpan catatan harian terlebih dahulu dan tunggu proses analisis selesai."
                }
              }
            }
          }

          await new Promise((r) => setTimeout(r, 1800))

          const hasGemini = geminiService.isConfigured()
          let finalReportResult = null

          if (hasGemini) {
            try {
              const geminiRaw = await geminiService.analyzeFinalReport(collectedLogs)
              
              const isSoftSkill = (name) => {
                const softs = ['komunikasi', 'mandiri', 'kemandirian', 'kepemimpinan', 'pemecahan masalah', 'kolaborasi', 'adaptasi', 'ketelitian', 'kerja keras', 'disiplin', 'proaktif', 'manajemen waktu']
                return softs.includes(name.toLowerCase())
              }

              const softSkills = []
              const hardSkills = []

              ;(geminiRaw.competencies || []).forEach((c) => {
                const skillObj = {
                  nama_skill: c.nama_skill,
                  level_akhir: c.level || 'Kompeten',
                  deskripsi_perkembangan: c.bukti || 'Menunjukkan perkembangan kompetensi yang sangat solid selama periode magang.'
                }
                if (isSoftSkill(c.nama_skill)) {
                  softSkills.push(skillObj)
                } else {
                  hardSkills.push(skillObj)
                }
              })

              // Proteksi jika salah satu tipe kosong
              if (softSkills.length === 0) {
                softSkills.push({
                  nama_skill: "Kemandirian",
                  level_akhir: "Mahir",
                  deskripsi_perkembangan: "Menyelesaikan seluruh modul sistem secara mandiri dengan hasil yang sangat memuaskan."
                })
              }
              if (hardSkills.length === 0) {
                hardSkills.push({
                  nama_skill: "React.js",
                  level_akhir: "Mahir",
                  deskripsi_perkembangan: "Mampu menyusun arsitektur komponen visual yang modular dan responsif."
                })
              }

              // Kumpulkan pencapaian & tantangan dari logs harian
              const pencapaian = collectedLogs
                .filter((l) => l.ai_feedback?.skor_produktivitas >= 4)
                .map((l) => l.ai_feedback?.ringkasan_aktivitas)
                .slice(0, 3)
              
              const tantangan = collectedLogs
                .map((l) => l.ai_feedback?.tantangan)
                .filter((t) => t && t !== 'Tidak ada kendala berarti' && t !== 'Tidak disebutkan')
                .slice(0, 3)

              if (pencapaian.length === 0) {
                pencapaian.push("Berhasil menyelesaikan seluruh riwayat catatan harian magang dengan progress konsisten.")
              }
              if (tantangan.length === 0) {
                tantangan.push("Tidak ada kendala berarti yang menghambat pengerjaan tugas.")
              }

              finalReportResult = {
                magang_id: Number(id),
                magang_info: {
                  nama: user?.name || "Budi Santoso",
                  tempat_magang: currentMagang?.tempat_magang || "PT. Teknologi Bangsa",
                  tanggal_mulai: currentMagang?.tanggal_mulai || "2026-03-01",
                  tanggal_selesai: currentMagang?.tanggal_selesai || "2026-05-31",
                  total_hari: currentMagang?.timeline || 60
                },
                total_analyzed_days: collectedLogs.length,
                report: {
                  judul_laporan: `Laporan Akhir Magang ${user?.name || "Budi Santoso"} di ${currentMagang?.tempat_magang || "PT. Teknologi Bangsa"}`,
                  ringkasan_eksekutif: geminiRaw.kesimpulan_evaluasi || `${user?.name || "Budi Santoso"} menunjukkan dedikasi yang tinggi selama masa magang. Yang bersangkutan sangat aktif mengimplementasikan fitur dengan performa solid.`,
                  perjalanan_magang: (geminiRaw.monthly_progress || []).map((p) => ({
                    periode: p.bulan,
                    narasi: p.ringkasan
                  })),
                  total_soft_skills: softSkills,
                  total_hard_skills: hardSkills,
                  pencapaian_terbaik: pencapaian,
                  tantangan_terbesar: tantangan,
                  refleksi_keseluruhan: "Pengalaman magang ini memberikan wawasan industri nyata yang sangat luar biasa, mematangkan pemahaman arsitektur rekayasa perangkat lunak, serta melatih kolaborasi kerja profesional.",
                  rekomendasi_karir: `${geminiRaw.rekomendasi_karir?.karir_cocok || 'Frontend Developer'}. ${geminiRaw.rekomendasi_karir?.alasan || ''} Saran pengembangan: ${geminiRaw.rekomendasi_karir?.saran_pengembangan || ''}`
                }
              }
            } catch (geminiErr) {
              console.error('Gemini final report analysis failed, falling back to mock:', geminiErr)
            }
          }

          // Fallback mock data jika tidak pakai Gemini / Gemini error
          if (!finalReportResult) {
            finalReportResult = {
              magang_id: Number(id),
              magang_info: {
                nama: user?.name || "Budi Santoso",
                tempat_magang: currentMagang?.tempat_magang || "PT. Teknologi Bangsa",
                tanggal_mulai: currentMagang?.tanggal_mulai || "2026-03-01",
                tanggal_selesai: currentMagang?.tanggal_selesai || "2026-05-31",
                total_hari: currentMagang?.timeline || 60
              },
              total_analyzed_days: collectedLogs.length,
              report: {
                judul_laporan: `Laporan Akhir Magang ${user?.name || "Budi Santoso"} di ${currentMagang?.tempat_magang || "PT. Teknologi Bangsa"}`,
                ringkasan_eksekutif: `${user?.name || "Budi Santoso"} menunjukkan dedikasi yang tinggi selama masa magang di ${currentMagang?.tempat_magang || "PT. Teknologi Bangsa"}. Yang bersangkutan berkontribusi aktif dalam merancang komponen antarmuka yang efisien, terstruktur, dan responsif.`,
                perjalanan_magang: [
                  {
                    periode: "Bulan ke-1",
                    narasi: "Fokus pada pengenalan codebase sistem, setup local development environment, serta pengerjaan slicing UI dasar menggunakan React.js dan Vanilla CSS."
                  },
                  {
                    periode: "Bulan ke-2",
                    narasi: "Mulai masuk ke integrasi sistem RESTful API, implementasi modul grafik interaktif, dan optimasi performa render komponen utama."
                  },
                  {
                    periode: "Bulan ke-3",
                    narasi: "Pengerjaan modul Timeline & AI, implementasi BlockNote editor WYSIWYG, dan pemolesan kualitas antarmuka visual (premium micro-animations)."
                  }
                ],
                total_soft_skills: [
                  {
                    nama_skill: "Komunikasi",
                    level_akhir: "Kompeten",
                    deskripsi_perkembangan: "Sangat aktif mengoordinasikan integrasi API serta menyelaraskan schema data dengan tim backend."
                  },
                  {
                    nama_skill: "Kemandirian",
                    level_akhir: "Mahir",
                    deskripsi_perkembangan: "Mampu melakukan setup arsitektur editor BlockNote serta error handling asinkron secara mandiri tanpa supervisi ketat."
                  }
                ],
                total_hard_skills: [
                  {
                    nama_skill: "React.js",
                    level_akhir: "Mahir",
                    deskripsi_perkembangan: "Membangun lebih dari 15 komponen fungsional modular yang reusable dan berkinerja tinggi."
                  },
                  {
                    nama_skill: "Vanilla CSS",
                    level_akhir: "Kompeten",
                    deskripsi_perkembangan: "Menerapkan standard utility classes dan struktur layout responsif dengan detail visual yang memukau."
                  }
                ],
                pencapaian_terbaik: [
                  "Merancang modul grafik analitik visual yang mempercepat monitoring progress internal tim hingga 40%",
                  "Mengurangi redundansi render UI sebesar 25% melalui optimalisasi memoization React"
                ],
                tantangan_terbesar: [
                  "Menyeimbangkan kecepatan slicing UI dengan kaidah penulisan clean code di minggu kedua",
                  "Mempelajari spesifikasi internal pustaka BlockNote dalam waktu singkat"
                ],
                refleksi_keseluruhan: "Masa magang ini memberikan perspektif industri nyata yang sangat berharga, mengasah keterampilan teknis coding, serta meningkatkan kesiapan karir sebagai pengembang perangkat lunak profesional.",
                rekomendasi_karir: "Sangat direkomendasikan untuk langsung diproyeksikan sebagai Junior Frontend Developer."
              }
            }
          }

          setResult(finalReportResult)
        } else {
          const data = await timelineService.generateFinalReport(id)
          setResult(data?.data ?? data)
        }
      } catch (err) {
        console.error(err)
        if (err?.response?.status === 422) {
          setError(err.response.data.error)
        } else {
          setError(err?.response?.data?.message || err.message || 'Gagal menghasilkan laporan akhir magang.')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchAndGenerate()
  }, [id, isDemo, user])

  // Helper warna badge level kompetensi
  const getLevelBadgeColor = (level) => {
    const lvl = level?.toLowerCase()
    switch (lvl) {
      case 'pemula':
        return 'level-badge pemula'
      case 'berkembang':
        return 'level-badge berkembang'
      case 'kompeten':
        return 'level-badge kompeten'
      case 'mahir':
        return 'level-badge mahir'
      default:
        return 'level-badge'
    }
  }

  return (
    <div className="detail-page">
      {/* ─── Sidebar ─── */}
      <aside className="detail-sidebar">
        <div className="detail-sidebar-logo" style={{ height: '96px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 15px' }}>
          <img src={logoUrl} alt="Logo" className="h-64 w-auto object-contain" />
          <span className="detail-sidebar-badge" style={{ position: 'absolute', right: '12px', top: '12px' }}>Beta</span>
        </div>

        <nav className="detail-sidebar-nav">
          <p className="detail-sidebar-nav-label">Menu</p>
          <button
            id="nav-magang"
            onClick={() => navigate('/magang')}
            className="detail-sidebar-nav-item"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
            Magang
          </button>
        </nav>

        {/* Quick links */}
        <div className="detail-sidebar-links">
          <p className="detail-sidebar-nav-label" style={{ marginBottom: 8 }}>Laporan</p>
          <button
            id="nav-weekly-summary"
            onClick={() => navigate(`/magang/${id}/weekly-summary`)}
            className="detail-sidebar-link-item"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Ringkasan Mingguan
          </button>
          <button
            id="nav-final-report"
            onClick={() => navigate(`/magang/${id}/final-report`)}
            className="detail-sidebar-link-item active"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Laporan Akhir
          </button>
        </div>

        {/* User */}
        <div className="detail-sidebar-user">
          {user?.profile_picture ? (
            <img src={user.profile_picture} alt="Avatar" className="h-8 w-8 rounded-xl object-cover ring-2 ring-white shadow-sm" />
          ) : (
            <div className="detail-sidebar-avatar">
              {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
          )}
          <div className="detail-sidebar-userinfo">
            <p className="detail-sidebar-username">{user?.name ?? 'User'}</p>
            <p className="detail-sidebar-email">{user?.email ?? ''}</p>
          </div>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="detail-main">
        {/* Header */}
        <header className="detail-header">
          <button
            id="back-to-magang-btn"
            onClick={() => navigate(`/magang/${id}`)}
            className="detail-back-link"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Detail Magang
          </button>

          <div className="detail-header-info">
            <h1 className="detail-title">Laporan Akhir Magang AI</h1>
            <p className="detail-subtitle">{magang?.nama || 'Evaluasi Kompetensi Akhir'}</p>
          </div>
        </header>

        {/* Content */}
        <main className="detail-content py-6 max-w-4xl">

          {/* 422 Error Banner Merah */}
          {error && (
            <div className="weekly-error-banner animate-fade-in" id="error-banner">
              <AlertOctagon className="error-icon text-red-600" />
              <div className="error-body">
                <h4 className="error-title">Evaluasi Akhir Belum Siap</h4>
                <p className="error-desc">{error}</p>
                <button
                  id="error-back-btn"
                  onClick={() => navigate(`/magang/${id}`)}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  Kembali untuk Mencatat
                </button>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="weekly-loading-state">
              <div className="spinner-ring" />
              <p>Menganalisis seluruh riwayat aktivitas, menghitung tingkat kompetensi skill, dan mengompilasi laporan akhir magang Anda...</p>
            </div>
          )}

          {/* Report Results */}
          {result && !loading && (
            <div className="weekly-results animate-fade-in">

              {/* Title & Exec Summary Card */}
              <div className="weekly-result-card">
                <div className="card-header-meta" style={{ marginBottom: 12 }}>
                  <span className="periode-tag">EVALUASI AKHIR KUMULATIF</span>
                  <div className="flex items-center text-indigo-700 text-sm font-medium gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{result.total_analyzed_days} hari teranalisis</span>
                  </div>
                </div>

                <h1 className="final-report-title">{result.report.judul_laporan}</h1>
                <p className="final-exec-summary">{result.report.ringkasan_eksekutif}</p>
              </div>

              {/* Perjalanan Magang (Monthly Timeline) */}
              <div className="weekly-highlights-card">
                <h4 className="section-card-title flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  Perjalanan Magang
                </h4>
                
                <div className="monthly-timeline">
                  {result.report.perjalanan_magang?.map((m, idx) => (
                    <div key={idx} className="monthly-timeline-item">
                      <div className="monthly-timeline-badge">
                        <span className="badge-dot" />
                        <span className="badge-label">{m.periode}</span>
                      </div>
                      <div className="monthly-timeline-content">
                        <p>{m.narasi}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Kompetensi Badges */}
              <div className="weekly-skills-grid">
                
                {/* Hard Skills */}
                <div className="skills-column-card">
                  <h4 className="column-title hard flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Tingkat Hard Skills Akhir
                  </h4>
                  <div className="column-body">
                    {result.report.total_hard_skills?.map((s, idx) => (
                      <div key={idx} className="final-skill-row">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-800">{s.nama_skill}</span>
                          <span className={getLevelBadgeColor(s.level_akhir)}>
                            {s.level_akhir}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{s.deskripsi_perkembangan}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Soft Skills */}
                <div className="skills-column-card">
                  <h4 className="column-title soft flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Tingkat Soft Skills Akhir
                  </h4>
                  <div className="column-body">
                    {result.report.total_soft_skills?.map((s, idx) => (
                      <div key={idx} className="final-skill-row">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-800">{s.nama_skill}</span>
                          <span className={getLevelBadgeColor(s.level_akhir)}>
                            {s.level_akhir}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{s.deskripsi_perkembangan}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Pencapaian & Tantangan */}
              <div className="weekly-development-grid">
                
                {/* Pencapaian Terbaik */}
                <div className="weekly-highlights-card" style={{ margin: 0 }}>
                  <h4 className="section-card-title flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    Pencapaian Terbaik
                  </h4>
                  <ul className="highlight-list">
                    {result.report.pencapaian_terbaik?.map((item, idx) => (
                      <li key={idx}>
                        <span className="bullet text-emerald-600">✓</span>
                        <span className="text text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tantangan Terbesar */}
                <div className="weekly-highlights-card" style={{ margin: 0 }}>
                  <h4 className="section-card-title flex items-center gap-2 text-amber-800">
                    <AlertOctagon className="h-5 w-5 text-amber-600" />
                    Tantangan Terbesar
                  </h4>
                  <ul className="highlight-list">
                    {result.report.tantangan_terbesar?.map((item, idx) => (
                      <li key={idx}>
                        <span className="bullet text-amber-600">💡</span>
                        <span className="text text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Refleksi Keseluruhan */}
              <div className="weekly-highlights-card">
                <h4 className="section-card-title">📖 Refleksi Keseluruhan</h4>
                <p className="text-gray-700 leading-relaxed italic">
                  “{result.report.refleksi_keseluruhan}”
                </p>
              </div>

              {/* Rekomendasi Karir (Card Bergradasi Amber Premium) */}
              <div className="final-recommendation-card">
                <div className="recommendation-glow" />
                <div className="recommendation-content">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="recommendation-icon-wrap">
                      <GraduationCap className="h-6 w-6 text-amber-700 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="recommendation-title">Proyeksi Rekomendasi Karir AI</h4>
                      <p className="recommendation-subtitle">Berdasarkan data performa riwayat magang</p>
                    </div>
                  </div>
                  <div className="recommendation-body-box">
                    <p className="recommendation-text">{result.report.rekomendasi_karir}</p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  )
}
