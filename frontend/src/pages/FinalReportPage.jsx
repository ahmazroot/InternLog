import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { timelineService } from '../services/timelineService'
import { magangService } from '../services/magangService'
import logoUrl from '../assets/images/logo.png'
import { ArrowLeft, Award, Calendar, CheckCircle2, AlertOctagon, GraduationCap, MapPin, Globe, Building2, Lock } from 'lucide-react'
import { geminiService } from '../services/geminiService'
import { getDomainMockFinalReport } from '../services/domainHelper'

export function FinalReportPage({ user, onLogout }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [magang, setMagang] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isLocked, setIsLocked] = useState(false)
  const [lockProgress, setLockProgress] = useState({ actual: 0, total: 0, percentage: 0 })
  const [bypassActive, setBypassActive] = useState(false)

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

          // Periksa progress pengerjaan log untuk Laporan Akhir
          const actualLogsCount = collectedLogs.length
          const pct = Math.min(100, Math.round((actualLogsCount / totalTimelineDays) * 100))

          if (actualLogsCount < totalTimelineDays && !bypassActive) {
            setIsLocked(true)
            setLockProgress({ actual: actualLogsCount, total: totalTimelineDays, percentage: pct })
            setLoading(false)
            return
          } else {
            setIsLocked(false)
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

          const locationParts = currentMagang?.tempat_magang ? currentMagang.tempat_magang.split(', ') : []
          const city = locationParts[0] || 'Jakarta'

          let finalReportResult = null
          const hasGemini = geminiService.isConfigured()

          if (hasGemini) {
            try {
              const geminiRaw = await geminiService.analyzeFinalReport(collectedLogs, currentMagang?.tempat_magang || 'Indonesia')

              const isSoftSkill = (name) => {
                const softs = ['komunikasi', 'mandiri', 'kemandirian', 'kepemimpinan', 'pemecahan masalah', 'kolaborasi', 'adaptasi', 'ketelitian', 'kerja keras', 'disiplin', 'proaktif', 'manajemen waktu']
                return softs.includes(name.toLowerCase())
              }

              const softSkills = []
              const hardSkills = []

                ; (geminiRaw.competencies || []).forEach((c) => {
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
                  rekomendasi_karir: `${geminiRaw.rekomendasi_karir?.karir_cocok || 'Frontend Developer'}. ${geminiRaw.rekomendasi_karir?.alasan || ''} Saran pengembangan: ${geminiRaw.rekomendasi_karir?.saran_pengembangan || ''}`,
                  rekomendasi_perusahaan: geminiRaw.rekomendasi_karir?.rekomendasi_perusahaan || [
                    {
                      nama_perusahaan: `DOT Indonesia (${city})`,
                      alamat: `Area Teknologi Informasi, ${city}`,
                      kontak: `careers.dot.co.id`,
                      alasan_kecocokan: `Sangat cocok untuk memperdalam pengerjaan sistem React modular yang Anda kuasai.`
                    }
                  ]
                }
              }
            } catch (geminiErr) {
              console.error('Gemini final report analysis failed, falling back to mock:', geminiErr)
            }
          }

          if (!finalReportResult) {
            finalReportResult = getDomainMockFinalReport(
              currentMagang?.nama || '',
              {
                id: id,
                nama: currentMagang?.nama || '',
                user_name: user?.name || "Budi Santoso",
                tempat_magang: currentMagang?.tempat_magang || "PT. Teknologi Bangsa",
                tanggal_mulai: currentMagang?.tanggal_mulai || "2026-03-01",
                tanggal_selesai: currentMagang?.tanggal_selesai || "2026-05-31",
                timeline: currentMagang?.timeline || 60
              },
              collectedLogs,
              city
            )
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
  }, [id, isDemo, user, bypassActive])

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

          {/* Lock Screen UI (Jika Magang Belum Selesai) */}
          {isLocked && !loading && !error && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl max-w-2xl mx-auto relative overflow-hidden animate-fade-in hover-premium">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-indigo-600" />
              <div className="lock-screen-glow" />

              <div className="flex flex-col items-center text-center py-6 relative z-10">
                {/* Glowing Lock Icon */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl scale-125 animate-pulse" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/50 shadow-inner text-amber-600 glow-ring-indigo">
                    <Lock className="h-7 w-7" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">
                  Laporan Akhir Belum Dapat Dibuat
                </h3>

                <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
                  Evaluasi kompetensi akhir dihitung secara kumulatif setelah masa magang berakhir. Hal ini dilakukan guna menjaga presisi analisis kecerdasan buatan terhadap seluruh riwayat aktivitas Anda.
                </p>

                {/* Progress Box */}
                <div className="w-full max-w-md bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    <span>Progress Magang</span>
                    <span className="text-slate-700">{lockProgress.actual} dari {lockProgress.total} Hari Tercatat</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-2 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${lockProgress.percentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Kemajuan: {lockProgress.percentage}%</span>
                    <span>Tersisa {lockProgress.total - lockProgress.actual} hari lagi</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-md">
                  <button
                    onClick={() => navigate(`/magang/${id}`)}
                    className="w-full sm:flex-1 py-3 px-5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:-translate-y-0.5 transition duration-300 cursor-pointer text-center"
                  >
                    Kembali Mencatat Log Harian
                  </button>

                  <button
                    onClick={() => setBypassActive(true)}
                    className="w-full sm:flex-1 py-3 px-5 text-sm font-semibold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200/50 rounded-xl transition cursor-pointer text-center"
                  >
                    Bypass & Lihat Preview
                  </button>
                </div>

                <span className="text-[10px] text-slate-400 mt-4 italic block">
                  *Gunakan tombol Bypass di atas khusus untuk kebutuhan demonstrasi/pengujian.
                </span>
              </div>
            </div>
          )}

          {/* Report Results */}
          {result && !loading && !isLocked && (
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
                        <span className="bullet text-amber-600">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 text-amber-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        </span>
                        <span className="text text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Refleksi Keseluruhan */}
              <div className="weekly-highlights-card">
                <h4 className="section-card-title flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-slate-500"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  Refleksi Keseluruhan
                </h4>
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

              {/* Peluang Karir & Industri Lokal (Google Maps & Website) */}
              {result.report.rekomendasi_perusahaan?.length > 0 && (
                <div className="weekly-highlights-card" style={{ marginTop: 24, padding: 24 }}>
                  <h4 className="section-card-title flex items-center gap-2 text-indigo-950 font-extrabold">
                    <Building2 className="h-5 w-5 text-indigo-600 animate-pulse" />
                    Peluang Karir Lokal ({result.magang_info?.tempat_magang?.split(', ')?.[0] || 'Wilayah Anda'})
                  </h4>
                  <p className="text-xs text-gray-500 mb-4">
                    Kecerdasan Buatan merekomendasikan beberapa nama perusahaan teknologi nyata di wilayah terdekat Anda yang sangat relevan untuk Anda melamar pekerjaan:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.report.rekomendasi_perusahaan.map((comp, idx) => {
                      const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(comp.nama_perusahaan + ' ' + comp.alamat)}`;

                      return (
                        <div key={idx} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/45 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all duration-300 shadow-sm relative overflow-hidden flex flex-col justify-between">
                          <div className="absolute right-0 top-0 h-16 w-16 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none" />

                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h5 className="font-bold text-sm text-slate-800 leading-tight">{comp.nama_perusahaan}</h5>
                              <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/60 rounded-full px-2 py-0.5 whitespace-nowrap">Relevan AI</span>
                            </div>

                            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                              {comp.alasan_kecocokan}
                            </p>

                            {/* Alamat */}
                            <div className="flex items-start gap-1.5 text-xs text-gray-500 mb-2">
                              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{comp.alamat}</span>
                            </div>

                            {/* Kontak */}
                            <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold mb-4">
                              <Globe className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                              <a href={`https://${comp.kontak}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {comp.kontak}
                              </a>
                            </div>
                          </div>

                          {/* Tombol Aksi */}
                          <div className="border-t border-slate-100/60 pt-3 flex items-center gap-2 mt-auto">
                            <a
                              href={mapsSearchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg transition cursor-pointer"
                            >
                              <MapPin className="h-3 w-3" />
                              Buka Peta Lokasi
                            </a>
                            <a
                              href={`https://${comp.kontak}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg transition ml-auto cursor-pointer"
                            >
                              <Globe className="h-3 w-3" />
                              Kunjungi Web
                            </a>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

        </main>
      </div>
    </div>
  )
}
