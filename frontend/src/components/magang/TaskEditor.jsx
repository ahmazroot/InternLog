import { useEffect, useMemo, useRef, useState } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'
import { timelineService } from '../../services/timelineService'
import { geminiService } from '../../services/geminiService'
import { magangService } from '../../services/magangService'
import { getDomainMockFeedback } from '../../services/domainHelper'

/**
 * Sub-komponen untuk BlockNote Editor agar remount & re-initialization berjalan aman
 */
function BlockNoteEditor({ initialContent, onChange }) {
  const editor = useCreateBlockNote({ initialContent })
  
  return (
    <BlockNoteView
      editor={editor}
      onChange={() => onChange(editor.document)}
      theme="light"
    />
  )
}

/**
 * TaskEditor — BlockNote WYSIWYG editor per hari
 * Props:
 *   magangId      : string|number
 *   day           : number
 *   startDate     : string  — ISO tanggal mulai magang
 *   onSaveSuccess : () => void — callback ketika berhasil simpan untuk mereload timeline
 */
export function TaskEditor({ magangId, day, startDate, onSaveSuccess }) {
  const storageKey = `magang_${magangId}_day_${day}`
  const isDemo = localStorage.getItem('demo_mode') === 'true'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // State data harian dari API
  const [dayData, setDayData] = useState(null)
  const [editorContent, setEditorContent] = useState(undefined)
  const currentContentRef = useRef(null)

  // Status proses simpan
  // 'idle' | 'saving' | 'saved' | 'error'
  const [saveStatus, setSaveStatus] = useState('idle')

  // Hitung tanggal untuk hari ini
  const dayDate = useMemo(() => {
    if (!startDate) return null
    const d = new Date(startDate)
    d.setDate(d.getDate() + day - 1)
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }, [startDate, day])

  // Helper untuk parsing description
  const parseDescription = (desc) => {
    if (!desc) return undefined
    try {
      const parsed = JSON.parse(desc)
      if (Array.isArray(parsed)) return parsed
    } catch (_) {}
    
    // Fallback jika database menyimpan plain-text biasa (mencegah editor crash)
    return [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: desc }]
      }
    ]
  }

  // Fetch data harian dari API atau LocalStorage (Demo Mode)
  useEffect(() => {
    const fetchDayData = async () => {
      setLoading(true)
      setError(null)
      try {
        if (isDemo) {
          await new Promise((r) => setTimeout(r, 200))
          const stored = localStorage.getItem(storageKey)
          let data = null
          if (stored) {
            data = JSON.parse(stored)
          } else {
            data = {
              magang_id: Number(magangId),
              day_number: day,
              description: '',
              ai_status: 'pending',
              ai_feedback: null
            }
          }
          setDayData(data)
          setEditorContent(parseDescription(data.description))
          currentContentRef.current = parseDescription(data.description)
        } else {
          const data = await timelineService.getDay(magangId, day)
          setDayData(data)
          setEditorContent(parseDescription(data.description))
          currentContentRef.current = parseDescription(data.description)
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Gagal memuat catatan harian')
      } finally {
        setLoading(false)
      }
    }

    fetchDayData()
  }, [magangId, day, isDemo, storageKey])

  // Track perubahan editor content
  const handleEditorChange = (blocks) => {
    currentContentRef.current = blocks
  }

  // Handler Simpan Catatan Harian (POST)
  const handleSave = async () => {
    if (saveStatus === 'saving') return
    
    setSaveStatus('saving')
    try {
      const blocks = currentContentRef.current || []
      const descriptionStr = JSON.stringify(blocks)

      if (isDemo) {
        const hasGemini = geminiService.isConfigured()
        let aiFeedback = null
        let aiStatus = 'done'

        // Buat teks mentah dari editor blocks
        const blocksText = blocks
          .map((b) => {
            if (b.content && Array.isArray(b.content)) {
              return b.content.map((c) => c.text || '').join('')
            }
            return ''
          })
          .filter(Boolean)
          .join('\n')

        if (hasGemini && blocksText.trim().length > 0) {
          // Set status ke processing terlebih dahulu agar loader sidebar muncul
          setDayData((prev) => ({
            ...prev,
            description: descriptionStr,
            ai_status: 'processing'
          }))

          try {
            // Berikan waktu sedikit agar animasi saving & processing kelihatan premium
            await new Promise((r) => setTimeout(r, 800))
            aiFeedback = await geminiService.analyzeDailyLog(blocksText)
            aiStatus = 'done'
          } catch (geminiErr) {
            console.error('Gemini analysis failed, falling back to mock engine:', geminiErr)
            aiStatus = 'done' // Graceful fallback to premium mock engine
          }
        }

        // Jika tidak punya API key, catatan kosong, atau Gemini error, gunakan mock data
        if (!aiFeedback) {
          if (!hasGemini && blocksText.trim().length > 0) {
            await new Promise((r) => setTimeout(r, 600))
          }
          
          let magangName = ''
          try {
            if (isDemo) {
              const stored = localStorage.getItem('mock_magang_items')
              const items = stored ? JSON.parse(stored) : []
              const currentMagang = items.find((i) => String(i.id) === String(magangId))
              magangName = currentMagang?.nama || ''
            } else {
              const magData = await magangService.getById(magangId)
              const currentMagang = magData?.data ?? magData
              magangName = currentMagang?.nama || ''
            }
          } catch (_) {}

          aiFeedback = getDomainMockFeedback(magangName, blocksText)
        }

        const updatedData = {
          ...dayData,
          description: descriptionStr,
          ai_status: aiStatus,
          ai_analyzed_at: new Date().toISOString(),
          ai_feedback: aiFeedback
        }
        localStorage.setItem(storageKey, JSON.stringify(updatedData))
        setDayData(updatedData)
      } else {
        // Ekstrak title otomatis dari teks paragraf pertama (maks 50 karakter)
        const firstBlockText = blocks
          .map((b) => b.content?.map((c) => c.text || '').join('') || '')
          .find((t) => t.trim().length > 0) || ''
        const autoTitle = firstBlockText.trim().slice(0, 50) || `Catatan Hari ke-${day}`

        const savedRecord = await timelineService.saveDay(magangId, day, descriptionStr, autoTitle)
        setDayData(savedRecord?.data ?? savedRecord)
      }

      setSaveStatus('saved')
      if (onSaveSuccess) onSaveSuccess()
      
      // Reset status sukses setelah 2.5 detik
      setTimeout(() => setSaveStatus('idle'), 2500)
    } catch (err) {
      console.error(err)
      setSaveStatus('error')
    }
  }

  // Render Bintang Produktivitas
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

  if (loading) {
    return (
      <div className="task-editor-loading">
        <div className="task-editor-spinner" />
        <p>Memuat catatan harian...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="task-editor-error">
        <p className="error-msg">{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Muat Ulang Halaman
        </button>
      </div>
    )
  }

  return (
    <div className="task-editor-container">
      <div className="task-editor-main">
        {/* Header */}
        <div className="task-editor-header">
          <div className="task-editor-header-left">
            <span className="task-editor-day-badge">Hari ke-{day}</span>
            <span className="task-editor-date">{dayDate || `Hari ${day}`}</span>
          </div>
          
          <div className="task-editor-header-right">
            {/* Status Indikator Visual */}
            <div className={`save-status-indicator ${saveStatus}`}>
              {saveStatus === 'saving' && (
                <>
                  <span className="save-status-dot pulse-blue" />
                  <span>Menyimpan...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <span className="save-status-dot green" />
                  <span>Catatan Tersimpan</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <span className="save-status-dot red" />
                  <span>Gagal Menyimpan!</span>
                </>
              )}
            </div>

            {/* Tombol Simpan Harian */}
            <button
              id="save-day-btn"
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className={`save-day-btn ${saveStatus === 'saving' ? 'loading' : ''}`}
            >
              {saveStatus === 'saving' ? 'Menyimpan...' : 'Simpan Catatan'}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="task-editor-divider" />

        {/* Prompt helper */}
        <div className="task-editor-prompt">
          <span className="prompt-emoji">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 text-indigo-400"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </span>
          <p>
            Catat apa yang kamu kerjakan hari ini — tugas, pembelajaran, atau kendala yang dihadapi.
          </p>
        </div>

        {/* BlockNote editor */}
        <div className="task-editor-body">
          <BlockNoteEditor
            initialContent={editorContent}
            onChange={handleEditorChange}
          />
        </div>
      </div>

      {/* AI Feedback Panel (Hanya Tampil Jika Status !== pending atau data feedback ada) */}
      <div className="task-editor-sidebar">
        <div className="ai-feedback-panel">
          <div className="ai-feedback-glow" />
          
          <div className="ai-panel-header">
            <div className="ai-panel-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" className="ai-panel-icon">
                <path
                  d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
                  fill="url(#ai-panel-grad)"
                />
                <defs>
                  <linearGradient id="ai-panel-grad" x1="2" y1="2" x2="22" y2="22">
                    <stop stopColor="#4f46e5" />
                    <stop offset="1" stopColor="#9333ea" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <h3 className="ai-panel-title">AI Daily Insight</h3>
              <p className="ai-panel-subtitle">Ekstraksi aktivitas & feedback otomatis</p>
            </div>
          </div>

          <div className="ai-panel-content">
            {dayData?.ai_status === 'done' && dayData?.ai_feedback ? (
              <div className="ai-result-wrap">
                {/* Ringkasan */}
                <div className="ai-section">
                  <div className="ai-section-meta">
                    <span className="ai-activity-badge">
                      {dayData.ai_feedback.kategori_aktivitas || 'Umum'}
                    </span>
                    {renderStars(dayData.ai_feedback.skor_produktivitas || 0)}
                  </div>
                  <h4 className="ai-section-title">Ringkasan Aktivitas</h4>
                  <p className="ai-activity-summary">
                    {dayData.ai_feedback.ringkasan_aktivitas}
                  </p>
                </div>

                {/* Hard Skills */}
                {dayData.ai_feedback.hard_skills?.length > 0 && (
                  <div className="ai-section">
                    <h4 className="ai-section-title">Hard Skills Terdeteksi</h4>
                    <div className="ai-chips">
                      {dayData.ai_feedback.hard_skills.map((hs, idx) => (
                        <div key={idx} className="ai-chip hard" title={`Bukti: ${hs.bukti}`}>
                          <span className="chip-bullet" />
                          <span className="chip-name">{hs.nama_skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Soft Skills */}
                {dayData.ai_feedback.soft_skills?.length > 0 && (
                  <div className="ai-section">
                    <h4 className="ai-section-title">Soft Skills Terdeteksi</h4>
                    <div className="ai-chips">
                      {dayData.ai_feedback.soft_skills.map((ss, idx) => (
                        <div key={idx} className="ai-chip soft" title={`Bukti: ${ss.bukti}`}>
                          <span className="chip-bullet" />
                          <span className="chip-name">{ss.nama_skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pembelajaran Utama */}
                {dayData.ai_feedback.pembelajaran_utama?.length > 0 && (
                  <div className="ai-section">
                    <h4 className="ai-section-title">Pembelajaran Utama</h4>
                    <ul className="ai-bullets">
                      {dayData.ai_feedback.pembelajaran_utama.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tantangan */}
                <div className="ai-section tantangan-banner">
                  <h4 className="ai-section-title flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-amber-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Tantangan / Kendala
                  </h4>
                  <p className="ai-tantangan-text">
                    {dayData.ai_feedback.tantangan || 'Tidak disebutkan'}
                  </p>
                </div>
              </div>
            ) : dayData?.ai_status === 'processing' ? (
              <div className="ai-loading-state">
                <div className="ai-pulse-ring" />
                <p className="ai-state-text font-semibold text-indigo-600">AI Sedang Menganalisis...</p>
                <p className="ai-state-sub">Harap tunggu sebentar, model sedang mengekstrak skill dari catatan harian Anda.</p>
              </div>
            ) : dayData?.ai_status === 'failed' ? (
              <div className="ai-failed-state">
                <span className="ai-state-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-8 w-8 text-red-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </span>
                <p className="ai-state-text text-red-600 font-semibold">Analisis AI Gagal</p>
                <p className="ai-state-sub">Gagal menganalisis catatan secara otomatis. Perbarui atau simpan ulang catatan untuk memicu analisis kembali.</p>
              </div>
            ) : (
              <div className="ai-pending-state">
                <span className="ai-state-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-8 w-8 text-slate-300"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
                <p className="ai-state-text text-gray-500 font-semibold">Menunggu Input</p>
                <p className="ai-state-sub">Silakan tulis aktivitas magang Anda hari ini dan klik tombol "Simpan Catatan" untuk memulai analisis AI otomatis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
