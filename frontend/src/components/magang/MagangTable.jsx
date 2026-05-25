const SKELETON_ROWS = 5

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-800/60">
      {[40, 28, 24, 20, 16].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div
            className="h-4 rounded-lg bg-slate-800 animate-pulse"
            style={{ width: `${w}%`, minWidth: 60 }}
          />
        </td>
      ))}
      <td className="px-5 py-4">
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-xl bg-slate-800 animate-pulse" />
          <div className="h-8 w-8 rounded-xl bg-slate-800 animate-pulse" />
        </div>
      </td>
    </tr>
  )
}

function StatusBadge({ tanggalMulai, tanggalSelesai }) {
  const now = new Date()
  const start = new Date(tanggalMulai)
  const end = new Date(tanggalSelesai)

  if (now < start) return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-2.5 py-1 text-xs font-semibold text-blue-400">
      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
      Akan Datang
    </span>
  )
  if (now > end) return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-700/80 px-2.5 py-1 text-xs font-semibold text-slate-400">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Selesai
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
      Aktif
    </span>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function MagangTable({ items, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800/80">
              {['Nama', 'Tempat Magang', 'Tanggal', 'Timeline', 'Status', 'Aksi'].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: SKELETON_ROWS }).map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 py-20 text-center backdrop-blur-sm">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600/20 to-purple-600/20 ring-1 ring-violet-500/20">
          <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10 text-violet-400">
            <rect x="8" y="10" width="32" height="28" rx="4" stroke="currentColor" strokeWidth="2.5" />
            <path d="M16 20h16M16 27h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="36" cy="34" r="7" fill="#7c3aed" />
            <path d="M33 34h6M36 31v6" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-200">Belum ada data magang</h3>
        <p className="mt-1.5 max-w-xs text-sm text-slate-500">
          Mulai tambah program magang pertama Anda dengan klik tombol <span className="text-violet-400 font-medium">+ Tambah Magang</span> di atas.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-800/40">
              {['Nama', 'Tempat Magang', 'Tanggal', 'Timeline', 'Status', 'Aksi'].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {items.map((item) => (
              <tr
                key={item.id}
                className="group transition-colors duration-150 hover:bg-slate-800/40"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 text-xs font-bold text-white shadow-lg shadow-violet-900/30">
                      {item.nama?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                    <span className="font-semibold text-slate-100 text-sm">{item.nama}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5 shrink-0 text-slate-500">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    {item.tempat_magang || <span className="text-slate-600">—</span>}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-sm">
                    <div className="font-medium text-slate-200">{formatDate(item.tanggal_mulai)}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
                      {formatDate(item.tanggal_selesai)}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-sm font-semibold text-slate-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 text-violet-400">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    {item.timeline ?? '—'} hari
                  </div>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge tanggalMulai={item.tanggal_mulai} tanggalSelesai={item.tanggal_selesai} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEdit(item)}
                      title="Edit"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-400 transition duration-150 hover:bg-violet-600/20 hover:text-violet-400 hover:ring-1 hover:ring-violet-500/40"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      title="Hapus"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-400 transition duration-150 hover:bg-red-500/20 hover:text-red-400 hover:ring-1 hover:ring-red-500/40"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
