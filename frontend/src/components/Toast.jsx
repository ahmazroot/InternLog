import { useState, useEffect, useCallback } from 'react'

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  }

  return { toasts, removeToast, toast }
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 10)
    const hideTimer = setTimeout(() => {
      setLeaving(true)
      setTimeout(() => onRemove(toast.id), 350)
    }, 4000)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [toast.id, onRemove])

  const configs = {
    success: {
      bg: 'from-emerald-500 to-teal-500',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    error: {
      bg: 'from-red-500 to-rose-500',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ),
    },
    info: {
      bg: 'from-violet-500 to-purple-500',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
  }

  const cfg = configs[toast.type] || configs.success

  return (
    <div
      className="pointer-events-auto"
      style={{
        transform: visible && !leaving ? 'translateX(0) scale(1)' : 'translateX(120%) scale(0.9)',
        opacity: visible && !leaving ? 1 : 0,
        transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-slate-900/95 px-4 py-3 shadow-2xl shadow-black/40 backdrop-blur-xl min-w-[280px] max-w-[360px]">
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cfg.bg} text-white shadow-lg`}>
          {cfg.icon}
        </div>
        <p className="flex-1 text-sm font-medium text-white leading-snug">{toast.message}</p>
        <button
          onClick={() => { setLeaving(true); setTimeout(() => onRemove(toast.id), 350) }}
          className="ml-1 shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
