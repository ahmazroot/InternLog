import { useMemo } from 'react'

/**
 * AIFeedbackCard — Premium AI Skill Hub Rollup Dashboard
 * Props:
 *   timelines: array of timeline items
 */
export function AIFeedbackCard({ timelines = [] }) {
  const stats = useMemo(() => {
    const analyzed = timelines.filter((t) => t.ai_status === 'done' && t.ai_feedback)
    
    // Hitung rata-rata produktivitas
    const totalProd = analyzed.reduce((acc, t) => acc + (t.ai_feedback.skor_produktivitas || 0), 0)
    const avgProductivity = analyzed.length > 0 ? (totalProd / analyzed.length).toFixed(1) : '0.0'

    // Ekstrak semua soft & hard skills
    const softSkills = {}
    const hardSkills = {}
    
    analyzed.forEach((t) => {
      const fb = t.ai_feedback
      if (fb.soft_skills && Array.isArray(fb.soft_skills)) {
        fb.soft_skills.forEach((s) => {
          if (s.nama_skill) {
            softSkills[s.nama_skill] = (softSkills[s.nama_skill] || 0) + 1
          }
        })
      }
      if (fb.hard_skills && Array.isArray(fb.hard_skills)) {
        fb.hard_skills.forEach((s) => {
          if (s.nama_skill) {
            hardSkills[s.nama_skill] = (hardSkills[s.nama_skill] || 0) + 1
          }
        })
      }
    })

    const topSoft = Object.entries(softSkills)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }))

    const topHard = Object.entries(hardSkills)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }))

    return {
      totalAnalyzed: analyzed.length,
      avgProductivity,
      topSoft,
      topHard
    }
  }, [timelines])

  const renderStars = (score) => {
    const total = 5
    const num = Math.round(Number(score))
    const stars = []
    for (let i = 1; i <= total; i++) {
      stars.push(
        <span key={i} className={`star ${i <= num ? 'filled' : ''}`}>
          ★
        </span>
      )
    }
    return <div className="ai-stars">{stars}</div>
  }

  return (
    <div className="ai-feedback-card">
      <div className="ai-feedback-glow" />

      <div className="ai-feedback-header">
        <div className="ai-feedback-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" className="ai-icon" aria-hidden="true">
            <path
              d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
              fill="url(#ai-hub-grad)"
            />
            <defs>
              <linearGradient id="ai-hub-grad" x1="2" y1="2" x2="22" y2="22">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div>
          <h3 className="ai-feedback-title">AI Skill Hub</h3>
          <p className="ai-feedback-subtitle">Akumulasi keahlian & performa Anda</p>
        </div>

        <span className="ai-realtime-badge">Realtime</span>
      </div>

      {stats.totalAnalyzed === 0 ? (
        <div className="ai-feedback-empty-state">
          <span className="empty-icon">💡</span>
          <p className="empty-title">Belum ada analisis harian</p>
          <p className="empty-sub">
            Mulailah menulis catatan harian Anda. AI akan mengekstrak data produktivitas dan keahlian di sini secara otomatis.
          </p>
        </div>
      ) : (
        <div className="ai-hub-dashboard">
          {/* Productivity Banner */}
          <div className="ai-hub-productivity">
            <div className="prod-left">
              <span className="prod-num">{stats.avgProductivity}</span>
              <span className="prod-denom">/ 5.0</span>
            </div>
            <div className="prod-right">
              <span className="prod-label">Rata-rata Skor Produktivitas</span>
              {renderStars(stats.avgProductivity)}
            </div>
          </div>

          <div className="ai-hub-divider" />

          {/* Hard Skills Section */}
          <div className="ai-hub-section">
            <h4 className="ai-hub-section-title">Hard Skills Teratas</h4>
            {stats.topHard.length === 0 ? (
              <p className="ai-hub-empty-text">Belum ada hard skill terekstraksi</p>
            ) : (
              <div className="ai-hub-skills-list">
                {stats.topHard.map((s, idx) => (
                  <div key={idx} className="ai-hub-skill-row">
                    <span className="skill-dot hard" />
                    <span className="skill-name">{s.name}</span>
                    <span className="skill-freq">×{s.count} kali</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Soft Skills Section */}
          <div className="ai-hub-section" style={{ marginTop: 16 }}>
            <h4 className="ai-hub-section-title">Soft Skills Teratas</h4>
            {stats.topSoft.length === 0 ? (
              <p className="ai-hub-empty-text">Belum ada soft skill terekstraksi</p>
            ) : (
              <div className="ai-hub-skills-list">
                {stats.topSoft.map((s, idx) => (
                  <div key={idx} className="ai-hub-skill-row">
                    <span className="skill-dot soft" />
                    <span className="skill-name">{s.name}</span>
                    <span className="skill-freq">×{s.count} kali</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ai-hub-footer">
            Diambil dari {stats.totalAnalyzed} catatan teranalisis
          </div>
        </div>
      )}
    </div>
  )
}
