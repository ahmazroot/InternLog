import { useRef, useEffect } from 'react'

/**
 * DaySelector — horizontal scrollable day picker
 * Props:
 *   totalDays    : number   — total hari magang (dari magang.timeline)
 *   selectedDay  : number|null — hari yang dipilih, null = overview
 *   filledDays   : number[] — hari yang sudah ada catatan (badge hijau)
 *   onSelectDay  : (day: number|null) => void
 *   startDate    : string   — tanggal_mulai magang (ISO)
 */
export function DaySelector({ totalDays = 0, selectedDay, filledDays = [], onSelectDay, startDate }) {
  const scrollRef = useRef(null)

  // Auto-scroll ke hari yang dipilih
  useEffect(() => {
    if (selectedDay !== null && scrollRef.current) {
      const btn = scrollRef.current.querySelector(`[data-day="${selectedDay}"]`)
      if (btn) {
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      }
    }
  }, [selectedDay])

  const getDayLabel = (day) => {
    if (!startDate) return `H${day}`
    const date = new Date(startDate)
    date.setDate(date.getDate() + day - 1)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="day-selector-wrapper">
      {/* Overview button */}
      <button
        id="day-overview-btn"
        onClick={() => onSelectDay(null)}
        className={`day-selector-overview-btn ${selectedDay === null ? 'active' : ''}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="ds-icon">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
        <span>Overview</span>
      </button>

      <div className="ds-divider" />

      {/* Scrollable days */}
      <div className="day-selector-scroll" ref={scrollRef}>
        {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
          const isFilled = filledDays.includes(day)
          const isActive = selectedDay === day

          return (
            <button
              key={day}
              data-day={day}
              id={`day-btn-${day}`}
              onClick={() => onSelectDay(day)}
              className={`day-btn ${isActive ? 'active' : ''} ${isFilled && !isActive ? 'filled' : ''}`}
              title={getDayLabel(day)}
            >
              <span className="day-num">H{day}</span>
              <span className="day-date">{getDayLabel(day)}</span>
              {isFilled && (
                <span className="day-dot" aria-label="Sudah ada catatan" />
              )}
            </button>
          )
        })}

        {totalDays === 0 && (
          <p className="ds-empty">Tidak ada hari yang tersedia</p>
        )}
      </div>
    </div>
  )
}
