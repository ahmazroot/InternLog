import { useNavigate } from 'react-router-dom'

function StatusBadge({ tanggalMulai, tanggalSelesai }) {
  const now = new Date()
  const start = new Date(tanggalMulai)
  const end = new Date(tanggalSelesai)

  if (now < start) return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-500 border border-blue-100">
      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
      Akan Datang
    </span>
  )
  if (now > end) return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-400 border border-slate-100">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
      Selesai
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-500 border border-emerald-100">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
      Aktif
    </span>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 animate-pulse">
      <div className="h-10 w-10 rounded-xl bg-slate-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 rounded-lg bg-slate-100" />
        <div className="h-3 w-24 rounded-lg bg-slate-100" />
      </div>
      <div className="hidden sm:flex gap-4">
        <div className="h-3 w-24 rounded-lg bg-slate-100" />
        <div className="h-3 w-16 rounded-lg bg-slate-100" />
      </div>
      <div className="h-6 w-16 rounded-lg bg-slate-100" />
      <div className="flex gap-2">
        <div className="h-8 w-8 rounded-xl bg-slate-100" />
        <div className="h-8 w-8 rounded-xl bg-slate-100" />
      </div>
    </div>
  )
}

export function MagangTable({ items, loading, onEdit, onDelete }) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100">
          <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={1.5} className="h-7 w-7">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            <line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-600">Belum ada data magang</p>
        <p className="mt-1 text-xs text-slate-400 max-w-xs">
          Klik <span className="text-blue-500 font-medium">+ Tambah Data</span> di atas untuk mulai mencatat program magang Anda.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Column headers (desktop) */}
      <div className="hidden lg:flex items-center gap-4 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-300">
        <div className="w-10 flex-shrink-0" />
        <div className="flex-1 min-w-0">Nama & Tempat</div>
        <div className="w-40">Tanggal</div>
        <div className="w-24">Timeline</div>
        <div className="w-24">Status</div>
        <div className="w-28">Aksi</div>
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 transition-all duration-200 hover:border-slate-200 hover:shadow-sm"
        >
          {/* Avatar */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-500 border border-blue-100 flex-shrink-0">
            {item.nama?.charAt(0)?.toUpperCase() ?? '?'}
          </div>

          {/* Name + Place */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{item.nama}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3 text-slate-300 flex-shrink-0">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <p className="text-xs text-slate-400 truncate">{item.tempat_magang || '—'}</p>
            </div>
          </div>

          {/* Date range */}
          <div className="hidden lg:block w-40">
            <p className="text-xs font-medium text-slate-600">{formatDate(item.tanggal_mulai)}</p>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
              {formatDate(item.tanggal_selesai)}
            </p>
          </div>

          {/* Timeline */}
          <div className="hidden lg:flex w-24 items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2} className="h-3.5 w-3.5 flex-shrink-0">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-xs font-semibold text-slate-500">{item.timeline ?? '—'} hari</span>
          </div>

          {/* Status */}
          <div className="hidden lg:block w-24">
            <StatusBadge tanggalMulai={item.tanggal_mulai} tanggalSelesai={item.tanggal_selesai} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              id={`detail-btn-${item.id}`}
              onClick={() => navigate(`/magang/${item.id}`)}
              title="Lihat Detail"
              className="flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-500 transition hover:bg-blue-500 hover:text-white hover:border-blue-500 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
              Detail
            </button>
            <button
              onClick={() => onEdit(item)}
              title="Edit"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-300 transition hover:bg-slate-50 hover:text-slate-600 hover:border-slate-200 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(item)}
              title="Hapus"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-300 transition hover:bg-red-50 hover:text-red-400 hover:border-red-100 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
