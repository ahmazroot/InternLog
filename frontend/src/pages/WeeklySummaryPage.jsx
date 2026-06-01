import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { timelineService } from '../services/timelineService'
import { magangService } from '../services/magangService'
import logoUrl from '../assets/images/logo.png'
import { TrendingUp, TrendingDown, Minus, ArrowLeft, BrainCircuit } from 'lucide-react'
import { geminiService } from '../services/geminiService'

export function WeeklySummaryPage({ user, onLogout }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [magang, setMagang] = useState(null)
  const [weekNumber, setWeekNumber] = useState(1)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const isDemo = localStorage.getItem('demo_mode') === 'true'

  // Fetch info magang
  useEffect(() => {
    const fetchMagang = async () => {
      try {
        if (isDemo) {
          const stored = localStorage.getItem('mock_magang_items')
          const items = stored ? JSON.parse(stored) : []
          const found = items.find((i) => String(i.id) === String(id))
          if (found) setMagang(found)
        } else {
          const data = await magangService.getById(id)
          setMagang(data?.data ?? data)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchMagang()
  }, [id, isDemo])

  // Handler Generate Weekly Summary
  const handleGenerate = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      if (isDemo) {
        const startDay = (Number(weekNumber) - 1) * 7 + 1
        const endDay = Number(weekNumber) * 7
        const collectedLogs = []

        // Kumpulkan catatan dari localStorage untuk minggu terpilih
        for (let d = startDay; d <= endDay; d++) {
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

        // Tampilkan error jika tidak ada data sama sekali di minggu ini
        if (collectedLogs.length === 0) {
          throw {
            response: {
              status: 422,
              data: {
                error: `Tidak ada data catatan harian yang diisi untuk minggu ke-${weekNumber} di local storage. Silakan tulis dan simpan minimal satu catatan harian di minggu ini terlebih dahulu.`
              }
            }
          }
        }

        await new Promise((r) => setTimeout(r, 1500))

        const hasGemini = geminiService.isConfigured()
        let weeklyResult = null

        if (hasGemini) {
          try {
            const geminiRaw = await geminiService.analyzeWeeklySummary(collectedLogs, weekNumber)
            
            // Hitung frekuensi kemunculan skill dari logs
            const softFreq = {}
            const hardFreq = {}
            collectedLogs.forEach((l) => {
              l.ai_feedback?.soft_skills?.forEach((s) => {
                softFreq[s.nama_skill] = (softFreq[s.nama_skill] || 0) + 1
              })
              l.ai_feedback?.hard_skills?.forEach((s) => {
                hardFreq[s.nama_skill] = (hardFreq[s.nama_skill] || 0) + 1
              })
            })

            const mapTrend = (t) => {
              const trendLower = String(t).toLowerCase()
              if (trendLower === 'trendingup') return 'Meningkat'
              if (trendLower === 'trendingdown') return 'Menurun'
              return 'Stabil'
            }

            weeklyResult = {
              week_number: Number(weekNumber),
              magang_id: Number(id),
              total_days_in_week: 7,
              analyzed_days: collectedLogs.length,
              summary: {
                periode: `Minggu ke-${weekNumber} (Hari ${startDay}-${endDay})`,
                ringkasan_minggu: geminiRaw.evaluasi_ai || 'Evaluasi kinerja selesai dikompilasi.',
                highlight_aktivitas: collectedLogs.map((l) => l.ai_feedback?.ringkasan_aktivitas).filter(Boolean).slice(0, 4),
                soft_skills_dominan: (geminiRaw.soft_skills || []).map((s) => ({
                  nama_skill: s.nama_skill,
                  frekuensi: softFreq[s.nama_skill] || 1,
                  tren: mapTrend(s.trend)
                })),
                hard_skills_dominan: (geminiRaw.hard_skills || []).map((s) => ({
                  nama_skill: s.nama_skill,
                  frekuensi: hardFreq[s.nama_skill] || 1,
                  tren: mapTrend(s.trend)
                })),
                perkembangan_utama: Array.isArray(geminiRaw.perkembangan) ? geminiRaw.perkembangan.join(' ') : (geminiRaw.perkembangan || 'Perkembangan sangat progresif.'),
                area_perbaikan: Array.isArray(geminiRaw.area_perbaikan) ? geminiRaw.area_perbaikan.join(' ') : (geminiRaw.area_perbaikan || 'Pertahankan performa pengerjaan tugas.'),
                skor_produktivitas_rata_rata: Number(geminiRaw.average_productivity || (collectedLogs.reduce((acc, l) => acc + (l.ai_feedback?.skor_produktivitas || 0), 0) / collectedLogs.length).toFixed(1))
              }
            }
          } catch (geminiErr) {
            console.error('Gemini weekly analysis failed, falling back to mock data:', geminiErr)
          }
        }

        // Fallback mock data jika tidak pakai Gemini / Gemini error
        if (!weeklyResult) {
          weeklyResult = {
            week_number: Number(weekNumber),
            magang_id: Number(id),
            total_days_in_week: 7,
            analyzed_days: collectedLogs.length,
            summary: {
              periode: `Minggu ke-${weekNumber} (Hari ${startDay}-${endDay})`,
              ringkasan_minggu: `Selama minggu ke-${weekNumber}, mahasiswa menunjukkan performa yang sangat progresif. Kemampuan implementasi teknis harian dan koordinasi fungsional di lingkungan magang berjalan dengan baik.`,
              highlight_aktivitas: collectedLogs.map((l) => l.ai_feedback?.ringkasan_aktivitas).filter(Boolean).slice(0, 3),
              soft_skills_dominan: [
                { nama_skill: "Kemandirian", frekuensi: Math.max(1, collectedLogs.length - 1), tren: "Meningkat" },
                { nama_skill: "Ketelitian", frekuensi: Math.max(1, Math.floor(collectedLogs.length / 2)), tren: "Stabil" }
              ],
              hard_skills_dominan: [
                { nama_skill: "React.js", frekuensi: Math.max(1, collectedLogs.length - 1), tren: "Meningkat" },
                { nama_skill: "CSS Styling", frekuensi: Math.max(1, Math.floor(collectedLogs.length / 2)), tren: "Stabil" }
              ],
              perkembangan_utama: "Mampu mengimplementasikan logika frontend dengan BlockNote editor dan menyusun struktur layout responsif.",
              area_perbaikan: "Perlu mengoptimalkan efisiensi state update pada rendering component agar performa semakin optimal.",
              skor_produktivitas_rata_rata: Number((collectedLogs.reduce((acc, l) => acc + (l.ai_feedback?.skor_produktivitas || 0), 0) / collectedLogs.length).toFixed(1))
            }
          }
        }

        setResult(weeklyResult)
      } else {
        const data = await timelineService.generateWeeklySummary(id, weekNumber)
        setResult(data?.data ?? data)
      }
    } catch (err) {
      console.error(err)
      if (err?.response?.status === 422) {
        setError(err.response.data.error)
      } else {
        setError(err?.response?.data?.message || err.message || 'Gagal membuat ringkasan mingguan.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Render Trend Icon
  const renderTrendIcon = (trend) => {
    const tr = trend?.toLowerCase()
    if (tr === 'meningkat' || tr === 'baru muncul') {
      return <TrendingUp className="trend-icon green" />
    }
    if (tr === 'menurun') {
      return <TrendingDown className="trend-icon red" />
    }
    return <Minus className="trend-icon gray" />
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
            className="detail-sidebar-link-item active"
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
            className="detail-sidebar-link-item"
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
            <h1 className="detail-title">Ringkasan Mingguan AI</h1>
            <p className="detail-subtitle">{magang?.nama || 'InternLog'}</p>
          </div>
        </header>

        {/* Content */}
        <main className="detail-content py-6 max-w-4xl">
          
          {/* Controls Form Card */}
          <div className="weekly-ctrl-card">
            <div className="ctrl-card-glow" />
            
            <form onSubmit={handleGenerate} className="weekly-ctrl-form">
              <div className="form-left">
                <BrainCircuit className="form-ai-icon" />
                <div>
                  <h3 className="form-title">Kecerdasan Buatan Mingguan</h3>
                  <p className="form-sub">Masukkan nomor minggu untuk merangkum seluruh catatan harian teranalisis.</p>
                </div>
              </div>
              
              <div className="form-right">
                <div className="input-group">
                  <label htmlFor="week-number-input">Minggu Ke-</label>
                  <input
                    id="week-number-input"
                    type="number"
                    min="1"
                    max="52"
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(e.target.value)}
                    required
                    disabled={loading}
                    className="week-input"
                  />
                </div>
                <button
                  id="generate-weekly-btn"
                  type="submit"
                  disabled={loading}
                  className={`generate-btn ${loading ? 'loading' : ''}`}
                >
                  {loading ? 'Menganalisis...' : 'Buat Ringkasan'}
                </button>
              </div>
            </form>
          </div>

          {/* Error Banner Merah Visual (Status 422) */}
          {error && (
            <div className="weekly-error-banner animate-fade-in" id="error-banner">
              <span className="error-icon">⚠️</span>
              <div className="error-body">
                <h4 className="error-title">Gagal Membuat Evaluasi</h4>
                <p className="error-desc">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="weekly-loading-state">
              <div className="spinner-ring" />
              <p>Sedang mengompilasi catatan mingguan dan mengekstrak tren kompetensi...</p>
            </div>
          )}

          {/* Result Section */}
          {result && !loading && (
            <div className="weekly-results animate-fade-in">
              
              {/* Header Info */}
              <div className="weekly-result-card">
                <div className="card-header-meta">
                  <span className="periode-tag">{result.summary.periode}</span>
                  <div className="productivity-rating-wrap">
                    <span className="rating-label">Skor Produktivitas</span>
                    <span className="rating-val">{result.summary.skor_produktivitas_rata_rata} / 5.0</span>
                  </div>
                </div>
                
                {/* Productivity Progress Bar */}
                <div className="weekly-progress-wrap">
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${(result.summary.skor_produktivitas_rata_rata / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="ai-narration-wrap">
                  <h3 className="narration-title">Ringkasan AI Mingguan</h3>
                  <p className="narration-text">{result.summary.ringkasan_minggu}</p>
                </div>
              </div>

              {/* Skills Grid */}
              <div className="weekly-skills-grid">
                
                {/* Soft Skills Dominan */}
                <div className="skills-column-card">
                  <h4 className="column-title soft">Soft Skills Dominan</h4>
                  <div className="column-body">
                    {result.summary.soft_skills_dominan?.map((s, idx) => (
                      <div key={idx} className="skill-row-card">
                        <div className="skill-info-left">
                          <span className="skill-bullet soft" />
                          <span className="skill-name">{s.nama_skill}</span>
                        </div>
                        <div className="skill-info-right">
                          <span className="freq-badge">{s.frekuensi}× terdeteksi</span>
                          <div className="trend-wrap">
                            {renderTrendIcon(s.tren)}
                            <span className="trend-label">{s.tren}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hard Skills Dominan */}
                <div className="skills-column-card">
                  <h4 className="column-title hard">Hard Skills Dominan</h4>
                  <div className="column-body">
                    {result.summary.hard_skills_dominan?.map((s, idx) => (
                      <div key={idx} className="skill-row-card">
                        <div className="skill-info-left">
                          <span className="skill-bullet hard" />
                          <span className="skill-name">{s.nama_skill}</span>
                        </div>
                        <div className="skill-info-right">
                          <span className="freq-badge">{s.frekuensi}× terdeteksi</span>
                          <div className="trend-wrap">
                            {renderTrendIcon(s.tren)}
                            <span className="trend-label">{s.tren}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Highlight Aktivitas */}
              <div className="weekly-highlights-card">
                <h4 className="section-card-title">✨ Highlight Aktivitas Utama</h4>
                <ul className="highlight-list">
                  {result.summary.highlight_aktivitas?.map((act, idx) => (
                    <li key={idx}>
                      <span className="bullet">✦</span>
                      <span className="text">{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Perkembangan & Rekomendasi */}
              <div className="weekly-development-grid">
                <div className="dev-card success">
                  <h4 className="dev-title text-emerald-800">🚀 Perkembangan Utama</h4>
                  <p className="dev-text">{result.summary.perkembangan_utama}</p>
                </div>
                <div className="dev-card warning">
                  <h4 className="dev-title text-amber-800">💡 Area Perbaikan</h4>
                  <p className="dev-text">{result.summary.area_perbaikan}</p>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  )
}
