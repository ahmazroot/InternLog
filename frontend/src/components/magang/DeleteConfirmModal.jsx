import { useEffect, useState } from 'react'

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, item, loading }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setVisible(true), 10)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
    }
  }, [isOpen])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: visible ? 'rgba(15,23,42,0.45)' : 'rgba(15,23,42,0)',
        backdropFilter: visible ? 'blur(8px)' : 'blur(0px)',
        transition: 'background-color 300ms ease, backdrop-filter 300ms ease',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.95)',
          opacity: visible ? 1 : 0,
          transition: 'all 300ms cubic-bezier(0.22,1,0.36,1)',
        }}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl text-center modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top danger accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />

        {/* Icon area */}
        <div className="flex flex-col items-center px-6 pt-8 pb-5">
          <div className="relative mb-5">
            <div className="absolute inset-0 animate-ping rounded-full bg-red-100" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-8 w-8 text-red-500">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
          </div>

          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Hapus Data Magang?</h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Anda akan menghapus{' '}
            <span className="font-bold text-slate-800">"{item?.nama}"</span>
            {item?.tempat_magang ? (
              <> di <span className="font-bold text-slate-800">{item.tempat_magang}</span></>
            ) : null}
            . Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-slate-100 px-6 py-5 bg-slate-50/50">
          <button
            id="delete-cancel-btn"
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 cursor-pointer"
          >
            Batalkan
          </button>
          <button
            id="delete-confirm-btn"
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-red-600/30 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menghapus...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
                Ya, Hapus
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
