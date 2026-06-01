import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DaySelector } from '../components/magang/DaySelector'
import { TaskEditor } from '../components/magang/TaskEditor'
import { AIFeedbackCard } from '../components/magang/AIFeedbackCard'
import { magangService } from '../services/magangService'
import { timelineService } from '../services/timelineService'
import logoUrl from '../assets/images/logo.png'

// ─── Overview Timeline ─────────────────────────────────────────────────────

function OverviewTimeline({ magang, timelines, filledDays, onSelectDay }) {
  const totalDays = Number(magang.timeline) || 0
  const progress = totalDays > 0 ? Math.round((filledDays.length / totalDays) * 100) : 0

  // Bagi hari ke dalam grup mingguan (untuk grid grafis di atas)
  const weeks = useMemo(() => {
    const w = []
    for (let i = 0; i < totalDays; i += 7) {
      const weekDays = Array.from({ length: Math.min(7, totalDays - i) }, (_, j) => i + j + 1)
      w.push(weekDays)
    }
    return w
  }, [totalDays])

  // Hitung tanggal dari offset
  const getDateLabel = (day) => {
    if (!magang.tanggal_mulai) return `H${day}`
    const d = new Date(magang.tanggal_mulai)
    d.setDate(d.getDate() + day - 1)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }

  const getFullDateLabel = (day) => {
    if (!magang.tanggal_mulai) return `Hari ke-${day}`
    const d = new Date(magang.tanggal_mulai)
    d.setDate(d.getDate() + day - 1)
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  // Parse BlockNote description to plain text preview
  const getDescriptionPreview = (desc) => {
    if (!desc) return 'Catatan kosong'
    try {
      const parsed = JSON.parse(desc)
      if (Array.isArray(parsed)) {
        const texts = parsed
          .map(b => b?.content?.map?.(c => c?.text ?? '').join('') ?? '')
          .filter(t => t.trim().length > 0)
        return texts.length > 0 ? texts.join(' ') : 'Catatan kosong'
      }
    } catch (_) {}
    return desc
  }

  // Render rating bintang produktivitas
  const renderStars = (score) => {
    const total = 5
    const stars = []
    for (let i = 1; i <= total; i++) {
      stars.push(
        <span key={i} className={`star ${i <= score ? 'filled' : ''}`}>
          ★
        </span>
      )
    }
    return <div className="ai-stars">{stars}</div>
  }

  // Mengurutkan timeline dari hari terbaru ke hari terlama
  const sortedTimelines = useMemo(() => {
    return [...timelines].sort((a, b) => Number(b.day_number) - Number(a.day_number))
  }, [timelines])

  return (
    <div className="overview-wrap">
      {/* Progress bar */}
      <div className="overview-progress-card">
        <div className="progress-header">
          <div>
            <h2 className="progress-title">Progress Keseluruhan</h2>
            <p className="progress-sub">{filledDays.length} dari {totalDays} hari tercatat</p>
          </div>
          <span className="progress-pct">{progress}%</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-stats">
          <div className="progress-stat">
            <span className="stat-dot green" />
            <span>{filledDays.length} hari tercatat</span>
          </div>
          <div className="progress-stat">
            <span className="stat-dot gray" />
            <span>{totalDays - filledDays.length} hari belum</span>
          </div>
        </div>
      </div>

      {/* Weekly Grid Graph */}
      <div className="overview-weeks">
        {weeks.map((weekDays, wi) => (
          <div key={wi} className="week-card">
            <p className="week-label">Minggu {wi + 1}</p>
            <div className="week-days">
              {weekDays.map((day) => {
                const filled = filledDays.includes(day)
                return (
                  <button
                    key={day}
                    onClick={() => onSelectDay(day)}
                    className={`week-day-cell ${filled ? 'filled' : 'empty'}`}
                    title={`Hari ${day} — ${getDateLabel(day)} (Klik untuk edit)`}
                  >
                    <span className="week-day-num">H{day}</span>
                    <span className="week-day-date">{getDateLabel(day)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sumbu Waktu Vertikal (Vertical Timeline) */}
      <div className="vertical-timeline-container">
        <h3 className="timeline-section-title">Aktivitas & Ekstraksi AI Harian</h3>
        
        {sortedTimelines.length === 0 ? (
          <div className="timeline-empty-state">
            <span className="timeline-empty-icon">📂</span>
            <p className="timeline-empty-title">Belum ada catatan aktivitas</p>
            <p className="timeline-empty-sub">
              Pilih salah satu hari di atas atau di Day Selector untuk mulai mencatat kegiatan magang Anda hari ini.
            </p>
          </div>
        ) : (
          <div className="vertical-timeline">
            {/* Timeline center line */}
            <div className="timeline-line" />

            {sortedTimelines.map((t) => {
              const day = Number(t.day_number)
              const hasFeedback = t.ai_status === 'done' && t.ai_feedback

              return (
                <div key={t.id || day} className="timeline-item">
                  {/* Status Indicator Node on vertical line */}
                  <div className={`timeline-node ${t.ai_status}`}>
                    {t.ai_status === 'processing' ? (
                      <span className="node-pulse" />
                    ) : t.ai_status === 'done' ? (
                      '✓'
                    ) : t.ai_status === 'failed' ? (
                      '!'
                    ) : (
                      '•'
                    )}
                  </div>

                  {/* Timeline Card */}
                  <div className="timeline-card">
                    <div className="timeline-card-header">
                      <div>
                        <div className="timeline-day-badge">Hari ke-{day}</div>
                        <span className="timeline-card-date">{getFullDateLabel(day)}</span>
                      </div>
                      
                      <div className="timeline-card-actions">
                        <span className={`ai-status-badge ${t.ai_status}`}>
                          {t.ai_status === 'done' && 'Teranalisis'}
                          {t.ai_status === 'processing' && 'Menganalisis...'}
                          {t.ai_status === 'failed' && 'Analisis Gagal'}
                          {t.ai_status === 'pending' && 'Menunggu'}
                        </span>
                        
                        <button
                          onClick={() => onSelectDay(day)}
                          className="timeline-edit-btn"
                        >
                          Buka Editor
                        </button>
                      </div>
                    </div>

                    <div className="timeline-card-body">
                      {/* Ringkasan Catatan yang ditulis Mahasiswa */}
                      <div className="timeline-student-note">
                        <span className="note-quote-icon">“</span>
                        <p className="note-text line-clamp-3">
                          {getDescriptionPreview(t.description)}
                        </p>
                      </div>

                      {/* Detail Hasil Analisis AI */}
                      {hasFeedback ? (
                        <div className="timeline-ai-feedback">
                          <div className="ai-feedback-divider" />
                          
                          <div className="ai-feedback-meta">
                            <span className="ai-kategori-badge">
                              {t.ai_feedback.kategori_aktivitas || 'Teknis'}
                            </span>
                            {renderStars(t.ai_feedback.skor_produktivitas || 0)}
                          </div>

                          <h4 className="ai-feedback-ringkasan-title">
                            {t.ai_feedback.ringkasan_aktivitas}
                          </h4>

                          {/* Skill Chips */}
                          <div className="ai-skills-section">
                            {t.ai_feedback.hard_skills?.length > 0 && (
                              <div className="ai-skills-group">
                                <span className="skills-group-label">Hard Skills:</span>
                                <div className="skills-chips">
                                  {t.ai_feedback.hard_skills.map((s, idx) => (
                                    <span key={idx} className="skill-chip hard" title={`Bukti: ${s.bukti}`}>
                                      {s.nama_skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {t.ai_feedback.soft_skills?.length > 0 && (
                              <div className="ai-skills-group" style={{ marginTop: 8 }}>
                                <span className="skills-group-label">Soft Skills:</span>
                                <div className="skills-chips">
                                  {t.ai_feedback.soft_skills.map((s, idx) => (
                                    <span key={idx} className="skill-chip soft" title={`Bukti: ${s.bukti}`}>
                                      {s.nama_skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Pembelajaran Utama */}
                          {t.ai_feedback.pembelajaran_utama?.length > 0 && (
                            <div className="ai-pembelajaran">
                              <span className="pembelajaran-label">Pembelajaran Utama:</span>
                              <ul className="pembelajaran-list">
                                {t.ai_feedback.pembelajaran_utama.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Tantangan Banner */}
                          <div className="ai-tantangan">
                            <span className="tantangan-icon">💡</span>
                            <span className="tantangan-text">
                              <strong>Tantangan: </strong>{t.ai_feedback.tantangan || 'Tidak disebutkan'}
                            </span>
                          </div>
                        </div>
                      ) : t.ai_status === 'processing' ? (
                        <div className="timeline-ai-status-panel processing">
                          <span className="status-dot-pulse" />
                          <span>Kecerdasan Buatan sedang mengekstrak skill dan menganalisis produktivitas harian Anda...</span>
                        </div>
                      ) : t.ai_status === 'failed' ? (
                        <div className="timeline-ai-status-panel failed">
                          <span>⚠️ Analisis otomatis gagal. Anda dapat membuka editor dan menyimpan kembali catatan untuk mengulang analisis.</span>
                        </div>
                      ) : (
                        <div className="timeline-ai-status-panel pending">
                          <span>⏳ Catatan telah disimpan. Menunggu giliran analisis antrean AI otomatis...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MagangDetailPage ───────────────────────────────────────────────────────

export function MagangDetailPage({ user, onLogout }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [magang, setMagang] = useState(null)
  const [timelines, setTimelines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)

  const isDemo = localStorage.getItem('demo_mode') === 'true'

  // Fetch data magang
  const fetchMagang = useCallback(async () => {
    try {
      if (isDemo) {
        const stored = localStorage.getItem('mock_magang_items')
        const items = stored ? JSON.parse(stored) : []
        const found = items.find((i) => String(i.id) === String(id))
        if (!found) throw new Error('Data magang tidak ditemukan')
        setMagang(found)
      } else {
        const data = await magangService.getById(id)
        setMagang(data?.data ?? data)
      }
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || err.message || 'Gagal memuat data magang')
    }
  }, [id, isDemo])

  // Fetch timeline data
  const fetchTimelineData = useCallback(async () => {
    try {
      if (isDemo) {
        const total = magang ? Number(magang.timeline) : 90
        const list = []
        for (let d = 1; d <= total; d++) {
          const key = `magang_${id}_day_${d}`
          const stored = localStorage.getItem(key)
          if (stored) {
            list.push(JSON.parse(stored))
          }
        }
        
        // Setup initial day 1 if no timelines exist at all in local storage (first time opening demo)
        if (list.length === 0) {
          const initialDay = {
            id: 101,
            magang_id: Number(id),
            day_number: 1,
            title: "Day 1: Setup Environment",
            description: '[{"type":"paragraph","content":[{"type":"text","text":"Mempersiapkan tools dan instalasi mandiri untuk memulai project React."}]}]',
            ai_status: "done",
            ai_analyzed_at: "2026-06-01T12:00:00.000Z",
            ai_feedback: {
              tanggal_analisis: "2026-06-01",
              kategori_aktivitas: "Teknis",
              ringkasan_aktivitas: "Mahasiswa melakukan konfigurasi tools coding lokal.",
              soft_skills: [
                {
                  nama_skill: "Kemandirian",
                  bukti: "Mempersiapkan tools dan instalasi mandiri"
                }
              ],
              hard_skills: [
                {
                  nama_skill: "Environment Setup",
                  bukti: "Mempersiapkan tools"
                }
              ],
              pembelajaran_utama: [
                "Cara inisialisasi proyek React terstandarisasi"
              ],
              tantangan: "Tidak disebutkan",
              skor_produktivitas: 4
            }
          }
          localStorage.setItem(`magang_${id}_day_1`, JSON.stringify(initialDay))
          list.push(initialDay)
        }
        
        setTimelines(list)
      } else {
        const data = await timelineService.getAllTimeline(id)
        setTimelines(data?.data ?? data ?? [])
      }
    } catch (err) {
      console.error('Gagal mengambil timeline:', err)
      // Jangan set error utama agar halaman profil magang tetap ter-render
    }
  }, [id, isDemo, magang])

  // Trigger fetch awal
  useEffect(() => {
    const initData = async () => {
      setLoading(true)
      setError(null)
      await fetchMagang()
    }
    initData()
  }, [fetchMagang])

  // Trigger fetch timeline setelah data magang didapat
  useEffect(() => {
    if (magang) {
      fetchTimelineData().then(() => setLoading(false))
    }
  }, [magang, fetchTimelineData])

  // Hari-hari yang memiliki catatan non-kosong
  const filledDays = useMemo(() => {
    return timelines
      .filter((t) => {
        if (!t.description) return false
        try {
          const parsed = JSON.parse(t.description)
          if (Array.isArray(parsed)) {
            return parsed.some((b) => {
              const text = b?.content?.map?.((c) => c?.text ?? '').join('') ?? ''
              return text.trim().length > 0
            })
          }
        } catch (_) {}
        return t.description.trim().length > 0
      })
      .map((t) => Number(t.day_number))
  }, [timelines])

  // ─── Loading ───
  if (loading) {
    return (
      <div className="detail-loading">
        <div className="detail-loading-spinner" />
        <p>Memuat data magang...</p>
      </div>
    )
  }

  // ─── Error ───
  if (error || !magang) {
    return (
      <div className="detail-error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="detail-error-icon">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3>{error || 'Data tidak ditemukan'}</h3>
        <button onClick={() => navigate('/magang')} className="detail-back-btn">
          Kembali ke Daftar Magang
        </button>
      </div>
    )
  }

  const totalDays = Number(magang.timeline) || 0

  // Format tanggal
  const fmt = (iso) => iso
    ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-'

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
          <button id="logout-btn" onClick={onLogout} className="detail-sidebar-logout" title="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="detail-main">
        {/* Header */}
        <header className="detail-header">
          <button
            id="back-to-magang-btn"
            onClick={() => navigate('/magang')}
            className="detail-back-link"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Kembali
          </button>

          <div className="detail-header-info">
            <h1 className="detail-title">{magang.nama}</h1>
            <div className="detail-meta">
              <span className="detail-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {magang.tempat_magang}
              </span>
              <span className="detail-meta-sep">·</span>
              <span className="detail-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {fmt(magang.tanggal_mulai)} — {fmt(magang.tanggal_selesai)}
              </span>
              <span className="detail-meta-sep">·</span>
              <span className="detail-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {totalDays} hari
              </span>
            </div>
          </div>

          <div className="detail-header-badge">
            <span className="filled-count">{filledDays.length}</span>
            <span className="filled-label">/ {totalDays} hari dicatat</span>
          </div>
        </header>

        {/* Day Selector */}
        <div className="detail-day-selector-wrapper">
          <DaySelector
            totalDays={totalDays}
            selectedDay={selectedDay}
            filledDays={filledDays}
            onSelectDay={setSelectedDay}
            startDate={magang.tanggal_mulai}
          />
        </div>

        {/* Content */}
        <main className="detail-content">
          {selectedDay === null ? (
            /* Overview Mode */
            <div className="detail-overview-grid">
              <div className="detail-overview-main">
                <OverviewTimeline
                  magang={magang}
                  timelines={timelines}
                  filledDays={filledDays}
                  onSelectDay={setSelectedDay}
                />
              </div>
              <div className="detail-overview-side">
                <AIFeedbackCard timelines={timelines} />
              </div>
            </div>
          ) : (
            /* Editor Mode dengan key remount & callback onSaveSuccess */
            <TaskEditor
              key={`${id}-${selectedDay}`}
              magangId={id}
              day={selectedDay}
              startDate={magang.tanggal_mulai}
              onSaveSuccess={fetchTimelineData}
            />
          )}
        </main>
      </div>
    </div>
  )
}
